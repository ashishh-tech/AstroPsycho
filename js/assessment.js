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
        // Setup event listeners first
        this.setupEventListeners();
        this.initLocationAutocomplete();
    }

    setupEventListeners() {
        // Birth details form
        document.getElementById('birthDetailsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Locating...';
            submitBtn.disabled = true;

            try {
                await this.collectBirthDetails();
                this.processData();
            } catch (error) {
                alert(error.message || 'Could not find the location. Please try a more specific city.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    initLocationAutocomplete() {
        const input = document.getElementById('birthPlace');
        const suggestionsContainer = document.getElementById('locationSuggestions');
        let debounceTimer;
        let pendingFeatures = [];

        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = input.value.trim();
            this.locationConfirmed = false;
            this.selectedLocation = null;
            this.updateLocationStatus(null);

            if (query.length < 3) {
                suggestionsContainer.style.display = 'none';
                pendingFeatures = [];
                return;
            }

            debounceTimer = setTimeout(() => this.fetchSuggestions(query, (features) => {
                pendingFeatures = features;
            }), 350);
        });

        // Auto-select first API result when user leaves field without clicking
        input.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
                if (!this.locationConfirmed && pendingFeatures.length > 0) {
                    const feature = pendingFeatures[0];
                    const lat = parseFloat(feature.lat);
                    const lon = parseFloat(feature.lon);
                    this.selectedLocation = { lat, lon };
                    this.locationConfirmed = true;
                    this.updateLocationStatus({ lat, lon }, feature.display_name);
                    pendingFeatures = [];
                }
            }, 200);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target !== input && e.target !== suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    updateLocationStatus(coords, label) {
        let el = document.getElementById('locationStatus');
        if (!el) {
            el = document.createElement('div');
            el.id = 'locationStatus';
            el.style.cssText = 'font-size:0.78rem;margin-top:4px;min-height:18px;';
            const input = document.getElementById('birthPlace');
            if (input && input.parentNode) input.parentNode.appendChild(el);
        }
        if (coords) {
            el.innerHTML = `<span style="color:#4ade80;">✓ ${label || ''} (${coords.lat.toFixed(2)}°N, ${coords.lon.toFixed(2)}°E)</span>`;
        } else {
            el.innerHTML = '<span style="color:#f87171;">⚠ Select a city from the suggestions</span>';
        }
    }

    async fetchSuggestions(query, onFetched) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
                headers: {
                    'User-Agent': 'AstroPsycho/1.0 (astro-psyco.netlify.app)',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
            const data = await response.json();
            if (onFetched) onFetched(data);
            this.renderSuggestions(data);
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
        }
    }

    renderSuggestions(features) {
        const suggestionsContainer = document.getElementById('locationSuggestions');
        suggestionsContainer.innerHTML = '';

        if (!features || features.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        features.forEach(feature => {
            const lat = parseFloat(feature.lat);
            const lon = parseFloat(feature.lon);
            const locationText = feature.display_name;

            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <span class="city-country">${locationText}</span>
                <span class="coords">${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</span>
            `;

            div.addEventListener('click', () => {
                document.getElementById('birthPlace').value = locationText;
                this.selectedLocation = { lat, lon };
                this.locationConfirmed = true;
                this.updateLocationStatus({ lat, lon }, locationText);
                suggestionsContainer.style.display = 'none';

                // Auto-suggest timezone based on longitude
                const approxTimezone = Math.round((lon / 15) * 2) / 2;
                const timezoneSelect = document.getElementById('timezone');
                if (timezoneSelect) {
                    let closest = timezoneSelect.options[0];
                    let minDiff = Math.abs(parseFloat(closest.value) - approxTimezone);
                    for (let i = 1; i < timezoneSelect.options.length; i++) {
                        const optValue = parseFloat(timezoneSelect.options[i].value);
                        const diff = Math.abs(optValue - approxTimezone);
                        if (diff < minDiff) { minDiff = diff; closest = timezoneSelect.options[i]; }
                    }
                    timezoneSelect.value = closest.value;
                }
            });

            suggestionsContainer.appendChild(div);
        });

        suggestionsContainer.style.display = 'block';
    }

    async collectBirthDetails() {
        const birthPlace = document.getElementById('birthPlace').value;

        // Final coordinate resolution if user just typed and hit enter without selecting
        if (!this.selectedLocation || !this.locationConfirmed) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(birthPlace)}&limit=1`, {
                    headers: {
                        'User-Agent': 'AstroPsycho/1.0 (astro-psyco.netlify.app)',
                        'Accept-Language': 'en-US,en;q=0.9'
                    }
                });
                const data = await response.json();

                if (data && data.length > 0) {
                    const feature = data[0];
                    this.selectedLocation = {
                        lat: parseFloat(feature.lat),
                        lon: parseFloat(feature.lon)
                    };
                    this.locationConfirmed = true;
                    this.updateLocationStatus(this.selectedLocation, feature.display_name);
                } else {
                    throw new Error(`Could not find coordinates for: ${birthPlace}`);
                }
            } catch (error) {
                console.error('Location resolution failed:', error);
                throw error; // Re-throw to be caught by the form submit handler
            }
        }

        this.birthDetails = {
            fullName: document.getElementById('fullName').value,
            birthDate: document.getElementById('birthDate').value,
            birthTime: document.getElementById('birthTime').value,
            birthPlace: birthPlace,
            latitude: this.selectedLocation.lat,
            longitude: this.selectedLocation.lon,
            timezone: parseFloat(document.getElementById('timezone').value),
            gender: document.getElementById('gender').value
        };

        console.log('✅ Birth details collected:', this.birthDetails);
    }

    processData() {
        // Show processing step
        this.goToStep(2);

        // Combine all data
        const userData = {
            responses: { skipped: true },
            birthDetails: this.birthDetails,
            timestamp: new Date().toISOString()
        };

        // Store in localStorage
        localStorage.setItem('astropsycho_assessment', JSON.stringify(userData));

        // Simulate processing and redirect to results
        setTimeout(() => {
            window.location.href = 'results.html';
        }, 3000);
    }

    goToStep(stepNumber) {
        // Use inline display styles (not CSS class toggling) because step2/step3
        // are nested inside step1 in the HTML - toggling display:none on step1
        // would hide all children including step2/step3.
        document.querySelectorAll('.step-container').forEach(step => {
            step.style.display = 'none';
        });

        // Show current step with block display
        const targetStep = document.getElementById(`step${stepNumber}`);
        if (targetStep) {
            targetStep.style.display = 'block';
        }

        // Update progress
        this.currentStep = stepNumber;
        const progress = (stepNumber / 2) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `Step ${stepNumber} of 2`;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.assessmentController = new AssessmentController();
});
