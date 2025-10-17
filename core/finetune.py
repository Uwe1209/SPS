import argparse
import os
import torch
import timm
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from timm.loss import LabelSmoothingCrossEntropy
from PIL import ImageFile

def main(args, progress_callback=None):
    """Main function to run the fine-tuning script"""
    
    def log(message):
        if progress_callback:
            progress_callback(message)
        else:
            print(message)

    log("Starting fine-tuning")

    load_truncated_images = args.get('load_truncated_images', True)
    ImageFile.LOAD_TRUNCATED_IMAGES = load_truncated_images
    
    cancel_event = args.get('cancel_event')
    data_dir = args['data_dir']
    model_name = args.get('model_name', 'resnet18')
    num_epochs = args.get('num_epochs', 25)
    batch_size = args.get('batch_size', 32)
    learning_rate = args.get('learning_rate', 0.001)
    dropout_rate = args.get('dropout_rate', 0.0)
    optimiser_name = args.get('optimiser', 'adamw')
    sgd_momentum = args.get('sgd_momentum', 0.9)
    adam_beta1 = args.get('adam_beta1', 0.9)
    adam_beta2 = args.get('adam_beta2', 0.999)
    adam_eps = args.get('adam_eps', 1e-8)
    loss_function = args.get('loss_function', 'cross_entropy')
    label_smoothing_factor = args.get('label_smoothing_factor', 0.1)
    weight_decay = args.get('weight_decay', 0.0)
    load_path = args.get('load_path')
    save_path = args.get('save_path')
    early_stopping_patience = args.get('early_stopping_patience', 0)
    early_stopping_min_delta = args.get('early_stopping_min_delta', 0.0)
    early_stopping_metric = args.get('early_stopping_metric', 'loss')
    mixed_precision = args.get('mixed_precision', False)
    use_imagenet_norm = args.get('use_imagenet_norm', True)
    norm_mean_str = args.get('norm_mean', '0.485, 0.456, 0.406')
    norm_std_str = args.get('norm_std', '0.229, 0.224, 0.225')
    input_size = args.get('input_size', 224)
    resize_size = args.get('resize_size', int(input_size / 224 * 256))
    num_workers = args.get('num_workers', 0)
    train_from_scratch = args.get('train_from_scratch', False)
    strict_load = args.get('strict_load', False)
    
    # Get individual augmentation flags
    aug_random_resized_crop = args.get('aug_random_resized_crop', True)
    aug_horizontal_flip = args.get('aug_horizontal_flip', True)
    aug_rotation = args.get('aug_rotation', True)
    aug_color_jitter = args.get('aug_color_jitter', True)
    aug_rotation_degrees = args.get('aug_rotation_degrees', 15)
    aug_color_jitter_brightness = args.get('aug_color_jitter_brightness', 0.2)
    aug_color_jitter_contrast = args.get('aug_color_jitter_contrast', 0.2)
    aug_color_jitter_saturation = args.get('aug_color_jitter_saturation', 0.2)
    aug_color_jitter_hue = args.get('aug_color_jitter_hue', 0.1)
    aug_crop_scale_min = args.get('aug_crop_scale_min', 0.08)
    aug_crop_scale_max = args.get('aug_crop_scale_max', 1.0)
    aug_crop_ratio_min = args.get('aug_crop_ratio_min', 0.75)
    aug_crop_ratio_max = args.get('aug_crop_ratio_max', 1.33)
    pin_memory = args.get('pin_memory', False)
    
    seed = args.get('seed')

    if seed is not None:
        torch.manual_seed(seed)
        log(f"Using random seed: {seed}")

    # 1. Set up data transforms
    train_transform_list = []
    if aug_random_resized_crop:
        train_transform_list.append(transforms.RandomResizedCrop(input_size, scale=(aug_crop_scale_min, aug_crop_scale_max), ratio=(aug_crop_ratio_min, aug_crop_ratio_max)))
    else:
        train_transform_list.extend([
            transforms.Resize(resize_size),
            transforms.CenterCrop(input_size),
        ])
    
    if aug_horizontal_flip:
        train_transform_list.append(transforms.RandomHorizontalFlip())
    if aug_rotation:
        train_transform_list.append(transforms.RandomRotation(aug_rotation_degrees))
    if aug_color_jitter:
        train_transform_list.append(transforms.ColorJitter(brightness=aug_color_jitter_brightness, contrast=aug_color_jitter_contrast, saturation=aug_color_jitter_saturation, hue=aug_color_jitter_hue))

    train_transform_list.append(transforms.ToTensor())
    
    val_transform_list = [
        transforms.Resize(resize_size),
        transforms.CenterCrop(input_size),
        transforms.ToTensor(),
    ]

    if use_imagenet_norm:
        try:
            mean = [float(x.strip()) for x in norm_mean_str.split(',')]
            std = [float(x.strip()) for x in norm_std_str.split(',')]
        except ValueError:
            raise ValueError("Invalid format for norm_mean or norm_std. They should be comma-separated floats.")
        
        if len(mean) != len(std):
            raise ValueError("norm_mean and norm_std must have the same number of values.")

        normalizer = transforms.Normalize(mean, std)
        train_transform_list.append(normalizer)
        val_transform_list.append(normalizer)

    data_transforms = {
        'train': transforms.Compose(train_transform_list),
        'val': transforms.Compose(val_transform_list),
        'test': transforms.Compose(val_transform_list),
    }

    # 2. Create ImageFolder datasets
    phases = ['train', 'val']
    if os.path.isdir(os.path.join(data_dir, 'test')):
        phases.append('test')
    
    image_datasets = {x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
                      for x in phases}
    
    # 3. Create DataLoaders
    dataloaders = {x: torch.utils.data.DataLoader(image_datasets[x], batch_size=batch_size, shuffle=(x == 'train'), num_workers=num_workers, pin_memory=pin_memory)
                   for x in phases}
    
    dataset_sizes = {x: len(image_datasets[x]) for x in phases}
    class_names = image_datasets['train'].classes
    num_classes = len(class_names)

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    log(f"Using device: {device}")

    use_amp = mixed_precision and device.type == 'cuda'
    scaler = torch.cuda.amp.GradScaler(enabled=use_amp)
    if use_amp:
        log("Using mixed precision training (AMP).")

    # 4. Load pretrained model from timm
    # This will load a pretrained model and replace the classifier head with a new one for our number of classes.
    model = timm.create_model(model_name, pretrained=not train_from_scratch, num_classes=num_classes, drop_rate=dropout_rate)

    # 5. If a load_path is provided, load the model state
    if load_path:
        # Using strict=False allows loading weights from a checkpoint with a different classifier.
        model.load_state_dict(torch.load(load_path, map_location=device), strict=strict_load)

    model = model.to(device)

    # 7. Define loss function and optimizer
    if loss_function == 'cross_entropy':
        criterion = nn.CrossEntropyLoss()
    elif loss_function == 'label_smoothing':
        criterion = LabelSmoothingCrossEntropy(smoothing=label_smoothing_factor)
    else:
        raise ValueError(f"Unsupported loss function: {loss_function}")
    
    if optimiser_name == 'adam':
        optimizer = optim.Adam(model.parameters(), lr=learning_rate, betas=(adam_beta1, adam_beta2), eps=adam_eps, weight_decay=weight_decay)
    elif optimiser_name == 'adamw':
        optimizer = optim.AdamW(model.parameters(), lr=learning_rate, betas=(adam_beta1, adam_beta2), eps=adam_eps, weight_decay=weight_decay)
    elif optimiser_name == 'sgd':
        optimizer = optim.SGD(model.parameters(), lr=learning_rate, momentum=sgd_momentum, weight_decay=weight_decay)
    else:
        raise ValueError(f"Unsupported optimiser: {optimiser_name}")

    # 8. Implement the training loop
    final_epoch_val_acc = 0.0
    best_val_loss = float('inf')
    best_val_acc = 0.0
    epochs_no_improve = 0

    for epoch in range(num_epochs):
        if cancel_event and cancel_event.is_set():
            log("Fine-tuning cancelled")
            return final_epoch_val_acc
        log(f'Epoch {epoch}/{num_epochs - 1}')
        log('-' * 10)

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            num_batches = len(dataloaders[phase])
            for i, (inputs, labels) in enumerate(dataloaders[phase]):
                if cancel_event and cancel_event.is_set():
                    log("Fine-tuning cancelled")
                    return final_epoch_val_acc
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    with torch.cuda.amp.autocast(enabled=use_amp):
                        outputs = model(inputs)
                        _, preds = torch.max(outputs, 1)
                        loss = criterion(outputs, labels)

                    if phase == 'train':
                        scaler.scale(loss).backward()
                        scaler.step(optimizer)
                        scaler.update()

                if phase == 'train' and num_batches > 10 and (i + 1) % (num_batches // 10) == 0:
                    log(f'Processing batch {i+1}/{num_batches}')

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            log(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

            if phase == 'val':
                final_epoch_val_acc = epoch_acc.item()
                if early_stopping_patience > 0:
                    if early_stopping_metric == 'loss':
                        if epoch_loss < best_val_loss - early_stopping_min_delta:
                            best_val_loss = epoch_loss
                            epochs_no_improve = 0
                        else:
                            epochs_no_improve += 1
                    elif early_stopping_metric == 'accuracy':
                        if epoch_acc > best_val_acc + early_stopping_min_delta:
                            best_val_acc = epoch_acc.item()
                            epochs_no_improve = 0
                        else:
                            epochs_no_improve += 1
                    
                    if epochs_no_improve >= early_stopping_patience:
                        log(f"Early stopping triggered after {epochs_no_improve} epochs with no improvement.")
                        break
        else:
            continue
        break

    # 9. After training, save the model
    if save_path:
        torch.save(model.state_dict(), save_path)

    # 10. Evaluate on test set if it exists
    if 'test' in dataloaders:
        log("Evaluating on test set...")
        model.eval()
        running_loss = 0.0
        running_corrects = 0

        for inputs, labels in dataloaders['test']:
            inputs = inputs.to(device)
            labels = labels.to(device)

            with torch.no_grad():
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        test_loss = running_loss / dataset_sizes['test']
        test_acc = running_corrects.double() / dataset_sizes['test']
        log(f'Test Loss: {test_loss:.4f} Acc: {test_acc:.4f}')

    log("Fine-tuning finished")
    
    # 11. Return the final validation accuracy
    return final_epoch_val_acc

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Fine-tune a model on a new dataset')
    
    parser.add_argument('--data_dir', type=str, required=True, help='Path to the dataset directory')
    parser.add_argument('--model_name', type=str, default='resnet18', help='Name of the model to fine-tune (from timm or Hugging Face)')
    parser.add_argument('--num_epochs', type=int, default=25, help='Number of epochs to train for')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size for training')
    parser.add_argument('--learning_rate', type=float, default=0.001, help='Learning rate for the optimizer')
    parser.add_argument('--dropout_rate', type=float, default=0.0, help='Dropout rate for the model classifier')
    parser.add_argument('--optimiser', type=str, default='adamw', choices=['adam', 'adamw', 'sgd'], help='Optimiser to use for training')
    parser.add_argument('--sgd_momentum', type=float, default=0.9, help='Momentum for SGD optimizer')
    parser.add_argument('--adam_beta1', type=float, default=0.9, help='Beta1 for Adam/AdamW optimizers')
    parser.add_argument('--adam_beta2', type=float, default=0.999, help='Beta2 for Adam/AdamW optimizers')
    parser.add_argument('--adam_eps', type=float, default=1e-8, help='Epsilon for Adam/AdamW optimizers')
    parser.add_argument('--weight_decay', type=float, default=0.0, help='Weight decay for optimizers')
    parser.add_argument('--loss_function', type=str, default='cross_entropy', choices=['cross_entropy', 'label_smoothing'], help='Loss function to use')
    parser.add_argument('--label_smoothing_factor', type=float, default=0.1, help='Label smoothing factor')
    parser.add_argument('--early_stopping_patience', type=int, default=0, help='Patience for early stopping (0 to disable)')
    parser.add_argument('--early_stopping_min_delta', type=float, default=0.0, help='Minimum delta for early stopping')
    parser.add_argument('--early_stopping_metric', type=str, default='loss', choices=['loss', 'accuracy'], help='Metric for early stopping')
    parser.add_argument('--mixed_precision', action='store_true', help='Use mixed precision training (AMP)')
    parser.set_defaults(use_imagenet_norm=True)
    parser.add_argument('--no-imagenet-norm', dest='use_imagenet_norm', action='store_false', help='Disable ImageNet normalization')
    parser.add_argument('--norm_mean', type=str, default='0.485, 0.456, 0.406', help='Custom normalization mean')
    parser.add_argument('--norm_std', type=str, default='0.229, 0.224, 0.225', help='Custom normalization standard deviation')
    parser.add_argument('--input_size', type=int, default=224, help='Input image size')
    parser.add_argument('--resize_size', type=int, default=None, help='Size to resize images to before cropping (defaults to 256 for 224 input)')
    parser.add_argument('--num_workers', type=int, default=0, help='Number of data loader workers')
    parser.add_argument('--pin_memory', action='store_true', help='Use pin memory for data loaders')
    parser.add_argument('--train_from_scratch', action='store_true', help='Train model from scratch instead of using pretrained weights')
    parser.add_argument('--strict_load', action='store_true', help='Use strict loading for model state dict')
    parser.add_argument('--load_path', type=str, default=None, help='Path to load a model state from')
    parser.add_argument('--save_path', type=str, default=None, help='Path to save the trained model state')
    
    # Augmentation flags
    parser.set_defaults(aug_random_resized_crop=True, aug_horizontal_flip=True, aug_rotation=True, aug_color_jitter=True)
    parser.add_argument('--no-random-resized-crop', dest='aug_random_resized_crop', action='store_false', help='Disable random resized crop and zoom')
    parser.add_argument('--no-horizontal-flip', dest='aug_horizontal_flip', action='store_false', help='Disable random horizontal flip')
    parser.add_argument('--no-rotation', dest='aug_rotation', action='store_false', help='Disable random rotation augmentation')
    parser.add_argument('--no-color-jitter', dest='aug_color_jitter', action='store_false', help='Disable color jitter augmentation')
    parser.add_argument('--aug_rotation_degrees', type=int, default=15, help='Max rotation degrees for augmentation')
    parser.add_argument('--aug_color_jitter_brightness', type=float, default=0.2, help='Brightness for color jitter augmentation')
    parser.add_argument('--aug_color_jitter_contrast', type=float, default=0.2, help='Contrast for color jitter augmentation')
    parser.add_argument('--aug_color_jitter_saturation', type=float, default=0.2, help='Saturation for color jitter augmentation')
    parser.add_argument('--aug_color_jitter_hue', type=float, default=0.1, help='Hue for color jitter augmentation')
    parser.add_argument('--aug_crop_scale_min', type=float, default=0.08, help='Min scale for random resized crop')
    parser.add_argument('--aug_crop_scale_max', type=float, default=1.0, help='Max scale for random resized crop')
    parser.add_argument('--aug_crop_ratio_min', type=float, default=0.75, help='Min aspect ratio for random resized crop')
    parser.add_argument('--aug_crop_ratio_max', type=float, default=1.33, help='Max aspect ratio for random resized crop')

    parser.add_argument('--seed', type=int, default=None, help='Random seed for reproducibility')

    parser.set_defaults(load_truncated_images=True)
    parser.add_argument('--no-load-truncated-images', dest='load_truncated_images', action='store_false', help='Do not attempt to load truncated images')

    args = parser.parse_args()
    main(vars(args))
