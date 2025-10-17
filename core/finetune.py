import argparse
import os
import torch
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
    load_path = args.get('load_path')
    save_path = args.get('save_path')
    
    # Get individual augmentation flags
    aug_random_resized_crop = args.get('aug_random_resized_crop', True)
    aug_horizontal_flip = args.get('aug_horizontal_flip', True)
    aug_rotation = args.get('aug_rotation', False)
    aug_color_jitter = args.get('aug_color_jitter', False)
    
    seed = args.get('seed')

    if seed is not None:
        torch.manual_seed(seed)
        log(f"Using random seed: {seed}")

    # 1. Set up data transforms
    train_transform_list = []
    if aug_random_resized_crop:
        train_transform_list.append(transforms.RandomResizedCrop(224))
    else:
        train_transform_list.extend([
            transforms.Resize(256),
            transforms.CenterCrop(224),
        ])
    
    if aug_horizontal_flip:
        train_transform_list.append(transforms.RandomHorizontalFlip())
    if aug_rotation:
        train_transform_list.append(transforms.RandomRotation(15))
    if aug_color_jitter:
        train_transform_list.append(transforms.ColorJitter(brightness=0.2, contrast=0.2))

    data_transforms = {
        'train': transforms.Compose(train_transform_list + [
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # 2. Create ImageFolder datasets
    image_datasets = {x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
                      for x in ['train', 'val']}
    
    # 3. Create DataLoaders
    dataloaders = {x: torch.utils.data.DataLoader(image_datasets[x], batch_size=batch_size, shuffle=True, num_workers=0)
                   for x in ['train', 'val']}
    
    dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
    class_names = image_datasets['train'].classes
    num_classes = len(class_names)

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    # 4. Load pretrained model
    if model_name == 'resnet18':
        model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    elif model_name == 'vgg16':
        model = models.vgg16(weights=models.VGG16_Weights.DEFAULT)
    elif model_name == 'alexnet':
        model = models.alexnet(weights=models.AlexNet_Weights.DEFAULT)
    elif model_name == 'googlenet':
        model = models.googlenet(weights=models.GoogLeNet_Weights.DEFAULT)
    elif model_name == 'mobilenet_v2':
        model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    elif model_name == 'mobilenet_v3_large':
        model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)
    else:
        raise ValueError(f"Model {model_name} not supported")

    # 5. If a load_path is provided, load the model state
    if load_path:
        model.load_state_dict(torch.load(load_path, map_location=device))

    # 6. Replace the model's final classifier layer
    if 'resnet' in model_name or 'googlenet' in model_name:
        num_ftrs = model.fc.in_features
        model.fc = nn.Linear(num_ftrs, num_classes)
    elif 'alexnet' in model_name or 'vgg' in model_name:
        num_ftrs = model.classifier[6].in_features
        model.classifier[6] = nn.Linear(num_ftrs, num_classes)
    elif 'mobilenet' in model_name:
        num_ftrs = model.classifier[-1].in_features
        model.classifier[-1] = nn.Linear(num_ftrs, num_classes)

    model = model.to(device)

    # 7. Define loss function and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    # 8. Implement the training loop
    final_epoch_val_acc = 0.0

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
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                if phase == 'train' and num_batches > 10 and (i + 1) % (num_batches // 10) == 0:
                    log(f'Processing batch {i+1}/{num_batches}')

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            log(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

            if phase == 'val':
                final_epoch_val_acc = epoch_acc.item()

    # 9. After training, save the model
    if save_path:
        torch.save(model.state_dict(), save_path)

    log("Fine-tuning finished")
    
    # 10. Return the final validation accuracy
    return final_epoch_val_acc

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Fine-tune a model on a new dataset')
    
    parser.add_argument('--data_dir', type=str, required=True, help='Path to the dataset directory')
    parser.add_argument('--model_name', type=str, default='resnet18', help='Name of the model to fine-tune (e.g., resnet18, vgg16)')
    parser.add_argument('--num_epochs', type=int, default=25, help='Number of epochs to train for')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size for training')
    parser.add_argument('--learning_rate', type=float, default=0.001, help='Learning rate for the optimizer')
    parser.add_argument('--load_path', type=str, default=None, help='Path to load a model state from')
    parser.add_argument('--save_path', type=str, default=None, help='Path to save the trained model state')
    
    # Augmentation flags
    parser.set_defaults(aug_random_resized_crop=True, aug_horizontal_flip=True)
    parser.add_argument('--no-random-resized-crop', dest='aug_random_resized_crop', action='store_false', help='Disable random resized crop and zoom')
    parser.add_argument('--no-horizontal-flip', dest='aug_horizontal_flip', action='store_false', help='Disable random horizontal flip')
    parser.add_argument('--aug-rotation', action='store_true', help='Enable random rotation augmentation')
    parser.add_argument('--aug-color-jitter', action='store_true', help='Enable color jitter augmentation')

    parser.add_argument('--seed', type=int, default=None, help='Random seed for reproducibility')

    args = parser.parse_args()
    main(vars(args))
