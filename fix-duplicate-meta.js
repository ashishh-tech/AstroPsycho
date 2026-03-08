/**
 * fix-duplicate-meta.js
 * Removes duplicate meta tags from all HTML files:
 * - mobile-web-app-capable (keep only 1)
 * - description (keep only first one)
 */
const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let totalFixed = 0;

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    const orig = c;

    // Fix duplicate: <meta name="mobile-web-app-capable" content="yes">
    // Keep only the first occurrence, remove extras
    let firstFound = false;
    c = c.replace(/<meta\s+name="mobile-web-app-capable"\s+content="yes">/g, (match) => {
        if (!firstFound) { firstFound = true; return match; }
        return ''; // Remove duplicates
    });

    // Also handle the alternate form with spaces/newlines
    firstFound = false;
    c = c.replace(/<meta\s+name='mobile-web-app-capable'\s+content='yes'>/g, (match) => {
        if (!firstFound) { firstFound = true; return match; }
        return '';
    });

    // Fix duplicate description meta — keep only the LAST (most specific) one
    const descMatches = [...c.matchAll(/<meta\s+name="description"\s+content="[^"]*">/g)];
    if (descMatches.length > 1) {
        // Remove all but the last one
        let removeCount = descMatches.length - 1;
        c = c.replace(/<meta\s+name="description"\s+content="[^"]*">/g, (match) => {
            if (removeCount > 0) { removeCount--; return ''; }
            return match;
        });
    }
    // Also fix multiline description meta
    const descMatchesML = [...c.matchAll(/<meta\s+name="description"\s*\n\s+content="[^"]*">/g)];
    if (descMatchesML.length > 1) {
        let removeCount = descMatchesML.length - 1;
        c = c.replace(/<meta\s+name="description"\s*\n\s+content="[^"]*">/g, (match) => {
            if (removeCount > 0) { removeCount--; return ''; }
            return match;
        });
    }

    // Clean up any double line breaks left from removal
    c = c.replace(/\n{3,}/g, '\n\n');
    c = c.replace(/  +\n/g, '\n'); // trailing spaces on empty lines

    if (c !== orig) {
        fs.writeFileSync(f, c, 'utf8');
        totalFixed++;
        const dupsBefore = (orig.match(/mobile-web-app-capable/g) || []).length;
        const dupsAfter = (c.match(/mobile-web-app-capable/g) || []).length;
        console.log(`✓ FIXED: ${f}  (mobile-web-app meta: ${dupsBefore}→${dupsAfter})`);
    }
});

console.log(`\n✅ Done. Fixed ${totalFixed} files.`);
