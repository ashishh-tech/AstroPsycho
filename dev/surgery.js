const fs = require('fs');

const eduSrc = fs.readFileSync('js/education-engine.js', 'utf8');

const newGapYearLogic = `    _gapYearRisk(satHouse, satStr, h4, h5, h9, rahuHouse, ketuHouse, planets, getLordOfHouse, getHouse, strength) {
        let risk = 'Low', reasons = [], remedies = [];
        let riskScore = 0;

        // 1. Saturn placed in educational houses
        if (satHouse === 4 || satHouse === 5 || satHouse === 9) {
            riskScore += 2.5;
            reasons.push('Saturn in the 4th, 5th, or 9th house causes delays and interruptions in education — often manifesting as gap years, repeated attempts, or slow academic progress.');
            remedies.push('Worship Lord Shiva every Monday. Recite Shani mantra: "Om Shanaye Namaha" 108 times on Saturdays.');
        } else {
            // Saturn's 3rd, 7th, 10th drishti (aspect)
            let satAspects = [(satHouse + 2) % 12 || 12, (satHouse + 6) % 12 || 12, (satHouse + 9) % 12 || 12];
            if (satAspects.includes(4) || satAspects.includes(5) || satAspects.includes(9)) {
                riskScore += 1.5;
                reasons.push('Saturn\\'s aspect on educational houses introduces strict discipline requirements but often brings delays or a mandatory gap period to build maturity.');
            }
        }

        // 2. Lordship Anomalies (Dusthana placements or debilitation)
        const lord4 = getLordOfHouse(4);
        const lord5 = getLordOfHouse(5);
        const lord9 = getLordOfHouse(9);
        
        [lord4, lord5, lord9].forEach((lord, idx) => {
            const hName = idx === 0 ? '4th' : idx === 1 ? '5th' : '9th';
            const lordH = getHouse(lord);
            const lordStr = strength(lord);
            
            if (lordH === 6 || lordH === 8 || lordH === 12) {
                riskScore += 1.5;
                reasons.push(\`The Lord of the \${hName} house (\${lord.charAt(0).toUpperCase() + lord.slice(1)}) is placed in a Dusthana (6th, 8th, or 12th) house, creating natural breaks, obstacles, or periods of isolation during the educational journey.\`);
                if (!remedies.some(r => r.includes('Dakshinamurthy'))) remedies.push('Chant Sri Dakshinamurthy Stotram or worship your Ishta Devata to remove obstacles to learning caused by planetary placements.');
            }
            if (lordStr === 'debilitated') {
                riskScore += 2.0;
                reasons.push(\`The Lord of the \${hName} house (\${lord.charAt(0).toUpperCase() + lord.slice(1)}) is debilitated, weakening the foundation of continuous study and often forcing a gap year to recalibrate.\`);
            }
        });

        // 3. Debilitated Saturn
        if (satStr === 'debilitated') {
            riskScore += 2;
            reasons.push('A debilitated Saturn creates severe obstructions, delays, and frustrations in educational journeys.');
            remedies.push('Donate black sesame seeds on Saturdays or serve the elderly consistently.');
        }

        // 4. Rahu in educational houses
        if (h4.includes('rahu') || h5.includes('rahu') || h9.includes('rahu') || rahuHouse === 4 || rahuHouse === 5 || rahuHouse === 9) {
            riskScore += 2;
            reasons.push('Rahu influencing the 4th, 5th, or 9th house often causes sudden shifts in academic direction — changing streams, unconventional choices, or sudden breaks due to confusion.');
            if (!remedies.some(r => r.includes('crows'))) remedies.push('Feed crows on Saturdays and meditate to focus on a single goal rather than many at once.');
        }

        // 5. Ketu in educational houses (Detachment)
        if (ketuHouse === 4 || ketuHouse === 5 || ketuHouse === 9) {
            riskScore += 2;
            reasons.push('Ketu in an educational house brings a deep sense of detachment or dissatisfaction with formal education, frequently resulting in a gap year to "find oneself".');
            if (!remedies.some(r => r.includes('Ganesha'))) remedies.push('Worship Lord Ganesha to remove obstacles in learning and prevent aimless wandering.');
        }

        // 6. Mars in educational houses (Impulsiveness)
        if (h4.includes('mars') || h5.includes('mars') || h9.includes('mars')) {
            riskScore += 1;
            reasons.push('Mars in primary education houses can disrupt the peaceful mindset needed for sustained study — often causing impulsive academic decisions that necessitate a break.');
        }

        // Calculate final risk level based on accumulated score
        if (riskScore >= 4.5) {
            risk = 'High';
        } else if (riskScore >= 3) {
            risk = 'Moderate to High';
        } else if (riskScore >= 1.5) {
            risk = 'Moderate';
        } else if (riskScore > 0) {
            risk = 'Low to Moderate';
        } else {
            risk = 'Low';
        }

        if (risk === 'Low') {
            reasons.push('Your planetary configuration does not show significant risk of gap years or breaks in education. The educational journey is likely to proceed in a consistent and timely manner.');
            remedies.push('Maintain consistency. Even in favorable charts, revisiting notes and regular revision is always beneficial.');
        }

        // Deduplicate remedies and limit to max 3
        remedies = [...new Set(remedies)].slice(0, 3);
        
        return { risk, reasons, remedies };
    }
`;

const lines = eduSrc.split('\n');
let startIdx = -1, endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('_gapYearRisk(satHouse, satStr, h4, h5, h9, rahuHouse, ketuHouse, planets) {')) {
        startIdx = i;
    }
    // Search for end of function
    if (startIdx !== -1 && i > startIdx && lines[i].includes('        return { risk, reasons, remedies };')) {
        endIdx = i + 1;
        break;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const newSrc = lines.slice(0, startIdx).join('\n') + '\n' + newGapYearLogic + lines.slice(endIdx + 1).join('\n');
    fs.writeFileSync('js/education-engine.js', newSrc);
    console.log('Successfully replaced _gapYearRisk!');
} else {
    console.log('Failed to locate _gapYearRisk block.', startIdx, endIdx);
}
