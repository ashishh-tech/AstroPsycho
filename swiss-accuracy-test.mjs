/**
 * NASA Swiss Ephemeris vs Meeus Engine — Accuracy Test
 * Run: node --input-type=module swiss-accuracy-test.mjs
 */

// Load SWE
const swe = await (await import('./js/swisseph.js')).default({ locateFile: f => 'js/' + f });

// Load Meeus
globalThis.window = {};
globalThis.document = {
    addEventListener: () => {}, getElementById: () => ({ style: {}, innerHTML: '', appendChild: () => {}, scrollIntoView: () => {}, classList: { add: () => {}, remove: () => {} } }),
    querySelectorAll: () => [], querySelector: () => null, createElement: () => ({ style: {}, innerHTML: '', appendChild: () => {}, setAttribute: () => {} }),
    head: { appendChild: () => {} }, readyState: 'complete'
};
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const VedicAstrologyEngine = require('./js/astrology-engine-v8.js');
import fs from 'fs';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// Set Lahiri
swe.ccall('swe_set_sid_mode', 'number', ['number','number','number'], [1, 0, 0]);

const meeus = new VedicAstrologyEngine();

const celebs = [
    { name: "Marilyn Monroe",  d: "1926-06-01", t: "09:30", lat: 34.0522,  lon: -118.2437, tz: -8 },
    { name: "Michael Jackson", d: "1958-08-29", t: "23:53", lat: 41.4925,  lon: -87.3464,  tz: -6 },
    { name: "Princess Diana",  d: "1961-07-01", t: "19:45", lat: 52.8242,  lon: 0.5143,    tz: 1 },
    { name: "Elvis Presley",   d: "1935-01-08", t: "04:35", lat: 34.2576,  lon: -88.7034,  tz: -6 },
    { name: "Madonna",         d: "1958-08-16", t: "07:05", lat: 42.4734,  lon: -83.8886,  tz: -5 },
];

const planets = [
    { name: 'Sun',     id: 0,  key: 'sun' },
    { name: 'Moon',    id: 1,  key: 'moon' },
    { name: 'Mercury', id: 2,  key: 'mercury' },
    { name: 'Venus',   id: 3,  key: 'venus' },
    { name: 'Mars',    id: 4,  key: 'mars' },
    { name: 'Jupiter', id: 5,  key: 'jupiter' },
    { name: 'Saturn',  id: 6,  key: 'saturn' },
    { name: 'Rahu',    id: 10, key: 'rahu' },
];

function getSwePos(jd, planetId) {
    const rp = swe._malloc(48);
    const ep = swe._malloc(256);
    swe.ccall('swe_calc_ut','number',['number','number','number','number','number'],[jd, planetId, 2|65536, rp, ep]);
    let lon = swe.HEAPF64[rp >> 3];
    swe._free(rp); swe._free(ep);
    return ((lon % 360) + 360) % 360;
}

const out = [];
const L = s => out.push(s);
const allDiffs = [];

L('');
L('='.repeat(76));
L('  ASTROPSYCHO -- NASA SWISS EPHEMERIS vs MEEUS ENGINE PRECISION TEST');
L('='.repeat(76));
L('  Swiss Ephemeris: NASA JPL DE431 via WASM | Meeus: Schlyter orbital elements');
L('  Ayanamsa: Lahiri (Chitra Paksha)');
L('');

for (const c of celebs) {
    const [y,m,d] = c.d.split('-').map(Number);
    const [h,mn] = c.t.split(':').map(Number);
    const utHour = h + mn/60 - c.tz;
    const jd = swe.ccall('swe_julday','number',['number','number','number','number','number'],[y,m,d,utHour,1]);

    const chart = meeus.calculateBirthChart({
        birthDate: c.d, birthTime: c.t, latitude: c.lat, longitude: c.lon, timezone: c.tz, fullName: c.name
    });

    L('-'.repeat(76));
    L('  ' + c.name);
    L('-'.repeat(76));
    L('  ' + 'Planet'.padEnd(10) + 'NASA(SwissEph)'.padEnd(20) + 'Meeus'.padEnd(20) + 'Delta'.padEnd(14) + 'Grade');
    L('  ' + '-'.repeat(68));

    for (const p of planets) {
        const swePos = getSwePos(jd, p.id);
        const mPos = chart.planets[p.key];
        let diff = Math.abs(swePos - mPos);
        if (diff > 180) diff = 360 - diff;
        allDiffs.push({ celeb: c.name, planet: p.name, swe: swePos, meeus: mPos, diff });

        let grade = diff < 0.001 ? 'PERFECT' : diff < 0.01 ? 'EXCELLENT' : diff < 0.1 ? 'VERY GOOD' : diff < 1.0 ? 'GOOD' : 'FAIR';
        const sS = SIGNS[Math.floor(swePos/30)].substring(0,3);
        const mS = SIGNS[Math.floor(mPos/30)].substring(0,3);

        L('  ' + p.name.padEnd(10) + (swePos.toFixed(4)+' '+sS).padEnd(20) + (mPos.toFixed(4)+' '+mS).padEnd(20) + diff.toFixed(4).padStart(10) + '  ' + grade);
    }
    L('');
}

// Summary
const avg = allDiffs.reduce((a,b) => a + b.diff, 0) / allDiffs.length;
const max = Math.max(...allDiffs.map(d => d.diff));
const sorted = allDiffs.map(d => d.diff).sort((a,b) => a-b);
const median = sorted[Math.floor(sorted.length/2)];
const u001 = allDiffs.filter(d => d.diff < 0.001).length;
const u01  = allDiffs.filter(d => d.diff < 0.01).length;
const u1   = allDiffs.filter(d => d.diff < 0.1).length;
const u10  = allDiffs.filter(d => d.diff < 1.0).length;

L('='.repeat(76));
L('  PRECISION SUMMARY (' + allDiffs.length + ' measurements)');
L('='.repeat(76));
L('');
L('    Average  : ' + avg.toFixed(6) + ' deg (' + (avg*3600).toFixed(2) + ' arcsec)');
L('    Median   : ' + median.toFixed(6) + ' deg');
L('    Max      : ' + max.toFixed(6) + ' deg');
L('');
L('    < 0.001d (Perfect)   : ' + u001 + '/' + allDiffs.length);
L('    < 0.01d  (Excellent) : ' + u01 + '/' + allDiffs.length);
L('    < 0.1d   (Very Good) : ' + u1 + '/' + allDiffs.length);
L('    < 1.0d   (Good)      : ' + u10 + '/' + allDiffs.length);
L('');

L('  Per-Planet Average:');
for (const p of planets) {
    const pA = allDiffs.filter(d => d.planet === p.name);
    const a = pA.reduce((s,d) => s + d.diff, 0) / pA.length;
    L('    ' + p.name.padEnd(10) + a.toFixed(6) + ' deg (' + (a*3600).toFixed(1) + ' arcsec)');
}
L('');

if (avg < 1.0) L('  VERDICT: EXCELLENT -- Meeus engine average error < 1 degree vs NASA JPL!');
else L('  VERDICT: GOOD -- Swiss Ephemeris bridge recommended for precision work.');
L('');

fs.writeFileSync('swiss-accuracy-report.txt', out.join('\n'), 'utf8');
fs.writeFileSync('swiss-accuracy-results.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { avgDeg: avg.toFixed(6), medianDeg: median.toFixed(6), maxDeg: max.toFixed(6), n: allDiffs.length },
    details: allDiffs.map(d => ({...d, swe: +d.swe.toFixed(6), meeus: +d.meeus.toFixed(6), diff: +d.diff.toFixed(6)}))
}, null, 2), 'utf8');

console.log('Done. See swiss-accuracy-report.txt');
swe.ccall('swe_close', 'number', [], []);
