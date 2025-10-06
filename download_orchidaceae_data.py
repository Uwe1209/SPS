import requests
import os
import time
import csv

# The directory to save the CSV files, as specified.
output_dir = r"C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV\Protected\Orchidaceae"

# Create the output directory if it does not already exist.
os.makedirs(output_dir, exist_ok=True)

# The base URL for the iNaturalist v1 JSON API.
base_url = "https://api.inaturalist.org/v1/observations"

# Define headers for the CSV file. Private fields are excluded as they require authentication.
headers = [
    'id', 'uuid', 'observed_on_string', 'observed_on', 'time_observed_at', 'time_zone', 'user_id', 'user_login',
    'user_name', 'created_at', 'updated_at', 'quality_grade', 'license', 'url', 'image_url', 'sound_url', 'tag_list',
    'description', 'num_identification_agreements', 'num_identification_disagreements', 'captive_cultivated',
    'oauth_application_id', 'place_guess', 'latitude', 'longitude', 'positional_accuracy',
    'public_positional_accuracy', 'geoprivacy', 'taxon_geoprivacy', 'coordinates_obscured', 'positioning_method',
    'positioning_device', 'species_guess', 'scientific_name', 'common_name', 'iconic_taxon_name', 'taxon_id'
]

# Define fields to request from the JSON API, mapping to the nested structure.
json_fields = [
    'id', 'uuid', 'observed_on_string', 'observed_on', 'time_observed_at', 'time_zone', 'user', 'created_at',
    'updated_at', 'quality_grade', 'license_code', 'uri', 'default_photo', 'sounds', 'tags', 'description',
    'num_identification_agreements', 'num_identification_disagreements', 'captive', 'oauth_application_id',
    'place_guess', 'location', 'positional_accuracy', 'public_positional_accuracy', 'geoprivacy',
    'taxon_geoprivacy', 'obscured', 'positioning_method', 'positioning_device', 'species_guess', 'taxon'
]

# Loop through the years from 2025 down to 1970.
for year in range(2025, 1969, -1):
    print(f"Processing year {year}...")

    # Define the output file path.
    file_path = os.path.join(output_dir, f"observations-orchidaceae-{year}.csv")

    try:
        with open(file_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)

            # Paginate through results for the current year.
            page = 1
            while True:
                print(f"  Downloading page {page} for year {year}...")
                params = {
                    'quality_grade': 'any',
                    'identifications': 'any',
                    'taxon_id': 47217,
                    'year': year,
                    'verifiable': 'true',
                    'spam': 'false',
                    'fields': ','.join(json_fields),
                    'per_page': 200,
                    'page': page
                }

                response = requests.get(base_url, params=params)
                response.raise_for_status()
                data = response.json()
                results = data.get('results', [])

                if not results:
                    if page == 1:
                        print(f"  No results found for year {year}.")
                    break  # No more results for this year.

                print(f"  Processing {len(results)} results...")

                for obs in results:
                    user = obs.get('user', {}) or {}
                    taxon = obs.get('taxon', {}) or {}
                    default_photo = obs.get('default_photo', {}) or {}
                    sounds = obs.get('sounds', []) or []
                    
                    lat, lon = (None, None)
                    if obs.get('location'):
                        try:
                            lat, lon = obs['location'].split(',')
                        except (ValueError, IndexError):
                            pass # Location format is not as expected.

                    row = [
                        obs.get('id'),
                        obs.get('uuid'),
                        obs.get('observed_on_string'),
                        obs.get('observed_on'),
                        obs.get('time_observed_at'),
                        obs.get('time_zone'),
                        user.get('id'),
                        user.get('login'),
                        user.get('name'),
                        obs.get('created_at'),
                        obs.get('updated_at'),
                        obs.get('quality_grade'),
                        obs.get('license_code'),
                        obs.get('uri'),
                        default_photo.get('medium_url'),
                        sounds[0].get('file_url') if sounds else None,
                        ','.join(obs.get('tags') or []),
                        obs.get('description'),
                        obs.get('num_identification_agreements'),
                        obs.get('num_identification_disagreements'),
                        obs.get('captive'),
                        obs.get('oauth_application_id'),
                        obs.get('place_guess'),
                        lat,
                        lon,
                        obs.get('positional_accuracy'),
                        obs.get('public_positional_accuracy'),
                        obs.get('geoprivacy'),
                        obs.get('taxon_geoprivacy'),
                        obs.get('obscured'),
                        obs.get('positioning_method'),
                        obs.get('positioning_device'),
                        obs.get('species_guess'),
                        taxon.get('name'),
                        taxon.get('preferred_common_name'),
                        taxon.get('iconic_taxon_name'),
                        taxon.get('id')
                    ]
                    writer.writerow(row)

                if len(results) < 200:
                    break # Last page for this year.

                page += 1
                # Pause to be considerate to the iNaturalist servers.
                time.sleep(1)
        
        print(f"Successfully saved data for {year} to {file_path}")

    except requests.exceptions.RequestException as e:
        print(f"Failed to download data for {year}. Error: {e}")
    except IOError as e:
        print(f"Failed to write file for {year}. Error: {e}")

print("All downloads complete.")
