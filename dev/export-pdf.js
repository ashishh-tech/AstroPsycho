const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer PDF export test...");

    // Launch browser
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set a large viewport for accurate rendering before print
    await page.setViewport({ width: 1200, height: 1600 });

    const testUserData = {
        birthDetails: {
            fullName: "Massive PDF Test User",
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
            "Stress": 4,
            "Creativity": 5,
            "Logic": 3
        },
        timestamp: new Date().toISOString()
    };

    console.log("Injecting test data into localStorage...");
    await page.goto('http://localhost:8000/');
    await page.evaluate((data) => {
        localStorage.setItem('astropsycho_assessment', JSON.stringify(data));
    }, testUserData);

    console.log("Navigating to full-report.html...");
    // Go to the full report page and wait for network to be idle (charts drawn)
    await page.goto('http://localhost:8000/full-report.html', {
        waitUntil: 'networkidle0',
        timeout: 60000
    });

    console.log("Waiting additional 5 seconds for slow canvas processing...");
    await new Promise(r => setTimeout(r, 5000));

    // Wait for generation to complete (by checking for a specific element or just a long timeout)
    console.log('Waiting for astrological engines to finish massive calculations and DOM injection...');
    // We injected giant multi-page loops, so we must wait significantly 
    await new Promise(r => setTimeout(r, 15000));

    // Wait specifically for JS to stop adding items to the massive containers
    await page.waitForSelector('#fr-career', { visible: true, timeout: 60000 });
    await page.waitForSelector('#fr-ashtak', { visible: true, timeout: 60000 });

    // Scroll down periodically to trigger any lazy processing or give paint time
    console.log('Forcing full page repaint for slow canvas processing...');
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(r => setTimeout(r, 5000));
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });

    console.log('Waiting additional 10 seconds for layout shifts to settle...');
    await new Promise(r => setTimeout(r, 10000));

    console.log('Exporting massively expanded PDF...');

    await page.pdf({
        path: 'premium-full-report.pdf',
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            bottom: '20mm',
            left: '15mm',
            right: '15mm'
        }
    });

    console.log("✅ PDF successfully generated: premium-full-report.pdf");
    await browser.close();
})();
