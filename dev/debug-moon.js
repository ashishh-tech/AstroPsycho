const VedicAstrologyEngine = require('./js/astrology-engine.js');
const engine = new VedicAstrologyEngine();

const testDetails = {
    birthDate: '2003-04-09',
    birthTime: '10:25',
    birthPlace: 'Mumbai (Speculated)',
    latitude: 19.07,
    longitude: 72.87,
    timezone: 5.5
};

const chart = engine.calculateBirthChart(testDetails);
let out = '--- Verification Results ---\n';
out += `Ascendant: ${chart.ascendant.toFixed(4)}° (Sign: ${Math.floor(chart.ascendant / 30) + 1})\n`;
const distToBoundary = chart.ascendant - 60;
out += `Distance to Taurus boundary: ${distToBoundary.toFixed(4)}° (${(distToBoundary * 240).toFixed(2)} seconds of time)\n`;
for (const [p, d] of Object.entries(chart.planetaryDetails)) {
    out += `${p.padEnd(10)}: ${d.longitude.toFixed(2)}° (Sign: ${d.signIndex + 1}, House: ${d.house})\n`;
}
out += '---------------------------\n';
console.log(out);
require('fs').writeFileSync('debug-result.txt', out);
