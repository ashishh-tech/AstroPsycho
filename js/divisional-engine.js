/**
 * DivisionalEngine — Varga (Divisional) Chart Engine
 * Computes D1, D2, D3, D7, D9, D10, D12 from natal longitudes.
 * Depends on: astrology-engine-v8.js (VedicAstrologyEngine)
 */

class DivisionalEngine {
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

        // Varga definitions
        this.vargas = {
            D1: { name: 'Rashi (D1)', subtitle: 'Birth Chart', purpose: 'The foundation — your soul\'s blueprint for this life. All major life events are read from D1.', divisions: 1, color: '#64ffda' },
            D2: { name: 'Hora (D2)', subtitle: 'Wealth Chart', purpose: 'Reveals your wealth potential, financial acumen, and the material prosperity you are destined for.', divisions: 2, color: '#fbbf24' },
            D3: { name: 'Drekkana (D3)', subtitle: 'Siblings Chart', purpose: 'Governs siblings, courage, short journeys, and your capacity to take initiative in life.', divisions: 3, color: '#f87171' },
            D7: { name: 'Saptamsha (D7)', subtitle: 'Children Chart', purpose: 'Reveals children, grandchildren, procreation, legacy, and your creative expression through offspring.', divisions: 7, color: '#a78bfa' },
            D9: { name: 'Navamsa (D9)', subtitle: 'Dharma & Marriage', purpose: 'The most important divisional chart. Shows the soul\'s spiritual progress, marriage, and inner strength of planets.', divisions: 9, color: '#34d399' },
            D10: { name: 'Dashamsha (D10)', subtitle: 'Career Chart', purpose: 'Reveals professional life, career trajectory, recognition, social standing and contribution to society.', divisions: 10, color: '#60a5fa' },
            D12: { name: 'Dwadashamsha (D12)', subtitle: 'Parental Chart', purpose: 'Shows parents, ancestors, karmic heritage, and the lineage from which the soul emerges.', divisions: 12, color: '#fb923c' }
        };

        // Exaltation & debilitation for dignity checks
        this.exalt = { sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6 };   // sign index
        this.debilit = { sun: 6, moon: 7, mars: 3, mercury: 11, jupiter: 9, venus: 5, saturn: 0 };

        // Planet own signs
        this.ownSigns = {
            sun: [4], moon: [3], mars: [0, 7], mercury: [2, 5],
            jupiter: [8, 11], venus: [1, 6], saturn: [9, 10]
        };
    }

    /**
     * Universal formula to get Varga sign index from a natal longitude.
     */
    getVargaSign(longitude, varga) {
        const rashiIndex = Math.floor(longitude / 30);
        const degInRashi = longitude % 30;

        switch (varga) {
            case 'D1': return rashiIndex;

            case 'D2': { // Hora — 2 divisions per sign
                const horaDiv = Math.floor(degInRashi / 15); // 0 or 1
                // Odd signs: 1st hora = Leo, 2nd = Cancer
                // Even signs: 1st hora = Cancer, 2nd = Leo
                const isOdd = rashiIndex % 2 === 0; // Aries=index 0 = odd sign
                if (isOdd) return horaDiv === 0 ? 4 : 3; // Leo or Cancer
                else return horaDiv === 0 ? 3 : 4; // Cancer or Leo
            }

            case 'D3': { // Drekkana — 3 divisions per sign
                const drekPart = Math.floor(degInRashi / 10); // 0,1,2
                // 1st drekkana: same sign
                // 2nd drekkana: 5th sign from it
                // 3rd drekkana: 9th sign from it
                return (rashiIndex + drekPart * 4) % 12;
            }

            case 'D7': { // Saptamsha — 7 divisions per sign
                const sapPart = Math.floor(degInRashi / (30 / 7));
                // Odd signs: start from same sign
                // Even signs: start from 7th sign
                const isOddSign = rashiIndex % 2 === 0;
                const startSign = isOddSign ? rashiIndex : (rashiIndex + 6) % 12;
                return (startSign + sapPart) % 12;
            }

            case 'D9': { // Navamsa — existing engine logic
                const navPart = Math.floor(degInRashi / 3.333333);
                let startSign;
                if ([0, 4, 8].includes(rashiIndex)) startSign = 0;
                else if ([1, 5, 9].includes(rashiIndex)) startSign = 9;
                else if ([2, 6, 10].includes(rashiIndex)) startSign = 6;
                else startSign = 3;
                return (startSign + navPart) % 12;
            }

            case 'D10': { // Dashamsha — 10 divisions per sign
                const dashPart = Math.floor(degInRashi / 3);
                // Odd signs: start from same sign
                // Even signs: start from 9th sign
                const isOddSign = rashiIndex % 2 === 0;
                const startSign = isOddSign ? rashiIndex : (rashiIndex + 8) % 12;
                return (startSign + dashPart) % 12;
            }

            case 'D12': { // Dwadashamsha — 12 divisions per sign
                const d12Part = Math.floor(degInRashi / 2.5);
                return (rashiIndex + d12Part) % 12;
            }

            default: return rashiIndex;
        }
    }

    /**
     * Compute all vargas for all planets + ascendant.
     */
    computeAllVargas(natalPlanets, ascendant) {
        const result = {};
        const vagaKeys = Object.keys(this.vargas);

        for (const varga of vagaKeys) {
            const vargaAscSign = this.getVargaSign(ascendant, varga);
            const planets = {};

            for (const [planet, longitude] of Object.entries(natalPlanets)) {
                if (planet === 'velocities') continue;
                const signIdx = this.getVargaSign(longitude, varga);
                const house = (signIdx - vargaAscSign + 12) % 12 + 1;
                const dignity = this.getDignity(planet, signIdx);

                planets[planet] = {
                    signIdx,
                    sign: this.signs[signIdx],
                    house,
                    dignity,
                    longitude,
                    degree: (longitude % 3.333333) * 9
                };
            }

            result[varga] = {
                ascendantSignIdx: vargaAscSign,
                ascendantSign: this.signs[vargaAscSign],
                planets,
                ...this.vargas[varga]
            };
        }

        // Detect Vargottama planets (same sign in D1 and D9)
        const vargottama = [];
        for (const [planet, d1Data] of Object.entries(result.D1.planets)) {
            if (result.D9.planets[planet] && result.D9.planets[planet].signIdx === d1Data.signIdx) {
                vargottama.push(planet);
            }
        }

        return { vargas: result, vargottama };
    }

    getDignity(planet, signIdx) {
        if (!this.ownSigns[planet]) return 'Neutral';
        if (this.exalt[planet] === signIdx) return 'Exalted';
        if (this.debilit[planet] === signIdx) return 'Debilitated';
        if (this.ownSigns[planet] && this.ownSigns[planet].includes(signIdx)) return 'Own Sign';

        // Friend/Enemy based on natural relationships
        const friendlyLords = {
            sun: [3, 0, 8], moon: [4, 2], mars: [4, 3, 8],
            mercury: [4, 1], jupiter: [4, 3, 0], venus: [2, 9], saturn: [2, 1]
        };
        const enemyLords = {
            sun: [1, 9], moon: [], mars: [2], mercury: [3],
            jupiter: [2, 1], venus: [4, 3], saturn: [4, 3, 0]
        };

        if (friendlyLords[planet] && friendlyLords[planet].includes(signIdx % 12)) return 'Friendly';
        if (enemyLords[planet] && enemyLords[planet].includes(signIdx % 12)) return 'Enemy';
        return 'Neutral';
    }

    dignityColor(dignity) {
        const map = {
            'Exalted': '#22c55e',
            'Own Sign': '#34d399',
            'Friendly': '#60a5fa',
            'Neutral': '#94a3b8',
            'Enemy': '#f87171',
            'Debilitated': '#ef4444'
        };
        return map[dignity] || '#94a3b8';
    }

    /**
     * Get interpretation text for a planet in a specific varga sign.
     */
    getVargaInterpretation(varga, planet, signIdx, house) {
        const sign = this.signs[signIdx];
        const dignity = this.getDignity(planet, signIdx);

        const vargaPurpose = {
            D2: 'financial life', D3: 'siblings and courage', D7: 'children',
            D9: 'marriage and spirituality', D10: 'career and status', D12: 'parentage and ancestors'
        };

        const purpose = vargaPurpose[varga] || 'life';
        const dignityTexts = {
            'Exalted': `${planet} is exalted in ${sign} in ${varga} — bringing exceptional strength to ${purpose}. This is a powerfully auspicious placement.`,
            'Own Sign': `${planet} in own sign ${sign} in ${varga} — strong dignity enhancing ${purpose} significantly.`,
            'Friendly': `${planet} in friendly ${sign} in ${varga} — comfortable placement, supporting ${purpose} positively.`,
            'Neutral': `${planet} in ${sign} in ${varga} — neutral placement, ${purpose} proceeds with average support.`,
            'Enemy': `${planet} in enemy sign ${sign} in ${varga} — some friction in ${purpose}. Remedies help.`,
            'Debilitated': `${planet} is debilitated in ${sign} in ${varga} — challenges in ${purpose}. Neecha Bhanga may cancel this if other factors support.`
        };

        return dignityTexts[dignity] || `${planet} in ${sign} in ${varga} — ${purpose} governed by this placement.`;
    }
}
