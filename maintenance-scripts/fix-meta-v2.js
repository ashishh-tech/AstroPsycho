/**
 * fix-meta-v2.js
 * Aggressively removes ALL duplicate <meta name="mobile-web-app-capable"> tags
 * even when the HTML is compressed into a single line.
 * Only keeps the FIRST occurrence.
 */
const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let totalFixed = 0;

const META_PATTERNS = [
    // Exact pattern with double quotes, self-closing or not
    /<meta\s+name="mobile-web-app-capable"\s+content="yes"\s*\/?>/g,
    // Exact pattern with single quotes
    /<meta\s+name='mobile-web-app-capable'\s+content='yes'\s*\/?>/g,
];

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    const orig = c;

    // For each pattern, keep only the FIRST match, remove all subsequent
    META_PATTERNS.forEach(pat => {
        let firstSeen = false;
        c = c.replace(pat, (match) => {
            if (!firstSeen) { firstSeen = true; return match; }
            return ''; // Remove duplicates
        });
    });

    // Also fix duplicate <meta name="description" ...> — keep FIRST
    let firstDesc = false;
    c = c.replace(/<meta\s+name="description"[^>]+>/g, (match) => {
        if (!firstDesc) { firstDesc = true; return match; }
        return '';
    });

    if (c !== orig) {
        fs.writeFileSync(f, c, 'utf8');
        totalFixed++;
        // Verify
        const remaining = (c.match(/name="mobile-web-app-capable"/g) || []).length;
        console.log(`✓ FIXED: ${f}  (now ${remaining}x mobile-web-app-capable)`);
    }
});

console.log(`\n✅ Done. Fixed ${totalFixed} files.`);
