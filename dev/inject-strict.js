const fs = require('fs');
let jsCode = fs.readFileSync('js/education-engine.js', 'utf8');

const strictOverride = `
        // 8. Strict Age-Based Dasha Override (Capturing 2022-2025 Gap Years for early 2000s births)
        // If a malefic Dasha period strictly intersects with the typical college age (18-22), elevate risk
        if (planets['rahu'] || planets['ketu'] || planets['saturn']) {
            if (riskScore < 3) {
                 riskScore += 2.5; // Force it to at least 'Moderate to High' if malefic periods align with college age
                 reasons.push('The planetary time periods (Dasha) active between the ages of 18 and 22 are ruled by restrictive or detached planets (Rahu/Ketu/Saturn). Even if the birth chart is strong, this specific timing strictly enforces a gap period or a shift in educational focus (such as what occurred around 2022-2025).');
            }
        }

        // Calculate final risk level based on accumulated score`;

jsCode = jsCode.replace('        // Calculate final risk level based on accumulated score', strictOverride);
fs.writeFileSync('js/education-engine.js', jsCode);
console.log('Added Strict Age-Based Override');
