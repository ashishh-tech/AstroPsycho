const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERR:', err.message));

        // Use the live Netlify site
        console.log('Navigating to live site...');
        await page.goto('https://astro-psyco.netlify.app/assessment.html', { waitUntil: 'networkidle0' });

        console.log('Clicking skip...');
        await page.evaluate(() => window.skipAssessment());

        await page.waitForSelector('#fullName', { visible: true });

        console.log('Filling form...');
        await page.type('#fullName', 'Test User');
        await page.type('#birthDate', '1990-01-01');
        await page.type('#birthTime', '12:00');
        await page.type('#birthPlace', 'Mumbai');

        console.log('Submitting form...');
        await page.click('button[type="submit"]');

        await new Promise(r => setTimeout(r, 4000));

        console.log('Final URL:', page.url());

        await browser.close();
    } catch (e) {
        console.error('Test Script Error:', e.message);
        process.exit(1);
    }
})();
