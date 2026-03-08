const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer test...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const errors = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console Error: ${msg.text()} at ${msg.location().url}:${msg.location().lineNumber}`);
        }
    });

    page.on('pageerror', error => {
        errors.push(`Page Error: ${error.message}\nStack: ${error.stack}`);
    });

    page.on('requestfailed', request => {
        errors.push(`Request failed: ${request.url()} - ${request.failure().errorText}`);
    });

    const testUserData = {
        birthDetails: {
            fullName: "Puppeteer Test",
            birthDate: "1995-05-15",
            birthTime: "14:30",
            birthPlace: "Mumbai",
            latitude: 19.0760,
            longitude: 72.8777,
            timezone: 5.5,
            gender: "male"
        },
        responses: {
            "Anxiety": 3,
            "Depression": 1,
            "Stress": 4
        },
        timestamp: new Date().toISOString()
    };

    console.log("Setting up localStorage on localhost...");
    await page.goto('http://localhost:8000/');
    await page.evaluate((data) => {
        localStorage.setItem('astropsycho_assessment', JSON.stringify(data));
    }, testUserData);

    const pagesToTest = [
        'results.html',
        'career.html',
        'transit.html',
        'medical.html',
        'marriage.html',
        'muhurta.html',
        'prasna.html',
        'conjunctions.html',
        'shadbala.html',
        'divisional.html',
        'varshaphala.html',
        'full-report.html'
    ];

    for (const p of pagesToTest) {
        console.log(`\nTesting ${p}...`);
        await page.goto(`http://localhost:8000/${p}`, { waitUntil: 'networkidle0', timeout: 30000 }).catch(e => {
            console.log(`Navigation timeout on ${p}: ${e.message}`);
        });

        // Wait a bit for async rendering
        await new Promise(r => setTimeout(r, 2000));

        if (errors.length > 0) {
            console.log(`❌ Errors found on ${p}:`);
            errors.forEach(e => console.log(`   ${e}`));
            errors.length = 0; // Clear for next page
        } else {
            console.log(`✅ No errors on ${p}`);
        }
    }

    await browser.close();
    console.log("\nDone.");
})();
