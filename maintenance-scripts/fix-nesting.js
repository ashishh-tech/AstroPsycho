const fs = require('fs');
let html = fs.readFileSync('assessment.html', 'utf8');

// The structural bug: step2 and step3 divs are nested inside step1.
// When step1 gets display:none, they disappear.
// 
// Current structure (indentation shows nesting):
//   <div id="step1" class="step-container active">     <- opens at line 49
//     ...step1 content...
//     </div>  <- closes choiceContainer (line 141)
//     <!-- Step 2 --> <- still inside step1! (line 143)
//     <div id="step2">                                 <- step2 is INSIDE step1!
//
// Fix: step1 never has a proper </div> before step2.
// We need to insert </div> to close step1, then make step2 a sibling.

// Strategy: Replace the sequence where step2 starts, inserting closing </div> for step1 first

// Detect exact text: "            </div>\r\n\r\n            <!-- Step 2"
// That </div> at same indent level closes choiceContainer. We need to add ONE MORE </div> after it.

const marker = '            </div>\r\n\r\n            <!-- Step 2';
const markerIdx = html.indexOf(marker);

if (markerIdx === -1) {
    // Try unix line endings
    const markerUnix = '            </div>\n\n            <!-- Step 2';
    const markerUnixIdx = html.indexOf(markerUnix);
    if (markerUnixIdx !== -1) {
        console.log('Found with unix LF at index:', markerUnixIdx);
        // Insert </div> to close step1
        html = html.substring(0, markerUnixIdx + '            </div>\n'.length) +
            '        </div>\n\n' +
            '        ' +
            html.substring(markerUnixIdx + '            </div>\n\n            '.length);
        fs.writeFileSync('assessment.html', html, 'utf8');
        console.log('Fixed! File saved.');
    } else {
        console.log('Could not find marker, looking for alternatives...');
        // Find where step2 begins as a raw search
        const step2Idx = html.indexOf('<div id="step2"');
        const prev200 = html.substring(Math.max(0, step2Idx - 200), step2Idx);
        console.log('Content before step2:', JSON.stringify(prev200));
    }
} else {
    console.log('Found CRLF marker at index:', markerIdx);
    // Insert </div> to close step1
    html = html.substring(0, markerIdx + '            </div>\r\n'.length) +
        '        </div>\r\n\r\n' +
        '        ' +
        html.substring(markerIdx + '            </div>\r\n\r\n            '.length);
    fs.writeFileSync('assessment.html', html, 'utf8');
    console.log('Fixed! File saved.');
}
