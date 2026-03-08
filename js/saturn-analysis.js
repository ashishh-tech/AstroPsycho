// Saturn Analysis Page Logic
// Deep analysis of Saturn (Karma/discipline) for psychology-focused astrology

class SaturnAnalysisController {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();
        this.userData = null;
        this.birthChart = null;
        this.saturnData = null;
        this.init();
    }

    async init() {
        try {
            this.userData = this.loadUserData();
            if (!this.userData || !this.userData.birthDetails) {
                this.showQuickForm();
                return;
            }
            this.birthChart = this.astrologyEngine.calculateBirthChart(this.userData.birthDetails);
            await this.loadSaturnAnalysisData();
            this.renderSaturnAnalysis();
        } catch (error) {
            console.error('Saturn Analysis Error:', error);
        }
    }

    loadUserData() {
        const data = localStorage.getItem('astropsycho_assessment');
        return data ? JSON.parse(data) : null;
    }

    async loadSaturnAnalysisData() {
        try {
            const response = await fetch('data/saturn-analysis-data.json');
            this.saturnData = await response.json();
        } catch (error) {
            console.error('Error loading Saturn data:', error);
            this.saturnData = {};
        }
    }

    showQuickForm() {
        const content = document.getElementById('saturnAnalysisContent');
        if (content) {
            content.innerHTML = `
                <div class="info-box" style="border-color: var(--accent-orange); margin-top: 2rem;">
                    <h3 style="color: var(--accent-orange);">🪐 Saturn Accuracy Tester</h3>
                    <p>Enter birth details to verify Saturn's position and analyze its psychological impact.</p>
                    <form id="quickBirthForm" style="max-width: 600px; margin-top: 1rem;">
                        <div class="form-group"><label>Full Name</label><input type="text" id="quickName" required></div>
                        <div class="form-group"><label>Date of Birth</label><input type="date" id="quickDate" required></div>
                        <div class="form-group"><label>Time of Birth</label><input type="time" id="quickTime" required></div>
                        <div class="form-group"><label>Place of Birth</label><input type="text" id="quickPlace" required></div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group"><label>Lat</label><input type="number" id="quickLat" step="0.0001" value="28.61"></div>
                            <div class="form-group"><label>Lon</label><input type="number" id="quickLon" step="0.0001" value="77.20"></div>
                        </div>
                        <button type="submit" class="btn btn-primary">Start Saturn Analysis 🪐</button>
                    </form>
                </div>`;
            document.getElementById('quickBirthForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.processQuickBirthDetails();
            });
        }
    }

    processQuickBirthDetails() {
        const birthDetails = {
            fullName: document.getElementById('quickName').value,
            birthDate: document.getElementById('quickDate').value,
            birthTime: document.getElementById('quickTime').value,
            birthPlace: document.getElementById('quickPlace').value,
            latitude: parseFloat(document.getElementById('quickLat').value),
            longitude: parseFloat(document.getElementById('quickLon').value),
            timezone: 5.5,
            gender: 'not-specified'
        };
        this.userData = { birthDetails };
        this.birthChart = this.astrologyEngine.calculateBirthChart(birthDetails);
        this.loadSaturnAnalysisData().then(() => this.renderSaturnAnalysis());
    }

    renderSaturnAnalysis() {
        const container = document.getElementById('saturnAnalysisContent');
        if (!container) return;

        const saturnPos = this.birthChart.planetaryDetails.saturn;
        const sadeSatiInfo = this.checkSadeSati();

        container.innerHTML = `
            <div class="remedy-card" style="border-left-color: var(--accent-orange);">
                <h2 style="color: var(--star-gold);">Saturn (Shani) Accuracy Report</h2>
                <div style="margin-top: 1rem; color: var(--soft-white);">
                    <p><strong>Position:</strong> ${saturnPos.longitude.toFixed(4)}° (${saturnPos.sign} ${saturnPos.degree.toFixed(2)}°)</p>
                    <p><strong>House:</strong> ${saturnPos.house}</p>
                    <p><strong>Status:</strong> ${saturnPos.status} ${saturnPos.isRetrograde ? '(Retrograde)' : ''}</p>
                    <p><strong>Sade Sati Status:</strong> ${sadeSatiInfo.status}</p>
                </div>
            </div>
            
            <div id="saturnPsychology" style="margin-top: 2rem;">
                ${this.renderPsychologicalImpact(saturnPos)}
            </div>
            
            <div id="saturnRemedies" style="margin-top: 2rem;">
                ${this.renderRemedies()}
            </div>
        `;
    }

    checkSadeSati() {
        const moonSign = Math.floor(this.birthChart.planets.moon / 30);
        const transits = this.astrologyEngine.calculateTransits();
        const transitSaturnSign = Math.floor(transits.saturn / 30);

        const diff = (transitSaturnSign - moonSign + 12) % 12;
        if (diff === 11) return { status: 'Sade Sati Rising (12th from Moon)' };
        if (diff === 0) return { status: 'Sade Sati Peak (On Moon)' };
        if (diff === 1) return { status: 'Sade Sati Setting (2nd from Moon)' };

        return { status: 'No Sade Sati currently' };
    }

    renderPsychologicalImpact(pos) {
        const houseData = this.saturnData.saturn_in_houses?.[pos.house.toString()] || {};
        return `
            <div class="remedy-card" style="border-left-color: var(--accent-cyan);">
                <h3 style="color: var(--accent-cyan);">Psychological Blueprint</h3>
                <p style="margin-top: 0.5rem; color: var(--soft-white);">${houseData.psychological_impact || 'Saturn in your chart represents where you face reality and learn through discipline.'}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                    <div><h5 style="color: var(--accent-cyan);">Strengths</h5><ul style="color: var(--moon-silver);">${(houseData.mental_strengths || []).map(s => `<li>${s}</li>`).join('')}</ul></div>
                    <div><h5 style="color: var(--accent-orange);">Challenges</h5><ul style="color: var(--moon-silver);">${(houseData.mental_challenges || []).map(c => `<li>${c}</li>`).join('')}</ul></div>
                </div>
            </div>`;
    }

    renderRemedies() {
        const rem = this.saturnData.remedies || {};
        return `
            <div class="remedy-card" style="border-left-color: var(--star-gold);">
                <h3 style="color: var(--star-gold);">Recommended Remedies</h3>
                <p style="color: var(--moon-silver); margin-top: 0.5rem;"><strong>Mantra:</strong> ${rem.mantras?.basic}</p>
                <p style="color: var(--moon-silver);"><strong>Charity:</strong> ${rem.charity?.items.join(', ')} on ${rem.charity?.day}</p>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SaturnAnalysisController();
});
