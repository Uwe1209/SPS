import os
import csv
from urllib.parse import urlparse

# The root directory where the taxon-specific CSV folders are located.
CSV_ROOT_DIR = r"C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV\Protected"

# The root directory where the downloaded images are stored.
# This assumes a parallel structure to the CSV directory, e.g., ...\iNaturalist\Images\Protected
IMAGE_ROOT_DIR = r"C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\Images\Protected"

# Configuration for the taxa to verify.
TAXA_TO_VERIFY = [
    {
        'name': 'Rhododendron',
        'subdir': 'Rhododendron',
    },
    {
        'name': 'Orchidaceae',
        'subdir': 'Orchidaceae',
    }
]

def get_extension_from_url(url):
    """Extracts the file extension from a URL's path."""
    if not url:
        return None
    try:
        path = urlparse(url).path
        _, extension = os.path.splitext(path)
        return extension
    except Exception:
        return None

def main():
    """Main function to verify downloaded images against CSV records."""
    total_missing_count = 0
    total_checked_count = 0

    # Ensure the base image directory exists before starting.
    if not os.path.isdir(IMAGE_ROOT_DIR):
        print(f"Error: Image root directory not found at '{IMAGE_ROOT_DIR}'")
        print("Please ensure the path is correct and the directory exists.")
        return

    for taxon in TAXA_TO_VERIFY:
        print(f"\nVerifying images for taxon: {taxon['name']}")
        print("-" * 40)
        
        taxon_csv_dir = os.path.join(CSV_ROOT_DIR, taxon['subdir'])
        taxon_image_dir = os.path.join(IMAGE_ROOT_DIR, taxon['subdir'])
        
        if not os.path.isdir(taxon_csv_dir):
            print(f"  - Skipping: CSV directory not found at '{taxon_csv_dir}'")
            continue

        if not os.path.isdir(taxon_image_dir):
            print(f"  - Warning: Image directory not found at '{taxon_image_dir}'. All images will be reported as missing.")
            os.makedirs(taxon_image_dir, exist_ok=True)


        taxon_missing_count = 0
        taxon_checked_count = 0

        # Iterate over all files in the taxon's CSV directory.
        for filename in sorted(os.listdir(taxon_csv_dir)):
            if filename.lower().endswith('.csv'):
                file_path = os.path.join(taxon_csv_dir, filename)
                print(f"  - Checking CSV file: {filename}")
                
                try:
                    with open(file_path, 'r', newline='', encoding='utf-8') as f:
                        reader = csv.DictReader(f)
                        for row in reader:
                            image_url = row.get('image_url')
                            uuid = row.get('uuid')

                            if image_url and uuid:
                                taxon_checked_count += 1
                                extension = get_extension_from_url(image_url)
                                
                                if not extension:
                                    print(f"    - WARNING: Could not determine file extension from URL: {image_url} (UUID: {uuid})")
                                    continue

                                # Assumes images are named {uuid}.{extension}
                                image_filename = f"{uuid}{extension}"
                                image_path = os.path.join(taxon_image_dir, image_filename)

                                if not os.path.exists(image_path):
                                    taxon_missing_count += 1
                                    print(f"    - MISSING: {image_path} (from URL: {image_url})")

                except FileNotFoundError:
                    print(f"    - ERROR: File not found during processing: {file_path}")
                except Exception as e:
                    print(f"    - ERROR: An unexpected error occurred while processing {filename}: {e}")

        print(f"\n  Summary for {taxon['name']}:")
        print(f"  - Checked for {taxon_checked_count} images based on CSV entries.")
        if taxon_missing_count > 0:
            print(f"  - Found {taxon_missing_count} missing images.")
        elif taxon_checked_count > 0:
            print(f"  - All {taxon_checked_count} images appear to be downloaded correctly.")
        else:
            print(f"  - No images to check in this taxon's CSV files.")
        
        total_missing_count += taxon_missing_count
        total_checked_count += taxon_checked_count

    print("\n" + "=" * 40)
    print("Overall Verification Complete")
    print(f"- Total images checked: {total_checked_count}")
    print(f"- Total images missing: {total_missing_count}")
    print("=" * 40)


if __name__ == "__main__":
    main()
