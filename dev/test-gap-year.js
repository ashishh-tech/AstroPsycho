const fs = require('fs');

try {
    const engSrc = fs.readFileSync('js/astrology-engine-v8.js', 'utf8');
    const eduSrc = fs.readFileSync('js/education-engine.js', 'utf8');

    eval(engSrc);
    eval(eduSrc);

    // Using an example user chart that might represent the gap year issue
    const birthDetails = {
        fullName: 'Test User',
        birthDate: '2001-05-15', // adjust this date as needed physically
        birthTime: '12:00',
        latitude: 28.61,
        longitude: 77.20,
        timezone: 5.5
    };

    const baseEng = new VedicAstrologyEngine();
    const chart = baseEng.calculateBirthChart(birthDetails);

    const eduEng = new EducationEngine();
    const result = eduEng.analyze(chart);

    console.log("---- RAW ASTROLOGY DATA ----");
    console.log("Ascendant:", Math.floor(chart.ascendant / 30));
    console.log("Planets:");
    for (const p in chart.planetaryDetails) {
        console.log(` ${p}: ${chart.planetaryDetails[p].sign}`);
    }

    console.log("\n---- GAP YEAR PREDICTION ----");
    console.log(JSON.stringify(result.gapYear, null, 2));

} catch (e) {
    console.error('Error during test execution:', e);
}
