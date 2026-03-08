/**
 * AstroPsycho Engine — Extended Accuracy Verification (10 Charts)
 * Sources: AstroSage, clickastro.com, jyotishgram.com, drikpanchang.com
 * Run: node accuracy-test.js
 */
const VedicAstrologyEngine = require('../js/astrology-engine-v8.js');
const engine = new VedicAstrologyEngine();

const CHARTS = [
    // ── BATCH 1: Original 5 (already verified 100%) ──
    {
        name: 'Narendra Modi', birthDate: '1950-09-17', birthTime: '11:00',
        lat: 23.7880, lon: 72.6467, tz: 5.5, place: 'Vadnagar, Gujarat',
        // Source: thehansindia.com, anytimeastro.com
        expected: { ascendant: 'Scorpio', sun: 'Virgo', moon: 'Scorpio', moon_nak: 'Anuradha', jupiter: 'Aquarius', dasha: 'saturn' }
    },
    {
        name: 'Amitabh Bachchan', birthDate: '1942-10-11', birthTime: '16:00',
        lat: 25.4358, lon: 81.8463, tz: 5.5, place: 'Allahabad, UP',
        // Source: AstroSage, clickastro.com, astrolinked.com
        expected: { ascendant: 'Aquarius', sun: 'Virgo', moon: 'Libra', moon_nak: 'Swati', saturn: 'Taurus', dasha: 'rahu' }
    },
    {
        name: 'A.P.J. Abdul Kalam', birthDate: '1931-10-15', birthTime: '13:15',
        lat: 9.2876, lon: 79.3129, tz: 5.5, place: 'Rameswaram, TN',
        // Source: AstroSage verified
        expected: { sun: 'Virgo', saturn: 'Sagittarius' }
    },
    {
        name: 'Sachin Tendulkar', birthDate: '1973-04-24', birthTime: '18:45',
        lat: 19.0760, lon: 72.8777, tz: 5.5, place: 'Mumbai, MH',
        // Source: Multiple astro sites
        expected: { sun: 'Aries', jupiter: 'Capricorn', saturn: 'Taurus' }
    },
    {
        name: 'Indira Gandhi', birthDate: '1917-11-19', birthTime: '23:11',
        lat: 25.4358, lon: 81.8463, tz: 5.5, place: 'Allahabad, UP',
        // Source: S.K. Mehta, AstroSage cross-check
        expected: { sun: 'Scorpio', saturn: 'Cancer' }
    },
    // ── BATCH 2: New 5 celebrities ──
    {
        name: 'Shah Rukh Khan', birthDate: '1965-11-02', birthTime: '02:30',
        lat: 28.6139, lon: 77.2090, tz: 5.5, place: 'New Delhi',
        // Source: AstroSage (Accurate A rating), mypanchang.com
        // Moon = Capricorn, Nakshatra = Shravana or Dhanishtha (both Capricorn) — all sources agree
        expected: { sun: 'Libra', moon: 'Capricorn' }
    },
    {
        name: 'Virat Kohli', birthDate: '1988-11-05', birthTime: '10:28',
        lat: 28.6139, lon: 77.2090, tz: 5.5, place: 'New Delhi',
        // Source: AstroSage, clickastro.com — ALL sources agree
        expected: { sun: 'Libra', moon: 'Virgo', moon_nak: 'Uttara Phalguni' }
    },
    {
        name: 'MS Dhoni', birthDate: '1981-07-07', birthTime: '11:15',
        lat: 23.3441, lon: 85.3096, tz: 5.5, place: 'Ranchi, Jharkhand',
        // Source: AstroSage (Accurate A), clickastro.com — ALL sources agree
        expected: { sun: 'Gemini', moon: 'Virgo', moon_nak: 'Uttara Phalguni' }
    },
    {
        name: 'Aamir Khan', birthDate: '1965-03-14', birthTime: '06:15',
        lat: 19.0760, lon: 72.8777, tz: 5.5, place: 'Mumbai, MH',
        // Source: AstroSage (Accurate), clickastro.com — ALL sources agree
        expected: { sun: 'Aquarius', moon: 'Cancer', moon_nak: 'Pushya', ascendant: 'Aquarius' }
    },
    {
        name: 'Srinivasa Ramanujan', birthDate: '1887-12-22', birthTime: '17:44',
        lat: 11.3410, lon: 77.7172, tz: 5.5, place: 'Erode, TN',
        // Source: AstroSage, drikpanchang.com — ALL sources agree regardless of birth time
        expected: { sun: 'Sagittarius', moon: 'Pisces', moon_nak: 'Uttara Bhadrapada' }
    },
    // ── BATCH 3: Global Celebrities ──
    {
        name: 'Michael Jackson', birthDate: '1958-08-29', birthTime: '19:33',
        lat: 41.5934, lon: -87.3464, tz: -5, place: 'Gary, Indiana, USA',
        expected: { sun: 'Leo', moon: 'Aquarius', ascendant: 'Aquarius' }
    },
    {
        name: 'Queen Elizabeth II', birthDate: '1926-04-21', birthTime: '02:40',
        lat: 51.5074, lon: -0.1278, tz: 0, place: 'London, UK',
        expected: { sun: 'Aries', moon: 'Cancer', ascendant: 'Capricorn' }
    },
    {
        name: 'Marilyn Monroe', birthDate: '1926-06-01', birthTime: '09:30',
        lat: 34.0522, lon: -118.2437, tz: -8, place: 'Los Angeles, USA',
        expected: { sun: 'Taurus', moon: 'Capricorn', ascendant: 'Cancer' }
    },
    {
        name: 'Bruce Lee', birthDate: '1940-11-27', birthTime: '07:12',
        lat: 37.7749, lon: -122.4194, tz: -8, place: 'San Francisco, USA',
        expected: { sun: 'Scorpio', moon: 'Libra', ascendant: 'Scorpio' }
    },
    {
        name: 'Keanu Reeves', birthDate: '1964-09-02', birthTime: '05:41',
        lat: 33.8938, lon: 35.5018, tz: 2, place: 'Beirut, Lebanon',
        expected: { sun: 'Leo', moon: 'Gemini', ascendant: 'Leo' }
    }
];

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function getSign(lon) { return SIGNS[Math.floor(lon / 30)]; }
function fmt(lon) { return (lon % 30).toFixed(2) + '° ' + getSign(lon); }

let total = 0, passed = 0, failed = 0;
const results = [];
const lines = [];

function log(s) { lines.push(s); }

log('');
log('═'.repeat(70));
log('  ASTRO PSYCO — EXTENDED ACCURACY VERIFICATION (15 CHARTS)');
log('  Engine: astrology-engine-v8.js | Ayanamsa: Lahiri (Chitra Paksha)');
log('  Reference: AstroSage (Accurate A), clickastro.com, drikpanchang.com');
log('═'.repeat(70));

for (const chart of CHARTS) {
    const calc = engine.calculateBirthChart({
        birthDate: chart.birthDate, birthTime: chart.birthTime, birthPlace: chart.place,
        latitude: chart.lat, longitude: chart.lon, timezone: chart.tz
    });
    const p = calc.planets, asc = calc.ascendant, nak = calc.nakshatras, dasha = calc.dashas;
    const moonNak = nak.moon ? nak.moon.name.replace(/_/g, ' ') : '?';

    const chartResult = {
        name: chart.name, birthDate: chart.birthDate,
        positions: {
            ascendant: fmt(asc), sun: fmt(p.sun), moon: fmt(p.moon) + '[' + moonNak + ']',
            mars: fmt(p.mars), jupiter: fmt(p.jupiter), venus: fmt(p.venus),
            saturn: fmt(p.saturn), rahu: fmt(p.rahu), ketu: fmt(p.ketu),
            birth_dasha: dasha ? dasha.birthDashaPlanet : '?'
        },
        tests: [], pass: 0, fail: 0
    };

    log('');
    log('┌─ ' + chart.name.toUpperCase() + ' (' + chart.birthDate + ' ' + chart.birthTime + ')');
    log('│  ' + chart.place + ' | Lat:' + chart.lat + ' Lon:' + chart.lon);
    log('│  Asc:' + fmt(asc) + ' Sun:' + fmt(p.sun) + ' Moon:' + fmt(p.moon) + ' [' + moonNak + ']');
    log('│  Mars:' + fmt(p.mars) + ' Jup:' + fmt(p.jupiter) + ' Sat:' + fmt(p.saturn) + ' Dasha:' + chartResult.positions.birth_dasha);

    function chk(label, got, exp) {
        total++;
        const match = got.toLowerCase().replace(/ /g, '') === exp.toLowerCase().replace(/ /g, '');
        const icon = match ? '✅' : '❌';
        log('│  ' + icon + ' ' + label + ': exp=[' + exp + '] got=[' + got + ']');
        chartResult.tests.push({ label, expected: exp, got, pass: match });
        if (match) { passed++; chartResult.pass++; } else { failed++; chartResult.fail++; }
    }

    const exp = chart.expected;
    if (exp.ascendant) chk('Ascendant', getSign(asc), exp.ascendant);
    if (exp.sun) chk('Sun Sign', getSign(p.sun), exp.sun);
    if (exp.moon) chk('Moon Sign', getSign(p.moon), exp.moon);
    if (exp.moon_nak) chk('Moon Nak', moonNak, exp.moon_nak);
    if (exp.mars) chk('Mars Sign', getSign(p.mars), exp.mars);
    if (exp.jupiter) chk('Jupiter Sign', getSign(p.jupiter), exp.jupiter);
    if (exp.venus) chk('Venus Sign', getSign(p.venus), exp.venus);
    if (exp.saturn) chk('Saturn Sign', getSign(p.saturn), exp.saturn);
    if (exp.dasha) chk('Birth Dasha', dasha ? dasha.birthDashaPlanet : '?', exp.dasha);

    results.push(chartResult);
    const t = chartResult.pass + chartResult.fail;
    log('│  → ' + chartResult.pass + '/' + t + ' (' + (t > 0 ? ((chartResult.pass / t) * 100).toFixed(0) : 0) + '%)');
    log('└' + '─'.repeat(65));
}

const acc = ((passed / total) * 100).toFixed(1);
let grade, verdict;
const accN = parseFloat(acc);
if (accN >= 95) { grade = 'A+ (Exceptional)'; verdict = '✅ DEPLOY APPROVED — Engine matches professional software.'; }
else if (accN >= 85) { grade = 'A (Very Good)'; verdict = '✅ Acceptable for production — minor boundary cases.'; }
else if (accN >= 75) { grade = 'B (Good)'; verdict = '⚠️  Review sign-boundary cases before deploying.'; }
else { grade = 'D (Needs Work)'; verdict = '❌ Do not deploy — significant deviations found.'; }

log('');
log('═'.repeat(70));
log('  FINAL ACCURACY SUMMARY — 15 Celebrity Charts');
log('═'.repeat(70));
log('  Charts Tested : ' + CHARTS.length);
log('  Total Checks  : ' + total);
log('  Passed  ✅    : ' + passed);
log('  Failed  ❌    : ' + failed);
log('  Accuracy      : ' + acc + '%');
log('  Grade         : ' + grade);
log('  Verdict       : ' + verdict);
log('─'.repeat(70));
log('  Per-Chart:');
for (const r of results) {
    const t = r.pass + r.fail;
    const pct = t > 0 ? ((r.pass / t) * 100).toFixed(0) : 0;
    const filled = t > 0 ? Math.round(r.pass / t * 20) : 0;
    const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
    log('  ' + r.name.padEnd(28) + '[' + bar + '] ' + r.pass + '/' + t + ' (' + pct + '%)');
}
log('═'.repeat(70));
log('');

const fs = require('fs');
fs.writeFileSync('accuracy-detail.txt', lines.join('\n'));

const report = {
    generated: new Date().toISOString(),
    engine: 'astrology-engine-v8.js',
    ayanamsa: 'Lahiri Chitra Paksha',
    totalCharts: CHARTS.length,
    totalChecks: total,
    passed, failed,
    accuracyPercent: parseFloat(acc),
    grade, verdict,
    deployApproved: accN >= 95,
    charts: results
};
fs.writeFileSync('accuracy-report.json', JSON.stringify(report, null, 2));
console.log('[DONE] Accuracy: ' + acc + '% | Grade: ' + grade);
console.log('[DONE] Deploy approved: ' + report.deployApproved);
console.log('[DONE] Results written to accuracy-detail.txt and accuracy-report.json');
