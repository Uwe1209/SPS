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
REQUEST_DELAY_SECONDS = 1  # To be polite to the iNaturalist servers

def sanitize_filename(name):
    """Sanitises a string to be used as a valid folder name."""
    return re.sub(r'[<>:"/\\|?*]', '_', name).replace(' ', '_')

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

    for taxon_id in taxon_ids:
        print(f"\nProcessing Taxon ID: {taxon_id}")
        
        scientific_name = get_taxon_name(taxon_id)
        if not scientific_name:
            print(f"Could not retrieve name for Taxon ID {taxon_id}. Skipping.")
            time.sleep(REQUEST_DELAY_SECONDS)
            continue
            
        print(f"Scientific name: {scientific_name}")
        
        species_folder_name = sanitize_filename(scientific_name)
        species_dir = OUTPUT_DIR / species_folder_name
        species_dir.mkdir(exist_ok=True)
        
        print(f"Exporting data to: {species_dir}")

        for year in range(START_YEAR, END_YEAR - 1, -1):
            export_url = (
                f"https://www.inaturalist.org/observations.csv?"
                f"quality_grade=any&identifications=any&taxon_id={taxon_id}"
                f"&year={year}&verifiable=true&spam=false"
            )
            
            output_csv_path = species_dir / f"{year}.csv"

            if output_csv_path.exists() and output_csv_path.stat().st_size > 0:
                print(f"  - {year}.csv already exists and is not empty. Skipping.")
                continue

            print(f"  - Downloading data for {year}...")
            
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

            time.sleep(REQUEST_DELAY_SECONDS)

if __name__ == "__main__":
    main()
