const fs = require('fs');
const content = fs.readFileSync('results.html', 'utf8');

// Split every </a> <!-- comment --> <a on the same line so each card starts on its own line
const fixed = content
  // Remove inline HTML comments sitting between </a> and <a
  .replace(/\s*<\/a>\s*<!--[^>]*-->\s*(<a\s)/g, '\n            </a>\n\n            $1')
  // Also handle </a> <a without comment
  .replace(/\s*<\/a>\s*(<a\s)/g, '\n            </a>\n\n            $1')
  // Clean up the opening div line that has <!-- immediately after
  .replace(/(<div[^>]+>)\s*<!--[^>]*-->\s*(<a\s)/g, '$1\n\n            $2');

fs.writeFileSync('results.html', fixed, 'utf8');
console.log('Done! Nav cards separated.');
