/**
 * VarshaphalaEngine — Annual Horoscope (Solar Return) Engine
 * Calculates the exact Solar Return moment, Varsha Lagna, Muntha,
 * Varshesha (Year Lord), and generates a 12-house annual forecast.
 * Depends on: astrology-engine-v8.js (VedicAstrologyEngine)
 */

class VarshaphalaEngine {
    constructor() {
        this.base = new VedicAstrologyEngine();

        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

        this.signEmoji = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

        this.signLords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
            'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];

        this.planetEmoji = {
            sun: '☀️', moon: '🌙', mars: '♂️', mercury: '☿', jupiter: '♃',
            venus: '♀', saturn: '♄', rahu: '☊', ketu: '☋'
        };

        this.houseThemes = {
            1: { name: 'Self & Body', icon: '👤', theme: 'Physical health, personality, new beginnings' },
            2: { name: 'Wealth & Speech', icon: '💰', theme: 'Finances, family, communication' },
            3: { name: 'Siblings & Courage', icon: '⚡', theme: 'Short travel, siblings, skills, initiative' },
            4: { name: 'Home & Mother', icon: '🏠', theme: 'Property, mother, emotional peace, vehicles' },
            5: { name: 'Children & Creativity', icon: '🌟', theme: 'Romance, children, speculation, education' },
            6: { name: 'Health & Competition', icon: '⚔️', theme: 'Enemies, disease, service, legal disputes' },
            7: { name: 'Partners & Marriage', icon: '💞', theme: 'Spouse, business partners, contracts' },
            8: { name: 'Transformation', icon: '🔮', theme: 'Longevity, inheritance, secrets, occult' },
            9: { name: 'Fortune & Dharma', icon: '🙏', theme: 'Luck, father, religion, long journeys, guru' },
            10: { name: 'Career & Status', icon: '👑', theme: 'Profession, public image, authority, recognition' },
            11: { name: 'Gains & Networks', icon: '🎯', theme: 'Income, friends, aspirations, social circles' },
            12: { name: 'Liberation & Loss', icon: '🌊', theme: 'Foreign lands, spirituality, hidden enemies, expenses' }
        };

        // Planet keywords for interpretation
        this.planetKeywords = {
            sun: { good: 'Leadership, authority, recognition, health vitality', bad: 'Ego conflicts, father issues, government friction' },
            moon: { good: 'Emotional peace, popular support, mother blessings', bad: 'Mood swings, health issues, domestic unrest' },
            mars: { good: 'Drive, courage, energy, achievement, competition won', bad: 'Conflicts, accidents, aggression, litigation' },
            mercury: { good: 'Communication, intellect, business acumen, learning', bad: 'Nervous anxiety, miscommunication, deception' },
            jupiter: { good: 'Expansion, wisdom, financial gains, spiritual growth', bad: 'Overindulgence, legal issues, misjudgment' },
            venus: { good: 'Love, luxury, artistic success, relationship harmony', bad: 'Overindulgence, relationship drama, financial waste' },
            saturn: { good: 'Discipline, long-term success through hard work, karma resolved', bad: 'Delays, restrictions, heavy responsibilities, chronic ailments' },
            rahu: { good: 'Sudden gains, foreign connections, innovation', bad: 'Illusions, obsession, unconventional disruptions' },
            ketu: { good: 'Spiritual insights, research, past-life gifts activated', bad: 'Isolation, confusion, loss, disconnection' }
        };
    }

    /**
     * Main entry: compute full Varshaphala for a given target year.
     * @param {Object} birthDetails - from localStorage (birthDate, birthTime, latitude, longitude, timezone)
     * @param {number} targetYear - the Gregorian year for the annual horoscope
     */
    calculate(birthDetails, targetYear) {
        // Step 1: Get natal chart to find Sun's natal longitude
        const natalChart = this.base.calculateBirthChart(birthDetails);
        const natalSunLong = natalChart.planets.sun;

        // Step 2: Find the solar return moment
        const returnJD = this.findSolarReturn(natalSunLong, targetYear, birthDetails);

        // Step 3: Convert JD back to Date
        const returnDate = this.jdToDate(returnJD);

        // Step 4: Calculate Ayanamsa at return moment
        const t = (returnJD - 2451545.0) / 36525.0;
        const ayanamsa = this.base.calculatePreciseAyanamsa(t);

        // Step 5: Calculate planetary positions at return moment
        const varshaPlanets = this.base.calculatePrecisePlanets(t, ayanamsa);

        // Step 6: Calculate Varsha Lagna (ascendant at solar return moment)
        const varshaLagna = this.base.calculatePreciseAscendant(
            returnJD, t, ayanamsa,
            birthDetails.latitude || 28.61,
            birthDetails.longitude || 77.20
        );

        // Step 7: Calculate Varsha planetary details
        const varshaDetails = this.base.getPlanetaryDetails(varshaPlanets, varshaLagna);
        const varshaNavamsha = this.base.calculateNavamsha(varshaPlanets, varshaLagna);

        // Step 8: Calculate Muntha
        const muntha = this.calculateMuntha(birthDetails, targetYear, natalChart.ascendant);

        // Step 9: Varshesha (year lord) - lord of Varsha Lagna sign
        const varshaLagnaSignIdx = Math.floor(varshaLagna / 30);
        const varshesha = this.signLords[varshaLagnaSignIdx];

        // Step 10: Tri-Pataki / Panchanga of return day
        const panchanga = this.getReturnPanchanga(varshaPlanets, varshaLagna, returnDate);

        // Step 11: Generate 12-house yearly forecast
        const forecast = this.generateYearlyForecast(varshaPlanets, natalChart.planets, varshaLagna, varshaDetails);

        // Step 12: Dasha at return time (re-use Vimshottari from natal chart dated to return year)
        const yearDasha = this.getActiveDashaAtDate(natalChart.dashas, returnDate);

        return {
            natalSunLong,
            returnDate,
            returnJD,
            varshaLagna,
            varshaLagnaSign: this.signs[varshaLagnaSignIdx],
            varshaLagnaSignIdx,
            varshaPlanets,
            varshaDetails,
            varshaNavamsha,
            muntha,
            varshesha,
            panchanga,
            forecast,
            yearDasha,
            targetYear,
            natalChart
        };
    }

    /**
     * Binary search the exact Julian Date when Sun returns to natal longitude in targetYear.
     */
    findSolarReturn(natalSunLong, targetYear, birthDetails) {
        // Start search from ~1 month before the target birthday and range ±6 months
        const [by, bm, bd] = birthDetails.birthDate.split('-').map(Number);
        const searchStart = this.dateToJD(new Date(Date.UTC(targetYear, bm - 2, bd)));
        const searchEnd = this.dateToJD(new Date(Date.UTC(targetYear, bm, bd)));

        let lo = searchStart;
        let hi = searchEnd;

        for (let i = 0; i < 60; i++) {
            const mid = (lo + hi) / 2;
            const t = (mid - 2451545.0) / 36525.0;
            const ayanamsa = this.base.calculatePreciseAyanamsa(t);
            const sunLong = this.base.calculateSun(t);
            const sidSun = this.base.normalize(sunLong.l - ayanamsa);

            let diff = sidSun - natalSunLong;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            if (Math.abs(diff) < 0.0001) break;

            if (diff > 0) {
                hi = mid;
            } else {
                lo = mid;
            }
        }

        return (lo + hi) / 2;
    }

    /**
     * Calculate Muntha: natal Lagna progressed by 1 sign per year.
     * Muntha = (natalLagna + yearsElapsed) % 12 in sign index
     */
    calculateMuntha(birthDetails, targetYear, natalAscendant) {
        const birthYear = parseInt(birthDetails.birthDate.split('-')[0]);
        const yearsElapsed = targetYear - birthYear;

        const natalLagnaSign = Math.floor(natalAscendant / 30);
        const munthaSignIdx = (natalLagnaSign + yearsElapsed) % 12;
        const munthaHouse = (munthaSignIdx - natalLagnaSign + 12) % 12 + 1;

        const lordOfMuntha = this.signLords[munthaSignIdx];
        return {
            signIdx: munthaSignIdx,
            sign: this.signs[munthaSignIdx],
            house: munthaHouse,
            lord: lordOfMuntha,
            interpretation: this.getMunthaInterpretation(munthaHouse)
        };
    }

    getMunthaInterpretation(house) {
        const interps = {
            1: 'Excellent year! Muntha in 1st house brings vitality, new beginnings, and personal growth. Health improves significantly.',
            2: 'Focus on financial accumulation. Family reunions and increase in resources. Careful speech is advised.',
            3: 'Year of initiative and short journeys. Siblings play a key role. Business ideas flourish — act with courage.',
            4: 'Home and property matters highlighted. Domestic happiness, maternal connections. Real estate opportunities.',
            5: 'Creative and romantic year. Children bring joy. Speculation may be favorable. Educational achievements.',
            6: 'Competitive year with health challenges. Victory over enemies if disciplined. Avoid legal disputes.',
            7: 'Partnership and marriage highlighted. Business collaborations are favored. Travel with partner likely.',
            8: 'Year of transformation and hidden matters. Inheritance possibilities. Spiritual depth increases.',
            9: 'Highly auspicious! Fortune smiles, father figure blesses. Religion, long travel, higher wisdom.',
            10: 'Career advancement year. Public recognition and professional heights. Authority increases.',
            11: 'Year of gains and fulfillment of desires. Social networks expand. Income rises notably.',
            12: 'Muntha in 12th house indicates expenses and foreign connections. Spiritual retreat beneficial. Guard health.'
        };
        return interps[house] || 'A year of karmic unfolding.';
    }

    /**
     * Get Panchanga (Tithi, Vara, Nakshatra, Yoga, Karana) at solar return moment.
     */
    getReturnPanchanga(varshaPlanets, varshaLagna, returnDate) {
        const sunLong = varshaPlanets.sun;
        const moonLong = varshaPlanets.moon;

        // Tithi
        let elongation = moonLong - sunLong;
        if (elongation < 0) elongation += 360;
        const tithiNum = Math.floor(elongation / 12) + 1;
        const tithiNames = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
            'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
            'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'];
        const tithi = tithiNames[(tithiNum - 1) % 15];

        // Nakshatra of Moon
        const moonNak = this.base.getNakshatra(moonLong);

        // Vara (weekday)
        const weekdays = ['Sunday ☀️', 'Monday 🌙', 'Tuesday ♂️', 'Wednesday ☿', 'Thursday ♃', 'Friday ♀', 'Saturday ♄'];
        const vara = weekdays[returnDate.getDay()];

        // Yoga (Sun + Moon / 13.333)
        const yogaNames = ['Vishkambha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
            'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata',
            'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
            'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
        const yogaIdx = Math.floor(((sunLong + moonLong) % 360) / 13.333) % 27;
        const yoga = yogaNames[yogaIdx];

        return { tithi, nakshatra: moonNak.name ? moonNak.name.replace(/_/g, ' ') : '—', vara, yoga };
    }

    /**
     * Generate 12-house yearly forecast based on which planets reside in each house.
     */
    generateYearlyForecast(varshaPlanets, natalPlanets, varshaLagna, varshaDetails) {
        const forecast = [];

        for (let house = 1; house <= 12; house++) {
            const planetsInHouse = [];
            for (const [planet, details] of Object.entries(varshaDetails)) {
                if (details.house === house) {
                    planetsInHouse.push({ planet, details });
                }
            }

            const houseTheme = this.houseThemes[house];
            let interpretation = this.getHouseForecast(house, planetsInHouse, varshaLagna);

            forecast.push({
                house,
                name: houseTheme.name,
                icon: houseTheme.icon,
                theme: houseTheme.theme,
                planetsInHouse,
                interpretation,
                strength: planetsInHouse.length === 0 ? 'neutral' :
                    planetsInHouse.some(p => ['sun', 'jupiter', 'venus', 'moon'].includes(p.planet)) ? 'good' : 'mixed'
            });
        }
        return forecast;
    }

    getHouseForecast(house, planets, lagna) {
        if (planets.length === 0) {
            const emptyHouseTexts = {
                1: 'A year with steady energy. No major personality disruptions — focus on routine maintenance of health.',
                2: 'Savings are stable. Financial matters proceed normally. Family relations calm.',
                3: 'Routine year for communication. No exceptional courage or travel demanded.',
                4: 'Home front is quiet. Property matters dormant. Inner peace maintained.',
                5: 'Creative output is moderate. Children matters stable. Romance follows patterns.',
                6: 'Health and competition are balanced. Enemies are dormant this year.',
                7: 'Relationships progress steadily. No major partnership changes expected.',
                8: 'Hidden matters remain buried. Transformation is gradual and internal.',
                9: 'Spiritual progress is self-directed. Fortune follows effort this year.',
                10: 'Career continues its course. No extraordinary push or fall expected.',
                11: 'Gains are commensurate with effort. Social circle remains steady.',
                12: 'Minimal losses expected. Spiritual inclinations are quiet but present.'
            };
            return emptyHouseTexts[house] || 'This domain proceeds with natural flow this year.';
        }

        let text = '';
        planets.forEach(({ planet, details }) => {
            const kw = this.planetKeywords[planet];
            if (!kw) return;
            const isStrong = ['Exalted', 'Own Sign', 'Moolatrikona', 'Great Friend'].includes(details.status);
            text += `${this.planetEmoji[planet] || '✦'} **${planet.charAt(0).toUpperCase() + planet.slice(1)}** (${details.sign}, ${details.status}) in ${house}th house: ${isStrong ? kw.good : kw.bad}. `;
        });
        return text.trim();
    }

    getActiveDashaAtDate(dashas, date) {
        if (!dashas || !dashas.periods) return null;
        for (const md of dashas.periods) {
            if (new Date(md.start) <= date && new Date(md.end) >= date) {
                // Find antardasha
                if (md.antardashas) {
                    for (const ad of md.antardashas) {
                        if (new Date(ad.start) <= date && new Date(ad.end) >= date) {
                            return { mahadasha: md.planet, antardasha: ad.planet };
                        }
                    }
                }
                return { mahadasha: md.planet, antardasha: null };
            }
        }
        return null;
    }

    // Utility: Julian Date to JS Date
    jdToDate(jd) {
        const z = Math.floor(jd + 0.5);
        const f = (jd + 0.5) - z;
        let a = z;
        if (z >= 2299161) {
            const alpha = Math.floor((z - 1867216.25) / 36524.25);
            a = z + 1 + alpha - Math.floor(alpha / 4);
        }
        const b = a + 1524;
        const c = Math.floor((b - 122.1) / 365.25);
        const d = Math.floor(365.25 * c);
        const e = Math.floor((b - d) / 30.6001);

        const day = b - d - Math.floor(30.6001 * e);
        const month = e < 14 ? e - 1 : e - 13;
        const year = month > 2 ? c - 4716 : c - 4715;
        const hours = f * 24;
        const h = Math.floor(hours);
        const minutes = (hours - h) * 60;
        const m = Math.floor(minutes);

        return new Date(Date.UTC(year, month - 1, day, h, m));
    }

    // Utility: Date to Julian Date
    dateToJD(date) {
        return this.base.calculateJulianDate(date);
    }
}
