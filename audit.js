const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const issues = [];

files.forEach(f => {
    const c = fs.readFileSync(f, 'utf8');
    const fileIssues = [];

    // 1. Duplicate mobile-web-app-capable meta
    const dupCount = (c.match(/mobile-web-app-capable/g) || []).length;
    if (dupCount > 1) fileIssues.push('duplicate mobile-web-app-capable meta tag (' + dupCount + 'x)');

    // 2. Duplicate description meta  
    const descCount = (c.match(/name="description"/g) || []).length;
    if (descCount > 1) fileIssues.push('duplicate description meta (' + descCount + 'x)');

    // 3. Missing closing tags
    const openScript = (c.match(/<script/g) || []).length;
    const closeScript = (c.match(/<\/script>/g) || []).length;
    if (openScript !== closeScript) fileIssues.push('mismatched script tags: ' + openScript + ' open, ' + closeScript + ' close');

    // 4. Any remaining encoding garbage
    if (/ΓÇö|≡ƒ|∩╕Å/.test(c)) fileIssues.push('still has encoding garbage!');

    if (fileIssues.length > 0) {
        console.log('ISSUES in ' + f + ':');
        fileIssues.forEach(i => console.log('  - ' + i));
        issues.push(f);
    }
});

console.log('\n' + (issues.length === 0 ? '✅ All HTML files clean!' : '⚠️ Found issues in ' + issues.length + ' files'));
