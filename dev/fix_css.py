import os
import glob

directory = r"c:\Users\name\Desktop\PROJECTS\ASTRO PSYCO"

# Files to patch
html_files = glob.glob(os.path.join(directory, "*.html"))

css_addition = """
        /* Prevent CSS grid blowout on mobile */
        .varga-layout > div,
        .varsha-grid > div,
        .navamsa-grid > div,
        .charts-grid > div,
        .report-section,
        .dignity-grid > div,
        .irow > div,
        .table-responsive {
            min-width: 0 !important;
        }
    </style>
"""

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already patched
    if "Prevent CSS grid blowout" in content:
        continue
        
    # Find the closing style tag and prepend our CSS
    if "</style>" in content:
        content = content.replace("</style>", css_addition)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {os.path.basename(file_path)}")
