import concurrent.futures
import os
import re
import requests
import time
from pathlib import Path

# Configuration
INPUT_FILE = 'iNaturalist/iNaturalist-notes.md'
OUTPUT_DIR = Path(r'C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV')
START_YEAR = 2025
END_YEAR = 1970

def sanitize_filename(name):
    """Sanitises a string to be used as a valid folder name."""
    return re.sub(r'[<>:"/\\|?*]', '-', name).replace(' ', '-')

def get_taxon_name(taxon_id):
    """Fetches the scientific name for a given taxon ID from the iNaturalist API."""
    api_url = f"https://api.inaturalist.org/v1/taxa/{taxon_id}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        if data['results']:
            return data['results'][0]['name']
    except requests.exceptions.RequestException as e:
        print(f"Error fetching taxon name for ID {taxon_id}: {e}")
    return None

def download_observation_data(task):
    """Downloads and saves observation data for a given taxon and year."""
    taxon_id, year, species_dir = task
    
    export_url = (
        f"https://www.inaturalist.org/observations.csv?"
        f"quality_grade=any&identifications=any&taxon_id={taxon_id}"
        f"&year={year}&verifiable=true&spam=false"
    )
    
    output_csv_path = species_dir / f"{year}.csv"

    if output_csv_path.exists() and output_csv_path.stat().st_size > 0:
        print(f"  - {species_dir.name}/{year}.csv already exists and is not empty. Skipping.")
        return

    print(f"  - Downloading data for {species_dir.name}/{year}...")
    
    try:
        response = requests.get(export_url)
        response.raise_for_status()

        if response.content:
            with open(output_csv_path, 'wb') as f:
                f.write(response.content)
            print(f"    - Saved to {output_csv_path}")
        else:
            print(f"    - No data found for {year}.")
            # Create an empty file to avoid re-downloading
            output_csv_path.touch()

    except requests.exceptions.RequestException as e:
        print(f"    - Error downloading data for {year}: {e}")

def main():
    """Main function to download iNaturalist data."""
    if not Path(INPUT_FILE).exists():
        print(f"Error: Input file '{INPUT_FILE}' not found.")
        return

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    taxon_ids = sorted(list(set(re.findall(r'Taxon ID: (\d+)', content))))

    if not taxon_ids:
        print("No Taxon IDs found in the input file.")
        return

    print(f"Found {len(taxon_ids)} unique Taxon IDs.")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    taxa_info = []
    print("\nFetching scientific names for all Taxon IDs...")
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_id = {executor.submit(get_taxon_name, taxon_id): taxon_id for taxon_id in taxon_ids}
        for future in concurrent.futures.as_completed(future_to_id):
            taxon_id = future_to_id[future]
            try:
                name = future.result()
                if name:
                    print(f"  - {taxon_id}: {name}")
                    taxa_info.append({'id': taxon_id, 'name': name})
                else:
                    print(f"  - Could not retrieve name for Taxon ID {taxon_id}. Skipping.")
            except Exception as exc:
                print(f'  - Taxon ID {taxon_id} generated an exception when fetching name: {exc}')

    tasks = []
    for taxon in taxa_info:
        scientific_name = taxon['name']
        species_folder_name = sanitize_filename(scientific_name)
        species_dir = OUTPUT_DIR / species_folder_name
        species_dir.mkdir(exist_ok=True)
        
        for year in range(START_YEAR, END_YEAR - 1, -1):
            tasks.append((taxon['id'], year, species_dir))

    print(f"\nStarting to process {len(tasks)} download tasks with up to 10 workers...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(download_observation_data, tasks)
    
    print("\nAll tasks completed.")

if __name__ == "__main__":
    main()
