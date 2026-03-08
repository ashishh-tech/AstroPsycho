const fs = require('fs');
const c = fs.readFileSync('divisional.html', 'utf8');

// Find all scripts properly
let pos = 0;
let idx = 1;
while (true) {
    const st = c.indexOf('<script', pos);
    if (st < 0) break;
    const tagEnd = c.indexOf('>', st);
    const openTag = c.substring(st, tagEnd + 1);
    const scriptClose = c.indexOf('</script>', tagEnd);
    const body = c.substring(tagEnd + 1, scriptClose);

    if (!openTag.includes('src=')) {
        console.log(`Script ${idx} (inline) at ${st}, body length: ${body.length}`);
        try {
            new Function(body);
            console.log('  -> OK ✅');
        } catch (e) {
            console.log('  -> ERROR: ' + e.message);
            const lt = body.indexOf('<');
            if (lt >= 0) console.log('  First < at pos ' + lt + ': ' + JSON.stringify(body.substring(lt - 10, lt + 30)));
        }
    } else {
        console.log(`Script ${idx} (external): src="${openTag.match(/src="([^"]+)"/)?.[1]}"`);
    }

    pos = scriptClose + 9;
    idx++;
}
