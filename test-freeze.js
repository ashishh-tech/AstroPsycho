const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Basic static server
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    // Strip query strings
    filePath = filePath.split('?')[0];

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.svg': contentType = 'image/svg+xml'; break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('File not found', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(3002, async () => {
    console.log('Server running on 3002');

    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

        console.log('Navigating to assessment.html');
        await page.goto('http://localhost:3002/assessment.html', { waitUntil: 'networkidle0' });

        console.log('Clicking skip...');
        await page.evaluate(() => window.skipAssessment());

        // Wait for step 2 to be visible
        await page.waitForSelector('#fullName', { visible: true });

        console.log('Filling form...');
        await page.type('#fullName', 'Test User');
        await page.type('#birthDate', '1990-01-01');
        await page.type('#birthTime', '12:00');
        await page.type('#birthPlace', 'Mumbai');

        // Give time for debounce and autocorrect to happen
        await new Promise(r => setTimeout(r, 1000));

        // Select first suggestion if it appears
        const suggestionVisible = await page.evaluate(() => {
            const el = document.querySelector('.suggestion-item');
            if (el && el.offsetParent !== null) {
                el.click();
                return true;
            }
            return false;
        });

        console.log('Suggestion selected:', suggestionVisible);

        console.log('Submitting form...');
        await page.click('button[type="submit"]');

        // Wait up to 5 seconds to see what happens
        await new Promise(r => setTimeout(r, 5000));

        // Check current URL (should be results.html if passed)
        const currentUrl = page.url();
        console.log('Final URL:', currentUrl);

        // Read LocalStorage
        const storage = await page.evaluate(() => localStorage.getItem('astropsycho_assessment'));
        console.log('LocalStorage Data saved:', storage ? 'YES (Length: ' + storage.length + ')' : 'NO');

        await browser.close();
        server.close();
    } catch (e) {
        console.error('Test Script Error:', e);
        server.close();
    }
});
