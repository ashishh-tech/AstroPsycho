const https = require('https');
const fs = require('fs');

console.log('Downloading clean index.html from Netlify...');

https.get('https://astro-psyco.netlify.app/index.html', res => {
    let chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
        let data = Buffer.concat(chunks).toString('utf8');
        console.log('Downloaded OK. Size:', data.length);
        console.log('IS VALID HTML:', data.includes('<!DOCTYPE html>'));

        // Emoji replacements - NO replaceAll('', ...) bug!
        data = data.replace(/\?\?\? Birth Chart/g, '✨ Birth Chart');
        data = data.replace(/\?\? Navamsha/g, '🔮 Navamsha');
        data = data.replace(/\?\? Dashamsha/g, '💼 Dashamsha');
        data = data.replace(/\?\? Varshaphala/g, '📅 Varshaphala');
        data = data.replace(/\?\? Solar Return/g, '☀️ Solar Return');
        data = data.replace(/\? Ashtakavarga/g, '📊 Ashtakavarga');
        data = data.replace(/\?\? Shadbala/g, '⚖️ Shadbala');
        data = data.replace(/\?\? Yoga Analysis/g, '🧘 Yoga Analysis');
        data = data.replace(/\?\? Dosha Analysis/g, '⚠️ Dosha Analysis');
        data = data.replace(/\?\? Kundali Matching/g, '💞 Kundali Matching');
        data = data.replace(/\?\? Planet Conjunctions/g, '🔗 Planet Conjunctions');
        data = data.replace(/\?\? Moon Analysis/g, '🌙 Moon Analysis');
        data = data.replace(/\?\? House Predictions/g, '🏠 House Predictions');
        data = data.replace(/\?\? Wealth Analysis/g, '💰 Wealth Analysis');
        data = data.replace(/\?\? Relationship Report/g, '❤️ Relationship Report');
        data = data.replace(/\?\? Education Timeline/g, '🎓 Education Timeline');
        data = data.replace(/\?\? Ayur Jyotish/g, '⚕️ Ayur Jyotish');
        data = data.replace(/\?\? Transit Tracker/g, '🛤️ Transit Tracker');
        data = data.replace(/\?\? Muhurta \(Timing\)/g, '⏰ Muhurta (Timing)');
        data = data.replace(/\?\? Prasna Kundali/g, '❓ Prasna Kundali');

        // Feature card icons using context (regex lookaheads)
        data = data.replace(/\?\?(<\/div>\s*<div class="fc-title">Vimshottari)/g, '⏱️$1');
        data = data.replace(/\?\?(<\/div>\s*<div class="fc-title">Psychological Assessment)/g, '🧠$1');
        data = data.replace(/\?\?(<\/div>\s*<div class="fc-title">Classical Remedies)/g, '🌿$1');
        data = data.replace(/\?\?\?(<\/div>\s*<div class="fc-title">Full Shadbala)/g, '⚖️$1');
        data = data.replace(/\?(<\/div>\s*<div class="fc-title">Ashtakavarga)/g, '📊$1');
        data = data.replace(/\?\?(<\/div>\s*<div class="fc-title">Divisional Charts)/g, '🎡$1');

        // Planet cards
        data = data.replace(/"pc-emoji">\?<\/span><span class="pc-name">Surya/g, '"pc-emoji">☀️</span><span class="pc-name">Surya');
        data = data.replace(/"pc-emoji">\?<\/span><span class="pc-name">Chandra/g, '"pc-emoji">🌕</span><span class="pc-name">Chandra');
        data = data.replace(/"pc-emoji">\?<\/span><span class="pc-name">Mangal/g, '"pc-emoji">🔴</span><span class="pc-name">Mangal');
        data = data.replace(/"pc-emoji">\?<\/span><span class="pc-name">Budha/g, '"pc-emoji">🟢</span><span class="pc-name">Budha');
        data = data.replace(/"pc-emoji">\?<\/span><span class="pc-name">Guru/g, '"pc-emoji">🟡</span><span class="pc-name">Guru');
        data = data.replace(/"pc-emoji">\?<\/span><span class="pc-name">Shukra/g, '"pc-emoji">✨</span><span class="pc-name">Shukra');
        data = data.replace(/"pc-emoji">\?<\/span><span class="pc-name">Shani/g, '"pc-emoji">🪐</span><span class="pc-name">Shani');
        data = data.replace(/"pc-emoji">\?<\/span><span class="pc-name">Rahu/g, '"pc-emoji">🌑</span><span class="pc-name">Rahu');
        data = data.replace(/"pc-emoji">\?<\/span><span class="pc-name">Ketu/g, '"pc-emoji">🔥</span><span class="pc-name">Ketu');

        // Nav star and CTA
        data = data.replace('nav-logo-star">?</span>', 'nav-logo-star">✦</span>');
        data = data.replace('Begin Journey ?</a>', 'Begin Journey →</a>');
        data = data.replace('cta-badge">? Free', 'cta-badge">✨ Free');
        data = data.replace('? Engine Accuracy', '🎯 Engine Accuracy');

        fs.writeFileSync('index.html', data, 'utf8');
        console.log('DONE! index.html saved cleanly as UTF-8.');
        console.log('First 100 chars:', data.substring(0, 100));
    });
}).on('error', e => {
    console.error('DOWNLOAD ERROR:', e.message);
});
