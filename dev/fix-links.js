const fs = require('fs');

const files = ['index.html', 'results.html', 'assessment.html'];
const cwd = 'c:/Users/name/Desktop/PROJECTS/ASTRO PSYCO';

const replaceLinks = (file) => {
    let content = fs.readFileSync(`${cwd}/${file}`, 'utf8');

    // Replace href='/results?demo=1' with href='results.html?demo=1'
    content = content.replace(/href='\/results\?demo=1'/g, "href='results.html?demo=1'");
    content = content.replace(/href="\/results\?demo=1"/g, 'href="results.html?demo=1"');

    // Replace href='/' with href='index.html'
    content = content.replace(/href='\/'/g, "href='index.html'");
    content = content.replace(/href="\/"/g, 'href="index.html"');

    // Replace href='/page' with href='page.html'
    content = content.replace(/href='\/([a-zA-Z0-9-]+)'/g, "href='$1.html'");
    content = content.replace(/href="\/([a-zA-Z0-9-]+)"/g, 'href="$1.html"');

    fs.writeFileSync(`${cwd}/${file}`, content, 'utf8');
    console.log(`Fixed links in ${file}`);
};

files.forEach(replaceLinks);
