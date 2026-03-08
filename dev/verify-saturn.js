const VedicAstrologyEngine = require('./js/astrology-engine-v8.js');
const engine = new VedicAstrologyEngine();

const tests = [
    {
        name: 'Standard Accuracy Date (1996)',
        birthDate: '1996-04-01',
        birthTime: '11:47',
        latitude: 28.61,
        longitude: 77.20,
        timezone: 5.5,
        expectedSiderealSaturn: 334.85 // Approximate benchmark
    },
    {
        name: 'Retrograde in Cancer (2005)',
        birthDate: '2005-01-13',
        birthTime: '12:00',
        latitude: 28.61,
        longitude: 77.20,
        timezone: 5.5,
        expectedSiderealSaturn: 113.8 // Approx 23.8° Cancer
    }
];

console.log('--- Saturn & Sun Accuracy Verification ---');
tests.forEach(test => {
    const chart = engine.calculateBirthChart(test);
    const details = chart.planetaryDetails;
    console.log(`Test: ${test.name}`);
    for (const [planet, pData] of Object.entries(details)) {
        if (typeof pData === 'object') {
            console.log(`${planet.padEnd(10)}: ${pData.longitude.toFixed(4)}° (${pData.sign} ${pData.degree.toFixed(2)}°)`);
        }
    }
    if (test.expectedSiderealSaturn) {
        const diff = details.saturn.longitude - test.expectedSiderealSaturn;
        console.log(`Saturn Difference: ${diff.toFixed(4)}°`);
    }
    console.log('-----------------------------------');
});
