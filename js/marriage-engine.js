/**
 * Marriage & Relationship Analysis Engine
 * Calculates Partner Details, Marriage Timing, and Success Compatibility
 */

class MarriageAnalysisEngine {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();
        this.birthChart = null;
        this.marriageData = null;
        this.userData = null;

        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.planetNames = { sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu' };
        this.planetEmoji = { sun: '☀️', moon: '🌙', mars: '♂️', mercury: '☿', jupiter: '♃', venus: '♀', saturn: '♄', rahu: '☊', ketu: '☋' };
        this.lordMap = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
    }

    async init() {
        // Load user data from localStorage
        this.userData = this.loadUserData();
        if (!this.userData) {
            this.showNoDataError();
            return false;
        }

        // Calculate birth chart
        this.birthChart = this.astrologyEngine.calculateBirthChart(this.userData);

        // Load marriage data JSON
        try {
            const res = await fetch('data/marriage-data.json');
            this.marriageData = await res.json();
        } catch (e) {
            console.error('Failed to load marriage data:', e);
            return false;
        }

        return true;
    }

    loadUserData() {
        const raw = localStorage.getItem('astropsycho_assessment');
        if (!raw) return null;

        try {
            const stored = JSON.parse(raw);
            const bd = stored.birthDetails;
            if (!bd || !bd.birthDate || !bd.birthTime) return null;

            return {
                birthDate: bd.birthDate,
                birthTime: bd.birthTime,
                birthPlace: bd.birthPlace || 'Unknown',
                latitude: parseFloat(bd.latitude) || 28.61,
                longitude: parseFloat(bd.longitude) || 77.20,
                timezone: parseFloat(bd.timezone) || 5.5,
                fullName: bd.fullName || '',
                gender: bd.gender || 'Unknown',
                answers: stored.responses || {}
            };
        } catch (e) {
            console.error('Failed to parse assessment data:', e);
            return null;
        }
    }

    showNoDataError() {
        const content = document.getElementById('marriagePageContent');
        if (content) content.style.display = 'none';
        const error = document.getElementById('noDataMessage');
        if (error) error.style.display = 'block';
    }

    getHouseNumber(planetPos, ascendant) {
        const planetSign = Math.floor(planetPos / 30);
        const ascSign = Math.floor(ascendant / 30);
        return ((planetSign - ascSign + 12) % 12) + 1;
    }

    analyzePartnerProfile() {
        const { planets, ascendant } = this.birthChart;
        const ascSign = Math.floor(ascendant / 30);
        const seventhSignIndex = (ascSign + 6) % 12;
        const seventhLord = this.lordMap[seventhSignIndex];
        const seventhLordPos = planets[seventhLord];
        const seventhLordHouse = this.getHouseNumber(seventhLordPos, ascendant);

        const signInfo = this.marriageData.seventh_house_signs[String(seventhSignIndex)];

        // Check for planets in 7th house
        const planetsIn7th = [];
        for (const [planet, pos] of Object.entries(planets)) {
            if (planet === 'velocities') continue;
            if (this.getHouseNumber(pos, ascendant) === 7) {
                planetsIn7th.push(planet);
            }
        }

        return {
            seventhSign: this.signs[seventhSignIndex],
            seventhLord: this.planetNames[seventhLord],
            seventhLordHouse,
            signInfo,
            planetsIn7th,
            partnerTraits: signInfo.partner_traits,
            appearance: signInfo.appearance_keywords
        };
    }

    calculateSuccessScore() {
        const { planets, ascendant, shadbala } = this.birthChart;
        const ascSign = Math.floor(ascendant / 30);
        const seventhSign = (ascSign + 6) % 12;
        const seventhLord = this.lordMap[seventhSign];

        let score = 50; // Starting baseline
        const factors = [];

        // 1. Seventh Lord Strength (20 pts)
        const lordShadbala = shadbala?.[seventhLord];
        const lordStrength = lordShadbala ? (lordShadbala.totalRupas / lordShadbala.requiredStrength) : 0.8;
        const lordScore = Math.round(lordStrength * 20);
        score += (lordScore - 10); // Center around 10
        factors.push({ label: '7th Lord Strength', score: lordScore, max: 20 });

        // 2. Planets in 7th House (15 pts)
        const planetsIn7th = [];
        for (const [planet, pos] of Object.entries(planets)) {
            if (planet === 'velocities') continue;
            if (this.getHouseNumber(pos, ascendant) === 7) planetsIn7th.push(planet);
        }

        let planetScore = 8;
        planetsIn7th.forEach(p => {
            if (['jupiter', 'venus', 'mercury', 'moon'].includes(p)) planetScore += 4;
            if (['mars', 'saturn', 'rahu', 'ketu', 'sun'].includes(p)) planetScore -= 3;
        });
        planetScore = Math.max(0, Math.min(15, planetScore));
        score += (planetScore - 8);
        factors.push({ label: '7th House Influences', score: planetScore, max: 15 });

        // 3. Venus/Jupiter Condition (15 pts)
        const karaka = this.userData.gender === 'Female' ? 'jupiter' : 'venus';
        const karakaPos = planets[karaka];
        const karakaSign = Math.floor(karakaPos / 30);
        let karakaScore = 10;
        if (karakaSign === seventhSign) karakaScore += 5;
        // Simplified check for dignity
        if (shadbala?.[karaka]?.isStrong) karakaScore += 3;
        karakaScore = Math.min(15, karakaScore);
        score += (karakaScore - 10);
        factors.push({ label: `Karaka (${this.planetNames[karaka]}) Strength`, score: karakaScore, max: 15 });

        // 4. Manglik Dosha Check (-10 to 0)
        const marsHouse = this.getHouseNumber(planets.mars, ascendant);
        const isManglik = [1, 4, 7, 8, 12].includes(marsHouse);
        if (isManglik) {
            score -= 10;
            factors.push({ label: 'Manglik Impact', score: -10, max: 0, note: 'Mars in challenging house' });
        } else {
            factors.push({ label: 'Manglik Impact', score: 0, max: 0, note: 'None' });
        }

        const finalScore = Math.min(100, Math.max(10, score));
        return { total: finalScore, factors };
    }

    getMarriageTiming() {
        const { planets, ascendant, dashas } = this.birthChart;
        const ascSign = Math.floor(ascendant / 30);
        const seventhLord = this.lordMap[(ascSign + 6) % 12];
        const dob = new Date(this.userData.birthDate);

        let searchStart = new Date(dob);
        searchStart.setFullYear(searchStart.getFullYear() + 18); // Start at age 18

        let searchEnd = new Date(dob);
        searchEnd.setFullYear(searchEnd.getFullYear() + 50); // End at age 50

        const timeline = [];
        const mahadashas = dashas.allDashas || dashas.mahadasha || (Array.isArray(dashas) ? dashas : []);

        const planetsIn7th = [];
        for (const [p, pos] of Object.entries(planets)) {
            if (p === 'velocities') continue;
            if (this.getHouseNumber(pos, ascendant) === 7) planetsIn7th.push(p);
        }

        // 1. Analyze Dasha Periods (MD, AD) for precision
        mahadashas.forEach(md => {
            if (md.endDate < searchStart || md.startDate > searchEnd) return;

            const mdPlanet = (md.planet || md.lord || '').toLowerCase();
            let mdScore = 0;
            if (mdPlanet === seventhLord) mdScore += 3;
            if (mdPlanet === 'venus') mdScore += 2;
            if (mdPlanet === 'jupiter') mdScore += 2;
            if (planetsIn7th.includes(mdPlanet)) mdScore += 2;

            const adData = this.astrologyEngine.calculateAntardashas(md);
            if (!adData || !adData.all) return;

            adData.all.forEach(ad => {
                if (ad.endDate < searchStart || ad.startDate > searchEnd) return;
                const adPlanet = ad.planet.toLowerCase();
                let adScore = mdScore;
                if (adPlanet === seventhLord) adScore += 4;
                if (adPlanet === 'venus') adScore += 3;
                if (adPlanet === 'jupiter') adScore += 3;
                if (planetsIn7th.includes(adPlanet)) adScore += 3;

                // Moderate or High probability -> AD goes into continuous blocks
                if (adScore >= 3) {
                    timeline.push({
                        startDate: new Date(Math.max(ad.startDate, searchStart)),
                        endDate: new Date(Math.min(ad.endDate, searchEnd)),
                        score: adScore,
                        isFavorable: true
                    });
                } else { // Handle less favourable too so there are no empty gaps
                    timeline.push({
                        startDate: new Date(Math.max(ad.startDate, searchStart)),
                        endDate: new Date(Math.min(ad.endDate, searchEnd)),
                        score: adScore,
                        isFavorable: false
                    });
                }
            });
        });

        // Consolidate continuous AD periods, and store all PDs inside their respective blocks
        timeline.sort((a, b) => a.startDate - b.startDate);
        const consolidated = [];
        let currentPeriod = null;

        for (const t of timeline) {
            if (!currentPeriod) {
                currentPeriod = {
                    startDate: t.startDate,
                    endDate: t.endDate,
                    score: t.score,
                    isFavorable: t.isFavorable,
                    subPeriods: []
                };
            }

            // Merge if adjacent (within 2 days) and same favorability
            const isAdjacent = (t.startDate - currentPeriod.endDate) <= (2 * 86400000);
            if (isAdjacent && t.isFavorable === currentPeriod.isFavorable) {
                currentPeriod.endDate = t.endDate;
                if (t.score > currentPeriod.score) currentPeriod.score = t.score;
            } else if (t.startDate > currentPeriod.endDate) {
                // Not adjacent, push current and start new
                consolidated.push(currentPeriod);
                currentPeriod = {
                    startDate: t.startDate,
                    endDate: t.endDate,
                    score: t.score,
                    isFavorable: t.isFavorable,
                    subPeriods: []
                };
            } else {
                // Overlapping or same start date, just update end date if it extends
                if (t.endDate > currentPeriod.endDate) {
                    currentPeriod.endDate = t.endDate;
                }
                if (t.score > currentPeriod.score) {
                    currentPeriod.score = t.score;
                }
            }
        }
        if (currentPeriod) consolidated.push(currentPeriod);

        // Calculate all granular PDs independently
        const allPDs = [];
        mahadashas.forEach(md => {
            if (md.endDate < searchStart || md.startDate > searchEnd) return;
            const mdPlanet = (md.planet || md.lord || '').toLowerCase();
            let mdScore = 0;
            if (mdPlanet === seventhLord) mdScore += 3;
            if (mdPlanet === 'venus') mdScore += 2;
            if (mdPlanet === 'jupiter') mdScore += 2;
            if (planetsIn7th.includes(mdPlanet)) mdScore += 2;

            const adData = this.astrologyEngine.calculateAntardashas(md);
            if (!adData || !adData.all) return;

            adData.all.forEach(ad => {
                if (ad.endDate < searchStart || ad.startDate > searchEnd) return;
                const adPlanet = ad.planet.toLowerCase();
                let adScore = mdScore;
                if (adPlanet === seventhLord) adScore += 4;
                if (adPlanet === 'venus') adScore += 3;
                if (adPlanet === 'jupiter') adScore += 3;
                if (planetsIn7th.includes(adPlanet)) adScore += 3;

                // Extract PDs across all ADs to populate the sub-periods array even for less favorable AD blocks
                const pdData = this.astrologyEngine.calculatePratyantarDashas(ad, mdPlanet);
                if (pdData && pdData.all) {
                    pdData.all.forEach(pd => {
                        if (pd.endDate < searchStart || pd.startDate > searchEnd) return;
                        const pdPlanet = pd.planet.toLowerCase();
                        let pdScore = adScore;
                        if (pdPlanet === seventhLord) pdScore += 3;
                        if (pdPlanet === 'venus' || pdPlanet === 'jupiter') pdScore += 2;
                        if (planetsIn7th.includes(pdPlanet)) pdScore += 2;

                        if (pdScore >= 5) {
                            const startAgeMs = pd.startDate - dob;
                            const endAgeMs = pd.endDate - dob;
                            allPDs.push({
                                event: `${this.planetNames[mdPlanet]} MD - ${this.planetNames[adPlanet]} AD - ${this.planetNames[pdPlanet]} PD`,
                                startDate: new Date(Math.max(pd.startDate, searchStart)),
                                endDate: new Date(Math.min(pd.endDate, searchEnd)),
                                score: pdScore,
                                startAgeMs,
                                endAgeMs
                            });
                        }
                    });
                }
            });
        });

        // Group PDs into their continuous parent blocks and sort them
        const getAgeParts = (ms) => {
            const date = new Date(ms);
            return {
                y: date.getUTCFullYear() - 1970,
                m: date.getUTCMonth(),
                d: date.getUTCDate() - 1
            };
        };

        const finalTimeline = consolidated.map(p => {
            const startAgeMs = p.startDate - dob;
            const endAgeMs = p.endDate - dob;
            const startAge = getAgeParts(startAgeMs);
            const endAge = getAgeParts(endAgeMs);
            const durationMs = p.endDate - p.startDate;
            const duration = getAgeParts(durationMs);

            // Find PDs that belong in this block
            const blockPDs = allPDs.filter(pd => pd.startDate >= p.startDate && pd.endDate <= p.endDate);
            // Sort PDs chronologically (increasing age)
            blockPDs.sort((a, b) => a.startDate - b.startDate);

            // Format PDs
            const formattedPDs = blockPDs.map(pd => {
                const pdStartAge = getAgeParts(pd.startAgeMs);
                const pdEndAge = getAgeParts(pd.endAgeMs);
                const pdDur = getAgeParts(pd.endDate - pd.startDate);
                return {
                    event: pd.event,
                    startDate: pd.startDate,
                    endDate: pd.endDate,
                    startAgeStr: `${pdStartAge.y}y ${pdStartAge.m}m ${pdStartAge.d}d`,
                    endAgeStr: `${pdEndAge.y}y ${pdEndAge.m}m ${pdEndAge.d}d`,
                    durationStr: `${pdDur.y}y, ${pdDur.m}m, ${pdDur.d}d`,
                    score: pd.score
                };
            });

            return {
                startDate: p.startDate,
                endDate: p.endDate,
                startAgeStr: `${startAge.y}y ${startAge.m}m ${startAge.d}d`,
                endAgeStr: `${endAge.y}y ${endAge.m}m ${endAge.d}d`,
                durationStr: `${duration.y}y, ${duration.m}m, ${duration.d}d`,
                score: p.score,
                subPeriods: formattedPDs
            };
        });

        // Find the block with the most favorable sub-periods to compute relative rankings
        let maxCount = 0;
        finalTimeline.forEach(t => {
            if (t.subPeriods.length > maxCount) maxCount = t.subPeriods.length;
        });

        // Use a baseline effective max so we don't overrate periods with just 1 or 2 PDs
        const effectiveMax = Math.max(maxCount, 5);

        // Second pass: apply comparative ratings based on the count of highly favorable specific timings
        finalTimeline.forEach(t => {
            const count = t.subPeriods.length;
            t.label = "Less favourable";
            t.colorClass = "less-favorable";
            t.textCol = "var(--moon-silver)";
            t.icon = "❓";
            t.ratingIndex = 0;

            if (count >= effectiveMax * 0.75) {
                t.label = "Best Period";
                t.colorClass = "favorable";
                t.textCol = "var(--star-gold)";
                t.icon = "🏆";
                t.ratingIndex = 3;
            } else if (count >= effectiveMax * 0.50) {
                t.label = "Better Period";
                t.colorClass = "favorable";
                t.textCol = "var(--saturn-gold)";
                t.icon = "🌟";
                t.ratingIndex = 2;
            } else if (count >= effectiveMax * 0.25) {
                t.label = "Good Period";
                t.colorClass = "favorable";
                t.textCol = "var(--accent-pink)";
                t.icon = "💖";
                t.ratingIndex = 1;
            }
        });

        // Sort blocks chronologically (increasing age)
        finalTimeline.sort((a, b) => a.startDate - b.startDate);

        return finalTimeline;
    }

    renderAll() {
        const profile = this.analyzePartnerProfile();
        const score = this.calculateSuccessScore();
        const timing = this.getMarriageTiming();

        this.renderPartnerCard(profile);
        this.renderSuccessMeter(score);
        this.renderTimingTimeline(timing);
        this.renderRemedies(profile, score);
    }

    renderPartnerCard(profile) {
        const el = document.getElementById('partnerProfile');
        if (!el) return;

        let planetsHtml = profile.planetsIn7th.length > 0
            ? profile.planetsIn7th.map(p => `<span class="badge">${this.planetEmoji[p]} ${this.planetNames[p]}</span>`).join(' ')
            : 'None';

        el.innerHTML = `
            <div class="profile-grid">
                <div class="profile-main">
                    <h3>${profile.seventhSign} (7th House)</h3>
                    <p class="lord-info">Lord: <strong>${profile.seventhLord}</strong> in House ${profile.seventhLordHouse}</p>
                    <div class="traits-box">
                        <p><strong>Partner Nature:</strong> ${profile.partnerTraits}</p>
                        <p><strong>Physical/Appearance:</strong> ${profile.appearance}</p>
                    </div>
                </div>
                <div class="planets-in-house">
                    <h4>Planets in 7th House</h4>
                    <div class="badge-container">${planetsHtml}</div>
                </div>
            </div>
        `;
    }

    renderSuccessMeter(score) {
        const el = document.getElementById('marriageSuccessScore');
        if (!el) return;

        const color = score.total >= 70 ? 'var(--accent-green)' : (score.total >= 40 ? 'var(--saturn-gold)' : 'var(--accent-red)');

        el.innerHTML = `
            <div class="score-container">
                <div class="gauge-wrap">
                    <div class="score-circle" style="border-color: ${color}">
                        <span class="score-value">${score.total}%</span>
                    </div>
                    <p class="score-label">Harmony Strength</p>
                </div>
                <div class="score-factors">
                    ${score.factors.map(f => `
                        <div class="factor-row">
                            <span>${f.label}</span>
                            <div class="bar-outer"><div class="bar-inner" style="width: ${(f.score / f.max) * 100}%"></div></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderTimingTimeline(timing) {
        const el = document.getElementById('marriageTiming');
        if (!el) return;

        if (timing.length === 0) {
            el.innerHTML = '<p>No significant upcoming windows identified in current Mahadasha cycle. Focus on Antardasha analysis for finer details.</p>';
            return;
        }

        const formatDt = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        el.innerHTML = `
            <div style="margin-bottom: 2rem; background: rgba(244, 196, 48, 0.05); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--star-gold);">
                <p style="margin:0; font-size: 1.05rem; line-height: 1.6;">Considering the seventh lord, planets in the seventh house, Venus, and Jupiter across Dasha/Antardasha periods, the following continuous insights can be drawn regarding marriage.</p>
                <div style="color: var(--accent-orange); font-weight: 600; margin-top: 1rem;">Analysis for age 18 to age 50.</div>
            </div>
            
            <div class="timeline-container">
        ` + timing.map((t, index) => {
            const blockId = `sub-periods-${index}`;

            let subPeriodsHtml = '';
            if (t.subPeriods && t.subPeriods.length > 0) {
                // If there are many, show that we are listing the top X
                const displayLimit = Math.min(15, t.subPeriods.length);
                const subPeriodsToDisplay = t.subPeriods.slice(0, displayLimit);

                subPeriodsHtml = `
                    <button onclick="document.getElementById('${blockId}').style.display = document.getElementById('${blockId}').style.display === 'none' ? 'block' : 'none';" style="background: rgba(255,107,157,0.1); border: 1px solid rgba(255,107,157,0.3); color: var(--accent-pink); margin-top: 1rem; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; transition: all 0.3s ease;">
                        View ${subPeriodsToDisplay.length} Specific Timings ▾
                    </button>
                    <div id="${blockId}" style="display: none; margin-top: 1rem; padding-left: 1rem; border-left: 2px solid rgba(255,255,255,0.05); max-height: 400px; overflow-y: auto;">
                        ${subPeriodsToDisplay.map(pd => `
                            <div style="margin-bottom: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <span style="color: var(--star-gold); font-weight: 600;">🌟 ${pd.event}</span>
                                    <span style="font-size: 0.9em; opacity: 0.8;">Score: ${pd.score}</span>
                                </div>
                                <div style="margin-top: 0.5rem; font-size: 0.95em;">Age ${pd.startAgeStr} to ${pd.endAgeStr}</div>
                                <div style="color: var(--moon-silver); font-size: 0.85em; opacity: 0.8; margin-top: 0.2rem;">${formatDt(pd.startDate)} to ${formatDt(pd.endDate)} (Duration: ${pd.durationStr})</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            return `
            <div class="timeline-item" style="display: grid; grid-template-columns: 50px 1fr auto; gap: 1rem; align-items: start; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 2rem; filter: drop-shadow(0 0 5px rgba(255,107,157,0.3));">${t.icon}</div>
                <div>
                    <div style="color: ${t.textCol}; font-weight: 600; font-size: 1.1rem; margin-bottom: 0.3rem;">${t.label}</div>
                    <div style="font-weight: 600; font-size: 1.05rem;">from age ${t.startAgeStr} to ${t.endAgeStr}</div>
                    <div style="color: var(--moon-silver); font-size: 0.9rem; opacity: 0.8; margin-top: 0.2rem;">duration: ${t.durationStr}</div>
                    ${t.ratingIndex > 0 ? `<div style="height: 4px; background: ${t.textCol}; width: ${Math.min(200, t.subPeriods.length * 8)}px; margin-top: 0.5rem; border-radius: 2px;"></div>` : `<div style="height: 4px; background: rgba(255,255,255,0.2); width: 50px; margin-top: 0.5rem; border-radius: 2px;"></div>`}
                    ${subPeriodsHtml}
                </div>
                <div style="text-align: right; color: var(--moon-silver); font-size: 0.95rem;">
                    <div>${formatDt(t.startDate)} to</div>
                    <div>${formatDt(t.endDate)}</div>
                </div>
            </div>`;
        }).join('') + `
            <div style="margin-top: 3rem; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                <h4 style="color: var(--star-gold); margin-bottom: 1rem; font-size: 1.1rem; filter: drop-shadow(0 0 5px rgba(244,196,48,0.2));">Astrological Methodology & Calculation Parameters</h4>
                <ul style="color: var(--moon-silver); font-size: 0.95rem; line-height: 1.6; padding-left: 1.2rem; margin: 0;">
                    <li style="margin-bottom: 0.5rem;"><strong>Dasha System:</strong> Vimshottari Dasha is used as the primary time-keeping system to identify the activation of planetary periods. The analysis dynamically evaluates Mahadasha, Antardasha, and precise Pratyantar Dasha windows.</li>
                    <li style="margin-bottom: 0.5rem;"><strong>Planetary Analysis:</strong> A hierarchical scoring model calculates favorability by evaluating the 7th Lord (the primary planet of marriage), planets placed within the 7th house, and the natural significators of marriage (Venus and Jupiter).</li>
                    <li style="margin-bottom: 0.5rem;"><strong>Dynamic Scoring & Categorization:</strong> Each continuous timeline block identifies and ranks the strongest Pratyantar Dasha sub-periods. The block's overall favorability (Good, Better, Best) is derived from the calculated average astrological strength of its peak micro-periods.</li>
                    <li><strong>Continuous Timeline:</strong> Raw predictions are algorithmically merged into seamless, uninterrupted age blocks (Age 18 to 50), offering a predictable roadmap while preserving precise month-by-month granular windows internally.</li>
                </ul>
            </div>
        </div>`;
    }

    renderRemedies(profile, score) {
        const container = document.getElementById('marriageRemedies');
        if (!container) return;

        let remedies = [];
        if (score.total < 60) {
            remedies.push("Worship Goddess Lakshmi and Lord Vishnu together on Fridays for relationship harmony.");
            remedies.push("Wear a high-quality Sphatik (Crystal) mala to stabilize emotions.");
        }
        if (profile.planetsIn7th.includes('mars')) {
            remedies.push("Perform Mangal Shanti or keep a fast on Tuesdays to reduce arguments.");
        }
        if (profile.planetsIn7th.includes('saturn')) {
            remedies.push("Serve elderly people and avoid being overly critical of your partner.");
        }

        if (remedies.length === 0) {
            remedies.push("General Remedy: Offer white flowers at a Shiva-Parvati temple on Mondays.");
        }

        container.innerHTML = `<ul>${remedies.map(r => `<li>${r}</li>`).join('')}</ul>`;
    }
}
