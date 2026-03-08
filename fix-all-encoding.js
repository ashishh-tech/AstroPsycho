/**
 * fix-encoding-v2.js
 * 
 * These files have UTF-8 text that was corrupted when special unicode characters
 * (em-dashes, quotes, emojis) were converted to garbled sequences.
 * 
 * Known corruptions based on actual file analysis:
 * - ΓÇö → — (em dash U+2014)
 * - ΓÇô → – (en dash U+2013)  
 * - Γ£ª → ✦ (four pointed star)
 * - ΓÿÇ → ☇ or emoji prefix 
 * - ΓÜû → ⚛
 * - ΓÜá → ☁
 * - ΓÜò → ⚒
 * - ΓÅ▒ → character
 * - ΓÅ░ → character
 * - ∩╕Å → (variation selector - remove)
 * - ΓÇó → •  (bullet)
 * - ΓÇÖ → '  (right single quote)
 * - ΓÇ£ → "  (left double quote)
 * - ΓÇ¥ → "  (right double quote)
 * - ≡ƒXX → emoji  (4-byte emoji that got corrupted)
 */

const fs = require('fs');
const path = require('path');

// The comprehensive replacement map
const FIXES = [
    // Punctuation - most common
    ['ΓÇö', '—'],          // em dash
    ['ΓÇô', '–'],          // en dash
    ['ΓÇ£', '\u201C'],     // left double quote "
    ['ΓÇ¥', '\u201D'],     // right double quote "
    ['ΓÇÿ', '\u2018'],     // left single quote '
    ['ΓÇÖ', '\u2019'],     // right single quote '
    ['ΓÇó', '\u2022'],     // bullet •
    ['ΓÇÜ', '\u203A'],     // single right angle quote ›
    ['ΓÇ╗', '\u00BB'],     // double right angle »
    ['ΓÇ½', '\u203A'],     // single angle
    ['ΓÇ»', '\u00BB'],     // double angle

    // Stars and decorative
    ['Γ£ª', '✦'],          // ✦ FOUR POINTED BLACK STAR U+2726
    ['Γ£░', '▒'],

    // Variation selector (cosmetic, remove)
    ['∩╕Å', ''],

    // Unicode symbol corruption
    ['ΓÜÖ', '⚡'],         // ⚡ lightning
    ['ΓÜò', '⚒'],          // ⚒
    ['ΓÜû', '⚛'],          // ⚛  atom
    ['ΓÜá', '☁'],          // ☁ cloud
    ['ΓÜà', '☀'],          // ☀ sun
    ['ΓÜÿ', '☿'],          // ☿ Mercury
    ['ΓÜó', '⚓'],          // ⚓ anchor
    ['ΓÜî', '⚎'],
    ['ΓÜä', '☄'],          // ☄ comet

    // Sparkles/decorative (ΓÅ series)
    ['ΓÅ▒', '✒'],
    ['ΓÅ░', '✐'],
    ['ΓÅó', '✓'],
    ['ΓÅô', '✔'],

    // 4-byte emoji corruption (≡ƒXY patterns)
    // These are emoji bytes that got interpreted as CP1252
    // Each 4-byte emoji (F0 9F XX YY) gets corrupted to ≡ƒ + two CP1252 chars
    // We match the most common ones used in this astrology app:

    // 🌙 Moon face emojis
    ['≡ƒîò', '🌒'],         // 🌒 waxing crescent (Moon/Chandra)
    ['≡ƒîÖ', '�'],         // 🌖 waning gibbous
    ['≡ƒîó', '🌓'],         // 🌓 first quarter
    ['≡ƒî┐', '🌿'],         // 🌿 herb/leaf
    ['≡ƒîæ', '🌆'],         // 🌆 cityscape at dusk (Rahu)
    ['≡ƒî╝', '🌼'],         // 🌼
    ['≡ƒîî', '🌎'],         // 🌎 earth globe

    // 🔥🔴 fire/circle (Ketu/Mars)
    ['≡ƒöÑ', '🔥'],         // 🔥 fire  
    ['≡ƒö┤', '�'],         // � red circle
    ['≡ƒöä', '�'],         // 🔄 recycle
    ['≡ƒöù', '�'],         // 🔙
    ['≡ƒö«', '�'],         // �
    ['≡ƒöú', '�'],         // �

    // 📈📊📖📂 document/chart
    ['≡ƒôà', '📂'],         // 📂 folder
    ['≡ƒôè', '📈'],         // 📈 chart
    ['≡ƒôí', '📍'],         // 📍 pushpin
    ['≡ƒôü', '📜'],         // 📜 scroll
    ['≡ƒô»', '📻'],         // � radio
    ['≡ƒôö', '�'],         // � book
    ['≡ƒôú', '�'],         // � books
    ['≡ƒôâ', '�'],         // � loudspeaker
    ['≡ƒô¿', '�'],         // � prayer beads

    // 👑� person/crown
    ['≡ƒÆÑ', '�'],         // � crown
    ['≡ƒÆ₼', '�'],         // � angel
    ['≡ƒÆú', '�'],         // � shirt
    ['≡ƒÆ│', '�'],         // � man with turban
    ['≡ƒÆ₧', '�'],         // � girl
    ['≡ƒÆ░', '�'],         // � bride
    ['≡ƒÆ╝', '🏼'],         // skin tone

    // 🙏 prayer/face emojis
    ['≡ƒüä', '�'],         // � rolling eyes
    ['≡ƒü¥', '�'],
    ['≡ƒüÑ', '�'],
    ['≡ƒü«', '�'],
    ['≡ƒü╣', '�'],
    ['≡ƒüù', '�'],
    ['≡ƒüú', '�'],
    ['≡ƒü│', '�'],
    ['≡ƒü₧', '�'],
    ['≡ƒü░', '�'],
    ['≡ƒü¬', '�'],
    ['≡ƒüà', '�'],         // � scream cat

    // 🅍🄱 boxed letters
    ['≡ƒÄí', '🅍'],
    ['≡ƒÄô', '🄔'],
    ['≡ƒÄ»', '🄻'],
    ['≡ƒÄ¥', '🄥'],
    ['≡ƒÄ«', '🄫'],
    ['≡ƒÄ░', '🄰'],

    // 🺟🺡🺒 - unusual emoji ranges
    ['≡ƒº░', '🺰'],
    ['≡ƒº▒', '🺱'],
    ['≡ƒº▓', '🺲'],
    ['≡ƒº│', '🺳'],
    ['≡ƒºÿ', '🺿'],
    ['≡ƒºá', '🺡'],

    // 🔮💫✨ - mystic/sparkle
    ['≡ƒöä', '🔄'],
    ['≡ƒòá', '💡'],
    ['≡ƒò│', '💳'],

    // 🐉🐲 dragon
    ['≡ƒÐ▒', '🐱'],
    ['≡ƒÐ┤', '🐴'],

    // 💎💍 gems
    ['≡ƒí¥', '💥'],         // 💥 collision
    ['≡ƒí«', '💫'],         // 💫 dizzy
    ['≡ƒíé', '💢'],         // 💢 anger
    ['≡ƒíà', '💀'],         // 💀 skull
    ['≡ƒíó', '💓'],         // 💓 heartbeat
    ['≡ƒíò', '💒'],         // 💒 love hotel

    // Specific ones seen in this app:
    ['≡ƒ¬É', '🬉'],         // Saturn symbol area
    ['≡ƒ¢ñ', '🢑'],         // transit arrow
    ['≡ƒÿ░', '🟰'],         // equality
    ['≡ƒÿÿ', '�'],
    ['≡ƒÿÖ', '🟖'],
    ['≡ƒÿ₧', '🟧'],
    ['≡ƒñ¡', '🗡'],          // 🗡 dagger
    ['≡ƒñÄ', '🗄'],          // 🗄 file cabinet
    ['≡ƒñÿ', '🗟'],
    ['≡ƒñ│', '🗳'],          // 🗳 ballot

    // 🏔🏠🏰 buildings
    ['≡ƒÅÑ', '🅑'],
    ['≡ƒÅê', '🅊'],

    // Generic cleanup for remaining ≡ƒ patterns we couldn't identify
    // Strip the prefix and hope the suffix makes some sense
    // Actually - we'll leave remaining ones as a note
];

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    for (const [bad, good] of FIXES) {
        // Use global replace
        content = content.split(bad).join(good);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        // Count replacements
        let count = 0;
        for (const [bad] of FIXES) {
            count += (original.split(bad).length - 1);
        }
        console.log(`✓ FIXED: ${path.basename(filePath)} (${count} replacements)`);
        return true;
    } else {
        console.log(`- UNCHANGED: ${path.basename(filePath)}`);
        return false;
    }
}

// Files to fix
const BASE = __dirname;
const targets = [
    'index.html',
    'dasha-remedies.html',
    'education.html',
    'panchang.html',
    'planetary-clock.html',
    'wealth.html'
];

console.log('AstroPsycho Encoding Fixer v2\n');
let fixed = 0;
for (const t of targets) {
    const fp = path.join(BASE, t);
    if (fs.existsSync(fp)) {
        if (fixFile(fp)) fixed++;
    } else {
        console.log(`✗ NOT FOUND: ${t}`);
    }
}
console.log(`\n✅ Complete. Fixed ${fixed}/${targets.length} files.`);
