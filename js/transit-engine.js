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
        const benefics = ['jupiter', 'venus', 'moon', 'mercury'];
        const isBenefic1 = benefics.includes(p1), isBenefic2 = benefics.includes(p2);
        const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

        let type = 'mixed';
        if (isBenefic1 && isBenefic2) type = 'benefic';
        if (!isBenefic1 && !isBenefic2) type = 'challenging';
        if (p1 === 'rahu' || p2 === 'rahu' || p1 === 'ketu' || p2 === 'ketu') type = 'intense';

        const houseThemes = {
            1: 'self', 2: 'wealth', 3: 'communication', 4: 'home', 5: 'creativity',
            6: 'service', 7: 'relationships', 8: 'transformation', 9: 'fortune',
            10: 'career', 11: 'gains', 12: 'spirituality'
        };

        return {
            name: `Transit ${cap(p1)} + ${cap(p2)} in ${sign}`,
            type,
            effect: `${cap(p1)} and ${cap(p2)} are transiting together through ${sign} in your ${house}th house (${houseThemes[house] || 'life'}). Their combined energy is currently activating this area — watch for themes from both planets to emerge simultaneously over the coming weeks.`,
            domains: houseThemes[house] || 'General themes'
        };
    }
}
