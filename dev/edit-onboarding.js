const fs = require('fs');

try {
    // === 1. edit assessment.html ===
    let text = fs.readFileSync('assessment.html', 'utf-8');

    // Progress Bar
    text = text.replace('Step 1 of 3', 'Step 1 of 2');
    text = text.replace('id="progressFill"></div>', 'id="progressFill" style="width: 50%;"></div>');

    // Choice Screen Removal
    const startIndex = text.indexOf('<!-- Step 1: Choice Screen -->');
    const endIndex = text.indexOf('<!-- Step 2: Birth Details -->');
    if (startIndex !== -1 && endIndex !== -1) {
        text = text.substring(0, startIndex) + '<!-- Step 1: Birth Details -->\n        ' + text.substring(endIndex + 31);
    }

    // Step IDs
    text = text.replace('<div id="step2" class="step-container">', '<div id="step1" class="step-container active">');
    text = text.replace('<!-- Step 3: Processing -->', '<!-- Step 2: Processing -->');
    text = text.replace('<div id="step3" class="step-container">', '<div id="step2" class="step-container">');

    // Back button
    text = text.replace('<button type="button" class="btn btn-secondary" id="backToQuestionnaire">← Back</button>', '');

    fs.writeFileSync('assessment.html', text);
    console.log('assessment.html updated');

    // === 2. edit js/assessment.js ===
    let jsText = fs.readFileSync('js/assessment.js', 'utf-8');

    // remove questionnaire methods
    jsText = jsText.replace(/async loadAndRenderQuestionnaire\(\) \{[\s\S]*?renderQuestionnaire\(\);\s*\}/, '');
    jsText = jsText.replace(/async loadQuestionnaire\(\) \{[\s\S]*?alert\('Error loading assessment\. Please refresh the page\.'\);\s*\}\s*\}/, '');
    jsText = jsText.replace(/renderQuestionnaire\(\) \{[\s\S]*?container\.appendChild\(sectionDiv\);\s*\}\);\s*\}/, '');
    jsText = jsText.replace(/createRatingOptions\(questionId\) \{[\s\S]*?`\)\.join\(''\);\s*\}/, '');
    jsText = jsText.replace(/validateQuestionnaire\(\) \{[\s\S]*?return allAnswered;\s*\}/, '');
    jsText = jsText.replace(/collectResponses\(\) \{[\s\S]*?console\.log\('Collected responses:', this\.responses\);\s*\}/, '');

    // from setupEventListeners, remove completeQuestionnaire, backToQuestionnaire, observer
    let setupMatches = jsText.match(/setupEventListeners\(\) \{([\s\S]*?)initLocationAutocomplete\(\)/);
    if (setupMatches) {
        let setupBody = setupMatches[1];
        setupBody = setupBody.replace(/\/\/ Complete questionnaire button[\s\S]*?\}\);/, '');
        setupBody = setupBody.replace(/\/\/ Back button[\s\S]*?\}\);/, '');
        setupBody = setupBody.replace(/\/\/ Setup observer to load questionnaire when assessment container becomes visible[\s\S]*?observer\.observe\(assessmentContainer, \{ attributes: true \}\);/, '');
        jsText = jsText.replace(setupMatches[1], setupBody);
    }

    // from init
    jsText = jsText.replace("// Don't load questionnaire immediately - wait until user chooses to take assessment\r\n", '');
    jsText = jsText.replace("// Don't load questionnaire immediately - wait until user chooses to take assessment\n", '');

    // processData tweaks
    jsText = jsText.replace('this.goToStep(3);', 'this.goToStep(2);');
    jsText = jsText.replace('responses: this.responses,', 'responses: { skipped: true },');

    // goToStep tweaks
    jsText = jsText.replace('const progress = (stepNumber / 3) * 100;', 'const progress = (stepNumber / 2) * 100;');
    jsText = jsText.replace('Step ${stepNumber} of 3', 'Step ${stepNumber} of 2');

    // global function
    jsText = jsText.replace(/\/\/ Global function for skip assessment \(called from HTML onclick\)[\s\S]*?\}\s*;/g, '');

    fs.writeFileSync('js/assessment.js', jsText);
    console.log('js/assessment.js updated');

} catch (e) {
    console.error(e);
}
