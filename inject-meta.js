const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const metaTag = `\n    <meta name="description" content="AstroPsycho: The premier Vedic astrology engine combining precise planetary calculations with deep psychological insights.">
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="icon" type="image/png" href="favicon.png">`;

files.forEach(f => {
    let html = fs.readFileSync(f, 'utf8');
    let dirty = false;

    // Some corrupted HTML files have spaces/newlines inside the head tag.
    // Replace <head> taking into account white spaces if any
    if (!html.includes('name="description"')) {
        let headMatch = html.match(/<head[^>]*>/i);
        if (headMatch) {
            html = html.replace(headMatch[0], headMatch[0] + metaTag);
            dirty = true;
        }
    }

    // Also attach correct favicon paths for deeper pages if needed, but they are all in root.
    if (dirty) {
        fs.writeFileSync(f, html, 'utf8');
        console.log('Updated ' + f);
    }
});
console.log('Done.');
