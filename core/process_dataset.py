import os
import shutil
import random
import pathlib

def process_dataset(source_dir, dest_dir, split_ratio=0.8, progress_callback=None, cancel_event=None):
    """
    Processes an image dataset by splitting it into training and validation sets.

    Recursively scans the source_dir to find subdirectories containing image files,
    and treats each such directory as a class.

    Args:
        source_dir (str): The directory containing the raw dataset.
        dest_dir (str): The directory where the processed 'train' and 'val' sets will be saved.
        split_ratio (float): The proportion of images to be used for training.
        progress_callback (function, optional): A function to call with progress updates.
    """
    if progress_callback:
        progress_callback("Starting dataset processing...")

    source_path = pathlib.Path(source_dir)
    dest_path = pathlib.Path(dest_dir)
    image_extensions = {'.jpg', '.jpeg', '.png'}

    # Ensure the destination directory is created and clean it if it contains old data.
    dest_path.mkdir(parents=True, exist_ok=True)
    train_dest_path = dest_path / 'train'
    val_dest_path = dest_path / 'val'

    if train_dest_path.exists():
        shutil.rmtree(train_dest_path)
    if val_dest_path.exists():
        shutil.rmtree(val_dest_path)
    
    train_dest_path.mkdir()
    val_dest_path.mkdir()

    # Recursively scan for directories with images.
    all_dirs = [d for d in source_path.rglob('*') if d.is_dir()]
    class_dirs = []
    for d in all_dirs:
        if any(f.suffix.lower() in image_extensions for f in d.iterdir() if f.is_file()):
            class_dirs.append(d)

    if not class_dirs:
        if progress_callback:
            progress_callback("No subdirectories with image files found.")
        return

    processed_class_names = set()

    # Process each class directory.
    for class_dir in class_dirs:
        if cancel_event and cancel_event.is_set():
            progress_callback("Processing cancelled.")
            return
        class_name = class_dir.name

        if class_name in processed_class_names:
            if progress_callback:
                progress_callback(f"Warning: Class name '{class_name}' is duplicated. Skipping to avoid data mixing.")
            continue
        processed_class_names.add(class_name)

        # Collect image files.
        images = [f for f in class_dir.iterdir() if f.is_file() and f.suffix.lower() in image_extensions]
        num_images = len(images)

        if num_images == 0:
            continue

        # Report progress.
        if progress_callback:
            progress_callback(f'Found class: {class_name} with {num_images} images.')

        # Shuffle images.
        random.shuffle(images)

        # Split into train and val.
        if num_images == 1:
            train_images = images
            val_images = []
        else:
            split_point = int(num_images * split_ratio)
            if split_point == 0:
                split_point = 1
            if split_point == num_images:
                split_point = num_images - 1
            train_images = images[:split_point]
            val_images = images[split_point:]

        # Create destination class directories and copy files.
        if train_images:
            (train_dest_path / class_name).mkdir()
            if progress_callback:
                progress_callback(f'Copying {len(train_images)} training images for class {class_name}...')
            for img in train_images:
                if cancel_event and cancel_event.is_set():
                    progress_callback("Processing cancelled.")
                    return
                shutil.copy(img, train_dest_path / class_name / img.name)

        if val_images:
            (val_dest_path / class_name).mkdir()
            if progress_callback:
                progress_callback(f'Copying {len(val_images)} validation images for class {class_name}...')
            for img in val_images:
                if cancel_event and cancel_event.is_set():
                    progress_callback("Processing cancelled.")
                    return
                shutil.copy(img, val_dest_path / class_name / img.name)

    # Final progress message.
    if progress_callback:
        progress_callback("Dataset processing complete.")

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Process an image dataset into training and validation sets.')
    parser.add_argument('--source_dir', type=str, required=True, help='Source directory with class subfolders.')
    parser.add_argument('--dest_dir', type=str, required=True, help='Destination directory for train/val splits.')
    parser.add_argument('--split_ratio', type=float, default=0.8, help='Training set split ratio.')
    
    args = parser.parse_args()

    def print_progress(message):
        print(message)

    process_dataset(args.source_dir, args.dest_dir, args.split_ratio, progress_callback=print_progress)
