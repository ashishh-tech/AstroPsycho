/**
 * fix-meta-v3.js - simple string-based deduplication using indexOf/split approach
 */
const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let totalFixed = 0;

// The exact string to search for
const NEEDLE = 'name="mobile-web-app-capable" content="yes">';

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    const orig = c;

    // Count occurrences
    const count = c.split(NEEDLE).length - 1;
    if (count <= 1) return; // Nothing to fix

    // Keep only the FIRST occurrence, remove all others
    // Strategy: split on needle, rejoin with needle only between first two parts
    const parts = c.split(NEEDLE);
    // parts[0] + NEEDLE + parts[1] + '' + parts[2] + '' + ...
    // First, reconstruct with all needles
    // Then, remove needles from index 2 onwards (the duplicates)
    // Actually: parts[0] has content BEFORE first NEEDLE
    // We want: parts[0] + NEEDLE + parts.slice(1).join('') 
    c = parts[0] + NEEDLE + parts.slice(1).join('');

    if (c !== orig) {
        fs.writeFileSync(f, c, 'utf8');
        totalFixed++;
        const remaining = c.split(NEEDLE).length - 1;
        console.log(`✓ FIXED: ${f}  (was ${count}x, now ${remaining}x)`);
    }
});

console.log(`\n✅ Done. Fixed ${totalFixed} files.`);
