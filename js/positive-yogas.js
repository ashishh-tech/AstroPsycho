// Positive Yogas Page Logic
// Detects and displays auspicious planetary combinations

class PositiveYogasController {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();
        this.userData = null;
        this.birthChart = null;
        this.yogaData = null;
        this.init();
    }

    async init() {
        try {
            this.userData = this.loadUserData();
            if (!this.userData || !this.userData.birthDetails) {
                this.showError('No birth data found. Please complete the assessment first.');
                return;
            }

            this.birthChart = this.astrologyEngine.calculateBirthChart(this.userData.birthDetails);
            await this.loadYogaData();
            this.renderPositiveYogas();
        } catch (error) {
            console.error('Positive Yogas Error:', error);
            this.showError('Error loading yoga analysis. Please try again.');
        }
    }

    loadUserData() {
        const data = localStorage.getItem('astropsycho_assessment');
        return data ? JSON.parse(data) : null;
    }

    async loadYogaData() {
        try {
            const response = await fetch('data/comprehensive-yogas.json');
            this.yogaData = await response.json();
        } catch (error) {
            console.error('Error loading yoga data:', error);
            this.yogaData = { positive_yogas: [] };
        }
    }

    showError(message) {
        const content = document.getElementById('positiveYogasContent');
        if (content) {
            content.innerHTML = `
                <div class="info-box" style="border-color: var(--accent-cyan); margin-top: 2rem;">
                    <h3 style="color: var(--accent-cyan);">✨ Quick Yoga Analysis</h3>
                    <p style="margin-bottom: 1.5rem;">Enter your birth details to discover your positive yogas instantly.</p>
                    
                    ${this.createBirthForm('quickYogaForm')}
                </div>
            `;

            document.getElementById('quickYogaForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.processQuickBirthDetails();
            });
        }
    }

    createBirthForm(formId) {
        return `
            <form id="${formId}" style="max-width: 600px;">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="quickName" required placeholder="Your full name">
                </div>
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" id="quickDate" required>
                </div>
                <div class="form-group">
                    <label>Time of Birth</label>
                    <input type="time" id="quickTime" required>
                </div>
                <div class="form-group">
                    <label>Place of Birth</label>
                    <input type="text" id="quickPlace" required placeholder="e.g. Kolkata, Mumbai, Delhi"
                        oninput="window._posYogaCtrl && window._posYogaCtrl.onQuickCityInput(this.value)">
                    <div id="quickCityStatus" style="font-size:0.78rem;margin-top:4px;min-height:18px;"></div>
                </div>
                <div class="button-group" style="margin-top: 1.5rem;">
                    <button type="submit" class="btn btn-primary">Analyze My Yogas ✨</button>
                    <a href="index.html" class="btn btn-secondary">← Back to Home</a>
                </div>
            </form>
        `;
    }

    getCityCoords(cityName) {
        const db = {
            'kolkata': [22.5726, 88.3639], 'calcutta': [22.5726, 88.3639],
            'mumbai': [19.0760, 72.8777], 'bombay': [19.0760, 72.8777],
            'delhi': [28.6139, 77.2090], 'new delhi': [28.6139, 77.2090],
            'bangalore': [12.9716, 77.5946], 'bengaluru': [12.9716, 77.5946],
            'chennai': [13.0827, 80.2707], 'madras': [13.0827, 80.2707],
            'hyderabad': [17.3850, 78.4867], 'pune': [18.5204, 73.8567],
            'ahmedabad': [23.0225, 72.5714], 'jaipur': [26.9124, 75.7873],
            'lucknow': [26.8467, 80.9462], 'kanpur': [26.4499, 80.3319],
            'nagpur': [21.1458, 79.0882], 'indore': [22.7196, 75.8577],
            'bhopal': [23.2599, 77.4126], 'patna': [25.5941, 85.1376],
            'surat': [21.1702, 72.8311], 'vadodara': [22.3072, 73.1812],
            'agra': [27.1767, 78.0081], 'varanasi': [25.3176, 82.9739],
            'benaras': [25.3176, 82.9739], 'kashi': [25.3176, 82.9739],
            'allahabad': [25.4358, 81.8463], 'prayagraj': [25.4358, 81.8463],
            'meerut': [28.9845, 77.7064], 'visakhapatnam': [17.6868, 83.2185],
            'vizag': [17.6868, 83.2185], 'coimbatore': [11.0168, 76.9558],
            'madurai': [9.9252, 78.1198], 'kochi': [9.9312, 76.2673],
            'cochin': [9.9312, 76.2673], 'trivandrum': [8.5241, 76.9366],
            'thiruvananthapuram': [8.5241, 76.9366], 'kozhikode': [11.2588, 75.7804],
            'calicut': [11.2588, 75.7804], 'chandigarh': [30.7333, 76.7794],
            'amritsar': [31.6340, 74.8723], 'ludhiana': [30.9010, 75.8573],
            'guwahati': [26.1445, 91.7362], 'bhubaneswar': [20.2961, 85.8245],
            'raipur': [21.2514, 81.6296], 'ranchi': [23.3441, 85.3096],
            'dehradun': [30.3165, 78.0322], 'shimla': [31.1048, 77.1734],
            'srinagar': [34.0837, 74.7973], 'jammu': [32.7266, 74.8570],
            'goa': [15.2993, 74.1240], 'panaji': [15.4909, 73.8278],
            'mangalore': [12.9141, 74.8560], 'mangaluru': [12.9141, 74.8560],
            'mysore': [12.2958, 76.6394], 'mysuru': [12.2958, 76.6394],
            'vijayawada': [16.5062, 80.6480], 'tirupati': [13.6288, 79.4192],
            'nashik': [20.0059, 73.7902], 'jodhpur': [26.2389, 73.0243],
            'udaipur': [24.5854, 73.7125], 'noida': [28.5355, 77.3910],
            'gurgaon': [28.4595, 77.0266], 'gurugram': [28.4595, 77.0266],
            'faridabad': [28.4089, 77.3178], 'thane': [19.2183, 72.9781],
        };
        const key = cityName.trim().toLowerCase();
        if (db[key]) return db[key];
        for (const c in db) { if (c.startsWith(key) || key.startsWith(c)) return db[c]; }
        return null;
    }

    onQuickCityInput(value) {
        const el = document.getElementById('quickCityStatus');
        if (!el) return;
        const coords = this.getCityCoords(value);
        if (coords) {
            el.innerHTML = `<span style="color:#4ade80;">✓ ${value} (${coords[0].toFixed(2)}°N, ${coords[1].toFixed(2)}°E)</span>`;
        } else if (value.length > 2) {
            el.innerHTML = '<span style="color:#fbbf24;">City not in offline database — will use Delhi coords as fallback</span>';
        } else { el.innerHTML = ''; }
    }

    processQuickBirthDetails() {
        const placeVal = document.getElementById('quickPlace').value;

        // Auto-resolve coordinates from city name
        const coords = this.getCityCoords(placeVal);
        const lat = coords ? coords[0] : 28.6139;
        const lon = coords ? coords[1] : 77.2090;

        if (!coords) {
            console.warn('⚠️ City not found in database:', placeVal, '— using Delhi default');
        }

        const birthDetails = {
            fullName: document.getElementById('quickName').value,
            birthDate: document.getElementById('quickDate').value,
            birthTime: document.getElementById('quickTime').value,
            birthPlace: placeVal,
            latitude: lat,
            longitude: lon,
            timezone: 5.5,
            gender: 'not-specified'
        };

        this.userData = {
            birthDetails: birthDetails,
            responses: { skipped: true },
            timestamp: new Date().toISOString()
        };

        // Save to localStorage for persistence across pages
        console.log('💾 Saving Yoga Quick Details:', this.userData);
        localStorage.setItem('astropsycho_assessment', JSON.stringify(this.userData));

        this.birthChart = this.astrologyEngine.calculateBirthChart(birthDetails);

        this.loadYogaData().then(() => {
            this.renderPositiveYogas();
        });
    }

    renderPositiveYogas() {
        this.renderUserGreeting();
        const detectedYogas = this.detectPositiveYogas();
        this.renderYogaSummary(detectedYogas);
        this.renderYogaCards(detectedYogas);
        this.renderEnhancementGuidance(detectedYogas);
    }

    renderUserGreeting() {
        const container = document.getElementById('userGreeting');
        if (!container) return;

        const name = this.userData?.birthDetails?.fullName || 'Valued User';
        container.innerHTML = `
            <h2 style="color: var(--star-gold); font-family: var(--font-display); font-size: 1.8rem;">
                ${name}'s Positive Yogas
            </h2>
        `;
    }

    detectPositiveYogas() {
        const { planets, ascendant } = this.birthChart;
        const detectedYogas = [];
        const yogasList = this.yogaData?.positive_yogas || [];

        yogasList.forEach(yoga => {
            const isDetected = this.checkYogaCondition(yoga, planets, ascendant);
            if (isDetected) {
                detectedYogas.push(yoga);
            }
        });

        return detectedYogas;
    }

    checkYogaCondition(yoga, planets, ascendant) {
        const yogaName = yoga.name;

        // Pancha Mahapurusha Yogas
        if (yogaName === 'Ruchaka Yoga') {
            return this.checkPanchaMahapurushaYoga('mars', planets, ascendant);
        } else if (yogaName === 'Bhadra Yoga') {
            return this.checkPanchaMahapurushaYoga('mercury', planets, ascendant);
        } else if (yogaName === 'Hamsa Yoga') {
            return this.checkPanchaMahapurushaYoga('jupiter', planets, ascendant);
        } else if (yogaName === 'Malavya Yoga') {
            return this.checkPanchaMahapurushaYoga('venus', planets, ascendant);
        } else if (yogaName === 'Sasha Yoga') {
            return this.checkPanchaMahapurushaYoga('saturn', planets, ascendant);
        }

        // Gaja Kesari Yoga
        if (yogaName === 'Gaja Kesari Yoga') {
            const jupHouse = this.astrologyEngine.getHouseNumber(planets.jupiter, ascendant);
            const moonHouse = this.astrologyEngine.getHouseNumber(planets.moon, ascendant);
            const dist = Math.abs(jupHouse - moonHouse);
            return [1, 4, 7, 10].includes(dist) || dist === 0;
        }

        // Saraswati Yoga
        if (yogaName === 'Saraswati Yoga') {
            const checkPlanets = ['jupiter', 'venus', 'mercury'];
            const validHouses = [1, 2, 4, 5, 7, 9, 10];
            return checkPlanets.every(p => validHouses.includes(this.astrologyEngine.getHouseNumber(planets[p], ascendant)));
        }

        // Amala Yoga
        if (yogaName === 'Amala Yoga') {
            const checkPlanets = ['jupiter', 'venus', 'mercury'];
            return checkPlanets.some(p => {
                const h = this.astrologyEngine.getHouseNumber(planets[p], ascendant);
                return h === 10;
            });
        }

        // Budhaditya Yoga
        if (yogaName === 'Budhaditya Yoga') {
            return Math.abs(planets.sun - planets.mercury) < 10;
        }

        // Chandra Mangala Yoga
        if (yogaName === 'Chandra Mangala Yoga') {
            return Math.abs(planets.moon - planets.mars) < 10;
        }

        // Sunapha Yoga
        if (yogaName === 'Sunapha Yoga') {
            const moonSign = Math.floor(planets.moon / 30);
            const nextSign = (moonSign + 1) % 12;
            return Object.entries(planets).some(([p, pos]) => {
                if (p === 'moon' || p === 'sun') return false;
                return Math.floor(pos / 30) === nextSign;
            });
        }

        // Anapha Yoga
        if (yogaName === 'Anapha Yoga') {
            const moonSign = Math.floor(planets.moon / 30);
            const prevSign = (moonSign + 11) % 12;
            return Object.entries(planets).some(([p, pos]) => {
                if (p === 'moon' || p === 'sun') return false;
                return Math.floor(pos / 30) === prevSign;
            });
        }

        // Durudhara Yoga
        if (yogaName === 'Durudhara Yoga') {
            const moonSign = Math.floor(planets.moon / 30);
            const prevSign = (moonSign + 11) % 12;
            const nextSign = (moonSign + 1) % 12;

            const hasPrev = Object.entries(planets).some(([p, pos]) => {
                if (p === 'moon' || p === 'sun') return false;
                return Math.floor(pos / 30) === prevSign;
            });
            const hasNext = Object.entries(planets).some(([p, pos]) => {
                if (p === 'moon' || p === 'sun') return false;
                return Math.floor(pos / 30) === nextSign;
            });
            return hasPrev && hasNext;
        }

        // Vesi, Voshi, Ubhayachari Yogas (Sun-based)
        if (yogaName === 'Vesi Yoga') {
            const sunSign = Math.floor(planets.sun / 30);
            const nextSign = (sunSign + 1) % 12;
            return Object.entries(planets).some(([p, pos]) => {
                if (p === 'sun' || p === 'moon') return false;
                return Math.floor(pos / 30) === nextSign;
            });
        }

        if (yogaName === 'Voshi Yoga') {
            const sunSign = Math.floor(planets.sun / 30);
            const prevSign = (sunSign + 11) % 12;
            return Object.entries(planets).some(([p, pos]) => {
                if (p === 'sun' || p === 'moon') return false;
                return Math.floor(pos / 30) === prevSign;
            });
        }

        if (yogaName === 'Ubhayachari Yoga') {
            const sunSign = Math.floor(planets.sun / 30);
            const prevSign = (sunSign + 11) % 12;
            const nextSign = (sunSign + 1) % 12;

            const hasPrev = Object.entries(planets).some(([p, pos]) => {
                if (p === 'sun' || p === 'moon') return false;
                return Math.floor(pos / 30) === prevSign;
            });
            const hasNext = Object.entries(planets).some(([p, pos]) => {
                if (p === 'sun' || p === 'moon') return false;
                return Math.floor(pos / 30) === nextSign;
            });
            return hasPrev && hasNext;
        }

        // Adhi Yoga
        if (yogaName === 'Adhi Yoga') {
            const moonHouse = this.astrologyEngine.getHouseNumber(planets.moon, ascendant);
            const benefics = ['jupiter', 'venus', 'mercury'];
            return benefics.some(p => {
                const h = this.astrologyEngine.getHouseNumber(planets[p], ascendant);
                const dist = (h - moonHouse + 12) % 12;
                return [6, 7, 8].includes(dist);
            });
        }

        // Vasumati Yoga
        if (yogaName === 'Vasumati Yoga') {
            const benefics = ['jupiter', 'venus', 'mercury'];
            const upachayas = [3, 6, 10, 11];
            return benefics.some(p => upachayas.includes(this.astrologyEngine.getHouseNumber(planets[p], ascendant)));
        }

        // Harsha, Sarala, Vimala Yogas
        if (['Harsha Yoga', 'Sarala Yoga', 'Vimala Yoga'].includes(yogaName)) {
            return false; // These require house lordship calculation - simplified for now
        }

        return false;
    }

    checkPanchaMahapurushaYoga(planet, planets, ascendant) {
        const planetPos = planets[planet];
        const sign = Math.floor(planetPos / 30);
        const house = this.astrologyEngine.getHouseNumber(planetPos, ascendant);

        // Check if planet is in kendra (1,4,7,10)
        if (![1, 4, 7, 10].includes(house)) return false;

        // Check exaltation/own sign
        const exaltedSigns = {
            mars: [10],// Capricorn
            mercury: [6],// Virgo
            jupiter: [4],// Cancer
            venus: [12],//pisces
            saturn: [7]// Libra
        };

        const ownSigns = {
            mars: [1, 8], // Aries, Scorpio
            mercury: [3, 6], // Gemini, Virgo
            jupiter: [9, 12], // Sagittarius, Pisces
            venus: [2, 7], // Taurus, Libra
            saturn: [10, 11] // Capricorn, Aquarius
        };

        const isExalted = exaltedSigns[planet]?.includes(sign);
        const isOwnSign = ownSigns[planet]?.includes(sign);

        return isExalted || isOwnSign;
    }

    renderYogaSummary(yogas) {
        const container = document.getElementById('yogaSummary');
        if (!container) return;

        const categories = {};
        yogas.forEach(yoga => {
            const cat = yoga.category || 'special_yogas';
            categories[cat] = (categories[cat] || 0) + 1;
        });
        console.log('📊 Yoga Category Distribution:', categories);

        const categoryNames = {
            pancha_mahapurusha: 'Mahapurusha Yogas',
            raja_yogas: 'Raja Yogas',
            dhana_yogas: 'Dhana Yogas',
            chandra_yogas: 'Moon Yogas',
            surya_yogas: 'Sun Yogas',
            guru_yogas: 'Jupiter Yogas',
            budha_yogas: 'Mercury Yogas',
            special_yogas: 'Special Yogas'
        };

        let html = `
            <div class="remedy-card" style="border-left-color: var(--star-gold);">
                <h3 style="color: var(--star-gold);">Total Positive Yogas Detected</h3>
                <p style="font-size: 3rem; color: var(--accent-cyan); margin: 0;">${yogas.length}</p>
            </div>
        `;

        Object.entries(categories).forEach(([cat, count]) => {
            html += `
                <div class="remedy-card" style="border-left-color: var(--accent-cyan);">
                    <h4 style="color: var(--accent-cyan);">${categoryNames[cat] || cat}</h4>
                    <p style="font-size: 2rem; color: var(--soft-white); margin: 0;">${count}</p>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderYogaCards(yogas) {
        const container = document.getElementById('positiveYogasContainer');
        if (!container) return;

        if (yogas.length === 0) {
            container.innerHTML = `
                <div class="remedy-card" style="border-left-color: var(--accent-orange);">
                    <h3 style="color: var(--accent-orange);">No Major Positive Yogas Detected</h3>
                    <p style="color: var(--soft-white); margin-top: 1rem; line-height: 1.8;">
                        While no major classical yogas were detected, remember that your chart has other strengths.
                        Focus on strengthening your ascendant and Moon for overall well-being.
                    </p>
                </div>
            `;
            return;
        }

        const html = yogas.map(yoga => {
            const strengthColor =
                yoga.strength === 'very_high' ? 'var(--star-gold)' :
                    yoga.strength === 'high' ? 'var(--accent-cyan)' :
                        'var(--moon-silver)';

            return `
                <div class="remedy-card" style="border-left-color: ${strengthColor};">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h3 style="color: ${strengthColor}; margin-bottom: 0.2rem;">✨ ${yoga.name || 'Unknown Yoga'}</h3>
                            ${yoga.sanskritName ? `<p style="color: var(--star-gold); font-size: 0.9rem; font-family: 'Cinzel', serif; opacity: 0.8;">${yoga.sanskritName}</p>` : ''}
                        </div>
                        <span style="background: rgba(100, 255, 218, 0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; color: var(--accent-cyan);">
                            ${this.formatCategory(yoga.category || 'special_yogas')}
                        </span>
                    </div>
                    
                    <p style="color: var(--moon-silver); margin-top: 0.8rem; font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
                        <strong>🛠️ Formation:</strong> ${yoga.condition || 'Conditions not specified'}
                    </p>
                    
                    <div style="background: rgba(100, 255, 218, 0.05); padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 2px solid ${strengthColor};">
                        <p style="color: var(--soft-white); line-height: 1.8; margin-top: 0;">
                            <strong>💎 Beneficial Impact:</strong><br>
                            ${yoga.effect || 'Description not available'}
                        </p>
                    </div>

                    <div style="display: flex; gap: 0.5rem; margin-top: 1.2rem;">
                        ${yoga.strength ? `
                            <span style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; color: var(--star-gold);">
                                Strength: ${this.capitalize((yoga.strength || 'medium').replace('_', ' '))}
                            </span>
                        ` : ''}
                        ${yoga.rarity ? `
                            <span style="background: rgba(200, 200, 220, 0.1); border: 1px solid rgba(200, 200, 220, 0.3); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; color: var(--moon-silver);">
                                ${this.capitalize(yoga.rarity || 'Common')}
                            </span>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    renderEnhancementGuidance(yogas) {
        const container = document.getElementById('enhancementGuidance');
        if (!container) return;

        const html = `
            <div class="remedy-card" style="border-left-color: var(--accent-cyan);">
                <h4 style="color: var(--accent-cyan);">💫 General Enhancement Tips</h4>
                <ul style="margin-top: 0.5rem; color: var(--soft-white); line-height: 1.8;">
                    <li>Positive yogas need <strong>activation through effort</strong> - they show potential, not guarantee</li>
                    <li>Strengthen the planets involved in your yogas through their specific remedies</li>
                    <li>Work methodically on your goals in the areas indicated by each yoga</li>
                    <li>Maintain ethical conduct to ensure yogas give positive results</li>
                    <li>Dasha periods of yoga-forming planets will be especially favorable</li>
                </ul>
            </div>

            ${yogas.length > 0 ? `
                <div class="remedy-card" style="border-left-color: var(--star-gold);">
                    <h4 style="color: var(--star-gold);">🌟 Your Yoga-Specific Guidance</h4>
                    <p style="color: var(--soft-white); margin-top: 0.5rem; line-height: 1.8;">
                        You have <strong>${yogas.length} positive yoga(s)</strong> in your chart. Focus on:
                    </p>
                    <ul style="margin-top: 0.5rem; color: var(--moon-silver); line-height: 1.8;">
                        ${this.getSpecificGuidance(yogas).map(g => `<li>${g}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        container.innerHTML = html;
    }

    getSpecificGuidance(yogas) {
        const guidance = [];
        const categories = yogas.map(y => y.category);

        if (categories.includes('pancha_mahapurusha')) {
            guidance.push('Develop the exceptional qualities of your Mahapurusha Yoga - you have the potential for greatness in your field');
        }
        if (categories.includes('raja_yogas')) {
            guidance.push('Pursue leadership roles and positions of authority - your Raja Yoga supports this');
        }
        if (categories.includes('dhana_yogas')) {
            guidance.push('Focus on wealth-building strategies - your Dhana Yoga indicates financial success potential');
        }
        if (categories.includes('guru_yogas') || categories.includes('budha_yogas')) {
            guidance.push('Pursue higher education and intellectual development - your chart supports wisdom and learning');
        }
        if (categories.includes('chandra_yogas')) {
            guidance.push('Cultivate emotional intelligence and public relations - your Moon yogas give people skills');
        }

        if (guidance.length === 0) {
            guidance.push('Work consistently on your goals and strengthen the planets forming your yogas');
        }

        return guidance;
    }

    formatCategory(category) {
        const names = {
            pancha_mahapurusha: 'Mahapurusha',
            raja_yogas: 'Raja Yoga',
            dhana_yogas: 'Dhana Yoga',
            chandra_yogas: 'Moon Yoga',
            surya_yogas: 'Sun Yoga',
            guru_yogas: 'Jupiter Yoga',
            budha_yogas: 'Mercury Yoga',
            special_yogas: 'Special'
        };
        return names[category] || category;
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window._posYogaCtrl = new PositiveYogasController();
});

