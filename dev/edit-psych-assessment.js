const fs = require('fs');

try {
    // === 1. edit psychology-assessment.html ===
    let text = fs.readFileSync('psychology-assessment.html', 'utf-8');

    // Remove progress bar
    text = text.replace(/<!-- Progress Bar -->[\s\S]*?<\/div>\s*<\/div>/, '');

    // Remove choiceContainer but keep assessmentContainer
    const choiceStart = text.indexOf('<div id="choiceContainer"');
    const assessmentStart = text.indexOf('<!-- Assessment Container');
    if (choiceStart !== -1 && assessmentStart !== -1) {
        text = text.substring(0, choiceStart) + text.substring(assessmentStart);
    }

    // Show assessmentContainer
    text = text.replace('<div id="assessmentContainer" style="display: none;">', '<div id="assessmentContainer" style="display: block;">');

    // Remove "Back to Options" button
    text = text.replace(/<button type="button" class="btn btn-secondary"[\s\S]*?← Back to Options\s*<\/button>/, '');

    // Update "Continue" button text
    text = text.replace('id="completeQuestionnaire">Continue to Birth\r\n                            Details\r\n                            →</button>', 'id="completeQuestionnaire">Generate Psychological Report →</button>');
    text = text.replace('id="completeQuestionnaire">Continue to Birth\n                            Details\n                            →</button>', 'id="completeQuestionnaire">Generate Psychological Report →</button>');

    // Fallback for button string
    text = text.replace(/Continue to Birth[\s\S]*?→/, 'Generate Psychological Report →');

    // Remove step 2 (Birth Details) and Step 3 (Processing)
    const step2Start = text.indexOf('<!-- Step 2: Birth Details -->');
    if (step2Start !== -1) {
        const step2End = text.lastIndexOf('</div>\r\n\r\n        <script');
        if (step2End !== -1) {
            text = text.substring(0, step2Start) + text.substring(step2End);
        } else {
            const step2End2 = text.lastIndexOf('</div>\n\n        <script');
            if (step2End2 !== -1) {
                text = text.substring(0, step2Start) + text.substring(step2End2);
            }
        }
    }

    // Replace js script reference
    text = text.replace('<script src="js/assessment.js"></script>', '<script src="js/psychology-assessment.js"></script>');

    fs.writeFileSync('psychology-assessment.html', text);
    console.log('psychology-assessment.html updated');

    // === 2. edit js/psychology-assessment.js ===
    let jsText = fs.readFileSync('js/psychology-assessment.js', 'utf-8');

    // In init()
    jsText = jsText.replace('this.setupEventListeners();\r\n        this.initLocationAutocomplete();', 'this.setupEventListeners();\r\n        this.loadAndRenderQuestionnaire();');
    jsText = jsText.replace('this.setupEventListeners();\n        this.initLocationAutocomplete();', 'this.setupEventListeners();\n        this.loadAndRenderQuestionnaire();');
    jsText = jsText.replace('// Don\'t load questionnaire immediately - wait until user chooses to take assessment', '');
    jsText = jsText.replace('// Setup event listeners first', '');

    // from setupEventListeners, remove backToQuestionnaire, birthDetailsForm, observer
    let setupMatches = jsText.match(/setupEventListeners\(\) \{([\s\S]*?)initLocationAutocomplete\(\)/);
    if (setupMatches) {
        let setupBody = setupMatches[1];
        setupBody = setupBody.replace(/\/\/ Back button[\s\S]*?\}\);/, '');
        setupBody = setupBody.replace(/\/\/ Birth details form[\s\S]*?\}\);/, '');
        setupBody = setupBody.replace(/\/\/ Setup observer to load questionnaire when assessment container becomes visible[\s\S]*?observer\.observe\(assessmentContainer, \{ attributes: true \}\);/, '');
        jsText = jsText.replace(setupMatches[1], setupBody);
    }

    // completely change completeQuestionnaire logic
    jsText = jsText.replace(/document\.getElementById\('completeQuestionnaire'\)\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);/,
        `document.getElementById('completeQuestionnaire').addEventListener('click', (e) => {
            if (this.validateQuestionnaire()) {
                const btn = e.target;
                const orig = btn.innerHTML;
                btn.innerHTML = 'Analyzing Profile...';
                btn.disabled = true;
                
                this.collectResponses();
                this.processData();
            } else {
                alert('Please answer all questions before continuing.');
            }
        });`);

    // Remove unused methods
    jsText = jsText.replace(/initLocationAutocomplete\(\) \{[\s\S]*?updateLocationStatus\(coords, label\) \{/m, 'updateLocationStatus(coords, label) {');
    jsText = jsText.replace(/updateLocationStatus\(coords, label\) \{[\s\S]*?fetchSuggestions\(query, onFetched\) \{/m, 'fetchSuggestions(query, onFetched) {');
    jsText = jsText.replace(/fetchSuggestions\(query, onFetched\) \{[\s\S]*?renderSuggestions\(features\) \{/m, 'renderSuggestions(features) {');
    jsText = jsText.replace(/renderSuggestions\(features\) \{[\s\S]*?validateQuestionnaire\(\) \{/m, 'validateQuestionnaire() {');

    jsText = jsText.replace(/async collectBirthDetails\(\) \{[\s\S]*?processData\(\) \{/, 'processData() {');

    // Change processData behavior
    const newProcessData = `processData() {
        // Retrieve existing
        let userDataStr = localStorage.getItem('astropsycho_assessment');
        let userData = {};
        if (userDataStr) {
            try { userData = JSON.parse(userDataStr); } catch(e){}
        }
        
        // Ensure standard structure
        if (!userData.responses || userData.responses.skipped) {
            userData.responses = {};
        }
        if (!userData.birthDetails) {
            alert('Birth details are missing. Please complete the main transit/kundali form first.');
            window.location.href = 'index.html';
            return;
        }

        // Merge new responses
        userData.responses = { ...userData.responses, ...this.responses };
        if (userData.responses.skipped) delete userData.responses.skipped;
        userData.timestamp = new Date().toISOString();

        // Store
        localStorage.setItem('astropsycho_assessment', JSON.stringify(userData));

        setTimeout(() => {
            window.location.href = 'pdf-report.html';
        }, 1500);
    }
    `;
    jsText = jsText.replace(/processData\(\) \{[\s\S]*?goToStep\(stepNumber\) \{/, newProcessData + '\r\n\r\n    goToStep(stepNumber) {');

    // Remove goToStep and skipAssessment
    jsText = jsText.replace(/goToStep\(stepNumber\) \{[\s\S]*?\}\s*\}\s*\/\/ Global function for skip assessment/m, '}\r\n\r\n// Global function for skip assessment');
    jsText = jsText.replace(/\/\/ Global function for skip assessment \(called from HTML onclick\)[\s\S]*?\}\s*;/g, '');

    fs.writeFileSync('js/psychology-assessment.js', jsText);
    console.log('js/psychology-assessment.js updated');

} catch (e) {
    console.error(e);
}
