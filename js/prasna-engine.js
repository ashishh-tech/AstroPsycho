/**
 * prasna-engine.js — Vedic Horary (Prasna) Astrology Engine
 * Analyzes the chart cast for the current moment to answer a specific question.
 */

class PrasnaEngine {
    constructor() {
        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.signLords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
        this.exaltation = { sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6 }; // sign index
        this.debilitation = { sun: 6, moon: 7, mars: 3, mercury: 11, jupiter: 9, venus: 5, saturn: 0 };
        this.ownSigns = {
            sun: [4], moon: [3], mars: [0, 7], mercury: [2, 5], jupiter: [8, 11], venus: [1, 6], saturn: [9, 10],
            rahu: [9], ketu: [3]
        };
        // Question categories → house signified
        this.categories = {
            love: { house: 7, karaka: 'venus', label: 'Love & Relationships' },
            marriage: { house: 7, karaka: 'venus', label: 'Marriage' },
            career: { house: 10, karaka: 'saturn', label: 'Career & Job' },
            business: { house: 7, karaka: 'mercury', label: 'Business & Partnership' },
            health: { house: 1, karaka: 'sun', label: 'Health & Body' },
            finance: { house: 2, karaka: 'jupiter', label: 'Finance & Wealth' },
            property: { house: 4, karaka: 'mars', label: 'Property & Land' },
            education: { house: 4, karaka: 'jupiter', label: 'Education & Learning' },
            travel: { house: 12, karaka: 'saturn', label: 'Travel & Journey' },
            legal: { house: 6, karaka: 'mars', label: 'Legal & Disputes' },
            children: { house: 5, karaka: 'jupiter', label: 'Children' },
            spiritual: { house: 9, karaka: 'jupiter', label: 'Spirituality & Dharma' },
        };
        // Nakshatra names
        this.nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya',
            'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
            'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
            'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
        this.auspiciousNaks = [0, 3, 6, 7, 12, 14, 15, 16, 26]; // Ashwini,Rohini,Punarvasu,Pushya,Hasta,Swati,Vishakha,Anuradha,Revati
        this.maleficNaks = [8, 9, 17, 18]; // Ashlesha,Magha,Jyeshtha,Mula
    }

    getPlanetStrength(planet, sign, degree) {
        const signIdx = this.signs.indexOf(sign);
        if (signIdx < 0) return 50;
        let str = 50;
        if (this.exaltation[planet] === signIdx) str += 35;
        else if (this.debilitation[planet] === signIdx) str -= 35;
        else if (this.ownSigns[planet] && this.ownSigns[planet].includes(signIdx)) str += 20;
        // Degree-based (close to exact exaltation degree = strongest)
        return Math.max(0, Math.min(100, str));
    }

    getLagnaLord(ascendantDeg) {
        return this.signLords[Math.floor(ascendantDeg / 30)];
    }

    getHouseLord(house, ascendantDeg) {
        const lagnaSign = Math.floor(ascendantDeg / 30);
        const houseSign = (lagnaSign + house - 1) % 12;
        return this.signLords[houseSign];
    }

    getNakshatra(longitude) {
        const idx = Math.floor(longitude / 13.333333) % 27;
        return { name: this.nakshatras[idx], index: idx };
    }

    getHouseNumber(longitude, ascendant) {
        const offset = (longitude - ascendant + 360) % 360;
        return Math.floor(offset / 30) + 1;
    }

    /**
     * Main analysis function
     * @param {object} prasnaChart - planet longitudes for current moment
     * @param {number} ascendant - ascendant degree
     * @param {string} category - category key (love, career, etc.)
     * @param {string} question - user's question text
     */
    analyze(prasnaChart, ascendant, category, question) {
        const cat = this.categories[category] || this.categories.love;
        const lagnaLord = this.getLagnaLord(ascendant);
        const quesitedLord = this.getHouseLord(cat.house, ascendant);
        const moonLong = prasnaChart.moon;
        const moonSign = this.signs[Math.floor(moonLong / 30)];
        const moonNak = this.getNakshatra(moonLong);
        const moonHouse = this.getHouseNumber(moonLong, ascendant);
        const lagnaSign = this.signs[Math.floor(ascendant / 30)];

        // Lagna Lord strength
        const llSign = this.signs[Math.floor(prasnaChart[lagnaLord] / 30)];
        const llDeg = prasnaChart[lagnaLord] % 30;
        const llStr = this.getPlanetStrength(lagnaLord, llSign, llDeg);
        const llHouse = this.getHouseNumber(prasnaChart[lagnaLord], ascendant);

        // Quesited lord strength
        const qlSign = quesitedLord && prasnaChart[quesitedLord] ?
            this.signs[Math.floor(prasnaChart[quesitedLord] / 30)] : null;
        const qlStr = qlSign ? this.getPlanetStrength(quesitedLord, qlSign, prasnaChart[quesitedLord] % 30) : 50;
        const qlHouse = qlSign ? this.getHouseNumber(prasnaChart[quesitedLord], ascendant) : null;

        // Moon assessment
        const moonInAuspNak = this.auspiciousNaks.includes(moonNak.index);
        const moonInMalNak = this.maleficNaks.includes(moonNak.index);
        const moonPaksha = ((moonLong - prasnaChart.sun + 360) % 360) < 180 ? 'Shukla (Waxing)' : 'Krishna (Waning)';
        const moonStrong = moonInAuspNak && !moonInMalNak;

        // Favourable houses for quesited lord
        const favourableHouses = [1, 5, 7, 9, 10, 11];
        const qlFavourable = qlHouse && favourableHouses.includes(qlHouse);
        const llFavourable = favourableHouses.includes(llHouse);

        // Check if lagna lord and quesited lords are in mutual relationship
        const mutual = (qlHouse === llHouse) || (llHouse === cat.house) || (qlHouse === 1);

        // Karaka strength
        const kar = cat.karaka;
        const karSign = prasnaChart[kar] ? this.signs[Math.floor(prasnaChart[kar] / 30)] : null;
        const karStr = karSign ? this.getPlanetStrength(kar, karSign, prasnaChart[kar] % 30) : 50;

        // Overall scoring
        let score = 50;
        if (llStr > 70) score += 15; else if (llStr < 35) score -= 15;
        if (qlStr > 70) score += 15; else if (qlStr < 35) score -= 15;
        if (moonStrong) score += 12; else if (moonInMalNak) score -= 12;
        if (qlFavourable) score += 10; else score -= 5;
        if (llFavourable) score += 8;
        if (mutual) score += 12;
        if (karStr > 70) score += 8; else if (karStr < 35) score -= 8;
        if (moonPaksha.includes('Shukla')) score += 5;

        score = Math.max(5, Math.min(95, score));

        let verdict, verdictColor, verdictIcon;
        if (score >= 65) { verdict = 'YES — Favourable'; verdictColor = '#64ffda'; verdictIcon = '✅'; }
        else if (score >= 42) { verdict = 'POSSIBLE — Mixed'; verdictColor = '#f4c430'; verdictIcon = '⚡'; }
        else { verdict = 'NOT ADVISED — Challenging'; verdictColor = '#ff6b9d'; verdictIcon = '⚠️'; }

        // Timing estimate (degrees remaining for lagna lord to reach next sign)
        const llLong = prasnaChart[lagnaLord] || 0;
        const degRemaining = 30 - (llLong % 30);
        const timingWeeks = Math.round(degRemaining * 0.8);
        const timingMonths = (degRemaining / 30).toFixed(1);

        // Detailed reasoning
        const reasons = [];
        if (llStr > 65) reasons.push(`✓ Lagna Lord ${lagnaLord.charAt(0).toUpperCase() + lagnaLord.slice(1)} is strong in ${llSign} — the querent has strength and support.`);
        else if (llStr < 40) reasons.push(`⚠ Lagna Lord ${lagnaLord.charAt(0).toUpperCase() + lagnaLord.slice(1)} is weak in ${llSign} — present circumstances are difficult.`);
        if (qlFavourable) reasons.push(`✓ Lord of the ${cat.house}th house (${quesitedLord}) is in a favourable house — the matter is achievable.`);
        else if (qlHouse) reasons.push(`⚠ Lord of the ${cat.house}th house is in House ${qlHouse} — obstacles exist in this area.`);
        if (mutual) reasons.push(`✓ Lagna Lord and ${cat.house}th Lord have a connection — the querent and the matter are linked.`);
        if (moonStrong) reasons.push(`✓ Moon is in ${moonNak.name} Nakshatra (auspicious) — emotions and mind are clear.`);
        else if (moonInMalNak) reasons.push(`⚠ Moon is in ${moonNak.name} Nakshatra (malefic) — watch for confusion or hidden obstacles.`);
        if (karStr > 65) reasons.push(`✓ ${kar.charAt(0).toUpperCase() + kar.slice(1)} (planet of ${cat.label}) is strong — the general energy for this topic is positive.`);
        else if (karStr < 40) reasons.push(`⚠ ${kar.charAt(0).toUpperCase() + kar.slice(1)} is weakened — strengthen it with appropriate remedies.`);

        // Special notes
        const special = [];
        if (moonHouse === 8 || moonHouse === 12) special.push('Moon in House 8/12 — hidden matters, delays possible');
        if (llHouse === 6 || llHouse === 8 || llHouse === 12) special.push('Lagna Lord in dusthana — the querent faces obstacles');
        if (qlHouse === 8) special.push(`${cat.house}th Lord in 8th — destruction or transformation of the matter`);
        if (qlHouse === 12) special.push(`${cat.house}th Lord in 12th — matter may slip away or be denied`);

        return {
            verdict, verdictColor, verdictIcon, score,
            lagnaSign, lagnaLord,
            moonSign, moonNak: moonNak.name, moonPaksha, moonHouse,
            llSign, llStr, llHouse,
            qlSign, qlStr, qlHouse, quesitedLord,
            karaka: kar, karSign, karStr,
            reasons, special,
            timing: `~${timingWeeks} weeks or ${timingMonths} months`,
            category: cat.label
        };
    }
}
