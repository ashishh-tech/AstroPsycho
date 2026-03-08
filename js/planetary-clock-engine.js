/**
 * AstroPsycho Planetary Clock Engine
 * Calculates real-time positions of all 9 Vedic planets.
 * Reuses the same math as astrology-engine-v8.js for consistency.
 */

class PlanetaryClockEngine {
    constructor() {
        this.PLANETS = [
            { id: 'sun', name: 'Sun', symbol: '☉', color: '#f5c518', emoji: '☀️' },
            { id: 'moon', name: 'Moon', symbol: '☽', color: '#c0c8e0', emoji: '🌙' },
            { id: 'mercury', name: 'Mercury', symbol: '☿', color: '#64ffda', emoji: '🪐' },
            { id: 'venus', name: 'Venus', symbol: '♀', color: '#f472b6', emoji: '💫' },
            { id: 'mars', name: 'Mars', symbol: '♂', color: '#f87171', emoji: '🔴' },
            { id: 'jupiter', name: 'Jupiter', symbol: '♃', color: '#fed7aa', emoji: '🟠' },
            { id: 'saturn', name: 'Saturn', symbol: '♄', color: '#94a3b8', emoji: '🪐' },
            { id: 'rahu', name: 'Rahu', symbol: '☊', color: '#a855f7', emoji: '🌑' },
            { id: 'ketu', name: 'Ketu', symbol: '☋', color: '#818cf8', emoji: '☄️' }
        ];

        this.RASHIS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.RASHI_HI = ['मेष', 'वृष', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
            'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
        this.NAKSHATRAS = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
            'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];
    }

    norm(x) { return ((x % 360) + 360) % 360; }
    toRad(d) { return d * Math.PI / 180; }

    getJD(date) {
        let y = date.getUTCFullYear(), m = date.getUTCMonth() + 1;
        const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
        if (m <= 2) { y--; m += 12; }
        const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
    }

    getT(jd) { return (jd - 2451545.0) / 36525.0; }

    getAyanamsa(t) {
        const omega = this.toRad(125.0445 - 1934.1363 * t);
        const l_sun = this.toRad(280.4665 + 36000.7698 * t);
        const nutation = (-17.20 / 3600) * Math.sin(omega) - (1.32 / 3600) * Math.sin(2 * l_sun);
        return 23.8570922 + 1.39666 * t + 0.00030 * t * t + nutation;
    }

    getSun(t) {
        const l0 = 280.46646 + 36000.76983 * t;
        const m = this.norm(357.52911 + 35999.05029 * t);
        const mr = this.toRad(m);
        const c = 1.914602 * Math.sin(mr) + 0.019993 * Math.sin(2 * mr) + 0.000289 * Math.sin(3 * mr);
        const omega = this.norm(125.04 - 1934.1 * t);
        const app = this.norm(l0 + c - 0.00569 - 0.00478 * Math.sin(this.toRad(omega)));
        return app;
    }

    getMoon(t) {
        const lp = 218.3164477 + 481267.8813272 * t;
        const d = 297.8501921 + 445267.1114034 * t;
        const m = 357.5291092 + 35999.0502909 * t;
        const mp = 134.9633964 + 477198.8675055 * t;
        const f = 93.2720950 + 483202.0175233 * t;
        const E = 1 - 0.002516 * t;
        const r = x => this.toRad(x);
        let sl = 6.288774 * Math.sin(r(mp)) + 1.274027 * Math.sin(r(2 * d - mp)) +
            0.658314 * Math.sin(r(2 * d)) + 0.213618 * Math.sin(r(2 * mp)) -
            0.185116 * E * Math.sin(r(m)) - 0.114332 * Math.sin(r(2 * f)) +
            0.058793 * Math.sin(r(2 * d - 2 * mp)) + 0.057066 * E * Math.sin(r(2 * d - mp - m)) +
            0.053322 * Math.sin(r(2 * d + mp)) + 0.045758 * E * Math.sin(r(2 * d - m)) -
            0.040923 * E * Math.sin(r(mp - m)) - 0.034720 * Math.sin(r(d)) - 0.030383 * E * Math.sin(r(mp + m));
        return lp + sl;
    }

    getPlanetaryElements(t, planet) {
        const d = t * 36525.0;
        const elements = {
            mercury: { a: 0.387098, e: 0.205635 + 5.59e-10 * d, i: 7.0047, omega: 48.33076 + 3.24587e-5 * d, w: 29.1241 + 1.01271e-5 * d, m: 174.7925 + 4.0923344368 * d },
            venus: { a: 0.723330, e: 0.006773 - 1.302e-9 * d, i: 3.3946, omega: 76.67984 + 2.46548e-5 * d, w: 54.88407 + 9.932e-7 * d, m: 50.4074 + 1.6021302244 * d },
            mars: { a: 1.523688, e: 0.093405 + 2.516e-9 * d, i: 1.8497, omega: 49.5574 + 2.11081e-5 * d, w: 286.5016 + 2.92961e-5 * d, m: 19.3870 + 0.5240207766 * d },
            jupiter: { a: 5.202561, e: 0.048498 + 4.469e-9 * d, i: 1.3030, omega: 100.4542 + 2.76854e-5 * d, w: 273.8677 + 1.64505e-5 * d, m: 19.8950 + 0.0830853001 * d },
            saturn: { a: 9.55475, e: 0.055546 - 9.499e-9 * d, i: 2.4886, omega: 113.6624 + 2.38980e-5 * d, w: 339.3939 + 2.97661e-5 * d, m: 316.9670 + 0.0334442282 * d }
        };
        return elements[planet];
    }

    solveKepler(m, e) {
        let E = this.toRad(m);
        const mRad = this.toRad(m);
        for (let i = 0; i < 5; i++) E += (mRad - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
        return E;
    }

    getPlanetHelio(t, planet) {
        const el = this.getPlanetaryElements(t, planet);
        if (!el) return 0;
        const E = this.solveKepler(this.norm(el.m), el.e);
        const x_plan = el.a * (Math.cos(E) - el.e);
        const y_plan = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
        const node = this.toRad(el.omega), peri = this.toRad(el.w), incl = this.toRad(el.i);
        const cn = Math.cos(node), sn = Math.sin(node), cp = Math.cos(peri), sp = Math.sin(peri), ci = Math.cos(incl);
        const xe = x_plan * (cn * cp - sn * sp * ci) - y_plan * (cn * sp + sn * cp * ci);
        const ye = x_plan * (sn * cp + cn * sp * ci) - y_plan * (sn * sp - cn * cp * ci);
        return { x: xe, y: ye, r: Math.sqrt(xe * xe + ye * ye) };
    }

    getRahu(t) { return this.norm(125.0445222 - 1934.1362608 * t + 0.0020708 * t * t); }

    /**
     * Get all planet positions for a given UTC Date
     */
    calculate(date = new Date()) {
        const utcDate = new Date(date.getTime());
        const jd = this.getJD(utcDate);
        const t = this.getT(jd);
        const ayan = this.getAyanamsa(t);

        // Earth heliocentric
        const sunTrop = this.norm(this.getSun(t));
        const lEarth = this.norm(sunTrop + 180);
        const rEarth = 1.0;
        const lERad = this.toRad(lEarth);
        const xe = rEarth * Math.cos(lERad);
        const ye = rEarth * Math.sin(lERad);

        const sunSid = this.norm(sunTrop - ayan);
        const moonSid = this.norm(this.getMoon(t) - ayan);
        const rahuSid = this.norm(this.getRahu(t) - ayan);
        const ketuSid = this.norm(rahuSid + 180);

        const innerPlanets = {};
        ['mercury', 'venus', 'mars', 'jupiter', 'saturn'].forEach(p => {
            const h = this.getPlanetHelio(t, p);
            let lambda = Math.atan2(h.y - ye, h.x - xe) * 180 / Math.PI;
            innerPlanets[p] = this.norm(lambda - ayan);
        });

        const positions = {
            sun: sunSid, moon: moonSid,
            mercury: innerPlanets.mercury, venus: innerPlanets.venus,
            mars: innerPlanets.mars, jupiter: innerPlanets.jupiter,
            saturn: innerPlanets.saturn, rahu: rahuSid, ketu: ketuSid
        };

        return this.PLANETS.map(planet => {
            const lon = positions[planet.id];
            const rashiIdx = Math.floor(lon / 30);
            const deg = lon % 30;
            const nakIdx = Math.floor(lon / (360 / 27));
            return {
                ...planet,
                longitude: lon,
                rashi: this.RASHIS[rashiIdx],
                rashiHi: this.RASHI_HI[rashiIdx],
                rashiIndex: rashiIdx,
                degree: deg.toFixed(2),
                nakshatra: this.NAKSHATRAS[nakIdx],
                displayDeg: `${Math.floor(deg)}° ${Math.round((deg % 1) * 60)}'`,
                fullDisplay: `${this.RASHIS[rashiIdx]} ${Math.floor(deg)}°${Math.round((deg % 1) * 60)}'`
            };
        });
    }
}

window.PlanetaryClockEngine = PlanetaryClockEngine;
