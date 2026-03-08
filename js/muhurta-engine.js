/**
 * muhurta-engine.js — Vedic Muhurta (Auspicious Timing) Calculator
 * Calculates Panchang for any date/time and scores it for specific activities.
 */

class MuhurtaEngine {
    constructor() {
        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya',
            'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
            'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
            'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
        this.yogas = ['Vishkambha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
            'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
            'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Sukla', 'Brahma', 'Indra', 'Vaidhriti'];
        this.karanas = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Nagava', 'Kimstughna'];
        this.weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.weekdayPlanets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

        // Good/Bad categories
        this.goodYogas = [1, 3, 5, 7, 9, 11, 15, 20, 22, 24, 25]; // 0-indexed: Preeti,Saubhagya,Shobhana,Sukarma,Dhriti,Vriddhi,Siddhi,Siddha,Sadhya,Shukla,Brahma
        this.badYogas = [0, 6, 8, 12, 16, 18, 26]; // Vishkambha,Dhriti,Shula,Vyaghata,Vyatipata,Parigha,Vaidhriti
        this.badKarana = 6; // Vishti/Bhadra always inauspicious

        // Nakshatra natures: 0=fixed,1=moveable,2=mixed,3=fierce,4=soft,5=sharp,6=dreadful
        this.nakNature = [4, 6, 5, 0, 2, 3, 2, 4, 3, 3, 1, 0, 2, 2, 1, 2, 4, 3, 3, 2, 0, 2, 2, 2, 3, 0, 2];
        // Good nakshatras for most activities (index)
        this.goodNaks = [0, 3, 5, 6, 7, 12, 13, 14, 15, 16, 20, 21, 22, 26]; // Ashwini,Rohini,Mrigashira,Punarvasu,Pushya,Hasta,Chitra,Swati,Vishakha,Anuradha,Uttara Ashadha,Shravana,Dhanishtha,Revati
        this.badNaks = [8, 9, 17, 18, 27]; // Ashlesha,Magha,Jyeshtha,Mula

        // Activity rule sets: {goodDays,badDays,goodNakBonus,avoidNaks,tithiBonus,tithiPenalty}
        this.activities = {
            marriage: { goodDays: [1, 3, 4, 5], badDays: [0, 2, 6], goodNaks: [3, 6, 7, 12, 14, 15, 16, 26], avoidNaks: [8, 9, 17, 18], goodTithis: [2, 5, 7, 10, 11, 13], badTithis: [4, 8, 14, 29] },
            business: { goodDays: [1, 3, 4], badDays: [0, 2, 6], goodNaks: [0, 3, 6, 7, 12, 14, 20], avoidNaks: [8, 9, 17, 18], goodTithis: [1, 2, 5, 10, 11, 12], badTithis: [4, 8, 14, 29] },
            travel: { goodDays: [1, 3, 4, 5], badDays: [2, 6], goodNaks: [0, 3, 6, 12, 14, 20, 21, 22], avoidNaks: [9, 17, 18], goodTithis: [2, 3, 5, 7, 10, 12], badTithis: [4, 8, 14, 29] },
            investment: { goodDays: [3, 4, 5], badDays: [0, 2, 6], goodNaks: [3, 7, 12, 20, 21, 22], avoidNaks: [8, 9, 17, 18], goodTithis: [1, 5, 10, 11, 12], badTithis: [4, 8, 14, 29] },
            education: { goodDays: [1, 3, 4], badDays: [2, 6], goodNaks: [0, 3, 6, 7, 12, 14, 20, 26], avoidNaks: [9, 17, 18], goodTithis: [1, 2, 5, 10, 11], badTithis: [4, 8, 14, 29] },
            medical: { goodDays: [1, 3, 5], badDays: [0, 2, 6], goodNaks: [0, 3, 7, 12, 14, 16, 26], avoidNaks: [8, 9, 17, 18], goodTithis: [1, 5, 7, 10, 11, 12], badTithis: [4, 8, 14, 29] },
            house: { goodDays: [1, 3, 4, 5], badDays: [0, 2, 6], goodNaks: [3, 7, 12, 14, 20, 21], avoidNaks: [8, 9, 17, 18], goodTithis: [2, 5, 10, 11, 12, 13], badTithis: [4, 8, 14, 29] },
            worship: { goodDays: [0, 1, 3, 4, 5], badDays: [2, 6], goodNaks: [3, 7, 12, 16, 20, 26], avoidNaks: [17, 18], goodTithis: [1, 4, 5, 8, 9, 10, 11, 12, 14, 29], badTithis: [] },
        };
    }

    // Sun longitude for a given JS Date (simplified)
    getSunLongitude(date) {
        const J2000 = 2451545.0;
        const jd = (date.getTime() / 86400000) + 2440587.5;
        const T = (jd - J2000) / 36525;
        const L0 = (280.46646 + 36000.76983 * T) % 360;
        const M = ((357.52911 + 35999.05029 * T) * Math.PI) / 180;
        const C = (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M);
        return (L0 + C + 360) % 360;
    }

    // Moon longitude (simplified)
    getMoonLongitude(date) {
        const jd = (date.getTime() / 86400000) + 2440587.5;
        const T = (jd - 2451545.0) / 36525;
        const L1 = (218.3164477 + 481267.88123421 * T) % 360;
        const M1 = ((134.9633964 + 477198.8675055 * T) % 360) * Math.PI / 180;
        const D = ((297.8501921 + 445267.1114034 * T) % 360) * Math.PI / 180;
        const correction = 6.288774 * Math.sin(M1) + 1.274027 * Math.sin(2 * D - M1) + 0.658314 * Math.sin(2 * D);
        return ((L1 + correction) % 360 + 360) % 360;
    }

    calcPanchang(date) {
        const sunLong = this.getSunLongitude(date);
        const moonLong = this.getMoonLongitude(date);
        const weekday = date.getDay(); // 0=Sun

        // Tithi: 1/12 of lunar month
        const elongation = ((moonLong - sunLong + 360) % 360);
        const tithiNum = Math.ceil(elongation / 12); // 1..30
        const paksha = tithiNum <= 15 ? 'Shukla' : 'Krishna';
        const tithiInPaksha = tithiNum <= 15 ? tithiNum : tithiNum - 15;
        const tithiNames = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami',
            'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'];
        const tithiName = (tithiNames[tithiInPaksha - 1] || 'Purnima') + ' ' + paksha;

        // Nakshatra
        const nakIdx = Math.floor(moonLong / 13.333333) % 27;

        // Yoga: (Sun+Moon)/13.333...
        const yogaIdx = Math.floor(((sunLong + moonLong) % 360) / 13.333333) % 27;

        // Karana (half-tithi)
        const karanaIdx = Math.floor(elongation / 6) % 11;
        const isVishti = karanaIdx === 6; // Bhadra/Vishti

        return {
            sunLong, moonLong, weekday,
            tithi: tithiNum, tithiName, paksha,
            nakshatra: this.nakshatras[nakIdx], nakIdx,
            yoga: this.yogas[yogaIdx], yogaIdx,
            karana: this.karanas[karanaIdx], isVishti,
            vara: this.weekdays[weekday],
            varaPlanet: this.weekdayPlanets[weekday],
            moonSign: this.signs[Math.floor(moonLong / 30)],
        };
    }

    scoreDay(panchang, activityKey) {
        const rules = this.activities[activityKey] || this.activities.business;
        let score = 50;
        const details = [];

        // Vara scoring
        if (rules.goodDays.includes(panchang.weekday)) { score += 15; details.push({ t: '✓ ' + panchang.vara + ' is auspicious for this activity', pos: true }); }
        else if (rules.badDays.includes(panchang.weekday)) { score -= 18; details.push({ t: '⚠ ' + panchang.vara + ' is unfavourable — avoid if possible', pos: false }); }

        // Nakshatra scoring
        if (rules.goodNaks.includes(panchang.nakIdx)) { score += 18; details.push({ t: '✓ ' + panchang.nakshatra + ' Nakshatra is excellent for this activity', pos: true }); }
        else if (rules.avoidNaks.includes(panchang.nakIdx)) { score -= 20; details.push({ t: '⚠ ' + panchang.nakshatra + ' Nakshatra is inauspicious — avoid', pos: false }); }
        else if (this.goodNaks.includes(panchang.nakIdx)) { score += 8; details.push({ t: '✓ ' + panchang.nakshatra + ' Nakshatra is generally good', pos: true }); }
        else if (this.badNaks.includes(panchang.nakIdx)) { score -= 12; details.push({ t: '⚠ ' + panchang.nakshatra + ' is a malefic Nakshatra', pos: false }); }

        // Tithi scoring
        if (rules.goodTithis.includes(panchang.tithi)) { score += 12; details.push({ t: '✓ Tithi ' + panchang.tithiName + ' is auspicious', pos: true }); }
        else if (rules.badTithis.includes(panchang.tithi)) { score -= 12; details.push({ t: '⚠ Tithi ' + panchang.tithiName + ' brings obstacles', pos: false }); }

        // Yoga scoring
        if (this.goodYogas.includes(panchang.yogaIdx)) { score += 10; details.push({ t: '✓ Yoga: ' + panchang.yoga + ' (auspicious)', pos: true }); }
        else if (this.badYogas.includes(panchang.yogaIdx)) { score -= 14; details.push({ t: '⚠ Yoga: ' + panchang.yoga + ' (inauspicious — avoid major actions)', pos: false }); }

        // Karana
        if (panchang.isVishti) { score -= 10; details.push({ t: '⚠ Vishti (Bhadra) Karana — traditionally inauspicious half of the day', pos: false }); }

        return { score: Math.max(0, Math.min(100, score)), details };
    }

    /**
     * Find best windows in a date range
     * @param {Date} startDate
     * @param {number} days - how many days to scan
     * @param {string} activityKey
     * @returns {Array} sorted list of { date, panchang, score, details, grade }
     */
    findBestWindows(startDate, days, activityKey) {
        const results = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            d.setHours(9, 0, 0, 0); // Morning muhurta (best time)
            const panchang = this.calcPanchang(d);
            const { score, details } = this.scoreDay(panchang, activityKey);
            let grade, gradeColor;
            if (score >= 75) { grade = 'Excellent'; gradeColor = '#64ffda'; }
            else if (score >= 58) { grade = 'Good'; gradeColor = '#f4c430'; }
            else if (score >= 42) { grade = 'Acceptable'; gradeColor = '#f97316'; }
            else { grade = 'Avoid'; gradeColor = '#ff6b9d'; }
            results.push({ date: d, panchang, score, details, grade, gradeColor });
        }
        return results.sort((a, b) => b.score - a.score);
    }
}
