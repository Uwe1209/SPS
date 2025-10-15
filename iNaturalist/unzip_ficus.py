import os
import zipfile
import sys

# Path to the directory with zip files, as provided by the user.
# Using a raw string (r"...") to handle backslashes in the Windows path.
target_dir = r"C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV\Protected\Ficus"

def main():
    """
    Extracts all zip files in the target directory.
    """
    if not os.path.isdir(target_dir):
        print(f"Error: Directory not found: {target_dir}", file=sys.stderr)
        sys.exit(1)

    print(f"Looking for zip files in '{target_dir}'...")
    found_zips = False
    for filename in os.listdir(target_dir):
        if filename.endswith(".zip"):
            found_zips = True
            zip_path = os.path.join(target_dir, filename)
            # Extract into a subdirectory named after the zip file, without the extension.
            extract_dir = os.path.join(target_dir, os.path.splitext(filename)[0])

            print(f"Extracting '{filename}'...")
            
            try:
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    os.makedirs(extract_dir, exist_ok=True)
                    zip_ref.extractall(extract_dir)
                print(f"  -> Extracted to '{extract_dir}'")
            except zipfile.BadZipFile:
                print(f"  Error: '{filename}' is a bad zip file.", file=sys.stderr)
            except Exception as e:
                print(f"  An error occurred: {e}", file=sys.stderr)
    
    if not found_zips:
        print("No zip files found in the directory.")

    print("\nExtraction complete.")

if __name__ == "__main__":
    main()
