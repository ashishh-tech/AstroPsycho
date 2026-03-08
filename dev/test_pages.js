const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const htmlFiles = [
    'results.html',
    'career-prediction.html',
    'compatibility.html',
    'conjunctions.html',
    'dasha-timeline.html',
    'divisional.html',
    'full-report.html',
    'house-details.html',
    'kundali-calendar.html',
    'marriage-analysis.html',
    'medical-astrology.html',
    'moon-analysis.html',
    'muhurta.html',
    'navamsa.html',
    'negative-yogas.html',
    'positive-yogas.html',
    'prasna.html',
    'sade-sati.html',
    'saturn-analysis.html',
    'shadbala.html',
    'transit-tracker.html',
    'varshaphala.html'
];

async function scanPages() {
    for (const file of htmlFiles) {
        console.log(`\nScanning ${file}...`);

        const html = fs.readFileSync(path.join(__dirname, file), "utf8");

        let localErrors = [];

        const virtualConsole = new (require("jsdom").VirtualConsole)();
        virtualConsole.on("error", (err) => {
            if (err && err.message) {
                if (err.message.includes("Not implemented:")) return;
                localErrors.push(err.message);
            } else {
                localErrors.push(String(err));
            }
        });
        virtualConsole.on("jsdomError", (err) => {
            if (err && err.message && err.message.includes("Not implemented:")) return;
            localErrors.push(err.message || String(err));
        });

        const dom = new JSDOM(html, {
            runScripts: "dangerously",
            resources: "usable",
            url: "http://localhost:8000/" + file,
            virtualConsole,
            beforeParse(window) {
                window.fetch = async (url) => {
                    if (url.includes('data/')) {
                        // Handle relative routes
                        const relativeUrl = url.replace('http://localhost:8000/', '');
                        const filepath = path.join(__dirname, relativeUrl);
                        if (fs.existsSync(filepath)) {
                            return {
                                ok: true,
                                json: async () => JSON.parse(fs.readFileSync(filepath, 'utf8'))
                            };
                        }
                    }
                    return { ok: false, json: async () => ({}) };
                };

                window.alert = () => { };
                window.scrollTo = () => { };

                const storage = {
                    astropsycho_assessment: JSON.stringify({
                        birthDetails: { fullName: "Test", birthDate: "1990-01-01", birthTime: "12:00", latitude: 20, longitude: 80, timezone: 5.5 },
                        responses: {},
                        timestamp: new Date().toISOString()
                    })
                };

                window.localStorage = {
                    getItem: (key) => storage[key] || null,
                    setItem: (key, val) => { storage[key] = val; },
                    removeItem: (key) => { delete storage[key]; }
                };
            }
        });

        // let scripts execute
        await new Promise(r => setTimeout(r, 2000));

        if (localErrors.length > 0) {
            console.log(`❌ ${file} has errors:`);
            localErrors.forEach(e => console.log(e));
        } else {
            console.log(`✅ ${file} looks clean!`);
        }
    }
}

scanPages();
