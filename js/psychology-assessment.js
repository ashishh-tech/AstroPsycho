// Assessment Page Logic
// Handles questionnaire display, form navigation, and data collection

class AssessmentController {
    constructor() {
        this.currentStep = 1;
        this.questionnaireData = null;
        this.responses = {};
        this.birthDetails = {};
        this.selectedLocation = null; // null = not yet chosen by user
        this.locationConfirmed = false;



        this.init();
    }

    async init() {
        
        
        this.setupEventListeners();
        this.loadAndRenderQuestionnaire();
    }

    async loadAndRenderQuestionnaire() {
        // Load questionnaire data if not already loaded
        if (!this.questionnaireData) {
            await this.loadQuestionnaire();
        }
        // Render questionnaire
        this.renderQuestionnaire();
    }

    async loadQuestionnaire() {
        try {
            const response = await fetch('data/questionnaire.json');
            this.questionnaireData = await response.json();
        } catch (error) {
            console.error('Error loading questionnaire:', error);
            alert('Error loading assessment. Please refresh the page.');
        }
    }

    renderQuestionnaire() {
        const container = document.getElementById('questionnaireContainer');
        if (!container || !this.questionnaireData) return;

        const { sections } = this.questionnaireData.questionnaire;

        sections.forEach((section, sectionIndex) => {
            // Section header
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'question-section';
            sectionDiv.innerHTML = `
                <h2 style="font-family: var(--font-display); color: var(--star-gold); margin: 2rem 0 1rem 0;">
                    ${section.title}
                </h2>
            `;

            // Render questions
            section.questions.forEach((question, questionIndex) => {
                const questionCard = document.createElement('div');
                questionCard.className = 'question-card';

                const critical = question.critical ? '<span style="color: var(--accent-pink); font-weight: bold;">[Important]</span>' : '';

                questionCard.innerHTML = `
                    <div class="question-text">
                        <strong>Q${sectionIndex * 10 + questionIndex + 1}.</strong> ${question.text} ${critical}
                    </div>
                    <div class="rating-scale">
                        ${this.createRatingOptions(question.id)}
                    </div>
                `;

                sectionDiv.appendChild(questionCard);
            });

            container.appendChild(sectionDiv);
        });
    }

    createRatingOptions(questionId) {
        const options = [
            { value: 1, label: '1<br>Never' },
            { value: 2, label: '2<br>Rarely' },
            { value: 3, label: '3<br>Sometimes' },
            { value: 4, label: '4<br>Often' },
            { value: 5, label: '5<br>Always' }
        ];

        return options.map(option => `
            <div class="rating-option">
                <input type="radio" name="${questionId}" value="${option.value}" id="${questionId}_${option.value}" required>
                <label class="rating-label" for="${questionId}_${option.value}">
                    ${option.label}
                </label>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Complete questionnaire button
        document.getElementById('completeQuestionnaire').addEventListener('click', (e) => {
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
        });

        

        

        
    }

    validateQuestionnaire() {
        const sections = this.questionnaireData.questionnaire.sections;
        let allAnswered = true;

        sections.forEach(section => {
            section.questions.forEach(question => {
                const answered = document.querySelector(`input[name="${question.id}"]:checked`);
                if (!answered) {
                    allAnswered = false;
                }
            });
        });

        return allAnswered;
    }

    collectResponses() {
        const sections = this.questionnaireData.questionnaire.sections;

        sections.forEach(section => {
            section.questions.forEach(question => {
                const selected = document.querySelector(`input[name="${question.id}"]:checked`);
                if (selected) {
                    this.responses[question.id] = {
                        value: parseInt(selected.value),
                        indicators: question.indicators,
                        critical: question.critical || false
                    };
                }
            });
        });

        console.log('Collected responses:', this.responses);
    }

    processData() {
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
    

    }



// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.assessmentController = new AssessmentController();
});
