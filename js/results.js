// Results Page Logic
// Processes assessment data and displays personalized report

class ResultsController {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();
        this.recommendationEngine = new RecommendationEngine();
        this.chartRenderer = new AstroChartRenderer();
        this.userData = null;
        this.report = null;
        this.chartStyle = 'north'; // 'north' or 'south'
    }

    async init() {
        try {
            // Load user data from localStorage
            this.loadUserData();

            // Wait for recommendation engine to load data
            await this.recommendationEngine.init();

            // Check if data loaded successfully
            if (!this.recommendationEngine.vedicKnowledge) {
                throw new Error('Failed to load Vedic astrology knowledge base');
            }

            // Calculate birth chart
            const birthChart = this.astrologyEngine.calculateBirthChart(this.userData.birthDetails);

            // ── SAVE exact chart for AI Ashish chatbot ──────────────────────
            try {
                const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
                const lagnaSignIdx = Math.floor(birthChart.ascendant / 30);
                const aiChart = {
                    lagna: SIGNS[lagnaSignIdx],
                    lagnaSignIdx,
                    moonSign: birthChart.planetaryDetails.moon ? birthChart.planetaryDetails.moon.sign : SIGNS[Math.floor(birthChart.planets.moon / 30)],
                    sunSign:  birthChart.planetaryDetails.sun  ? birthChart.planetaryDetails.sun.sign  : SIGNS[Math.floor(birthChart.planets.sun  / 30)],
                    planets: {}
                };
                Object.entries(birthChart.planetaryDetails).forEach(([p, d]) => {
                    aiChart.planets[p] = { sign: d.sign, house: d.house, nakshatra: d.nakshatra || '' };
                });
                const stored = JSON.parse(localStorage.getItem('astropsycho_assessment') || '{}');
                stored.calculatedChart = aiChart;
                localStorage.setItem('astropsycho_assessment', JSON.stringify(stored));
            } catch(e) { console.warn('AI chart save failed:', e); }
            // ─────────────────────────────────────────────────────────────────

            // Generate comprehensive report
            this.report = this.recommendationEngine.generateReport(this.userData, birthChart);

            // Render report
            this.renderReport();
        } catch (error) {
            console.error('Error initializing results:', error);
            this.showError(error.message);
        }
    }

    showError(message) {
        document.getElementById('reportContent').innerHTML = `
            <div style="padding: 3rem; text-align: center;">
                <h2 style="color: var(--accent-pink); font-family: var(--font-display); margin-bottom: 1rem;">
                    ⚠️ Error Loading Report
                </h2>
                <p style="color: var(--moon-silver); margin-bottom: 2rem;">
                    ${message}
                </p>
                <div class="info-box" style="text-align: left; max-width: 600px; margin: 0 auto;">
                    <strong>Possible issues:</strong>
                    <ul style="margin-top: 0.5rem;">
                        <li>Data files may not have loaded properly</li>
                        <li>Check browser console for errors (F12)</li>
                        <li>Try refreshing the page</li>
                        <li>Ensure you're running from a web server (localhost)</li>
                    </ul>
                </div>
                <div class="button-group" style="margin-top: 2rem; justify-content: center;">
                    <button onclick="location.reload()" class="btn btn-primary">Retry</button>
                    <a href="assessment.html" class="btn btn-secondary" style="text-decoration: none; display: inline-block;">Back to Assessment</a>
                </div>
            </div>
        `;
    }

    loadUserData() {
        // Demo mode — load Sachin Tendulkar's famous chart for investor preview
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('demo') === '1') {
            this.userData = {
                birthDetails: {
                    fullName: 'Sachin Tendulkar (Demo)',
                    birthDate: '1973-04-24',
                    birthTime: '18:45',
                    birthPlace: 'Mumbai, Maharashtra',
                    latitude: 19.0760,
                    longitude: 72.8777,
                    timezone: 5.5
                },
                responses: { skipped: true },
                completedAt: new Date().toISOString()
            };
            // Show demo banner
            const banner = document.createElement('div');
            banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,rgba(245,197,24,0.9),rgba(200,150,0,0.95));color:#000;padding:10px 16px;text-align:center;font-weight:700;font-size:0.9rem;letter-spacing:0.02em;';
            banner.innerHTML = '✨ <strong>DEMO MODE</strong> — Showing sample report for Sachin Tendulkar&nbsp;&nbsp;|&nbsp;&nbsp;<a href="assessment.html" style="color:#111;text-decoration:underline;">Create Your Own Report →</a>';
            document.body.prepend(banner);
            return;
        }
        const stored = localStorage.getItem('astropsycho_assessment');
        if (!stored) {
            alert('No assessment data found. Please complete the assessment first.');
            window.location.href = 'assessment.html';
            return;
        }
        this.userData = JSON.parse(stored);
    }

    renderReport() {
        const steps = [
            { name: 'Greeting', fn: () => this.renderUserGreeting() },
            { name: 'Charts', fn: () => this.renderCharts() },
            { name: 'Planetary Table', fn: () => this.renderPlanetaryTable() }
        ];

        const debugDiv = document.getElementById('printDebug');
        const errorMessages = [];

        steps.forEach(step => {
            try {
                step.fn();
            } catch (err) {
                const msg = `${step.name}: ${err.message} (line: ${err.stack ? err.stack.split('\n')[1] : 'unknown'})`;
                console.error(`Error in render step "${step.name}":`, err);
                errorMessages.push(msg);
                if (debugDiv) {
                    debugDiv.style.display = 'block';
                    debugDiv.innerHTML += `<p><strong>Error in ${step.name}:</strong> ${err.message}</p>`;
                }
            }
        });

        this.setupEventListeners();
    }


    renderKundaliOnlyMessage() {
        // Add a message explaining this is Kundali-only mode
        const psychSection = document.getElementById('psychologySection');
        if (psychSection) {
            psychSection.style.display = 'block';
            psychSection.innerHTML = `
                <h2 style="font-family: var(--font-display); color: var(--star-gold); margin-bottom: 1.5rem; font-size: 2rem;">
                    🕉️ Pure Vedic Astrology Analysis
                </h2>
                <div style="padding: 1.5rem; background: rgba(100, 255, 218, 0.05); border-radius: 12px; border: 1px solid rgba(100, 255, 218, 0.2);">
                    <p style="color: var(--accent-cyan); font-size: 1.1rem; margin-bottom: 0.5rem;">
                        <strong>Kundali-Only Mode</strong>
                    </p>
                    <p style="color: var(--moon-silver); line-height: 1.8;">
                        You've chosen to skip the psychological assessment. This report shows only your Vedic astrology analysis based on your birth chart:
                        your current Dasha periods, planetary positions, and general remedies for strengthening beneficial planets.
                    </p>
                    <p style="color: var(--moon-silver); margin-top: 1rem; font-size: 0.95rem;">
                        💡 <em>Want a more personalized analysis? Go back to the <a href="assessment.html" style="color: var(--accent-cyan);">assessment page</a> to complete the psychological questionnaire.</em>
                    </p>
                </div>
            `;
        }
    }

    renderUserGreeting() {
        const name = this.userData.birthDetails.fullName;
        document.getElementById('userGreeting').innerHTML = `
            <h2 style="font-family: var(--font-display); color: var(--accent-cyan); font-size: 1.8rem;">
                Namaste, ${name} 🙏
            </h2>
        `;
    }


    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatYearsMonths(years) {
        const y = Math.floor(years);
        const months = Math.round((years - y) * 12);

        if (y === 0) return `${months} months`;
        if (months === 0) return `${y} years`;
        return `${y} years, ${months} months`;
    }

    // --- New Upgrade Rendering Methods ---

    renderCharts() {
        const { planetaryDetails, ascendant, navamsha } = this.report.birthChart;
        const d9Sign = navamsha.ascendantSign;
        if (this.chartStyle === 'north') {
            this.chartRenderer.drawNorthIndianChart('lagnaChart', planetaryDetails, ascendant);
            this.chartRenderer.drawNorthIndianChart('navamshaChart', navamsha.planets, (d9Sign - 1) * 30 + 15);
        } else {
            this.chartRenderer.drawSouthIndianChart('lagnaChart', planetaryDetails, ascendant);
            this.chartRenderer.drawSouthIndianChart('navamshaChart', navamsha.planets, (d9Sign - 1) * 30 + 15);
        }
    }

    renderPlanetaryTable() {
        const tbody = document.getElementById('planetaryTableBody');
        if (!tbody) return;

        let html = '';
        const { planetaryDetails, navamsha } = this.report.birthChart;

        Object.entries(planetaryDetails).forEach(([planet, details]) => {
            const emoji = this.recommendationEngine.getPlanetEmoji(planet);
            const retroMarker = details.isRetrograde ? '<span style="color: var(--accent-pink); font-size: 0.8rem; margin-left: 0.2rem;" title="Retrograde">(R)</span>' : '';
            const combustMarker = details.isCombust ? '<span style="color: var(--accent-orange); font-size: 0.8rem; margin-left: 0.2rem;" title="Combust">(C)</span>' : '';
            const d9Sign = navamsha.planets[planet] ? navamsha.planets[planet].sign : '-';
            const nak = details.nakshatra || '-';
            const nakLord = details.nakshatraLord ? `<span style="color:var(--accent-cyan);font-size:0.78rem;"> (${details.nakshatraLord})</span>` : '';

            const statusClass = details.status.toLowerCase().replace(/\s+/g, '-');

            html += `
                <tr>
                    <td><strong>${emoji} ${this.capitalize(planet)}</strong>${retroMarker}${combustMarker}</td>
                    <td>${details.sign}</td>
                    <td>${details.house}</td>
                    <td>${nak}${nakLord}</td>
                    <td style="color: var(--star-gold);">${d9Sign}</td>
                    <td>${Math.floor(details.degree)}°${Math.floor((details.degree % 1) * 60)}'</td>
                    <td class="status-${statusClass}">${details.status}</td>
                </tr>
                `;
        });
        tbody.innerHTML = html;
    }

    renderShadbala() {
        const { shadbala } = this.report.birthChart;
        const tbody = document.getElementById('shadbalaTableBody');
        const chartDiv = document.getElementById('shadbalaChart');
        if (!tbody) return;

        let html = '';
        // Sort planets by total strength (ranking)
        const sortedPlanets = Object.entries(shadbala).sort((a, b) => b[1].totalRupas - a[1].totalRupas);

        const leader = sortedPlanets[0][0];
        const leaderData = sortedPlanets[0][1];

        if (chartDiv) {
            chartDiv.innerHTML = `
                < div class="info-box" style = "border-color: var(--star-gold); margin-bottom: 2rem;" >
                    <h3 style="color: var(--star-gold); margin-bottom: 0.5rem;">⭐ Strength Leader: ${this.capitalize(leader)}</h3>
                    <p style="color: var(--moon-silver);">
                        Your <strong>${this.capitalize(leader)}</strong> is exceptionally strong with <strong>${leaderData.totalRupas} Rupas</strong>. 
                        This indicates that the qualities of ${leader} will be natural assets in your life and psychological makeup.
                    </p>
                </div >
                `;
        }

        sortedPlanets.forEach(([planet, data], index) => {
            const rupaValue = data.totalRupas;
            const category = data.strengthCategory || 'Moderate';
            const categoryClass = category.toLowerCase().replace(/\s+/g, '-');
            const emoji = this.recommendationEngine.getPlanetEmoji(planet);
            const leaderClass = index === 0 ? 'strength-leader' : '';

            html += `
                < tr class="${leaderClass}" >
                    <td><strong>${emoji} ${this.capitalize(planet)}</strong></td>
                    <td>${data.sthanabala}</td>
                    <td>${data.digbala}</td>
                    <td>${data.kalabala}</td>
                    <td>${data.cheshtabala}</td>
                    <td>${data.naisargikabala}</td>
                    <td>${data.drikbala}</td>
                    <td style="font-weight: 700; color: var(--star-gold);">${rupaValue}</td>
                    <td class="status-${categoryClass}">${category}</td>
                </tr >
                `;
        });
        tbody.innerHTML = html;
    }

    renderAshtakavarga() {
        const { ashtakavarga } = this.report.birthChart;
        const grid = document.getElementById('ashtakavargaGrid');
        if (!grid) return;

        let html = '';
        ashtakavarga.total.forEach((points, i) => {
            const levelClass = points >= 28 ? 'high' : (points < 20 ? 'low' : '');
            html += `
                < div class="av-cell ${levelClass}" >
                    <span class="av-house">House ${i + 1}</span>
                    <span class="av-points">${points}</span>
                </div >
                `;
        });
        grid.innerHTML = html;
    }

    renderDetailedHouseAnalysis() {
        const { planetaryDetails } = this.report.birthChart;
        const knowledge = this.recommendationEngine.vedicKnowledge;
        const container = document.getElementById('houseAnalysisContainer');
        if (!container || !knowledge.planet_house_results) return;

        // Group planets by house
        const houseGroups = {};
        for (let i = 1; i <= 12; i++) houseGroups[i] = [];

        Object.entries(planetaryDetails).forEach(([planet, details]) => {
            houseGroups[details.house].push({ planet, details });
        });

        let html = '';
        for (let i = 1; i <= 12; i++) {
            if (houseGroups[i].length > 0) {
                const houseInfo = knowledge.houses_vedic[i];
                html += `
                < div class="remedy-card" style = "border-left-color: var(--star-gold);" >
                        <h4 style="color: var(--star-gold); margin-bottom: 0.5rem;">
                            🏡 ${houseInfo.name} (House ${i})
                        </h4>
                        <p style="color: var(--accent-cyan); font-size: 0.9rem; margin-bottom: 1rem;">
                            <em>Signifies: ${houseInfo.signifies}</em>
                        </p>
                        <div style="display: grid; gap: 1rem;">
                `;

                houseGroups[i].forEach(({ planet, details }) => {
                    const resultText = knowledge.planet_house_results[planet] ? knowledge.planet_house_results[planet][i] : 'Information for this placement is currently being analyzed.';
                    html += `
                        <div style="padding: 0.75rem; background: rgba(100, 255, 218, 0.05); border-radius: 8px;">
                            <strong style="color: var(--soft-white);">${this.recommendationEngine.getPlanetEmoji(planet)} ${this.capitalize(planet)}:</strong>
                            <p style="color: var(--moon-silver); font-size: 1rem; margin-top: 0.3rem;">${resultText}</p>
                        </div>
                    `;
                });

                html += `</div></div > `;
            }
        }
        container.innerHTML = html;
    }

    async renderFullMoonAnalysis() {
        const container = document.getElementById('moonAnalysisContainer');
        if (!container) return;

        const { planets, planetaryDetails } = this.report.birthChart;
        const moonPos = planets.moon;
        const moonSign = Math.floor(moonPos / 30);
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

        // Logic from moon-analysis.js
        let strength = 50;
        const sunPos = planets.sun;
        const elongation = (moonPos - sunPos + 360) % 360;
        const isWaxing = elongation >= 0 && elongation < 180;

        if (moonSign === 1) strength += 40; // Taurus
        if (moonSign === 7) strength -= 30; // Scorpio
        if (moonSign === 3) strength += 20; // Cancer
        if (isWaxing) strength += 15; else strength -= 10;

        const moonDetails = planetaryDetails.moon;
        const strengthLabel = strength > 70 ? 'Strong & Balanced' : (strength > 40 ? 'Moderate' : 'Sensitive/Afflicted');

        let html = `
                < div class="charts-grid" >
                <div class="remedy-card" style="border-left-color: var(--moon-silver);">
                    <h3 style="color: var(--moon-silver);">🌙 Lunar Profile</h3>
                    <p style="color: var(--soft-white); font-size: 1.1rem; margin: 0.5rem 0;">
                        <strong>Sign:</strong> ${signs[moonSign]} (${moonDetails.house} House)
                    </p>
                    <p style="color: var(--moon-silver);">
                        <strong>Mental Strength:</strong> ${strength}% (${strengthLabel})
                    </p>
                    <p style="color: var(--accent-cyan); font-size: 0.9rem;">
                        Phase: ${isWaxing ? 'Waxing (Shukla Paksha)' : 'Waning (Krishna Paksha)'}
                    </p>
                </div>
                <div class="remedy-card" style="border-left-color: var(--star-gold);">
                    <h3 style="color: var(--star-gold);">🧠 Psychological Insight</h3>
                    <p style="color: var(--moon-silver); font-style: italic; line-height: 1.6;">
                        "The Moon is the 'Manas' or mind. Your ${signs[moonSign]} Moon in ${moonDetails.house} House suggests a ${strength > 60 ? 'stable and resilient' : 'deeply emotional and sensitive'} approach to life's challenges."
                    </p>
                </div>
            </div >

                <div class="remedy-card" style="margin-top: 1.5rem; border-left-color: var(--accent-cyan);">
                    <h4 style="color: var(--accent-cyan);">🌟 Emotional Resilience Analysis</h4>
                    <p style="color: var(--moon-silver); margin-top: 0.5rem;">
                        Your emotional world is governed by ${this.capitalize(moonDetails.sign)} and ${moonDetails.nakshatra}.
                        ${strength < 40 ? 'You may experience frequent mood swings or anxiety. Focus on stabilizing your routine.' : 'You possess natural emotional intelligence and ability to handle stress.'}
                    </p>
                </div>
            `;
        container.innerHTML = html;
    }

    renderFullYogaAnalysis() {
        const container = document.getElementById('yogaAnalysisContainer');
        if (!container) return;

        const { planets, ascendant } = this.report.birthChart;
        const detectedYogas = [];

        // --- Yoga Detection Logic ---

        // 1. Gaja Kesari Yoga (Jupiter in Kendra from Moon)
        const moonHouse = this.astrologyEngine.getHouseNumber(planets.moon, ascendant);
        const jupHouse = this.astrologyEngine.getHouseNumber(planets.jupiter, ascendant);
        const distMoonJup = (jupHouse - moonHouse + 12) % 12 + 1;
        if ([1, 4, 7, 10].includes(distMoonJup)) {
            detectedYogas.push({ name: "Gaja Kesari Yoga", type: "Benefic", desc: "Abundance, wisdom, and long-lasting fame. Great mental strength.", emoji: "🐘" });
        }

        // 2. Budhaditya Yoga (Sun & Mercury together)
        if (Math.abs(planets.sun - planets.mercury) < 15) {
            detectedYogas.push({ name: "Budhaditya Yoga", type: "Benefic", desc: "Intelligence, administrative skills, and professional success.", emoji: "💡" });
        }

        // 3. Moon Yogas (Sunapha, Anapha, Durudhara)
        const moonSign = Math.floor(planets.moon / 30);
        const houseBefore = (moonSign + 11) % 12;
        const houseAfter = (moonSign + 1) % 12;

        let hasBefore = false, hasAfter = false;
        Object.entries(planets).forEach(([p, pos]) => {
            if (['moon', 'sun', 'rahu', 'ketu'].includes(p)) return;
            const sign = Math.floor(pos / 30);
            if (sign === houseBefore) hasBefore = true;
            if (sign === houseAfter) hasAfter = true;
        });

        if (hasBefore && hasAfter) detectedYogas.push({ name: "Durudhara Yoga", type: "Benefic", desc: "Wealth, comforts, and social standing.", emoji: "⚖️" });
        else if (hasBefore) detectedYogas.push({ name: "Anapha Yoga", type: "Benefic", desc: "Good health, polite nature, and fame.", emoji: "🌙" });
        else if (hasAfter) detectedYogas.push({ name: "Sunapha Yoga", type: "Benefic", desc: "Self-made wealth and high intelligence.", emoji: "☀️" });
        else detectedYogas.push({ name: "Kemadruma Yoga", type: "Malefic/Challenge", desc: "Loneliness or struggle in early life. Requires mental discipline.", emoji: "🌫️" });

        // 4. Paapa Kartari (Lagna between Malefics)
        const lagnaSign = Math.floor(ascendant / 30);
        const houseB = (lagnaSign + 11) % 12;
        const houseA = (lagnaSign + 1) % 12;
        let bMalefics = 0, aMalefics = 0;
        ['mars', 'saturn', 'rahu', 'ketu'].forEach(p => {
            const s = Math.floor(planets[p] / 30);
            if (s === houseB) bMalefics++;
            if (s === houseA) aMalefics++;
        });
        if (bMalefics > 0 && aMalefics > 0) {
            detectedYogas.push({ name: "Paapa Kartari Yoga (Lagna)", type: "Malefic/Challenge", desc: "Obstacles and constant pressure. Requires perseverance.", emoji: "⚔️" });
        }

        // --- Render Yogas ---
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">';

        detectedYogas.forEach(yoga => {
            const color = yoga.type.includes('Benefic') ? 'var(--accent-cyan)' : 'var(--accent-pink)';
            html += `
                < div class="remedy-card" style = "border-left-color: ${color};" >
                    <h4 style="color: ${color};">${yoga.emoji} ${yoga.name}</h4>
                    <p style="color: var(--moon-silver); font-size: 0.9rem; margin-top: 0.3rem;">
                        <strong>Type:</strong> ${yoga.type}
                    </p>
                    <p style="color: var(--soft-white); margin-top: 0.5rem; line-height: 1.5;">${yoga.desc}</p>
                </div >
                `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    setupEventListeners() {
        const btnNorth = document.getElementById('btnNorthIndian');
        const btnSouth = document.getElementById('btnSouthIndian');

        if (btnNorth && btnSouth) {
            btnNorth.addEventListener('click', () => {
                this.chartStyle = 'north';
                btnNorth.classList.add('active');
                btnSouth.classList.remove('active');
                this.renderCharts();
            });

            btnSouth.addEventListener('click', () => {
                this.chartStyle = 'south';
                btnSouth.classList.add('active');
                btnNorth.classList.remove('active');
                this.renderCharts();
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const controller = new ResultsController();
    await controller.init();
});
