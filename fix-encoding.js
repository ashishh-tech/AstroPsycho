const fs = require('fs');

try {
    // Read the raw buffer to detect UTF-16 LE / UCS-2
    const buffer = fs.readFileSync('index.html');

    // Check if it's UTF-16 LE (starts with FF FE)
    let isUTF16LE = false;
    let isUTF16BE = false;

    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
        isUTF16LE = true;
        console.log("Detected UTF-16 LE encoding with BOM. Fixing...");
    } else if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
        isUTF16BE = true;
        console.log("Detected UTF-16 BE encoding with BOM. Fixing...");
    } else if (buffer.length > 2 && buffer[1] === 0) {
        isUTF16LE = true; // Probably UTF16-LE without BOM
        console.log("Detected UTF-16 LE (no BOM). Fixing...");
    }

    // Default read will try utf8. But if it's UTF-16 LE, we need to read it as utf16le
    let content;
    if (isUTF16LE || isUTF16BE || buffer.toString('utf8').includes('\u0000')) {
        // If there are null bytes, it was definitely saved as 16-bit
        content = buffer.toString('utf16le');

        // Remove BOM if present
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.substring(1);
        }
    } else {
        // Was likely just standard UTF-8 read incorrectly
        content = buffer.toString('utf8');

        // Fix the weird dashes/spaces if it was literally written as " -d-o-c..."
        if (content.includes('- -d-o-c')) {
            console.log("Found literal null/space artifacts. Cleaning up...");
            content = content.replace(/\x00/g, ''); // Remove null bytes
        }
    }

    // Strip null bytes just in case
    content = content.replace(/\0/g, '');

    // Write back as strict UTF-8
    fs.writeFileSync('index.html', content, 'utf8');
    console.log("Successfully converted index.html back to clean UTF-8 text.");

} catch (e) {
    console.error("Error fixing encoding:", e);
}
