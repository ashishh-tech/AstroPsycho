import os
import glob

directory = r"c:\Users\name\Desktop\PROJECTS\ASTRO PSYCO"

# Files to patch
html_files = glob.glob(os.path.join(directory, "*.html"))

css_addition = """
        /* Force table text to stay on one line for better mobile scrolling */
        .planet-table th, .planet-table td, 
        table th, table td {
            white-space: nowrap;
        }
    </style>
"""

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already patched
    if "Force table text to stay on one line" in content:
        continue
        
    # Find the closing style tag and prepend our CSS
    if "</style>" in content:
        content = content.replace("</style>", css_addition)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched tables {os.path.basename(file_path)}")
