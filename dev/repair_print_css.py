import sys
import os

filepath = 'styles.css'
if not os.path.exists(filepath):
    print(f'Error: {filepath} not found')
    sys.exit(1)

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '/* ==================================='
replacement = """/* ===================================
   Print Optimization
   =================================== */
@media print {
    * {
        color: #000 !important;
        background: transparent !important;
        box-shadow: none !important;
        text-shadow: none !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .cosmic-bg, .stars, .stars2, .stars3, .site-header, .site-footer, 
    .button-group, .chart-selector, .nav-card, .cta-button, .btn {
        display: none !important;
    }

    body {
        background: white !important;
        color: #000 !important;
        margin: 0;
        padding: 10mm;
        font-family: 'Inter', sans-serif;
        font-size: 11pt;
    }

    .container {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .report-section, .dasha-timeline, .remedy-section {
        display: block !important;
        background: white !important;
        border: 1px solid #ddd !important;
        padding: 1.5rem !important;
        margin-bottom: 2rem !important;
        page-break-inside: avoid;
    }

    .section-title, h1, h2, h3, h4 {
        color: #000 !important;
        margin-top: 0 !important;
        border-bottom: 2px solid #000 !important;
        padding-bottom: 5px;
    }

    .astro-table {
        width: 100% !important;
        border-collapse: collapse !important;
    }

    .astro-table th, .astro-table td {
        border: 1px solid #000 !important;
        padding: 8px !important;
        text-align: left !important;
    }

    .chart-container {
        border: 2px solid #000 !important;
        padding: 10px !important;
        margin: 10px 0 !important;
        background: white !important;
    }

    .chart-container svg {
        filter: contrast(2) brightness(0.6) !important;
        max-width: 350px !important;
        height: auto !important;
    }
    
    .chart-container svg line, .chart-container svg path {
        stroke: #000 !important;
        stroke-width: 2px !important;
    }

    /* Keep Signature High Visibility */
    .print-branding-footer {
        display: block !important;
        position: fixed;
        bottom: 5mm;
        right: 15mm;
        font-family: 'Dancing Script', cursive !important;
        font-size: 2rem !important;
        color: #000 !important;
        text-align: right;
        opacity: 1 !important;
        z-index: 99999;
        font-weight: bold;
        border-top: 1px solid #000;
        padding-top: 5px;
    }
}

/* Base style for branding footer (hidden by default) */
.print-branding-footer {
    display: none;
    font-family: 'Dancing Script', cursive;
}

.calligraphy-text {
    font-family: 'Dancing Script', cursive;
}
"""

start_idx = content.rfind(start_marker)

if start_idx != -1:
    new_content = content[:start_idx] + replacement
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Successfully updated {filepath}')
else:
    print('Error: Could not find print optimization marker')
    sys.exit(1)

