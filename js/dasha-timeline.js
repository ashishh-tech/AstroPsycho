/**
 * Dasha Timeline Engine
 * Builds and renders interactive 3-level Vimshottari Dasha timelines
 * Level 1: Mahadasha (clickable header)
 * Level 2: Antardasha rows (expanded accordion)
 * Level 3: Pratyantardasha grid (per-antardasha expandable)
 */

class DashaTimelineEngine {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();
        this.userData = null;
        this.birthChart = null;

        this.planetColors = {
            sun: { bg: '#f97316', light: 'rgba(249,115,22,0.15)', text: '#fed7aa' },
            moon: { bg: '#c0c0d0', light: 'rgba(192,192,208,0.15)', text: '#e2e8f0' },
            mars: { bg: '#ef4444', light: 'rgba(239,68,68,0.15)', text: '#fca5a5' },
            mercury: { bg: '#22c55e', light: 'rgba(34,197,94,0.15)', text: '#86efac' },
            jupiter: { bg: '#eab308', light: 'rgba(234,179,8,0.15)', text: '#fde047' },
            venus: { bg: '#ec4899', light: 'rgba(236,72,153,0.15)', text: '#f9a8d4' },
            saturn: { bg: '#8b5cf6', light: 'rgba(139,92,246,0.15)', text: '#c4b5fd' },
            rahu: { bg: '#6366f1', light: 'rgba(99,102,241,0.15)', text: '#a5b4fc' },
            ketu: { bg: '#14b8a6', light: 'rgba(20,184,166,0.15)', text: '#5eead4' }
        };

        this.planetEmojis = {
            sun: '☀️', moon: '🌙', mars: '♂️', mercury: '☿️',
            jupiter: '♃', venus: '♀️', saturn: '♄', rahu: '☊', ketu: '☋'
        };

        this.psychThemes = {
            sun: { title: 'Authority & Identity', desc: 'A time of asserting self, leadership, government matters, father figures. Ego, confidence, and willpower come to the forefront.', positive: 'Recognition, authority, health, vitality', negative: 'Ego clashes, arrogance, separation from father' },
            moon: { title: 'Emotions & Mind', desc: 'Heightened emotional sensitivity, mental fluctuations. The inner world dominates. Mother, home, and nurturing become central.', positive: 'Intuition, creativity, emotional depth, public popularity', negative: 'Mood swings, anxiety, over-sensitivity, fear' },
            mars: { title: 'Energy & Action', desc: 'Drive, ambition, physical energy, and aggression surge. A time of action, conflict, and courage. Sibling matters arise.', positive: 'Courage, initiative, physical strength, victory', negative: 'Anger, aggression, accidents, conflicts' },
            mercury: { title: 'Intellect & Communication', desc: 'The mind sharpens — trade, communication, learning, analytical thinking dominate. A time for business and education.', positive: 'Intelligence, business success, skillful communication', negative: 'Overthinking, indecisiveness, deception by others' },
            jupiter: { title: 'Wisdom & Expansion', desc: 'The guru period — growth, prosperity, spiritual wisdom, and good fortune flow. Children, teachers, and higher knowledge feature.', positive: 'Prosperity, marriage, children, spiritual growth, luck', negative: 'Over-expansion, laziness, weight gain, over-optimism' },
            venus: { title: 'Love & Pleasure', desc: 'Romance, creativity, aesthetics, and sensual pleasures are highlighted. Marriage, partnerships, and artistic expression thrive.', positive: 'Love, luxury, artistic success, marital harmony', negative: 'Overindulgence, laziness, relationship complications' },
            saturn: { title: 'Karma & Discipline', desc: 'The great teacher arrives — hard work, delays, restrictions, and karmic lessons. Sade Sati-like intensity. Spiritual growth through suffering.', positive: 'Discipline, long-term success, spiritual maturity', negative: 'Depression, delays, loneliness, health issues, obstacles' },
            rahu: { title: 'Ambition & Illusion', desc: 'The shadow planet creates obsessions, unconventional paths, and sudden upheaval. Foreign travels, technology, and material ambitions rise.', positive: 'Sudden rise, innovation, material success, foreign gains', negative: 'Confusion, deception, anxiety, instability, addiction' },
            ketu: { title: 'Detachment & Spirituality', desc: 'The tail of the dragon brings loss, separation, and spiritual awakening. Past life karma surfaces. Mysticism and isolation.', positive: 'Spiritual insight, moksha path, psychic abilities', negative: 'Sudden losses, health issues, depression, aimlessness' }
        };
    }

    loadData() {
        const raw = localStorage.getItem('astropsycho_assessment');
        if (!raw) return false;
        try {
            const stored = JSON.parse(raw);
            const bd = stored.birthDetails;
            this.userData = {
                birthDate: bd.birthDate,
                birthTime: bd.birthTime,
                birthPlace: bd.birthPlace || 'Unknown',
                latitude: parseFloat(bd.latitude) || 28.61,
                longitude: parseFloat(bd.longitude) || 77.20,
                timezone: parseFloat(bd.timezone) || 5.5,
                fullName: bd.fullName || 'User'
            };
            this.birthChart = this.astrologyEngine.calculateBirthChart(this.userData);
            return true;
        } catch (e) {
            console.error('DashaTimeline load error:', e);
            return false;
        }
    }

    buildAllDashas() {
        const { dashas } = this.birthChart;
        const all = dashas.allDashas || [];
        return all.map(md => {
            const ads = this.astrologyEngine.calculateAntardashas(md);
            const antardashasWithPD = (ads.all || []).map(ad => {
                const pdResult = this.astrologyEngine.calculatePratyantarDashas(ad, md.planet);
                return { ...ad, pratyantardashas: pdResult.all || [] };
            });
            return {
                planet: md.planet,
                startDate: md.startDate,
                endDate: md.endDate,
                years: md.years,
                antardashas: antardashasWithPD
            };
        });
    }

    formatDate(d) {
        return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    }

    formatDateFull(d) {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    getYearsMonths(start, end) {
        const totalMonths = Math.round((end - start) / (30.44 * 24 * 3600 * 1000));
        const y = Math.floor(totalMonths / 12);
        const m = totalMonths % 12;
        if (y === 0) return `${m}mo`;
        if (m === 0) return `${y}yr`;
        return `${y}yr ${m}mo`;
    }

    // ─── MAIN 3-LEVEL ACCORDION TIMELINE ────────────────────────────────────────
    renderTimeline(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const allDashas = this.buildAllDashas();
        const now = new Date();
        const activeMahaIdx = allDashas.findIndex(d => now >= d.startDate && now <= d.endDate);

        let html = '';

        allDashas.forEach((md, mdIdx) => {
            const col = this.planetColors[md.planet] || this.planetColors.sun;
            const theme = this.psychThemes[md.planet];
            const isActive = mdIdx === activeMahaIdx;
            const isPast = md.endDate < now;
            const emoji = this.planetEmojis[md.planet] || '🪐';
            const dur = this.getYearsMonths(md.startDate, md.endDate);
            const opacity = isPast ? '0.55' : '1';
            const mdId = `md-${mdIdx}`;

            // Progress bar for active Mahadasha
            let progressHtml = '';
            if (isActive) {
                const pct = ((now - md.startDate) / (md.endDate - md.startDate) * 100).toFixed(1);
                progressHtml = `
                    <div style="background:rgba(0,0,0,0.3);border-radius:6px;height:6px;overflow:hidden;margin:0.5rem 0;">
                        <div style="height:100%;width:${pct}%;background:${col.bg};border-radius:6px;"></div>
                    </div>
                    <div style="font-size:0.72rem;color:${col.text};margin-bottom:0.5rem;">${pct}% of this Mahadasha elapsed</div>`;
            }

            // Build Antardasha rows (Level 2)
            let adRowsHtml = '';
            md.antardashas.forEach((ad, adIdx) => {
                const adCol = this.planetColors[ad.planet] || this.planetColors.sun;
                const adEmoji = this.planetEmojis[ad.planet] || '🪐';
                const isAdActive = now >= ad.startDate && now < ad.endDate;
                const isAdPast = ad.endDate < now;
                const adDur = this.getYearsMonths(ad.startDate, ad.endDate);
                const adId = `ad-${mdIdx}-${adIdx}`;

                // Pratyantardasha grid (Level 3)
                let pdHtml = '';
                if (ad.pratyantardashas && ad.pratyantardashas.length > 0) {
                    const pdCards = ad.pratyantardashas.map(pd => {
                        const pdCol = this.planetColors[pd.planet] || this.planetColors.sun;
                        const pdEmoji = this.planetEmojis[pd.planet] || '🪐';
                        const isPdActive = now >= pd.startDate && now < pd.endDate;
                        return `
                        <div style="padding:0.4rem 0.6rem;background:${isPdActive ? pdCol.light : 'rgba(255,255,255,0.03)'};border:1px solid ${isPdActive ? pdCol.bg : 'rgba(255,255,255,0.07)'};border-radius:6px;font-size:0.75rem;${isPdActive ? 'box-shadow:0 0 8px ' + pdCol.bg + '40;' : ''}">
                            <span style="color:${pdCol.text};font-weight:600;">${pdEmoji} ${this.capitalize(pd.planet)}</span>
                            ${isPdActive ? '<span style="background:rgba(255,255,255,0.2);color:#fff;font-size:0.6rem;padding:1px 5px;border-radius:8px;margin-left:4px;">NOW</span>' : ''}
                            <div style="color:rgba(255,255,255,0.4);font-size:0.68rem;margin-top:2px;">${this.formatDateFull(pd.startDate)} → ${this.formatDateFull(pd.endDate)}</div>
                        </div>`;
                    }).join('');

                    pdHtml = `
                    <div id="${adId}-pd" style="display:${isAdActive ? 'block' : 'none'};margin-top:0.75rem;padding:0.75rem;background:rgba(0,0,0,0.25);border-radius:8px;">
                        <div style="font-size:0.7rem;color:${adCol.text};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">
                            Pratyantardashas (${adEmoji} ${this.capitalize(ad.planet)})
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:0.4rem;">
                            ${pdCards}
                        </div>
                    </div>`;
                }

                adRowsHtml += `
                <div style="margin-bottom:0.4rem;opacity:${isAdPast ? 0.5 : 1};">
                    <div onclick="(function(){const pd=document.getElementById('${adId}-pd');if(pd)pd.style.display=pd.style.display==='none'?'block':'none';})()"
                         style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;background:${isAdActive ? adCol.light : 'rgba(255,255,255,0.03)'};border:1px solid ${isAdActive ? adCol.bg : 'rgba(255,255,255,0.07)'};border-radius:8px;cursor:pointer;transition:background 0.2s;${isAdActive ? 'box-shadow:0 0 10px ' + adCol.bg + '30;' : ''}">
                        <div style="width:8px;height:8px;border-radius:50%;background:${adCol.bg};flex-shrink:0;box-shadow:0 0 5px ${adCol.bg};"></div>
                        <span style="color:${adCol.text};font-weight:${isAdActive ? '700' : '500'};font-size:0.85rem;">${adEmoji} ${this.capitalize(ad.planet)} Antardasha</span>
                        ${isAdActive ? '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:0.65rem;padding:1px 7px;border-radius:8px;">● NOW</span>' : ''}
                        <span style="color:rgba(255,255,255,0.4);font-size:0.75rem;margin-left:auto;">${this.formatDate(ad.startDate)} → ${this.formatDate(ad.endDate)}&nbsp;(${adDur})</span>
                        ${ad.pratyantardashas && ad.pratyantardashas.length ? '<span style="color:rgba(255,255,255,0.3);font-size:0.7rem;">▼</span>' : ''}
                    </div>
                    ${pdHtml}
                </div>`;
            });

            html += `
            <div class="md-block ${isActive ? 'md-active' : ''}" style="opacity:${opacity};margin-bottom:1.5rem;">
                <!-- Mahadasha header (Level 1 toggle) -->
                <div onclick="(function(){const el=document.getElementById('${mdId}-ads');el.style.display=el.style.display==='none'?'block':'none';})()"
                     style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;background:${col.light};border:1px solid ${col.bg};border-radius:12px;cursor:pointer;margin-bottom:0.5rem;${isActive ? 'box-shadow:0 0 16px ' + col.bg + '40;' : ''}">
                    <div style="width:14px;height:14px;border-radius:50%;background:${col.bg};flex-shrink:0;box-shadow:0 0 8px ${col.bg};"></div>
                    <span style="color:${col.text};font-weight:700;font-size:1rem;">
                        ${emoji} ${this.capitalize(md.planet)} Mahadasha
                        ${isActive ? '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:0.7rem;padding:2px 8px;border-radius:10px;margin-left:6px;">● ACTIVE</span>' : ''}
                    </span>
                    <span style="color:rgba(255,255,255,0.5);font-size:0.8rem;margin-left:auto;">${this.formatDate(md.startDate)} → ${this.formatDate(md.endDate)}&nbsp;(${dur})</span>
                    <span style="color:rgba(255,255,255,0.3);font-size:0.8rem;">▼</span>
                </div>
                ${progressHtml}
                ${isActive && theme ? `
                <div style="padding:0.5rem 1rem;background:${col.light};border-left:3px solid ${col.bg};border-radius:0 8px 8px 0;margin-bottom:0.5rem;font-size:0.82rem;">
                    <span style="color:${col.text};font-weight:600;">🧠 ${theme.title}</span>
                    <span style="color:rgba(255,255,255,0.45);margin-left:8px;">${theme.positive}</span>
                </div>` : ''}
                <!-- Antardasha List (Level 2 toggle) -->
                <div id="${mdId}-ads" style="display:${isActive ? 'block' : 'none'};padding:0.5rem 0.5rem 0.25rem;background:rgba(0,0,0,0.2);border-radius:8px;margin-top:0.25rem;">
                    ${adRowsHtml}
                </div>
            </div>`;
        });

        container.innerHTML = html;
    }

    setupTooltips() {
        const tooltip = document.getElementById('dashaTip');
        if (!tooltip) return;
        document.querySelectorAll('[data-tooltip]').forEach(el => {
            el.addEventListener('mouseenter', e => {
                tooltip.innerHTML = e.currentTarget.getAttribute('data-tooltip').replace(/&#10;/g, '<br>');
                tooltip.style.display = 'block';
            });
            el.addEventListener('mousemove', e => {
                tooltip.style.left = (e.pageX + 14) + 'px';
                tooltip.style.top = (e.pageY - 30) + 'px';
            });
            el.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
        });
    }

    // Current period cards shown at top of page (MD / AD / PD)
    renderCurrentPeriodCard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { dashas } = this.birthChart;
        const md = dashas.currentMahadasha;
        const ad = dashas.antardashas?.current;
        const pd = dashas.antardashas?.pratyantardashas?.current;

        if (!md) {
            container.innerHTML = '<p style="color:var(--moon-silver);">Dasha data unavailable.</p>';
            return;
        }

        const mdCol = this.planetColors[md.planet];
        const adCol = ad ? this.planetColors[ad.planet] : null;
        const pdCol = pd ? this.planetColors[pd.planet] : null;
        const mdTheme = this.psychThemes[md.planet];
        const adTheme = ad ? this.psychThemes[ad.planet] : null;

        const timePercent = d => {
            const total = d.endDate - d.startDate;
            const elapsed = new Date() - d.startDate;
            return Math.max(0, Math.min(100, (elapsed / total * 100))).toFixed(1);
        };

        const card = (label, col, p, theme) => `
        <div style="background:${col.light};border:1px solid ${col.bg};border-radius:16px;padding:1.5rem;">
            <div style="font-size:0.75rem;color:${col.text};font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;">${label}</div>
            <div style="font-size:1.4rem;font-weight:700;color:#fff;margin-bottom:0.25rem;">${this.planetEmojis[p.planet]} ${this.capitalize(p.planet)}</div>
            <div style="font-size:0.8rem;color:var(--moon-silver);margin-bottom:0.75rem;">${this.formatDateFull(p.startDate)} → ${this.formatDateFull(p.endDate)}</div>
            <div style="background:rgba(0,0,0,0.3);border-radius:6px;height:6px;overflow:hidden;margin-bottom:0.5rem;">
                <div style="height:100%;width:${timePercent(p)}%;background:${col.bg};border-radius:6px;"></div>
            </div>
            <div style="font-size:0.75rem;color:${col.text};">${timePercent(p)}% elapsed</div>
            ${theme ? `<div style="margin-top:0.75rem;font-size:0.85rem;color:var(--moon-silver);line-height:1.5;">${theme.desc}</div>` : ''}
        </div>`;

        container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;">
            ${card('Mahadasha', mdCol, md, mdTheme)}
            ${ad ? card('Antardasha', adCol, ad, adTheme) : ''}
            ${pd ? card('Pratyantardasha', pdCol, pd, null) : ''}
        </div>`;
    }
}
