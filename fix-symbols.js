const fs = require('fs');

const files = [
    'dasha-remedies.html',
    'education.html',
    'index.html',
    'panchang.html',
    'planetary-clock.html',
    'wealth.html'
];

const map = {
    'ΓåÉ': '←',
    'ΓåÆ': '→',
    'Γ£¿': '✨',
    'ΓöÇ': '─',
    'ΓÿÇ': '☀️',
    'ΓÖé': '♂️',
    'Γÿ┐': '☿',
    'ΓÖâ': '♃',
    'ΓÖÇ': '♀',
    'ΓÖä': '♄',
    'Γÿè': '🐉',
    'Γÿï': '☄️',
    'ΓÅ╕': '⏳',
    'Γ¥ñ': '❤️',
    'Γ¥ô': '🔮',
    'ΓÜí': '🔄',
    'Γ¡É': '⭐'
};

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Replace all keys
    for (const [key, val] of Object.entries(map)) {
        content = content.split(key).join(val);
    }
    
    // Manual replacements for the replacement character (U+FFFD)
    content = content.replace(' Tithi', '🌙 Tithi');
    content = content.replace(' Rahu Kaal', '⚠️ Rahu Kaal');
    content = content.replace(' Moon Longitude', '🌙 Moon Longitude');
    content = content.replace(' Moon (Chandra)', '🌙 Moon (Chandra)');
    content = content.replace(' Daily Vrat', '🙏 Daily Vrat');
    content = content.replace(' Muhurta', '⏰ Muhurta');
    
    // In index.html specifically: 
    content = content.replace(' Daily Panchang', '📅 Daily Panchang');
    
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Successfully fixed symbols in ${f}`);
});
