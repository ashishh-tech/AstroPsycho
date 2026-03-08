const fs = require('fs');
const path = require('path');
const beautify = require('js-beautify');

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const LONG_LINE_THRESHOLD = 500;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const originalContent = content;

    // Find all <script>...</script> blocks and beautify their JS content
    content = content.replace(/<script>([\s\S]*?)<\/script>/gi, (match, scriptContent) => {
        // Only beautify if there are any long lines inside
        const hasLongLines = scriptContent.split('\n').some(l => l.length > LONG_LINE_THRESHOLD);
        if (!hasLongLines) return match;

        const beautified = beautify.js(scriptContent, {
            indent_size: 4,
            indent_char: ' ',
            max_preserve_newlines: 2,
            preserve_newlines: true,
            wrap_line_length: 0
        });
        return `<script>\n${beautified}\n</script>`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${file}`);
    } else {
        console.log(`⬛ No change: ${file}`);
    }
});
