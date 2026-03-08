const fs = require('fs');
const c = fs.readFileSync('divisional.html', 'utf8');
const s = c.lastIndexOf('<script>');
const e = c.lastIndexOf('</script>');
const script = c.substring(s + 8, e);
try {
    new Function(script);
    console.log('Script OK');
} catch (err) {
    console.log('ERROR: ' + err.message);
    // find approximate location
    const lines = script.split('\n');
    lines.forEach((line, i) => {
        try { new Function(lines.slice(0, i + 1).join('\n')); }
        catch (e2) { /* still error */ }
    });
}

// Also check ALL scripts in file
const allScripts = [];
let pos = 0;
while (true) {
    const st = c.indexOf('<script>', pos);
    if (st < 0) break;
    const en = c.indexOf('</script>', st);
    if (en < 0) break;
    allScripts.push({ start: st, code: c.substring(st + 8, en) });
    pos = en + 1;
}
console.log('Total inline scripts:', allScripts.length);
allScripts.forEach((sc, i) => {
    try {
        new Function(sc.code);
        console.log('Script ' + (i + 1) + ': OK');
    } catch (err) {
        console.log('Script ' + (i + 1) + ' ERROR: ' + err.message);
        console.log('  First 100 chars: ' + sc.code.substring(0, 100));
    }
});
