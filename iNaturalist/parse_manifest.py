import re
import os

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
                            
                            taxons.append(f"{taxon_id}-{file_name}")
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

def print_tree(node, prefix=""):
    """
    Recursively prints the file tree structure to the console.
    """
    # Separate directories from taxon "files".
    dirs = {k: v for k, v in node.items() if k != '__taxons__'}
    taxons = node.get('__taxons__', [])

    dir_items = sorted(dirs.items())
    taxon_items = sorted(taxons)
    
    total_items = len(dir_items) + len(taxon_items)
    count = 0

    # Print directories first.
    for name, child_node in dir_items:
        count += 1
        is_last = count == total_items
        connector = "└── " if is_last else "├── "
        print(f"{prefix}{connector}{name}")
        
        new_prefix = prefix + ("    " if is_last else "│   ")
        print_tree(child_node, new_prefix)

    # Then print taxons.
    for taxon in taxon_items:
        count += 1
        is_last = count == total_items
        connector = "└── " if is_last else "├── "
        print(f"{prefix}{connector}{taxon}")

def main():
    """
    Main function to run the script.
    """
    manifest_path = 'iNaturalist/iNaturalist-manifest.md'
    print(f"Parsing manifest file: {manifest_path}\n")
    file_tree = parse_manifest(manifest_path)
    
    if file_tree:
        print("Generated directory and file hierarchy:")
        print_tree(file_tree)
    else:
        print("No valid data with Taxon IDs found to generate a hierarchy.")

if __name__ == "__main__":
    main()
