const fs = require('fs');

const engSrc = fs.readFileSync('js/astrology-engine-v8.js', 'utf8');
const eduSrc = fs.readFileSync('js/education-engine.js', 'utf8');

const testCode = `
${engSrc}
${eduSrc}

const engine = new VedicAstrologyEngine();
const chart1 = engine.calculateBirthChart({
    birthDate: '2001-01-01', birthTime: '12:00', birthPlace: 'Delhi', timezone: 5.5, latitude: 28.61, longitude: 77.20
});
const chart2 = engine.calculateBirthChart({
    birthDate: '1995-05-15', birthTime: '08:30', birthPlace: 'Mumbai', timezone: 5.5, latitude: 19.07, longitude: 72.87
});

const eduEngine = new EducationEngine();
const tl1 = eduEngine._educationTimeline(chart1);
const tl2 = eduEngine._educationTimeline(chart2);

console.log("Chart 1 18-24:", tl1[2].note);
console.log("Chart 2 18-24:", tl2[2].note);

// Check houses for Chart 1
const planets1 = chart1.planetaryDetails || {};
const ascLon1 = typeof chart1.ascendant === 'number' ? chart1.ascendant : 0;
const ascIdx1 = Math.floor(ascLon1 / 30) % 12;
const getHouse1 = (p) => {
    const pSign = (planets1[p] && planets1[p].sign ? planets1[p].sign : '').toLowerCase();
    const pIdx = eduEngine.signs.indexOf(pSign);
    if (pIdx < 0) return null;
    return (pIdx - ascIdx1 + 12) % 12 + 1;
};
console.log("Chart 1 Houses:", {
    jup: getHouse1('jupiter'),
    sun: getHouse1('sun'),
    rahu: getHouse1('rahu'),
    saturn: getHouse1('saturn')
});

`;

fs.writeFileSync('temp-timeline.js', testCode);
