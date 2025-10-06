def generate_export_urls():
    """
    Generates iNaturalist export URLs for Orchidaceae in Sarawak
    for each year from 2025 down to 1970.
    """
    base_url = "https://www.inaturalist.org/observations/export"
    taxon_id = 47628  # Orchidaceae
    place_id = 7110   # Sarawak, Malaysia
    
    print("Generating iNaturalist export URLs for Orchidaceae in Sarawak...")
    print("Please open these URLs in your browser to start the export process.")
    print("iNaturalist will email you a link to the data when it is ready.")
    print("-" * 60)

    for year in range(2025, 1969, -1):
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"
        
        # These parameters can be adjusted as needed.
        # This query is for verifiable observations of Orchidaceae in Sarawak.
        query_params = [
            f"taxon_id={taxon_id}",
            f"place_id={place_id}",
            f"d1={start_date}",
            f"d2={end_date}",
            "verifiable=any",
        ]
        
        url = f"{base_url}?{'&'.join(query_params)}"
        print(f"\nURL for {year}:")
        print(url)

    print("-" * 60)
    print("Generation complete.")

if __name__ == "__main__":
    generate_export_urls()
