const fs = require('fs');
const c = fs.readFileSync('divisional.html', 'utf8');

// Find all script tag positions
let pos = 0;
let idx = 0;
while (true) {
    const st = c.indexOf('<script', pos);
    if (st < 0) break;
    const tagEnd = c.indexOf('>', st);
    const tagContent = c.substring(st, tagEnd + 1);
    const isSrc = tagContent.includes('src=');

    if (!isSrc) {
        // Inline script — find its closing tag
        const closePos = c.indexOf('</script>', st);
        const scriptContent = c.substring(tagEnd + 1, closePos);
        console.log(`Inline script at pos ${st}, length ${scriptContent.length}`);
        console.log('  Start: ' + JSON.stringify(scriptContent.substring(0, 80)));
        console.log('  End: ' + JSON.stringify(scriptContent.substring(scriptContent.length - 80)));
        try {
            new Function(scriptContent);
            console.log('  -> VALID JS');
        } catch (e) {
            console.log('  -> ERROR: ' + e.message);
            // Find problematic character
            const ltIdx = scriptContent.indexOf('<');
            if (ltIdx >= 0) {
                console.log('  Found < at position ' + ltIdx + ':');
                console.log('  Context: ' + JSON.stringify(scriptContent.substring(ltIdx - 30, ltIdx + 50)));
            }
        }
        pos = closePos + 9;
    } else {
        console.log(`External script at pos ${st}: ${tagContent}`);
        const closePos = c.indexOf('</script>', st);
        pos = closePos + 9;
    }
    idx++;
    if (idx > 20) break; // Safety
}
