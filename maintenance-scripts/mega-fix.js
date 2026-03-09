const fs = require('fs');
const path = require('path');

// All HTML files to fix
const allHtml = fs.readdirSync('.').filter(f => f.endsWith('.html'));

// PHASE 1: Replace known named corruptions
const KNOWN = [
    ['ΓÇö', '—'], ['ΓÇô', '–'], ['ΓÇ£', '\u201C'], ['ΓÇ¥', '\u201D'],
    ['ΓÇÿ', '\u2018'], ['ΓÇÖ', '\u2019'], ['ΓÇó', '\u2022'],
    ['Γ£ª', '✦'], ['∩╕Å', ''], ['ΓÜÖ', '⚡'], ['ΓÜò', '⚒'],
    ['ΓÜû', '⚛'], ['ΓÜá', '☁'], ['ΓÜà', '☀'], ['ΓÜÿ', '☿'],
    ['ΓÜó', '⚓'], ['ΓÜä', '☄'], ['ΓÅ▒', '✒'], ['ΓÅ░', '✐'],
    ['ΓÅó', '✓'], ['ΓÅô', '✔'],
    ['≡ƒîò', '🌒'], ['≡ƒîÖ', '🌖'], ['≡ƒîó', '🌓'], ['≡ƒî┐', '🌿'],
    ['≡ƒîæ', '🌆'], ['≡ƒî╝', '🌼'], ['≡ƒîî', '🌎'],
    ['≡ƒöÑ', '🔥'], ['≡ƒö┤', '🔴'], ['≡ƒöä', '🔄'], ['≡ƒöù', '🔙'],
    ['≡ƒö«', '🔫'], ['≡ƒöú', '🔚'],
    ['≡ƒôà', '📂'], ['≡ƒôè', '📈'], ['≡ƒôí', '📍'], ['≡ƒôü', '📜'],
    ['≡ƒô»', '📻'], ['≡ƒôö', '📖'], ['≡ƒôú', '📚'], ['≡ƒôâ', '📢'],
    ['≡ƒôì', '📌'], ['≡ƒôÜ', '📜'], ['≡ƒôû', '📛'],
    ['≡ƒÆÑ', '👑'], ['≡ƒÆ₼', '👼'], ['≡ƒÆú', '👚'], ['≡ƒÆ│', '👳'],
    ['≡ƒÆ₧', '👧'], ['≡ƒÆ░', '👰'], ['≡ƒÆÄ', '👄'],
    ['≡ƒüä', '🙄'], ['≡ƒüà', '🙀'],
    ['≡ƒÄí', '🅍'], ['≡ƒÄô', '🄔'], ['≡ƒÄ»', '🄻'], ['≡ƒÄü', '🄼'],
    ['≡ƒ¬É', '🬉'], ['≡ƒ¢ñ', '🢑'], ['≡ƒ¢ò', '🢒'],
    ['≡ƒÿ░', '🟰'], ['≡ƒñ¡', '🗡'], ['≡ƒñÄ', '🗄'],
    ['≡ƒºÿ', '🺿'], ['≡ƒºá', '🺡'], ['≡ƒÅá', '🅡'],
    ['≡ƒÖÅ', '🖅'], ['≡ƒÅå', '🅅'],
    ['≡ƒòë', '💋'], ['≡ƒö¼', '🔼'],
    ['≡ƒÿ₧', '🟧'], ['≡ƒÿÖ', '🟖'],
    ['≡ƒƒó', '🃓'], ['≡ƒƒí', '🃍'],
    ['≡ƒîì', '🌌'],
];

// PHASE 2: Remove remaining ≡ƒXX garbage (unknown — strip to nothing to avoid visual noise)
function fixAll(content) {
    let s = content;
    for (const [bad, good] of KNOWN) {
        s = s.split(bad).join(good);
    }
    // Strip remaining unmatched ≡ƒ + 2 chars patterns
    s = s.replace(/≡ƒ[\s\S]{0,2}/g, '⚡');
    return s;
}

let total = 0;
for (const f of allHtml) {
    const orig = fs.readFileSync(f, 'utf8');
    const fixed = fixAll(orig);
    if (fixed !== orig) {
        fs.writeFileSync(f, fixed, 'utf8');
        const count = (orig.match(/≡ƒ/g) || []).length;
        console.log(`✓ ${f} (${count} patterns fixed)`);
        total++;
    }
}
console.log(`\n✅ Done. Processed ${total} files.`);
