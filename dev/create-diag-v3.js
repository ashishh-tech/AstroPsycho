const fs = require('fs');

const engSrc = fs.readFileSync('js/astrology-engine-v8.js', 'utf8');
const eduSrc = fs.readFileSync('js/education-engine.js', 'utf8');

const testCode = `
${engSrc}
${eduSrc}

const birthDetails = { 
    fullName: 'Aniket', 
    birthDate: '2003-04-09',
    birthTime: '10:25', 
    latitude: 22.5726, 
    longitude: 88.3639, 
    timezone: 5.5 
};

try {
    const baseEng = new VedicAstrologyEngine();
    const chart = baseEng.calculateBirthChart(birthDetails);
    
    const eduEng = new EducationEngine();
    const result = eduEng.analyze(chart);

    const printSign = (degree) => {
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        return signs[Math.floor(degree / 30) % 12];
    };

    console.log('---- RAW ASTROLOGY DATA ----');
    console.log('Ascendant:', printSign(chart.ascendant));
    console.log('Planets:');
    for (const p in chart.planetaryDetails) {
        console.log('   ' + p + ': ' + printSign(chart.planetaryDetails[p].longitude) + ' ' + (chart.planetaryDetails[p].longitude % 30).toFixed(2) + ' degrees');
    }
    
    const ascSignIdx = Math.floor(chart.ascendant / 30) % 12;
    const getHouse = (p) => {
        const pSignIdx = Math.floor(chart.planetaryDetails[p].longitude / 30) % 12;
        return (pSignIdx - ascSignIdx + 12) % 12 + 1;
    };
    
    console.log('\\n---- HOUSE POSITIONS ----');
    for (const p in chart.planetaryDetails) {
        console.log('   ' + p + ': House ' + getHouse(p));
    }
    
    console.log('\\n---- CURRENT DASHA ----');
    console.log(chart.dashaPeriods ? chart.dashaPeriods.slice(0, 3).map(d => d.planet + ' (' + new Date(d.startDate).getFullYear() + ' - ' + new Date(d.endDate).getFullYear() + ')') : 'No Dasha Data');

} catch(e) {
    console.error(e);
}
`;

fs.writeFileSync('diagnostic-run-v3.js', testCode);
