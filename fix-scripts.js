const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Find all <script>...</script> blocks
    content = content.replace(/<script>([\s\S]*?)<\/script>/g, (match, scriptContent) => {
        // Replace "// comment      code" with "\n// comment\ncode"
        // Also catch "// comment} " if someone didn't space it. Wait, the rule is usually \s{2,}
        const fixedScript = scriptContent.replace(/\/\/ (.+?)( {2,}|\t+)/g, '\n/* $1 */\n');
        return `<script>${fixedScript}</script>`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed comments in ${file}`);
});
