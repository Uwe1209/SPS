import requests
import os
import csv
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# The base URL for the iNaturalist v1 JSON API.
API_BASE_URL = "https://api.inaturalist.org/v1/observations"

# The root directory to scan for CSV files.
CSV_ROOT_DIR = r"C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV"

def get_remote_count(taxon_id, year):
    """
    Queries the iNaturalist API to get the total number of verifiable observations.
    Note: This function makes API calls without a delay. Aggressive use may
    lead to rate-limiting (HTTP 429 errors) from the iNaturalist server.
    """
    params = {
        'quality_grade': 'any',
        'identifications': 'any',
        'taxon_id': taxon_id,
        'year': year,
        'verifiable': 'true',
        'spam': 'false',
        'per_page': 0  # We only want the total count, not the results.
    }
    try:
        response = requests.get(API_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get('total_results', 0)
    except requests.exceptions.RequestException as e:
        # This error will be caught and reported by the worker.
        raise e

def get_local_count(file_path):
    """Counts the number of data rows in a local CSV file."""
    if not os.path.exists(file_path):
        return 0
    
    try:
        with open(file_path, 'r', newline='', encoding='utf-8') as f:
            # Sum of rows, subtracting 1 for the header.
            # This avoids loading the whole file into memory.
            count = sum(1 for row in csv.reader(f)) - 1
            return max(0, count) # Ensure count is not negative.
    except IOError as e:
        raise IOError(f"File Error reading {file_path}: {e}")

def get_taxon_id_from_csv(file_path):
    """Reads the first data row of a CSV to find the taxon_id."""
    try:
        with open(file_path, 'r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            first_row = next(reader, None)
            if first_row and 'taxon_id' in first_row and first_row['taxon_id']:
                return first_row['taxon_id']
            return None
    except (IOError, StopIteration, KeyError) as e:
        raise ValueError(f"Could not read taxon_id from {os.path.basename(file_path)}: {e}")

def verify_csv_file(file_path):
    """Worker function to verify a single CSV file against the iNaturalist API."""
    filename = os.path.basename(file_path)
    
    # Parse year from filename, e.g., '...-2024.csv'
    match = re.search(r'-(\d{4})\.csv$', filename)
    if not match:
        return f"SKIPPED: Could not parse year from '{filename}'.", "skip"

    year = int(match.group(1))
    
    try:
        taxon_id = get_taxon_id_from_csv(file_path)
        if not taxon_id:
            return f"SKIPPED: Could not retrieve taxon_id from '{filename}'.", "skip"

        local_count = get_local_count(file_path)
        remote_count = get_remote_count(taxon_id, year)

        if local_count == remote_count:
            if remote_count > 0 or os.path.exists(file_path):
                return f"OK: {filename} ({local_count} records)", "ok"
            else:
                # File exists but is empty and remote is 0, which is OK.
                return f"OK: {filename} (0 records)", "ok"
        else:
            return f"MISMATCH: {filename} -> Local: {local_count}, Remote: {remote_count}", "mismatch"
    except Exception as e:
        return f"ERROR: {filename} -> {e}", "error"

def main():
    """Finds all CSVs and verifies them using a thread pool."""
    csv_files = []
    for root, _, files in os.walk(CSV_ROOT_DIR):
        for file in files:
            if file.lower().endswith('.csv'):
                csv_files.append(os.path.join(root, file))

    if not csv_files:
        print(f"No CSV files found in '{CSV_ROOT_DIR}'")
        return

    print(f"Found {len(csv_files)} CSV files. Starting verification...\n")
    
    results = {"ok": [], "mismatch": [], "error": [], "skip": []}
    
    with ThreadPoolExecutor() as executor:
        future_to_file = {executor.submit(verify_csv_file, f): f for f in csv_files}
        
        for future in as_completed(future_to_file):
            try:
                message, status = future.result()
                results[status].append(message)
            except Exception as exc:
                file_path = future_to_file[future]
                results["error"].append(f"CRITICAL ERROR processing {os.path.basename(file_path)}: {exc}")

    # Print results grouped by status for clarity.
    if results["mismatch"]:
        print("--- MISMATCHES FOUND ---")
        for result in sorted(results["mismatch"]):
            print(f"  - {result}")
        print("")

    if results["error"]:
        print("--- ERRORS ENCOUNTERED ---")
        for result in sorted(results["error"]):
            print(f"  - {result}")
        print("")

    if results["ok"]:
        print("--- OK ---")
        for result in sorted(results["ok"]):
            print(f"  - {result}")
        print("")

    if results["skip"]:
        print("--- SKIPPED FILES (filename does not match '...-YYYY.csv' pattern) ---")
        for result in sorted(results["skip"]):
            print(f"  - {result}")
        print("")

    print("Verification complete.")

if __name__ == "__main__":
    main()
