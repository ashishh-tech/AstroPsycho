const VedicAstrologyEngine = require('./js/astrology-engine-v8.js');
const fs = require('fs');
const engine = new VedicAstrologyEngine();

// Aug 7 2007, 1:30 AM IST, Kolkata (22.5726N, 88.3639E)
// UTC = 1:30 AM IST - 5:30 = 8:00 PM Aug 6 UTC
const utcDate = new Date(Date.UTC(2007, 7, 6, 20, 0, 0));
const jd = engine.calculateJulianDate(utcDate);
const t = (jd - 2451545.0) / 36525.0;
const ayanamsa = engine.calculatePreciseAyanamsa(t);

const lat = 22.5726;
const lon = 88.3639;

const asc = engine.calculatePreciseAscendant(jd, t, ayanamsa, lat, lon);
const planets = engine.calculatePrecisePlanets(t, ayanamsa);

const pname = (p) => engine.signs[Math.floor(p / 30)] + ' ' + (p % 30).toFixed(2) + 'deg';

const lines = [
    '=== Aug 7 2007, 1:30 AM IST, Kolkata ===',
    'UTC time:  Aug 6 2007, 20:00 UTC',
    'JD       = ' + jd.toFixed(4),
    'T        = ' + t.toFixed(8),
    'Ayanamsa = ' + ayanamsa.toFixed(4) + ' deg',
    '',
    'ASCENDANT = ' + asc.toFixed(4) + ' => ' + pname(asc),
    '  AstroPsycho shows: (this output above)',
    '  AstroSage expected: Gemini',
    '',
    'PLANETS:',
    '  Sun     = ' + planets.sun.toFixed(4) + ' => ' + pname(planets.sun),
    '  Moon    = ' + planets.moon.toFixed(4) + ' => ' + pname(planets.moon),
    '  Mars    = ' + planets.mars.toFixed(4) + ' => ' + pname(planets.mars),
    '  Mercury = ' + planets.mercury.toFixed(4) + ' => ' + pname(planets.mercury),
    '  Jupiter = ' + planets.jupiter.toFixed(4) + ' => ' + pname(planets.jupiter),
    '  Venus   = ' + planets.venus.toFixed(4) + ' => ' + pname(planets.venus),
    '  Saturn  = ' + planets.saturn.toFixed(4) + ' => ' + pname(planets.saturn),
    '  Rahu    = ' + planets.rahu.toFixed(4) + ' => ' + pname(planets.rahu),
    '  Ketu    = ' + planets.ketu.toFixed(4) + ' => ' + pname(planets.ketu),
    '',
    '--- GMST DEBUG ---',
    'GMST = ' + engine.normalize(280.46061837 + 360.98564736629 * (jd - 2451545.0)).toFixed(4),
    'LST  = ' + engine.normalize(280.46061837 + 360.98564736629 * (jd - 2451545.0) + lon).toFixed(4),
];

const output = lines.join('\n');
fs.writeFileSync('test-aug2007-out.txt', output);
console.log(output);
