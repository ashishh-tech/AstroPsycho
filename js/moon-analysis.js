// Moon Analysis Page Logic
// Comprehensive Moon (Mind) analysis for psychology-focused astrology

class MoonAnalysisController {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();
        this.userData = null;
        this.birthChart = null;
        this.moonData = null;
        this.init();
    }

    async init() {
        try {
            // Load user data from localStorage
            this.userData = this.loadUserData();
            console.log('🔍 Moon Analysis - Persisted Data Check:', this.userData);

            if (!this.userData || !this.userData.birthDetails) {
                console.log('⚠️ No birth data found in localStorage. Redirecting to assessment.');
                alert('Please complete the assessment first to see your Moon analysis.');
                window.location.href = 'assessment.html';
                return;
            }

            console.log('✅ Data found. Calculating chart for:', this.userData.birthDetails.fullName);

            // Validate birth details before proceeding
            const bd = this.userData.birthDetails;
            console.log('Birth Details:', {
                date: bd.birthDate,
                time: bd.birthTime,
                place: bd.birthPlace,
                lat: bd.latitude,
                lon: bd.longitude
            });

            this.birthChart = this.astrologyEngine.calculateBirthChart(this.userData.birthDetails);
            console.log('✅ Birth chart calculated successfully');

            // Load Moon analysis data
            await this.loadMoonAnalysisData();
            console.log('✅ Moon data loaded successfully');

            // Render the complete Moon analysis
            this.renderMoonAnalysis();
            console.log('✅ Moon analysis rendered successfully');
        } catch (error) {
            console.error('❌ Moon Analysis Error Details:', error);
            console.error('Error stack:', error.stack);
            console.error('User data at time of error:', this.userData);

            // Show user-friendly error without redirecting
            const content = document.getElementById('moonAnalysisContent');
            if (content) {
                content.innerHTML = `
                    <div class="info-box" style="border-color: var(--accent-orange); margin-top: 2rem;">
                        <h3 style="color: var(--accent-orange);">⚠️ Technical Issue</h3>
                        <p style="color: var(--moon-silver); margin: 1rem 0;">
                            There was an error loading your Moon analysis. This might be a temporary issue.
                        </p>
                        <p style="color: var(--moon-silver); margin: 1rem 0; font-size: 0.9rem;">
                            <strong>Error:</strong> ${error.message}
                        </p>
                        <p style="color: var(--moon-silver); margin: 1rem 0;">
                            Your birth data is saved. Please try:
                        </p>
                        <ul style="color: var(--moon-silver); margin-left: 2rem;">
                            <li>Refreshing the page (F5)</li>
                            <li>Checking browser console (F12) for details</li>
                            <li>Clearing cache and trying again</li>
                        </ul>
                        <div class="button-group" style="margin-top: 1.5rem;">
                            <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
                            <a href="results.html" class="btn btn-secondary" style="text-decoration: none; display: inline-block;">View Results Page</a>
                        </div>
                    </div>
                `;
            }
        }
    }

    loadUserData() {
        const data = localStorage.getItem('astropsycho_assessment');
        return data ? JSON.parse(data) : null;
    }

    async loadMoonAnalysisData() {
        try {
            const response = await fetch('data/moon-analysis-data.json');
            this.moonData = await response.json();
        } catch (error) {
            console.error('Error loading Moon data:', error);
            // Fallback to basic analysis if data file not found
            this.moonData = {};
        }
    }

    showError(message) {
        console.error('Moon Analysis Error:', message);
        alert('Error loading Moon analysis: ' + message + '\n\nPlease complete the assessment first.');
        window.location.href = 'assessment.html';
    }

    processQuickBirthDetails() {
        const latInput = document.getElementById('quickLat').value;
        const lonInput = document.getElementById('quickLon').value;

        const birthDetails = {
            fullName: document.getElementById('quickName').value,
            birthDate: document.getElementById('quickDate').value,
            birthTime: document.getElementById('quickTime').value,
            birthPlace: document.getElementById('quickPlace').value,
            latitude: latInput ? parseFloat(latInput) : 28.61, // Default Delhi
            longitude: lonInput ? parseFloat(lonInput) : 77.20, // Default Delhi
            timezone: 5.5, // Default for IST
            gender: 'not-specified'
        };

        // Store in consistent userData format
        this.userData = {
            birthDetails: birthDetails,
            responses: { skipped: true },
            timestamp: new Date().toISOString()
        };

        // Save to localStorage for persistence across ALL pages
        console.log('💾 Saving Quick Birth Details:', this.userData);
        localStorage.setItem('astropsycho_assessment', JSON.stringify(this.userData));

        // Calculate birth chart
        this.birthChart = this.astrologyEngine.calculateBirthChart(birthDetails);

        // Load Moon data and render
        this.loadMoonAnalysisData().then(() => {
            this.renderMoonAnalysis();
        });
    }

    renderMoonAnalysis() {
        // Render all sections
        this.renderUserGreeting();
        this.renderBirthDetails();
        this.renderMoonStrength();
        this.renderMoonPosition();
        this.renderPsychologicalProfile();
        this.detectAndRenderAfflictions();
        this.renderHouseAnalysis();
        this.renderNakshatraAnalysis();
        this.renderMoonRemedies();
    }

    renderUserGreeting() {
        const container = document.getElementById('userGreeting');
        if (!container) return;

        const name = this.userData?.birthDetails?.fullName || 'Valued User';
        container.innerHTML = `
            <h2 style="color: var(--star-gold); font-family: var(--font-display); font-size: 1.8rem;">
                ${name}'s Moon Analysis
            </h2>
        `;
    }

    renderBirthDetails() {
        const container = document.getElementById('birthDetailsSection');
        if (!container) return;

        const bd = this.userData?.birthDetails;
        if (!bd) return;

        // Format date
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            const day = date.getDate();
            const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor(day % 100 / 10) === 1) ? 0 : day % 10];
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            return `${day}${suffix} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        };

        // Calculate age
        const calculateAge = (dateStr) => {
            const birthDate = new Date(dateStr);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };

        // Format time (24-hour to 12-hour)
        const formatTime = (timeStr) => {
            if (!timeStr) return 'N/A';
            const [hours, minutes] = timeStr.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        };

        const formattedDate = bd.birthDate ? formatDate(bd.birthDate) : 'N/A';
        const age = bd.birthDate ? calculateAge(bd.birthDate) : 'N/A';
        const formattedTime = formatTime(bd.birthTime);

        container.innerHTML = `
            <div class="info-box" style="border-color: var(--accent-cyan); background: rgba(100, 255, 218, 0.05);">
                <h3 style="color: var(--accent-cyan); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    📅 Birth Details
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div class="remedy-card" style="border-left-color: var(--star-gold);">
                        <h4 style="color: var(--moon-silver); font-size: 0.9rem; margin-bottom: 0.3rem;">Date of Birth</h4>
                        <p style="color: var(--soft-white); font-size: 1.1rem; margin: 0;">
                            <strong>${formattedDate}</strong>
                        </p>
                        <p style="color: var(--accent-cyan); font-size: 0.85rem; margin-top: 0.3rem;">
                            Age: ${age} years
                        </p>
                    </div>

                    <div class="remedy-card" style="border-left-color: var(--accent-orange);">
                        <h4 style="color: var(--moon-silver); font-size: 0.9rem; margin-bottom: 0.3rem;">Time of Birth</h4>
                        <p style="color: var(--soft-white); font-size: 1.1rem; margin: 0;">
                            <strong>${formattedTime}</strong>
                        </p>
                        <p style="color: var(--moon-silver); font-size: 0.85rem; margin-top: 0.3rem;">
                            Timezone: UTC+${bd.timezone || '5.5'}
                        </p>
                    </div>

                    <div class="remedy-card" style="border-left-color: var(--moon-silver);">
                        <h4 style="color: var(--moon-silver); font-size: 0.9rem; margin-bottom: 0.3rem;">Place of Birth</h4>
                        <p style="color: var(--soft-white); font-size: 1.1rem; margin: 0;">
                            <strong>${bd.birthPlace || 'N/A'}</strong>
                        </p>
                        <p style="color: var(--moon-silver); font-size: 0.85rem; margin-top: 0.3rem;">
                            ${bd.latitude ? `${bd.latitude.toFixed(4)}°N, ${bd.longitude.toFixed(4)}°E` : 'Coordinates not available'}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }


    calculateMoonStrength() {
        const { planets } = this.birthChart;
        const moonPos = planets.moon;
        const moonSign = Math.floor(moonPos / 30);
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

        let strength = 50; // Base strength
        let strengthFactors = [];

        // Exaltation/Debilitation
        if (moonSign === 1) { // Taurus
            strength = 100;
            strengthFactors.push('Exalted in Taurus (+50%)');
        } else if (moonSign === 7) { // Scorpio
            strength = 20;
            strengthFactors.push('Debilitated in Scorpio (-30%)');
        } else if (moonSign === 3) { // Cancer - own sign
            strength = 80;
            strengthFactors.push('In own sign Cancer (+30%)');
        }

        // Paksha Bala (Waxing/Waning)
        const sunPos = planets.sun;
        const elongation = (moonPos - sunPos + 360) % 360;

        if (elongation >= 0 && elongation < 180) {
            // Waxing Moon (Shukla Paksha)
            strength += 15;
            strengthFactors.push('Waxing Moon (+15%)');
        } else {
            // Waning Moon (Krishna Paksha)
            strength -= 10;
            strengthFactors.push('Waning Moon (-10%)');
        }

        // Check for afflictions
        const afflictions = this.detectAfflictions();
        if (afflictions.length > 0) {
            strength -= (afflictions.length * 10);
            strengthFactors.push(`${afflictions.length} affliction(s) detected (-${afflictions.length * 10}%)`);
        }

        // Ensure strength is between 0 and 100
        strength = Math.max(0, Math.min(100, strength));

        return {
            strength: Math.round(strength),
            sign: signs[moonSign],
            moonSign: moonSign,
            factors: strengthFactors,
            isWaxing: elongation >= 0 && elongation < 180,
            elongation: Math.round(elongation)
        };
    }

    renderMoonStrength() {
        const container = document.getElementById('moonStrengthSection');
        if (!container) return;

        const strengthData = this.calculateMoonStrength();
        const { strength, sign, factors, isWaxing, elongation } = strengthData;

        // Determine color based on strength
        let color = '';
        let status = '';
        if (strength >= 70) {
            color = 'var(--accent-cyan)';
            status = 'Strong';
        } else if (strength >= 40) {
            color = 'var(--accent-orange)';
            status = 'Moderate';
        } else {
            color = 'var(--accent-pink)';
            status = 'Weak';
        }

        const html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <div class="remedy-card" style="border-left-color: ${color};">
                    <h3 style="color: ${color};">Moon Strength: ${strength}%</h3>
                    <div style="background: rgba(10, 10, 31, 0.6); border-radius: 10px; height: 30px; margin: 1rem 0; overflow: hidden;">
                        <div style="background: ${color}; height: 100%; width: ${strength}%; transition: width 1s ease;"></div>
                    </div>
                    <p style="color: var(--soft-white); font-size: 1.1rem;"><strong>Status:</strong> ${status}</p>
                    <p style="color: var(--moon-silver); margin-top: 0.5rem;">
                        <strong>Moon Sign:</strong> ${sign}
                    </p>
                    <p style="color: var(--moon-silver);">
                        <strong>Phase:</strong> ${isWaxing ? 'Waxing 🌒' : 'Waning 🌘'} (${elongation}°)
                    </p>
                </div>

                <div class="remedy-card">
                    <h4 style="color: var(--moon-silver);">Strength Factors</h4>
                    <ul style="margin-top: 1rem; color: var(--soft-white); line-height: 1.8;">
                        ${factors.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                    <p style="margin-top: 1rem; color: var(--accent-cyan); font-size: 0.9rem;">
                        ${strength >= 70 ? '✨ Your Moon is well-placed for mental peace!' :
                strength >= 40 ? '💫 Moon has moderate strength. Remedies will help.' :
                    '⚠️ Moon needs strengthening. Focus on remedies.'}
                    </p>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    renderMoonPosition() {
        const container = document.getElementById('moonPositionDetails');
        if (!container) return;

        const { planets, ascendant } = this.birthChart;
        const moonPos = planets.moon;
        const moonSign = Math.floor(moonPos / 30);
        const moonHouse = this.astrologyEngine.getHouseNumber(moonPos, ascendant);
        const moonDegree = (moonPos % 30).toFixed(2);

        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

        // Get Nakshatra (inline calculation since calculateNakshatras doesn't exist)
        const nakshatraNames = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];

        const nakshatraLords = [
            'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu',
            'jupiter', 'saturn', 'mercury', 'ketu', 'venus', 'sun',
            'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury',
            'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu',
            'jupiter', 'saturn', 'mercury'
        ];

        const nakIndex = Math.floor((moonPos % 360) / (360 / 27)) + 1;
        const nakAngle = (moonPos % 360) % (360 / 27);
        const nakPada = Math.floor(nakAngle / (360 / 27 / 4)) + 1;

        const nakshatraData = {
            index: nakIndex,
            name: nakshatraNames[nakIndex - 1],
            lord: nakshatraLords[nakIndex - 1],
            pada: nakPada
        };

        const html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                <div class="remedy-card" style="border-left-color: var(--moon-silver);">
                    <h4 style="color: var(--moon-silver);">🌙 Moon Sign (Rashi)</h4>
                    <p style="color: var(--soft-white); font-size: 1.2rem; margin-top: 0.5rem;">
                        <strong>${signs[moonSign]}</strong>
                    </p>
                    <p style="color: var(--accent-cyan); font-size: 0.9rem; margin-top: 0.3rem;">
                        ${moonDegree}° in ${signs[moonSign]}
                    </p>
                </div>

                <div class="remedy-card" style="border-left-color: var(--star-gold);">
                    <h4 style="color: var(--star-gold);">⭐ Nakshatra</h4>
                    <p style="color: var(--soft-white); font-size: 1.2rem; margin-top: 0.5rem;">
                        <strong>${nakshatraData.name}</strong>
                    </p>
                    <p style="color: var(--moon-silver); font-size: 0.9rem; margin-top: 0.3rem;">
                        Pada: ${nakshatraData.pada} | Lord: ${this.capitalize(nakshatraData.lord)}
                    </p>
                </div>

                <div class="remedy-card" style="border-left-color: var(--accent-cyan);">
                    <h4 style="color: var(--accent-cyan);">🏠 House Position</h4>
                    <p style="color: var(--soft-white); font-size: 1.2rem; margin-top: 0.5rem;">
                        <strong>House ${moonHouse}</strong>
                    </p>
                    <p style="color: var(--moon-silver); font-size: 0.9rem; margin-top: 0.3rem;">
                        ${this.getHouseName(moonHouse)}
                    </p>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    getHouseName(house) {
        const names = {
            1: 'Self & Personality',
            2: 'Wealth & Family',
            3: 'Courage & Siblings',
            4: 'Home & Mother (Best for Moon!)',
            5: 'Children & Creativity',
            6: 'Enemies & Health',
            7: 'Marriage & Partners',
            8: 'Transformation & Mysteries',
            9: 'Fortune & Dharma',
            10: 'Career & Status',
            11: 'Gains & Friends',
            12: 'Losses & Spirituality'
        };
        return names[house] || 'Unknown';
    }

    renderPsychologicalProfile() {
        const container = document.getElementById('psychologicalProfile');
        if (!container) return;

        const { planets, ascendant } = this.birthChart;
        const moonPos = planets.moon;
        const moonHouse = this.astrologyEngine.getHouseNumber(moonPos, ascendant);

        // Get house-wise psychological data
        const houseData = this.moonData?.moon_in_houses?.[moonHouse.toString()] || {};

        const html = `
            <div class="remedy-card" style="border-left-color: var(--accent-cyan);">
                <h3 style="color: var(--accent-cyan);">💭 Your Mental & Emotional Nature</h3>
                <p style="color: var(--soft-white); margin-top: 1rem; line-height: 1.8;">
                    ${houseData.psychological_impact || 'Your Moon placement influences your emotional responses and mental patterns.'}
                </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">
                <div class="remedy-card" style="border-left-color: var(--accent-cyan);">
                    <h4 style="color: var(--accent-cyan);">✨ Mental Strengths</h4>
                    <ul style="margin-top: 0.5rem; color: var(--soft-white); line-height: 1.8;">
                        ${(houseData.mental_strengths || []).map(s => `<li>${s}</li>`).join('') || '<li>Emotional depth</li>'}
                    </ul>
                </div>

                <div class="remedy-card" style="border-left-color: var(--accent-orange);">
                    <h4 style="color: var(--accent-orange);">⚠️ Mental Challenges</h4>
                    <ul style="margin-top: 0.5rem; color: var(--soft-white); line-height: 1.8;">
                        ${(houseData.mental_challenges || []).map(c => `<li>${c}</li>`).join('') || '<li>Emotional sensitivity</li>'}
                    </ul>
                </div>
            </div>

            <div class="remedy-card" style="border-left-color: var(--star-gold); margin-top: 1rem;">
                <h4 style="color: var(--star-gold);">🧘 Recommended Coping Mechanisms</h4>
                <ul style="margin-top: 0.5rem; color: var(--soft-white); line-height: 1.8;">
                    ${(houseData.coping_mechanisms || []).map(m => `<li>${m}</li>`).join('') || '<li>Meditation and mindfulness</li>'}
                </ul>
                <p style="margin-top: 1rem; color: var(--accent-cyan); background: rgba(100, 255, 218, 0.1); padding: 0.8rem; border-radius: 8px;">
                    <strong>Recommendation:</strong> ${houseData.recommendation || 'Practice self-awareness and emotional balance.'}
                </p>
            </div>
        `;

        container.innerHTML = html;
    }

    detectAfflictions() {
        const { planets, ascendant } = this.birthChart;
        const moonPos = planets.moon;
        const moonHouse = this.astrologyEngine.getHouseNumber(moonPos, ascendant);
        const afflictions = [];

        // Check conjunctions with malefics
        Object.entries(planets).forEach(([planet, pos]) => {
            if (['mars', 'saturn', 'rahu', 'ketu'].includes(planet)) {
                if (Math.abs(moonPos - pos) < 10) {
                    afflictions.push({
                        type: 'conjunction',
                        planet: planet,
                        severity: planet === 'rahu' || planet === 'ketu' ? 'high' : 'medium'
                    });
                }
            }
        });

        // Check for Kemadruma Yoga
        const moonSign = Math.floor(moonPos / 30);
        const prevSign = (moonSign + 11) % 12;
        const nextSign = (moonSign + 1) % 12;

        const hasAdjacentPlanets = Object.entries(planets).some(([p, pos]) => {
            if (p === 'moon' || p === 'sun' || p === 'rahu' || p === 'ketu') return false;
            const sign = Math.floor(pos / 30);
            return sign === prevSign || sign === nextSign;
        });

        if (!hasAdjacentPlanets) {
            afflictions.push({
                type: 'kemadruma',
                severity: 'very_high'
            });
        }

        // Check dusthana placement
        if ([6, 8, 12].includes(moonHouse)) {
            afflictions.push({
                type: 'dusthana_house',
                house: moonHouse,
                severity: moonHouse === 8 ? 'high' : 'medium'
            });
        }

        // Check debilitation
        const moonSign2 = Math.floor(moonPos / 30);
        if (moonSign2 === 7) { // Scorpio
            afflictions.push({
                type: 'debilitation',
                severity: 'very_high'
            });
        }

        return afflictions;
    }

    detectAndRenderAfflictions() {
        const afflictions = this.detectAfflictions();
        const section = document.getElementById('afflictionsSection');
        const container = document.getElementById('moonAfflictions');

        if (afflictions.length === 0) {
            // Show positive section instead
            const positiveSection = document.getElementById('positiveSection');
            const blessingsContainer = document.getElementById('moonBlessings');

            if (positiveSection && blessingsContainer) {
                positiveSection.style.display = 'block';
                blessingsContainer.innerHTML = `
                    <div class="remedy-card" style="border-left-color: var(--accent-cyan);">
                        <h3 style="color: var(--accent-cyan);">✨ No Major Moon Afflictions!</h3>
                        <p style="color: var(--soft-white); margin-top: 1rem; line-height: 1.8;">
                            Your Moon is relatively free from major afflictions. This is an excellent blessing for mental
                            and emotional health. Continue with regular Moon strengthening practices to maintain this balance.
                        </p>
                        <p style="color: var(--accent-cyan); margin-top: 1rem;">
                            🌙 Focus on enhancing your already strong Moon through meditation, service to mother, and
                            maintaining emotional balance.
                        </p>
                    </div>
                `;
            }
            return;
        }

        if (section) section.style.display = 'block';
        if (!container) return;

        let html = '';
        afflictions.forEach(aff => {
            const afflictionData = this.getAfflictionData(aff);
            const severityColor =
                aff.severity === 'very_high' ? 'var(--accent-pink)' :
                    aff.severity === 'high' ? 'var(--accent-orange)' :
                        'var(--star-gold)';

            html += `
                <div class="remedy-card" style="border-left-color: ${severityColor};">
                    <h4 style="color: ${severityColor};">⚠️ ${afflictionData.name}</h4>
                    <p style="color: var(--soft-white); margin-top: 0.5rem; line-height: 1.8;">
                        <strong>Effect:</strong> ${afflictionData.effect}
                    </p>
                    <div style="background: rgba(255, 105, 180, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                        <h5 style="color: var(--accent-cyan);">Recommended Remedies:</h5>
                        <ul style="margin-top: 0.5rem; color: var(--moon-silver); line-height: 1.8;">
                            ${afflictionData.remedies.map(r => `<li>${r}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    getAfflictionData(aff) {
        const afflictionDataMap = this.moonData?.moon_afflictions || {};

        if (aff.type === 'conjunction') {
            const key = `conjunction_${aff.planet}`;
            const data = afflictionDataMap[key];
            return data || {
                name: `Moon-${this.capitalize(aff.planet)} Conjunction`,
                effect: `This conjunction affects emotional stability`,
                remedies: ['Chant Moon mantra', `Perform ${this.capitalize(aff.planet)} remedies`]
            };
        } else if (aff.type === 'kemadruma') {
            return afflictionDataMap['kemadruma_yoga'] || {
                name: 'Kemadruma Yoga',
                effect: 'Mental isolation and emotional loneliness',
                remedies: ['Wear Pearl gemstone', 'Daily Chandra mantra 108 times', 'Serve mother', 'Professional counseling']
            };
        } else if (aff.type === 'dusthana_house') {
            const key = `moon_in_${aff.house}th`;
            return afflictionDataMap[key] || {
                name: `Moon in ${aff.house}th House`,
                effect: 'Challenging placement for mental peace',
                remedies: ['Moon strengthening practices', 'Meditation', 'Professional support if needed']
            };
        } else if (aff.type === 'debilitation') {
            return afflictionDataMap['debilitated_moon'] || {
                name: 'Debilitated Moon in Scorpio',
                effect: 'Intense emotional turmoil and psychological challenges',
                remedies: ['Pearl gemstone ESSENTIAL', 'Professional therapy MANDATORY', 'Daily Chandra mantra', 'Avoid toxic relationships']
            };
        }

        return {
            name: 'Moon Affliction',
            effect: 'Affects mental and emotional balance',
            remedies: ['Moon strengthening practices']
        };
    }

    renderHouseAnalysis() {
        const container = document.getElementById('houseAnalysis');
        if (!container) return;

        const { planets, ascendant } = this.birthChart;
        const moonPos = planets.moon;
        const moonHouse = this.astrologyEngine.getHouseNumber(moonPos, ascendant);

        // Update section title
        const sectionTitle = container.closest('section')?.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.textContent = `Moon in House ${moonHouse}: Detailed Analysis`;
        }

        const houseData = this.moonData?.moon_in_houses?.[moonHouse.toString()] || {};

        const html = `
            <div class="remedy-card" style="border-left-color: var(--accent-cyan);">
                <h3 style="color: var(--accent-cyan);">${houseData.house_name || `House ${moonHouse}`}</h3>
                <p style="color: var(--soft-white); margin-top: 1rem; line-height: 1.8;">
                    ${houseData.psychological_impact || 'This house placement influences your emotional and mental nature.'}
                </p>
                ${houseData.recommendation ? `
                    <div style="background: rgba(100, 255, 218, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                        <p style="color: var(--accent-cyan);"><strong>Expert Recommendation:</strong></p>
                        <p style="color: var(--soft-white); margin-top: 0.5rem;">${houseData.recommendation}</p>
                    </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = html;
    }

    renderNakshatraAnalysis() {
        const container = document.getElementById('nakshatraAnalysis');
        if (!container) return;

        const { planets } = this.birthChart;
        const moonPos = planets.moon;

        // Calculate Nakshatra inline (since calculateNakshatras doesn't exist)
        const nakshatraNames = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];

        const nakshatraLords = [
            'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu',
            'jupiter', 'saturn', 'mercury', 'ketu', 'venus', 'sun',
            'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury',
            'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu',
            'jupiter', 'saturn', 'mercury'
        ];

        const nakshatraIndex = Math.floor((moonPos % 360) / (360 / 27)) + 1;
        const nakshatraAngle = (moonPos % 360) % (360 / 27);
        const pada = Math.floor(nakshatraAngle / (360 / 27 / 4)) + 1;

        const nakshatraData = {
            index: nakshatraIndex,
            name: nakshatraNames[nakshatraIndex - 1],
            lord: nakshatraLords[nakshatraIndex - 1],
            pada: pada,
            degree: moonPos % 30
        };

        // Update section title
        const sectionTitle = container.closest('section')?.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.textContent = `Moon in ${nakshatraData.name} Nakshatra`;
        }

        // Get detailed Nakshatra data if available
        const nak_index = nakshatraData.index;
        const nakshatraDetails = this.moonData?.moon_nakshatras?.[nak_index.toString()];

        if (nakshatraDetails) {
            container.innerHTML = `
                <div class="remedy-card" style="border-left-color: var(--star-gold);">
                    <h3 style="color: var(--star-gold);">⭐ ${nakshatraDetails.name}</h3>
                    <p style="color: var(--moon-silver); margin-top: 0.5rem;">
                        <strong>Lord:</strong> ${this.capitalize(nakshatraDetails.lord)} | <strong>Degrees:</strong> ${nakshatraDetails.degrees}
                    </p>
                    <p style="color: var(--soft-white); margin-top: 1rem; line-height: 1.8;">
                        <strong>Psychological Traits:</strong> ${nakshatraDetails.psychological_traits}
                    </p>
                    <p style="color: var(--soft-white); margin-top: 0.8rem; line-height: 1.8;">
                        <strong>Emotional Pattern:</strong> ${nakshatraDetails.emotional_pattern}
                    </p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                        <div>
                            <h5 style="color: var(--accent-cyan);">Mental Strengths:</h5>
                            <p style="color: var(--moon-silver); margin-top: 0.3rem;">${nakshatraDetails.mental_strengths}</p>
                        </div>
                        <div>
                            <h5 style="color: var(--accent-orange);">Mental Challenges:</h5>
                            <p style="color: var(--moon-silver); margin-top: 0.3rem;">${nakshatraDetails.mental_challenges}</p>
                        </div>
                    </div>

                    <div style="background: rgba(100, 255, 218, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                        <p style="color: var(--accent-cyan);"><strong>Career Aptitude:</strong></p>
                        <p style="color: var(--soft-white); margin-top: 0.5rem;">${nakshatraDetails.career_aptitude}</p>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="remedy-card">
                    <h3 style="color: var(--star-gold);">⭐ ${nakshatraData.name}</h3>
                    <p style="color: var(--moon-silver);">
                        Pada ${nakshatraData.pada} | Lord: ${this.capitalize(nakshatraData.lord)}
                    </p>
                    <p style="color: var(--soft-white); margin-top: 1rem;">
                        Your Nakshatra influences your mindset and emotional patterns. The ruling planet
                        ${this.capitalize(nakshatraData.lord)} adds its characteristics to your Moon.
                    </p>
                </div>
            `;
        }
    }

    renderMoonRemedies() {
        const container = document.getElementById('moonRemediesContainer');
        if (!container) return;

        const remedies = this.moonData?.remedies || {};

        const html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                ${remedies.mantras ? `
                <div class="remedy-card" style="border-left-color: var(--star-gold);">
                    <h4 style="color: var(--star-gold);">🕉️ Moon Mantras</h4>
                    <ul style="margin-top: 0.5rem; color: var(--soft-white); line-height: 1.8;">
                        <li><strong>Basic:</strong> ${remedies.mantras.basic}</li>
                        <li><strong>Advanced:</strong> ${remedies.mantras.advanced}</li>
                        <li><strong>Gayatri:</strong> ${remedies.mantras.gayatri}</li>
                    </ul>
                    <p style="margin-top: 1rem; color: var(--accent-cyan); font-size: 0.9rem;">
                        Chant daily for mental peace and emotional stability.
                    </p>
                </div>
                ` : ''}

                ${remedies.gemstone ? `
                <div class="remedy-card" style="border-left-color: var(--moon-silver);">
                    <h4 style="color: var(--moon-silver);">💎 Gemstone</h4>
                    <p style="color: var(--soft-white); margin-top: 0.5rem;">
                        <strong>${remedies.gemstone.stone}</strong>
                    </p>
                    <ul style="margin-top: 0.5rem; color: var(--moon-silver); font-size: 0.9rem;">
                        <li>Weight: ${remedies.gemstone.weight}</li>
                        <li>Metal: ${remedies.gemstone.metal}</li>
                        <li>Finger: ${remedies.gemstone.finger}</li>
                        <li>Day: ${remedies.gemstone.day}</li>
                    </ul>
                    <p style="margin-top: 1rem; color: var(--accent-pink); font-size: 0.85rem;">
                        ⚠️ ${remedies.gemstone.note}
                    </p>
                </div>
                ` : ''}

                ${remedies.charity ? `
                <div class="remedy-card" style="border-left-color: var(--accent-cyan);">
                    <h4 style="color: var(--accent-cyan);">🎁 Charity (Daan)</h4>
                    <p style="color: var(--soft-white); margin-top: 0.5rem;">
                        <strong>Day:</strong> ${remedies.charity.day}
                    </p>
                    <p style="color: var(--moon-silver); margin-top: 0.3rem;">
                        <strong>Items:</strong> ${remedies.charity.items.join(', ')}
                    </p>
                    <p style="color: var(--moon-silver); margin-top: 0.3rem;">
                        <strong>To:</strong> ${remedies.charity.recipients}
                    </p>
                </div>
                ` : ''}

                ${remedies.deity_worship ? `
                <div class="remedy-card" style="border-left-color: var(--star-gold);">
                    <h4 style="color: var(--star-gold);">🙏 Deity Worship</h4>
                    <p style="color: var(--soft-white); margin-top: 0.5rem;">
                        <strong>Primary:</strong> ${remedies.deity_worship.primary}
                    </p>
                    <p style="color: var(--moon-silver); margin-top: 0.3rem;">
                        <strong>Secondary:</strong> ${remedies.deity_worship.secondary}
                    </p>
                    <p style="color: var(--accent-cyan); margin-top: 0.5rem;">
                        ${remedies.deity_worship.practice}
                    </p>
                </div>
                ` : ''}

                ${remedies.mental_health_specific ? `
                <div class="remedy-card" style="border-left-color: var(--accent-cyan); grid-column: 1 / -1;">
                    <h4 style="color: var(--accent-cyan);">🧠 Mental Health Practices</h4>
                    <ul style="margin-top: 0.5rem; color: var(--soft-white); line-height: 1.8;">
                        ${Object.entries(remedies.mental_health_specific).map(([key, value]) =>
            `<li><strong>${this.capitalize(key)}:</strong> ${value}</li>`
        ).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = html;
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MoonAnalysisController();
});
