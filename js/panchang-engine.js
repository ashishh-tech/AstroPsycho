/**
 * AstroPsycho Panchang Engine
 * Calculates Vedic daily almanac: Tithi, Nakshatra, Yoga, Karana, Vara, Rahu Kaal & more.
 * Uses Lahiri Ayanamsa — same as astrology-engine-v8.js
 */

class PanchangEngine {
    constructor() {
        this.TITHIS = [
            'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami',
            'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
            'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
        ];
        this.NAKSHATRAS = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
            'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];
        this.YOGAS = [
            'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
            'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata',
            'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva',
            'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
        ];
        this.KARANAS = [
            'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
            'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
        ];
        this.VARAS = ['Ravivara (Sunday)', 'Somavara (Monday)', 'Mangalavara (Tuesday)',
            'Budhavara (Wednesday)', 'Guruvara (Thursday)', 'Shukravara (Friday)', 'Shanivara (Saturday)'];
        this.VARA_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

        // Rahu Kaal hours from sunrise (in hour offsets from each weekday 0=Sun)
        this.RAHU_KAAL = [
            [16.5, 18],  // Sunday: 4:30pm-6pm
            [7.5, 9],    // Monday: 7:30am-9am
            [15, 16.5],  // Tuesday: 3pm-4:30pm
            [12, 13.5],  // Wednesday: 12pm-1:30pm
            [13.5, 15],  // Thursday: 1:30pm-3pm
            [10.5, 12],  // Friday: 10:30am-12pm
            [9, 10.5]    // Saturday: 9am-10:30am
        ];
    }

    // Julian Date from UTC date
    getJD(date) {
        let y = date.getUTCFullYear(), m = date.getUTCMonth() + 1;
        const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;
        if (m <= 2) { y--; m += 12; }
        const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
    }

    // T centuries from J2000.0
    getT(jd) { return (jd - 2451545.0) / 36525.0; }

    // Normalize to 0-360
    norm(x) { return ((x % 360) + 360) % 360; }

    // Lahiri Ayanamsa
    getAyanamsa(t) {
        return 23.8570922 + 1.39666 * t + 0.00030 * t * t;
    }

    // Sun longitude (tropical, then minus ayanamsa = sidereal)
    getSunLongitude(t) {
        const l0 = 280.46646 + 36000.76983 * t;
        const m = this.norm(357.52911 + 35999.05029 * t);
        const mr = m * Math.PI / 180;
        const c = 1.914602 * Math.sin(mr) + 0.019993 * Math.sin(2 * mr) + 0.000289 * Math.sin(3 * mr);
        const omega = this.norm(125.04 - 1934.1 * t);
        const appLong = this.norm(l0 + c - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180));
        return this.norm(appLong - this.getAyanamsa(t));
    }

    // Moon longitude (simplified but accurate to ~0.5°)
    getMoonLongitude(t) {
        const lp = 218.3164477 + 481267.8813272 * t;
        const d = 297.8501921 + 445267.1114034 * t;
        const m = 357.5291092 + 35999.0502909 * t;
        const mp = 134.9633964 + 477198.8675055 * t;
        const f = 93.2720950 + 483202.0175233 * t;
        const E = 1 - 0.002516 * t;
        const r = x => x * Math.PI / 180;
        let sl =
            6.288774 * Math.sin(r(mp)) +
            1.274027 * Math.sin(r(2 * d - mp)) +
            0.658314 * Math.sin(r(2 * d)) +
            0.213618 * Math.sin(r(2 * mp)) -
            0.185116 * E * Math.sin(r(m)) -
            0.114332 * Math.sin(r(2 * f)) +
            0.058793 * Math.sin(r(2 * d - 2 * mp)) +
            0.057066 * E * Math.sin(r(2 * d - mp - m)) +
            0.053322 * Math.sin(r(2 * d + mp)) +
            0.045758 * E * Math.sin(r(2 * d - m)) -
            0.040923 * E * Math.sin(r(mp - m)) -
            0.034720 * Math.sin(r(d)) -
            0.030383 * E * Math.sin(r(mp + m));
        return this.norm(lp + sl - this.getAyanamsa(t));
    }

    /**
     * Calculate full Panchang for a given JS Date
     * @param {Date} date - Local date/time
     * @param {number} offsetHours - timezone offset (e.g. 5.5 for IST)
     */
    calculate(date, offsetHours = 5.5) {
        const utcDate = new Date(date.getTime() - offsetHours * 3600000);
        const jd = this.getJD(utcDate);
        const t = this.getT(jd);

        const sunLon = this.getSunLongitude(t);
        const moonLon = this.getMoonLongitude(t);

        // ── Tithi ──────────────────────────────────────────────────────────
        let elongation = this.norm(moonLon - sunLon);
        const tithiNum = Math.floor(elongation / 12); // 0-29
        const tithiIndex = tithiNum % 15;
        const paksha = tithiNum < 15 ? 'Shukla Paksha ☽' : 'Krishna Paksha 🌑';
        const tithiFraction = (elongation % 12) / 12;

        // ── Nakshatra ──────────────────────────────────────────────────────
        const nakshatraNum = Math.floor(moonLon / (360 / 27));
        const nakshatraFraction = (moonLon % (360 / 27)) / (360 / 27);
        const NAKSHATRA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
        const nakshatraLord = NAKSHATRA_LORDS[nakshatraNum % 9];

        // ── Yoga ──────────────────────────────────────────────────────────
        const yogaLon = this.norm(sunLon + moonLon);
        const yogaNum = Math.floor(yogaLon / (360 / 27));
        const yogaFraction = (yogaLon % (360 / 27)) / (360 / 27);

        // ── Karana ────────────────────────────────────────────────────────
        const karanaHalf = Math.floor(elongation / 6); // 0-59
        let karana;
        if (karanaHalf === 0) karana = 'Kimstughna';
        else if (karanaHalf >= 57) karana = ['Shakuni', 'Chatushpada', 'Naga'][karanaHalf - 57] || 'Naga';
        else karana = this.KARANAS[(karanaHalf - 1) % 7];

        // ── Vara (weekday) ─────────────────────────────────────────────────
        const vara = this.VARAS[date.getDay()];
        const varaLord = this.VARA_LORDS[date.getDay()];

        // ── Rashi (Moon sign) ──────────────────────────────────────────────
        const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
            'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
        const RASHI_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const rashiNum = Math.floor(moonLon / 30);

        // ── Sun Sign (Rashi) ──────────────────────────────────────────────
        const sunRashiNum = Math.floor(sunLon / 30);

        // ── Rahu Kaal ─────────────────────────────────────────────────────
        const rk = this.RAHU_KAAL[date.getDay()];
        const rahuKaal = `${this.formatHour(rk[0])} – ${this.formatHour(rk[1])}`;

        // ── Abhijit Muhurta (11:48 AM to 12:36 PM local) ──────────────────
        const abhijit = '11:48 AM – 12:36 PM';

        // ── Moon degree in rashi ───────────────────────────────────────────
        const moonDegInRashi = moonLon % 30;
        const sunDegInRashi = sunLon % 30;

        return {
            date: date.toDateString(),
            time: date.toLocaleTimeString(),
            paksha,
            tithi: {
                name: this.TITHIS[tithiIndex],
                number: tithiNum + 1,
                percent: Math.round(tithiFraction * 100)
            },
            nakshatra: {
                name: this.NAKSHATRAS[nakshatraNum],
                lord: nakshatraLord,
                number: nakshatraNum + 1,
                percent: Math.round(nakshatraFraction * 100)
            },
            yoga: {
                name: this.YOGAS[yogaNum],
                number: yogaNum + 1,
                percent: Math.round(yogaFraction * 100)
            },
            karana,
            vara,
            varaLord,
            moonSign: { hindi: RASHIS[rashiNum], english: RASHI_EN[rashiNum], degree: moonDegInRashi.toFixed(2) },
            sunSign: { hindi: RASHIS[sunRashiNum], english: RASHI_EN[sunRashiNum], degree: sunDegInRashi.toFixed(2) },
            moonLon: moonLon.toFixed(3),
            sunLon: sunLon.toFixed(3),
            rahuKaal,
            abhijit,
            elongation: elongation.toFixed(2),
            isAuspicious: this.isAuspicious(yogaNum, tithiNum)
        };
    }

    isAuspicious(yogaNum, tithiNum) {
        const auspiciousYogas = [1, 2, 3, 6, 10, 15, 19, 20, 22, 23, 24, 25]; // good yogas
        const inauspiciousYogas = [0, 5, 8, 12, 16, 26]; // Vishkumbha, Atiganda, etc.
        const inauspiciousTithis = [4, 8, 14]; // Chaturthi at positions, Ashtami, Chaturdashi
        if (inauspiciousYogas.includes(yogaNum)) return { value: false, reason: 'Inauspicious Yoga active' };
        if (inauspiciousTithis.includes(tithiNum % 15)) return { value: false, reason: 'Avoid major ventures today' };
        if (auspiciousYogas.includes(yogaNum)) return { value: true, reason: 'Highly auspicious Yoga' };
        return { value: true, reason: 'Generally auspicious day' };
    }

    formatHour(h) {
        const hInt = Math.floor(h), min = Math.round((h - hInt) * 60);
        const period = hInt >= 12 ? 'PM' : 'AM';
        const h12 = hInt > 12 ? hInt - 12 : (hInt === 0 ? 12 : hInt);
        return `${h12}:${min.toString().padStart(2, '0')} ${period}`;
    }

    /**
     * Calculates the next Gregorian date for a Hindu birthday based on Tithi & Sun Sign.
     * @param {Date} birthDate - User's birth date/time
     * @param {number} offsetHours - Timezone offset
     */
    calculateNextTithiBirthday(birthDate, offsetHours = 5.5) {
        const birthPanchang = this.calculate(birthDate, offsetHours);
        const birthTithi = birthPanchang.tithi.number;
        const birthSunRashi = birthPanchang.sunSign.english;
        const birthNakshatra = birthPanchang.nakshatra.name;

        // Start checking from today
        let checkDate = new Date();
        const maxDays = 500; // Limit search to ~1.5 years to avoid infinite loops
        
        for (let i = 0; i < maxDays; i++) {
            const currentPanchang = this.calculate(checkDate, offsetHours);
            
            // Birthday logic: Same Solar Month AND Same Tithi
            // (Note: In some traditions, it's just Tithi, but Solar Month + Tithi is more accurate for "Birthday")
            if (currentPanchang.sunSign.english === birthSunRashi && currentPanchang.tithi.number === birthTithi) {
                return {
                    nextBirthday: new Date(checkDate),
                    tithi: currentPanchang.tithi.name,
                    nakshatra: currentPanchang.nakshatra.name,
                    daysRemaining: i
                };
            }
            
            // Move to next day (checking at roughly the same birth hour helps Tithi matching)
            checkDate.setDate(checkDate.getDate() + 1);
        }
        
        return null; // Fallback
    }
}

window.PanchangEngine = PanchangEngine;
