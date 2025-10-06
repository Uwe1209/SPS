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

def download_and_save_species_data(taxon_info):
    """Downloads all data for a single species and saves to a single CSV, handling throttling."""
    taxon_id = taxon_info['id']
    name = taxon_info['name']

    print(f"\nProcessing {name} (Taxon ID: {taxon_id})")

    species_folder_name = sanitize_filename(name)
    species_dir = OUTPUT_DIR / species_folder_name
    species_dir.mkdir(exist_ok=True)

    output_csv_path = species_dir / f"{species_folder_name}.csv"
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
                    time.sleep(1)  # Proactive delay to avoid throttling
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

    print(f"\nStarting to process {len(taxa_info)} species with up to 5 workers...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        executor.map(download_and_save_species_data, taxa_info)
    
    print("\nAll tasks completed.")

if __name__ == "__main__":
    main()
