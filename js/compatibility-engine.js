/**
 * Compatibility Engine — Vedic Kundali Milan (Ashtakoot System)
 * Calculates the 36-point compatibility score + synastry analysis
 */

class CompatibilityEngine {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();

        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.lordMap = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];

        // 27 Nakshatras with lord, gana, yoni, nadi, rajju, vedha
        this.nakshatras = [
            { name: 'Ashwini', lord: 'ketu', gana: 'deva', yoni: 'horse', nadi: 'adi', rajju: 'pada', vedha: 17 },
            { name: 'Bharani', lord: 'venus', gana: 'manushya', yoni: 'elephant', nadi: 'madhya', rajju: 'kati', vedha: 16 },
            { name: 'Krittika', lord: 'sun', gana: 'rakshasa', yoni: 'goat', nadi: 'antya', rajju: 'nabhi', vedha: 15 },
            { name: 'Rohini', lord: 'moon', gana: 'manushya', yoni: 'serpent', nadi: 'antya', rajju: 'kantha', vedha: 14 },
            { name: 'Mrigashira', lord: 'mars', gana: 'deva', yoni: 'serpent', nadi: 'madhya', rajju: 'shira', vedha: 13 },
            { name: 'Ardra', lord: 'rahu', gana: 'manushya', yoni: 'dog', nadi: 'adi', rajju: 'kantha', vedha: 21 },
            { name: 'Punarvasu', lord: 'jupiter', gana: 'deva', yoni: 'cat', nadi: 'adi', rajju: 'nabhi', vedha: 20 },
            { name: 'Pushya', lord: 'saturn', gana: 'deva', yoni: 'goat', nadi: 'madhya', rajju: 'kati', vedha: 19 },
            { name: 'Ashlesha', lord: 'mercury', gana: 'rakshasa', yoni: 'cat', nadi: 'antya', rajju: 'pada', vedha: 18 },
            { name: 'Magha', lord: 'ketu', gana: 'rakshasa', yoni: 'rat', nadi: 'antya', rajju: 'pada', vedha: 26 },
            { name: 'P.Phalguni', lord: 'venus', gana: 'manushya', yoni: 'rat', nadi: 'madhya', rajju: 'kati', vedha: 25 },
            { name: 'U.Phalguni', lord: 'sun', gana: 'manushya', yoni: 'cow', nadi: 'adi', rajju: 'nabhi', vedha: 24 },
            { name: 'Hasta', lord: 'moon', gana: 'deva', yoni: 'buffalo', nadi: 'adi', rajju: 'kantha', vedha: 23 },
            { name: 'Chitra', lord: 'mars', gana: 'rakshasa', yoni: 'tiger', nadi: 'madhya', rajju: 'shira', vedha: 22 },
            { name: 'Swati', lord: 'rahu', gana: 'deva', yoni: 'buffalo', nadi: 'antya', rajju: 'kantha', vedha: 2 },
            { name: 'Vishakha', lord: 'jupiter', gana: 'rakshasa', yoni: 'tiger', nadi: 'antya', rajju: 'nabhi', vedha: 1 },
            { name: 'Anuradha', lord: 'saturn', gana: 'deva', yoni: 'deer', nadi: 'madhya', rajju: 'kati', vedha: 0 },
            { name: 'Jyeshtha', lord: 'mercury', gana: 'rakshasa', yoni: 'deer', nadi: 'adi', rajju: 'pada', vedha: 8 },
            { name: 'Mula', lord: 'ketu', gana: 'rakshasa', yoni: 'dog', nadi: 'adi', rajju: 'pada', vedha: 7 },
            { name: 'P.Ashadha', lord: 'venus', gana: 'manushya', yoni: 'monkey', nadi: 'madhya', rajju: 'kati', vedha: 6 },
            { name: 'U.Ashadha', lord: 'sun', gana: 'manushya', yoni: 'mongoose', nadi: 'antya', rajju: 'nabhi', vedha: 5 },
            { name: 'Shravana', lord: 'moon', gana: 'deva', yoni: 'monkey', nadi: 'antya', rajju: 'kantha', vedha: 4 },
            { name: 'Dhanishtha', lord: 'mars', gana: 'rakshasa', yoni: 'lion', nadi: 'madhya', rajju: 'shira', vedha: 3 },
            { name: 'Shatabhisha', lord: 'rahu', gana: 'rakshasa', yoni: 'horse', nadi: 'adi', rajju: 'kantha', vedha: 11 },
            { name: 'P.Bhadra', lord: 'jupiter', gana: 'manushya', yoni: 'lion', nadi: 'adi', rajju: 'nabhi', vedha: 10 },
            { name: 'U.Bhadra', lord: 'saturn', gana: 'manushya', yoni: 'cow', nadi: 'madhya', rajju: 'kati', vedha: 9 },
            { name: 'Revati', lord: 'mercury', gana: 'deva', yoni: 'elephant', nadi: 'antya', rajju: 'pada', vedha: 8 }
        ];

        // Varna order (1=Brahmin highest)
        this.varnaMap = {
            'Cancer': 'brahmin', 'Scorpio': 'brahmin', 'Pisces': 'brahmin',      // Water
            'Aries': 'kshatriya', 'Leo': 'kshatriya', 'Sagittarius': 'kshatriya', // Fire
            'Taurus': 'vaishya', 'Virgo': 'vaishya', 'Capricorn': 'vaishya',      // Earth
            'Gemini': 'shudra', 'Libra': 'shudra', 'Aquarius': 'shudra'           // Air
        };
        this.varnaOrder = ['brahmin', 'kshatriya', 'vaishya', 'shudra'];

        // Vasya groups
        this.vasyaGroups = {
            chatushpada: ['Aries', 'Taurus', 'second-half-Capricorn'],
            jalchara: ['Cancer', 'Pisces', 'first-half-Capricorn'],
            manava: ['Gemini', 'Virgo', 'Libra', 'first-half-Sagittarius', 'Aquarius'],
            vanachara: ['Leo'],
            keeta: ['Scorpio'],
            dwipada: ['second-half-Sagittarius']
        };

        // Vasya Matrix (Row=Boy, Col=Girl). 2=Full, 1=Half, 0=Zero, 0.5=Quarter. We use 2/1/0/0.5
        this.vasyaMatrix = {
            'chatushpada-chatushpada': 2, 'chatushpada-jalchara': 1, 'chatushpada-manava': 1, 'chatushpada-vanachara': 0, 'chatushpada-keeta': 1,
            'jalchara-chatushpada': 1, 'jalchara-jalchara': 2, 'jalchara-manava': 1, 'jalchara-vanachara': 1, 'jalchara-keeta': 1,
            'manava-chatushpada': 1, 'manava-jalchara': 1, 'manava-manava': 2, 'manava-vanachara': 0.5, 'manava-keeta': 0,
            'vanachara-chatushpada': 0, 'vanachara-jalchara': 1, 'vanachara-manava': 0.5, 'vanachara-vanachara': 2, 'vanachara-keeta': 0,
            'keeta-chatushpada': 1, 'keeta-jalchara': 1, 'keeta-manava': 0, 'keeta-vanachara': 0, 'keeta-keeta': 2
        };

        // Yoni compatibility table (friendly pairs score full marks)
        this.yoniMatrix = {
            'horse': { horse: 4, elephant: 2, goat: 2, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 0, tiger: 1, deer: 2, monkey: 2, mongoose: 2, lion: 1 },
            'elephant': { horse: 2, elephant: 4, goat: 2, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 1, deer: 2, monkey: 2, mongoose: 2, lion: 0 },
            'goat': { horse: 2, elephant: 2, goat: 4, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 1, deer: 2, monkey: 0, mongoose: 2, lion: 1 },
            'serpent': { horse: 2, elephant: 2, goat: 2, serpent: 4, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 1, deer: 2, monkey: 2, mongoose: 0, lion: 1 },
            'dog': { horse: 2, elephant: 2, goat: 2, serpent: 2, dog: 4, cat: 1, rat: 2, cow: 2, buffalo: 2, tiger: 1, deer: 0, monkey: 2, mongoose: 2, lion: 1 },
            'cat': { horse: 2, elephant: 2, goat: 2, serpent: 2, dog: 1, cat: 4, rat: 0, cow: 2, buffalo: 2, tiger: 1, deer: 2, monkey: 2, mongoose: 2, lion: 1 },
            'rat': { horse: 2, elephant: 2, goat: 2, serpent: 2, dog: 2, cat: 0, rat: 4, cow: 2, buffalo: 2, tiger: 1, deer: 2, monkey: 2, mongoose: 1, lion: 1 },
            'cow': { horse: 2, elephant: 2, goat: 2, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 4, buffalo: 2, tiger: 0, deer: 2, monkey: 2, mongoose: 2, lion: 1 },
            'buffalo': { horse: 0, elephant: 2, goat: 2, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 4, tiger: 1, deer: 2, monkey: 2, mongoose: 2, lion: 1 },
            'tiger': { horse: 1, elephant: 1, goat: 1, serpent: 1, dog: 1, cat: 1, rat: 1, cow: 0, buffalo: 1, tiger: 4, deer: 1, monkey: 1, mongoose: 1, lion: 1 },
            'deer': { horse: 2, elephant: 2, goat: 2, serpent: 2, dog: 0, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 1, deer: 4, monkey: 2, mongoose: 2, lion: 1 },
            'monkey': { horse: 2, elephant: 2, goat: 0, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 1, deer: 2, monkey: 4, mongoose: 2, lion: 1 },
            'mongoose': { horse: 2, elephant: 2, goat: 2, serpent: 0, dog: 2, cat: 2, rat: 1, cow: 2, buffalo: 2, tiger: 1, deer: 2, monkey: 2, mongoose: 4, lion: 1 },
            'lion': { horse: 1, elephant: 0, goat: 1, serpent: 1, dog: 1, cat: 1, rat: 1, cow: 1, buffalo: 1, tiger: 1, deer: 1, monkey: 1, mongoose: 1, lion: 4 }
        };

        // Gana compatibility scores
        this.ganaScore = { 'deva-deva': 6, 'manushya-manushya': 6, 'rakshasa-rakshasa': 6, 'deva-manushya': 5, 'manushya-deva': 5, 'deva-rakshasa': 0, 'rakshasa-deva': 0, 'manushya-rakshasa': 0, 'rakshasa-manushya': 0 };

        // Full Parashari natural planet relationships: friends / neutrals / enemies
        // Source: Brihat Parashara Hora Shastra — permanent (naisargika) relationships
        this.planetRelations = {
            sun: { friends: ['moon', 'mars', 'jupiter'], neutrals: ['mercury'], enemies: ['saturn', 'venus', 'rahu', 'ketu'] },
            moon: { friends: ['sun', 'mercury'], neutrals: ['mars', 'jupiter', 'venus', 'saturn'], enemies: ['rahu', 'ketu'] },
            mars: { friends: ['sun', 'moon', 'jupiter'], neutrals: ['venus', 'saturn', 'ketu'], enemies: ['mercury', 'rahu'] },
            mercury: { friends: ['sun', 'venus'], neutrals: ['mars', 'jupiter', 'saturn', 'rahu', 'ketu'], enemies: ['moon'] },
            jupiter: { friends: ['sun', 'moon', 'mars'], neutrals: ['saturn', 'ketu'], enemies: ['mercury', 'venus', 'rahu'] },
            venus: { friends: ['mercury', 'saturn'], neutrals: ['mars', 'jupiter', 'rahu', 'ketu'], enemies: ['sun', 'moon'] },
            saturn: { friends: ['mercury', 'venus'], neutrals: ['jupiter', 'rahu', 'ketu'], enemies: ['sun', 'moon', 'mars'] }
        };

        // Graha Maitri score matrix based on traditional Mitra/Sama/Shatru combinations
        // Key: 'p1relation-p2relation'
        this.grahaMaitriMatrix = {
            'friend-friend': 5,
            'friend-neutral': 4, 'neutral-friend': 4,
            'neutral-neutral': 3,
            'friend-enemy': 1, 'enemy-friend': 1,
            'neutral-enemy': 0.5, 'enemy-neutral': 0.5,
            'enemy-enemy': 0
        };
        // Map English Yoni names to Sanskrit names for display
        this.yoniSanskrit = {
            'horse': 'Ashwa', 'elephant': 'Gaja', 'goat': 'Mesha', 'serpent': 'Sarpa',
            'dog': 'Shwan', 'cat': 'Marjar', 'rat': 'Mushak', 'cow': 'Gau',
            ' buffalo': 'Mahish', 'tiger': 'Vyagh', 'deer': 'Mriga', 'monkey': 'Vanar',
            'mongoose': 'Nakul', 'lion': 'Simha'
        };
    }

    getNakshatra(moonLong) {
        const idx = Math.floor(moonLong / 13.3333) % 27;
        return { ...this.nakshatras[idx], idx };
    }

    getSignIndex(long) { return Math.floor(long / 30); }

    // --- 8 KOOTA CALCULATIONS ---

    // 1. Varna — 1 point
    // Traditional rule: Boy's varna must be EQUAL or HIGHER than girl's varna
    // Hierarchy index: brahmin=0 (highest), kshatriya=1, vaishya=2, shudra=3 (lowest)
    // Boy scores 1 point only when his index <= girl's index (equal or higher caste)
    // Example: Boy=Vaishya(2), Girl=Kshatriya(1) → 2 > 1 → FAIL → 0 points
    calcVarna(chart1, chart2) {
        const s1 = this.signs[this.getSignIndex(chart1.planets.moon)]; // Person 1 / Boy
        const s2 = this.signs[this.getSignIndex(chart2.planets.moon)]; // Person 2 / Girl
        const v1 = this.varnaOrder.indexOf(this.varnaMap[s1] || 'shudra');
        const v2 = this.varnaOrder.indexOf(this.varnaMap[s2] || 'shudra');
        const score = v1 <= v2 ? 1 : 0; // lower index = higher varna; boy must be <= girl's index
        return { name: 'Varna', max: 1, score, desc: `${s1} (${this.varnaMap[s1] || '?'}) + ${s2} (${this.varnaMap[s2] || '?'})`, meaning: 'Spiritual compatibility & inner nature' };
    }

    // 2. Vasya — 2 points
    calcVasya(chart1, chart2) {
        const s1 = this.signs[this.getSignIndex(chart1.planets.moon)];
        const s2 = this.signs[this.getSignIndex(chart2.planets.moon)];
        const getGroup = (s) => { for (const [g, arr] of Object.entries(this.vasyaGroups)) { if (arr.some(a => a.includes(s))) return g; } return 'manava'; };
        const g1 = getGroup(s1); const g2 = getGroup(s2);
        const score = this.vasyaMatrix[`${g1}-${g2}`] ?? (g1 === g2 ? 2 : 1);
        return { name: 'Vasya', max: 2, score, desc: `${s1}(${g1}) + ${s2}(${g2})`, meaning: 'Power & mutual attraction' };
    }

    // 3. Tara — 3 points
    calcTara(chart1, chart2) {
        const nak1 = this.getNakshatra(chart1.planets.moon);
        const nak2 = this.getNakshatra(chart2.planets.moon);
        const diff1 = (nak2.idx - nak1.idx + 27) % 9;
        const diff2 = (nak1.idx - nak2.idx + 27) % 9;
        const badTaras = [2, 4, 6]; // Vipat, Pratyari, Vadha (index 2,4,6 are 3rd, 5th, 7th)
        const s1 = !badTaras.includes(diff1) ? 1.5 : 0;
        const s2 = !badTaras.includes(diff2) ? 1.5 : 0;
        const score = s1 + s2; // Do not round this, it MUST support 1.5 points
        return { name: 'Tara', max: 3, score, desc: `${nak1.name} ↔ ${nak2.name}`, meaning: 'Birth star compatibility & destiny' };
    }

    // 4. Yoni — 4 points
    calcYoni(chart1, chart2) {
        const nak1 = this.getNakshatra(chart1.planets.moon);
        const nak2 = this.getNakshatra(chart2.planets.moon);
        const y1 = nak1.yoni; const y2 = nak2.yoni;
        const name1 = this.yoniSanskrit[y1] || y1;
        const name2 = this.yoniSanskrit[y2] || y2;
        const isSame = y1 === y2;
        const score = this.yoniMatrix[y1]?.[y2] ?? (isSame ? 4 : 2);
        const isEnemy = score <= 1 && !isSame;
        return { name: 'Yoni', max: 4, score, desc: `${name1} ↔ ${name2}${isEnemy ? ' ⚠️ Enemy Yoni' : ''}`, meaning: 'Sexual/physical compatibility & intimacy' };
    }

    // 5. Graha Maitri — 5 points
    // Uses full Parashari friend/neutral/enemy table with traditional scoring matrix
    // Mitra+Mitra=5, Mitra+Sama=4, Sama+Sama=3, Mitra+Shatru=1, Sama+Shatru=0.5, Shatru+Shatru=0
    calcGrahaMaitri(chart1, chart2) {
        const lord1 = this.lordMap[this.getSignIndex(chart1.planets.moon)];
        const lord2 = this.lordMap[this.getSignIndex(chart2.planets.moon)];

        const getRelation = (from, to) => {
            if (from === to) return 'friend'; // Same planet is always friendly to itself
            const rels = this.planetRelations[from];
            if (!rels) return 'neutral';
            if (rels.friends.includes(to)) return 'friend';
            if (rels.enemies.includes(to)) return 'enemy';
            return 'neutral'; // default = Sama (neutral)
        };

        const rel12 = getRelation(lord1, lord2); // How lord1 sees lord2
        const rel21 = getRelation(lord2, lord1); // How lord2 sees lord1
        const key = `${rel12}-${rel21}`;
        const score = this.grahaMaitriMatrix[key] ?? 3;

        return { name: 'Graha Maitri', max: 5, score, desc: `${lord1}(${rel12}) ↔ ${lord2}(${rel21})`, meaning: 'Mental & emotional friendship' };
    }

    // 6. Gana — 6 points
    calcGana(chart1, chart2) {
        const nak1 = this.getNakshatra(chart1.planets.moon);
        const nak2 = this.getNakshatra(chart2.planets.moon);
        const key = `${nak1.gana}-${nak2.gana}`;
        const score = this.ganaScore[key] ?? 0;
        return { name: 'Gana', max: 6, score, desc: `${nak1.gana} ↔ ${nak2.gana}`, meaning: 'Temperament & behavioral compatibility' };
    }

    // 7. Bhakut — 7 points
    calcBhakut(chart1, chart2) {
        const s1 = this.getSignIndex(chart1.planets.moon);
        const s2 = this.getSignIndex(chart2.planets.moon);
        const diff = Math.abs(s1 - s2);
        const badPairs = [0, 5, 6, 11]; // 1/1, 6/8, 7/7 dosha, 12/2
        const realDiff = Math.min(diff, 12 - diff);
        const normalized = (s2 - s1 + 12) % 12 + 1;
        const isBad = [6, 8, 12].some(b => normalized === b || (12 - normalized + 2) === b);
        const score = isBad ? 0 : 7;
        return { name: 'Bhakut', max: 7, score, desc: `Sign ${s1 + 1} ↔ Sign ${s2 + 1} (gap: ${normalized - 1})`, meaning: 'Emotional & life prosperity compatibility' };
    }

    // 8. Nadi — 8 points
    calcNadi(chart1, chart2) {
        const nak1 = this.getNakshatra(chart1.planets.moon);
        const nak2 = this.getNakshatra(chart2.planets.moon);
        const score = nak1.nadi !== nak2.nadi ? 8 : 0;
        const nadiDosha = nak1.nadi === nak2.nadi;

        // Cancellations
        let cancelled = false;
        let cancelReason = '';
        if (nadiDosha) {
            if (nak1.name === nak2.name) {
                // Same Nakshatra but different Quarters (Padas) cancels Nadi Dosha
                const q1 = Math.floor((chart1.planets.moon % 13.3333) / 3.3333);
                const q2 = Math.floor((chart2.planets.moon % 13.3333) / 3.3333);
                if (q1 !== q2) {
                    cancelled = true;
                    cancelReason = 'Same Nakshatra, different Padas (quarters)';
                }
            } else if (this.getSignIndex(chart1.planets.moon) === this.getSignIndex(chart2.planets.moon)) {
                // Same Rashi, different Nakshatras cancels
                cancelled = true;
                cancelReason = 'Same Rashi, different Nakshatras';
            }
        }

        return {
            name: 'Nadi', max: 8, score: cancelled ? 8 : score,
            desc: `${nak1.nadi} ↔ ${nak2.nadi}${nadiDosha && !cancelled ? ' ⚠️ Nadi Dosha!' : ''}`,
            meaning: 'Health & progeny (highest importance)',
            dosha: nadiDosha && !cancelled,
            cancelled,
            cancelReason
        };
    }

    // --- NEW DOSHAS ---

    // Rajju Dosha
    calcRajju(chart1, chart2) {
        const nak1 = this.getNakshatra(chart1.planets.moon);
        const nak2 = this.getNakshatra(chart2.planets.moon);
        const r1 = nak1.rajju || 'unknown';
        const r2 = nak2.rajju || 'unknown';
        const dosha = r1 === r2;

        let interp = '';
        if (dosha) {
            if (r1 === 'shira') interp = 'Shira Rajju (Head): Danger to husband\'s life or severe intellectual clash.';
            if (r1 === 'kantha') interp = 'Kantha Rajju (Neck): Danger to wife\'s life or throat/speech issues.';
            if (r1 === 'nabhi') interp = 'Nabhi Rajju (Navel): Problems concerning children and progeny.';
            if (r1 === 'kati') interp = 'Kati Rajju (Waist): Financial struggles and poverty.';
            if (r1 === 'pada') interp = 'Pada Rajju (Feet): Wandering, instability, and joint pains.';
        }

        return { r1, r2, dosha, interp };
    }

    // Vedha Dosha (Obstruction)
    calcVedha(chart1, chart2) {
        const nak1 = this.getNakshatra(chart1.planets.moon);
        const nak2 = this.getNakshatra(chart2.planets.moon);
        const dosha = nak1.vedha === nak2.idx || nak2.vedha === nak1.idx;
        return { dosha, n1: nak1.name, n2: nak2.name };
    }

    // Papasamya (Balance of Malefics)
    getPapasamya(chart1, chart2) {
        const malefics = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
        const doshaHouses = [1, 2, 4, 7, 8, 12];

        let p1Score = 0;
        let p2Score = 0;

        const scoreMalefics = (chart) => {
            let score = 0;
            const ascendant = chart.ascendant;
            malefics.forEach(p => {
                const house = this.astrologyEngine.getHouseNumber(chart.planets[p], ascendant);
                if (doshaHouses.includes(house)) {
                    // Mars is given more weight (Manglik)
                    const weight = p === 'mars' ? 2 : 1;
                    score += weight;
                }
            });
            return score;
        };

        p1Score = scoreMalefics(chart1);
        p2Score = scoreMalefics(chart2);

        // Ideally, girl's score should be slightly <= boy's score.
        // Or they should be within ±1 of each other.
        const diff = Math.abs(p1Score - p2Score);
        const isBalanced = diff <= 2;

        return { p1Score, p2Score, isBalanced };
    }

    // Full Ashtakoot calculation
    calculateAshtakoot(chart1, chart2) {
        const kootas = [
            this.calcVarna(chart1, chart2),
            this.calcVasya(chart1, chart2),
            this.calcTara(chart1, chart2),
            this.calcYoni(chart1, chart2),
            this.calcGrahaMaitri(chart1, chart2),
            this.calcGana(chart1, chart2),
            this.calcBhakut(chart1, chart2),
            this.calcNadi(chart1, chart2)
        ];
        // Use precise decimal sum (Graha Maitri and Tara can give 0.5, 1.5 etc.)
        const total = Math.round(kootas.reduce((sum, k) => sum + k.score, 0) * 2) / 2;
        const max = 36;

        let verdict, verdictColor, verdictEmoji;
        if (total >= 33) { verdict = 'Exceptional Match'; verdictColor = '#eab308'; verdictEmoji = '🌟'; }
        else if (total >= 25) { verdict = 'Very Good Match'; verdictColor = '#22c55e'; verdictEmoji = '💚'; }
        else if (total >= 18) { verdict = 'Average Match'; verdictColor = '#f97316'; verdictEmoji = '🟡'; }
        else { verdict = 'Challenging Match'; verdictColor = '#ef4444'; verdictEmoji = '⚠️'; }

        const rajju = this.calcRajju(chart1, chart2);
        const vedha = this.calcVedha(chart1, chart2);
        const papasamya = this.getPapasamya(chart1, chart2);

        // Person-level basic info
        const p1Info = { nakshatra: this.getNakshatra(chart1.planets.moon), sign: this.signs[this.getSignIndex(chart1.planets.moon)] };
        const p2Info = { nakshatra: this.getNakshatra(chart2.planets.moon), sign: this.signs[this.getSignIndex(chart2.planets.moon)] };

        return { kootas, total, max, verdict, verdictColor, verdictEmoji, rajju, vedha, papasamya, p1Info, p2Info };
    }

    // Manglik Dosha check
    checkManglik(chart) {
        const houses = [1, 2, 4, 7, 8, 12];
        const eng = this.astrologyEngine;
        const marsHouse = eng.getHouseNumber(chart.planets.mars, chart.ascendant);
        const isManglik = houses.includes(marsHouse);

        let severity = 'None';
        if (isManglik) {
            if ([7, 8].includes(marsHouse)) severity = 'High';
            else if ([1, 4].includes(marsHouse)) severity = 'Moderate';
            else severity = 'Low';
        }

        // Cancellation factors
        const cancellations = [];
        if (chart.planets.mars && this.astrologyEngine.isExalted('mars', chart.planets.mars)) {
            cancellations.push('Mars is Exalted (cancels Dosha)');
        }
        const marsSign = Math.floor(chart.planets.mars / 30);
        if (marsSign === 0 || marsSign === 7) cancellations.push('Mars in own sign (cancels Dosha)');

        return { isManglik, marsHouse, severity, cancellations };
    }

    // Synastry — where P2's planets fall in P1's houses
    calculateSynastry(chart1, chart2) {
        const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
        return planets.map(p => {
            const house = this.astrologyEngine.getHouseNumber(chart2.planets[p], chart1.ascendant);
            const isGood = [1, 2, 4, 5, 7, 9, 10, 11].includes(house);
            const sign = this.signs[Math.floor(chart2.planets[p] / 30)];
            return { planet: p, house, sign, isGood };
        });
    }

    makeChart(birthDetails) {
        return this.astrologyEngine.calculateBirthChart(birthDetails);
    }
}
