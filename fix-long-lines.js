/**
 * fix-long-lines.js
 * Splits long lines in <script> blocks that contain inline HTML template strings.
 * Works by splitting on semicolons and closing braces when lines exceed threshold.
 */
const fs = require('fs');
const path = require('path');
const beautify = require('js-beautify');

const dir = process.cwd();
const THRESHOLD = 500;

// Files that still have long lines after first pass
const targets = [
    'compatibility.html',
    'dasha-remedies.html',
    'education.html',
    'full-report.html',
    'kundali-calendar.html',
    'medical-astrology.html',
    'muhurta.html',
    'navamsa.html',
    'panchang.html',
    'pdf-report.html',
    'planetary-clock.html',
    'sade-sati.html',
    'varshaphala.html',
    'wealth.html'
];

targets.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Re-beautify ALL script blocks (including those with type attribute)
    content = content.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi, (match, attrs, scriptContent) => {
        // Skip external scripts with src
        if (attrs && /src\s*=/i.test(attrs)) return match;
        if (!scriptContent.trim()) return match;

        const beautified = beautify.js(scriptContent, {
            indent_size: 4,
            indent_char: ' ',
            max_preserve_newlines: 2,
            preserve_newlines: true,
            wrap_line_length: 0,
            brace_style: 'collapse',
            keep_array_indentation: false,
            break_chained_methods: true
        });
        return `<script${attrs || ''}>\n${beautified}\n</script>`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed JS blocks: ${file}`);
    } else {
        console.log(`⬛ No change: ${file}`);
    }
});

console.log('\nAll done! Run scan-minification.js to verify.');
