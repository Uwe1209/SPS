import urllib.parse

def generate_urls():
    """
    Generates iNaturalist query URLs for years 1999 down to 1970.
    """
    base_url = "https://www.inaturalist.org/observations"
    
    params = {
        'quality_grade': 'any',
        'identifications': 'any',
        'taxon_id': 50999,
        'verifiable': 'true',
        'spam': 'false'
    }

    for year in range(1999, 1969, -1):
        query_params = params.copy()
        query_params['d1'] = f'{year}-01-01'
        query_params['d2'] = f'{year}-12-31'
        
        query_string = urllib.parse.urlencode(query_params)
        print(f"{base_url}?{query_string}")

if __name__ == "__main__":
    generate_urls()
