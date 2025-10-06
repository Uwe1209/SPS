import requests
import os
import csv
import time

# The base URL for the iNaturalist v1 JSON API.
API_BASE_URL = "https://api.inaturalist.org/v1/observations"

# The root directory where the taxon-specific CSV folders are located.
CSV_ROOT_DIR = r"C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV\Protected"

# Configuration for the taxa to verify.
# 'name': Human-readable name for logging.
# 'id': The iNaturalist taxon ID.
# 'subdir': The folder name within CSV_ROOT_DIR.
# 'file_prefix': The start of the CSV filename.
TAXA_TO_VERIFY = [
    {
        'name': 'Rhododendron',
        'id': 49487,
        'subdir': 'Rhododendron',
        'file_prefix': 'observations-rhododendron'
    },
    {
        'name': 'Orchidaceae',
        'id': 47217,
        'subdir': 'Orchidaceae',
        'file_prefix': 'observations-orchidaceae'
    }
]

def get_remote_count(taxon_id, year):
    """Queries the iNaturalist API to get the total number of verifiable observations for a given taxon and year."""
    params = {
        'quality_grade': 'any',
        'identifications': 'any',
        'taxon_id': taxon_id,
        'year': year,
        'verifiable': 'true',
        'spam': 'false',
        'per_page': 0  # We only want the total count, not the results themselves.
    }
    try:
        response = requests.get(API_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get('total_results', 0)
    except requests.exceptions.RequestException as e:
        print(f"  - API Error for year {year}: {e}")
        return -1  # Return -1 to indicate an error.

def get_local_count(file_path):
    """Counts the number of data rows in a local CSV file."""
    if not os.path.exists(file_path):
        return 0
    
    try:
        with open(file_path, 'r', newline='', encoding='utf-8') as f:
            # Sum of rows, subtracting 1 for the header.
            # This avoids loading the whole file into memory.
            count = sum(1 for row in csv.reader(f)) - 1
            return max(0, count) # Ensure count is not negative for an empty file.
    except IOError as e:
        print(f"  - File Error reading {file_path}: {e}")
        return -1 # Return -1 to indicate an error.

def main():
    """Main function to loop through taxa and years, comparing local and remote counts."""
    for taxon in TAXA_TO_VERIFY:
        print(f"\nVerifying taxon: {taxon['name']} (ID: {taxon['id']})")
        print("-" * 40)
        
        taxon_dir = os.path.join(CSV_ROOT_DIR, taxon['subdir'])

        for year in range(2025, 1969, -1):
            file_path = os.path.join(taxon_dir, f"{taxon['file_prefix']}-{year}.csv")
            
            remote_count = get_remote_count(taxon['id'], year)
            time.sleep(1) # Be considerate to the API.

            if remote_count == -1:
                continue # Skip this year if there was an API error.

            local_count = get_local_count(file_path)
            if local_count == -1:
                continue # Skip this year if there was a file error.

            if local_count == remote_count:
                # Only print OK status for years that are expected to have data or have a file.
                if remote_count > 0 or os.path.exists(file_path):
                    print(f"  {year}: OK ({local_count} records)")
            else:
                print(f"  {year}: MISMATCH! Local: {local_count}, Remote: {remote_count}")

    print("\nVerification complete.")

if __name__ == "__main__":
    main()
