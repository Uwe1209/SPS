import re
import os
import json
import requests
import shutil
import csv
import time
import io
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

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
    Fetches the observation count for a given taxon ID from the iNaturalist API,
    with retries on timeout.
    """
    url = "https://api.inaturalist.org/v1/observations"
    params = {
        'quality_grade': 'any',
        'identifications': 'any',
        'place_id': 7155,
        'taxon_id': taxon_id,
        'verifiable': 'true',
        'spam': 'false'
    }
    retries = 3
    timeout = 30

    # Sleep to stay under the API rate limit (60 reqs/min).
    time.sleep(1)

    for attempt in range(retries):
        try:
            response = requests.get(url, params=params, timeout=timeout)
            response.raise_for_status()  # Raise an exception for bad status codes
            data = response.json()
            return data.get('total_results', 'N/A')
        except requests.exceptions.Timeout:
            wait_time = 2 * (attempt + 1)
            print(f"Timeout on attempt {attempt + 1}/{retries} for taxon {taxon_id}. Retrying in {wait_time}s...")
            time.sleep(wait_time)
        except requests.exceptions.RequestException as e:
            print(f"Error fetching count for taxon {taxon_id}: {e}")
            return 'Error' # For non-timeout request errors, fail immediately

    print(f"Failed to fetch count for taxon {taxon_id} after {retries} attempts.")
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

def _collect_taxons_for_update(node, taxon_list):
    if '__taxons__' in node:
        taxon_list.extend(node['__taxons__'])
    for key, child_node in node.items():
        if key != '__taxons__' and isinstance(child_node, dict):
            _collect_taxons_for_update(child_node, taxon_list)

def fetch_and_update_counts(node):
    """
    Traverses the tree, collects all taxons, and fetches their counts using 2 workers.
    """
    all_taxons = []
    _collect_taxons_for_update(node, all_taxons)
    print(f"Found {len(all_taxons)} taxons to fetch counts for.")

    def _fetch_worker(taxon):
        print(f"Fetching count for {taxon['filename']}...")
        taxon['count'] = get_observation_count(taxon['taxon_id'])
        return f"Updated {taxon['filename']}"

    with ThreadPoolExecutor(max_workers=1) as executor:
        futures = [executor.submit(_fetch_worker, taxon) for taxon in all_taxons]
        for future in futures:
            try:
                future.result()
            except Exception as e:
                print(f"A fetch worker failed: {e}")

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
    Loads the taxon counts and last updated timestamp from a JSON cache file.
    """
    if not os.path.exists(cache_path):
        return {}, None
    try:
        with open(cache_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict) and 'counts' in data:
                # New format with metadata
                return data.get('counts', {}), data.get('last_updated')
            else:
                # Old format (just a dictionary of counts)
                return data, None
    except (json.JSONDecodeError, IOError):
        return {}, None

def save_counts_cache(cache_path, counts):
    """
    Saves the taxon counts and the current timestamp to a JSON cache file.
    """
    cache_data = {
        'last_updated': datetime.now().isoformat(),
        'counts': counts
    }
    try:
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, indent=4)
        print(f"Counts saved to {cache_path}")
        return cache_data['last_updated']
    except IOError:
        print(f"Error: Could not save counts to {cache_path}")
        return None

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

def has_any_integer_counts(node):
    """
    Recursively checks if any taxon in the tree has an integer count.
    """
    if '__taxons__' in node:
        if any(isinstance(taxon.get('count'), int) for taxon in node['__taxons__']):
            return True

    for key, child_node in node.items():
        if key != '__taxons__' and isinstance(child_node, dict):
            if has_any_integer_counts(child_node):
                return True
    
    return False

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
    Handles pagination for large datasets by fetching all observations.
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
        'place_id': 7155,
        'order': 'asc',
        'order_by': 'id',
        'quality_grade': 'any',
        'identifications': 'any',
        'verifiable': 'true',
        'spam': 'false',
        'per_page': 200
    }

    try:
        with requests.Session() as session:
            time.sleep(1) # Rate limit
            # Initial request to get the first page and headers
            response = session.get(base_url, params=params, timeout=60)
            response.raise_for_status()
            
            content = response.content
            if not content.strip():
                print(f"No content returned for {taxon_filename}. Skipping.")
                return

            # Get header to check against subsequent pages
            header_line = content.split(b'\n', 1)[0]

            with open(file_path, 'wb') as f:
                f.write(content)

            decoded_content = content.decode('utf-8', errors='ignore').strip()
            rows = list(csv.reader(decoded_content.splitlines()))

            if len(rows) <= 1: # Only header or empty
                return

            data_rows = rows[1:]
            fetched_count = len(data_rows)
            print(f"  ... fetched {fetched_count}/{total_count} for {taxon_filename}")

            page = 2
            while fetched_count < total_count:
                params['page'] = page
                time.sleep(1) # Rate limit
                response = session.get(base_url, params=params, timeout=60)
                response.raise_for_status()
                
                content = response.content
                if not content.strip():
                    break # No more data

                content_to_append = content
                # The first page has a header. Subsequent pages from the API
                # are not supposed to, but we will check and remove it if present.
                if content.startswith(header_line):
                    first_newline = content.find(b'\n')
                    if first_newline != -1:
                        content_to_append = content[first_newline+1:]
                    else:
                        # Content is only a header line, so we are done.
                        break
                
                if not content_to_append.strip():
                    break

                # Append the data rows to the file.
                with open(file_path, 'ab') as f:
                    f.write(content_to_append)

                # Update the count of fetched rows.
                decoded_content = content_to_append.decode('utf-8', errors='ignore').strip()
                if not decoded_content:
                    break

                rows = list(csv.reader(decoded_content.splitlines()))
                if not rows:
                    break

                fetched_count += len(rows)
                print(f"  ... fetched {fetched_count}/{total_count} for {taxon_filename}")
                page += 1
    
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {taxon_filename}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during download for {taxon_filename}: {e}")

def _collect_download_tasks(node, tasks, current_path_parts=[]):
    dir_path = os.path.join(DOWNLOAD_BASE_PATH, *current_path_parts)
    if '__taxons__' in node:
        for taxon in node['__taxons__']:
            count = taxon.get('count')
            if isinstance(count, int):
                tasks.append((taxon['taxon_id'], taxon['filename'], dir_path, count))
            else:
                print(f"Skipping download for {taxon['filename']} due to invalid count: {count}. Please fetch counts first.")
    
    for name, child_node in node.items():
        if name != '__taxons__' and isinstance(child_node, dict):
            clean_name = clean_dir_name(name)
            _collect_download_tasks(child_node, tasks, current_path_parts + [clean_name])

def download_all_taxons(node):
    """
    Traverses the tree, collects all download tasks, and executes them using 2 workers.
    """
    tasks = []
    _collect_download_tasks(node, tasks)
    print(f"Found {len(tasks)} taxons to download.")

    with ThreadPoolExecutor(max_workers=1) as executor:
        futures = [executor.submit(download_taxon_csv, *task) for task in tasks]
        for future in futures:
            try:
                future.result()
            except Exception as e:
                print(f"A download worker failed: {e}")

def _collect_update_tasks(node, tasks, current_path_parts=[]):
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
                print(f"Count mismatch for {taxon['filename']}: Local={local_count}, Remote={remote_count}. Queuing update.")
                tasks.append((taxon['taxon_id'], taxon['filename'], dir_path, remote_count))
            else:
                # This can be noisy, so we'll skip printing for matches.
                pass

    for name, child_node in node.items():
        if name != '__taxons__' and isinstance(child_node, dict):
            clean_name = clean_dir_name(name)
            _collect_update_tasks(child_node, tasks, current_path_parts + [clean_name])

def update_changed_taxons(node):
    """
    Traverses the tree, collects required updates, and downloads them using 2 workers.
    """
    tasks = []
    _collect_update_tasks(node, tasks)
    
    if not tasks:
        print("All local files are up to date.")
        return

    print(f"Found {len(tasks)} taxons to update.")
    with ThreadPoolExecutor(max_workers=1) as executor:
        futures = [executor.submit(download_taxon_csv, *task) for task in tasks]
        for future in futures:
            try:
                future.result()
            except Exception as e:
                print(f"An update worker failed: {e}")

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
    cached_counts, last_updated = load_counts_cache(cache_path)
    apply_cached_counts(file_tree, cached_counts)

    while True:
        print("\n--- iNaturalist Manager ---")
        if last_updated:
            print(f"Cache last updated: {last_updated}")
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
            updated_at = save_counts_cache(cache_path, new_counts)
            if updated_at:
                last_updated = updated_at
            print("Counts cache updated.")
        
        elif choice == '2':
            print("\nDownloading all taxon data...")
            if not has_any_integer_counts(file_tree):
                 print("Warning: No counts loaded. Fetching counts first.")
                 fetch_and_update_counts(file_tree)
                 new_counts = extract_counts_from_tree(file_tree)
                 updated_at = save_counts_cache(cache_path, new_counts)
                 if updated_at:
                    last_updated = updated_at

            clear_download_directory()
            download_all_taxons(file_tree)
            print("\nDownload complete.")

        elif choice == '3':
            print("\nChecking for updates...")
            fetch_and_update_counts(file_tree) # Always get latest counts before updating
            new_counts = extract_counts_from_tree(file_tree)
            updated_at = save_counts_cache(cache_path, new_counts)
            if updated_at:
                last_updated = updated_at
            
            update_changed_taxons(file_tree)
            print("\nUpdate check complete.")

        elif choice == '4':
            print("\nComparing local and cached counts...")
            if not has_any_integer_counts(file_tree):
                print("Warning: No counts loaded from cache. Please use option '1' to fetch counts first.")
            else:
                print("Comparison Report (mismatches and missing files based on cached counts):")
                compare_counts(file_tree)
                print("\nComparison complete.")

        elif choice == '5':
            print("Exiting.")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
