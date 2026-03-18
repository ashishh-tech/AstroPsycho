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

        // 1. Saturn strength (15 pts max)
        const satScore = Math.round(satData.strength * 0.15);
        factors.push({ label: 'Saturn Shadbala Strength', score: satScore, max: 15 });
        total += satScore;

        // 2. Saturn house quality (10 pts)
        const houseScores = { 1: 7, 2: 5, 3: 5, 4: 6, 5: 8, 6: 8, 7: 7, 8: 6, 9: 9, 10: 10, 11: 8, 12: 5 };
        const satHouseScore = houseScores[satData.house] || 7;
        factors.push({ label: `Saturn in ${satData.house}th House`, score: satHouseScore, max: 10 });
        total += satHouseScore;

        // 3. Saturn sign quality (10 pts)
        let satSignScore = 5;
        if (satData.status.includes('Exalted')) satSignScore = 10;
        else if (satData.status.includes('Own Sign')) satSignScore = 8;
        else if (satData.status.includes('Debilitated')) satSignScore = 2;
        factors.push({ label: `Saturn in ${satData.sign} (${satData.status})`, score: satSignScore, max: 10 });
        total += satSignScore;

        // 4. 10th house lord strength (10 pts)
        const tenthLordShadbala = this.birthChart.shadbala?.[tenth.tenthLord];
        const tenthScore = tenthLordShadbala?.isStrong ? 10 : (tenthLordShadbala ? 6 : 3);
        factors.push({ label: `10th Lord (${this.planetNames[tenth.tenthLord]}) Strength`, score: tenthScore, max: 10 });
        total += tenthScore;

        // 5. Planets in 10th house (5 pts)
        const beneficsIn10th = tenth.planetsIn10th.filter(p => ['jupiter', 'venus', 'mercury'].includes(p)).length;
        const maleficsIn10th = tenth.planetsIn10th.filter(p => ['saturn', 'mars', 'rahu', 'ketu'].includes(p)).length;
        const tenthPlanetScore = Math.min(5, (beneficsIn10th * 2) - maleficsIn10th + 3);
        factors.push({ label: `Planets in 10th House (${tenth.planetsIn10th.length || 'none'})`, score: Math.max(0, tenthPlanetScore), max: 5 });
        total += Math.max(0, tenthPlanetScore);

        // 6. Yogakaraka strength (5 pts)
        const ykScore = yogakaraka ? (yogakaraka.isStrong ? 5 : 3) : 2;
        factors.push({ label: `Yogakaraka (${yogakaraka ? this.planetNames[yogakaraka.planet] : 'None'})`, score: ykScore, max: 5 });
        total += ykScore;

        // 7. Amatyakaraka (5 pts)
        const amkStrong = this.birthChart.shadbala?.[karakas.amatyakaraka.planet]?.isStrong;
        const amkScore = amkStrong ? 5 : 3;
        factors.push({ label: `Amatyakaraka (${this.planetNames[karakas.amatyakaraka.planet]})`, score: amkScore, max: 5 });
        total += amkScore;

        // 8. D-10 assessment (10 pts)
        const d10Score = d10Data.data ? 8 : 4;
        factors.push({ label: `D-10 (Dashamsha) Career Sign: ${d10Data.d10Sign}`, score: d10Score, max: 10 });
        total += d10Score;

        // 9. Ashtakavarga 10th House (15 pts)
        let bavScore = 8; // Default
        if (this.birthChart.ashtakavarga) {
            const ascSignIndex = Math.floor(this.birthChart.ascendant / 30);
            const h10Index = (ascSignIndex + 9) % 12;
            const points = this.birthChart.ashtakavarga.total[h10Index];
            if (points >= 30) bavScore = 15;
            else if (points >= 28) bavScore = 12;
            else if (points >= 24) bavScore = 8;
            else bavScore = 4;
        }
        factors.push({ label: `Ashtakavarga 10th Potency`, score: bavScore, max: 15 });
        total += bavScore;

        // 10. KP Sub-Lord Analysis (15 pts)
        let kpScore = 8;
        if (this.birthChart.kpAstrology) {
            const mc = this.birthChart.kpAstrology.tenthCusp;
            const subLordDetails = this.birthChart.planetaryDetails[mc.subLord];
            const subLordHouse = subLordDetails ? subLordDetails.house : 0;
            if ([2, 6, 10, 11].includes(subLordHouse)) kpScore = 15;
            else if ([8, 12].includes(subLordHouse)) kpScore = 4;
            else kpScore = 10;
        }
        factors.push({ label: `KP 10th Sub-Lord Destiny`, score: kpScore, max: 15 });
        total += kpScore;

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

            // Ultra-Level Renderers
            if (this.chartData?.kpAstrology) this.renderKPAstrology(this.chartData.kpAstrology);
            if (this.chartData?.ashtakavarga) this.renderAshtakavarga(this.chartData.ashtakavarga);
            if (this.chartData?.dashas) this.renderDashaTransit(this.chartData.dashas);

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
            console.error('Sub-Dasha render error:', e);
        }
    }

    renderKPAstrology(kp) {
        const el = document.getElementById('kpAstrologyCard');
        if (!el || !kp) return;

        const mc = kp.tenthCusp;
        // KP Career Rules (simplified): 
        // 10th Sub-Lord's Star Lord signifies 2,6,10,11 = Excellent Career/Business
        // 10th Sub-Lord's Star Lord signifies 8,12 = Challenges/Breaks

        // We check the Star Lord of the 10th Cusp Sub Lord
        const subLordDetails = this.chartData.planetaryDetails[mc.subLord];
        const subLordHouse = subLordDetails ? subLordDetails.house : '-';
        
        let verdict = "Neutral Alignment";
        let color = "var(--text)";
        let subLordDignity = subLordDetails ? subLordDetails.status : '';

        // Simplistic check just for UI demonstration based on House
        if ([2, 6, 10, 11].includes(subLordHouse)) {
            verdict = "Guaranteed Success (Strong 2/6/10/11 link)";
            color = "var(--success)";
        } else if ([8, 12].includes(subLordHouse)) {
            verdict = "Obstacles Expected (8/12 link)";
            color = "var(--danger)";
        } else if ([1, 5, 9].includes(subLordHouse)) {
            verdict = "Destined Path (Dharma Trikona link)";
            color = "var(--primary-light)";
        }

        el.innerHTML = `
        <div style="font-size: 1.1rem; margin-bottom: 0.5rem; text-align: center;">
            <div style="font-size: 0.85rem; color: var(--muted); text-transform: uppercase;">10th Cusp Midheaven</div>
            <strong>${mc.longitude.toFixed(2)}° ${mc.signLord.charAt(0).toUpperCase() + mc.signLord.slice(1)}</strong> 
        </div>
        <div class="kp-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 15px;">
            <div>
                <div style="font-size: 0.8rem; color: var(--muted);">Sign Lord</div>
                <strong style="color: var(--primary-light);">${mc.signLord.toUpperCase()}</strong>
            </div>
            <div>
                <div style="font-size: 0.8rem; color: var(--muted);">Star Lord</div>
                <strong style="color: var(--warning);">${mc.starLord.toUpperCase()}</strong>
            </div>
            <div>
                <div style="font-size: 0.8rem; color: var(--muted);">Sub Lord</div>
                <strong style="color: var(--success); font-size: 1.1rem;">${mc.subLord.toUpperCase()}</strong>
            </div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border-left: 3px solid ${color}; padding: 12px; border-radius: 4px;">
            <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 4px;">Sub-Lord Prediction:</div>
            <strong style="color: ${color};">${verdict}</strong>
            <div style="font-size: 0.85rem; margin-top: 5px;">The 10th Sub-Lord is sitting in House ${subLordHouse} with ${subLordDignity} dignity.</div>
        </div>`;
    }

    renderAshtakavarga(av) {
        const el = document.getElementById('ashtakavargaCard');
        if (!el || !av) return;

        // Calculate 10th house index
        const ascSignIndex = Math.floor(this.chartData.ascendant / 30);
        const h10Index = (ascSignIndex + 9) % 12;
        const h11Index = (ascSignIndex + 10) % 12; // 11th house for Income

        const h10Points = av.sarvashtakavarga[h10Index];
        const h11Points = av.sarvashtakavarga[h11Index];

        let careerPotency = "Average";
        let potencyColor = "var(--text)";
        if (h10Points >= 30) { careerPotency = "Highly Auspicious"; potencyColor = "var(--success)"; }
        else if (h10Points <= 24) { careerPotency = "Requires Hard Work"; potencyColor = "var(--danger)"; }

        let incomeProm = "Average Income";
        if (h11Points > h10Points) incomeProm = "Income > Effort (Wealth Yoga)";
        else if (h11Points < h10Points) incomeProm = "Effort > Income (Service Focus)";

        el.innerHTML = `
        <div style="display: flex; justify-content: space-around; align-items: center; margin-bottom: 15px; padding: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center;">
                <div style="font-size: 2.5rem; font-weight: 800; color: ${potencyColor}; text-shadow: 0 0 10px ${potencyColor}40;">${h10Points}</div>
                <div style="font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 1px;">10th House Points</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2.5rem; font-weight: 800; color: var(--success);">${h11Points}</div>
                <div style="font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 1px;">11th House (Income)</div>
            </div>
        </div>
        <div>
            <div style="margin-bottom: 8px;"><strong>Career Potency:</strong> <span style="color:${potencyColor}">${careerPotency}</span></div>
            <div><strong>Wealth Generation:</strong> <span style="color:var(--primary-light)">${incomeProm}</span></div>
            <p style="font-size: 0.85rem; color: var(--muted); margin-top: 10px; line-height: 1.4;">
                (Avg points = 28. >30 means the house strongly supports you without much friction. 11th > 10th brings effortless wealth).
            </p>
        </div>`;
    }

    renderDashaTransit(dashas) {
        const el = document.getElementById('dashaTransitCard');
        if (!el || !dashas) return;

        const md = dashas.currentMahadasha?.planet;
        const ad = dashas.antardashas?.current?.planet;
        
        // Check Transit matches
        const transits = this.astrologyEngine.calculateTransits();
        const jupTransitSign = Math.floor(transits.jupiter / 30);
        const satTransitSign = Math.floor(transits.saturn / 30);
        
        const ascSign = Math.floor(this.chartData.ascendant / 30);
        const jupHouse = (jupTransitSign - ascSign + 12) % 12 + 1;
        const satHouse = (satTransitSign - ascSign + 12) % 12 + 1;

        // Activation triggers: Jup/Sat over 1,5,9,10
        const isJupActivating = [1, 5, 9, 10, 11].includes(jupHouse);
        const isSatActivating = [1, 5, 9, 10, 11].includes(satHouse);

        let activeMsg = "Building Phase";
        let activeColor = "var(--muted)";
        if (isJupActivating && isSatActivating) {
            activeMsg = "Double Transit Activation! Major Event IMMINENT.";
            activeColor = "var(--success)";
        } else if (isJupActivating) {
            activeMsg = "Jupiter Blessings (Growth/Promotion phase)";
            activeColor = "var(--primary-light)";
        } else if (isSatActivating) {
            activeMsg = "Saturn Activation (Hard work leading to solid rise)";
            activeColor = "var(--warning)";
        }

        el.innerHTML = `
        <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span><strong>Mahadasha:</strong> ${md ? md.toUpperCase() : '-'}</span>
                <span><strong>Antardasha:</strong> ${ad ? ad.toUpperCase() : '-'}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--muted);">Base career flavor set by ${md}, specific events delivered by ${ad}.</div>
        </div>
        
        <div style="border-left: 4px solid ${activeColor}; padding-left: 12px;">
            <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 5px;">Double Transit Career Timing:</div>
            <div style="font-size: 1.1rem; font-weight: bold; color: ${activeColor}; margin-bottom: 5px;">${activeMsg}</div>
            <div style="font-size: 0.85rem;">
                Jupiter is transiting House ${jupHouse} • Saturn is transiting House ${satHouse}
            </div>
        </div>`;
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

    // ─── CAREER COMPATIBILITY CHECKER ──────────────────────────────────────────

    checkCustomCareer() {
        const input = document.getElementById('careerCheckerInput');
        const resultEl = document.getElementById('careerCheckerResult');
        if (!input || !resultEl) return;

        const query = input.value.trim();
        if (!query) {
            input.style.borderColor = '#ef4444';
            setTimeout(() => input.style.borderColor = 'rgba(99,102,241,0.4)', 1200);
            return;
        }

        // Show loading state
        const btn = document.getElementById('careerCheckBtn');
        if (btn) { btn.textContent = '⏳ Analyzing...'; btn.disabled = true; }

        setTimeout(() => {
            const result = this._scoreCustomCareer(query);
            this._renderCareerCheckResult(result, query);
            if (btn) { btn.innerHTML = '✨ Check My Chart'; btn.disabled = false; }
        }, 600);
    }

    _scoreCustomCareer(query) {
        const q = query.toLowerCase();

        // Keyword → astrological domain mapping (Massive expansion)
        const domainMap = {
            // --- MEDICAL & HEALTHCARE ---
            doctor: ['medicine', 'healthcare', 'healing'], physician: ['medicine', 'healthcare'],
            surgeon: ['medicine', 'surgery', 'mars'], nurse: ['medicine', 'healthcare', 'moon'],
            dentist: ['medicine', 'healthcare'], hospital: ['medicine', 'healthcare'],
            pharmacist: ['medicine', 'chemistry'], therapist: ['psychology', 'counselling', 'moon'],
            psychologist: ['psychology', 'counselling'], psychiatrist: ['psychology', 'medicine'],
            neurologist: ['medicine', 'research', 'mercury'], cardiologist: ['medicine', 'surgery', 'sun'],
            pediatrician: ['medicine', 'moon'], ayurveda: ['healing', 'spirituality', 'jupiter'],
            homeopathy: ['healing', 'mercury'], veterinary: ['healthcare', 'social_work', 'mercury'],
            radiologist: ['medicine', 'technology', 'rahu'], pathlogist: ['medicine', 'research'],
            nutritionist: ['healthcare', 'food_industry', 'moon'], physiotherapy: ['healing', 'mars'],

            // --- TECHNOLOGY & IT ---
            software: ['IT', 'technology', 'mercury'], developer: ['IT', 'technology', 'mercury'],
            programmer: ['IT', 'technology', 'mercury'], engineer: ['engineering', 'technology', 'mars', 'mercury', 'saturn'],
            data: ['IT', 'research', 'mercury'], ai: ['IT', 'technology', 'rahu'],
            machine: ['IT', 'technology', 'rahu'], cyber: ['IT', 'technology', 'rahu'],
            cloud: ['IT', 'technology', 'rahu'], frontend: ['IT', 'arts', 'venus'],
            backend: ['IT', 'technology', 'mercury'], fullstack: ['IT', 'technology'],
            devops: ['IT', 'technology', 'saturn'], blockchain: ['IT', 'technology', 'rahu'],
            crypto: ['finance', 'technology', 'rahu'], gaming: ['IT', 'arts', 'rahu'],
            web: ['IT', 'technology'], app: ['IT', 'technology'],
            ui: ['IT', 'design', 'venus'], ux: ['IT', 'psychology', 'venus'],
            hardware: ['engineering', 'mars'], networking: ['IT', 'mercury'],
            tester: ['IT', 'saturn'], quality: ['IT', 'saturn'],

            // --- FINANCE & COMMERCE ---
            ca: ['finance', 'accounting', 'mercury'], chartered: ['finance', 'accounting'],
            accountant: ['finance', 'accounting', 'mercury'], banker: ['finance', 'banking', 'jupiter'],
            finance: ['finance', 'banking', 'investment'], trader: ['finance', 'investment', 'rahu'],
            investor: ['finance', 'investment'], stock: ['finance', 'investment', 'rahu'],
            auditor: ['finance', 'saturn'], tax: ['finance', 'government'],
            insurance: ['finance', 'saturn'], actuary: ['finance', 'research', 'mercury'],
            fintech: ['finance', 'technology', 'rahu'],

            // --- LAW & GOVERNMENT ---
            lawyer: ['law', 'legal', 'jupiter'], advocate: ['law', 'legal'],
            judge: ['law', 'legal', 'jupiter', 'government'], legal: ['law', 'legal'],
            ias: ['government', 'politics', 'sun'], ips: ['government', 'military', 'mars'],
            irs: ['government', 'finance', 'mercury'], ifs: ['government', 'foreign_work', 'mercury'],
            government: ['government', 'politics', 'sun'], politician: ['politics', 'sun', 'rahu'],
            civil: ['government', 'politics'], bureaucrat: ['government', 'saturn'],
            diplomat: ['foreign_work', 'law', 'venus'], ambassador: ['foreign_work', 'government'],
            policeman: ['military', 'government', 'mars'], constable: ['military', 'government'],

            // --- DEFENCE & AVIATION ---
            army: ['military', 'mars', 'government'], soldier: ['military', 'mars'],
            navy: ['military', 'travel', 'moon'], airforce: ['military', 'mars'],
            pilot: ['military', 'travel', 'foreign_work', 'rahu'], cabin: ['hospitality', 'travel', 'venus'],
            aerospace: ['engineering', 'technology', 'rahu'], aviation: ['travel', 'technology'],
            fireman: ['military', 'mars'], security: ['military', 'mars'],

            // --- EDUCATION & RESEARCH ---
            teacher: ['teaching', 'education', 'jupiter'], professor: ['teaching', 'education'],
            lecturer: ['teaching', 'education'], principal: ['teaching', 'government', 'sun'],
            trainer: ['teaching', 'education'], coach: ['teaching', 'sports'],
            researcher: ['research', 'science', 'mercury', 'saturn'], scientist: ['research', 'science'],
            analyst: ['research', 'data', 'mercury'], historian: ['research', 'jupiter'],
            librarian: ['education', 'saturn'], archaeologist: ['research', 'saturn', 'rahu'],

            // --- CREATIVE, ARTS & DESIGN ---
            artist: ['arts', 'venus'], designer: ['arts', 'design', 'venus'],
            architect: ['engineering', 'property', 'saturn', 'venus'], interior: ['design', 'arts', 'venus'],
            fashion: ['arts', 'design', 'venus'], makeup: ['arts', 'venus'],
            photographer: ['arts', 'media', 'venus'], filmmaker: ['media', 'arts', 'venus'],
            animator: ['arts', 'technology', 'rahu'], graphic: ['arts', 'design', 'venus'],
            sculptor: ['arts', 'saturn'], painter: ['arts', 'venus'],
            musician: ['arts', 'music', 'venus'], singer: ['arts', 'music', 'venus'],
            dancer: ['arts', 'venus', 'moon'], actor: ['arts', 'media', 'venus', 'sun'],

            // --- MEDIA & ENTERTAINMENT ---
            youtuber: ['media', 'arts', 'rahu', 'venus'], influencer: ['media', 'rahu', 'venus'],
            streamer: ['media', 'rahu', 'venus'], blogger: ['writing', 'media', 'mercury'],
            journalist: ['writing', 'media', 'mercury'], writer: ['writing', 'mercury'],
            author: ['writing', 'mercury', 'jupiter'], editor: ['writing', 'mercury'],
            reporter: ['writing', 'media'], news: ['media', 'mercury'],
            radio: ['media', 'mercury'], podcast: ['media', 'mercury'],

            // --- BUSINESS & MANAGEMENT ---
            business: ['business', 'entrepreneurship', 'mercury'], entrepreneur: ['business', 'entrepreneurship', 'mercury', 'sun', 'rahu'],
            startup: ['business', 'technology', 'rahu', 'mercury'], ceo: ['business', 'management', 'sun'],
            manager: ['management', 'business'], consultant: ['consulting', 'management', 'jupiter'],
            hr: ['management', 'social_work', 'jupiter'], sales: ['business', 'mercury'],
            marketing: ['business', 'mercury', 'rahu'], retail: ['business', 'mercury'],
            logistics: ['business', 'saturn'], export: ['business', 'foreign_work', 'rahu'],

            // --- REAL ESTATE & CONSTRUCTION ---
            real: ['real_estate', 'property', 'saturn'], property: ['real_estate', 'property', 'mars'],
            contractor: ['construction', 'property', 'saturn', 'mars'], builder: ['construction', 'property'],
            civil_engineer: ['engineering', 'construction', 'mars'],

            // --- SPIRITUALITY & SOCIAL ---
            astrologer: ['occult', 'spirituality', 'ketu', 'mercury'], astrology: ['occult', 'spirituality'],
            spiritual: ['spirituality', 'ketu', 'jupiter'], healer: ['spirituality', 'healing'],
            yoga: ['spirituality', 'jupiter', 'moon'], meditation: ['spirituality', 'ketu'],
            priest: ['spirituality', 'jupiter'], ngo: ['social_work', 'charity', 'jupiter', 'moon'],
            social: ['social_work', 'moon', 'jupiter'], charity: ['charity', 'moon', 'jupiter'],

            // --- HOSPITALITY & TRAVEL ---
            chef: ['food_industry', 'venus', 'moon', 'mars'], hotel: ['hospitality', 'venus'],
            restaurant: ['food_industry', 'venus'], food: ['food_industry', 'venus', 'moon'],
            travel: ['travel', 'tourism', 'moon'], tourism: ['travel', 'tourism', 'venus'],
            guide: ['travel', 'jupiter'], event: ['hospitality', 'venus'],

            // --- AGRICULTURE & TRADITIONAL ---
            farmer: ['agriculture', 'saturn', 'moon'], agriculture: ['agriculture', 'saturn'],
            dairy: ['agriculture', 'moon'], fishing: ['agriculture', 'rahu'],
            carpenter: ['construction', 'saturn'], plumber: ['construction', 'saturn'],
            electrician: ['engineering', 'mars'], driver: ['transport', 'rahu'],
            mechanic: ['engineering', 'mars', 'saturn'], factory: ['manufacturing', 'saturn'],

            // --- SPORTS & FITNESS ---
            athlete: ['sports', 'mars'], sportsman: ['sports', 'mars'],
            cricketer: ['sports', 'mars', 'mercury'], footballer: ['sports', 'mars'],
            gym: ['sports', 'mars'], bodybuilding: ['sports', 'mars', 'sun'],
            swimmer: ['sports', 'moon'], coach: ['sports', 'jupiter'],
        };

        // Build matched domains from query
        const matchedDomains = new Set();
        const matchedPlanets = new Set();
        const matchedKeywords = [];

        // Also add Jupiter for any technical/analytical/structured profession
        const techDomains = ['engineering', 'technology', 'IT', 'research', 'science', 'medicine', 'law', 'education'];

        for (const [kw, tags] of Object.entries(domainMap)) {
            if (q.includes(kw)) {
                matchedKeywords.push(kw);
                tags.forEach(t => {
                    const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
                    if (planets.includes(t)) matchedPlanets.add(t);
                    else {
                        matchedDomains.add(t);
                        // Add Jupiter for technical/knowledge-based domains
                        if (techDomains.includes(t)) matchedPlanets.add('jupiter');
                    }
                });
            }
        }

        // Get chart data
        const satData = this.getSaturnData();
        const tenth = this.get10thHouseAnalysis();
        const d10 = this.getD10CareerSign();
        const karakas = this.calculateJaiminiKarakas();
        const topProfessions = this.buildCareerProfile();

        // Scoring signals
        const signals = [];
        let totalScore = 0;

        // Baseline: give a small credit for any recognized profession keyword
        if (matchedKeywords.length > 0) {
            totalScore += 10;
        }

        // 1. Check if query matches any top recommended professions (strong signal)
        const topMatch = topProfessions.find(p => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase().split(/\s/)[0]));
        if (topMatch) {
            const pts = Math.round(topMatch.confidence * 0.4);
            signals.push({ icon: '🏆', label: `Found in your top career matches (${topMatch.name})`, score: pts, positive: true });
            totalScore += pts;
        }

        // 2. Saturn house professions match
        const satProfs = satData.houseData?.top_professions || [];
        const satMatch = satProfs.filter(p => q.includes(p.toLowerCase()) || p.toLowerCase().split(/\s/)[0].length > 3 && q.includes(p.toLowerCase().split(/\s/)[0]));
        if (satMatch.length) {
            signals.push({ icon: '♄', label: `Saturn (H${satData.house} ${satData.sign}) favours this field`, score: 22, positive: true });
            totalScore += 22;
        }

        // 3. Saturn sign theme match
        const satSignThemes = satData.signData?.themes || [];
        const satSignMatch = satSignThemes.some(t => matchedDomains.has(t) || matchedPlanets.has(t));
        if (satSignMatch) {
            signals.push({ icon: '♄', label: `Saturn's sign (${satData.sign}) supports this energy`, score: 14, positive: true });
            totalScore += 14;
        }

        // 4. 10th lord career match
        const tenthProfs = tenth.lordData?.professions || [];
        const tenthMatch = tenthProfs.some(p => q.includes(p.toLowerCase()) || matchedDomains.has(p.toLowerCase()));
        if (tenthMatch) {
            signals.push({ icon: '👑', label: `10th Lord (${this.planetNames[tenth.tenthLord]}) supports this career`, score: 20, positive: true });
            totalScore += 20;
        }

        // 5. D10 sign profession match
        const d10Profs = d10.data?.professions || [];
        const d10Match = d10Profs.some(p => q.includes(p.toLowerCase()) || matchedDomains.has(p.toLowerCase().split(/\s/)[0]));
        if (d10Match) {
            signals.push({ icon: '📊', label: `D-10 Dashamsha (${d10.d10Sign}) aligns with this field`, score: 16, positive: true });
            totalScore += 16;
        }

        // 6. Atmakaraka soul work match
        const akWork = karakas.akData?.ideal_work || [];
        const akMatch = akWork.some(w => q.includes(w.toLowerCase()) || matchedDomains.has(w.toLowerCase()));
        if (akMatch) {
            signals.push({ icon: '🔱', label: `Atmakaraka (${this.planetNames[karakas.atmakaraka.planet]}) resonates with your soul's calling`, score: 12, positive: true });
            totalScore += 12;
        }

        // 7. Matched planet energy in chart assessment
        if (matchedPlanets.size > 0) {
            const relevantCount = [...matchedPlanets].filter(p => {
                const shadbala = this.birthChart.shadbala?.[p];
                return shadbala?.isStrong;
            }).length;
            if (relevantCount > 0) {
                signals.push({ icon: '⚡', label: `Strong ruling planets (${[...matchedPlanets].map(p => this.planetNames[p]).join(', ')}) in your chart`, score: relevantCount * 8, positive: true });
                totalScore += relevantCount * 8;
            }
        }

        // 8. Negative signals — debilitated or weak planets
        const weakPlanetsInfo = [];
        
        // Define key pillars to check regardless of profession (Always relevant for overall career success)
        const pillars = new Set(['saturn', tenth.tenthLord]);
        const planetsToCheck = new Set([...matchedPlanets, ...pillars]);

        planetsToCheck.forEach(p => {
            const shadbala = this.birthChart.shadbala?.[p];
            const planetPos = this.birthChart.planets[p];
            const signIndex = Math.floor(planetPos / 30);
            
            // Check if debilitating
            let isDebilitated = false;
            const debilMap = { sun: 6, moon: 7, mars: 3, mercury: 11, jupiter: 9, venus: 5, saturn: 0 };
            if (debilMap[p] !== undefined && signIndex === debilMap[p]) isDebilitated = true;
            
            if (shadbala && !shadbala.isStrong) {
                weakPlanetsInfo.push({
                    planet: this.planetNames[p],
                    reason: `has low Shadbala strength (${Math.round((shadbala.totalRupas / shadbala.requiredStrength) * 100)}%)`,
                    code: p
                });
            } else if (isDebilitated) {
                weakPlanetsInfo.push({
                    planet: this.planetNames[p],
                    reason: `is in its sign of debilitation (${this.signs[signIndex]})`,
                    code: p
                });
            }
        });

        // Unique check
        const finalWeakPlanets = [];
        const seen = new Set();
        weakPlanetsInfo.forEach(item => {
            if (!seen.has(item.code)) {
                finalWeakPlanets.push(item);
                seen.add(item.code);
            }
        });

        if (finalWeakPlanets.length > 0 && signals.filter(s => s.positive).length === 0) {
            // Penalize more if the matched planets themselves are weak
            const matchedWeakCount = finalWeakPlanets.filter(w => matchedPlanets.has(w.code)).length;
            const penalty = (matchedWeakCount > 0 ? 12 : 8) * finalWeakPlanets.length;
            
            signals.push({ icon: '⚠️', label: `Key planets (${finalWeakPlanets.map(i => i.planet).join(', ')}) need strengthening`, score: -penalty, positive: false });
            totalScore = Math.max(0, totalScore - penalty);
        }
        
        // Update weakPlanetsInfo for rendering
        const renderWeakPlanets = finalWeakPlanets;

        // No keywords recognized
        if (matchedKeywords.length === 0 && !topMatch) {
            signals.push({ icon: '🔮', label: 'This profession isn\'t in our keyword database — showing general chart analysis', score: 0, positive: null });
            // Give a general baseline based on career strength
            const cs = this.calculateCareerStrengthScore();
            totalScore = Math.round(cs.total * 0.5);
        }

        // Clamp
        totalScore = Math.min(100, Math.max(5, totalScore));

        // Verdict
        let verdict, verdictColor, verdictBg, verdictIcon;
        if (totalScore >= 80) {
            verdict = 'Highly Favourable'; verdictColor = '#22c55e'; verdictBg = 'rgba(34,197,94,0.12)'; verdictIcon = '🌟';
        } else if (totalScore >= 60) {
            verdict = 'Favourable'; verdictColor = '#4ade80'; verdictBg = 'rgba(74,222,128,0.1)'; verdictIcon = '✅';
        } else if (totalScore >= 40) {
            verdict = 'Moderately Aligned'; verdictColor = '#f59e0b'; verdictBg = 'rgba(245,158,11,0.1)'; verdictIcon = '🟡';
        } else if (totalScore >= 20) {
            verdict = 'Challenging Path'; verdictColor = '#f97316'; verdictBg = 'rgba(249,115,22,0.1)'; verdictIcon = '⚠️';
        } else {
            verdict = 'Not Chart-Aligned'; verdictColor = '#ef4444'; verdictBg = 'rgba(239,68,68,0.1)'; verdictIcon = '❌';
        }

        return { totalScore, verdict, verdictColor, verdictBg, verdictIcon, signals, weakPlanetsInfo: renderWeakPlanets };
    }

    _renderCareerCheckResult(result, query) {
        const el = document.getElementById('careerCheckerResult');
        if (!el) return;

        const positiveSignals = result.signals.filter(s => s.positive === true);
        const negativeSignals = result.signals.filter(s => s.positive === false);
        const neutralSignals = result.signals.filter(s => s.positive === null);

        // Arc progress (semi-circle like the career gauge)
        const arcPct = result.totalScore;
        const arcColor = result.verdictColor;

        el.style.display = 'block';
        el.innerHTML = `
        <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:18px; padding:24px; animation: fadeIn 0.4s ease;">
            <!-- Header -->
            <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.08);">
                <!-- Mini gauge -->
                <div style="text-align:center;">
                    <svg viewBox="0 0 120 72" style="width:130px;">
                        <path d="M 12 66 A 54 54 0 0 1 108 66" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="12" stroke-linecap="round"/>
                        <path d="M 12 66 A 54 54 0 0 1 108 66" fill="none" stroke="${arcColor}" stroke-width="12" stroke-linecap="round"
                              stroke-dasharray="${arcPct * 1.696} 169.6" style="transition:stroke-dasharray 1.2s ease;"/>
                        <text x="60" y="58" text-anchor="middle" fill="white" font-size="22" font-weight="bold" font-family="Outfit,sans-serif">${arcPct}</text>
                    </svg>
                    <div style="font-size:0.7rem; color:rgba(255,255,255,0.45); margin-top:-4px;">/ 100</div>
                </div>
                <!-- Verdict -->
                <div style="flex:1;">
                    <div style="font-size:0.78rem; color:rgba(255,255,255,0.45); margin-bottom:6px; letter-spacing:0.5px;">CHART COMPATIBILITY FOR</div>
                    <div style="font-size:1.35rem; font-weight:800; color:#f1f5f9; margin-bottom:10px;">"${query}"</div>
                    <div style="display:inline-flex; align-items:center; gap:8px; background:${result.verdictBg}; border:1px solid ${arcColor}40;
                                padding:8px 18px; border-radius:30px;">
                        <span style="font-size:1.1rem;">${result.verdictIcon}</span>
                        <span style="font-size:0.95rem; font-weight:700; color:${arcColor};">${result.verdict}</span>
                    </div>
                </div>
            </div>

            <!-- Signals -->
            ${positiveSignals.length ? `
            <div style="margin-bottom:14px;">
                <div style="font-size:0.75rem; font-weight:700; color:rgba(255,255,255,0.4); letter-spacing:0.5px; margin-bottom:10px;">✅ SUPPORTING FACTORS</div>
                ${positiveSignals.map(s => `
                    <div style="display:flex; align-items:center; gap:10px; background:rgba(34,197,94,0.06); border:1px solid rgba(34,197,94,0.15);
                                border-radius:10px; padding:10px 14px; margin-bottom:8px;">
                        <span style="font-size:1.1rem;">${s.icon}</span>
                        <span style="flex:1; font-size:0.88rem; color:#e2e8f0; line-height:1.4;">${s.label}</span>
                        <span style="font-size:0.85rem; font-weight:700; color:#4ade80;">+${s.score}</span>
                    </div>`).join('')}
            </div>` : ''}

            ${negativeSignals.length ? `
            <div style="margin-bottom:14px;">
                <div style="font-size:0.75rem; font-weight:700; color:rgba(255,255,255,0.4); letter-spacing:0.5px; margin-bottom:10px;">⚠️ CHALLENGING FACTORS</div>
                ${negativeSignals.map(s => `
                    <div style="display:flex; align-items:center; gap:10px; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15);
                                border-radius:10px; padding:10px 14px; margin-bottom:8px;">
                        <span style="font-size:1.1rem;">${s.icon}</span>
                        <span style="flex:1; font-size:0.88rem; color:#e2e8f0; line-height:1.4;">${s.label}</span>
                        <span style="font-size:0.85rem; font-weight:700; color:#f87171;">${s.score}</span>
                    </div>`).join('')}
            </div>` : ''}

            ${neutralSignals.length ? `
            <div style="margin-bottom:14px;">
                ${neutralSignals.map(s => `
                    <div style="display:flex; align-items:center; gap:10px; background:rgba(99,102,241,0.07); border:1px solid rgba(99,102,241,0.2);
                                border-radius:10px; padding:10px 14px; margin-bottom:8px;">
                        <span style="font-size:1.1rem;">${s.icon}</span>
                        <span style="flex:1; font-size:0.88rem; color:#e2e8f0; line-height:1.4;">${s.label}</span>
                    </div>`).join('')}
            </div>` : ''}

            ${result.totalScore < 50 ? `
            <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); border-radius:12px; padding:14px 16px; margin-top:4px;">
                <span style="font-size:0.85rem; color:#fbbf24; line-height:1.6;">
                    💡 <strong>Tip:</strong> This path is challenging because ${result.weakPlanetsInfo.length > 0 
                        ? result.weakPlanetsInfo.map(i => `<strong>${i.planet}</strong> ${i.reason}`).join(', and ') 
                        : 'your key career pillars (Saturn and 10th Lord) lack sufficient strength for this specific choice'}. 
                    Consider strengthening these planets via their remedies, or explore your top recommended careers for a smoother journey.
                </span>
            </div>` : `
            <div style="background:rgba(34,197,94,0.07); border:1px solid rgba(34,197,94,0.2); border-radius:12px; padding:14px 16px; margin-top:4px;">
                <span style="font-size:0.85rem; color:#86efac; line-height:1.6;">
                    🌟 <strong>Insight:</strong> Your chart shows alignment with this choice. Time your major career moves during your favourable Mahadasha periods for maximum success.
                </span>
            </div>`}
        </div>
        <style>@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }</style>`;

        // Scroll to result
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    window._careerEngine = engine;
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
