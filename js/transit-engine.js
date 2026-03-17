/**
 * TransitEngine — Real-Time Transit Tracker
 * Calculates current planetary positions and compares against natal chart.
 * Depends on: astrology-engine-v8.js (VedicAstrologyEngine)
 */
class TransitEngine {
    constructor() {
        this.astroEngine = new VedicAstrologyEngine();
        this.birthChart = null;
        this.userData = null;

        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

        this.planetEmojis = {
            sun: '☀️', moon: '🌙', mars: '🔴', mercury: '💚',
            jupiter: '🟡', venus: '💗', saturn: '💙', rahu: '🟣', ketu: '⬛'
        };

        this.planetColors = {
            sun: { bg: '#f97316', light: 'rgba(249,115,22,0.12)' },
            moon: { bg: '#94a3b8', light: 'rgba(148,163,184,0.12)' },
            mars: { bg: '#ef4444', light: 'rgba(239,68,68,0.12)' },
            mercury: { bg: '#22c55e', light: 'rgba(34,197,94,0.12)' },
            jupiter: { bg: '#eab308', light: 'rgba(234,179,8,0.12)' },
            venus: { bg: '#ec4899', light: 'rgba(236,72,153,0.12)' },
            saturn: { bg: '#6366f1', light: 'rgba(99,102,241,0.12)' },
            rahu: { bg: '#8b5cf6', light: 'rgba(139,92,246,0.12)' },
            ketu: { bg: '#78716c', light: 'rgba(120,113,108,0.12)' }
        };

        // Key transit interpretations for all planets
        this.keyTransitEffects = {
            sun: {
                1: '☀️ Sun on Ascendant — Focus on self, vitality, leadership roles. A time to shine but avoid ego clashes.',
                2: '☀️ Sun on 2nd — Focus on finances and family matters. Guard against harsh speech.',
                3: '☀️ Sun on 3rd — Courage, short trips, initiatives succeed. Good for communication.',
                4: '☀️ Sun on 4th — Domestic affairs highlighted. Possible stress at home or with property.',
                5: '☀️ Sun on 5th — Creative pursuits, romance, and children are in focus. Good for learning.',
                6: '☀️ Sun on 6th — Excellent for overcoming health issues and debts. Victory over competitors.',
                7: '☀️ Sun on 7th — Relationship dynamics highlighted. Avoid dominating your partner.',
                8: '☀️ Sun on 8th — Transformational period. Focus on hidden matters, joint resources, or health.',
                9: '☀️ Sun on 9th — Long journeys, higher learning, and spiritual growth are favored.',
                10: '☀️ Sun on 10th — Excellent for career growth, recognition, and professional success.',
                11: '☀️ Sun on 11th — Gains, fulfilling desires, and networking with influential people.',
                12: '☀️ Sun on 12th — Time for retreat, spiritual pursuits, and letting go of the past.'
            },
            moon: {
                1: '🌙 Moon on Ascendant — Emotional sensitivity, focus on personal needs, fluctuations in mood.',
                2: '🌙 Moon on 2nd — Financial fluctuations, focus on family gatherings and nourishing food.',
                3: '🌙 Moon on 3rd — Emotional communication, short journeys, connecting with siblings.',
                4: '🌙 Moon on 4th — Strong need for emotional security, focus on home and mother.',
                5: '🌙 Moon on 5th — Emotional connection with children or romantic partners. Creative inspiration.',
                6: '🌙 Moon on 6th — Focus on health routines, daily work, and emotional well-being.',
                7: '🌙 Moon on 7th — Emotional need for partnership and connection. Public interactions.',
                8: '🌙 Moon on 8th — Deep emotional intensity, potential for anxiety, intuitive insights.',
                9: '🌙 Moon on 9th — Philosophical contemplation, emotional connection to beliefs or travel.',
                10: '🌙 Moon on 10th — Public emotional expression, focus on career reputation and public life.',
                11: '🌙 Moon on 11th — Emotional connection with friends and groups. Nourishing social networks.',
                12: '🌙 Moon on 12th — Need for solitude, spiritual reflection, active dream life.'
            },
            mars: {
                1: '🔴 Mars on Ascendant — High energy, assertiveness, potential for impulsiveness or anger.',
                2: '🔴 Mars on 2nd — Drive for financial gain, possible impulsive spending, sharp speech.',
                3: '🔴 Mars on 3rd — Great courage, assertiveness in communication, active short trips.',
                4: '🔴 Mars on 4th — Activity or friction at home. Good for property-related actions if careful.',
                5: '🔴 Mars on 5th — Passion in romance, competitive sports, active creative pursuits.',
                6: '🔴 Mars on 6th — Excellent energy for tackling work, debts, and health routines. Victory over opponents.',
                7: '🔴 Mars on 7th — Potential for conflict in partnerships. Need to balance assertiveness and compromise.',
                8: '🔴 Mars on 8th — Intense energy, focus on transformation. Caution needed in physical activities.',
                9: '🔴 Mars on 9th — Passionate about beliefs, adventurous travel, drive for higher learning.',
                10: '🔴 Mars on 10th — Strong career drive, ambition, taking a leadership role at work.',
                11: '🔴 Mars on 11th — Strategic pursuit of goals, active networking, defending friends.',
                12: '🔴 Mars on 12th — Directed energy towards spiritual or hidden matters. Potential for suppressed anger.'
            },
            mercury: {
                1: '💚 Mercury on Ascendant — Mentally active, communicative, curious, and adaptable.',
                2: '💚 Mercury on 2nd — Good for financial planning, articulate speech, business transactions.',
                3: '💚 Mercury on 3rd — Excellent for writing, learning, networking, and short trips.',
                4: '💚 Mercury on 4th — Mental focus on home and family. Studying or working from home.',
                5: '💚 Mercury on 5th — Playful communication, learning new skills, intellectual hobbies.',
                6: '💚 Mercury on 6th — Analytical focus on work and health. Good for organization and problem-solving.',
                7: '💚 Mercury on 7th — Communication in relationships is key. Business negotiations favored.',
                8: '💚 Mercury on 8th — Investigative thinking, research, discussions about shared resources.',
                9: '💚 Mercury on 9th — Studying philosophy, foreign languages, or planning long-distance travel.',
                10: '💚 Mercury on 10th — Communicating professional ideas, networking for career advancement.',
                11: '💚 Mercury on 11th — Engaging with groups, exchanging ideas with friends, intellectual connections.',
                12: '💚 Mercury on 12th — Reflective thinking, spiritual studies, need for mental retreat.'
            },
            jupiter: {
                1: '✨ Jupiter on Ascendant — Expansion, optimism, new beginnings. Excellent for health and new ventures.',
                2: '💎 Jupiter on 2nd — Financial growth, family harmony, eloquent speech. Very auspicious for wealth.',
                3: '📣 Jupiter on 3rd — Bold communication, courage rewarded; siblings prosper.',
                4: '🏡 Jupiter on 4th — Home joy, mother\'s wellbeing, property gains, emotional contentment.',
                5: '👶 Jupiter on 5th — Best for children (conception/birth), creative success, romantic happiness, investments.',
                6: '⚔️ Jupiter on 6th — Legal victories, overcoming rivals, service brings rewards.',
                7: '💑 Jupiter on 7th — Marriage, partnerships, business alliances flourish. Partner has auspicious period.',
                8: '🔄 Jupiter on 8th — Transformation is managed well; inheritance, deep study, mystical insights.',
                9: '🌟 Jupiter on 9th — One of the best transits! Fortune, spiritual elevation, guru connection, travel.',
                10: '🚀 Jupiter on 10th — Career expansion, recognition, promotions, new business opportunities.',
                11: '🎁 Jupiter on 11th — Fulfillment of desires, gains, social network expansion. Excellent transit.',
                12: '🕊️ Jupiter on 12th — Spiritual journey, foreign travel, ashram/retreat. Peace in seclusion.'
            },
            venus: {
                1: '💗 Venus on Ascendant — Charm, attractiveness, desire for pleasure and harmony. Good for self-care.',
                2: '💗 Venus on 2nd — Financial gains through art or beauty, enjoyment of good food and luxury.',
                3: '💗 Venus on 3rd — Pleasant communication, harmonious relations with neighbors and siblings.',
                4: '💗 Venus on 4th — Beautifying the home, peaceful domestic life, hosting gatherings.',
                5: '💗 Venus on 5th — Romance, creative expression, enjoyment of arts and entertainment.',
                6: '💗 Venus on 6th — Harmony in the workplace, focusing on health and beauty routines.',
                7: '💗 Venus on 7th — Excellent for marriage, forming new partnerships, and social interactions.',
                8: '💗 Venus on 8th — Deep, intense romantic connections. Financial gains through partnership.',
                9: '💗 Venus on 9th — Love for travel, appreciation of different cultures, philosophical harmony.',
                10: '💗 Venus on 10th — Favorable for public image, harmonious relations with authority figures.',
                11: '💗 Venus on 11th — Socializing with friends, networking, enjoying group activities.',
                12: '💗 Venus on 12th — Secret romances, enjoyment of solitude, spiritual devotion.'
            },
            saturn: {
                1: '⚠️ Saturn on Ascendant — Major life reset, health focus, responsibilities increase. A period of hard work and inner discipline.',
                2: '💰 Saturn on 2nd — Financial caution needed. Delays in income but steady building of assets over time.',
                3: '✍️ Saturn on 3rd — Discipline in communication; good for focused study, slower pace with siblings.',
                4: '🏠 Saturn on 4th — Home & family challenges, property matters. Emotional restriction but building solid foundations.',
                5: '🎓 Saturn on 5th — Delays with children/creativity; heavy studies; past karma with romance surfaces.',
                6: '💪 Saturn on 6th — Excellent for overcoming enemies, health improvement through discipline, work focus.',
                7: '💍 Saturn on 7th — Relationship tests, delays in marriage, partners may become more serious or demanding.',
                8: '🔮 Saturn on 8th — Deep transformation, research, occult study; possible health concerns in in-law family.',
                9: '🙏 Saturn on 9th — Spiritual discipline; challenges with father/guru; overseas delays.',
                10: '📈 Saturn on 10th — Career tests and restructuring. Hard work pays off slowly but surely — one of the most important transits.',
                11: '🤝 Saturn on 11th — Gains come through persistent effort; elder sibling matters.',
                12: '🧘 Saturn on 12th — Withdrawal, spiritual retreat, foreign connections; prepare for Sade Sati.'
            },
            rahu: {
                1: '🌪️ Rahu on Ascendant — Unusual experiences, identity confusion, foreign influences. Unexpected opportunities.',
                2: '💸 Rahu on 2nd — Unusual money flows, food obsessions, deception in family possible.',
                3: '🚀 Rahu on 3rd — Great courage, unconventional communication, short trips, success in media/tech.',
                4: '🏠 Rahu on 4th — Real estate opportunities, unconventional home life, foreign mother or land.',
                5: '🎭 Rahu on 5th — Obsessive romance, unconventional creativity, speculative gains/losses.',
                6: '⚔️ Rahu on 6th — Excellent for defeating enemies, success in competitive environments, alternative healing.',
                7: '💫 Rahu on 7th — Unusual relationships, foreign partner potential, obsessive partnerships.',
                8: '🔮 Rahu on 8th — Sudden transformations, interest in the occult, unexpected financial changes.',
                9: '✈️ Rahu on 9th — Unconventional beliefs, foreign travel, questioning traditional authority/gurus.',
                10: '🎯 Rahu on 10th — Sudden career changes, unconventional fame, ambition peaks. Can bring rapid rise.',
                11: '🌐 Rahu on 11th — Sudden fulfillment of desires, unconventional networking, gains from foreign sources.',
                12: '🌌 Rahu on 12th — Vivid dreams, interest in spirituality/foreign lands, unexpected expenses.'
            },
            ketu: {
                1: '⬛ Ketu on Ascendant — Spiritual introspection, feeling disconnected from the world, intuition increases.',
                2: '⬛ Ketu on 2nd — Detachment from wealth and family matters. Potential for sudden expenses.',
                3: '⬛ Ketu on 3rd — Disinterest in mundane communication, spiritual courage, breaks with siblings.',
                4: '⬛ Ketu on 4th — Detachment from home and mother. Seeking spiritual roots, potential property changes.',
                5: '⬛ Ketu on 5th — Disinterest in romance or past karma surfaces. Focus on spiritual or mantra practices.',
                6: '⬛ Ketu on 6th — Good for healing unseen illnesses, overcoming enemies through detachment.',
                7: '⬛ Ketu on 7th — Detachment in partnerships, spiritual connections in relationships, past life themes.',
                8: '⬛ Ketu on 8th — Deep mystical experiences, sudden transformations, intuitive insights into the unknown.',
                9: '⬛ Ketu on 9th — Spiritual pilgrimage, detachment from traditional religion, deep philosophical understanding.',
                10: '⬛ Ketu on 10th — Detachment from career ambition, changes in profession, seeking meaningful work.',
                11: '⬛ Ketu on 11th — Disinterest in large social groups, selective friendships, spiritual networking.',
                12: '⬛ Ketu on 12th — Excellent for moksha (liberation), deep meditation, profound spiritual realization.'
            }
        };
    }

    async loadData() {
        try {
            const raw = localStorage.getItem('astropsycho_assessment');
            if (!raw) return false;
            this.userData = JSON.parse(raw).birthDetails;
            this.birthChart = this.astroEngine.calculateBirthChart(this.userData);

            // Also load transit effects
            await this.loadTransitEffects();

            return true;
        } catch (e) {
            console.error('TransitEngine: Failed to load data', e);
            return false;
        }
    }

    async loadTransitEffects() {
        try {
            const response = await fetch('data/transit-effects.json');
            this.transitEffects = await response.json();
        } catch (error) {
            console.error('Error loading transit effects:', error);
            this.transitEffects = {};
        }
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Calculate planetary positions for any given date
    calculateTransitsForDate(dateObj) {
        // Use noon UTC for mean daily positions (no birth location needed for transit chart)
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const utcDate = new Date(Date.UTC(year, month - 1, day, 6, 0, 0)); // 6 AM UTC = noon IST approx
        const jd = this.astroEngine.calculateJulianDate(utcDate);
        const t = (jd - 2451545.0) / 36525.0;
        const ayanamsa = this.astroEngine.calculatePreciseAyanamsa(t);
        const planets = this.astroEngine.calculatePrecisePlanets(t, ayanamsa);
        return planets;
    }

    // Get natal house for a transit planet position
    getTransitHouse(transitLongitude) {
        if (!this.birthChart) return 0;
        return this.astroEngine.getHouseNumber(transitLongitude, this.birthChart.ascendant);
    }

    getHouseNumber(pos, ascendant) {
        return this.astroEngine.getHouseNumber(pos, ascendant);
    }

    // Calculate all transit effects
    getTransitReport(transitPlanets) {
        const natalDetails = this.birthChart.planetaryDetails;
        const ascendant = this.birthChart.ascendant;
        const report = [];

        const mainPlanets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

        // Needed for Nakshatra/Navatara calculations
        const natalMoonLongitude = natalDetails.moon ? natalDetails.moon.longitude : 0;
        const natalMoonSign = Math.floor(natalMoonLongitude / 30);
        const natalMoonNak = this.astroEngine.getNakshatra(natalMoonLongitude);
        const natalMoonNakIdx = natalMoonNak.index;

        mainPlanets.forEach(p => {
            const tLong = transitPlanets[p];
            if (tLong === undefined) return;

            const nLong = natalDetails[p] ? natalDetails[p].longitude : 0;
            const tSignIdx = Math.floor(tLong / 30);
            const nSignIdx = natalDetails[p] ? natalDetails[p].signIndex : 0;
            const tHouse = this.getTransitHouse(tLong);
            const nHouse = natalDetails[p] ? natalDetails[p].house : 0;
            const tDeg = tLong % 30;
            const nDeg = nLong % 30;

            // Aspect over Moon
            const moonLong = natalMoonLongitude;
            const moonDiff = Math.abs(tLong - moonLong);
            const moonAspect = Math.min(moonDiff, 360 - moonDiff);
            const isMoonConjunct = moonAspect < 15;

            // Aspect over natal planet of same type (return to natal sign?)
            const isReturnSign = tSignIdx === nSignIdx;

            let effect = 'neutral';
            if (['jupiter', 'venus', 'mercury'].includes(p) && [1, 2, 4, 5, 7, 9, 10, 11].includes(tHouse)) effect = 'benefic';
            if (['saturn', 'rahu', 'ketu', 'mars'].includes(p) && [6, 8, 12].includes(tHouse)) effect = 'neutral'; // Upachaya for malefics
            if (['saturn', 'mars'].includes(p) && [1, 4, 7, 8, 12].includes(tHouse)) effect = 'challenging';

            // Key transit text
            let keyText = '';
            if (this.keyTransitEffects[p] && this.keyTransitEffects[p][tHouse]) {
                keyText = this.keyTransitEffects[p][tHouse];
            }

            // Calculate Nakshatra and Navatara impact
            const transitNak = this.astroEngine.getNakshatra(tLong);
            const navatara = this.astroEngine.getNakshatraImpact(transitNak.index, natalMoonNakIdx);

            // Calculate transit house from natal Moon for Transit Outlook
            const transitHouseFromMoon = ((tSignIdx - natalMoonSign + 12) % 12) + 1;

            let outlook = 'Stable';
            let description = 'Period of normalcy';
            let severityClass = '';

            if (this.transitEffects && this.transitEffects[p] && this.transitEffects[p][transitHouseFromMoon]) {
                const effectData = this.transitEffects[p][transitHouseFromMoon];
                outlook = effectData.outlook;
                description = effectData.description;

                // Set severity styling
                switch (effectData.severity) {
                    case 'very_positive':
                        severityClass = 'style="color: #22c55e; font-weight: 600;"';
                        break;
                    case 'positive':
                        severityClass = 'style="color: #22c55e;"';
                        break;
                    case 'very_challenging':
                        severityClass = 'style="color: #ef4444; font-weight: 600;"';
                        break;
                    case 'challenging':
                        severityClass = 'style="color: #f97316;"';
                        break;
                    default:
                        severityClass = 'style="color: #94a3b8;"';
                }

                // Add special markers for significant transits
                if (effectData.special) {
                    switch (effectData.special) {
                        case 'sade_sati_phase1': outlook = '⚠️ ' + outlook; break;
                        case 'sade_sati_phase2': outlook = '⚠️⚠️ ' + outlook; break;
                        case 'sade_sati_phase3': outlook = '⚠️ ' + outlook; break;
                        case 'ashtama_shani': outlook = '🔥 ' + outlook; break;
                        case 'kantaka_shani': outlook = '⚡ ' + outlook; break;
                    }
                }
            }

            report.push({
                planet: p,
                transitSign: this.signs[tSignIdx],
                transitHouse: tHouse,
                transitDegree: tDeg.toFixed(1),
                natalSign: this.signs[nSignIdx],
                natalHouse: nHouse,
                natalDegree: nDeg.toFixed(1),
                effect,
                isReturnSign,
                isMoonConjunct,
                keyText,
                transitNak: transitNak,
                navatara: navatara,
                outlook: outlook,
                description: description,
                severityClass: severityClass
            });
        });

        return report;
    }

    // Format degree/minute string
    formatDeg(decDeg) {
        const d = Math.floor(decDeg);
        const m = Math.floor((decDeg - d) * 60);
        return `${d}°${m}'`;
    }

    // Get overall transit summary
    getTransitSummary(report) {
        const benefics = report.filter(r => r.effect === 'benefic').map(r => this.capitalize(r.planet));
        const challenging = report.filter(r => r.effect === 'challenging').map(r => this.capitalize(r.planet));

        // Jupiter and Saturn are the most important (slow-moving)
        const jupiterReport = report.find(r => r.planet === 'jupiter');
        const saturnReport = report.find(r => r.planet === 'saturn');

        return { benefics, challenging, jupiterReport, saturnReport };
    }

    // ─────────────────────────────────────────────────────────────
    // TRANSIT CONJUNCTIONS — multi-planet grouping in current sky
    // ─────────────────────────────────────────────────────────────

    /**
     * Detects 2–7 planet conjunctions in the current transit sky for a given date.
     * @param {Object} transitPlanets  { planet: longitude, … }
     * @returns {{ stelliums: Array, pairs: Array }}
     */
    getTransitConjunctions(transitPlanets) {
        const planetList = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
        const norm = d => ((d % 360) + 360) % 360;
        const signOf = d => Math.floor(norm(d) / 30);
        const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const orb = (a, b) => { let d = Math.abs(norm(a) - norm(b)); return d > 180 ? 360 - d : d; };

        const pos = {};
        planetList.forEach(p => { if (transitPlanets[p] !== undefined) pos[p] = norm(transitPlanets[p]); });

        // ── 1. Group by transit sign ──────────────────────────────
        const bySign = {};
        Object.keys(pos).forEach(p => {
            const si = signOf(pos[p]);
            if (!bySign[si]) bySign[si] = [];
            bySign[si].push(p);
        });

        const stelliums = [];
        const usedInStellium = new Set();

        Object.keys(bySign).forEach(si => {
            const group = bySign[si];
            if (group.length < 3) return;
            const degs = group.map(p => pos[p]);
            const span = Math.max(...degs) - Math.min(...degs);
            if (span > 18) return;
            group.forEach(p => usedInStellium.add(p));
            const midDeg = (Math.min(...degs) + Math.max(...degs)) / 2;
            const natalHouse = this.birthChart ? this.getHouseNumber(midDeg, this.birthChart.ascendant) : 0;
            stelliums.push({
                planets: group,
                count: group.length,
                span: parseFloat(span.toFixed(2)),
                isTight: span <= 6,
                signName: signNames[parseInt(si)],
                natalHouse,
                interpretation: this._synthesizeTransitConjunction(group, natalHouse, signNames[parseInt(si)])
            });
        });

        stelliums.sort((a, b) => b.count - a.count || a.span - b.span);

        // ── 2. Two-planet pairs ───────────────────────────────────
        const pairs = [];
        for (let i = 0; i < planetList.length; i++) {
            for (let j = i + 1; j < planetList.length; j++) {
                const p1 = planetList[i], p2 = planetList[j];
                if ((p1 === 'rahu' && p2 === 'ketu') || (p1 === 'ketu' && p2 === 'rahu')) continue;
                if (pos[p1] === undefined || pos[p2] === undefined) continue;
                const o = orb(pos[p1], pos[p2]);
                const sameSign = signOf(pos[p1]) === signOf(pos[p2]);
                if (o <= 10 || (sameSign && o <= 15)) {
                    const natalHouse = this.birthChart ? this.getHouseNumber(pos[p1], this.birthChart.ascendant) : 0;
                    pairs.push({
                        p1, p2,
                        orb: parseFloat(o.toFixed(2)),
                        isTight: o <= 5,
                        signName: signNames[signOf(pos[p1])],
                        natalHouse,
                        interpretation: this._synthesizeTransitPairInterpretation(p1, p2, natalHouse, signNames[signOf(pos[p1])])
                    });
                }
            }
        }
        pairs.sort((a, b) => a.orb - b.orb);

        return { stelliums, pairs };
    }

    _synthesizeTransitConjunction(planets, house, sign) {
        const benefics = ['jupiter', 'venus', 'moon', 'mercury'];
        const malefics = ['saturn', 'mars', 'rahu', 'ketu', 'sun'];
        const beneficCount = planets.filter(p => benefics.includes(p)).length;
        const maleficCount = planets.filter(p => malefics.includes(p)).length;
        const sizeLabels = ['', '', '', 'Triple', 'Quadruple', 'Quintuple', 'Sextuple', 'Septuple'];
        const label = sizeLabels[planets.length] || `${planets.length}-Planet`;

        const houseThemes = {
            1: 'personality & health', 2: 'finances & family', 3: 'communication & courage',
            4: 'home & emotions', 5: 'creativity & romance', 6: 'work & health challenges',
            7: 'relationships & partnerships', 8: 'transformation & hidden matters',
            9: 'dharma & fortune', 10: 'career & public life', 11: 'gains & aspirations', 12: 'liberation & losses'
        };

        let power = beneficCount > maleficCount ? 'Auspicious' : maleficCount > beneficCount ? 'Challenging' : 'Mixed';
        if (planets.length >= 5) power = 'Extraordinary';

        const theme = planets.length >= 5
            ? `${label} Sky Stellium — Rare Planetary Cluster`
            : beneficCount > maleficCount
                ? `Benefic Cluster in ${sign}`
                : maleficCount > beneficCount
                    ? `Tense Transit Stellium in ${sign}`
                    : `Planetary Fusion in ${sign}`;

        const hDesc = houseThemes[house] || 'all areas';
        let effect = `A ${label.toLowerCase()} transit stellium — ${planets.map(p => this.capitalize(p)).join(', ')} — is currently clustered in ${sign}, activating your natal ${house}th house of ${hDesc}. `;
        if (beneficCount > maleficCount) {
            effect += `With benefics dominant, this is a window of opportunity, expansion, and positive momentum in the themes of your ${house}th house. Take initiative now.`;
        } else if (maleficCount > beneficCount) {
            effect += `With malefics prominent, this transit brings pressure, delays, or tests to your ${house}th house. Exercise caution and patience — the pressure forges strength.`;
        } else {
            effect += `This balanced transit creates both opportunities and friction in your ${house}th house simultaneously. Navigate with awareness and flexibility.`;
        }

        return { title: `${label} Transit Stellium in ${sign}`, power, theme, effect };
    }

    _synthesizeTransitPairInterpretation(p1, p2, house, sign) {
        const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
        const pair = [p1, p2].sort().join('-');

        const houseThemes = {
            1: 'self & personality', 2: 'wealth & family', 3: 'communication & courage',
            4: 'home & emotions', 5: 'creativity & romance', 6: 'work & health',
            7: 'relationships & partnerships', 8: 'transformation & secrets',
            9: 'dharma & fortune', 10: 'career & public life', 11: 'gains & aspirations', 12: 'liberation & losses'
        };

        // Rich pair-specific transit descriptions
        const pairDB = {
            'moon-sun': {
                type: 'intense',
                name: 'New Moon Energy',
                effect: `The Sun and Moon are merging in ${sign}, forming a New Moon zone in your ${house}th house. This is a powerful reset — old emotional cycles close and new ones begin. New ventures, intentions, and commitments made now carry strong momentum. Expect heightened subjectivity; your feelings and ego are one. Emotionally charged decisions should be made mindfully.`
            },
            'mars-sun': {
                type: 'intense',
                name: 'Solar Fire Transit',
                effect: `Mars and the Sun are blazing together in ${sign}, amplifying your drive, ambition, and combative energy in your ${house}th house. This is a time of fierce initiative, leadership, and physical vitality. Beware of impulsiveness, arguments, and accidents from acting too fast. Channel this fire productively — this window favors bold action, competition, and starting new projects.`
            },
            'jupiter-sun': {
                type: 'benefic',
                name: 'Prosperity & Authority Transit',
                effect: `Jupiter and the Sun are aligned in ${sign}, illuminating your ${house}th house with a rare combination of confidence, wisdom, and good fortune. This is one of the most auspicious transit pairs for recognition, career advancement, and spiritual growth. Teachers, mentors, and authority figures may play a pivotal role. Your sense of purpose is magnified — act on your highest ambitions now.`
            },
            'saturn-sun': {
                type: 'challenging',
                name: 'Reality Check Transit',
                effect: `Saturn is pressing hard against the Sun in ${sign}, casting a sobering light on your ${house}th house. Duties, limitations, and responsibilities feel heavy right now. Ego-driven plans meet delays and obstacles. However, this is the universe demanding quality over speed — structures built now withstand the test of time. Avoid confrontations with authority figures. Discipline and patience are your greatest tools.`
            },
            'rahu-sun': {
                type: 'intense',
                name: 'Eclipse Shadow Transit',
                effect: `Rahu is eclipsing the Sun in ${sign}, creating a powerful — and unsettling — transit in your ${house}th house. Your identity and self-expression may feel distorted, inflated, or pulled toward unusual ambitions. Fame, status, and recognition become obsessive themes. Beware of self-deception, exaggeration, or chasing illusions of power. Highly innovative energy is present, but ground yourself regularly.`
            },
            'ketu-sun': {
                type: 'challenging',
                name: 'Ego Dissolution Transit',
                effect: `Ketu is draining the Sun's ego-force in ${sign}, making the themes of your ${house}th house feel distant or unsatisfying. Recognition may feel hollow, worldly identity loses its grip. This is a deeply spiritual transit — ideal for introspection, detachment from fame, and dedicating action toward selfless purpose. Unexpected withdrawals or changes in leadership may occur around you.`
            },
            'mars-moon': {
                type: 'intense',
                name: 'Emotional Fire Transit',
                effect: `Mars and the Moon are colliding in ${sign}, supercharging your ${house}th house with emotional intensity, passion, and volatility. Moods swing between fierce motivation and reactive anger. Arguments with close ones are possible — especially with women or family. However, this is extraordinary fuel for business, fitness, or any goal requiring emotional courage. Channel passion constructively, and avoid reactive decisions.`
            },
            'mercury-moon': {
                type: 'benefic',
                name: 'Mind & Heart Alignment',
                effect: `Mercury and the Moon are traveling together in ${sign}, bringing a beautiful union of intellect and intuition into your ${house}th house. Your mind is sharp, your communication is heartfelt, and your emotional intelligence peaks. Excellent for writing, counseling, negotiations, and learning. However, expect fluctuation in thoughts — too many ideas may scatter focus. Stay grounded amid the mental flow.`
            },
            'jupiter-moon': {
                type: 'benefic',
                name: 'Emotional Abundance Transit',
                effect: `Jupiter is expanding the Moon's nurturing energy in ${sign}, blessing your ${house}th house with emotional optimism, inner richness, and genuine contentment. You may feel unusually generous, spiritually connected, or supported by others. Family relationships improve, and your intuition is wise and trustworthy. This transit often coincides with good news related to the themes of your ${house}th house.`
            },
            'moon-venus': {
                type: 'benefic',
                name: 'Pleasure & Harmony Transit',
                effect: `Venus and the Moon are together in ${sign}, wrapping your ${house}th house in charm, beauty, and emotional warmth. Social life flourishes, relationships feel tender and nourishing, and aesthetic pleasures — art, music, food, love — are deeply satisfying. This is a gentle but potent transit for romance, creative projects, and healing emotional wounds. Enjoy it without indulgence tipping into excess.`
            },
            'moon-saturn': {
                type: 'challenging',
                name: 'Emotional Contraction Transit',
                effect: `Saturn is weighing heavily on the Moon in ${sign}, casting a melancholic, duty-bound tone on your ${house}th house. You may feel emotionally withdrawn, lonely, or burdened by obligation. Pessimism and overthinking are common side effects. However, this transit builds extraordinary emotional endurance — lessons learned now about self-discipline and managing feelings become foundational strengths. Seek structure, not escape.`
            },
            'moon-rahu': {
                type: 'intense',
                name: 'Mental Turbulence Transit',
                effect: `Rahu is distorting the Moon's receptive energy in ${sign}, stirring up anxiety, vivid imagination, and psychological intensity in your ${house}th house. Sleep may be disrupted by restless dreams. Emotional cravings become insatiable. However, your intuition is razor-sharp and your perception of hidden patterns is remarkable. Excellent for psychology, research, and technology — but ground yourself to avoid mental spiraling.`
            },
            'ketu-moon': {
                type: 'mixed',
                name: 'Intuitive Detachment Transit',
                effect: `Ketu is dissolving the Moon's attachment in ${sign}, creating an unusual emotional detachment in your ${house}th house. You may feel disconnected from family or domestic comforts, drawn inward toward solitude and spiritual reflection. Past-life memories or inexplicable emotional surges may arise. Excellent for meditation, healing old wounds, and clearing emotional karma — but avoid isolation that tips into depression.`
            },
            'mars-mercury': {
                type: 'mixed',
                name: 'Sharp Mind & Sharp Tongue',
                effect: `Mars and Mercury are accelerating together in ${sign}, making your ${house}th house a hotbed of rapid thinking, quick decisions, and assertive communication. Your mind operates like a blade — precise, fast, and penetrating. Debates, negotiations, and technical work benefit enormously. However, words can wound without intent — think before you speak. Watch for impulsive contracts or decisions made too hastily.`
            },
            'jupiter-mars': {
                type: 'benefic',
                name: 'Righteous Action Transit',
                effect: `Jupiter and Mars are powering up your ${house}th house in ${sign}, creating a potent window of courageous, purposeful action. You have both the drive to act (Mars) and the wisdom to act rightly (Jupiter). This is an excellent transit for legal matters, athletic endeavors, launching ventures, and asserting yourself with dignity. The universe rewards bold but principled moves made during this period.`
            },
            'mars-venus': {
                type: 'intense',
                name: 'Passion & Desire Transit',
                effect: `Mars and Venus are igniting your ${house}th house in ${sign}, flooding it with passion, sensuality, and creative hunger. Romantic energy is electric — existing relationships intensify, new attractions feel magnetic. Creative projects carry explosive momentum. However, this transit amplifies desire and impatience — be mindful of jealousy, possessiveness, or reckless romantic decisions. Harness this energy for art, love, and bold creation.`
            },
            'mars-saturn': {
                type: 'challenging',
                name: 'Frustration & Breakthrough Transit',
                effect: `Mars and Saturn are locked in a tense pairing in ${sign}, creating a push-pull dynamic in your ${house}th house. You feel the urge to charge forward (Mars) while obstacles and delays hold you back (Saturn). This friction is intense — frustration, anger, and exhaustion are common. Yet within this tension lies extraordinary potential: forced patience and disciplined effort now build lasting, durable results. Avoid reckless shortcuts.`
            },
            'mars-rahu': {
                type: 'intense',
                name: 'Explosive Ambition Transit',
                effect: `Mars and Rahu are supercharging your ${house}th house in ${sign} with reckless ambition, unconventional drive, and fearless — sometimes reckless — action. This is the most accident-prone and combustible transit pair. But it also fuels extraordinary breakthroughs in technology, sports, and pioneering ventures. Avoid aggression, substance abuse, and impulsive risk-taking. Channel this raw electricity toward bold, calculated innovation.`
            },
            'ketu-mars': {
                type: 'challenging',
                name: 'Erratic Energy Transit',
                effect: `Ketu is destabilizing Mars in ${sign}, making action in your ${house}th house unpredictable and often lacking clear motivation. You may act impulsively, then feel indifferent about the outcome. Precision skills — surgery, martial arts, coding, detailed craft — are surprisingly enhanced. Avoid ventures requiring sustained follow-through. Unexpected separations or disruptions may arise in the areas governed by your ${house}th house.`
            },
            'jupiter-mercury': {
                type: 'benefic',
                name: 'Wisdom & Eloquence Transit',
                effect: `Jupiter and Mercury are aligned in ${sign}, creating one of the finest intellectual transits possible in your ${house}th house. Your thinking is broad, eloquent, and philosophically rich — the perfect time for writing, teaching, public speaking, studying, or legal matters. Big ideas land with authority and clarity. Travel for educational or spiritual purposes is favored. Share your knowledge — others are listening and benefiting greatly.`
            },
            'mercury-venus': {
                type: 'benefic',
                name: 'Creative & Commercial Grace',
                effect: `Mercury and Venus are dancing together in ${sign}, bringing charm, wit, and artistic flair to your ${house}th house. Communications are beautifully delivered — perfect for creative writing, presentations, negotiations, and social media. Commerce, beauty, and entertainment industries respond favorably. Relationships benefit from thoughtful, romantically expressive words. Make your pitch, sign the contract, or send the message you've been crafting.`
            },
            'mercury-saturn': {
                type: 'mixed',
                name: 'Methodical & Deep Thinking',
                effect: `Saturn is slowing and deepening Mercury's pace in ${sign}, shifting your ${house}th house energy toward careful, structured thought. Rushing decisions is especially ill-advised now — instead, take your time to research, plan, and analyze thoroughly. Communication may feel heavy or restricted; be precise and avoid ambiguity. Excellent for long-form writing, technical work, programming, and any project requiring concentrated, methodical intelligence.`
            },
            'mercury-rahu': {
                type: 'intense',
                name: 'Cunning & Unconventional Mind',
                effect: `Rahu is amplifying Mercury's signal in ${sign} to an unconventional frequency in your ${house}th house. Your mind races with out-of-the-box ideas, tech innovations, and clever strategies that others haven't considered. AI, digital media, rapid communication, and speculative ventures attract your focus. However, be vigilant about deception — both giving and receiving false information. Clarity in contracts and communications is essential.`
            },
            'ketu-mercury': {
                type: 'mixed',
                name: 'Intuitive Intelligence Transit',
                effect: `Ketu is pulling Mercury away from logical convention in ${sign}, activating your ${house}th house with flashes of intuitive genius rather than linear reasoning. Standard routes of learning feel dull; you're drawn to mystical, non-conventional, or esoteric knowledge. Excellent for astrology, spiritual studies, and discovering hidden patterns. Watch for miscommunications, forgotten details, or short-circuit thinking in practical day-to-day matters.`
            },
            'jupiter-venus': {
                type: 'benefic',
                name: 'Abundance & Beauty Transit',
                effect: `Jupiter and Venus are both showering your ${house}th house in ${sign} with grace, wealth, and pleasure. This is one of the most materially and emotionally rewarding transit combinations possible. Financial opportunities arise naturally; relationships feel generous and harmonious; artistic expression reaches its peak. Indulgence is the only risk — enjoy the abundance without over-spending or over-committing romantically in the heat of this expansive energy.`
            },
            'jupiter-saturn': {
                type: 'mixed',
                name: 'Slow-Build Opportunity Transit',
                effect: `Jupiter and Saturn are paired in ${sign}, creating a sober but significant activation of your ${house}th house. This transit marks a serious crossroads — the optimism to dream big (Jupiter) meets the discipline to build realistically (Saturn). Long-term commitments made now — career pivots, business foundations, serious relationships — are grounded and durable. Avoid gambling on shortcuts; the opportunity here rewards strategy and patience above all.`
            },
            'jupiter-rahu': {
                type: 'intense',
                name: 'Guru Chandal Transit',
                effect: `Rahu is amplifying and distorting Jupiter's wisdom in ${sign}, creating an unusual mixture of aspiration and illusion in your ${house}th house. Grand opportunities may appear with hidden risks attached. Spiritual or religious experiences can become extreme or unorthodox. Be cautious of false teachers, inflated beliefs, and over-ambitious schemes. However, this transit can also produce genuine breakthroughs in unconventional spirituality, innovation, and global-scale thinking.`
            },
            'jupiter-ketu': {
                type: 'benefic',
                name: 'Spiritual Insight Transit',
                effect: `Ketu is drawing Jupiter's wisdom inward in ${sign}, activating a deeply spiritual and introspective mode in your ${house}th house. Worldly ambition loses its appeal; the search for deeper meaning intensifies. Profound insights, philosophical breakthroughs, and a pull toward meditation, pilgrimage, or spiritual study are the hallmarks of this transit. Material goals in this house may feel hollow — redirect them toward legacy, purpose, and inner development.`
            },
            'saturn-venus': {
                type: 'mixed',
                name: 'Love Under Pressure Transit',
                effect: `Saturn is tempering Venus's warmth in ${sign}, creating a serious and restrained atmosphere in your ${house}th house. Relationships are tested for genuine commitment — casual connections fade, while solid bonds deepen. Financial pleasures are curbed by budget realities. This transit rewards loyalty, discipline in creative work, and investment in long-term relationships over fleeting gratification. Art and romance require effort, but what emerges is lasting and meaningful.`
            },
            'rahu-venus': {
                type: 'intense',
                name: 'Obsessive Desire Transit',
                effect: `Rahu is amplifying Venus in ${sign} to extremes in your ${house}th house — desire becomes insatiable, glamour is magnetic, and attractions feel fated. You may be drawn to unconventional or taboo relationships, luxurious excess, or bold creative experiments. Media, fashion, and entertainment opportunities arise. But beware: Rahu distorts Venus's judgment — what glitters may not be gold. Avoid impulsive romantic commitments or extravagant financial decisions now.`
            },
            'ketu-venus': {
                type: 'challenging',
                name: 'Karmic Love Transit',
                effect: `Ketu is dissolving Venus's pleasure-seeking in ${sign}, creating a sense of quiet dissatisfaction with material pleasures and earthly romance in your ${house}th house. Relationships may feel karmically familiar yet emotionally distant. What once gave joy — possessions, beauty, intimacy — now feels strangely unfulfilling. This is a transit for releasing attachments, clearing past romantic karma, and cultivating a more spiritual or unconditional form of love.`
            },
            'rahu-saturn': {
                type: 'challenging',
                name: 'Heavy Karma Transit',
                effect: `Saturn and Rahu are forming one of astrology's most karmic pairings in ${sign}, pressing hard on your ${house}th house. Delays, frustrations, and a suffocating sense of being trapped in circumstances beyond your control are common themes. This is a period of serious karmic clearing — unresolved past-life debts surface to be paid. Stay grounded, avoid illegal or unethical shortcuts, and know that the pressure you face right now is purifying your trajectory long-term.`
            },
            'ketu-saturn': {
                type: 'challenging',
                name: 'Ascetic Discipline Transit',
                effect: `Saturn and Ketu together in ${sign} are draining energy and motivation from your ${house}th house. A deep indifference to conventional worldly success replaces normal ambition. You may feel compelled to simplify, detach, or withdraw from the usual expectations of this house's themes. This is a powerful signal to do inner work — eliminate what is non-essential, master a specialized discipline, and prepare for a transformed sense of purpose post-transit.`
            },
            'mercury-moon': {
                type: 'benefic',
                name: 'Mind & Emotion United',
                effect: `Mercury and Moon are traveling together in ${sign}, merging analytical thinking with emotional sensitivity in your ${house}th house. Your words carry genuine feeling, and your decisions are both smart and intuitive. Excellent for counseling, writing, studying, or having important heart-to-heart conversations. Thoughts may fluctuate rapidly — journal or document ideas before they slip away. Emotional intelligence is at a seasonal high.`
            }
        };

        const result = pairDB[pair] || {
            type: 'mixed',
            name: `${cap(p1)} + ${cap(p2)} in ${sign}`,
            effect: `${cap(p1)} and ${cap(p2)} are transiting conjunct in ${sign}, jointly activating your ${house}th house of ${houseThemes[house] || 'life'}. The natures of these two planets blend and compete — watch how their combined symbolism plays out concretely in the themes of this house over the coming weeks.`
        };

        return {
            name: result.name,
            type: result.type,
            effect: result.effect,
            domains: houseThemes[house] || 'General themes'
        };
    }
}

