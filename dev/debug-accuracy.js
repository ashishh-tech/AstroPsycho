const VedicAstrologyEngine = require('./js/astrology-engine-v8.js');
const fs = require('fs');
const engine = new VedicAstrologyEngine();
const lines = [];
const log = (...args) => { lines.push(args.join(' ')); };

// April 1 1996, 11:47 IST = 6:17 UTC
const utcDate = new Date(Date.UTC(1996, 3, 1, 6, 17, 0));
const jd = engine.calculateJulianDate(utcDate);
const t = (jd - 2451545.0) / 36525.0;
const ayanamsa = engine.calculatePreciseAyanamsa(t);

log(`JD: ${jd.toFixed(6)}`);
log(`T:  ${t.toFixed(8)}`);
log(`Ayanamsa: ${ayanamsa.toFixed(4)}`);
log('');

const sunData = engine.calculateSun(t);
log(`Sun tropical apparent: ${sunData.l.toFixed(4)}`);
log(`Sun sidereal (tropical-ayan): ${engine.normalize(sunData.l - ayanamsa).toFixed(4)}`);
log(`  Expected sidereal Sun: ~11.55 (Aries)`);
log('');

const moonTropical = engine.calculateMoon(t);
log(`Moon tropical: ${moonTropical.toFixed(4)}`);
log(`Moon sidereal (tropical-ayan): ${engine.normalize(moonTropical - ayanamsa).toFixed(4)}`);
log(`  Expected sidereal Moon: ~156.05 (Virgo 6)`);
log('');

const planets = engine.calculatePrecisePlanets(t, ayanamsa);
log(`Engine Sun:     ${planets.sun.toFixed(4)}  => ${engine.signs[Math.floor(planets.sun / 30)]} ${(planets.sun % 30).toFixed(2)}`);
log(`Engine Moon:    ${planets.moon.toFixed(4)}  => ${engine.signs[Math.floor(planets.moon / 30)]} ${(planets.moon % 30).toFixed(2)}`);
log(`Engine Jupiter: ${planets.jupiter.toFixed(4)}  => ${engine.signs[Math.floor(planets.jupiter / 30)]} ${(planets.jupiter % 30).toFixed(2)}`);
log(`Engine Saturn:  ${planets.saturn.toFixed(4)}  => ${engine.signs[Math.floor(planets.saturn / 30)]} ${(planets.saturn % 30).toFixed(2)}`);
log('');
log('EXPECTED (AstroSage):');
log('Sun:     11.55  => Aries 11.55');
log('Moon:    156.05 => Virgo 6.05');
log('Jupiter: 285.93 => Capricorn 15.93');
log('Saturn:  329.23 => Pisces 29.23');
log('');

// Diagnose: if engine shows ~347 for sun but tropical is ~11.55,
// then engine = tropical - 24 (double subtracted?)
log(`Engine Sun + ayanamsa = ${engine.normalize(planets.sun + ayanamsa).toFixed(4)} (tropical was ${sunData.l.toFixed(4)})`);
log(`Diff (sun_eng - ref): ${engine.normalize(planets.sun - 11.55).toFixed(4)}`);

fs.writeFileSync('debug-out.txt', lines.join('\n'));
console.log(lines.join('\n'));
