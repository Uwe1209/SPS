import argparse
import os
import torch
import timm
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from PIL import ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True

def main(args, progress_callback=None):
    """Main function to run the fine-tuning script"""
    
    def log(message):
        if progress_callback:
            progress_callback(message)
        else:
            print(message)

    log("Starting fine-tuning")
    
    cancel_event = args.get('cancel_event')
    data_dir = args['data_dir']
    model_name = args.get('model_name', 'resnet18')
    num_epochs = args.get('num_epochs', 25)
    batch_size = args.get('batch_size', 32)
    learning_rate = args.get('learning_rate', 0.001)
    dropout_rate = args.get('dropout_rate', 0.0)
    optimiser_name = args.get('optimiser', 'adamw')
    load_path = args.get('load_path')
    save_path = args.get('save_path')
    early_stopping_patience = args.get('early_stopping_patience', 0)
    early_stopping_min_delta = args.get('early_stopping_min_delta', 0.0)
    mixed_precision = args.get('mixed_precision', False)
    input_size = args.get('input_size', 224)
    num_workers = args.get('num_workers', 0)
    train_from_scratch = args.get('train_from_scratch', False)
    
    # Get individual augmentation flags
    aug_random_resized_crop = args.get('aug_random_resized_crop', True)
    aug_horizontal_flip = args.get('aug_horizontal_flip', True)
    aug_rotation = args.get('aug_rotation', True)
    aug_color_jitter = args.get('aug_color_jitter', True)
    aug_rotation_degrees = args.get('aug_rotation_degrees', 15)
    aug_color_jitter_brightness = args.get('aug_color_jitter_brightness', 0.2)
    aug_color_jitter_contrast = args.get('aug_color_jitter_contrast', 0.2)
    
    seed = args.get('seed')

    if seed is not None:
        torch.manual_seed(seed)
        log(f"Using random seed: {seed}")

    # 1. Set up data transforms
    resize_size = int(input_size / 224 * 256)
    train_transform_list = []
    if aug_random_resized_crop:
        train_transform_list.append(transforms.RandomResizedCrop(input_size))
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
        train_transform_list.append(transforms.ColorJitter(brightness=aug_color_jitter_brightness, contrast=aug_color_jitter_contrast))

    data_transforms = {
        'train': transforms.Compose(train_transform_list + [
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(resize_size),
            transforms.CenterCrop(input_size),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # 2. Create ImageFolder datasets
    image_datasets = {x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
                      for x in ['train', 'val']}
    
    # 3. Create DataLoaders
    dataloaders = {x: torch.utils.data.DataLoader(image_datasets[x], batch_size=batch_size, shuffle=True, num_workers=num_workers)
                   for x in ['train', 'val']}
    
    dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
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
        model.load_state_dict(torch.load(load_path, map_location=device), strict=False)

    model = model.to(device)

    # 7. Define loss function and optimizer
    criterion = nn.CrossEntropyLoss()
    
    if optimiser_name == 'adam':
        optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    elif optimiser_name == 'adamw':
        optimizer = optim.AdamW(model.parameters(), lr=learning_rate)
    elif optimiser_name == 'sgd':
        optimizer = optim.SGD(model.parameters(), lr=learning_rate)
    else:
        raise ValueError(f"Unsupported optimiser: {optimiser_name}")

    # 8. Implement the training loop
    final_epoch_val_acc = 0.0
    best_val_loss = float('inf')
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
                    if epoch_loss < best_val_loss - early_stopping_min_delta:
                        best_val_loss = epoch_loss
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

    log("Fine-tuning finished")
    
    # 10. Return the final validation accuracy
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
    parser.add_argument('--early_stopping_patience', type=int, default=0, help='Patience for early stopping (0 to disable)')
    parser.add_argument('--early_stopping_min_delta', type=float, default=0.0, help='Minimum delta for early stopping')
    parser.add_argument('--mixed_precision', action='store_true', help='Use mixed precision training (AMP)')
    parser.add_argument('--input_size', type=int, default=224, help='Input image size')
    parser.add_argument('--num_workers', type=int, default=0, help='Number of data loader workers')
    parser.add_argument('--train_from_scratch', action='store_true', help='Train model from scratch instead of using pretrained weights')
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

    parser.add_argument('--seed', type=int, default=None, help='Random seed for reproducibility')

    args = parser.parse_args()
    main(vars(args))
