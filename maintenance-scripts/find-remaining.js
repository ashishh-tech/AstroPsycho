/**
 * find-remaining.js - finds all remaining corrupted emoji patterns with context
 */
const fs = require('fs');
const files = ['index.html', 'dasha-remedies.html', 'education.html', 'panchang.html', 'planetary-clock.html', 'wealth.html'];
const allPatterns = {};
files.forEach(f => {
    const c = fs.readFileSync(f, 'utf8');
    let i = 0;
    while (true) {
        const idx = c.indexOf('≡ƒ', i);
        if (idx < 0) break;
        const key = c.substring(idx, idx + 5);
        if (!allPatterns[key]) {
            allPatterns[key] = {
                file: f,
                before: c.substring(Math.max(0, idx - 30), idx),
                after: c.substring(idx + 5, idx + 35)
            };
        }
        i = idx + 2;
    }
});
Object.entries(allPatterns).forEach(([k, v]) => {
    console.log('KEY: ' + JSON.stringify(k));
    console.log('  FILE: ' + v.file);
    console.log('  BEFORE: ...' + v.before.replace(/\n/g, ' ').slice(-40));
    console.log('  AFTER:  ' + v.after.replace(/\n/g, ' ').substring(0, 40) + '...');
    console.log('');
});
