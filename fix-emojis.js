const fs = require('fs');

function fixEmojis(filename) {
    if (!fs.existsSync(filename)) return;

    let content = fs.readFileSync(filename, 'utf8');

    // Core features
    content = content.replace('<div class="fc-icon">??</div>\r\n                <div class="fc-title">Vimshottari Dasha Analysis</div>', '<div class="fc-icon">⏱️</div>\r\n                <div class="fc-title">Vimshottari Dasha Analysis</div>');
    content = content.replace('<div class="fc-icon">??</div>\n                <div class="fc-title">Vimshottari Dasha Analysis</div>', '<div class="fc-icon">⏱️</div>\n                <div class="fc-title">Vimshottari Dasha Analysis</div>');

    content = content.replace('<div class="fc-icon">??</div>\r\n                <div class="fc-title">Psychological Assessment</div>', '<div class="fc-icon">🧠</div>\r\n                <div class="fc-title">Psychological Assessment</div>');
    content = content.replace('<div class="fc-icon">??</div>\n                <div class="fc-title">Psychological Assessment</div>', '<div class="fc-icon">🧠</div>\n                <div class="fc-title">Psychological Assessment</div>');

    content = content.replace('<div class="fc-icon">??</div>\r\n                <div class="fc-title">Classical Remedies</div>', '<div class="fc-icon">🌿</div>\r\n                <div class="fc-title">Classical Remedies</div>');
    content = content.replace('<div class="fc-icon">??</div>\n                <div class="fc-title">Classical Remedies</div>', '<div class="fc-icon">🌿</div>\n                <div class="fc-title">Classical Remedies</div>');

    content = content.replace('<div class="fc-icon">???</div>\r\n                <div class="fc-title">Full Shadbala Calculation</div>', '<div class="fc-icon">⚖️</div>\r\n                <div class="fc-title">Full Shadbala Calculation</div>');
    content = content.replace('<div class="fc-icon">???</div>\n                <div class="fc-title">Full Shadbala Calculation</div>', '<div class="fc-icon">⚖️</div>\n                <div class="fc-title">Full Shadbala Calculation</div>');

    content = content.replace('<div class="fc-icon">?</div>\r\n                <div class="fc-title">Ashtakavarga System</div>', '<div class="fc-icon">📊</div>\r\n                <div class="fc-title">Ashtakavarga System</div>');
    content = content.replace('<div class="fc-icon">?</div>\n                <div class="fc-title">Ashtakavarga System</div>', '<div class="fc-icon">📊</div>\n                <div class="fc-title">Ashtakavarga System</div>');

    content = content.replace('<div class="fc-icon">??</div>\r\n                <div class="fc-title">Divisional Charts (D1D12)</div>', '<div class="fc-icon">🎡</div>\r\n                <div class="fc-title">Divisional Charts (D1-D12)</div>');
    content = content.replace('<div class="fc-icon">??</div>\n                <div class="fc-title">Divisional Charts (D1D12)</div>', '<div class="fc-icon">🎡</div>\n                <div class="fc-title">Divisional Charts (D1-D12)</div>');

    // Modules list
    content = content.replace('<div class="module-chip">??? Birth Chart', '<div class="module-chip">✨ Birth Chart');
    content = content.replace('<div class="module-chip">?? Navamsha', '<div class="module-chip">🔮 Navamsha');
    content = content.replace('<div class="module-chip">?? Dashamsha', '<div class="module-chip">💼 Dashamsha');
    content = content.replace('<div class="module-chip">?? Varshaphala', '<div class="module-chip">📅 Varshaphala');
    content = content.replace('<div class="module-chip">?? Solar Return', '<div class="module-chip">☀️ Solar Return');
    content = content.replace('<div class="module-chip">? Ashtakavarga', '<div class="module-chip">📊 Ashtakavarga');
    content = content.replace('<div class="module-chip">?? Shadbala', '<div class="module-chip">⚖️ Shadbala');
    content = content.replace('<div class="module-chip">?? Yoga Analysis', '<div class="module-chip">🧘 Yoga Analysis');
    content = content.replace('<div class="module-chip">?? Dosha Analysis', '<div class="module-chip">⚠️ Dosha Analysis');
    content = content.replace('<div class="module-chip">?? Kundali Matching', '<div class="module-chip">💞 Kundali Matching');
    content = content.replace('<div class="module-chip">?? Planet Conjunctions', '<div class="module-chip">🔗 Planet Conjunctions');
    content = content.replace('<div class="module-chip">?? Moon Analysis', '<div class="module-chip">🌙 Moon Analysis');
    content = content.replace('<div class="module-chip">?? House Predictions', '<div class="module-chip">🏠 House Predictions');
    content = content.replace('<div class="module-chip">?? Wealth Analysis', '<div class="module-chip">💰 Wealth Analysis');
    content = content.replace('<div class="module-chip">?? Relationship Report', '<div class="module-chip">❤️ Relationship Report');
    content = content.replace('<div class="module-chip">?? Education Timeline', '<div class="module-chip">🎓 Education Timeline');
    content = content.replace('<div class="module-chip">?? Ayur Jyotish', '<div class="module-chip">⚕️ Ayur Jyotish');
    content = content.replace('<div class="module-chip">?? Transit Tracker', '<div class="module-chip">🛤️ Transit Tracker');
    content = content.replace('<div class="module-chip">?? Muhurta (Timing)', '<div class="module-chip">⏰ Muhurta (Timing)');
    content = content.replace('<div class="module-chip">?? Prasna Kundali', '<div class="module-chip">❓ Prasna Kundali');

    // Planets list
    content = content.replace('<span class="pc-emoji">?</span><span class="pc-name">Surya</span>', '<span class="pc-emoji">☀️</span><span class="pc-name">Surya</span>');
    content = content.replace('<span class="pc-emoji">?</span><span class="pc-name">Chandra</span>', '<span class="pc-emoji">🌕</span><span class="pc-name">Chandra</span>');
    content = content.replace('<span class="pc-emoji">?</span><span class="pc-name">Mangal</span>', '<span class="pc-emoji">🔴</span><span class="pc-name">Mangal</span>');
    content = content.replace('<span class="pc-emoji">?</span><span class="pc-name">Budha</span>', '<span class="pc-emoji">🟢</span><span class="pc-name">Budha</span>');
    content = content.replace('<span class="pc-emoji">?</span><span class="pc-name">Guru</span>', '<span class="pc-emoji">🟡</span><span class="pc-name">Guru</span>');
    content = content.replace('<span class="pc-emoji">?</span><span class="pc-name">Shukra</span>', '<span class="pc-emoji">✨</span><span class="pc-name">Shukra</span>');
    content = content.replace('<span class="pc-emoji">?</span><span class="pc-name">Shani</span>', '<span class="pc-emoji">🪐</span><span class="pc-name">Shani</span>');
    content = content.replace('<span class="pc-emoji">?</span><span class="pc-name">Rahu</span>', '<span class="pc-emoji">🌑</span><span class="pc-name">Rahu</span>');
    content = content.replace('<span class="pc-emoji">?</span><span class="pc-name">Ketu</span>', '<span class="pc-emoji">🔥</span><span class="pc-name">Ketu</span>');

    // Nav & badges & bullets
    content = content.replace('<span class="nav-logo-star">?</span>', '<span class="nav-logo-star">✨</span>');
    content = content.replace('Begin Journey ?</a>', 'Begin Journey ✨</a>');
    content = content.replace('<div class="cta-badge">? Free', '<div class="cta-badge">✨ Free');
    content = content.replace('? Engine Accuracy', '🎯 Engine Accuracy');
    content = content.replaceAll('', '-'); // Safe replacement for broken bullets

    fs.writeFileSync(filename, content, 'utf8');
    console.log(`Successfully fixed emojis in ${filename}`);
}

fixEmojis('index.html');
