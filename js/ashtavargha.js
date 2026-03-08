// Ashtavargha Page Logic
// Displays detailed Bhinnashtakavarga and Sarvashtakavarga analysis

class AshtavarghaController {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();
        this.userData = null;
        this.birthChart = null;
        this.ashtakavarga = null;

        this.signNames = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Ca', 'Aq', 'Pi'];
        this.signFullNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.planetNames = {
            sun: 'SUN',
            moon: 'MOON',
            mars: 'MARS',
            mercury: 'MERC',
            jupiter: 'JUPT',
            venus: 'VENU',
            saturn: 'SATN'
        };

        this.init();
    }

    async init() {
        // Load user data from localStorage
        const hasData = this.loadUserData();

        if (!hasData) {
            this.showError('No birth data found');
            return;
        }

        try {
            // Calculate birth chart
            this.birthChart = this.astrologyEngine.calculateBirthChart(this.userData.birthDetails);
            this.ashtakavarga = this.birthChart.ashtakavarga;

            // Debug: Log the ashtakavarga structure
            console.log('Ashtakavarga data:', this.ashtakavarga);
            console.log('Bhinnashtakavarga:', this.ashtakavarga ? this.ashtakavarga.bhinnashtakavarga : 'undefined');

            // Render page
            this.renderUserGreeting();
            this.renderBhinnashtakavargaTable();
            this.renderVisualChart();
        } catch (error) {
            console.error('Error calculating Ashtavargha:', error);
            // Even if there's a calculation error, don't show the form if we have data
            const content = document.getElementById('ashtavarghaContent');
            if (content) {
                content.innerHTML = `
                    <div class="error-message" style="padding: 3rem; text-align: center;">
                        <h2 style="color: var(--accent-pink); margin-bottom: 1rem;">⚠️ Calculation Error</h2>
                        <p style="color: var(--moon-silver);">${error.message}</p>
                        <div class="button-group" style="margin-top: 2rem; justify-content: center;">
                            <button onclick="location.reload()" class="btn btn-primary">Retry</button>
                            <a href="results.html" class="btn btn-secondary">Back to Results</a>
                        </div>
                    </div>
                `;
            }
        }
    }

    loadUserData() {
        const stored = localStorage.getItem('astropsycho_assessment');

        if (stored) {
            try {
                this.userData = JSON.parse(stored);
                return true;
            } catch (e) {
                console.error('Error parsing localStorage data:', e);
                return false;
            }
        }
        return false;
    }

    showError(message) {
        const content = document.getElementById('ashtavarghaContent');
        if (content) {
            content.innerHTML = `
                <div class="results-header">
                    <h1 class="main-title" style="font-size: 2.5rem;">Ashtakavarga - Sarvashtakavarga</h1>
                    <p class="subtitle">Detailed Point System Analysis for Your Birth Chart</p>
                </div>

                <div class="info-box mb-3" style="border-color: var(--accent-cyan); background: rgba(100, 255, 218, 0.05);">
                    <h3 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">📊 Quick Ashtakavarga Analysis</h3>
                    <p style="color: var(--soft-white); line-height: 1.8;">
                        Enter your birth details below to get instant Ashtakavarga analysis without completing the full assessment.
                    </p>
                    
                    ${this.createBirthForm('quickAshtakavargaForm')}
                </div>
            `;

            document.getElementById('quickAshtakavargaForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.processQuickBirthDetails();
            });
        }
    }

    createBirthForm(formId) {
        return `
            <form id="${formId}" style="max-width: 600px; margin-top: 1.5rem;">
                <div class="form-group">
                    <label style="color: var(--star-gold);">Full Name</label>
                    <input type="text" id="quickName" required placeholder="Your full name" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(100,255,218,0.3); border-radius: 8px; color: var(--soft-white);">
                </div>
                
                <div class="form-group" style="margin-top: 1rem;">
                    <label style="color: var(--star-gold);">Date of Birth</label>
                    <input type="date" id="quickDate" required style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(100,255,218,0.3); border-radius: 8px; color: var(--soft-white);">
                </div>
                
                <div class="form-group" style="margin-top: 1rem;">
                    <label style="color: var(--star-gold);">Time of Birth</label>
                    <input type="time" id="quickTime" required style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(100,255,218,0.3); border-radius: 8px; color: var(--soft-white);">
                </div>
                
                <div class="form-group" style="margin-top: 1rem;">
                    <label style="color: var(--star-gold);">Place of Birth</label>
                    <input type="text" id="quickPlace" required placeholder="City name" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(100,255,218,0.3); border-radius: 8px; color: var(--soft-white);">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                    <div class="form-group">
                        <label style="color: var(--star-gold);">Latitude (Optional)</label>
                        <input type="number" id="quickLat" step="0.0001" placeholder="28.61 (Delhi default)" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(100,255,218,0.3); border-radius: 8px; color: var(--soft-white);">
                    </div>
                    
                    <div class="form-group">
                        <label style="color: var(--star-gold);">Longitude (Optional)</label>
                        <input type="number" id="quickLon" step="0.0001" placeholder="77.20 (Delhi default)" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(100,255,218,0.3); border-radius: 8px; color: var(--soft-white);">
                    </div>
                </div>
                
                <p style="color: var(--moon-silver); font-size: 0.85rem; margin-top: 0.5rem;">
                    💡 You can find your city's latitude/longitude on Google - or leave blank for Delhi
                </p>
                
                <div class="button-group" style="margin-top: 1.5rem;">
                    <button type="submit" class="btn btn-primary">Analyze My Ashtakavarga ✨</button>
                    <a href="index.html" class="btn btn-secondary">← Back to Home</a>
                </div>
            </form>
        `;
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
            timezone: 5.5,
            gender: 'not-specified'
        };

        this.userData = {
            birthDetails: birthDetails,
            responses: { skipped: true },
            timestamp: new Date().toISOString()
        };

        // Save to localStorage for persistence
        console.log('💾 Saving Ashtakavarga Quick Details:', this.userData);
        localStorage.setItem('astropsycho_assessment', JSON.stringify(this.userData));

        // Recalculate and render
        this.birthChart = this.astrologyEngine.calculateBirthChart(birthDetails);
        this.ashtakavarga = this.birthChart.ashtakavarga;

        // Debug logs
        console.log('Ashtakavarga data:', this.ashtakavarga);
        console.log('Bhinnashtakavarga:', this.ashtakavarga ? this.ashtakavarga.bhinnashtakavarga : 'undefined');

        //  Reload the page content
        location.reload();
    }

    renderUserGreeting() {
        const name = this.userData.birthDetails.fullName;
        document.getElementById('userGreeting').innerHTML = `
            <h2 style="font-family: var(--font-display); color: var(--accent-cyan); font-size: 1.8rem;">
                Namaste, ${name} 🙏
            </h2>
        `;
    }

    renderBhinnashtakavargaTable() {
        const tbody = document.getElementById('bhinnashtakavargaTableBody');
        if (!tbody) {
            console.error('Table body element not found');
            return;
        }

        console.log('🎨 Rendering table with ashtakavarga:', this.ashtakavarga);

        // Check if we have any ashtakavarga data
        if (!this.ashtakavarga) {
            tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; color: var(--accent-pink);">No Ashtakavarga data calculated</td></tr>';
            return;
        }

        const planetList = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
        let html = '';

        // Check if bhinnashtakavarga exists
        if (this.ashtakavarga.bhinnashtakavarga) {
            // Render each planet's row
            planetList.forEach(planet => {
                const points = this.ashtakavarga.bhinnashtakavarga[planet];
                if (points && Array.isArray(points)) {
                    html += `
                        <tr>
                            <td><strong>${this.planetNames[planet]}</strong></td>
                            ${points.map(p => `<td>${p}</td>`).join('')}
                        </tr>
                    `;
                }
            });

            // Add Total row
            const totals = this.ashtakavarga.sarvashtakavarga || this.ashtakavarga.total;
            if (totals && Array.isArray(totals)) {
                html += `
                    <tr class="total-row">
                        <td><strong>Total</strong></td>
                        ${totals.map(t => `<td><strong>${t}</strong></td>`).join('')}
                    </tr>
                `;
            }
        } else {
            // Fallback: just show the total if no bhinnashtakavarga
            const totals = this.ashtakavarga.sarvashtakavarga || this.ashtakavarga.total || this.ashtakavarga;
            if (totals && Array.isArray(totals)) {
                html += `
                    <tr class="total-row">
                        <td><strong>Sarvashtakavarga</strong></td>
                        ${totals.map(t => `<td><strong>${t}</strong></td>`).join('')}
                    </tr>
                `;
            } else {
                html = '<tr><td colspan="13" style="text-align: center; color: var(--moon-silver);">Calculating Ashtakavarga data structure...</td></tr>';
            }
        }

        tbody.innerHTML = html || '<tr><td colspan="13" style="text-align: center; color: var(--accent-pink);">Unable to render Ashtakavarga data</td></tr>';
    }

    renderVisualChart() {
        const container = document.getElementById('ashtakavargaChartContainer');
        if (!container) {
            console.error('Chart container not found');
            return;
        }

        // Check if data exists
        if (!this.ashtakavarga) {
            container.innerHTML = '<p style="color: var(--accent-pink); text-align: center;">Error: Ashtakavarga data not available</p>';
            return;
        }

        console.log('Full ashtakavarga object:', this.ashtakavarga);
        console.log('Sarvashtakavarga:', this.ashtakavarga.sarvashtakavarga);
        console.log('Total:', this.ashtakavarga.total);

        // Get the Sarvashtakavarga totals - this should be an array of 12 numbers
        let totals = this.ashtakavarga.sarvashtakavarga || this.ashtakavarga.total;

        if (!totals || !Array.isArray(totals)) {
            console.error('Sarvashtakavarga data is not an array:', totals);
            container.innerHTML = '<p style="color: var(--accent-pink); text-align: center;">Error: Sarvashtakavarga data format incorrect</p>';
            return;
        }

        console.log('Using totals array:', totals);
        console.log('Totals values:', totals.map((v, i) => `Sign ${i + 1}: ${v}`).join(', '));

        // Use the chart renderer to draw the Ashtavargha chart
        const renderer = new AstroChartRenderer();
        container.innerHTML = ''; // Clear container
        const chartDiv = document.createElement('div');
        chartDiv.id = 'avChartSvg';
        chartDiv.style.maxWidth = '1000px';
        chartDiv.style.margin = '0 auto';
        container.appendChild(chartDiv);

        renderer.drawAshtavarghaChart('avChartSvg', totals, this.birthChart.ascendant);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AshtavarghaController();
});
