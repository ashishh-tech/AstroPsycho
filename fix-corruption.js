const fs = require('fs');

try {
    const raw = fs.readFileSync('index.html');

    // We can see: 2d 3c 2d 21 2d 44 2d 4f
    // 2d = '-'
    // 3c = '<'
    // 21 = '!'
    // 44 = 'D'
    // 4f = 'O'
    // This perfectly matches: -<-!-D-O

    console.log("Starting aggressive literal dash strip...");

    let clean = Buffer.alloc(Math.floor(raw.length / 2) + 1);
    let j = 0;

    // The pattern is: dash at index 0, char at 1, dash at 2, char at 3...
    // Let's verify by checking if even indexes are dashes
    let isDashPattern = true;
    for (let i = 0; i < 20; i += 2) {
        if (raw[i] !== 0x2d) {
            isDashPattern = false;
            break;
        }
    }

    if (isDashPattern) {
        console.log("Confirmed literal dash at every even index.");
        for (let i = 1; i < raw.length; i += 2) {
            clean[j++] = raw[i];
        }

        let cleanedContent = clean.slice(0, j);
        fs.writeFileSync('index.html', cleanedContent);
        console.log("Restored index.html!");
    } else {
        console.log("File does not start with dashes, maybe it's already clean?");

        // Let's see what the first 10 chars are
        console.log("First 10 bytes:", raw.slice(0, 10).toString('utf8'));
    }

} catch (e) {
    console.error(e);
}
