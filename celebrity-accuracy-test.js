/**
 * ══════════════════════════════════════════════════════════════════════
 *  AstroPsycho — Celebrity Accuracy Test (Meeus Engine vs Known Data)
 * ══════════════════════════════════════════════════════════════════════
 *
 *  Tests VedicAstrologyEngine (Meeus-based planetary calculations)
 *  against VERIFIED birth chart data from Astro-Databank / AstroSage
 *  for 5 famous Western celebrities.
 *
 *  Reference: Astro-Databank (astro.com), AstroSage.com, Jagannatha Hora
 *  Ayanamsa: Lahiri (Chitra Paksha)
 *
 *  Run: node celebrity-accuracy-test.js
 * ══════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');

// ─── Minimalist browser globals ─────────────────────────────────────────
global.window = {};
global.document = {
    addEventListener: () => {},
    getElementById: () => ({ style: {}, innerHTML: '', appendChild: () => {}, scrollIntoView: () => {}, classList: { add: () => {}, remove: () => {} } }),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ style: {}, innerHTML: '', appendChild: () => {}, setAttribute: () => {} }),
    head: { appendChild: () => {} },
    readyState: 'complete'
};
global.localStorage = { getItem: () => null, setItem: () => {} };

// ─── Load Engine via require ────────────────────────────────────────────
const VedicAstrologyEngine = require('./js/astrology-engine-v8.js');

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

// ═══════════════════════════════════════════════════════════════════════
//  CELEBRITY DATA — Verified from Astro-Databank (Rodden Rating AA/A)
// ═══════════════════════════════════════════════════════════════════════
//
//  Expected values are SIDEREAL (Lahiri Ayanamsa) sign placements.
//  Sources: AstroSage.com, astro.com (Vedic mode), Jagannatha Hora
//
//  Test checks: Sign placement per planet + Moon Nakshatra

const celebrities = [
    {
        name: "Marilyn Monroe",
        bio: "Actress, Singer | Rodden Rating: AA",
        birthDate: "1926-06-01",
        birthTime: "09:30",
        latitude: 34.0522,
        longitude: -118.2437,
        timezone: -8,           // PST — per birth certificate
        birthPlace: "Los Angeles, California",
        expected: {
            lagnaSign: "Cancer",        // Cancer Lagna — confirmed AstroSage
            sun: "Taurus",              // Sun in Taurus (Rohini nakshatra)
            moon: "Capricorn",          // Moon in Capricorn (Dhanishtha)
            mars: "Aquarius",           // Mars in Aquarius (Purva Bhadrapada)
            mercury: "Taurus",          // Mercury in Taurus (Rohini)
            jupiter: "Aquarius",        // Jupiter in Aquarius (Dhanishtha)
            venus: "Aries",             // Venus in Aries (Ashwini)
            saturn: "Libra",            // Saturn in Libra — Exalted (Vishakha)
            rahu: "Gemini",             // Rahu in Gemini (Punarvasu)
            moonNakshatra: "dhanishtha" // Moon Nakshatra: Dhanishtha
        }
    },
    {
        name: "Michael Jackson",
        bio: "King of Pop | Birth time: 23:53 (debated)",
        birthDate: "1958-08-29",
        birthTime: "23:53",
        latitude: 41.4925,
        longitude: -87.3464,
        timezone: -6,           // CST — Gary, Indiana
        birthPlace: "Gary, Indiana",
        expected: {
            lagnaSign: "Gemini",        // Gemini Lagna (Mithuna)
            sun: "Leo",                 // Sun in Leo (own sign)
            moon: "Aquarius",           // Moon in Aquarius (birth time → late Aquarius)
            mars: "Aries",              // Mars in Aries — Own sign
            mercury: "Leo",             // Mercury in Leo
            jupiter: "Libra",           // Jupiter in Libra
            venus: "Cancer",            // Venus in Cancer
            saturn: "Scorpio",          // Saturn in Scorpio
            rahu: "Libra",              // Rahu in Libra
            moonNakshatra: "purva_bhadrapada" // Moon in Purva Bhadrapada
        }
    },
    {
        name: "Princess Diana",
        bio: "Princess of Wales | Rodden Rating: AA",
        birthDate: "1961-07-01",
        birthTime: "19:45",
        latitude: 52.8242,
        longitude: 0.5143,
        timezone: 1,            // BST (British Summer Time)
        birthPlace: "Sandringham, Norfolk, UK",
        expected: {
            lagnaSign: "Scorpio",       // Scorpio Lagna (some refs say Sagittarius — borderline)
            sun: "Gemini",              // Sun in Gemini
            moon: "Aquarius",           // Moon in Aquarius
            mars: "Leo",               // Mars in Leo (some refs say late Cancer → Leo border)
            mercury: "Gemini",          // Mercury in Gemini — own sign
            jupiter: "Capricorn",       // Jupiter in Capricorn — debilitated
            venus: "Taurus",            // Venus in Taurus — own sign
            saturn: "Capricorn",        // Saturn in Capricorn — own sign
            rahu: "Leo",               // Rahu in Leo (some refs: Cancer border)
            moonNakshatra: "dhanishtha" // Moon in Dhanishtha
        }
    },
    {
        name: "Elvis Presley",
        bio: "King of Rock and Roll | Rodden Rating: AA",
        birthDate: "1935-01-08",
        birthTime: "04:35",
        latitude: 34.2576,
        longitude: -88.7034,
        timezone: -6,           // CST — Tupelo, Mississippi
        birthPlace: "Tupelo, Mississippi",
        expected: {
            lagnaSign: "Scorpio",       // Scorpio Lagna (Vrischika)
            sun: "Sagittarius",         // Sun in Sagittarius
            moon: "Aquarius",           // Moon in Aquarius (some refs: Pisces border)
            mars: "Virgo",              // Mars in Virgo (some refs: Libra — border ~180°)
            mercury: "Sagittarius",     // Mercury in Sagittarius
            jupiter: "Libra",           // Jupiter in Libra
            venus: "Capricorn",         // Venus in Capricorn (some refs: late Sag border)
            saturn: "Aquarius",         // Saturn in Aquarius
            rahu: "Capricorn",          // Rahu in Capricorn (some refs: Sagittarius border)
            moonNakshatra: "shatabhisha" // Moon in Shatabhisha
        }
    },
    {
        name: "Madonna",
        bio: "Queen of Pop | Rodden Rating: AA",
        birthDate: "1958-08-16",
        birthTime: "07:05",
        latitude: 42.4734,
        longitude: -83.8886,
        timezone: -5,           // EST — Bay City, Michigan
        birthPlace: "Bay City, Michigan",
        expected: {
            lagnaSign: "Leo",           // Leo Lagna (Simha)
            sun: "Cancer",              // Sun in Cancer (late Cancer)
            moon: "Leo",                // Moon in Leo (some refs: Virgo)
            mars: "Aries",              // Mars in Aries — Own sign (Swakshetra)
            mercury: "Leo",             // Mercury in Leo
            jupiter: "Libra",           // Jupiter in Libra (some refs: Virgo border)
            venus: "Cancer",            // Venus in Cancer
            saturn: "Scorpio",          // Saturn in Scorpio
            rahu: "Libra",              // Rahu in Libra
            moonNakshatra: "purva_phalguni" // Moon in Purva Phalguni
        }
    }
];


// ═══════════════════════════════════════════════════════════════════════
//  TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════

function runAccuracyTest() {
    const engine = new VedicAstrologyEngine();
    const output = [];
    const log = (...args) => { 
        const line = args.join(' ');
        output.push(line); 
        console.log(line); 
    };

    log('');
    log('='.repeat(72));
    log('  ASTROPSYCHO -- CELEBRITY ACCURACY TEST');
    log('  Meeus Engine vs Astro-Databank / AstroSage Reference Data');
    log('='.repeat(72));
    log('  Engine: VedicAstrologyEngine (Meeus / Schlyter orbital elements)');
    log('  Ayanamsa: Lahiri (Chitra Paksha)');
    log('  Reference: Astro-Databank, AstroSage, Jagannatha Hora');
    log('  Test Method: Sign-match per planet + Moon Nakshatra');
    log('');

    const allResults = [];
    let totalChecks = 0;
    let totalPass = 0;
    let totalFail = 0;

    for (const celeb of celebrities) {
        log('-'.repeat(72));
        log('  [*] ' + celeb.name);
        log('      ' + celeb.bio);
        log('      Born: ' + celeb.birthDate + ' at ' + celeb.birthTime + ' | ' + celeb.birthPlace);
        log('      Lat: ' + celeb.latitude + ', Lon: ' + celeb.longitude + ', TZ: UTC' + (celeb.timezone >= 0 ? '+' : '') + celeb.timezone);
        log('-'.repeat(72));

        // Calculate chart
        const chart = engine.calculateBirthChart({
            birthDate: celeb.birthDate,
            birthTime: celeb.birthTime,
            latitude: celeb.latitude,
            longitude: celeb.longitude,
            timezone: celeb.timezone,
            fullName: celeb.name
        });

        const expected = celeb.expected;
        let celebPass = 0;
        let celebFail = 0;
        let celebChecks = 0;

        // ── Test Ascendant (Lagna) ──────────────────────────────────
        const calcAscSign = SIGNS[Math.floor(chart.ascendant / 30)];
        const ascDegInSign = (chart.ascendant % 30).toFixed(2);
        celebChecks++;
        if (calcAscSign === expected.lagnaSign) {
            celebPass++;
            log('  [PASS] Lagna     : ' + calcAscSign + ' (' + ascDegInSign + ' in sign) | Expected: ' + expected.lagnaSign);
        } else {
            celebFail++;
            log('  [FAIL] Lagna     : ' + calcAscSign + ' (' + ascDegInSign + ' in sign) | Expected: ' + expected.lagnaSign);
        }

        // ── Test Each Planet (Sign Match) ───────────────────────────
        const planetsToTest = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'];

        for (const planet of planetsToTest) {
            const calcDeg = chart.planets[planet];
            const calcSignIdx = Math.floor(calcDeg / 30);
            const calcSign = SIGNS[calcSignIdx];
            const calcDegInSign = (calcDeg % 30).toFixed(2);
            const expSign = expected[planet];

            celebChecks++;

            const pLabel = planet.charAt(0).toUpperCase() + planet.slice(1);
            const padP = (pLabel + '    ').slice(0, 10);

            if (calcSign === expSign) {
                celebPass++;
                log('  [PASS] ' + padP + ': ' + calcSign.padEnd(14) + '(' + calcDegInSign.padStart(6) + ' in sign) | Expected: ' + expSign);
            } else {
                celebFail++;
                // Check if it's a neighbor sign (borderline case)
                const expIdx = SIGNS.indexOf(expSign);
                const offBy = Math.min(Math.abs(calcSignIdx - expIdx), 12 - Math.abs(calcSignIdx - expIdx));
                const note = offBy === 1 ? ' [BORDER - off by 1 sign]' : '';
                log('  [FAIL] ' + padP + ': ' + calcSign.padEnd(14) + '(' + calcDegInSign.padStart(6) + ' in sign) | Expected: ' + expSign + note);
            }
        }

        // ── Test Moon Nakshatra ──────────────────────────────────────
        if (expected.moonNakshatra) {
            const moonNak = engine.getNakshatra(chart.planets.moon);
            celebChecks++;
            const nakFormatted = formatNakName(moonNak.name);
            const expFormatted = formatNakName(expected.moonNakshatra);
            if (moonNak.name === expected.moonNakshatra) {
                celebPass++;
                log('  [PASS] Moon Nak  : ' + nakFormatted + ' (Pada ' + moonNak.pada + ') | Expected: ' + expFormatted);
            } else {
                celebFail++;
                log('  [FAIL] Moon Nak  : ' + nakFormatted + ' (Pada ' + moonNak.pada + ') | Expected: ' + expFormatted);
            }
        }

        // ── Celebrity Summary ───────────────────────────────────────
        const passRate = ((celebPass / celebChecks) * 100).toFixed(1);
        const barLen = 20;
        const filledLen = Math.round((celebPass / celebChecks) * barLen);
        const bar = '#'.repeat(filledLen) + '-'.repeat(barLen - filledLen);

        log('');
        log('  Score: ' + celebPass + '/' + celebChecks + ' [' + bar + '] ' + passRate + '%');
        log('');

        totalChecks += celebChecks;
        totalPass += celebPass;
        totalFail += celebFail;

        allResults.push({
            name: celeb.name,
            checks: celebChecks,
            pass: celebPass,
            fail: celebFail,
            rate: passRate
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    //  FINAL SUMMARY
    // ═══════════════════════════════════════════════════════════════════
    log('');
    log('='.repeat(72));
    log('  OVERALL ACCURACY SUMMARY');
    log('='.repeat(72));
    log('');

    // Table header
    log('  ' + 'Celebrity'.padEnd(22) + 'Pass'.padEnd(7) + 'Fail'.padEnd(7) + 'Rate'.padEnd(9) + 'Grade');
    log('  ' + '-'.repeat(55));

    for (const r of allResults) {
        const grade = getGrade(parseFloat(r.rate));
        log('  ' + r.name.padEnd(22) + String(r.pass).padEnd(7) + String(r.fail).padEnd(7) + (r.rate + '%').padEnd(9) + grade);
    }

    log('  ' + '-'.repeat(55));

    const overallRate = ((totalPass / totalChecks) * 100).toFixed(1);
    const overallGrade = getGrade(parseFloat(overallRate));

    log('  ' + 'TOTAL'.padEnd(22) + String(totalPass).padEnd(7) + String(totalFail).padEnd(7) + (overallRate + '%').padEnd(9) + overallGrade);
    log('');

    // Progress bar
    const oBarLen = 40;
    const oFilled = Math.round((totalPass / totalChecks) * oBarLen);
    const oBar = '#'.repeat(oFilled) + '-'.repeat(oBarLen - oFilled);
    log('  Overall: [' + oBar + '] ' + overallRate + '% accuracy');
    log('');

    // Verdict
    const rate = parseFloat(overallRate);
    if (rate >= 90) {
        log('  VERDICT: EXCELLENT -- Meeus engine matches reference data with high fidelity!');
    } else if (rate >= 75) {
        log('  VERDICT: GOOD -- Engine produces reliable charts. Minor boundary drifts expected.');
    } else if (rate >= 60) {
        log('  VERDICT: FAIR -- Some offsets detected. Swiss Ephemeris bridge recommended.');
    } else {
        log('  VERDICT: NEEDS IMPROVEMENT -- Significant deviations. Check Ayanamsa & orbital elements.');
    }

    log('');
    log('  Notes:');
    log('  - Sign-boundary cases (planets near 0/30 deg) may show mismatch');
    log('    even with <2 deg error. This is normal for Meeus calculations.');
    log('  - Swiss Ephemeris bridge (swiss-ephem-bridge.js) provides <0.01 deg accuracy.');
    log('  - Some celebrities have debated birth times (esp. Michael Jackson).');
    log('');

    // ── Save results ────────────────────────────────────────────────
    const jsonReport = {
        timestamp: new Date().toISOString(),
        engine: 'VedicAstrologyEngine (Meeus/Schlyter)',
        ayanamsa: 'Lahiri (Chitra Paksha)',
        summary: {
            totalChecks,
            totalPass,
            totalFail,
            overallAccuracy: overallRate + '%',
            grade: overallGrade
        },
        celebrities: allResults
    };

    // ═══════════════════════════════════════════════════════════════════
    //  PART 2: DEGREE-LEVEL PRECISION TEST
    //  (Swiss Ephemeris / Astro-Databank reference positions)
    // ═══════════════════════════════════════════════════════════════════
    log('');
    log('='.repeat(72));
    log('  PART 2: DEGREE-LEVEL PRECISION ANALYSIS');
    log('  Comparing engine output degrees vs Swiss Ephemeris reference');
    log('='.repeat(72));
    log('  Tolerance bands: <1deg = EXCELLENT, <2deg = GOOD, <5deg = FAIR');
    log('');

    // Reference data from Astro-Databank / Swiss Ephemeris (Lahiri sidereal)
    // These are approximate degree positions verified from multiple sources
    const swissRefData = {
        "Marilyn Monroe": {
            sun: 46, moon: 296, mars: 328, mercury: 43, jupiter: 303,
            venus: 5, saturn: 208, rahu: 85
        },
        "Michael Jackson": {
            sun: 132, moon: 324, mars: 29, mercury: 122, jupiter: 185,
            venus: 114, saturn: 237, rahu: 181
        },
        "Princess Diana": {
            sun: 76, moon: 302, mars: 128, mercury: 70, jupiter: 281,
            venus: 31, saturn: 275, rahu: 126
        },
        "Elvis Presley": {
            sun: 264, moon: 309, mars: 170, mercury: 269, jupiter: 205,
            venus: 277, saturn: 303, rahu: 279
        },
        "Madonna": {
            sun: 120, moon: 138, mars: 22, mercury: 132, jupiter: 183,
            venus: 97, saturn: 237, rahu: 182
        }
    };

    let totalDegErrors = [];

    for (const celeb of celebrities) {
        const ref = swissRefData[celeb.name];
        if (!ref) continue;

        const chart = engine.calculateBirthChart({
            birthDate: celeb.birthDate,
            birthTime: celeb.birthTime,
            latitude: celeb.latitude,
            longitude: celeb.longitude,
            timezone: celeb.timezone,
            fullName: celeb.name
        });

        log('  ' + celeb.name + ':');

        const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'];
        let celebErrors = [];

        for (const p of planets) {
            const calc = chart.planets[p];
            const expected = ref[p];
            let diff = Math.abs(calc - expected);
            if (diff > 180) diff = 360 - diff;

            celebErrors.push(diff);
            totalDegErrors.push(diff);

            const pLabel = (p.charAt(0).toUpperCase() + p.slice(1) + '     ').slice(0, 9);
            let grade;
            if (diff < 1) grade = 'EXCELLENT';
            else if (diff < 2) grade = 'GOOD     ';
            else if (diff < 5) grade = 'FAIR     ';
            else grade = 'POOR     ';

            log('    ' + pLabel + ': Calc=' + calc.toFixed(2).padStart(7) + '  Ref=' + String(expected).padStart(4) + '  Delta=' + diff.toFixed(2).padStart(6) + 'deg  [' + grade + ']');
        }

        const avgCeleb = celebErrors.reduce((a, b) => a + b, 0) / celebErrors.length;
        const maxCeleb = Math.max(...celebErrors);
        log('    ─── Avg error: ' + avgCeleb.toFixed(2) + 'deg | Max error: ' + maxCeleb.toFixed(2) + 'deg');
        log('');
    }

    // Overall degree summary
    const avgError = totalDegErrors.reduce((a, b) => a + b, 0) / totalDegErrors.length;
    const maxError = Math.max(...totalDegErrors);
    const medianError = totalDegErrors.sort((a, b) => a - b)[Math.floor(totalDegErrors.length / 2)];
    const under1 = totalDegErrors.filter(e => e < 1).length;
    const under2 = totalDegErrors.filter(e => e < 2).length;
    const under5 = totalDegErrors.filter(e => e < 5).length;

    log('  ' + '-'.repeat(55));
    log('  DEGREE PRECISION SUMMARY (' + totalDegErrors.length + ' measurements):');
    log('    Average error : ' + avgError.toFixed(2) + ' degrees');
    log('    Median error  : ' + medianError.toFixed(2) + ' degrees');
    log('    Max error     : ' + maxError.toFixed(2) + ' degrees');
    log('    <1deg (Excellent) : ' + under1 + '/' + totalDegErrors.length + ' (' + ((under1/totalDegErrors.length)*100).toFixed(0) + '%)');
    log('    <2deg (Good)      : ' + under2 + '/' + totalDegErrors.length + ' (' + ((under2/totalDegErrors.length)*100).toFixed(0) + '%)');
    log('    <5deg (Fair)      : ' + under5 + '/' + totalDegErrors.length + ' (' + ((under5/totalDegErrors.length)*100).toFixed(0) + '%)');
    log('');

    if (avgError < 1) {
        log('  PRECISION VERDICT: OUTSTANDING -- Sub-degree average error!');
    } else if (avgError < 2) {
        log('  PRECISION VERDICT: VERY GOOD -- Meeus calculations within 2deg tolerance.');
    } else if (avgError < 5) {
        log('  PRECISION VERDICT: ACCEPTABLE -- Within 5deg. Swiss Ephemeris recommended for precision work.');
    } else {
        log('  PRECISION VERDICT: NEEDS IMPROVEMENT -- Consider enabling Swiss Ephemeris bridge.');
    }

    log('');

    // Add degree data to JSON
    jsonReport.degreePrecision = {
        averageError: avgError.toFixed(2) + ' degrees',
        medianError: medianError.toFixed(2) + ' degrees',
        maxError: maxError.toFixed(2) + ' degrees',
        underOneDegree: under1 + '/' + totalDegErrors.length,
        underTwoDegrees: under2 + '/' + totalDegErrors.length,
        totalMeasurements: totalDegErrors.length
    };

    fs.writeFileSync('accuracy-test-results.json', JSON.stringify(jsonReport, null, 2));
    fs.writeFileSync('accuracy-test-report.txt', output.join('\n'));
    log('  Results saved to: accuracy-test-results.json');
    log('  Report saved to:  accuracy-test-report.txt');
    log('');
}

// ─── Utilities ──────────────────────────────────────────────────────────

function formatNakName(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getGrade(rate) {
    if (rate >= 95) return 'A+';
    if (rate >= 85) return 'A';
    if (rate >= 75) return 'B+';
    if (rate >= 65) return 'B';
    if (rate >= 50) return 'C';
    return 'D';
}

// ─── Run ────────────────────────────────────────────────────────────────
runAccuracyTest();
