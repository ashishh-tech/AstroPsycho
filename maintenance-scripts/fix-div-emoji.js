const fs = require('fs');
let c = fs.readFileSync('divisional.html', 'utf8');

const regex = /const PLANET_EMOJI *= *\{[^\}]+\};.*?const PLANET_NAMES *= *\{[^\}]+\};/g;

const replacement = "const PLANET_EMOJI = { sun: '☀️', moon: '🌙', mars: '♂️', mercury: '☿', jupiter: '♃', venus: '♀', saturn: '♄', rahu: '☊', ketu: '☋' }; const PLANET_NAMES = { sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu' };";

// Find exactly what is there now to be safe
const p = c.indexOf('PLANET_EMOJI');
if (p > 0) {
    const section = c.substring(p - 10, p + 300);
    console.log("Found section:");
    console.log(section);

    // Let's just replace from "const PLANET_EMOJI" up to the next valid constant or statement
    const startIdx = c.indexOf('const PLANET_EMOJI');
    const endIdx = c.indexOf('const SIGN_EMOJI');

    if (startIdx > 0 && endIdx > startIdx) {
        c = c.substring(0, startIdx) + replacement + '\n        ' + c.substring(endIdx);
        fs.writeFileSync('divisional.html', c, 'utf8');
        console.log("Successfully replaced the corrupted section!");
    } else {
        console.log("Couldn't find start/end indices");
    }
}
