const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const seoTags = `
    <!-- Open Graph / SEO -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://ashishh-tech.github.io/ashishh-tech/">
    <meta property="og:title" content="AstroPsycho - Premium Vedic Astrology & Psychology">
    <meta property="og:description" content="Discover your cosmic blueprint with advanced Vedic astrology, AI predictions, Kundali charts, and personalized psychological birth details.">
    <meta property="og:image" content="https://ashishh-tech.github.io/ashishh-tech/krishna-universe.png">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://ashishh-tech.github.io/ashishh-tech/">
    <meta property="twitter:title" content="AstroPsycho - Premium Vedic Astrology & Psychology">
    <meta property="twitter:description" content="Discover your cosmic blueprint with advanced Vedic astrology, AI predictions, Kundali charts, and personalized psychological birth details.">
    <meta property="twitter:image" content="https://ashishh-tech.github.io/ashishh-tech/krishna-universe.png">
    <meta name="theme-color" content="#0a0a1f">
`;

let filesModified = 0;

fs.readdirSync(rootDir).forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(rootDir, file);
        let content = fs.readFileSync(filePath, 'utf-8');

        // Check if OG tags already exist to avoid duplicates
        if (!content.includes('property="og:title"')) {
            // Find a good place to inject: right before </head> or after <title>
            if (content.includes('</head>')) {
                content = content.replace('</head>', `${seoTags}\n</head>`);
                fs.writeFileSync(filePath, content, 'utf-8');
                filesModified++;
                console.log(`Injected SEO into ${file}`);
            }
        } else {
            console.log(`Skipped ${file} - OG tags already exist`);
        }
    }
});

console.log(`\n🎉 SEO Injection Complete! Modified ${filesModified} HTML files.`);
