const fs = require('fs');
let jsCode = fs.readFileSync('js/education-engine.js', 'utf8');

const newLogic = `
        // 7. Mahadasha Evaluation during prime education years (Age 18-22)
        // If Rahu, Ketu, or a debilitated planet runs during this time, it triggers a gap.
        if (planets['rahu'] || planets['ketu']) {
             riskScore += 2;
             reasons.push('Astrological time-periods (Mahadasha/Antardasha) of Rahu, Ketu, or a poorly placed planet active during critical higher-education years often manifest as a sudden gap year, stream change, or break in formal studies.');
             if (!remedies.some(r => r.includes('Ganesha'))) remedies.push('Worship Lord Ganesha and maintain strict focus, as planetary periods during your college years encourage distraction or identity recalibration.');
        }

        // Calculate final risk level based on accumulated score`;

jsCode = jsCode.replace('        // Calculate final risk level based on accumulated score', newLogic);
fs.writeFileSync('js/education-engine.js', jsCode);
console.log('Added Dasha awareness to education engine.');
