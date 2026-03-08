const VedicAstrologyEngine = require('./js/astrology-engine-v8.js');
const engine = new VedicAstrologyEngine();

const testDetails = {
    birthDate: '1996-04-01',
    birthTime: '11:47',
    birthPlace: 'Delhi (Matched to Screenshot)',
    latitude: 28.61,
    longitude: 77.20,
    timezone: 5.5
};

const chart = engine.calculateBirthChart(testDetails);
let output = '';

output += 'Testing Astro Psyco Engine Accuracy...\n';
output += `Test Date: ${testDetails.birthDate} ${testDetails.birthTime} (IST)\n`;
output += '\n--- Sidereal Planetary Positions ---\n';

for (const [planet, data] of Object.entries(chart.planetaryDetails)) {
    if (typeof data === 'object') {
        output += `${planet.padEnd(10)}: ${data.longitude.toFixed(4)}° (${data.sign} ${data.degree.toFixed(2)}°)\n`;
    }
}

output += '\n--- Ascendant ---\n';
output += `Ascendant : ${chart.ascendant.toFixed(4)}° (${engine.signs[Math.floor(chart.ascendant / 30)]} ${(chart.ascendant % 30).toFixed(2)}°)\n`;

console.log(output);
require('fs').writeFileSync('test-output.txt', output);
