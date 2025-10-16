import os
import shutil
import random
import pathlib
from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True

def process_dataset(source_dir, dest_dir, train_ratio=0.8, val_ratio=0.1, test_ratio=0.1, resolution=None, progress_callback=None, cancel_event=None):
    """
    Processes an image dataset by splitting it into training, validation, and test sets

    Recursively scans the source_dir to find subdirectories containing image files,
    and treats each such directory as a class

    Args:
        source_dir (str): The directory containing the raw dataset
        dest_dir (str): The directory where the processed 'train', 'val', and 'test' sets will be saved
        train_ratio (float): The proportion of images for training
        val_ratio (float): The proportion of images for validation
        test_ratio (float): The proportion of images for testing
        resolution (int, optional): The resolution to resize images to If None, images are not resized
        progress_callback (function, optional): A function to call with progress updates
    """
    if progress_callback:
        progress_callback("Starting dataset processing")

    source_path = pathlib.Path(source_dir)
    dest_path = pathlib.Path(dest_dir)
    image_extensions = {'.jpg', '.jpeg', '.png'}

    # Ensure the destination directory exists
    dest_path.mkdir(parents=True, exist_ok=True)
    train_dest_path = dest_path / 'train'
    val_dest_path = dest_path / 'val'
    test_dest_path = dest_path / 'test'

    # Check if destination directories already contain data.
    if (train_dest_path.exists() and any(train_dest_path.iterdir())) or \
       (val_dest_path.exists() and any(val_dest_path.iterdir())) or \
       (test_dest_path.exists() and any(test_dest_path.iterdir())):
        if progress_callback:
            progress_callback("Destination directory is not empty Please clear it first using the 'Clear Processed Dataset' button")
        return

    train_dest_path.mkdir(exist_ok=True)
    val_dest_path.mkdir(exist_ok=True)
    if test_ratio > 0:
        test_dest_path.mkdir(exist_ok=True)

    # Recursively scan for directories with images.
    all_dirs = [d for d in source_path.rglob('*') if d.is_dir()]
    class_dirs = []
    for d in all_dirs:
        if any(f.suffix.lower() in image_extensions for f in d.iterdir() if f.is_file()):
            class_dirs.append(d)

    if not class_dirs:
        if progress_callback:
            progress_callback("No subdirectories with image files found")
        return

    processed_class_names = set()

    # Process each class directory
    for class_dir in class_dirs:
        if cancel_event and cancel_event.is_set():
            progress_callback("Processing cancelled")
            return
        class_name = class_dir.name

        if class_name in processed_class_names:
            if progress_callback:
                progress_callback(f"Warning: Class name '{class_name}' is duplicated Skipping to avoid data mixing")
            continue
        processed_class_names.add(class_name)

        # Collect image files.
        images = [f for f in class_dir.iterdir() if f.is_file() and f.suffix.lower() in image_extensions]
        num_images = len(images)

        if num_images == 0:
            continue

        # Report progress
        if progress_callback:
            progress_callback(f'Found class: {class_name} with {num_images} images')

        # Shuffle images
        random.shuffle(images)

        # Split into train, val, and test sets.
        train_count = int(num_images * train_ratio)
        val_count = int(num_images * val_ratio)
        test_count = int(num_images * test_ratio)

        train_images = images[:train_count]
        val_images = images[train_count : train_count + val_count]
        test_images = images[train_count + val_count : train_count + val_count + test_count]
        
        # Assign remaining images to the training set
        remaining_start_index = train_count + val_count + test_count
        train_images.extend(images[remaining_start_index:])

        # Create destination class directories and copy files
        if train_images:
            (train_dest_path / class_name).mkdir()
            if progress_callback:
                progress_callback(f'Copying {len(train_images)} training images for class {class_name}')
            for img in train_images:
                if cancel_event and cancel_event.is_set():
                    progress_callback("Processing cancelled")
                    return
                if resolution:
                    with Image.open(img) as image:
                        image = image.convert('RGB').resize((resolution, resolution))
                        image.save(train_dest_path / class_name / img.name)
                else:
                    shutil.copy(img, train_dest_path / class_name / img.name)

        if val_images:
            (val_dest_path / class_name).mkdir()
            if progress_callback:
                progress_callback(f'Copying {len(val_images)} validation images for class {class_name}')
            for img in val_images:
                if cancel_event and cancel_event.is_set():
                    progress_callback("Processing cancelled")
                    return
                if resolution:
                    with Image.open(img) as image:
                        image = image.convert('RGB').resize((resolution, resolution))
                        image.save(val_dest_path / class_name / img.name)
                else:
                    shutil.copy(img, val_dest_path / class_name / img.name)

        if test_images:
            (test_dest_path / class_name).mkdir()
            if progress_callback:
                progress_callback(f'Copying {len(test_images)} test images for class {class_name}')
            for img in test_images:
                if cancel_event and cancel_event.is_set():
                    progress_callback("Processing cancelled")
                    return
                if resolution:
                    with Image.open(img) as image:
                        image = image.convert('RGB').resize((resolution, resolution))
                        image.save(test_dest_path / class_name / img.name)
                else:
                    shutil.copy(img, test_dest_path / class_name / img.name)

    # Final progress message
    if progress_callback:
        progress_callback("Dataset processing complete")

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Process an image dataset into training, validation, and test sets')
    parser.add_argument('--source_dir', type=str, required=True, help='Source directory with class subfolders')
    parser.add_argument('--dest_dir', type=str, required=True, help='Destination directory for train/val/test splits')
    parser.add_argument('--train_ratio', type=float, default=0.8, help='Training set ratio')
    parser.add_argument('--val_ratio', type=float, default=0.1, help='Validation set ratio')
    parser.add_argument('--test_ratio', type=float, default=0.1, help='Test set ratio')
    parser.add_argument('--resolution', type=int, default=None, help='Resolution to resize images to')
    
    args = parser.parse_args()

    def print_progress(message):
        print(message)

    process_dataset(args.source_dir, args.dest_dir, train_ratio=args.train_ratio, val_ratio=args.val_ratio, test_ratio=args.test_ratio, resolution=args.resolution, progress_callback=print_progress)
