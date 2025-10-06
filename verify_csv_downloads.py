import os
import csv
import requests

# The root directory containing the CSV files, including subdirectories.
CSV_ROOT_DIR = r"C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV"

# iNaturalist API endpoint for observations.
API_BASE_URL = "https://api.inaturalist.org/v1/observations"

def get_remote_count(taxon_id):
    """
    Gets the total number of observations for a given taxon_id from iNaturalist.
    """
    if not taxon_id:
        return 0
    
    # Parameters for the API request. We only need the total count.
    params = {
        "taxon_id": taxon_id,
        "per_page": 0,
    }
    try:
        response = requests.get(API_BASE_URL, params=params)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        return response.json().get("total_results", 0)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for taxon ID {taxon_id}: {e}")
        return -1  # Return -1 to indicate an error

def get_local_count(file_path):
    """
    Counts the number of data rows in a CSV file, skipping the header.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)  # Skip header row
            return sum(1 for row in reader)
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return 0
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return 0

def get_taxon_id_from_csv(file_path):
    """
    Extracts the taxon_id from a CSV file.
    Assumes 'taxon_id' is a column and is consistent throughout the file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            first_row = next(reader, None)
            if first_row and 'taxon_id' in first_row:
                return first_row['taxon_id']
    except Exception as e:
        print(f"Could not read taxon_id from {file_path}: {e}")
    return None

def main():
    """
    Main function to find CSVs, group them by taxon, and verify counts.
    """
    taxon_files = {}
    
    print(f"Scanning for CSV files in '{CSV_ROOT_DIR}'...")
    # Recursively find all CSV files using os.walk
    for root, _, files in os.walk(CSV_ROOT_DIR):
        for filename in files:
            if filename.endswith('.csv'):
                file_path = os.path.join(root, filename)
                taxon_id = get_taxon_id_from_csv(file_path)
                if taxon_id:
                    if taxon_id not in taxon_files:
                        taxon_files[taxon_id] = []
                    taxon_files[taxon_id].append(file_path)

    if not taxon_files:
        print(f"No CSV files with a 'taxon_id' column found in {CSV_ROOT_DIR}")
        return

    print("\nVerifying CSV file counts against iNaturalist...")

    for taxon_id, files in sorted(taxon_files.items()):
        local_count = 0
        for file_path in files:
            local_count += get_local_count(file_path)
        
        remote_count = get_remote_count(taxon_id)

        print(f"\n--- Taxon ID: {taxon_id} ---")
        print(f"Found {len(files)} CSV file(s).")
        print(f"Local observation count: {local_count}")
        
        if remote_count >= 0:
            print(f"iNaturalist observation count: {remote_count}")
            if local_count == remote_count:
                print("Status: COMPLETE. Local data matches iNaturalist.")
            elif local_count > remote_count:
                print("Status: WARNING. Local data has MORE records than iNaturalist.")
            else:
                print(f"Status: INCOMPLETE. Missing {remote_count - local_count} records.")
        else:
            print("Status: UNKNOWN. Could not retrieve count from iNaturalist.")

if __name__ == "__main__":
    main()
