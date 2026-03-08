const fs = require('fs');

const file = 'index.html';
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // U+FFFD is the replacement character ""
    const brokenChar = '\uFFFD';

    // Replace specific known bad strings containing the symbol first for styling logic
    content = content.replace(new RegExp(`Ancient Wisdom ${brokenChar} Modern Psychology ${brokenChar} Vedic Science`, 'g'),
        'Ancient Wisdom • Modern Psychology • Vedic Science');

    content = content.replace(new RegExp(`Verified ${brokenChar} 10 Celebrity Charts`, 'g'),
        'Verified • 10 Celebrity Charts');

    content = content.replace(new RegExp(`Dasha ${brokenChar} Charts ${brokenChar} Yoga ${brokenChar} Dosha`, 'g'),
        'Dasha • Charts • Yoga • Dosha');

    content = content.replace(new RegExp(`Custom-built engine ${brokenChar} no API`, 'g'),
        'Custom-built engine • no API');

    content = content.replace(new RegExp(`Free ${brokenChar} No Account Needed ${brokenChar} Instant Report`, 'g'),
        'Free • No Account Needed • Instant Report');

    content = content.replace(new RegExp(`Engine Accuracy: 100% \\(A\\+ Exceptional\\) ${brokenChar} Verified against 10 celebrity charts ${brokenChar}`, 'g'),
        'Engine Accuracy: 100% (A+ Exceptional) • Verified against 10 celebrity charts •');

    content = content.replace(new RegExp(`years ${brokenChar} Soul`, 'g'), 'years • Soul');
    content = content.replace(new RegExp(`years ${brokenChar} Mind`, 'g'), 'years • Mind');
    content = content.replace(new RegExp(`years ${brokenChar} Energy`, 'g'), 'years • Energy');
    content = content.replace(new RegExp(`years ${brokenChar} Intellect`, 'g'), 'years • Intellect');
    content = content.replace(new RegExp(`years ${brokenChar} Wisdom`, 'g'), 'years • Wisdom');
    content = content.replace(new RegExp(`years ${brokenChar} Love`, 'g'), 'years • Love');
    content = content.replace(new RegExp(`years ${brokenChar} Karma`, 'g'), 'years • Karma');
    content = content.replace(new RegExp(`years ${brokenChar} Illusion`, 'g'), 'years • Illusion');
    content = content.replace(new RegExp(`years ${brokenChar} Moksha`, 'g'), 'years • Moksha');

    // General replacements for any leftover 
    // Common occurrences in descriptions are meant to be em-dashes
    content = content.replace(new RegExp(` ${brokenChar} `, 'g'), ' — ');
    content = content.replace(new RegExp(brokenChar, 'g'), '-');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned up broken characters in ${file}`);
}
