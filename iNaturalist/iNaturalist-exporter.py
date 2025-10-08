import concurrent.futures
import os
import re
import requests
import time
from pathlib import Path

# Configuration
INPUT_FILE = 'iNaturalist/iNaturalist-manifest.md'
OUTPUT_DIR = Path(r'C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV')
START_YEAR = 2025
END_YEAR = 1970

def sanitize_filename(name):
    """Sanitises a string to be used as a valid folder name."""
    return re.sub(r'[<>:"/\\|?*]', '-', name).replace(' ', '-')

def get_taxon_details(taxon_id):
    """Fetches details (name, verifiable observation count) for a given taxon ID from the iNaturalist API."""
    retries = 3
    for attempt in range(retries):
        try:
            # Add a small delay to be a good API citizen, especially in a concurrent context.
            time.sleep(1)

            # Get taxon name
            taxa_api_url = f"https://api.inaturalist.org/v1/taxa/{taxon_id}"
            taxa_response = requests.get(taxa_api_url)
            taxa_response.raise_for_status()
            taxa_data = taxa_response.json()
            name = taxa_data['results'][0].get('name') if taxa_data.get('results') else None

            if not name:
                return None

            # Another small delay before the next request
            time.sleep(1)

            # Get verifiable observation count
            obs_api_url = f"https://api.inaturalist.org/v1/observations?taxon_id={taxon_id}&verifiable=true&per_page=0"
            obs_response = requests.get(obs_api_url)
            obs_response.raise_for_status()
            obs_data = obs_response.json()
            verifiable_count = obs_data.get('total_results', 0)

            return {
                'name': name,
                'observations_count': verifiable_count
            }
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                retry_after = int(e.response.headers.get("Retry-After", 5))
                print(f"    - Throttled fetching details for {taxon_id}. Retrying after {retry_after}s... (Attempt {attempt + 1}/{retries})")
                time.sleep(retry_after)
            else:
                print(f"Error fetching taxon details for ID {taxon_id}: {e}")
                return None # Fail on other HTTP errors
        except requests.exceptions.RequestException as e:
            print(f"Request error for taxon details for ID {taxon_id}: {e}")
            if attempt < retries - 1:
                time.sleep(5) # Wait before retrying
            else:
                print(f"Max retries reached for taxon details for ID {taxon_id}.")
                return None
    return None

def get_local_observation_count(csv_path):
    """Counts the number of observations in a local CSV file."""
    if not csv_path.exists():
        return 0
    try:
        with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
            # Subtract 1 for the header
            return max(0, sum(1 for _ in f) - 1)
    except Exception as e:
        print(f"Could not read {csv_path}: {e}")
        return 0

def download_and_save_species_data(taxon_info, mode='overwrite'):
    """Downloads all data for a single species and saves to a single CSV, handling throttling."""
    taxon_id = taxon_info['id']
    name = taxon_info['name']
    path_parts = taxon_info['path']

    print(f"\nProcessing {name} (Taxon ID: {taxon_id})")

    sanitized_path_parts = [sanitize_filename(part) for part in path_parts]
    species_folder_name = sanitize_filename(name)
    species_dir = OUTPUT_DIR.joinpath(*sanitized_path_parts, species_folder_name)

    output_csv_path = species_dir / f"{species_folder_name}.csv"

    if mode == 'missing' and output_csv_path.exists():
        print(f"  - CSV file already exists for {name}. Skipping download.")
        return

    species_dir.mkdir(parents=True, exist_ok=True)
    print(f"Exporting data to: {output_csv_path}")

    with open(output_csv_path, 'wb') as f_out:
        header_written = False
        for year in range(START_YEAR, END_YEAR - 1, -1):
            export_url = (
                f"https://www.inaturalist.org/observations.csv?"
                f"quality_grade=any&identifications=any&taxon_id={taxon_id}"
                f"&year={year}&verifiable=true&spam=false"
            )

            print(f"  - Downloading data for {year}...")

            retries = 3
            for attempt in range(retries):
                try:
                    time.sleep(1.5)  # Proactive delay to avoid throttling
                    response = requests.get(export_url)
                    response.raise_for_status()

                    if response.content:
                        content_lines = response.content.splitlines(True)
                        if not header_written:
                            f_out.writelines(content_lines)
                            if content_lines:
                                header_written = True
                        elif len(content_lines) > 1:
                            f_out.writelines(content_lines[1:])
                    else:
                        print(f"    - No data found for {year}.")

                    break  # Success
                except requests.exceptions.HTTPError as e:
                    if e.response.status_code == 429:
                        retry_after = int(e.response.headers.get("Retry-After", 5))
                        print(f"    - Throttled. Retrying after {retry_after} seconds... (Attempt {attempt + 1}/{retries})")
                        time.sleep(retry_after)
                    else:
                        print(f"    - HTTP Error downloading data for {year}: {e}")
                        break
                except requests.exceptions.RequestException as e:
                    print(f"    - Request Error downloading data for {year}: {e}")
                    if attempt < retries - 1:
                        time.sleep(5)
                    else:
                        print(f"    - Max retries reached for {year}. Skipping.")
                        break

def print_tree(node, prefix=""):
    """Recursively prints a tree structure from a nested dictionary."""
    subdirs = {k: v for k, v in node.items() if k != '_species'}
    species = sorted(node.get('_species', []))
    
    items = list(subdirs.items())
    total_items = len(items) + len(species)
    count = 0

    # Print subdirectories
    for name, child_node in items:
        count += 1
        is_last = count == total_items
        connector = "└── " if is_last else "├── "
        print(f"{prefix}{connector}{name}")
        
        new_prefix = prefix + ("    " if is_last else "│   ")
        print_tree(child_node, new_prefix)

    # Print species
    for name in species:
        count += 1
        is_last = count == total_items
        connector = "└── " if is_last else "├── "
        print(f"{prefix}{connector}{name}")

def main():
    """Main function to download iNaturalist data."""
    print("Please choose an action:")
    print("1. Show remote and local observation counts")
    print("2. Download all observation data (overwrite existing files)")
    print("3. Download missing observation data only")
    print("4. Exit")

    choice = input("Enter your choice (1-4): ").strip()

    if choice == '4':
        return
    if choice not in ['1', '2', '3']:
        print("Invalid choice. Exiting.")
        return

    if not Path(INPUT_FILE).exists():
        print(f"Error: Input file '{INPUT_FILE}' not found.")
        return

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    taxa_with_paths_dict = {}
    current_h1 = None
    current_h2 = None
    for line in content.splitlines():
        line = line.strip()
        h1_match = re.match(r'###\s+(.*)', line)
        h2_match = re.match(r'#####\s+[\d\.]+\s+(.*)', line)
        taxon_match = re.search(r'Taxon ID: (\d+)', line)

        if h1_match:
            current_h1 = h1_match.group(1).strip()
            current_h2 = None
        elif h2_match:
            current_h2 = h2_match.group(1).strip()
        elif taxon_match and current_h1 and current_h2:
            taxon_id = taxon_match.group(1)
            if taxon_id not in taxa_with_paths_dict:
                taxa_with_paths_dict[taxon_id] = {
                    'id': taxon_id,
                    'path': [current_h1, current_h2]
                }

    taxa_with_paths = sorted(taxa_with_paths_dict.values(), key=lambda x: x['id'])

    if not taxa_with_paths:
        print("No Taxon IDs found with associated paths in the input file.")
        return

    print(f"Found {len(taxa_with_paths)} unique Taxon IDs with paths.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    taxa_info = []
    print("\nFetching taxon details for all Taxon IDs...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        future_to_taxon = {executor.submit(get_taxon_details, taxon['id']): taxon for taxon in taxa_with_paths}
        for future in concurrent.futures.as_completed(future_to_taxon):
            taxon = future_to_taxon[future]
            try:
                details = future.result()
                if details and details['name']:
                    taxa_info.append({
                        'id': taxon['id'],
                        'name': details['name'],
                        'path': taxon['path'],
                        'count': details['observations_count']
                    })
                else:
                    print(f"  - Could not retrieve details for Taxon ID {taxon['id']}. Skipping.")
            except Exception as exc:
                print(f'  - Taxon ID {taxon["id"]} generated an exception when fetching details: {exc}')

    if choice == '1':
        tree_data = {}
        for taxon in taxa_info:
            sanitized_path_parts = [sanitize_filename(part) for part in taxon['path']]
            species_folder_name = sanitize_filename(taxon['name'])
            species_dir = OUTPUT_DIR.joinpath(*sanitized_path_parts, species_folder_name)
            csv_path = species_dir / f"{species_folder_name}.csv"

            local_count = get_local_observation_count(csv_path)
            remote_count = taxon['count']

            current_level = tree_data
            for part in taxon['path']:
                current_level = current_level.setdefault(part, {})

            if '_species' not in current_level:
                current_level['_species'] = []

            count_str = f"Local: {local_count:,}, Remote: {remote_count:,}"
            species_str = f"{taxon['name']} (Taxon ID: {taxon['id']}) - {count_str}"
            current_level['_species'].append(species_str)

        print("\nObservation Counts (Local vs. Remote):")
        print_tree(tree_data)

    elif choice in ['2', '3']:
        tree_data = {}
        for taxon in taxa_info:
            current_level = tree_data
            for part in taxon['path']:
                current_level = current_level.setdefault(part, {})

            if '_species' not in current_level:
                current_level['_species'] = []
            current_level['_species'].append(f"{taxon['name']} (Taxon ID: {taxon['id']}) - {taxon['count']:,} observations")

        print("\nDiscovered Taxa and Planned Directory Structure:")
        print_tree(tree_data)

        mode = 'overwrite' if choice == '2' else 'missing'

        if mode == 'overwrite':
            print(f"\nStarting to process {len(taxa_info)} species (overwrite mode) with up to 2 workers...")
        else:
            print(f"\nStarting to process {len(taxa_info)} species (missing files mode) with up to 2 workers...")

        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            list(executor.map(lambda t: download_and_save_species_data(t, mode=mode), taxa_info))

    print("\nAll tasks completed.")

if __name__ == "__main__":
    main()
