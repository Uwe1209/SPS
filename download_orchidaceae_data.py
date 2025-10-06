import requests
import os
import time

# The directory to save the CSV files, as specified.
output_dir = r"C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV\Protected\Orchidaceae"

# Create the output directory if it does not already exist.
os.makedirs(output_dir, exist_ok=True)

# The base URL for iNaturalist observations export in CSV format.
base_url = "https://www.inaturalist.org/observations.csv"

# Loop through the years from 2025 down to 1970.
for year in range(2025, 1969, -1):
    print(f"Downloading data for year {year}...")

    # Parameters for the iNaturalist API request.
    params = {
        'quality_grade': 'any',
        'identifications': 'any',
        'taxon_id': 47217,
        'year': year,
        'verifiable': 'true',
        'spam': 'false',
        'columns': 'id,uuid,observed_on_string,observed_on,time_observed_at,time_zone,user_id,user_login,user_name,created_at,updated_at,quality_grade,license,url,image_url,sound_url,tag_list,description,num_identification_agreements,num_identification_disagreements,captive_cultivated,oauth_application_id,place_guess,latitude,longitude,positional_accuracy,private_place_guess,private_latitude,private_longitude,public_positional_accuracy,geoprivacy,taxon_geoprivacy,coordinates_obscured,positioning_method,positioning_device,species_guess,scientific_name,common_name,iconic_taxon_name,taxon_id'
    }

    try:
        # Perform the GET request.
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx).

        # Define the output file path, including a descriptive name.
        file_path = os.path.join(output_dir, f"observations-orchidaceae-{year}.csv")

        # Write the response content to the CSV file.
        with open(file_path, 'wb') as f:
            f.write(response.content)

        print(f"Successfully saved data for {year} to {file_path}")

    except requests.exceptions.RequestException as e:
        print(f"Failed to download data for {year}. Error: {e}")

    # Pause for a couple of seconds to be considerate to the iNaturalist servers.
    time.sleep(2)

print("All downloads complete.")
