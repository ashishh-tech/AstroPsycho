/**
 * fix-script-html.js
 * 
 * Fixes the classic bug where a template literal in an inline <script> block
 * contains </script> which terminates the script block prematurely for the
 * HTML parser (even though it's inside a string/template literal).
 * 
 * The fix: escape </script> inside template literals/strings as <\/script>
   * or split it: '<' + '/script>'
 * 
 * Also checks ALL HTML files for this bug.
 */
const fs = require('fs');

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let totalFixed = 0;

htmlFiles.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    const orig = content;

    // Find all inline script blocks and fix </script> inside template literals/strings
    // Strategy: replace </script> that appears inside a <script> block
    // with <\/script> so the HTML parser doesn't terminate the block

    let result = '';
    let searchPos = 0;

    while (true) {
        // Find next <script (could be opening inline or external)
        const scriptOpen = content.indexOf('<script', searchPos);
        if (scriptOpen < 0) {
            result += content.substring(searchPos);
            break;
        }

        // Get to end of opening tag
        const tagClose = content.indexOf('>', scriptOpen);
        const openTag = content.substring(scriptOpen, tagClose + 1);

        // Find matching </script>
        const scriptClose = content.indexOf('</script>', tagClose);
        if (scriptClose < 0) {
            result += content.substring(searchPos);
            break;
        }

        // Append everything up to and including the opening tag
        result += content.substring(searchPos, tagClose + 1);

        if (!openTag.includes('src=')) {
            // This is an inline script block — fix any internal </script> occurrences
            // that appear inside template literals or strings
            let scriptBody = content.substring(tagClose + 1, scriptClose);

            // Check if there's any </ inside (potential premature close)
            if (scriptBody.includes('</')) {
                // Replace </script> (case insensitive) with <\/script>  
                // BUT only inside strings/template literals (i.e. not the real closing tag)
                // Since we already have the body between the FIRST </script>, any </script>
                // in here is inside a string and must be escaped
                scriptBody = scriptBody.replace(/<\/script>/gi, '<\\/script>');
                // Also fix any template literals with </ sequences that could trip parser
                // Common pattern: `<div>...</div>` inside script
                // We fix by escaping the closing slash
                scriptBody = scriptBody.replace(/<\//g, '<\\/');
            }

            result += scriptBody;
        } else {
            // External script — just copy the (empty) body as-is
            result += content.substring(tagClose + 1, scriptClose);
        }

        // Append the closing </script>
        result += '</script>';
        searchPos = scriptClose + 9; // length of '</script>'
    }

    if (result !== orig) {
        fs.writeFileSync(f, result, 'utf8');
        totalFixed++;
        console.log(`✓ FIXED: ${f}`);
    }
});

console.log(`\n✅ Done. Fixed ${totalFixed} files.`);
