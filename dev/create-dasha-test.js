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
    
    // Manual Dasha Check
    const dashaPeriods = baseEng.calculateVimsottariDasha(chart.planetaryDetails.moon.longitude);
    
    // Check Dasha running during 2022-2025 (Age 19-22)
    const gapStart = new Date('2022-01-01');
    const gapEnd = new Date('2025-12-31');
    
    console.log('--- DASHAS DURING 2022-2025 ---');
    const activeDashas = dashaPeriods.filter(d => {
        const dStart = new Date(d.startDate);
        const dEnd = new Date(d.endDate);
        return (dStart <= gapEnd && dEnd >= gapStart);
    });
    
    activeDashas.forEach(d => {
        console.log(d.planet, new Date(d.startDate).getFullYear(), '-', new Date(d.endDate).getFullYear());
    });
} catch(e) {
    console.error(e);
}
`;

fs.writeFileSync('diag-dasha.js', testCode);
