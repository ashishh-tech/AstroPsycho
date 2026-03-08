/**
 * Shadbala Engine — Ultra-Detailed Six-Fold Planetary Strength Analysis
 * Renders all sections of shadbala.html
 */
class ShadbalaEngine {
    constructor() {
        this.PLANET_EMOJIS = {
            sun: '☀️', moon: '🌙', mars: '♂️', mercury: '☿',
            jupiter: '♃', venus: '♀️', saturn: '♄'
        };
        this.PLANET_COLORS = {
            sun: '#f59e0b',
            moon: '#c0c8d8',
            mars: '#ef4444',
            mercury: '#22d3ee',
            jupiter: '#a78bfa',
            venus: '#f472b6',
            saturn: '#64748b'
        };
        this.SIGN_NAMES = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ];
        this.SIGN_LORDS = [
            'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
            'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'
        ];
        this.DIG_BEST_HOUSE = {
            sun: 10, moon: 4, mars: 10, mercury: 1,
            jupiter: 1, venus: 4, saturn: 7
        };
        this.NAISARGIKA = {
            sun: 60, moon: 51.43, venus: 42.86, jupiter: 34.29,
            mercury: 25.71, mars: 17.14, saturn: 8.57
        };
        this.REQUIRED_STRENGTH = {
            sun: 5.0, moon: 6.0, mars: 5.0, mercury: 7.0,
            jupiter: 6.5, venus: 5.5, saturn: 5.0
        };
        this.PLANET_PSYCH = {
            sun: { strong: 'Strong Solar energy: confident leadership, clear sense of self, vitality, and authority.', weak: 'Weak Sun: self-doubt, low confidence, dependence on others for validation, health concerns.' },
            moon: { strong: 'Strong Lunar force: emotional intelligence, intuition, nurturing warmth, stable mental health.', weak: 'Weak Moon: anxiety, mood swings, emotional insecurity, tendency toward depression or over-sensitivity.' },
            mars: { strong: 'Powerful Mars: dynamic drive, courage, athletic energy, direct communication, ambition.', weak: 'Weak Mars: lack of initiative, procrastination, suppressed anger, low physical stamina.' },
            mercury: { strong: 'Mercury excellence: sharp analytical mind, eloquence, quick learning, adaptability, business acumen.', weak: 'Weak Mercury: indecision, communication difficulties, scattered thinking, nervousness.' },
            jupiter: { strong: "Jupiter's grace: wisdom, optimism, philosophical depth, abundance mindset, spiritual inclination.", weak: 'Weak Jupiter: poor judgment, over- optimism, financial carelessness, lack of life purpose.' },
            venus: { strong: 'Venus power: artistic talent, charm, romantic grace, sensory enjoyment, refined aesthetics.', weak: 'Weak Venus: difficulty in relationships, low self-worth, creative blocks, material dissatisfaction.' },
            saturn: { strong: 'Saturn strength: discipline, perseverance, long-term planning, responsibility, endurance.', weak: 'Weak Saturn: fear, chronic delays, inability to sustain efforts, lessons unlearned from hardship.' }
        };
    }

    capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    getHouseNumber(planetLon, ascLon) {
        const pSign = Math.floor(planetLon / 30);
        const aSign = Math.floor(ascLon / 30);
        return (pSign - aSign + 12) % 12 + 1;
    }

    isExaltedSign(planet, pos) {
        const EXALT_SIGNS = { sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6 };
        return Math.floor(pos / 30) === EXALT_SIGNS[planet];
    }

    isOwnSign(planet, pos) {
        const OWN = {
            sun: [4], moon: [3], mars: [0, 7], mercury: [2, 5],
            jupiter: [8, 11], venus: [1, 6], saturn: [9, 10]
        };
        return (OWN[planet] || []).includes(Math.floor(pos / 30));
    }

    /** Build sub-component breakdown for each bala */
    getSthanaBalaBreakdown(planet, pos, ascLon) {
        const signIndex = Math.floor(pos / 30);
        const degreeInSign = pos % 30;
        const house = this.getHouseNumber(pos, ascLon);
        const isMale = ['sun', 'mars', 'jupiter'].includes(planet);
        const isOddSign = signIndex % 2 === 0;

        // Uchcha
        const EXALT_DEG = { sun: 10, moon: 33, mars: 298, mercury: 165, jupiter: 95, venus: 357, saturn: 200 };
        let distFromExalt = Math.abs(pos - (EXALT_DEG[planet] || 0));
        if (distFromExalt > 180) distFromExalt = 360 - distFromExalt;
        const uchhaBala = Math.round(60 * (1 - distFromExalt / 180) * 10) / 10;

        // Saptavargaja (simplified)
        let saptaBala = 30;
        if (this.isExaltedSign(planet, pos)) saptaBala += 20;
        if (this.isOwnSign(planet, pos)) saptaBala += 15;
        saptaBala = Math.round(saptaBala * 10) / 10;

        // Ojha
        const ojhaBala = ((isMale && isOddSign) || (!isMale && !isOddSign)) ? 30 : 15;

        // Kendra
        let kendraBala = 15;
        if ([1, 4, 7, 10].includes(house)) kendraBala = 60;
        else if ([2, 5, 8, 11].includes(house)) kendraBala = 30;

        // Drekkana
        const drekkana = Math.floor(degreeInSign / 10);
        const drekkanaBala = ((isMale && drekkana === 0) || (!isMale && drekkana === 2)) ? 30 : 15;

        return [
            { label: 'Uchcha Bala', value: uchhaBala, max: 60, tip: 'Exaltation strength — how close planet is to its exaltation point' },
            { label: 'Saptavargaja', value: saptaBala, max: 65, tip: 'Divisional chart dignity (own sign / exalted bonus)' },
            { label: 'Ojhayugma', value: ojhaBala, max: 30, tip: 'Odd/Even sign gender affinity' },
            { label: 'Kendra Bala', value: kendraBala, max: 60, tip: 'Angular house (1,4,7,10=60; 2,5,8,11=30; cadent=15)' },
            { label: 'Drekkana', value: drekkanaBala, max: 30, tip: 'Decanate (first/last 10° gender match)' }
        ];
    }

    getDigBalaBreakdown(planet, pos, ascLon) {
        const house = this.getHouseNumber(pos, ascLon);
        const best = this.DIG_BEST_HOUSE[planet] || 1;
        let dist = Math.abs(house - best);
        if (dist > 6) dist = 12 - dist;
        const total = Math.round(60 * (1 - dist / 6) * 10) / 10;
        const BEST_LABELS = { 1: '1st (East/Ascendant)', 4: '4th (North/IC)', 7: '7th (West/Descendant)', 10: '10th (South/MC)' };
        return [
            {
                label: 'Directional Power', value: total, max: 60,
                tip: `Best direction: House ${best} (${BEST_LABELS[best] || 'House ' + best}). Currently in House ${house}.`
            }
        ];
    }

    getKalaBalaBreakdown(planet, birthDate) {
        const hour = birthDate.getHours();
        const isDay = hour >= 6 && hour < 18;
        const weekday = birthDate.getDay();
        const weekLords = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
        const isDiurnal = ['sun', 'jupiter', 'venus'].includes(planet);
        const isNocturnal = ['moon', 'mars', 'saturn'].includes(planet);

        const natho = (isDiurnal && isDay) || (isNocturnal && !isDay) || planet === 'mercury' ? 30 : 0;
        const vara = weekLords[weekday] === planet ? 15 : 0;
        const tribhaga = 20; // simplified
        const abda = 15; // simplified
        const masa = 15; // simplified
        const paksha = planet === 'moon' ? 30 : 0; // approximate

        return [
            { label: 'Nathonnatha (Day/Night)', value: natho, max: 30, tip: `${isDiurnal ? 'Diurnal' : 'Nocturnal'} planet — birth was ${isDay ? 'daytime' : 'nighttime'}` },
            { label: 'Paksha Bala', value: paksha, max: 30, tip: 'Lunar fortnight — Moon gains strength when waxing' },
            { label: 'Tribhaga Bala', value: tribhaga, max: 30, tip: 'Part-of-day planetary rulership (simplified)' },
            { label: 'Abda Bala (Yearly)', value: abda, max: 15, tip: 'Annual lord ruling the birth year (simplified)' },
            { label: 'Masa Bala (Monthly)', value: masa, max: 15, tip: 'Monthly lord ruling the birth month (simplified)' },
            { label: 'Vara Bala (Weekday)', value: vara, max: 15, tip: `Birth weekday lord: ${this.capitalize(weekLords[weekday])}` }
        ];
    }

    getCheshtaBalaBreakdown(planet, velocity) {
        if (['sun', 'moon'].includes(planet)) {
            return [{ label: 'N/A (Luminaries)', value: 0, max: 60, tip: 'Sun and Moon do not have Cheshta Bala; they are always direct.' }];
        }
        let total = 0;
        let label = '';
        if (velocity < 0) {
            total = 60; label = 'Retrograde (Vakra) — maximum motional strength';
        } else {
            const avg = { mars: 0.5, mercury: 1.5, jupiter: 0.1, venus: 1.2, saturn: 0.08 };
            const ratio = Math.min(velocity / (avg[planet] || 0.5), 2);
            total = Math.round(30 * ratio * 10) / 10;
            label = velocity < avg[planet] * 0.5 ? 'Slow (Manda) — below average speed' : 'Direct (Vikala) — normal motion';
        }
        return [
            { label, value: total, max: 60, tip: 'Motional strength based on planetary speed/retrograde status.' }
        ];
    }

    getNaisargikaBalaBreakdown(planet) {
        return [
            {
                label: 'Natural Permanent Strength', value: this.NAISARGIKA[planet] || 0, max: 60,
                tip: 'Fixed hierarchy: Sun(60) > Moon(51) > Venus(43) > Jupiter(34) > Mercury(26) > Mars(17) > Saturn(9)'
            }
        ];
    }

    getDrikBalaBreakdown(planet, planets) {
        const pos = planets[planet];
        let details = [];
        for (const [other, otherPos] of Object.entries(planets)) {
            if (other === planet || other === 'velocities' || other === 'rahu' || other === 'ketu') continue;
            let diff = Math.abs(pos - otherPos);
            if (diff > 180) diff = 360 - diff;
            const isBenefic = ['jupiter', 'venus', 'mercury'].includes(other);
            const isMalefic = ['mars', 'saturn', 'sun'].includes(other);
            let pts = 0, aspect = '';
            if (Math.abs(diff - 180) < 5) { pts = isBenefic ? 10 : -10; aspect = 'Opposition (180°)'; }
            else if (Math.abs(diff - 120) < 5) { pts = isBenefic ? 15 : 0; aspect = 'Trine (120°)'; }
            else if (Math.abs(diff - 90) < 5) { pts = isMalefic ? -10 : 0; aspect = 'Square (90°)'; }
            else if (Math.abs(diff - 60) < 5) { pts = isBenefic ? 10 : 0; aspect = 'Sextile (60°)'; }
            else if (diff < 10) { pts = isBenefic ? 15 : -15; aspect = 'Conjunction (0°)'; }
            if (aspect) details.push({ label: `${this.capitalize(other)} — ${aspect}`, value: pts, max: 15, tip: isBenefic ? 'Benefic aspect' : (isMalefic ? 'Malefic aspect' : 'Neutral aspect') });
        }
        // Normalise raw to 0–60 (same formula as engine)
        const raw = details.reduce((s, d) => s + d.value, 0);
        const norm = Math.max(-30, Math.min(60, raw + 30));
        const normAdj = norm - 30; // show individual raw values
        return details.length ? details : [{ label: 'No major aspects', value: 30, max: 60, tip: 'No close aspects found — neutral base value.' }];
    }

    /** Main render entry point */
    render(report) {
        const { shadbala, planets, ascendant, planetaryDetails } = report.birthChart;

        let birthDate;
        if (report.birthData.datetime) {
            birthDate = new Date(report.birthData.datetime);
        } else if (report.birthData.birthDate) {
            birthDate = new Date(report.birthData.birthDate + 'T' + (report.birthData.birthTime || '12:00'));
        } else {
            birthDate = new Date(report.birthData.date + 'T' + (report.birthData.time || '12:00'));
        }

        // Object.entries(shadbala) might include non-planet properties potentially, but let's be safe
        const validPlanets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
        const sorted = Object.entries(shadbala)
            .filter(([p, _]) => validPlanets.includes(p))
            .sort((a, b) => b[1].totalRupas - a[1].totalRupas);

        this.renderHero(sorted[0], sorted);
        this.renderSummaryBars(sorted);
        this.renderMainTable(sorted);
        this.renderPlanetCards(sorted, planets, ascendant, birthDate);
        this.renderRanking(sorted);
    }

    renderHero([leadPlanet, leadData], sorted) {
        const el = document.getElementById('sb-hero');
        if (!el) return;
        const color = this.PLANET_COLORS[leadPlanet];
        const pct = Math.round((leadData.totalRupas / leadData.requiredStrength) * 100);
        const psych = this.PLANET_PSYCH[leadPlanet];

        el.innerHTML = `
            <div class="sb-hero-inner" style="border-color:${color}; background: radial-gradient(ellipse at 30% 50%, ${color}18, transparent 70%);">
                <div class="sb-hero-left">
                    <div class="sb-hero-emoji">${this.PLANET_EMOJIS[leadPlanet]}</div>
                    <div>
                        <div class="sb-hero-label">Strength Leader</div>
                        <div class="sb-hero-planet" style="color:${color}">${this.capitalize(leadPlanet)}</div>
                        <div class="sb-hero-stats">
                            <span class="sb-badge" style="background:${color}22; border-color:${color}; color:${color}">${leadData.strengthCategory}</span>
                            <span class="sb-hero-rupa">${leadData.totalRupas} Rupas</span>
                            <span class="sb-hero-req">(required: ${leadData.requiredStrength})</span>
                        </div>
                    </div>
                </div>
                <div class="sb-hero-right">
                    <div class="sb-hero-pct-label">Strength %</div>
                    <div class="sb-hero-pct" style="color:${color}">${pct}%</div>
                    <p class="sb-hero-psych">${leadData.isStrong ? psych.strong : psych.weak}</p>
                </div>
            </div>
        `;
    }

    renderSummaryBars(sorted) {
        const el = document.getElementById('sb-bars');
        if (!el) return;
        const maxRupas = Math.max(...sorted.map(([, d]) => d.totalRupas), 1);

        el.innerHTML = sorted.map(([planet, data]) => {
            const color = this.PLANET_COLORS[planet];
            const pct = Math.round((data.totalRupas / maxRupas) * 100);
            const req = Math.round((data.requiredStrength / maxRupas) * 100);
            const isStrong = data.isStrong;
            return `
                <div class="sb-bar-row">
                    <div class="sb-bar-label">
                        <span class="sb-bar-emoji">${this.PLANET_EMOJIS[planet]}</span>
                        <span class="sb-bar-name">${this.capitalize(planet)}</span>
                    </div>
                    <div class="sb-bar-track">
                        <div class="sb-bar-fill" style="width:${pct}%; background: linear-gradient(90deg, ${color}99, ${color});"></div>
                        <div class="sb-bar-req-line" style="left:${req}%;" title="Required: ${data.requiredStrength} Rupas"></div>
                    </div>
                    <div class="sb-bar-value" style="color:${color}">${data.totalRupas}</div>
                    <div class="sb-bar-badge ${isStrong ? 'strong' : 'weak'}">${isStrong ? '✓' : '✗'}</div>
                </div>
            `;
        }).join('');
    }

    renderMainTable(sorted) {
        const tbody = document.getElementById('sb-table-body');
        if (!tbody) return;

        tbody.innerHTML = sorted.map(([planet, d], i) => {
            const color = this.PLANET_COLORS[planet];
            const catClass = (d.strengthCategory || 'low').toLowerCase().replace(/\s+/g, '-');
            const pct = Math.round((d.totalRupas / d.requiredStrength) * 100);
            return `
                <tr class="${i === 0 ? 'sb-leader' : ''}">
                    <td>
                        <a href="#card-${planet}" class="sb-table-planet-link" style="color:${color}; text-decoration:none;">
                            ${this.PLANET_EMOJIS[planet]} <strong>${this.capitalize(planet)}</strong>
                        </a>
                    </td>
                    <td>${d.sthanabala}</td>
                    <td>${d.digbala}</td>
                    <td>${d.kalabala}</td>
                    <td>${d.cheshtabala}</td>
                    <td>${d.naisargikabala}</td>
                    <td>${d.drikbala}</td>
                    <td style="font-weight:700; color:${color}">${d.totalRupas}</td>
                    <td>${d.requiredStrength}</td>
                    <td>${pct}%</td>
                    <td><span class="sb-cat sb-cat-${catClass}">${d.strengthCategory}</span></td>
                </tr>
            `;
        }).join('');
    }

    renderPlanetCards(sorted, planets, ascendant, birthDate) {
        const container = document.getElementById('sb-cards');
        if (!container) return;

        container.innerHTML = sorted.map(([planet, data]) => {
            const color = this.PLANET_COLORS[planet];
            const psych = this.PLANET_PSYCH[planet];
            const pos = planets[planet];
            const signIdx = Math.floor(pos / 30);
            const deg = (pos % 30).toFixed(1);
            const house = this.getHouseNumber(pos, ascendant);
            const vel = planets.velocities?.[planet] ?? null;
            const isRetro = vel !== null && vel < 0;

            const balas = [
                { key: 'sthanabala', name: 'Sthana Bala', icon: '🧭', color: '#f59e0b', subs: this.getSthanaBalaBreakdown(planet, pos, ascendant) },
                { key: 'digbala', name: 'Dig Bala', icon: '🧲', color: '#22d3ee', subs: this.getDigBalaBreakdown(planet, pos, ascendant) },
                { key: 'kalabala', name: 'Kala Bala', icon: '⏳', color: '#a78bfa', subs: this.getKalaBalaBreakdown(planet, birthDate) },
                { key: 'cheshtabala', name: 'Cheshta Bala', icon: '💨', color: '#ef4444', subs: this.getCheshtaBalaBreakdown(planet, vel ?? 0) },
                { key: 'naisargikabala', name: 'Naisargika', icon: '⭐', color: '#f472b6', subs: this.getNaisargikaBalaBreakdown(planet) },
                { key: 'drikbala', name: 'Drik Bala', icon: '👁️', color: '#64748b', subs: this.getDrikBalaBreakdown(planet, planets) }
            ];

            const balaHTML = balas.map(b => {
                const val = data[b.key] || 0;
                const subsHTML = b.subs.map(s => {
                    const pct = Math.max(0, Math.min(100, Math.round((Math.abs(s.value) / Math.max(s.max, 1)) * 100)));
                    const isNeg = s.value < 0;
                    return `
                        <div class="sb-sub">
                            <div class="sb-sub-header">
                                <span class="sb-sub-label" title="${s.tip}">${s.label}</span>
                                <span class="sb-sub-val ${isNeg ? 'neg' : ''}">${isNeg ? '' : '+'}${s.value}</span>
                            </div>
                            <div class="sb-sub-bar-track">
                                <div class="sb-sub-bar-fill ${isNeg ? 'neg' : ''}" style="width:${pct}%; background:${isNeg ? '#ef4444' : b.color}44; border-right:2px solid ${isNeg ? '#ef4444' : b.color};"></div>
                            </div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="sb-bala-block">
                        <div class="sb-bala-header">
                            <span>${b.icon} ${b.name}</span>
                            <span class="sb-bala-total" style="color:${b.color}">${val} virupas</span>
                        </div>
                        <div class="sb-sub-list">${subsHTML}</div>
                    </div>
                `;
            }).join('');

            const pct = Math.round((data.totalRupas / data.requiredStrength) * 100);
            const catClass = (data.strengthCategory || 'low').toLowerCase().replace(/\s+/g, '-');

            return `
                <div class="sb-card" id="card-${planet}" style="border-color:${color}40; --planet-color:${color}">
                    <div class="sb-card-header" style="border-bottom:1px solid ${color}30; background: linear-gradient(135deg, ${color}12, ${color}05)">
                        <div class="sb-card-title">
                            <span class="sb-card-emoji">${this.PLANET_EMOJIS[planet]}</span>
                            <div>
                                <h3 style="color:${color}; margin:0">${this.capitalize(planet)}</h3>
                                <div class="sb-card-meta">
                                    ${this.SIGN_NAMES[signIdx]} · ${deg}° · House ${house}
                                    ${isRetro ? '<span class="sb-retro-badge">℞ Retrograde</span>' : ''}
                                </div>
                            </div>
                        </div>
                        <div class="sb-card-totals">
                            <div class="sb-card-rupas" style="color:${color}">${data.totalRupas} <span>Rupas</span></div>
                            <div class="sb-card-pct">${pct}% of required</div>
                            <span class="sb-cat sb-cat-${catClass}">${data.strengthCategory}</span>
                        </div>
                    </div>
                    <div class="sb-card-body">
                        <div class="sb-bala-grid">${balaHTML}</div>
                        <div class="sb-card-psych">
                            <div class="sb-psych-icon">${data.isStrong ? '💚' : '🔸'}</div>
                            <p>${data.isStrong ? psych.strong : psych.weak}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderRanking(sorted) {
        const el = document.getElementById('sb-ranking');
        if (!el) return;

        el.innerHTML = sorted.map(([planet, data], i) => {
            const color = this.PLANET_COLORS[planet];
            const pct = Math.round((data.totalRupas / data.requiredStrength) * 100);
            const catClass = (data.strengthCategory || 'low').toLowerCase().replace(/\s+/g, '-');
            const medals = ['🥇', '🥈', '🥉'];
            return `
                <div class="sb-rank-row">
                    <div class="sb-rank-num">${medals[i] || '#' + (i + 1)}</div>
                    <div class="sb-rank-planet">
                        ${this.PLANET_EMOJIS[planet]}
                        <span style="color:${color}">${this.capitalize(planet)}</span>
                    </div>
                    <div class="sb-rank-bar-wrap">
                        <div class="sb-rank-bar" style="width:${Math.min(pct, 200) / 2}%; background:${color}66;"></div>
                    </div>
                    <div class="sb-rank-pct" style="color:${color}">${pct}%</div>
                    <div class="sb-rank-rupa">${data.totalRupas} R</div>
                    <span class="sb-cat sb-cat-${catClass}">${data.strengthCategory}</span>
                </div>
            `;
        }).join('');
    }
}

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
    // Note: Other pages use 'astropsycho_assessment', which stores { birthDetails, ... }
    const raw = localStorage.getItem('astropsycho_assessment');
    if (!raw) {
        document.getElementById('sb-error').style.display = 'block';
        document.getElementById('sb-main').style.display = 'none';
        return;
    }

    let userData;
    try {
        userData = JSON.parse(raw).birthDetails;
    } catch (e) {
        console.error("Failed to parse birth data", e);
        document.getElementById('sb-error').style.display = 'block';
        document.getElementById('sb-main').style.display = 'none';
        return;
    }

    const engine = new VedicAstrologyEngine();

    // Calculate the full chart including shadbala
    const birthChart = engine.calculateBirthChart(userData);

    if (!birthChart || !birthChart.shadbala) {
        document.getElementById('sb-error').style.display = 'block';
        document.getElementById('sb-main').style.display = 'none';
        return;
    }

    // Pass the structure expected by ShadbalaEngine's render method
    const reportParams = {
        birthData: userData,
        birthChart: birthChart
    };

    // Fill subject info
    const subjectEl = document.getElementById('sb-subject');
    if (subjectEl && userData.name) {
        subjectEl.textContent = userData.name + ' — Shadbala Analysis';
    }

    new ShadbalaEngine().render(reportParams);
});
