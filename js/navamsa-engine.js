/**
 * NavamsaEngine — Navamsa (D9) Chart Analysis Engine
 * Interprets the D9 chart for marriage, spirituality and inner strength.
 * Depends on: astrology-engine-v8.js (VedicAstrologyEngine)
 */
class NavamsaEngine {
    constructor() {
        this.astroEngine = new VedicAstrologyEngine();
        this.birthChart = null;
        this.userData = null;

        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

        this.lordMap = [
            'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
            'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'
        ];

        this.planetEmojis = {
            sun: '☀️', moon: '🌙', mars: '🔴', mercury: '💚',
            jupiter: '🟡', venus: '💗', saturn: '💙', rahu: '🔵', ketu: '⬛'
        };

        this.planetColors = {
            sun: { bg: '#f97316', text: '#fff7ed', light: 'rgba(249,115,22,0.1)' },
            moon: { bg: '#94a3b8', text: '#f8fafc', light: 'rgba(148,163,184,0.1)' },
            mars: { bg: '#ef4444', text: '#fef2f2', light: 'rgba(239,68,68,0.1)' },
            mercury: { bg: '#22c55e', text: '#f0fdf4', light: 'rgba(34,197,94,0.1)' },
            jupiter: { bg: '#eab308', text: '#fefce8', light: 'rgba(234,179,8,0.1)' },
            venus: { bg: '#ec4899', text: '#fdf2f8', light: 'rgba(236,72,153,0.1)' },
            saturn: { bg: '#6366f1', text: '#eef2ff', light: 'rgba(99,102,241,0.1)' },
            rahu: { bg: '#8b5cf6', text: '#f5f3ff', light: 'rgba(139,92,246,0.1)' },
            ketu: { bg: '#78716c', text: '#fafaf9', light: 'rgba(120,113,108,0.1)' }
        };

        this.houseMeanings = [
            { house: 1, title: 'Self in D9 / Soul Nature', desc: 'The Dharmic self — how you express your soul, inner nature in relationships and spirituality.' },
            { house: 2, title: 'Family & Speech', desc: 'Family values brought into marriage, how you communicate with partner, wealth in married life.' },
            { house: 3, title: 'Courage & Siblings', desc: 'Efforts in maintaining relationships, short journeys with partner, younger siblings\' marriages.' },
            { house: 4, title: 'Happiness & Home', desc: 'Emotional happiness in marriage, domestic life quality, property and comfort with partner.' },
            { house: 5, title: 'Children & Intelligence', desc: 'Children in marriage, creative expression with partner, past-life karma in love.' },
            { house: 6, title: 'Conflict & Service', desc: 'Disputes in marriage, health issues in relationships, service orientation.' },
            { house: 7, title: 'Partner & Marriage', desc: 'The 7th house in D9 represents the spouse — their nature, qualities and your compatibility.' },
            { house: 8, title: 'Transformation & Longevity', desc: 'Depth of the relationship, hidden aspects, longevity of marriage, in-laws\' wealth.' },
            { house: 9, title: 'Dharma & Fortune', desc: 'Shared values, dharmic alignment with partner, fortune in married life.' },
            { house: 10, title: 'Career & Status', desc: 'Social status from marriage, joint career efforts, public image of the couple.' },
            { house: 11, title: 'Gains & Networks', desc: 'Gains from marriage, social networks, elder siblings and their marriages.' },
            { house: 12, title: 'Losses & Spirituality', desc: 'Spiritual growth through marriage, bed pleasures, separation potential, foreign connection.' }
        ];

        this.signQualities = {
            Aries: { element: 'Fire', mode: 'Cardinal', quality: 'Passionate, assertive, energetic partner nature' },
            Taurus: { element: 'Earth', mode: 'Fixed', quality: 'Stable, sensual, loyal partner nature' },
            Gemini: { element: 'Air', mode: 'Mutable', quality: 'Communicative, adaptable, intellectual partner nature' },
            Cancer: { element: 'Water', mode: 'Cardinal', quality: 'Nurturing, emotional, protective partner nature' },
            Leo: { element: 'Fire', mode: 'Fixed', quality: 'Regal, generous, dramatic partner nature' },
            Virgo: { element: 'Earth', mode: 'Mutable', quality: 'Analytical, service-oriented, perfectionistic partner nature' },
            Libra: { element: 'Air', mode: 'Cardinal', quality: 'Harmonious, balanced, relationship-focused partner nature' },
            Scorpio: { element: 'Water', mode: 'Fixed', quality: 'Intense, transformative, deeply bonded partner nature' },
            Sagittarius: { element: 'Fire', mode: 'Mutable', quality: 'Philosophical, adventurous, free-spirited partner nature' },
            Capricorn: { element: 'Earth', mode: 'Cardinal', quality: 'Disciplined, ambitious, responsible partner nature' },
            Aquarius: { element: 'Air', mode: 'Fixed', quality: 'Independent, humanitarian, unconventional partner nature' },
            Pisces: { element: 'Water', mode: 'Mutable', quality: 'Spiritual, compassionate, dreamy partner nature' }
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
            console.error('NavamsaEngine: Failed to load data', e);
            return false;
        }
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Get Atmakaraka: planet with highest degrees in D1 (excluding Rahu/Ketu)
    getAtmakaraka() {
        const planets = this.birthChart.planets;
        const considered = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
        let highest = -1, ak = null;
        considered.forEach(p => {
            const deg = planets[p] % 30; // Degree within sign
            if (deg > highest) { highest = deg; ak = p; }
        });
        return { planet: ak, degree: highest.toFixed(2) };
    }

    // Detect Vargottama planets: same sign in D1 and D9
    getVargottamaPlanets() {
        const d1 = this.birthChart.planetaryDetails;
        const d9 = this.birthChart.navamsha.planets;
        const vargottama = [];
        Object.keys(d1).forEach(p => {
            if (!d9[p]) return;
            if (d1[p].signIndex === d9[p].signIndex) {
                vargottama.push(p);
            }
        });
        return vargottama;
    }

    // Get D9 Lagna lord info
    getD9LagnaLord() {
        const d9AscSign = this.birthChart.navamsha.ascendantSign - 1; // 0-indexed
        const lord = this.lordMap[d9AscSign];
        const d9Planets = this.birthChart.navamsha.planets;
        const lordData = d9Planets[lord];
        return { lord, sign: this.signs[d9AscSign], house: lordData ? lordData.house : '?' };
    }

    // Get D9 7th lord info
    getD97thLord() {
        const d9AscSign = this.birthChart.navamsha.ascendantSign - 1;
        const seventhSignIndex = (d9AscSign + 6) % 12;
        const lord = this.lordMap[seventhSignIndex];
        const d9Planets = this.birthChart.navamsha.planets;
        const lordData = d9Planets[lord];
        return {
            lord,
            sign: this.signs[seventhSignIndex],
            house: lordData ? lordData.house : '?',
            lordSign: lordData ? lordData.sign : ''
        };
    }

    getPlanetsInD97th() {
        const d9Planets = this.birthChart.navamsha.planets;
        return Object.entries(d9Planets).filter(([p, d]) => d.house === 7).map(([p]) => p);
    }

    getDignityInD9(planet, signIndex) {
        const engine = this.astroEngine;
        const constants = engine.planetaryConstants[planet];
        if (!constants) return 'Neutral';
        const longitude = signIndex * 30 + 15; // mid-sign for status check
        if (engine.isExalted(planet, longitude)) return 'Exalted';
        if (engine.isDebilitated(planet, longitude)) return 'Debilitated';
        if (constants.own && constants.own.includes(signIndex)) return 'Own Sign';
        return 'Neutral';
    }

    // Generate marriage analysis interpretation
    generateMarriageAnalysis() {
        const insights = [];
        const vargottama = this.getVargottamaPlanets();
        const ak = this.getAtmakaraka();
        const d9Lagna = this.getD9LagnaLord();
        const d97th = this.getD97thLord();
        const planetsIn7th = this.getPlanetsInD97th();
        const d9Nav = this.birthChart.navamsha;

        // Vargottama analysis
        if (vargottama.length > 0) {
            const names = vargottama.map(p => this.capitalize(p)).join(', ');
            insights.push({
                icon: '⭐',
                title: 'Vargottama Planets — Extremely Powerful',
                color: '#f4c430',
                text: `${names} ${vargottama.length === 1 ? 'is' : 'are'} Vargottama — occupying the same sign in both D1 and D9. This is a rare and powerful placement indicating ${vargottama.length === 1 ? 'this planet\'s' : 'these planets\''} qualities are deeply ingrained in the soul and will manifest strongly throughout life, especially in marriage and spiritual growth.`
            });
        }

        // Atmakaraka in D9
        const d9AkData = d9Nav.planets[ak.planet];
        if (d9AkData) {
            insights.push({
                icon: '🔮',
                title: `Atmakaraka: ${this.capitalize(ak.planet)} (${ak.degree}° in sign)`,
                color: '#a78bfa',
                text: `Your Atmakaraka (soul indicator) is ${this.capitalize(ak.planet)}, placed in ${d9AkData.sign} in the D9 chart (House ${d9AkData.house}). The Atmakaraka in D9 reveals your soul\'s deepest lessons — ${this.getAKInterpretation(ak.planet, d9AkData)}`
            });
        }

        // D9 Lagna lord
        insights.push({
            icon: '🌟',
            title: `D9 Lagna: ${this.signs[d9Nav.ascendantSign - 1]} — Lord ${this.capitalize(d9Lagna.lord)} in H${d9Lagna.house}`,
            color: '#64ffda',
            text: `Your Navamsa Lagna is ${this.signs[d9Nav.ascendantSign - 1]}. Its lord ${this.capitalize(d9Lagna.lord)} is placed in D9 House ${d9Lagna.house}. ${this.getLagnaLordInterpretation(d9Lagna)}`
        });

        // D9 7th house
        insights.push({
            icon: '💍',
            title: `Partner Indicator: D9 7th Lord ${this.capitalize(d97th.lord)} in ${d97th.lordSign || 'Sign'}`,
            color: '#ff6b9d',
            text: `The 7th house of D9 (${d97th.sign}) represents your spouse. Its lord ${this.capitalize(d97th.lord)} is in House ${d97th.house} of D9 (${d97th.lordSign}). ${this.get7thLordInterpretation(d97th)}${planetsIn7th.length > 0 ? ` Additionally, ${planetsIn7th.map(p => this.capitalize(p)).join(' & ')} sit directly in D9 7th house, adding their qualities to partner description.` : ''}`
        });

        return insights;
    }

    getAKInterpretation(planet, d9Data) {
        const interpretations = {
            sun: 'your soul craves recognition, leadership and dharmic authority. Marriage will teach you humility and sharing power.',
            moon: 'your soul seeks emotional security and nurturing. Marriage will be deeply emotionally transformative.',
            mars: 'your soul desires action and courage. Marriage will challenge you to balance independence with partnership.',
            mercury: 'your soul seeks knowledge and communication. Marriage will involve intellectual exchange and learning.',
            jupiter: 'your soul yearns for wisdom and expansion. Marriage will be blessed with spiritual growth and children.',
            venus: 'your soul desires beauty, love and harmony. Marriage is crucial to your soul\'s journey.',
            saturn: 'your soul is learning responsibility and patience through relationships. Marriage comes with duties and deep karmic lessons.',
            rahu: 'your soul has an obsessive desire for worldly experience. Marriage may involve unconventional circumstances.',
            ketu: 'your soul seeks liberation through renunciation. Marriage may feel both binding and spiritually enlightening.'
        };
        return interpretations[planet] || 'deep karmic growth through relationships.';
    }

    getLagnaLordInterpretation(d9Lagna) {
        const { house } = d9Lagna;
        const beneficHouses = [1, 2, 4, 5, 7, 9, 10, 11];
        const isBenefic = beneficHouses.includes(house);
        return isBenefic
            ? `Placed in a favorable house in D9, indicating a strong, dharmic and supportive inner nature that benefits relationships.`
            : `Placed in a challenging house in D9 (House ${house}), indicating some inner conflicts around self-expression in relationships that need conscious work.`;
    }

    get7thLordInterpretation(d97th) {
        const h = d97th.house;
        const map = {
            1: 'Partner is self-focused, independent and strong-willed.',
            2: 'Partner brings wealth, family values and financial stability.',
            3: 'Partner is communicative, adventurous and has strong siblings.',
            4: 'Partner is homely, emotional and deeply connected to family.',
            5: 'Partner is creative, intelligent and may bring children early.',
            6: 'Partner involves service, health focus — may face obstacles in marriage.',
            7: 'Partner is highly relationship-oriented and marriage-focused.',
            8: 'Partner transforms you deeply — intense, mysterious, with hidden depths.',
            9: 'Partner is philosophical, fortunate and may be from a good family.',
            10: 'Partner is career-driven and socially prominent.',
            11: 'Partner brings gains, social connections and fulfills desires.',
            12: 'Partner may be from a foreign culture or spiritual background.'
        };
        return map[h] || 'Unique partner characteristics based on placement.';
    }
}
