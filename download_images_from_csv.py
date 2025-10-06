import os
import csv
import requests
import time
import re

# --- Configuration ---

# The root directory containing the CSV files.
CSV_ROOT_DIR = r"C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV"

# The root directory where images will be saved.
# This will be created in 'iNaturalist\Images'.
IMAGE_OUTPUT_DIR = os.path.join(os.path.dirname(CSV_ROOT_DIR), "Images")

# The file to keep track of already downloaded images.
CHECKSUM_FILE = "image_download_checksum.txt"

# --- Helper Functions ---

def load_downloaded_checksums():
    """Loads the list of already downloaded image UUIDs from the checksum file."""
    if not os.path.exists(CHECKSUM_FILE):
        return set()
    with open(CHECKSUM_FILE, 'r') as f:
        # Read UUIDs and strip any whitespace/newlines
        return {line.strip() for line in f if line.strip()}

def save_checksum(uuid):
    """Appends a new UUID to the checksum file."""
    with open(CHECKSUM_FILE, 'a') as f:
        f.write(f"{uuid}\n")

def sanitize_foldername(name):
    """Removes invalid characters from a string to make it a valid folder name."""
    return re.sub(r'[\\/*?:"<>|]', "", name)

def download_image(url, path):
    """Downloads an image from a URL and saves it to a path."""
    try:
        response = requests.get(url, stream=True, timeout=15)
        response.raise_for_status()
        with open(path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except requests.exceptions.RequestException as e:
        print(f"    - Error downloading {url}: {e}")
        return False

# --- Main Script ---

def main():
    """
    Main function to find CSVs, parse them, and download images.
    """
    print("Starting image download process...")
    os.makedirs(IMAGE_OUTPUT_DIR, exist_ok=True)
    
    downloaded_uuids = load_downloaded_checksums()
    print(f"Loaded {len(downloaded_uuids)} checksums from previous runs.")

    total_images_found = 0
    total_images_downloaded = 0
    total_images_skipped = 0

    # Walk through all subdirectories to find CSV files
    for root, _, files in os.walk(CSV_ROOT_DIR):
        for filename in files:
            if filename.lower().endswith('.csv'):
                csv_path = os.path.join(root, filename)
                print(f"\nProcessing CSV file: {csv_path}")

                try:
                    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
                        reader = csv.DictReader(f)
                        for row in reader:
                            total_images_found += 1
                            
                            image_url = row.get('image_url')
                            scientific_name = row.get('scientific_name')
                            uuid = row.get('uuid')

                            if not all([image_url, scientific_name, uuid]):
                                print(f"  - Skipping row due to missing data (URL, species, or UUID).")
                                total_images_skipped += 1
                                continue

                            if uuid in downloaded_uuids:
                                total_images_skipped += 1
                                continue
                            
                            first_url = image_url.split(',')[0]

                            species_folder_name = sanitize_foldername(scientific_name)
                            species_dir = os.path.join(IMAGE_OUTPUT_DIR, species_folder_name)
                            os.makedirs(species_dir, exist_ok=True)
                            
                            file_extension = os.path.splitext(first_url)[1].split('?')[0]
                            if not file_extension or len(file_extension) > 5:
                                file_extension = '.jpg'
                            
                            image_filename = f"{uuid}{file_extension}"
                            image_path = os.path.join(species_dir, image_filename)

                            print(f"  - Downloading for '{scientific_name}' (UUID: {uuid})")
                            if download_image(first_url, image_path):
                                save_checksum(uuid)
                                downloaded_uuids.add(uuid)
                                total_images_downloaded += 1
                                time.sleep(0.5)
                            else:
                                total_images_skipped += 1

                except Exception as e:
                    print(f"  - Could not process file {csv_path}. Error: {e}")

    print("\n--- Download Summary ---")
    print(f"Total records found in CSVs: {total_images_found}")
    print(f"New images downloaded: {total_images_downloaded}")
    print(f"Images skipped (already downloaded, missing data, or errors): {total_images_skipped}")
    print("------------------------")
    print("Process complete.")

if __name__ == "__main__":
    main()
