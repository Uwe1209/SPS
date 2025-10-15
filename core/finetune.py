import argparse
import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms

def main(args, progress_callback=None):
    """Main function to run the fine-tuning script."""
    
    def log(message):
        if progress_callback:
            progress_callback(message)
        else:
            print(message)

    log("Starting fine-tuning...")
    
    data_dir = args['data_dir']
    model_name = args.get('model_name', 'resnet18')
    num_epochs = args.get('num_epochs', 25)
    batch_size = args.get('batch_size', 32)
    learning_rate = args.get('learning_rate', 0.001)
    load_path = args.get('load_path')
    save_path = args.get('save_path')

    # 1. Set up data transforms
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
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
        raise ValueError(f"Model {model_name} not supported.")

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
        log(f'Epoch {epoch}/{num_epochs - 1}')
        log('-' * 10)

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
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

    log("Fine-tuning finished.")
    
    # 10. Return the final validation accuracy.
    return final_epoch_val_acc

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Fine-tune a model on a new dataset.')
    
    parser.add_argument('--data_dir', type=str, required=True, help='Path to the dataset directory.')
    parser.add_argument('--model_name', type=str, default='resnet18', help='Name of the model to fine-tune (e.g., resnet18, vgg16).')
    parser.add_argument('--num_epochs', type=int, default=25, help='Number of epochs to train for.')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size for training.')
    parser.add_argument('--learning_rate', type=float, default=0.001, help='Learning rate for the optimizer.')
    parser.add_argument('--load_path', type=str, default=None, help='Path to load a model state from.')
    parser.add_argument('--save_path', type=str, default=None, help='Path to save the trained model state.')

    args = parser.parse_args()
    main(vars(args))
