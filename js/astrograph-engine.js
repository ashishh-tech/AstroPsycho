/**
 * AstroGraphEngine — 10-year monthly Health & Wealth scoring
 * Computes scores for each month of the next 10 years using
 * approximate planetary transit positions and natal chart data.
 * Zero external dependencies.
 */
class AstroGraphEngine {
    constructor() {
        this.MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this.MONTHS_HI = ['जन', 'फर', 'मार्च', 'अप्र', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्त', 'नव', 'दिस'];
        // Average daily motion in degrees
        this.MEAN_MOTION = {
            sun: 1.0, moon: 13.2, mars: 0.524, mercury: 1.38,
            jupiter: 0.083, venus: 1.2, saturn: 0.034, rahu: -0.053, ketu: -0.053
        };
        this.REF_POS = {
            sun: 280.46, moon: 218.32, mars: 355.45, mercury: 280.0,
            jupiter: 34.0, venus: 181.0, saturn: 49.94, rahu: 125.0, ketu: 305.0
        };
        this.J2000 = new Date('2000-01-01').getTime();
    }

    /**
     * Main entry — returns 10 years of monthly Health + Wealth scores
     * @param {Object} chart - birth chart from VedicAstrologyEngine
     * @param {number} startYear - first year (e.g. 2025)
     */
    analyze(chart, startYear) {
        this.chart = chart;
        this.asc = chart.ascendant;
        this.natPlanets = chart.planets;
        const years = [];
        for (let y = startYear; y < startYear + 10; y++) {
            years.push({ year: y, months: this._scoreYear(y) });
        }
        return years;
    }

    _getTransit(date) {
        const daysSince = (date.getTime() - this.J2000) / 86400000;
        const pos = {};
        Object.keys(this.MEAN_MOTION).forEach(pl => {
            pos[pl] = ((this.REF_POS[pl] + this.MEAN_MOTION[pl] * daysSince) % 360 + 360) % 360;
        });
        return pos;
    }

    _scoreYear(year) {
        const months = [];
        for (let m = 0; m < 12; m++) {
            const midMonth = new Date(year, m, 15, 12, 0, 0);
            const transit = this._getTransit(midMonth);
            const health = this._healthScore(transit);
            const wealth = this._wealthScore(transit);
            months.push({ month: m, health, wealth });
        }
        return months;
    }

    _transitHouse(pl, transit) {
        return Math.floor(((transit[pl] - this.asc + 360) % 360) / 30) + 1;
    }

    _natHouse(pl) {
        return Math.floor(((this.natPlanets[pl] - this.asc + 360) % 360) / 30) + 1;
    }

    _healthScore(transit) {
        let score = 50;
        // Moon transit from natal moon (Vedic)
        const moonTSign = Math.floor(transit.moon / 30);
        const moonNSign = Math.floor(this.natPlanets.moon / 30);
        const offset = ((moonTSign - moonNSign + 12) % 12) + 1;
        const moonTable = [0, -6, -3, 8, -5, 5, 8, -8, -5, 8, 5, 5, -5];
        score += moonTable[offset] || 0;
        // Jupiter transit on 1st, 6th
        const jupH = this._transitHouse('jupiter', transit);
        if ([1, 5, 9, 11].includes(jupH)) score += 9;
        else if ([6, 8, 12].includes(jupH)) score -= 6;
        // Saturn on 8th/12th (challenging)
        const satH = this._transitHouse('saturn', transit);
        if ([8, 12].includes(satH)) score -= 8;
        else if ([3, 6, 11].includes(satH)) score += 5;
        // Mars on 1st/8th (critical)
        const marH = this._transitHouse('mars', transit);
        if ([1, 8].includes(marH)) score -= 7;
        else if ([3, 6, 11].includes(marH)) score += 5;
        // Natal benefic in 1st/6th house bonus
        const jupNat = this._natHouse('jupiter');
        if ([1, 5, 9].includes(jupNat)) score += 5;
        return Math.max(15, Math.min(100, Math.round(score)));
    }

    _wealthScore(transit) {
        let score = 50;
        // Jupiter — wealth karaka
        const jupH = this._transitHouse('jupiter', transit);
        if ([2, 5, 9, 11].includes(jupH)) score += 11;
        else if ([6, 8, 12].includes(jupH)) score -= 7;
        // Venus
        const venH = this._transitHouse('venus', transit);
        if ([2, 7, 11].includes(venH)) score += 7;
        else if ([6, 8].includes(venH)) score -= 5;
        // Saturn
        const satH = this._transitHouse('saturn', transit);
        if ([10, 11].includes(satH)) score += 6;
        else if ([2, 8].includes(satH)) score -= 6;
        // Rahu — sudden gains/losses
        const rahuH = this._transitHouse('rahu', transit);
        if ([11].includes(rahuH)) score += 8;
        else if ([8, 12].includes(rahuH)) score -= 5;
        // Mercury — business
        const merH = this._transitHouse('mercury', transit);
        if ([2, 11].includes(merH)) score += 5;
        // Natal Jupiter in 2nd/11th bonus
        const jupNat = this._natHouse('jupiter');
        if ([2, 5, 9, 11].includes(jupNat)) score += 6;
        return Math.max(15, Math.min(100, Math.round(score)));
    }
}
