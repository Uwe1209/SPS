import os
import zipfile

# The root directory to search for zip files
SEARCH_DIR = 'iNaturalist/CSV'

def unzip_all_files():
    """
    Finds and unzips all .zip files within the specified directory and its subdirectories.
    """
    print(f"Searching for .zip files in '{SEARCH_DIR}'...")

    # Walk through the directory tree
    for dirpath, dirnames, filenames in os.walk(SEARCH_DIR):
        for filename in filenames:
            if filename.endswith('.zip'):
                zip_filepath = os.path.join(dirpath, filename)
                print(f"Extracting: {zip_filepath}")
                
                try:
                    # Open the zip file and extract its contents to the same directory
                    with zipfile.ZipFile(zip_filepath, 'r') as zip_ref:
                        zip_ref.extractall(dirpath)
                    print(f"  -> Successfully extracted to '{dirpath}'")
                except zipfile.BadZipFile:
                    print(f"  -> Error: '{zip_filepath}' is not a valid zip file or is corrupted.")
                except Exception as e:
                    print(f"  -> An unexpected error occurred: {e}")

    print("\nUnzipping process complete.")

if __name__ == "__main__":
    unzip_all_files()
