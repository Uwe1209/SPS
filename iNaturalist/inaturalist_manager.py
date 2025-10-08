import re
import os
import json
import requests
import shutil
import csv
from datetime import datetime

DOWNLOAD_BASE_PATH = r'C:\Users\darklorddad\Downloads\Year 3 Semester 1\COS30049 Computing Technology Innovation Project\Project\SPS\iNaturalist\CSV\iNaturalist-manager'

def clean_dir_name(text):
    """
    Cleans a heading string to be used as a directory name, removing leading numbers.
    e.g., "1.1. My Heading" -> "My-Heading"
    """
    match = re.match(r'^\d+(\.\d+)*\.\s+(.*)', text)
    if match:
        text_part = match.group(2)
        return text_part.replace(' ', '-')
    else:
        return text.replace(' ', '-')

def slugify(text):
    """
    Converts a heading string into a file-system-friendly name, preserving
    leading numbers for uniqueness but slugifying the text part.
    e.g., "1.1. My Heading" -> "1.1. My-Heading"
    """
    text = text.strip()
    match = re.match(r'^(\d+(\.\d+)*\.)\s+(.*)', text)
    if match:
        # Heading with number, e.g., "1.1. My Heading"
        number_part = match.group(1)
        text_part = match.group(3)
        return f"{number_part} {text_part.replace(' ', '-')}"
    else:
        # Heading without number
        return text.replace(' ', '-')

def parse_manifest(file_path):
    """
    Parses the manifest markdown file and builds a nested dictionary
    representing the directory and file structure.
    """
    if not os.path.exists(file_path):
        print(f"Error: Manifest file not found at '{file_path}'")
        return {}

    tree = {}
    path_stack = []  # A stack of (level, dict_reference)
    path_valid_stack = [] # A stack of (level, is_valid)

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('#'):
            # This is a heading line.

            # Look ahead to see if this section or its subsections contain any Taxon IDs.
            # If not, we skip this heading entirely.
            has_taxon_id = False
            current_level = len(re.match(r'^(#+)', line).group(1))
            j = i + 1
            while j < len(lines):
                next_line = lines[j].strip()
                if next_line.startswith('#'):
                    next_level = len(re.match(r'^(#+)', next_line).group(1))
                    if next_level <= current_level:
                        # We've reached a sibling or parent heading, so stop lookahead.
                        break
                
                if "Taxon ID:" in next_line:
                    has_taxon_id = True
                    break
                j += 1

            if has_taxon_id:
                match = re.match(r'^(#+)\s*(.*)', line)
                level = len(match.group(1))
                raw_title = match.group(2)

                # Manage a stack to track if the current heading is under a "Not found" branch.
                while path_valid_stack and path_valid_stack[-1][0] >= level:
                    path_valid_stack.pop()
                
                parent_is_valid = path_valid_stack[-1][1] if path_valid_stack else True
                is_invalid_keyword = any(keyword in raw_title for keyword in ["Not found", "No results found", "Unclear"])
                current_is_valid = parent_is_valid and not is_invalid_keyword
                path_valid_stack.append((level, current_is_valid))

                # Only build the tree and parse taxons if the entire path is valid.
                if current_is_valid:
                    title = slugify(raw_title)
                    
                    # Adjust the path stack for dictionary references.
                    while path_stack and path_stack[-1][0] >= level:
                        path_stack.pop()

                    # Get the parent dictionary from the stack or use the root.
                    parent_dict = tree
                    if path_stack:
                        parent_dict = path_stack[-1][1]

                    # Add the new directory to the tree.
                    if title not in parent_dict:
                        parent_dict[title] = {}
                    
                    current_dict = parent_dict[title]
                    path_stack.append((level, current_dict))

                    # Now, parse all Taxon IDs under this heading until the next heading.
                    taxons = []
                    j = i + 1
                    while j < len(lines) and not lines[j].strip().startswith('#'):
                        line_text = lines[j].strip()
                        if "Taxon ID:" in line_text:
                            # Example: * Dipterocarpus oblongifolius; Taxon ID: 191655
                            taxon_match = re.search(r'^\*\s*(.*?);.*Taxon ID:\s*(\d+)', line_text)
                            if taxon_match:
                                name = taxon_match.group(1).strip()
                                taxon_id = taxon_match.group(2).strip()

                                # Clean up the name
                                name = re.sub(r'\(.*\)', '', name).strip() # remove parenthetical parts
                                if ':' in name:
                                    name = name.split(':')[-1].strip() # handle common names like "Pokok Ara:"
                                name = name.replace('_', '') # remove markdown italics

                                # Apply file naming convention
                                file_name = name.replace(' ', '-')
                                
                                taxons.append({'filename': f"{taxon_id}-{file_name}", 'taxon_id': taxon_id})
                        j += 1
                    
                    if taxons:
                        if '__taxons__' not in current_dict:
                            current_dict['__taxons__'] = []
                        current_dict['__taxons__'].extend(taxons)
            
            # Skip to the next heading.
            j = i + 1
            while j < len(lines) and not lines[j].strip().startswith('#'):
                j += 1
            i = j
        else:
            i += 1
    
    return tree

def get_observation_count(taxon_id):
    """
    Fetches the observation count for a given taxon ID from the iNaturalist API.
    """
    url = "https://api.inaturalist.org/v1/observations"
    params = {
        'quality_grade': 'any',
        'identifications': 'any',
        'taxon_id': taxon_id,
        'verifiable': 'true',
        'spam': 'false'
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()
        return data.get('total_results', 'N/A')
    except requests.exceptions.RequestException:
        return 'Error'

def count_taxons_recursively(node):
    """
    Recursively counts the total number of taxons in a node and its sub-nodes.
    """
    count = len(node.get('__taxons__', []))
    for key, child_node in node.items():
        if key != '__taxons__' and isinstance(child_node, dict):
            count += count_taxons_recursively(child_node)
    return count

def fetch_and_update_counts(node):
    """
    Recursively traverses the tree and fetches counts for each taxon.
    """
    if '__taxons__' in node:
        for taxon in node['__taxons__']:
            print(f"Fetching count for {taxon['filename']}...")
            taxon['count'] = get_observation_count(taxon['taxon_id'])

    for key, child_node in node.items():
        if key != '__taxons__' and isinstance(child_node, dict):
            fetch_and_update_counts(child_node)

def print_tree(node, prefix=""):
    """
    Recursively prints the file tree structure to the console.
    """
    # Separate directories from taxon "files".
    dirs = {k: v for k, v in node.items() if k != '__taxons__'}
    taxons = node.get('__taxons__', [])

    dir_items = sorted(dirs.items())
    taxon_items = sorted(taxons, key=lambda x: x['filename'])
    
    total_items = len(dir_items) + len(taxon_items)
    count = 0

    # Print directories first.
    for name, child_node in dir_items:
        count += 1
        is_last = count == total_items
        connector = "└── " if is_last else "├── "
        taxon_count = count_taxons_recursively(child_node)
        
        display_name = clean_dir_name(name)
        print(f"{prefix}{connector}{display_name} (Count: {taxon_count})")
        
        new_prefix = prefix + ("    " if is_last else "│   ")
        print_tree(child_node, new_prefix)

    # Then print taxons.
    for taxon in taxon_items:
        count += 1
        is_last = count == total_items
        connector = "└── " if is_last else "├── "
        count_str = taxon.get('count', 'N/A')
        print(f"{prefix}{connector}{taxon['filename']} (Count: {count_str})")

def load_counts_cache(cache_path):
    """
    Loads the taxon counts from a JSON cache file.
    """
    if not os.path.exists(cache_path):
        return {}
    try:
        with open(cache_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}

def save_counts_cache(cache_path, counts):
    """
    Saves the taxon counts to a JSON cache file.
    """
    try:
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(counts, f, indent=4)
        print(f"Counts saved to {cache_path}")
    except IOError:
        print(f"Error: Could not save counts to {cache_path}")

def apply_cached_counts(node, cached_counts):
    """
    Recursively traverses the tree and applies counts from the cache.
    """
    if '__taxons__' in node:
        for taxon in node['__taxons__']:
            taxon['count'] = cached_counts.get(taxon['taxon_id'], 'N/A')

    for key, child_node in node.items():
        if key != '__taxons__' and isinstance(child_node, dict):
            apply_cached_counts(child_node, cached_counts)

def extract_counts_from_tree(node, counts=None):
    """
    Recursively traverses the tree and extracts taxon counts into a dictionary.
    """
    if counts is None:
        counts = {}

    if '__taxons__' in node:
        for taxon in node['__taxons__']:
            if 'count' in taxon:
                counts[taxon['taxon_id']] = taxon['count']

    for key, child_node in node.items():
        if key != '__taxons__' and isinstance(child_node, dict):
            extract_counts_from_tree(child_node, counts)
    
    return counts

def prune_empty_dirs(node):
    """
    Recursively removes directories that do not contain any taxons or non-empty subdirectories.
    Returns True if the node is empty after pruning, False otherwise.
    """
    # Prune children first (post-order traversal)
    child_dirs_to_remove = []
    for name, child_node in node.items():
        if name == '__taxons__':
            continue
        if prune_empty_dirs(child_node):
            child_dirs_to_remove.append(name)

    for name in child_dirs_to_remove:
        del node[name]

    # A node is empty if it has no taxons and no remaining child directories.
    has_taxons = '__taxons__' in node and node['__taxons__']
    has_children = any(k != '__taxons__' for k in node)
    
    return not has_taxons and not has_children

def clear_download_directory():
    """
    Deletes the entire download directory and recreates it.
    """
    if os.path.exists(DOWNLOAD_BASE_PATH):
        print(f"Clearing download directory: {DOWNLOAD_BASE_PATH}")
        shutil.rmtree(DOWNLOAD_BASE_PATH)
    os.makedirs(DOWNLOAD_BASE_PATH, exist_ok=True)

def get_local_count(file_path):
    """
    Counts the number of data rows in a local CSV file, excluding the header.
    Returns -1 if file not found or error.
    """
    if not os.path.exists(file_path):
        return -1
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # -1 for the header, but handle empty file
            count = sum(1 for _ in f)
            return count - 1 if count > 0 else 0
    except Exception as e:
        print(f"Error counting lines in {file_path}: {e}")
        return -1

def download_taxon_csv(taxon_id, taxon_filename, dir_path, total_count):
    """
    Downloads observation data for a taxon as a CSV file.
    Handles pagination for large datasets.
    """
    if total_count == 0:
        print(f"Skipping {taxon_filename} (0 observations).")
        return

    os.makedirs(dir_path, exist_ok=True)
    file_path = os.path.join(dir_path, f"{taxon_filename}.csv")
    
    print(f"Downloading {total_count} observations for {taxon_filename} to {file_path}...")

    base_url = "https://www.inaturalist.org/observations.csv"
    params = {
        'taxon_id': taxon_id,
        'order': 'asc',
        'order_by': 'id',
        'quality_grade': 'any',
        'identifications': 'any',
        'verifiable': 'true',
        'spam': 'false'
    }

    try:
        with requests.Session() as session:
            # Initial request to get the first page and headers
            response = session.get(base_url, params=params, timeout=60)
            response.raise_for_status()
            
            content = response.content
            if not content:
                print(f"No content returned for {taxon_filename}. Skipping.")
                return

            with open(file_path, 'wb') as f:
                f.write(content)

            # Decode for CSV reader and get last ID
            lines = content.decode('utf-8', errors='ignore').strip().split('\n')
            if len(lines) <= 1: # Only header or empty
                return

            last_row = list(csv.reader([lines[-1]]))[0]
            last_id = last_row[0]

            # Paginate if necessary
            fetched_count = len(lines) - 1
            while True:
                # Check if we might be done to avoid extra requests
                if fetched_count >= total_count:
                    break

                params['id_above'] = last_id
                response = session.get(base_url, params=params, timeout=60)
                response.raise_for_status()
                
                content = response.content
                if not content:
                    break # No more data

                # The paginated responses do not have a header in this context
                with open(file_path, 'ab') as f:
                    f.write(content)

                lines = content.decode('utf-8', errors='ignore').strip().split('\n')
                if not lines or not lines[0]:
                    break

                fetched_count += len(lines)
                last_row = list(csv.reader([lines[-1]]))[0]
                last_id = last_row[0]
                print(f"  ... fetched {fetched_count}/{total_count} for {taxon_filename}")
    
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {taxon_filename}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during download for {taxon_filename}: {e}")

def download_all_taxons(node, current_path_parts=[]):
    """
    Recursively traverses the tree and downloads a CSV for every taxon.
    """
    dir_path = os.path.join(DOWNLOAD_BASE_PATH, *current_path_parts)

    if '__taxons__' in node:
        for taxon in node['__taxons__']:
            count = taxon.get('count')
            if isinstance(count, int):
                download_taxon_csv(taxon['taxon_id'], taxon['filename'], dir_path, count)
            else:
                print(f"Skipping download for {taxon['filename']} due to invalid count: {count}. Please fetch counts first.")

    for name, child_node in node.items():
        if name != '__taxons__' and isinstance(child_node, dict):
            clean_name = clean_dir_name(name)
            download_all_taxons(child_node, current_path_parts + [clean_name])

def update_changed_taxons(node, current_path_parts=[]):
    """
    Recursively compares remote and local counts, and downloads updates.
    """
    dir_path = os.path.join(DOWNLOAD_BASE_PATH, *current_path_parts)

    if '__taxons__' in node:
        for taxon in node['__taxons__']:
            remote_count = taxon.get('count')
            if not isinstance(remote_count, int):
                print(f"Skipping update for {taxon['filename']} due to invalid remote count: {remote_count}")
                continue

            file_path = os.path.join(dir_path, f"{taxon['filename']}.csv")
            local_count = get_local_count(file_path)

            if remote_count != local_count:
                print(f"Count mismatch for {taxon['filename']}: Local={local_count}, Remote={remote_count}. Updating.")
                download_taxon_csv(taxon['taxon_id'], taxon['filename'], dir_path, remote_count)
            else:
                print(f"No changes for {taxon['filename']}. Skipping.")

    for name, child_node in node.items():
        if name != '__taxons__' and isinstance(child_node, dict):
            clean_name = clean_dir_name(name)
            update_changed_taxons(child_node, current_path_parts + [clean_name])

def compare_counts(node, current_path_parts=[]):
    """
    Recursively compares remote and local counts and prints a report.
    """
    dir_path = os.path.join(DOWNLOAD_BASE_PATH, *current_path_parts)

    if '__taxons__' in node:
        for taxon in node['__taxons__']:
            remote_count = taxon.get('count')
            if not isinstance(remote_count, int):
                print(f"Cannot compare {taxon['filename']}: Invalid remote count ({remote_count})")
                continue

            file_path = os.path.join(dir_path, f"{taxon['filename']}.csv")
            local_count = get_local_count(file_path)

            if local_count == -1:
                print(f"MISSING: {os.path.join(*current_path_parts, taxon['filename'] + '.csv')} (Remote count: {remote_count})")
            elif remote_count != local_count:
                print(f"MISMATCH: {os.path.join(*current_path_parts, taxon['filename'] + '.csv')} (Local: {local_count}, Remote: {remote_count})")
            else:
                # print(f"MATCH: {os.path.join(*current_path_parts, taxon['filename'] + '.csv')} (Count: {local_count})")
                pass # Don't print matches to reduce noise

    for name, child_node in node.items():
        if name != '__taxons__' and isinstance(child_node, dict):
            clean_name = clean_dir_name(name)
            compare_counts(child_node, current_path_parts + [clean_name])

def main():
    """
    Main function to run the script.
    """
    manifest_path = 'iNaturalist/iNaturalist-manifest.md'
    cache_path = 'iNaturalist/counts_cache.json'
    
    print(f"Parsing manifest file: {manifest_path}")
    file_tree = parse_manifest(manifest_path)
    
    prune_empty_dirs(file_tree)

    if not file_tree:
        print("No valid data with Taxon IDs found to generate a hierarchy.")
        return

    # Load and apply cached counts
    cached_counts = load_counts_cache(cache_path)
    apply_cached_counts(file_tree, cached_counts)

    while True:
        print("\n--- iNaturalist Manager ---")
        print("Current hierarchy from manifest:")
        print_tree(file_tree)
        print("\nOptions:")
        print("1. Fetch updated counts from iNaturalist API (updates cache)")
        print("2. Download all taxon data (clears existing downloads)")
        print("3. Update changed taxon data (downloads new/changed files)")
        print("4. Compare local and remote counts (updates cache)")
        print("5. Exit")
        choice = input("Enter your choice (1-5): ")

        if choice == '1':
            print("\nFetching observation counts from iNaturalist API...")
            fetch_and_update_counts(file_tree)
            new_counts = extract_counts_from_tree(file_tree)
            save_counts_cache(cache_path, new_counts)
            print("Counts cache updated.")
        
        elif choice == '2':
            print("\nDownloading all taxon data...")
            if not any(isinstance(taxon.get('count'), int) for key in file_tree for node in file_tree[key].values() if isinstance(node, dict) for taxon in node.get('__taxons__',[]) ):
                 print("Warning: No counts loaded. Fetching counts first.")
                 fetch_and_update_counts(file_tree)
                 new_counts = extract_counts_from_tree(file_tree)
                 save_counts_cache(cache_path, new_counts)

            clear_download_directory()
            download_all_taxons(file_tree)
            print("\nDownload complete.")

        elif choice == '3':
            print("\nChecking for updates...")
            fetch_and_update_counts(file_tree) # Always get latest counts before updating
            new_counts = extract_counts_from_tree(file_tree)
            save_counts_cache(cache_path, new_counts)
            
            update_changed_taxons(file_tree)
            print("\nUpdate check complete.")

        elif choice == '4':
            print("\nComparing local and remote counts...")
            fetch_and_update_counts(file_tree) # Always get latest counts for comparison
            new_counts = extract_counts_from_tree(file_tree)
            save_counts_cache(cache_path, new_counts)

            print("Comparison Report (mismatches and missing files):")
            compare_counts(file_tree)
            print("\nComparison complete.")

        elif choice == '5':
            print("Exiting.")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
