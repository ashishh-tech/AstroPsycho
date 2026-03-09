const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const LONG_LINE_THRESHOLD = 500; // lines longer than this are likely minified

const results = [];

files.forEach(file => {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const longLines = [];
    lines.forEach((line, idx) => {
        if (line.length > LONG_LINE_THRESHOLD) {
            longLines.push({ lineNum: idx + 1, length: line.length });
        }
    });
    
    if (longLines.length > 0) {
        results.push({ file, longLines });
    }
});

if (results.length === 0) {
    console.log('✅ No minification issues found in any HTML file!');
} else {
    console.log('⚠️  Files with long lines (possible minification):\n');
    results.forEach(r => {
        console.log(`📄 ${r.file}`);
        r.longLines.forEach(l => {
            console.log(`   Line ${l.lineNum}: ${l.length} characters`);
        });
        console.log('');
    });
}
