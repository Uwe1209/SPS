import re
import os
import requests
from datetime import datetime

def slugify(text):
    """
    Converts a heading string into a file-system-friendly name.
    e.g., "1.1. My Heading" -> "My-Heading"
    """
    # Remove leading list-like numbering (e.g., "1.", "1.1.", "1.1.1.")
    text = re.sub(r'^\d+(\.\d+)*\.\s*', '', text.strip())
    # Replace spaces with dashes
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
                title = slugify(match.group(2))
                raw_title = match.group(2)

                # Only process headings that are not explicitly "Not found", "Unclear", etc.
                if not any(keyword in raw_title for keyword in ["Not found", "No results found", "Unclear"]):
                    # Adjust the path stack to the correct parent level.
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
        print(f"{prefix}{connector}{name} (Count: {taxon_count})")
        
        new_prefix = prefix + ("    " if is_last else "│   ")
        print_tree(child_node, new_prefix)

    # Then print taxons.
    for taxon in taxon_items:
        count += 1
        is_last = count == total_items
        connector = "└── " if is_last else "├── "
        count_str = taxon.get('count', 'N/A')
        print(f"{prefix}{connector}{taxon['filename']} (Count: {count_str})")

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

def main():
    """
    Main function to run the script.
    """
    manifest_path = 'iNaturalist/iNaturalist-manifest.md'
    print(f"Parsing manifest file: {manifest_path}")
    file_tree = parse_manifest(manifest_path)
    
    prune_empty_dirs(file_tree)

    if file_tree:
        print("Fetching observation counts from iNaturalist API...")
        fetch_and_update_counts(file_tree)
        print("\nGenerated directory and file hierarchy:")
        print_tree(file_tree)
    else:
        print("No valid data with Taxon IDs found to generate a hierarchy.")

if __name__ == "__main__":
    main()
