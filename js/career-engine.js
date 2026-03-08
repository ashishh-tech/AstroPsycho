/**
 * Brighu Nadi Ultra Pro Career Prediction Engine
 * Combines: Saturn Analysis, D-10 Dashamsha, Jaimini Karakas,
 * Yogakaraka, Career Strength Score, Sade Sati, Dasha Timing
 */

class BrighuCareerEngine {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();
        this.birthChart = null;
        this.careerData = null;
        this.userData = null;

        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.signSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
        this.planetSymbols = { sun: '☀️', moon: '🌙', mars: '♂️', mercury: '☿', jupiter: '♃', venus: '♀', saturn: '♄', rahu: '☊', ketu: '☋' };
        this.planetNames = { sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu' };

        this.nakshatraNames = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
            'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];

        this.lordMap = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];

        this.careerScore = { total: 0, breakdown: [] };
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

        // Load career data JSON — use XHR so it works on file:// without CORS errors
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'data/brighu-career-data.json', false); // synchronous
            xhr.send();
            if (xhr.status === 200 || xhr.status === 0) { // status 0 = file:// success
                this.careerData = JSON.parse(xhr.responseText);
            } else {
                throw new Error('XHR status: ' + xhr.status);
            }
        } catch (e) {
            console.warn('Career data load failed, using fallback:', e.message);
            this.careerData = this._getFallbackData();
        }

        return true;
    }

    loadUserData() {
        // Assessment saves: { responses, birthDetails: { fullName, birthDate, birthTime, birthPlace, latitude, longitude, timezone, gender }, timestamp }
        const raw = localStorage.getItem('astropsycho_assessment');
        if (!raw) return null;

        try {
            const stored = JSON.parse(raw);
            // Data is nested under birthDetails
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
                gender: bd.gender || '',
                answers: stored.responses || {}
            };
        } catch (e) {
            console.error('Failed to parse astropsycho_assessment:', e);
            return null;
        }
    }

    showNoDataError() {
        document.getElementById('careerPageContent').style.display = 'none';
        document.getElementById('noDataMessage').style.display = 'block';
    }

    // ─── CORE DATA METHODS ───────────────────────────────────────────────────

    getSaturnData() {
        const { planets, ascendant } = this.birthChart;
        const satPos = planets.saturn;
        const signIndex = Math.floor(satPos / 30);
        const degree = satPos % 30;
        const house = this.getHouseNumber(satPos, ascendant);

        // Nakshatra
        const nakIndex = Math.floor(satPos / (360 / 27));
        const nakName = this.nakshatraNames[nakIndex];
        const nakLord = this.astrologyEngine.nakshatras[nakIndex]?.lord || '—';

        // Strength
        const shadbala = this.birthChart.shadbala?.saturn;
        const strengthPct = shadbala ? Math.round((shadbala.totalRupas / shadbala.requiredStrength) * 100) : 50;

        // Status (exalted/debilitated/own)
        let status = 'Neutral';
        if (signIndex === 6) status = 'Exalted 🌟'; // Libra
        else if (signIndex === 0) status = 'Debilitated ⚠️'; // Aries
        else if (signIndex === 9 || signIndex === 10) status = 'Own Sign 💪';

        return {
            longitude: satPos, signIndex, degree: degree.toFixed(2),
            sign: this.signs[signIndex], signSymbol: this.signSymbols[signIndex],
            house, nakshatra: nakName, nakshatraLord: nakLord,
            strength: Math.min(strengthPct, 100), status,
            signData: this.careerData.saturn_in_signs[String(signIndex)],
            houseData: this.careerData.saturn_in_houses[String(house)]
        };
    }

    getSaturnTrinePlanets() {
        const { planets, ascendant } = this.birthChart;
        const satHouse = this.getHouseNumber(planets.saturn, ascendant);
        const trineHouses = [
            ((satHouse + 3) % 12) + 1,  // 4th from Saturn = NOT trine; 5th from Saturn
            ((satHouse + 7) % 12) + 1   // 9th from Saturn
        ];
        // Actually 5th and 9th from Saturn's house
        const h5 = ((satHouse - 1 + 4) % 12) + 1;
        const h9 = ((satHouse - 1 + 8) % 12) + 1;

        const result = { h5: [], h9: [] };
        for (const [planet, pos] of Object.entries(planets)) {
            if (planet === 'velocities') continue;
            const h = this.getHouseNumber(pos, ascendant);
            if (h === h5) result.h5.push(planet);
            if (h === h9) result.h9.push(planet);
        }
        result.trineHouses = [h5, h9];
        return result;
    }

    getSaturnKendraPlanets() {
        const { planets, ascendant } = this.birthChart;
        const satHouse = this.getHouseNumber(planets.saturn, ascendant);
        // Kendras from Saturn: Saturn's own house (1st), 4th, 7th, 10th
        const h1 = satHouse;
        const h4 = ((satHouse - 1 + 3) % 12) + 1;
        const h7 = ((satHouse - 1 + 6) % 12) + 1;
        const h10 = ((satHouse - 1 + 9) % 12) + 1;
        const kendraHouses = { h1, h4, h7, h10 };

        const result = { h1: [], h4: [], h7: [], h10: [], kendraHouses };
        for (const [planet, pos] of Object.entries(planets)) {
            if (planet === 'velocities' || planet === 'saturn') continue;
            const h = this.getHouseNumber(pos, ascendant);
            if (h === h1) result.h1.push(planet);
            if (h === h4) result.h4.push(planet);
            if (h === h7) result.h7.push(planet);
            if (h === h10) result.h10.push(planet);
        }
        return result;
    }

    getPlanetsAroundSaturn() {
        const { planets } = this.birthChart;
        const satPos = planets.saturn;
        const satSign = Math.floor(satPos / 30);

        const prevSign = (satSign + 11) % 12;
        const nextSign = (satSign + 1) % 12;

        const before = [], after = [], conjunct = [];
        for (const [planet, pos] of Object.entries(planets)) {
            if (planet === 'velocities' || planet === 'saturn') continue;
            const sign = Math.floor(pos / 30);
            if (sign === prevSign) before.push(planet);
            if (sign === nextSign) after.push(planet);
            if (sign === satSign) conjunct.push(planet);
        }
        return { before, conjunct, after, satSign };
    }

    get10thHouseAnalysis() {
        const { planets, ascendant } = this.birthChart;
        const ascSign = Math.floor(ascendant / 30);
        const tenthSign = (ascSign + 9) % 12;
        const tenthLord = this.lordMap[tenthSign];
        const tenthLordSign = Math.floor(planets[tenthLord] / 30);
        const tenthLordHouse = this.getHouseNumber(planets[tenthLord], ascendant);

        const planetsIn10th = [];
        for (const [planet, pos] of Object.entries(planets)) {
            if (planet === 'velocities') continue;
            if (this.getHouseNumber(pos, ascendant) === 10) planetsIn10th.push(planet);
        }

        return {
            tenthSign, tenthSignName: this.signs[tenthSign],
            tenthLord, tenthLordSign, tenthLordSignName: this.signs[tenthLordSign],
            tenthLordHouse, planetsIn10th,
            lordData: this.careerData.tenth_house_lord_careers[tenthLord]
        };
    }

    // ─── PRO LEVEL SIGNALS ───────────────────────────────────────────────────



    getD10CareerSign() {
        const { ascendant } = this.birthChart;
        const d10AscSign = this.calculateD10Sign(ascendant);
        const data = this.careerData.d10_sign_careers[String(d10AscSign)];
        return { d10SignIndex: d10AscSign, d10Sign: this.signs[d10AscSign], data };
    }

    calculateD10Sign(longitude) {
        const sign = Math.floor(longitude / 30);
        const deg = longitude % 30;
        const division = Math.floor(deg / 3);

        // Standard D-10 Rule: 
        // Odd signs start from the sign itself.
        // Even signs start from 9th house from the sign.
        const startSign = (sign % 2 === 0) ? sign : (sign + 8) % 12;
        return (startSign + division) % 12;
    }

    calculateJaiminiKarakas() {
        const { planets } = this.birthChart;
        const planetList = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

        // Get degrees within sign for each planet
        const degrees = planetList.map(p => ({
            planet: p,
            degree: planets[p] % 30
        })).sort((a, b) => b.degree - a.degree); // Sort by degree descending

        const atmakaraka = degrees[0];
        const amatyakaraka = degrees[1];

        return {
            atmakaraka: { planet: atmakaraka.planet, degree: atmakaraka.degree.toFixed(2) },
            amatyakaraka: { planet: amatyakaraka.planet, degree: amatyakaraka.degree.toFixed(2) },
            akData: this.careerData.atmakaraka_career[atmakaraka.planet],
            amkData: this.careerData.amatyakaraka_career[amatyakaraka.planet]
        };
    }

    getYogakaraka() {
        const { ascendant } = this.birthChart;
        const lagnaSign = Math.floor(ascendant / 30);
        const data = this.careerData.yogakaraka_by_lagna[String(lagnaSign)];
        if (!data) return null;

        const ykPlanet = data.yogakaraka;
        const ykPos = this.birthChart.planets[ykPlanet];
        const ykSign = Math.floor(ykPos / 30);
        const ykHouse = this.getHouseNumber(ykPos, ascendant);
        const isStrong = this.birthChart.shadbala?.[ykPlanet]?.isStrong;

        return { ...data, planet: ykPlanet, sign: this.signs[ykSign], house: ykHouse, isStrong };
    }

    calculateCareerStrengthScore() {
        const satData = this.getSaturnData();
        const d10Data = this.getD10CareerSign();
        const karakas = this.calculateJaiminiKarakas();
        const yogakaraka = this.getYogakaraka();
        const tenth = this.get10thHouseAnalysis();

        const factors = [];
        let total = 0;

        // 1. Saturn strength (20 pts)
        const satScore = Math.round(satData.strength * 0.20);
        factors.push({ label: 'Saturn Shadbala Strength', score: satScore, max: 20 });
        total += satScore;

        // 2. Saturn house quality (15 pts)
        const houseScores = { 1: 10, 2: 8, 3: 7, 4: 9, 5: 11, 6: 12, 7: 10, 8: 9, 9: 13, 10: 15, 11: 12, 12: 7 };
        const satHouseScore = houseScores[satData.house] || 10;
        factors.push({ label: `Saturn in ${satData.house}th House`, score: satHouseScore, max: 15 });
        total += satHouseScore;

        // 3. Saturn sign quality (15 pts)
        let satSignScore = 8;
        if (satData.status.includes('Exalted')) satSignScore = 15;
        else if (satData.status.includes('Own Sign')) satSignScore = 13;
        else if (satData.status.includes('Debilitated')) satSignScore = 3;
        factors.push({ label: `Saturn in ${satData.sign} (${satData.status})`, score: satSignScore, max: 15 });
        total += satSignScore;

        // 4. 10th house lord strength (15 pts)
        const tenthLordShadbala = this.birthChart.shadbala?.[tenth.tenthLord];
        const tenthScore = tenthLordShadbala?.isStrong ? 15 : (tenthLordShadbala ? 8 : 5);
        factors.push({ label: `10th Lord (${this.planetNames[tenth.tenthLord]}) Strength`, score: tenthScore, max: 15 });
        total += tenthScore;

        // 5. Planets in 10th house (10 pts)
        const beneficsIn10th = tenth.planetsIn10th.filter(p => ['jupiter', 'venus', 'mercury'].includes(p)).length;
        const maleficsIn10th = tenth.planetsIn10th.filter(p => ['saturn', 'mars', 'rahu', 'ketu'].includes(p)).length;
        const tenthPlanetScore = Math.min(10, (beneficsIn10th * 4) - (maleficsIn10th * 2) + 5);
        factors.push({ label: `Planets in 10th House (${tenth.planetsIn10th.length || 'none'})`, score: Math.max(0, tenthPlanetScore), max: 10 });
        total += Math.max(0, tenthPlanetScore);

        // 6. Yogakaraka strength (10 pts)
        const ykScore = yogakaraka ? (yogakaraka.isStrong ? 10 : 6) : 3;
        factors.push({ label: `Yogakaraka (${yogakaraka ? this.planetNames[yogakaraka.planet] : 'None'})`, score: ykScore, max: 10 });
        total += ykScore;

        // 7. Amatyakaraka (5 pts)
        const amkStrong = this.birthChart.shadbala?.[karakas.amatyakaraka.planet]?.isStrong;
        const amkScore = amkStrong ? 5 : 3;
        factors.push({ label: `Amatyakaraka (${this.planetNames[karakas.amatyakaraka.planet]})`, score: amkScore, max: 5 });
        total += amkScore;

        // 8. D-10 assessment (10 pts) — baseline 6 if data exists
        const d10Score = d10Data.data ? 8 : 4;
        factors.push({ label: `D-10 (Dashamsha) Career Sign: ${d10Data.d10Sign}`, score: d10Score, max: 10 });
        total += d10Score;

        const clampedTotal = Math.min(100, Math.max(10, total));
        let grade = 'C';
        if (clampedTotal >= 85) grade = 'A+';
        else if (clampedTotal >= 75) grade = 'A';
        else if (clampedTotal >= 65) grade = 'B+';
        else if (clampedTotal >= 55) grade = 'B';
        else if (clampedTotal >= 45) grade = 'C+';

        return { total: clampedTotal, grade, factors };
    }

    checkSadeSati() {
        const { planets } = this.birthChart;
        const moonSign = Math.floor(planets.moon / 30);
        const now = new Date();
        const t = (this.julianDate(now) - 2451545.0) / 36525.0;
        // Approximate current Saturn sidereal position
        const saturnCurrentApprox = this.astrologyEngine.calculatePrecisePlanets(t, this.astrologyEngine.calculatePreciseAyanamsa(t)).saturn;
        const currentSatSign = Math.floor(saturnCurrentApprox / 30);

        const phase1 = (moonSign + 11) % 12; // 12th from Moon
        const phase2 = moonSign;             // Moon's own sign
        const phase3 = (moonSign + 1) % 12;  // 2nd from Moon

        let phase = null;
        if (currentSatSign === phase1) phase = 'phase_1';
        else if (currentSatSign === phase2) phase = 'phase_2';
        else if (currentSatSign === phase3) phase = 'phase_3';

        const key = phase || 'not_in_sade_sati';
        return {
            inSadeSati: !!phase, phase, key,
            currentSaturnSign: this.signs[currentSatSign],
            moonSign: this.signs[moonSign],
            data: this.careerData.sade_sati_career_impact[key]
        };
    }

    julianDate(date) {
        let y = date.getFullYear(), m = date.getMonth() + 1;
        const d = date.getDate() + (date.getHours() + date.getMinutes() / 60) / 24;
        if (m <= 2) { y -= 1; m += 12; }
        const a = Math.floor(y / 100), b = 2 - a + Math.floor(a / 4);
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
    }

    buildCareerProfile() {
        const satData = this.getSaturnData();
        const karakas = this.calculateJaiminiKarakas();
        const tenth = this.get10thHouseAnalysis();
        const d10 = this.getD10CareerSign();
        const yogakaraka = this.getYogakaraka();
        const brighuAround = this.getPlanetsAroundSaturn();

        // Aggregate professions from all signals with weighted scoring
        const professionScores = {};

        const addProfessions = (list, weight, source) => {
            if (!list) return;
            list.forEach(prof => {
                if (!professionScores[prof]) professionScores[prof] = { score: 0, sources: [] };
                professionScores[prof].score += weight;
                professionScores[prof].sources.push(source);
            });
        };

        // Saturn in sign professions (weight 3)
        addProfessions(satData.signData?.themes?.map(t => this.themeLabel(t)), 3, `Saturn in ${satData.sign}`);

        // Saturn in house professions (weight 4 — most specific)
        addProfessions(satData.houseData?.top_professions, 4, `Saturn in ${satData.house}th House`);

        // 10th lord professions (weight 4)
        addProfessions(tenth.lordData?.professions, 4, `10th Lord (${this.planetNames[tenth.tenthLord]})`);

        // D-10 career professions (weight 3)
        addProfessions(d10.data?.professions, 3, `D-10 (${d10.d10Sign})`);

        // Atmakaraka professions (weight 2)
        addProfessions(karakas.akData?.ideal_work, 2, `Atmakaraka (${this.planetNames[karakas.atmakaraka.planet]})`);

        // Amatyakaraka professions (weight 3)
        addProfessions(karakas.amkData?.boost_fields?.map(f => this.themeLabel(f)), 3, `Amatyakaraka (${this.planetNames[karakas.amatyakaraka.planet]})`);

        // Yogakaraka planet themes (weight 2)
        if (yogakaraka) {
            const ykThemes = this.careerData.planet_career_themes[yogakaraka.planet];
            addProfessions(ykThemes?.career_fields?.map(f => this.themeLabel(f)), 2, `Yogakaraka (${this.planetNames[yogakaraka.planet]})`);
        }

        // Adjacent planets in Brighu style (weight 2)
        [...brighuAround.before, ...brighuAround.after, ...brighuAround.conjunct].forEach(p => {
            const themes = this.careerData.planet_career_themes[p];
            addProfessions(themes?.career_fields?.map(f => this.themeLabel(f)), 2, `${this.planetNames[p]} near Saturn`);
        });

        // Sort by score
        const sorted = Object.entries(professionScores)
            .map(([name, val]) => ({ name, score: val.score, sources: val.sources }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);

        // Normalize to confidence percentage
        const maxScore = sorted[0]?.score || 1;
        return sorted.map((p, i) => ({
            rank: i + 1,
            name: p.name,
            confidence: Math.round((p.score / maxScore) * 100),
            sources: [...new Set(p.sources)],
            icon: this.professionIcon(p.name)
        }));
    }

    themeLabel(theme) {
        const map = {
            'IT': 'Software / IT', 'government': 'Government Service', 'military': 'Military / Defence',
            'engineering': 'Engineering', 'law': 'Law / Legal', 'medicine': 'Medicine / Healthcare',
            'finance': 'Finance / Banking', 'teaching': 'Teaching / Education', 'research': 'Research / Science',
            'writing': 'Writing / Journalism', 'arts': 'Arts / Creative', 'business': 'Business / Entrepreneurship',
            'real_estate': 'Real Estate', 'spirituality': 'Spirituality / Yoga', 'technology': 'Technology / Software',
            'agriculture': 'Agriculture / Farming', 'foreign_work': 'Foreign / International Work',
            'politics': 'Politics / Public Service', 'social_work': 'Social Work / NGO',
            'management': 'Management / Corporate', 'media': 'Media / Entertainment',
            'consulting': 'Consulting', 'accounting': 'Accounting / CA', 'food_industry': 'Food / Hospitality',
            'luxury_goods': 'Luxury / Fashion', 'occult': 'Occult / Astrology', 'psychology': 'Psychology / Counselling',
            'mining': 'Mining / Natural Resources', 'property': 'Property / Construction',
            'investment': 'Investment / Stock Market', 'charity': 'Charity / Social Work'
        };
        return map[theme] || theme.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    professionIcon(name) {
        const n = name.toLowerCase();
        if (n.includes('software') || n.includes('it') || n.includes('tech')) return '💻';
        if (n.includes('government') || n.includes('ias') || n.includes('public')) return '🏛️';
        if (n.includes('military') || n.includes('defence') || n.includes('police')) return '⚔️';
        if (n.includes('engineer')) return '⚙️';
        if (n.includes('law') || n.includes('legal') || n.includes('judge')) return '⚖️';
        if (n.includes('medicine') || n.includes('doctor') || n.includes('health')) return '🏥';
        if (n.includes('finance') || n.includes('bank') || n.includes('account')) return '💰';
        if (n.includes('teach') || n.includes('education') || n.includes('professor')) return '🎓';
        if (n.includes('research') || n.includes('science') || n.includes('data')) return '🔬';
        if (n.includes('writing') || n.includes('journal') || n.includes('media')) return '✍️';
        if (n.includes('art') || n.includes('creat') || n.includes('design')) return '🎨';
        if (n.includes('business') || n.includes('entrepreneur')) return '🏢';
        if (n.includes('real estate') || n.includes('property') || n.includes('construct')) return '🏗️';
        if (n.includes('spirit') || n.includes('yoga') || n.includes('occult')) return '🕉️';
        if (n.includes('foreign') || n.includes('international')) return '🌍';
        if (n.includes('social') || n.includes('ngo') || n.includes('charity')) return '🤝';
        if (n.includes('food') || n.includes('hospitality')) return '🍽️';
        if (n.includes('mining') || n.includes('natural')) return '⛏️';
        if (n.includes('consult')) return '📋';
        if (n.includes('invest') || n.includes('stock')) return '📈';
        return '🌟';
    }

    getCareerTimeline() {
        const dashas = this.birthChart.dashas;
        if (!dashas) return [];

        const timeline = [];
        const now = new Date();

        // Get mahadasha periods - handle various structure possibilities
        const mahadashas = dashas.allDashas || dashas.mahadasha || (Array.isArray(dashas) ? dashas : []);
        let currentMaha = null;

        if (Array.isArray(mahadashas) && mahadashas.length > 0) {
            mahadashas.forEach(dasha => {
                const start = new Date(dasha.startDate || dasha.start);
                const end = new Date(dasha.endDate || dasha.end);
                const planetKey = (dasha.planet || dasha.lord || '').toLowerCase();
                const careerInfo = this.careerData.dasha_career_timing[planetKey];
                if (!careerInfo) return;

                const isCurrent = start <= now && now <= end;
                if (isCurrent) currentMaha = dasha;

                timeline.push({
                    type: 'mahadasha', planet: planetKey,
                    planetName: this.planetNames[planetKey] || planetKey,
                    start, end,
                    duration: careerInfo.duration_years,
                    phase: careerInfo.career_phase,
                    action: careerInfo.career_action,
                    bestFor: careerInfo.best_for,
                    avoid: careerInfo.avoid,
                    isCurrent,
                    isPast: end < now,
                    isFuture: start > now
                });
            });
        }

        return timeline.slice(0, 9); // Show max 9 periods
    }

    // ─── UTILITY ─────────────────────────────────────────────────────────────

    getHouseNumber(planetPos, ascendant) {
        // Whole Sign House System (Vedic Standard)
        const planetSign = Math.floor(planetPos / 30);
        const ascSign = Math.floor(ascendant / 30);
        return ((planetSign - ascSign + 12) % 12) + 1;
    }

    // ─── RENDERING ───────────────────────────────────────────────────────────

    renderAll() {
        try {
            const satData = this.getSaturnData();
            const trinePlanets = this.getSaturnTrinePlanets();
            const kendraPlanets = this.getSaturnKendraPlanets();
            const brighuAround = this.getPlanetsAroundSaturn();
            const tenth = this.get10thHouseAnalysis();
            const d10 = this.getD10CareerSign();
            const karakas = this.calculateJaiminiKarakas();
            const yogakaraka = this.getYogakaraka();
            const strengthScore = this.calculateCareerStrengthScore();
            const sadeSati = this.checkSadeSati();
            const professions = this.buildCareerProfile();
            const timeline = this.getCareerTimeline();

            this.renderSaturnCard(satData);
            this.renderBrighuGrid(trinePlanets, kendraPlanets, brighuAround, satData);
            this.renderD10Analysis(d10);
            this.renderJaiminiKarakas(karakas);
            this.renderYogakaraka(yogakaraka);
            this.renderCareerStrengthMeter(strengthScore);
            this.renderSadeSatiImpact(sadeSati);
            this.renderCareerRecommendations(professions);
            this.renderCareerTimeline(timeline);

            // Sub-systems with separate error boundaries
            try { this.renderSubDashaAnalysis(); } catch (e) { console.error('Sub-Dasha Error:', e); }
            try { this.renderCareerRemedies(); } catch (e) { console.error('Remedies Error:', e); }
            try { this.renderPersonInfo(); } catch (e) { console.error('Person Info Error:', e); }
        } catch (e) {
            console.error('Render All Error:', e);
            document.body.innerHTML += `<div style="color:red;padding:2rem;">Rendering Error: ${e.message}</div>`;
        }
    }

    renderPersonInfo() {
        const el = document.getElementById('personName');
        if (el && this.userData) {
            const name = this.userData.fullName || this.userData.birthPlace || 'Your';
            el.textContent = `${name}'s Career Report`;
        }
    }

    renderSaturnCard(sat) {
        const el = document.getElementById('saturnCard');
        if (!el) return;
        el.innerHTML = `
        <div class="saturn-grid">
            <div class="saturn-main-info">
                <div class="saturn-symbol">♄</div>
                <div class="saturn-details">
                    <div class="sat-sign">${sat.signSymbol} ${sat.sign}</div>
                    <div class="sat-degree">${sat.degree}° | ${sat.nakshatra} Nakshatra</div>
                    <div class="sat-house">House ${sat.house} — ${sat.houseData?.domain || ''}</div>
                    <div class="sat-status">${sat.status}</div>
                </div>
            </div>
            <div class="saturn-strength-meter">
                <div class="strength-label">Saturn Strength</div>
                <div class="strength-bar-outer">
                    <div class="strength-bar-inner" style="width:${sat.strength}%" data-strength="${sat.strength}"></div>
                </div>
                <div class="strength-value">${sat.strength}%</div>
            </div>
        </div>
        <div class="saturn-career-summary">
            <div class="sat-summary-item">
                <span class="label">Career Style:</span>
                <span>${sat.signData?.career_style || '—'}</span>
            </div>
            <div class="sat-summary-item">
                <span class="label">Career Domain:</span>
                <span>${sat.houseData?.description || '—'}</span>
            </div>
            <div class="sat-summary-item">
                <span class="label">Timing:</span>
                <span>${sat.houseData?.timing || sat.signData?.note || '—'}</span>
            </div>
        </div>
        <div class="sat-top-professions">
            ${(sat.houseData?.top_professions || []).map(p => `<span class="sat-prof-tag">${p}</span>`).join('')}
        </div>`;
    }

    renderBrighuGrid(trine, kendra, around, sat) {
        const el = document.getElementById('brighuGrid');
        if (!el) return;

        const planetBadge = (p, label) => `
            <div class="brighu-planet-badge">
                <span class="bp-emoji">${this.planetSymbols[p] || '⭐'}</span>
                <span class="bp-name">${this.planetNames[p] || p}</span>
                <span class="bp-label">${label}</span>
            </div>`;

        const renderGroup = (planets, label, icon, house) => {
            if (!planets || planets.length === 0)
                return `<div class="brighu-group empty"><div class="bg-header">${icon} ${label}<span class="bg-house">H${house}</span></div><span class="bg-empty">No planet here</span></div>`;
            return `<div class="brighu-group"><div class="bg-header">${icon} ${label}<span class="bg-house">H${house}</span></div>${planets.map(p => planetBadge(p, this.careerData.planet_career_themes[p]?.keyword || '')).join('')}</div>`;
        };

        el.innerHTML = `
        <div class="brighu-section-title">🔮 Brighu Nadi Planetary Grid</div>
        <div class="brighu-row">
            <div class="brighu-col trine">
                <div class="brighu-col-title">🔺 Trine from Saturn (5th & 9th)</div>
                <div class="brighu-col-subtitle">Natural Talent & Past-Life Karma</div>
                ${renderGroup(trine.h5, '5th from Saturn', '🎯', trine.trineHouses[0])}
                ${renderGroup(trine.h9, '9th from Saturn', '🌟', trine.trineHouses[1])}
            </div>
            <div class="brighu-col kendra">
                <div class="brighu-col-title">⬛ Kendra from Saturn</div>
                <div class="brighu-col-subtitle">Career Support Pillars</div>
                ${renderGroup(kendra.h4, '4th from Saturn', '🏠', kendra.kendraHouses.h4)}
                ${renderGroup(kendra.h7, '7th from Saturn', '🤝', kendra.kendraHouses.h7)}
                ${renderGroup(kendra.h10, '10th from Saturn', '👑', kendra.kendraHouses.h10)}
            </div>
            <div class="brighu-col adjacent">
                <div class="brighu-col-title">🌊 Adjacent to Saturn</div>
                <div class="brighu-col-subtitle">Career Initiation & Peak Timing</div>
                ${renderGroup(around.before, `Sign Before (${this.signs[(sat.signIndex + 11) % 12]})`, '⬅️', '')}
                ${renderGroup(around.conjunct, `With Saturn (${this.signs[sat.signIndex]})`, '🪐', '')}
                ${renderGroup(around.after, `Sign After (${this.signs[(sat.signIndex + 1) % 12]})`, '➡️', '')}
            </div>
        </div>`;
    }

    renderD10Analysis(d10) {
        const el = document.getElementById('d10Card');
        if (!el || !d10.data) return;
        el.innerHTML = `
        <div class="d10-content">
            <div class="d10-header">
                <div class="d10-symbol">📊</div>
                <div>
                    <div class="d10-sign">${this.signSymbols[d10.d10SignIndex]} ${d10.d10Sign}</div>
                    <div class="d10-theme">${d10.data.theme}</div>
                </div>
            </div>
            <div class="d10-professions">
                ${d10.data.professions.map(p => `<span class="d10-prof">${p}</span>`).join('')}
            </div>
        </div>`;
    }

    renderJaiminiKarakas(karakas) {
        const el = document.getElementById('jaiminiCard');
        if (!el) return;
        const { atmakaraka: ak, amatyakaraka: amk, akData, amkData } = karakas;
        el.innerHTML = `
        <div class="karaka-pair">
            <div class="karaka-card ak-card">
                <div class="karaka-title">🔱 Atmakaraka — Soul Purpose</div>
                <div class="karaka-planet">${this.planetSymbols[ak.planet]} ${this.planetNames[ak.planet]} (${ak.degree}°)</div>
                <div class="karaka-purpose">${akData?.soul_purpose || ''}</div>
                <div class="karaka-calling">${akData?.career_calling || ''}</div>
                <div class="karaka-jobs">${(akData?.ideal_work || []).map(j => `<span class="kj-tag">${j}</span>`).join('')}</div>
            </div>
            <div class="karaka-card amk-card">
                <div class="karaka-title">💼 Amatyakaraka — Career Minister</div>
                <div class="karaka-planet">${this.planetSymbols[amk.planet]} ${this.planetNames[amk.planet]} (${amk.degree}°)</div>
                <div class="karaka-purpose">${amkData?.career_minister || ''}</div>
                <div class="karaka-calling">${amkData?.insight || ''}</div>
                <div class="karaka-jobs">${(amkData?.boost_fields || []).map(j => `<span class="kj-tag">${j}</span>`).join('')}</div>
            </div>
        </div>`;
    }

    renderYogakaraka(yk) {
        const el = document.getElementById('yogakarakaCard');
        if (!el) return;
        if (!yk) { el.innerHTML = `<div class="yk-none">No single Yogakaraka for your Lagna — multiple planets support career.</div>`; return; }
        el.innerHTML = `
        <div class="yk-content">
            <div class="yk-badge ${yk.isStrong ? 'strong' : 'weak'}">
                <div class="yk-symbol">${this.planetSymbols[yk.planet]}</div>
                <div class="yk-name">${this.planetNames[yk.planet]}</div>
                <div class="yk-power">${yk.isStrong ? '⚡ Strong' : '⚠️ Needs Strengthening'}</div>
            </div>
            <div class="yk-details">
                <div class="yk-lagna">${yk.lagna} Lagna</div>
                <div class="yk-reason">${yk.reason}</div>
                <div class="yk-gift">🎁 <strong>Career Gift:</strong> ${yk.career_gift}</div>
                <div class="yk-position">Placed in <strong>${yk.sign}</strong> (House ${yk.house})</div>
            </div>
        </div>`;
    }

    renderCareerStrengthMeter(score) {
        const el = document.getElementById('careerStrengthMeter');
        if (!el) return;

        const color = score.total >= 75 ? '#22c55e' : score.total >= 55 ? '#f59e0b' : '#ef4444';
        const gradeColor = score.total >= 75 ? '#22c55e' : score.total >= 55 ? '#f59e0b' : '#ef4444';

        el.innerHTML = `
        <div class="strength-meter-container">
            <div class="strength-gauge-wrap">
                <svg viewBox="0 0 200 120" class="gauge-svg">
                    <path d="M 20 110 A 90 90 0 0 1 180 110" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="18" stroke-linecap="round"/>
                    <path d="M 20 110 A 90 90 0 0 1 180 110" fill="none" stroke="${color}" stroke-width="18" stroke-linecap="round"
                          stroke-dasharray="${score.total * 2.827} 282.7" class="gauge-arc" style="transition: stroke-dasharray 1.5s ease;"/>
                    <text x="100" y="95" text-anchor="middle" fill="white" font-size="32" font-weight="bold" class="gauge-number">${score.total}</text>
                    <text x="100" y="112" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="11">/ 100</text>
                </svg>
                <div class="gauge-grade" style="color:${gradeColor}">Grade: ${score.grade}</div>
            </div>
            <div class="strength-factors">
                ${score.factors.map(f => `
                    <div class="sf-row">
                        <span class="sf-label">${f.label}</span>
                        <div class="sf-bar-wrap">
                            <div class="sf-bar" style="width:${(f.score / f.max) * 100}%;background:${f.score / f.max > 0.7 ? '#22c55e' : f.score / f.max > 0.4 ? '#f59e0b' : '#ef4444'}"></div>
                        </div>
                        <span class="sf-score">${f.score}/${f.max}</span>
                    </div>`).join('')}
            </div>
        </div>`;
    }

    renderSadeSatiImpact(ss) {
        const el = document.getElementById('sadeSatiCard');
        if (!el) return;
        const phaseColors = { phase_1: '#f59e0b', phase_2: '#ef4444', phase_3: '#22c55e', not_in_sade_sati: '#6366f1' };
        const color = phaseColors[ss.key] || '#6366f1';

        el.innerHTML = `
        <div class="ss-content">
            <div class="ss-status" style="border-left:4px solid ${color}">
                <div class="ss-phase-name" style="color:${color}">${ss.data?.name || 'Not in Sade Sati'}</div>
                <div class="ss-signs">Saturn in <strong>${ss.currentSaturnSign}</strong> | Moon in <strong>${ss.moonSign}</strong></div>
                <div class="ss-badge ${ss.inSadeSati ? 'active' : 'inactive'}">${ss.inSadeSati ? '⚠️ Sade Sati Active' : '✅ No Sade Sati'}</div>
            </div>
            <div class="ss-impact">
                <div class="ss-effect"><strong>Career Effect:</strong> ${this.parseMarkdown(ss.data?.career_effect || '—')}</div>
                <div class="ss-advice"><strong>Advice:</strong> ${this.parseMarkdown(ss.data?.advice || '—')}</div>
                <div class="ss-action"><strong>Action:</strong> ${this.parseMarkdown(ss.data?.action || '—')}</div>
            </div>
        </div>`;
    }

    renderCareerRecommendations(professions) {
        const el = document.getElementById('careerRecommendations');
        if (!el) return;

        const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32', '#6366f1', '#22c55e', '#ec4899'];
        el.innerHTML = professions.map((p, i) => `
            <div class="career-card rank-${p.rank}" style="--rank-color:${rankColors[i] || '#6366f1'}">
                <div class="cc-rank">#${p.rank}</div>
                <div class="cc-icon">${p.icon}</div>
                <div class="cc-main">
                    <div class="cc-name">${p.name}</div>
                    <div class="cc-sources">${p.sources.join(' · ')}</div>
                </div>
                <div class="cc-confidence">
                    <div class="cc-pct">${p.confidence}%</div>
                    <div class="cc-bar"><div class="cc-fill" style="width:${p.confidence}%"></div></div>
                </div>
            </div>`).join('');
    }

    renderCareerTimeline(timeline) {
        const el = document.getElementById('careerTimeline');
        if (!el) return;

        if (!timeline || timeline.length === 0) {
            el.innerHTML = `<div class="timeline-empty">Dasha data unavailable. Please regenerate the chart.</div>`;
            return;
        }

        el.innerHTML = `<div class="timeline-track">` + timeline.map(d => `
        <div class="tl-item ${d.isCurrent ? 'current' : d.isPast ? 'past' : 'future'}">
            <div class="tl-dot ${d.isCurrent ? 'current' : ''}">
                ${d.isCurrent ? '▶' : d.isPast ? '✓' : '○'}
            </div>
            <div class="tl-content">
                <div class="tl-header">
                    <span class="tl-planet">${this.planetSymbols[d.planet] || ''} ${d.planetName} Mahadasha</span>
                    <span class="tl-years">${d.duration} yrs</span>
                    ${d.isCurrent ? `<span class="tl-badge">ACTIVE NOW</span>` : ''}
                </div>
                <div class="tl-dates">${this.formatDate(d.start)} — ${this.formatDate(d.end)}</div>
                <div class="tl-phase">${d.phase}</div>
                <div class="tl-action">${d.action}</div>
                ${d.isCurrent ? `<div class="tl-bestfor"><strong>Best for:</strong> ${(d.bestFor || []).slice(0, 3).join(' · ')}</div>` : ''}
            </div>
        </div>`).join('') + `</div>`;
    }

    renderSubDashaAnalysis() {
        try {
            const el = document.getElementById('subDashaAnalysis');
            if (!el || !this.birthChart?.dashas) return;

            const d = this.birthChart.dashas;
            const mahadashaPlanet = d.currentMahadasha?.planet || d.birthDashaPlanet || 'ketu';
            const allADs = d.all || d.antardashas?.all || [];

            if (allADs.length === 0) return;

            const now = new Date();
            let currentIndex = allADs.findIndex(ad => now >= ad.startDate && now < ad.endDate);
            if (currentIndex === -1) currentIndex = 0;

            const displayADs = allADs.slice(currentIndex, currentIndex + 3);

            let html = `
            <div class="expanded-dasha-view">
                <div class="ed-header">🎯 Micro-Timing & Sub-Periods</div>
                <div class="ad-grid">`;

            displayADs.forEach((ad, idx) => {
                const isCurrent = idx === 0;
                const pName = (ad.planet || 'ketu').toLowerCase();
                const adData = this.careerData?.sub_dasha_analysis?.[pName];

                // For current AD, get PDs
                let pdHtml = '';
                if (isCurrent) {
                    const pds = this.astrologyEngine.calculatePratyantarDashas(ad, mahadashaPlanet);
                    if (pds && pds.all) {
                        pdHtml = `<div class="pd-timeline">
                            <div class="pd-title">📍 Pratyantar Dasha (PD) Breakdown</div>
                            <div class="pd-list">
                                ${pds.all.map(pd => {
                            const isCurrentPD = now >= pd.startDate && now < pd.endDate;
                            const pdP = (pd.planet || 'ketu').toLowerCase();
                            const pdD = this.careerData?.sub_dasha_analysis?.[pdP];
                            return `
                                    <div class="pd-item ${isCurrentPD ? 'current' : ''}">
                                        <div class="pd-meta">
                                            <span class="pd-planet">${this.planetSymbols[pd.planet] || ''} ${pd.planet.toUpperCase()}</span>
                                            <span class="pd-dates">${this.formatDate(pd.startDate)} - ${this.formatDate(pd.endDate)}</span>
                                        </div>
                                        <div class="pd-theme">${pdD?.theme || 'General Influence'}</div>
                                        <div class="pd-action">${pdD?.action || 'Proceed with caution'}</div>
                                        <div class="pd-tags">
                                            ${(pdD?.keywords || ['Observe']).map(k => `<span>#${k}</span>`).join('')}
                                        </div>
                                    </div>`;
                        }).join('')}
                            </div>
                        </div>`;
                    }
                }

                html += `
                <div class="ad-card-v2 ${isCurrent ? 'active' : ''}">
                    <div class="ad-badge">${isCurrent ? 'ACTIVE PHASE' : 'UPCOMING'}</div>
                    <div class="ad-main">
                        <div class="ad-planet-icon">${this.planetSymbols[ad.planet] || ''}</div>
                        <div class="ad-info">
                            <h4 class="ad-name">${ad.planet.toUpperCase()} Antardasha</h4>
                            <div class="ad-dates">${this.formatDate(ad.startDate)} — ${this.formatDate(ad.endDate)}</div>
                        </div>
                    </div>
                    <div class="ad-theme">${adData?.theme || 'Career Transition'}</div>
                    <div class="ad-action-v2"><strong>Strategic Action:</strong> ${adData?.action || 'Maintain status quo and observe trends.'}</div>
                    ${pdHtml}
                </div>`;
            });

            html += `</div></div>`;
            el.innerHTML = html;
        } catch (e) {
            console.error('Failed to render Sub-Dasha analysis:', e);
            const errEl = document.getElementById('subDashaAnalysis');
            if (errEl) errEl.innerHTML = `<div class="error-msg">Micro-analysis unavailable: ${e.message}</div>`;
        }
    }

    formatDate(d) {
        if (!d || !(d instanceof Date) || isNaN(d)) return '—';
        return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    }

    parseMarkdown(text) {
        if (!text) return '';
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    renderCareerRemedies() {
        try {
            const el = document.getElementById('careerRemedies');
            if (!el || !this.careerData?.career_remedies) return;
            const r = this.careerData.career_remedies;

            el.innerHTML = `
            <div class="remedies-grid">
                <div class="remedy-section-card">
                    <div class="rs-title">🕉️ Core Saturn Mantras & Rituals</div>
                    <ul class="remedy-list">${r.core_saturn_remedies.map(rem => `<li>${this.parseMarkdown(rem)}</li>`).join('')}</ul>
                </div>
                <div class="remedy-section-card">
                    <div class="rs-title">💼 Career-Specific Remedies</div>
                    <ul class="remedy-list">${r.career_specific_remedies.map(rem => `<li>${this.parseMarkdown(rem)}</li>`).join('')}</ul>
                </div>
                <div class="remedy-section-card">
                    <div class="rs-title">⏰ Timing-Based Remedies</div>
                    <ul class="remedy-list">${r.career_timing_remedies.map(rem => `<li>${this.parseMarkdown(rem)}</li>`).join('')}</ul>
                </div>
            </div>`;
        } catch (e) {
            console.error('Failed to render remedies:', e);
        }
    }

    _getFallbackData() {
        // Minimal fallback so the engine doesn't crash if JSON fails to load
        const empty = {};
        const def = () => ({ themes: [], career_style: '—', note: '—' });
        return {
            saturn_in_signs: Array.from({ length: 12 }, (_, i) => ({ [i]: def() })).reduce((a, b) => ({ ...a, ...b }), {}),
            saturn_in_houses: Array.from({ length: 12 }, (_, i) => ({ [i + 1]: { domain: '—', description: '—', timing: '—', top_professions: [] } })).reduce((a, b) => ({ ...a, ...b }), {}),
            tenth_house_lord_careers: { sun: { professions: [] }, moon: { professions: [] }, mars: { professions: [] }, mercury: { professions: [] }, jupiter: { professions: [] }, venus: { professions: [] }, saturn: { professions: [] }, rahu: { professions: [] }, ketu: { professions: [] } },
            d10_sign_careers: Array.from({ length: 12 }, (_, i) => ({ [i]: { theme: '—', professions: [] } })).reduce((a, b) => ({ ...a, ...b }), {}),
            atmakaraka_career: { sun: { soul_purpose: '—', career_calling: '—', ideal_work: [] }, moon: { soul_purpose: '—', career_calling: '—', ideal_work: [] }, mars: { soul_purpose: '—', career_calling: '—', ideal_work: [] }, mercury: { soul_purpose: '—', career_calling: '—', ideal_work: [] }, jupiter: { soul_purpose: '—', career_calling: '—', ideal_work: [] }, venus: { soul_purpose: '—', career_calling: '—', ideal_work: [] }, saturn: { soul_purpose: '—', career_calling: '—', ideal_work: [] } },
            amatyakaraka_career: { sun: { career_minister: '—', insight: '—', boost_fields: [] }, moon: { career_minister: '—', insight: '—', boost_fields: [] }, mars: { career_minister: '—', insight: '—', boost_fields: [] }, mercury: { career_minister: '—', insight: '—', boost_fields: [] }, jupiter: { career_minister: '—', insight: '—', boost_fields: [] }, venus: { career_minister: '—', insight: '—', boost_fields: [] }, saturn: { career_minister: '—', insight: '—', boost_fields: [] } },
            yogakaraka_by_lagna: {},
            planet_career_themes: { sun: { keyword: 'Leadership', career_fields: [] }, moon: { keyword: 'Nurturing', career_fields: [] }, mars: { keyword: 'Action', career_fields: [] }, mercury: { keyword: 'Communication', career_fields: [] }, jupiter: { keyword: 'Wisdom', career_fields: [] }, venus: { keyword: 'Arts', career_fields: [] }, saturn: { keyword: 'Discipline', career_fields: [] }, rahu: { keyword: 'Innovation', career_fields: [] }, ketu: { keyword: 'Spirituality', career_fields: [] } },
            sade_sati_career_impact: { not_in_sade_sati: { name: 'No Sade Sati', career_effect: 'Stable period for career growth.', advice: 'Stay focused on long-term goals.', action: 'Invest in skills and relationships.' }, phase_1: { name: 'Sade Sati Phase 1', career_effect: 'Preparation period.', advice: 'Avoid major career changes.', action: 'Build foundations.' }, phase_2: { name: 'Sade Sati Peak', career_effect: 'Testing period.', advice: 'Stay disciplined.', action: 'Focus on essentials.' }, phase_3: { name: 'Sade Sati Phase 3', career_effect: 'Recovery and growth.', advice: 'New opportunities emerging.', action: 'Take calculated risks.' } },
            dasha_career_timing: { sun: { duration_years: 6, career_phase: 'Authority & Leadership', career_action: 'Seek recognition and promotions', best_for: 'Government, management roles', avoid: 'Ego conflicts' }, moon: { duration_years: 10, career_phase: 'Public & Emotional', career_action: 'Connect with public facing roles', best_for: 'Healthcare, hospitality, public service', avoid: 'Impulsive decisions' }, mars: { duration_years: 7, career_phase: 'Action & Courage', career_action: 'Take bold career moves', best_for: 'Military, engineering, sports', avoid: 'Aggression at workplace' }, mercury: { duration_years: 17, career_phase: 'Communication & Business', career_action: 'Develop skills, start ventures', best_for: 'IT, trading, writing, teaching', avoid: 'Overthinking' }, jupiter: { duration_years: 16, career_phase: 'Expansion & Wisdom', career_action: 'Expand, teach, lead', best_for: 'Education, law, finance, consulting', avoid: 'Overconfidence' }, venus: { duration_years: 20, career_phase: 'Creativity & Wealth', career_action: 'Pursue arts, luxury, relationships', best_for: 'Arts, fashion, beauty, finance', avoid: 'Laziness' }, saturn: { duration_years: 19, career_phase: 'Hard Work & Discipline', career_action: 'Work diligently, be patient', best_for: 'Long-term careers, service, research', avoid: 'Shortcuts' }, rahu: { duration_years: 18, career_phase: 'Innovation & Ambition', career_action: 'Embrace technology, foreign connections', best_for: 'Technology, research, foreign work', avoid: 'Unethical shortcuts' }, ketu: { duration_years: 7, career_phase: 'Spirituality & Mastery', career_action: 'Focus on expertise and detachment', best_for: 'Research, spirituality, healing', avoid: 'Worldly attachments' } }
        };
    }
}


// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    const engine = new BrighuCareerEngine();
    const ok = await engine.init();
    if (ok) {
        engine.renderAll();
        // Animate strength bars after render
        setTimeout(() => {
            document.querySelectorAll('.strength-bar-inner[data-strength]').forEach(bar => {
                bar.style.width = bar.dataset.strength + '%';
            });
        }, 100);
    }
});
