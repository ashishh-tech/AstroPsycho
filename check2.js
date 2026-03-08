const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let issues = 0;
files.forEach(f => {
    const c = fs.readFileSync(f, 'utf8');
    // Count ONLY exact name="mobile-web-app-capable" NOT apple-mobile-
    const parts = c.split('name="mobile-web-app-capable"');
    const count = parts.length - 1;
    if (count > 1) {
        console.log('REAL DUPE in ' + f + ': ' + count + 'x');
        issues++;
    }
});
if (issues === 0) console.log('All files clean!');
else console.log(issues + ' files still have duplicate mobile-web-app-capable');
