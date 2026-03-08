/**
 * SadeSatiEngine — Sade Sati & Dhaiya Calculator
 * Calculates all past and future Sade Sati periods based on Saturn's transit
 * over the 12th, 1st (Moon sign) and 2nd from natal Moon.
 * Depends on: astrology-engine-v8.js (VedicAstrologyEngine)
 */
class SadeSatiEngine {
    constructor() {
        this.astroEngine = new VedicAstrologyEngine();
        this.birthChart = null;
        this.userData = null;

        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

        // Saturn takes approx 2.5 years per sign (30 years total cycle)
        this.saturnSignDuration = 2.5; // years per sign

        this.phaseInterpretations = {
            rising: {
                title: '🌑 Rising Phase (12th from Moon)',
                duration: '2.5 years',
                color: '#f97316',
                theme: 'Preparation & Undoing',
                desc: 'Saturn enters the 12th from your Moon sign. This phase brings a gradual withdrawal of energy — losses, expenses, and a need for introspection. Sleep disturbances, foreign travels, and spiritual awakening are common. The universe is preparing you for deep inner change.',
                remedies: [
                    'Donate black sesame seeds (til) on Saturdays',
                    'Feed crows every Saturday morning',
                    'Light sesame oil lamp at Shani temple',
                    'Recite Shani mantra: "Om Sham Shanaischaraya Namah" 108 times',
                    'Wear blue sapphire or iron ring on middle finger (after consultation)',
                    'Practice charity — donate to the elderly or orphanages'
                ]
            },
            peak: {
                title: '🌚 Peak / Janma Phase (Moon sign)',
                duration: '2.5 years',
                color: '#ef4444',
                theme: 'Intense Restructuring',
                desc: 'The most intense phase — Saturn directly transits your Moon sign. This is the "Janma Shani" period. Health, career, relationships and mental peace face maximum pressure. However, those who embrace Saturn\'s discipline during this time emerge significantly stronger. Depression, identity crisis and major life changes are common but transformative.',
                remedies: [
                    'Chant Hanuman Chalisa daily — Hanuman protects during Sade Sati',
                    'Perform Shani Shanti puja at a Shani Mandir',
                    'Donate iron, black cloth, mustard oil to the needy on Saturdays',
                    'Fast on Saturdays (eat only once, avoiding salt)',
                    'Recite Dasharatha Shani Stotra',
                    'Practice discipline: wake early, exercise, maintain routine — Saturn rewards structure'
                ]
            },
            setting: {
                title: '🌒 Setting Phase (2nd from Moon)',
                duration: '2.5 years',
                color: '#eab308',
                theme: 'Release & Integration',
                desc: 'Saturn moves to the 2nd from your Moon. Things begin stabilizing but challenges remain — finances, family speech and values are tested. This phase teaches you to integrate the lessons of the previous 5 years. As it ends, life meaningfully improves.',
                remedies: [
                    'Continue Saturday charities — donate food grains',
                    'Recite Shani Ashtakam on Saturdays',
                    'Help elderly people and laborers with genuine generosity',
                    'Avoid ego and pride in speech — Saturn is testing your 2nd house',
                    'Practice patience in financial matters'
                ]
            },
            dhaiya_kantaka: {
                title: '⚡ Kantaka Shani (4th or 8th from Moon)',
                duration: '2.5 years',
                color: '#8b5cf6',
                theme: '2.5-year Mini Challenge',
                desc: 'Dhaiya (Kantaka Shani) is Saturn\'s 2.5-year transit over the 4th or 8th from your Moon sign. Less intense than Sade Sati but still significant — home, career, health or longevity matters need attention. This is the "small" Sade Sati.',
                remedies: [
                    'Donate black sesame oil lamp at Shani temple on Saturdays',
                    'Feed black dogs on Saturdays',
                    'Practice discipline and patience in relationships'
                ]
            }
        };

        this.signRemedies = {
            Aries: 'You are impulsive by nature — Saturn teaches patience. Focus on slowing down and planning.',
            Taurus: 'Financial stability is tested. Avoid luxury spending; invest in assets.',
            Gemini: 'Communication and relationships are under scrutiny. Think before speaking.',
            Cancer: 'Home and emotional security are challenged. Strengthen family ties through service.',
            Leo: 'Ego and authority are tested. Humility will be your greatest strength now.',
            Virgo: 'Health and work routine are affected. Maintain discipline in diet and daily routine.',
            Libra: 'Partnerships and legal matters face delays. Avoid conflict; seek mediation.',
            Scorpio: 'Transformation is deep and painful. Trust the process — you will be reborn.',
            Sagittarius: 'Philosophy and fortune are tested. Stay grounded; avoid risky travel.',
            Capricorn: 'Saturn rules you — its Sade Sati is milder but still transformative. Career restructures occur.',
            Aquarius: 'Saturn rules you — you handle Sade Sati better than most. Social networks may shift.',
            Pisces: 'Spirituality peaks during Sade Sati. Surrender to the divine and trust the universe.'
        };
    }

    loadData() {
        try {
            const raw = localStorage.getItem('astropsycho_assessment');
            if (!raw) return false;
            this.userData = JSON.parse(raw).birthDetails;
            this.birthChart = this.astroEngine.calculateBirthChart(this.userData);
            return true;
        } catch (e) {
            console.error('SadeSatiEngine: Failed to load data', e);
            return false;
        }
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Get natal Moon sign index (0-11)
    getMoonSignIndex() {
        if (!this.birthChart) return 0;
        return Math.floor(this.birthChart.planets.moon / 30);
    }

    // Calculate Saturn's approximate sign for a given year (Julian year from J2000)
    getSaturnSignForYear(year) {
        // Saturn's sidereal period is ~29.46 years (moves through all 12 signs)
        // At J2000.0 (year 2000), use engine to get a reference point
        // We'll use the orbital elements approach: calculate t for Jan 1 of year
        const dateJan1 = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
        const jd = this.astroEngine.calculateJulianDate(dateJan1);
        const t = (jd - 2451545.0) / 36525.0;
        const ayanamsa = this.astroEngine.calculatePreciseAyanamsa(t);
        const planets = this.astroEngine.calculatePrecisePlanets(t, ayanamsa);
        return Math.floor(planets.saturn / 30);
    }

    // Calculate all Sade Sati and Dhaiya periods from birthYear - 5 to birthYear + 90
    calculateAllPeriods() {
        const birthYear = parseInt(this.userData.birthDate.split('-')[0]);
        const moonSignIdx = this.getMoonSignIndex();

        // Signs for Sade Sati: 12th (before), Janma (moon sign), 2nd (after)
        const sadeSatiSigns = [
            (moonSignIdx + 11) % 12, // 12th from moon (rising)
            moonSignIdx,              // Moon sign (peak/janma)
            (moonSignIdx + 1) % 12   // 2nd from moon (setting)
        ];

        // Signs for Dhaiya: 4th and 8th from moon
        const dhaiyaSigns = [
            (moonSignIdx + 3) % 12,  // 4th Kantaka
            (moonSignIdx + 7) % 12   // 8th Kantaka
        ];

        const startYear = birthYear - 5;
        const endYear = birthYear + 90;
        const periods = [];
        let currentSaturnSign = this.getSaturnSignForYear(startYear);

        // Scan year by year to find sign changes
        let periodStart = startYear;
        for (let yr = startYear + 1; yr <= endYear + 1; yr++) {
            const saturnSign = this.getSaturnSignForYear(yr);
            if (saturnSign !== currentSaturnSign || yr === endYear + 1) {
                // Period: currentSaturnSign from periodStart to yr
                const isSadeSati = sadeSatiSigns.includes(currentSaturnSign);
                const isDhaiya = !isSadeSati && dhaiyaSigns.includes(currentSaturnSign);

                if (isSadeSati || isDhaiya) {
                    const phaseIndex = sadeSatiSigns.indexOf(currentSaturnSign);
                    let phase;
                    if (phaseIndex === 0) phase = 'rising';
                    else if (phaseIndex === 1) phase = 'peak';
                    else if (phaseIndex === 2) phase = 'setting';
                    else phase = 'dhaiya_kantaka';

                    periods.push({
                        type: isSadeSati ? 'sadesati' : 'dhaiya',
                        phase,
                        sign: this.signs[currentSaturnSign],
                        signIndex: currentSaturnSign,
                        startYear: periodStart,
                        endYear: yr,
                        duration: yr - periodStart
                    });
                }

                currentSaturnSign = saturnSign;
                periodStart = yr;
            }
        }

        // Merge consecutive Sade Sati phases into groups
        const sadeSatiGroups = [];
        let currentGroup = null;
        periods.forEach(p => {
            if (p.type === 'sadesati') {
                if (!currentGroup || p.phase === 'rising') {
                    if (currentGroup) sadeSatiGroups.push(currentGroup);
                    currentGroup = { type: 'sadesati', phases: [p], startYear: p.startYear, endYear: p.endYear };
                } else {
                    currentGroup.phases.push(p);
                    currentGroup.endYear = p.endYear;
                }
            } else {
                if (currentGroup) { sadeSatiGroups.push(currentGroup); currentGroup = null; }
                sadeSatiGroups.push({ type: 'dhaiya', phases: [p], startYear: p.startYear, endYear: p.endYear });
            }
        });
        if (currentGroup) sadeSatiGroups.push(currentGroup);

        return { periods, groups: sadeSatiGroups };
    }

    // Get current active period
    getCurrentPeriod(periods) {
        const now = new Date();
        const currentYear = now.getFullYear() + (now.getMonth() / 12);
        return periods.find(p => p.startYear <= currentYear && p.endYear >= currentYear);
    }

    getCurrentPhase(periods) {
        const now = new Date();
        const currentYear = now.getFullYear() + (now.getMonth() / 12);
        return periods.find(p => p.startYear <= currentYear && p.endYear >= currentYear);
    }
}
