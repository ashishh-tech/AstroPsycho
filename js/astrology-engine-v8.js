// Vedic Astrology Engine
// Calculates birth charts, Dasha periods, and planetary positions

class VedicAstrologyEngine {
    constructor() {
        // Ayanamsa (precession correction for sidereal zodiac)
        // Using Lahiri Ayanamsa
        this.ayanamsaBase = 23.85; // degrees at reference date
        this.ayanamsaRate = 0.0139; // degrees per year
        this.referenceYear = 2000;

        // Vimshottari Dasha years
        this.dashaYears = {
            ketu: 7,
            venus: 20,
            sun: 6,
            moon: 10,
            mars: 7,
            rahu: 18,
            jupiter: 16,
            saturn: 19,
            mercury: 17
        };

        // Nakshatra data (27 lunar mansions, 13°20' each)
        this.nakshatras = [
            { name: 'ashwini', lord: 'ketu', start: 0 },
            { name: 'bharani', lord: 'venus', start: 13.333 },
            { name: 'krittika', lord: 'sun', start: 26.666 },
            { name: 'rohini', lord: 'moon', start: 40 },
            { name: 'mrigashira', lord: 'mars', start: 53.333 },
            { name: 'ardra', lord: 'rahu', start: 66.666 },
            { name: 'punarvasu', lord: 'jupiter', start: 80 },
            { name: 'pushya', lord: 'saturn', start: 93.333 },
            { name: 'ashlesha', lord: 'mercury', start: 106.666 },
            { name: 'magha', lord: 'ketu', start: 120 },
            { name: 'purva_phalguni', lord: 'venus', start: 133.333 },
            { name: 'uttara_phalguni', lord: 'sun', start: 146.666 },
            { name: 'hasta', lord: 'moon', start: 160 },
            { name: 'chitra', lord: 'mars', start: 173.333 },
            { name: 'swati', lord: 'rahu', start: 186.666 },
            { name: 'vishakha', lord: 'jupiter', start: 200 },
            { name: 'anuradha', lord: 'saturn', start: 213.333 },
            { name: 'jyeshtha', lord: 'mercury', start: 226.666 },
            { name: 'mula', lord: 'ketu', start: 240 },
            { name: 'purva_ashadha', lord: 'venus', start: 253.333 },
            { name: 'uttara_ashadha', lord: 'sun', start: 266.666 },
            { name: 'shravana', lord: 'moon', start: 280 },
            { name: 'dhanishtha', lord: 'mars', start: 293.333 },
            { name: 'shatabhisha', lord: 'rahu', start: 306.666 },
            { name: 'purva_bhadrapada', lord: 'jupiter', start: 320 },
            { name: 'uttara_bhadrapada', lord: 'saturn', start: 333.333 },
            { name: 'revati', lord: 'mercury', start: 346.666 }
        ];

        // Planetary Data: Ownership, Exaltation, Relationships
        this.planetaryConstants = {
            sun: { own: [4], moolatrikona: { sign: 4, start: 0, end: 20 }, exalt: 10, debilit: 190, friends: ['moon', 'mars', 'jupiter'], enemies: ['venus', 'saturn'], neutral: ['mercury'] },
            moon: { own: [3], moolatrikona: { sign: 1, start: 3, end: 30 }, exalt: 33, debilit: 213, friends: ['sun', 'mercury'], enemies: [], neutral: ['mars', 'jupiter', 'venus', 'saturn'] },
            mars: { own: [0, 7], moolatrikona: { sign: 0, start: 0, end: 12 }, exalt: 298, debilit: 118, friends: ['sun', 'moon', 'jupiter'], enemies: ['mercury'], neutral: ['venus', 'saturn'] },
            mercury: { own: [2, 5], moolatrikona: { sign: 5, start: 15, end: 20 }, exalt: 165, debilit: 345, friends: ['sun', 'venus'], enemies: ['moon'], neutral: ['mars', 'jupiter', 'saturn'] },
            jupiter: { own: [8, 11], moolatrikona: { sign: 8, start: 0, end: 10 }, exalt: 95, debilit: 275, friends: ['sun', 'moon', 'mars'], enemies: ['mercury', 'venus'], neutral: ['saturn'] },
            venus: { own: [1, 6], moolatrikona: { sign: 6, start: 0, end: 15 }, exalt: 357, debilit: 177, friends: ['mercury', 'saturn'], enemies: ['sun', 'moon'], neutral: ['mars', 'jupiter'] },
            saturn: { own: [9, 10], moolatrikona: { sign: 10, start: 0, end: 20 }, exalt: 200, debilit: 20, friends: ['mercury', 'venus'], enemies: ['sun', 'moon', 'mars'], neutral: ['jupiter'] },
            rahu: { own: [10], exalt: 63, debilit: 243, friends: ['venus', 'saturn', 'mercury'], enemies: ['sun', 'moon', 'mars'], neutral: ['jupiter'] },
            ketu: { own: [8], exalt: 243, debilit: 63, friends: ['mars', 'jupiter', 'venus', 'saturn'], enemies: ['sun', 'moon'], neutral: ['mercury'] }
        };

        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    }

    // Calculate birth chart from birth details
    calculateBirthChart(birthDetails) {
        const { birthDate, birthTime, birthPlace } = birthDetails;

        // Parse components for wall-clock time (independent of browser locale)
        const [year, month, day] = birthDate.split('-').map(Number);
        const [hour, min] = birthTime.split(':').map(Number);

        // Create a local date object for display and non-UTC calculations
        const dateTime = new Date(year, month - 1, day, hour, min);

        // Create date as if it were UTC (naive parse) for astronomical calculations
        const utcDateTime = new Date(Date.UTC(year, month - 1, day, hour, min));

        // Adjust for timezone offset to get the actual UTC time
        // Formula: UTC = Local Time - Offset
        utcDateTime.setMinutes(utcDateTime.getMinutes() - (birthDetails.timezone * 60));

        console.log('✅ Birth Details:', birthPlace, birthDate, birthTime, `(UTC${birthDetails.timezone >= 0 ? '+' : ''}${birthDetails.timezone})`);
        console.log('✅ Calculated UTC Time:', utcDateTime.toUTCString());

        // High precision calculations
        const jd = this.calculateJulianDate(utcDateTime);
        const t = (jd - 2451545.0) / 36525.0;
        const ayanamsa = this.calculatePreciseAyanamsa(t);

        const chart = {
            dateTime: dateTime,
            utcDateTime: utcDateTime,
            birthPlace: birthPlace,
            location: {
                latitude: birthDetails.latitude || 28.61,
                longitude: birthDetails.longitude || 77.20
            },
            planets: this.calculatePrecisePlanets(t, ayanamsa),
            ascendant: this.calculatePreciseAscendant(jd, t, ayanamsa, birthDetails.latitude || 28.61, birthDetails.longitude || 77.20),
            navamsha: null,
            nakshatras: {},
            dashas: null
        };

        // Calculate Navamsha (D-9)
        chart.navamsha = this.calculateNavamsha(chart.planets, chart.ascendant);

        // Calculate Nakshatras based on SIDEREAL Moon position
        const moonNak = this.getNakshatra(chart.planets.moon);
        chart.nakshatras = {
            moon: moonNak,
            moonLord: moonNak.lord,
            progress: moonNak.progress
        };

        // Calculate detailed planetary data (Degrees, Signs, Status)
        chart.planetaryDetails = this.getPlanetaryDetails(chart.planets, chart.ascendant);

        // Calculate Ashtakavarga
        chart.ashtakavarga = this.calculateAshtakavarga(chart.planets, chart.ascendant);

        // Calculate Shadbala
        chart.shadbala = this.calculateShadbala(chart.planets, chart.ascendant, dateTime);

        // Calculate House Results
        chart.houseResults = this.calculateHouseResults(chart.planets, chart.ascendant);

        // Calculate Dasha periods
        chart.dashas = this.calculateVimshottariDasha(chart.nakshatras, dateTime);

        // Core Life Stability Metrics (Ultra-Precision Engine)
        chart.stabilityMetrics = this.calculateDimensionalMetrics(chart);

        return chart;
    }

    // Precise Julian Date
    calculateJulianDate(date) {
        let y = date.getUTCFullYear();
        let m = date.getUTCMonth() + 1;
        const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;

        if (m <= 2) {
            y -= 1;
            m += 12;
        }

        const a = Math.floor(y / 100);
        const b = 2 - a + Math.floor(a / 4);

        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
    }

    // Precise Lahiri Ayanamsa (Chitra Paksha) with Nutation
    calculatePreciseAyanamsa(t) {
        // Standard Lahiri Ayanamsa: 23° 51' 25.533" at J2000.0 (January 1.5, 2000)
        const ayanamsaJ2000 = 23.8570922;
        // Rate: 1.3966°/century (50.278" per year)
        let ayan = ayanamsaJ2000 + 1.39666 * t + 0.00030 * t * t;

        // Nutation in Longitude (simplified)
        const omega = this.toRadians(125.0445 - 1934.1363 * t); // Node of moon
        const l_sun = this.toRadians(280.4665 + 36000.7698 * t); // Mean long of sun
        const nutation = (-17.20 / 3600) * Math.sin(omega) - (1.32 / 3600) * Math.sin(2 * l_sun);

        return ayan + nutation;
    }

    // High Precision Planetary Positions
    calculatePrecisePlanets(t, ayanamsa) {
        const sunGeocentric = this.calculateSun(t);
        const lEarth = this.normalize(sunGeocentric.l + 180);
        const rEarth = sunGeocentric.r;
        const pList = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];

        const getGeocentric = (time) => {
            const sunData = this.calculateSun(time);
            // Earth coordinates (Heliocentric) use GEOMETRIC sun longitude 
            const lE = this.toRadians(this.normalize(sunData.geometricL + 180));
            const rE = sunData.r;

            const res = {
                sun: this.normalize(sunData.l - ayanamsa),
                moon: this.normalize(this.calculateMoon(time) - ayanamsa)
            };

            pList.forEach(p => {
                // High Precision Planet Calculation with Light-Time Correction
                let helio = this.calculatePlanetOrbit(time, p);

                // Earth's heliocentric XYZ (geometric, no aberration yet)
                const xe = rE * Math.cos(lE);
                const ye = rE * Math.sin(lE);
                const ze = 0;

                // Initial Geocentric distance for light-time
                const xp0 = helio.r * Math.cos(this.toRadians(helio.b || 0)) * Math.cos(this.toRadians(helio.l));
                const yp0 = helio.r * Math.cos(this.toRadians(helio.b || 0)) * Math.sin(this.toRadians(helio.l));
                const zp0 = helio.r * Math.sin(this.toRadians(helio.b || 0));
                const dist = Math.sqrt((xp0 - xe) ** 2 + (yp0 - ye) ** 2 + (zp0 - ze) ** 2);

                // Light-time correction: t_actual = t_obs - dist/c
                // 1 AU light time = 0.0057755 days = 0.0057755 / 36525 centuries
                const dt = (dist * 0.0057755) / 36525.0;
                helio = this.calculatePlanetOrbit(time - dt, p);

                const lp = this.toRadians(helio.l);
                const rp = helio.r;
                const bp = this.toRadians(helio.b || 0);

                // Planet's heliocentric XYZ at t - dt
                const xp = rp * Math.cos(bp) * Math.cos(lp);
                const yp = rp * Math.cos(bp) * Math.sin(lp);
                const zp = rp * Math.sin(bp);

                // Geocentric XYZ
                const x = xp - xe;
                const y = yp - ye;
                const z = zp - ze;

                let lambda = Math.atan2(y, x) * (180 / Math.PI);
                res[p] = this.normalize(lambda - ayanamsa);
            });

            const rahuMean = this.calculateRahu(time);
            res.rahu = this.normalize(rahuMean - ayanamsa);
            res.ketu = this.normalize(rahuMean + 180 - ayanamsa);

            return res;
        };

        const planets = getGeocentric(t);
        const dt = 0.00001;
        const planetsNext = getGeocentric(t + dt);

        planets.velocities = {};
        pList.forEach(p => {
            let diff = planetsNext[p] - planets[p];
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            planets.velocities[p] = diff;
        });

        return planets;
    }

    calculateSun(t) {
        // Geometric Mean Longitude
        const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
        // Mean Anomaly
        const m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
        // Equation of Center
        const c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(this.toRadians(m)) +
            (0.019993 - 0.000101 * t) * Math.sin(this.toRadians(2 * m)) +
            0.000289 * Math.sin(this.toRadians(3 * m));

        const trueLong = this.normalize(l0 + c);
        const e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
        const r = 1.00014061 * (1 - e * e) / (1 + e * Math.cos(this.toRadians(m + c)));

        // Nutation and Aberration (simplified)
        const omega = this.toRadians(125.04 - 1934.1 * t);
        const appLong = trueLong - 0.00569 - 0.00478 * Math.sin(omega);

        return { l: appLong, r: r, geometricL: trueLong };
    }

    calculateMoon(t) {
        // Full Meeus Chapter 47 Moon Longitude Calculation
        // Mean quantities
        const lp = 218.3164477 + 481267.8813272 * t - 0.0013268 * t * t; // Mean longitude L'
        const d = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t; // Mean elongation D
        const m = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t; // Sun mean anomaly M
        const mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t; // Moon mean anomaly M'
        const f = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t; // Moon arg. of latitude F

        // Additive corrections
        const a1 = 119.75 + 131.849 * t;   // Venus influence
        const a2 = 53.09 + 479264.290 * t; // Jupiter influence
        const a3 = 313.45 + 481266.484 * t; // Earth's flattening

        // E factor for solar anomaly terms (Earth's orbital eccentricity)
        const E = 1 - 0.002516 * t - 0.0000074 * t * t;
        const E2 = E * E;

        const r = this.toRadians.bind(this);

        // Full longitude perturbation series (Meeus Table 47.A, terms ≥ 0.003°)
        let ΣL =
            6.288774 * Math.sin(r(mp)) +
            1.274027 * Math.sin(r(2 * d - mp)) +
            0.658314 * Math.sin(r(2 * d)) +
            0.213618 * Math.sin(r(2 * mp)) +
            -0.185116 * E * Math.sin(r(m)) +
            -0.114332 * Math.sin(r(2 * f)) +
            0.058793 * Math.sin(r(2 * d - 2 * mp)) +
            0.057066 * E * Math.sin(r(2 * d - mp - m)) +
            0.053322 * Math.sin(r(2 * d + mp)) +
            0.045758 * E * Math.sin(r(2 * d - m)) +
            -0.040923 * E * Math.sin(r(mp - m)) +
            -0.034720 * Math.sin(r(d)) +
            -0.030383 * E * Math.sin(r(mp + m)) +
            0.015327 * Math.sin(r(2 * d - 2 * f)) +
            -0.012528 * Math.sin(r(mp + 2 * f)) +
            0.010980 * Math.sin(r(mp - 2 * f)) +
            0.010675 * Math.sin(r(4 * d - mp)) +
            0.010034 * Math.sin(r(3 * mp)) +
            0.008548 * Math.sin(r(4 * d - 2 * mp)) +
            -0.007888 * E * Math.sin(r(2 * d + m - mp)) +
            -0.006766 * E * Math.sin(r(2 * d + m)) +
            -0.005163 * Math.sin(r(d - mp)) +
            0.004987 * E * Math.sin(r(d + m)) +
            0.004036 * E * Math.sin(r(2 * d - m + mp)) +
            0.003994 * Math.sin(r(2 * d + 2 * mp)) +
            0.003861 * Math.sin(r(4 * d)) +
            0.003665 * Math.sin(r(2 * d - 3 * mp)) +
            -0.002689 * E * Math.sin(r(mp - 2 * m)) +
            -0.002602 * Math.sin(r(2 * d - mp + 2 * f)) +
            0.002390 * E2 * Math.sin(r(2 * d - 2 * m)) +
            -0.002348 * Math.sin(r(d + mp)) +
            0.002236 * E2 * Math.sin(r(2 * d - 2 * m - mp)) +
            -0.002120 * E * Math.sin(r(3 * mp - m)) +
            -0.002069 * E2 * Math.sin(r(2 * m)) +
            0.002048 * E2 * Math.sin(r(2 * d - 2 * m + mp)) +
            -0.001773 * Math.sin(r(2 * d + mp - 2 * f)) +
            -0.001595 * Math.sin(r(2 * d + 2 * f)) +
            0.001215 * E * Math.sin(r(4 * d - m - mp)) +
            -0.001110 * Math.sin(r(2 * mp + 2 * f)) +
            -0.000892 * Math.sin(r(3 * d - mp)) +
            -0.000811 * E * Math.sin(r(2 * d + m + mp)) +
            0.000761 * E * Math.sin(r(4 * d - m - 2 * mp)) +
            0.000717 * E2 * Math.sin(r(mp - 2 * m)) +
            0.000704 * E2 * Math.sin(r(mp - 2 * m - d)) +
            0.000693 * E * Math.sin(r(m - 2 * mp + 2 * d)) +
            0.000598 * E * Math.sin(r(2 * d - m - 2 * f)) +
            0.000550 * Math.sin(r(mp + 4 * d)) +
            0.000538 * Math.sin(r(4 * mp)) +
            0.000521 * E * Math.sin(r(4 * d - m)) +
            0.000486 * Math.sin(r(2 * mp - d));

        // Additive corrections from Meeus
        ΣL += 0.003958 * Math.sin(r(a1));
        ΣL += 0.001962 * Math.sin(r(lp - f));
        ΣL += 0.000318 * Math.sin(r(a2));

        return this.normalize(lp + ΣL);
    }

    calculatePlanetOrbit(t, planet) {
        const d = t * 36525.0; // Days from J2000.0

        const elements = {
            mercury: {
                a: 0.387098, e: 0.205635 + 5.59e-10 * d, i: 7.0047 + 5.00e-8 * d,
                omega: 48.33076 + 0.0000324587 * d, w: 29.1241 + 0.0000101271 * d,
                m: 174.7925 + 4.0923344368 * d
            },
            venus: {
                a: 0.723330, e: 0.006773 - 1.302e-9 * d, i: 3.3946 + 2.75e-8 * d,
                omega: 76.67984 + 0.0000246548 * d, w: 54.88407 + 9.932e-7 * d,
                m: 50.4074 + 1.6021302244 * d
            },
            mars: {
                a: 1.523688, e: 0.093405 + 2.516e-9 * d, i: 1.8497 - 1.78e-8 * d,
                omega: 49.5574 + 0.0000211081 * d, w: 286.5016 + 0.0000292961 * d,
                m: 19.3870 + 0.5240207766 * d
            },
            jupiter: {
                a: 5.202561, e: 0.048498 + 4.469e-9 * d, i: 1.3030 - 1.557e-7 * d,
                omega: 100.4542 + 0.0000276854 * d, w: 273.8677 + 0.0000164505 * d,
                m: 19.8950 + 0.0830853001 * d
            },
            saturn: {
                a: 9.55475, e: 0.055546 - 9.499e-9 * d, i: 2.4886 - 1.081e-7 * d,
                omega: 113.6624 + 0.0000238980 * d, w: 339.3939 + 0.0000297661 * d,
                m: 316.9670 + 0.0334442282 * d
            }
        };

        const el = elements[planet];
        if (!el) return { l: 0, r: 0 };

        let m = this.normalize(el.m);
        let e = el.e;

        // Detailed Perturbations (from Schlyter/JPL)
        const mj = this.normalize(elements.jupiter.m);
        const ms = this.normalize(elements.saturn.m);
        // Mean Longitudes L = M + w + Omega (Schlyter's w is argument of perihelion)
        const lj = this.normalize(mj + elements.jupiter.w + elements.jupiter.omega);
        const ls = this.normalize(ms + elements.saturn.w + elements.saturn.omega);
        const arg = this.toRadians(2 * ls - 5 * lj + 67.6);

        if (planet === 'jupiter') {
            m += (0.329 - 0.011 * t) * Math.sin(arg);
            m -= 0.015 * Math.cos(arg);
            m += 0.020 * Math.sin(this.toRadians(2 * ms - 2 * mj + 67.6));
        }
        else if (planet === 'saturn') {
            m += (-0.817 + 0.024 * t) * Math.sin(arg);
            m += 0.049 * Math.cos(arg);
            m += 0.025 * Math.sin(this.toRadians(ms - 2 * mj + 67.6)); // Corrected argument
            m -= 0.010 * Math.sin(this.toRadians(2 * ms - 6 * mj + 67.6));
        }

        let eccEnt = this.toRadians(m);
        for (let i = 0; i < 5; i++) {
            eccEnt = eccEnt + (this.toRadians(m) - (eccEnt - e * Math.sin(eccEnt))) / (1 - e * Math.cos(eccEnt));
        }

        // Heliocentric coordinates in orbital plane
        const x_plan = el.a * (Math.cos(eccEnt) - e);
        const y_plan = el.a * Math.sqrt(1 - e * e) * Math.sin(eccEnt);

        // Transformation to Ecliptic coordinates
        const node = this.toRadians(el.omega);
        const peri = this.toRadians(el.w); // Schlyter w is already argument of perihelion
        const incl = this.toRadians(el.i);

        const cosNode = Math.cos(node);
        const sinNode = Math.sin(node);
        const cosPeri = Math.cos(peri);
        const sinPeri = Math.sin(peri);
        const cosIncl = Math.cos(incl);
        const sinIncl = Math.sin(incl);

        const x_ecl = x_plan * (cosNode * cosPeri - sinNode * sinPeri * cosIncl) - y_plan * (cosNode * sinPeri + sinNode * cosPeri * cosIncl);
        const y_ecl = x_plan * (sinNode * cosPeri + cosNode * sinPeri * cosIncl) - y_plan * (sinNode * sinPeri - cosNode * cosPeri * cosIncl);
        const z_ecl = x_plan * (sinPeri * sinIncl) + y_plan * (cosPeri * sinIncl);

        const r = Math.sqrt(x_ecl * x_ecl + y_ecl * y_ecl + z_ecl * z_ecl);
        const l = Math.atan2(y_ecl, x_ecl) * (180 / Math.PI);

        return { l: this.normalize(l), r: r, b: Math.asin(z_ecl / r) * (180 / Math.PI) };
    }

    calculateRahu(t) {
        return this.normalize(125.0445222 - 1934.1362608 * t + 0.0020708 * t * t);
    }

    calculatePreciseAscendant(jd, t, ayanamsa, lat, lon) {
        let gmst = this.normalize(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t);
        const lst = this.normalize(gmst + lon);
        const epsRad = this.toRadians(23.43929111 - 0.01300416 * t);
        const lstRad = this.toRadians(lst);
        const latRad = this.toRadians(lat);

        const y = Math.cos(lstRad);
        const x = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);

        let asc = Math.atan2(y, x) * (180 / Math.PI);
        return this.normalize(asc - ayanamsa);
    }

    calculateNavamsha(planets, ascendant) {
        const d9Planets = {};
        const getNavSign = (longitude) => {
            const rashiIndex = Math.floor(longitude / 30);
            const degreeInRashi = longitude % 30;
            const navPart = Math.floor(degreeInRashi / 3.333333);

            let startSign;
            if ([0, 4, 8].includes(rashiIndex)) startSign = 0;
            else if ([1, 5, 9].includes(rashiIndex)) startSign = 9;
            else if ([2, 6, 10].includes(rashiIndex)) startSign = 6;
            else startSign = 3;

            return (startSign + navPart) % 12;
        };

        for (const [planet, long] of Object.entries(planets)) {
            if (planet === 'velocities') continue;
            const signIdx = getNavSign(long);
            d9Planets[planet] = {
                longitude: long,
                signIndex: signIdx,
                sign: this.signs[signIdx],
                degree: (long % 3.333333) * 9,
                house: 0
            };
        }

        const d9AscSign = getNavSign(ascendant);
        for (const p in d9Planets) {
            d9Planets[p].house = (d9Planets[p].signIndex - d9AscSign + 12) % 12 + 1;
        }

        return { planets: d9Planets, ascendantSign: d9AscSign + 1 };
    }

    getPlanetaryDetails(planets, ascendant) {
        const details = {};
        const lordMap = [
            'mars',   // Aries
            'venus',  // Taurus
            'mercury',// Gemini
            'moon',   // Cancer
            'sun',    // Leo
            'mercury',// Virgo
            'venus',  // Libra
            'mars',   // Scorpio
            'jupiter',// Sagittarius
            'saturn', // Capricorn
            'saturn', // Aquarius
            'jupiter' // Pisces
        ];

        for (const [planet, pos] of Object.entries(planets)) {
            if (planet === 'velocities') continue;
            const signIndex = Math.floor(pos / 30);
            const degreeInSign = pos % 30;
            const house = this.getHouseNumber(pos, ascendant);
            const constants = this.planetaryConstants[planet];
            if (!constants) continue;

            const houseLord = lordMap[signIndex];
            const ascendantLord = lordMap[Math.floor(ascendant / 30)];
            let status = 'Neutral';

            // 1. Check Exaltation / Debilitation
            if (this.isExalted(planet, pos)) status = 'Exalted';
            else if (this.isDebilitated(planet, pos)) status = 'Debilitated';
            // 2. Check Moolatrikona
            else if (constants.moolatrikona && signIndex === constants.moolatrikona.sign && degreeInSign >= constants.moolatrikona.start && degreeInSign <= constants.moolatrikona.end) {
                status = 'Moolatrikona';
            }
            // 3. Check Own Sign
            else if (constants.own.includes(signIndex)) status = 'Own Sign';
            // 4. Check Relationship with the Lord of the Sign (Panchadha Maitri)
            else if (houseLord) {
                let relationship = this.getFiveFoldRelationship(planet, houseLord, planets);

                // EXCEPTION: Lagnesh (Ascendant Lord) is a functional benefic for the chart.
                // Most famous astrologers (B.V. Raman, Parasara) state that the Lagnesh is always auspicious.
                // We upgrade the status if it's the Lagna Lord to reflect this functional protection.
                if (planet === ascendantLord && (relationship === 'Enemy' || relationship === 'Great Enemy')) {
                    status = 'Neutral (Lagna Lord)';
                } else {
                    status = relationship;
                }
            }

            const nakData = this.getNakshatra(pos);

            details[planet] = {
                longitude: pos,
                sign: this.signs[signIndex],
                signIndex: signIndex,
                degree: degreeInSign,
                house: house,
                status: status,
                nakshatra: nakData.name ? nakData.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '-',
                nakshatraLord: nakData.lord || '-',
                isRetrograde: planets.velocities ? (planets.velocities[planet] < 0) : false
            };
        }
        return details;
    }

    getFiveFoldRelationship(planet, houseLord, planets) {
        if (planet === houseLord) return 'Own Sign';

        const constants = this.planetaryConstants[planet];
        if (!constants) return 'Neutral';

        // Natural Relationship
        let natural = 0; // 0 = Neutral, 1 = Friend, -1 = Enemy
        if (constants.friends.includes(houseLord)) natural = 1;
        else if (constants.enemies.includes(houseLord)) natural = -1;

        // Temporal Relationship (Tatkalika)
        // Planets in 2, 3, 4, 10, 11, 12 houses from each other are friends
        // diff calculation: (House position 2 - House position 1 + 12) % 12
        // If diff is 1, 2, 3, 9, 10, 11 (corresponds to houses 2, 3, 4, 10, 11, 12)
        const p1Sign = Math.floor(planets[planet] / 30);
        const p2Sign = Math.floor(planets[houseLord] / 30);
        const diff = (p2Sign - p1Sign + 12) % 12;

        let temporal = ([1, 2, 3, 9, 10, 11].includes(diff)) ? 1 : -1;

        // Combine for Panchadha Maitri
        const combined = natural + temporal;
        if (combined === 2) return 'Great Friend';
        if (combined === 1) return 'Friend';
        if (combined === 0) return 'Neutral';
        if (combined === -1) return 'Enemy';
        if (combined === -2) return 'Great Enemy';

        return 'Neutral';
    }

    isExalted(planet, pos) {
        const signIndex = Math.floor(pos / 30);
        const constants = this.planetaryConstants[planet];
        if (!constants) return false;
        return signIndex === Math.floor(constants.exalt / 30);
    }

    isDebilitated(planet, pos) {
        const signIndex = Math.floor(pos / 30);
        const constants = this.planetaryConstants[planet];
        if (!constants) return false;
        return signIndex === Math.floor(constants.debilit / 30);
    }

    calculateAshtakavarga(planets, ascendant) {
        const planetList = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
        const ashtakavargaRules = {
            sun: { fromSun: [1, 2, 4, 7, 8, 9, 10, 11], fromMoon: [3, 6, 10, 11], fromMars: [1, 2, 4, 7, 8, 9, 10, 11], fromMercury: [3, 5, 6, 9, 10, 11, 12], fromJupiter: [5, 6, 9, 11], fromVenus: [6, 7, 12], fromSaturn: [1, 2, 4, 7, 8, 9, 10, 11], fromAscendant: [3, 4, 6, 10, 11, 12] },
            moon: { fromSun: [3, 6, 7, 8, 10, 11], fromMoon: [1, 3, 6, 7, 10, 11], fromMars: [2, 3, 5, 6, 9, 10, 11], fromMercury: [1, 3, 4, 5, 7, 8, 10, 11], fromJupiter: [1, 4, 7, 8, 10, 11, 12], fromVenus: [3, 4, 5, 7, 9, 10, 11], fromSaturn: [3, 5, 6, 11], fromAscendant: [3, 6, 7, 8, 10, 11] },
            mars: { fromSun: [3, 5, 6, 10, 11], fromMoon: [3, 6, 11], fromMars: [1, 2, 4, 7, 8, 10, 11], fromMercury: [3, 5, 6, 11], fromJupiter: [6, 10, 11, 12], fromVenus: [6, 8, 11, 12], fromSaturn: [1, 4, 7, 8, 9, 10, 11], fromAscendant: [1, 3, 6, 10, 11] },
            mercury: { fromSun: [5, 6, 9, 11, 12], fromMoon: [2, 4, 6, 8, 10, 11], fromMars: [1, 2, 4, 7, 8, 9, 10, 11], fromMercury: [1, 3, 5, 6, 9, 10, 11, 12], fromJupiter: [6, 8, 11, 12], fromVenus: [1, 2, 3, 4, 5, 8, 9, 11], fromSaturn: [1, 2, 4, 7, 8, 9, 10, 11], fromAscendant: [1, 2, 4, 6, 8, 10, 11] },
            jupiter: { fromSun: [1, 2, 3, 4, 7, 8, 9, 10, 11], fromMoon: [2, 5, 7, 9, 11], fromMars: [1, 2, 4, 7, 8, 10, 11], fromMercury: [1, 2, 4, 5, 6, 9, 10, 11], fromJupiter: [1, 2, 3, 4, 7, 8, 10, 11], fromVenus: [2, 5, 6, 9, 10, 11], fromSaturn: [3, 5, 6, 12], fromAscendant: [1, 2, 4, 5, 6, 7, 9, 10, 11] },
            venus: { fromSun: [8, 11, 12], fromMoon: [1, 2, 3, 4, 5, 8, 9, 11, 12], fromMars: [3, 4, 6, 9, 11, 12], fromMercury: [3, 5, 6, 9, 11], fromJupiter: [5, 8, 9, 10, 11], fromVenus: [1, 2, 3, 4, 5, 8, 9, 10, 11], fromSaturn: [3, 4, 5, 8, 9, 10, 11], fromAscendant: [1, 2, 3, 4, 5, 8, 9, 11, 12] },
            saturn: { fromSun: [1, 2, 4, 7, 8, 10, 11], fromMoon: [3, 6, 11], fromMars: [3, 5, 6, 10, 11, 12], fromMercury: [6, 8, 9, 10, 11, 12], fromJupiter: [5, 6, 11, 12], fromVenus: [6, 11, 12], fromSaturn: [3, 5, 6, 11], fromAscendant: [1, 3, 4, 6, 10, 11] }
        };

        const positions = {};
        planetList.forEach(p => { positions[p] = Math.floor(planets[p] / 30); });
        positions.ascendant = Math.floor(ascendant / 30);

        const bhinnashtakavarga = {};
        planetList.forEach(planet => {
            bhinnashtakavarga[planet] = new Array(12).fill(0);
            const rules = ashtakavargaRules[planet];
            const referencePoints = { fromSun: positions.sun, fromMoon: positions.moon, fromMars: positions.mars, fromMercury: positions.mercury, fromJupiter: positions.jupiter, fromVenus: positions.venus, fromSaturn: positions.saturn, fromAscendant: positions.ascendant };

            Object.keys(referencePoints).forEach(refPoint => {
                const refSign = referencePoints[refPoint];
                const beneficHouses = rules[refPoint];
                beneficHouses.forEach(house => {
                    const targetSign = (refSign + house - 1) % 12;
                    bhinnashtakavarga[planet][targetSign]++;
                });
            });
        });

        const sarvashtakavarga = new Array(12).fill(0);
        for (let sign = 0; sign < 12; sign++) {
            planetList.forEach(planet => {
                sarvashtakavarga[sign] += bhinnashtakavarga[planet][sign];
            });
        }

        return { bhinnashtakavarga, sarvashtakavarga, total: sarvashtakavarga };
    }

    calculateShadbala(planets, ascendant, dateTime) {
        const shadbala = {};
        const planetList = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

        planetList.forEach(planet => {
            const pos = planets[planet];
            const signIndex = Math.floor(pos / 30);
            const degreeInSign = pos % 30;
            const house = this.getHouseNumber(pos, ascendant);

            // 1. STHANA BALA (Positional Strength) - Most complex
            let sthanaBala = 0;

            // Uchcha Bala (Exaltation/Debilitation strength)
            const constants = this.planetaryConstants[planet];
            if (constants) {
                let uchhaBala = 0;
                const exaltDeg = constants.exalt;
                const debilDeg = constants.debilit;

                // Calculate angular distance from exaltation point
                let distFromExalt = Math.abs(pos - exaltDeg);
                if (distFromExalt > 180) distFromExalt = 360 - distFromExalt;

                // Uchcha bala: Max 60 at exaltation, min 0 at debilitation
                uchhaBala = 60 * (1 - distFromExalt / 180);
                sthanaBala += uchhaBala;
            }

            // Saptavargaja Bala (Divisional chart strength) - simplified
            let saptavargaBala = 30; // Base value
            if (this.isExalted(planet, pos)) saptavargaBala += 20;
            if (constants && constants.own.includes(signIndex)) saptavargaBala += 15;
            sthanaBala += saptavargaBala;

            // Ojhayugma Bala (Odd/Even sign strength)
            let ojhaBala = 15; // Default
            const isMale = ['sun', 'mars', 'jupiter'].includes(planet);
            const isOddSign = signIndex % 2 === 0; // Aries=0 (odd), Taurus=1 (even)
            if ((isMale && isOddSign) || (!isMale && !isOddSign)) ojhaBala += 15;
            sthanaBala += ojhaBala;

            // Kendra Bala (Angular house strength)
            let kendraBala = 0;
            if ([1, 4, 7, 10].includes(house)) kendraBala = 60;
            else if ([2, 5, 8, 11].includes(house)) kendraBala = 30;
            else kendraBala = 15; // Cadent houses
            sthanaBala += kendraBala;

            // Drekkana Bala (Decanate strength)
            const drekkana = Math.floor(degreeInSign / 10);
            let drekkanaBala = 15;
            if ((isMale && drekkana === 0) || (!isMale && drekkana === 2)) drekkanaBala += 15;
            sthanaBala += drekkanaBala;

            // 2. DIG BALA (Directional Strength) - Max 60
            let digBala = 0;
            const directionMap = {
                sun: 10, moon: 4, mars: 10, mercury: 1,
                jupiter: 1, venus: 4, saturn: 7
            };

            const bestHouse = directionMap[planet];
            if (bestHouse) {
                // Calculate angular distance from best house
                let distFromBest = Math.abs(house - bestHouse);
                if (distFromBest > 6) distFromBest = 12 - distFromBest;

                // Max 60 at best house, reduces with distance
                digBala = 60 * (1 - distFromBest / 6);
            }

            // 3. KALA BALA (Temporal Strength)
            let kalaBala = 0;

            // Nathonnatha Bala (Day/Night strength)
            const hour = dateTime.getHours();
            const isDay = hour >= 6 && hour < 18;
            const isDiurnal = ['sun', 'jupiter', 'venus'].includes(planet);
            const isNocturnal = ['moon', 'mars', 'saturn'].includes(planet);

            if ((isDiurnal && isDay) || (isNocturnal && !isDay)) {
                kalaBala += 30;
            } else if (planet === 'mercury') {
                kalaBala += 30; // Mercury always gets strength
            }

            // Paksha Bala (Lunar fortnight strength)
            const moonPos = planets.moon;
            const sunPos = planets.sun;
            let elongation = moonPos - sunPos;
            if (elongation < 0) elongation += 360;

            const isWaxing = elongation < 180;
            if (planet === 'moon') {
                kalaBala += isWaxing ? 30 : 10; // Moon stronger when waxing
            }

            // Tribhaga Bala (Part of day strength)
            kalaBala += 20; // Simplified

            // Abda Bala (Yearly strength)
            kalaBala += 15; // Simplified

            // Masa Bala (Monthly strength)
            kalaBala += 15; // Simplified

            // Vara Bala (Weekday strength)
            const weekday = dateTime.getDay();
            const weekdayLords = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
            if (weekdayLords[weekday] === planet) kalaBala += 15;

            // 4. CHESHTA BALA (Motional Strength) - For planets only
            let cheshtaBala = 0;
            if (['mars', 'mercury', 'jupiter', 'venus', 'saturn'].includes(planet)) {
                const velocity = planets.velocities ? planets.velocities[planet] : 0;

                // Retrograde planets get strength
                if (velocity < 0) {
                    cheshtaBala = 60; // Maximum for retrograde
                } else if (velocity > 0) {
                    // Direct motion - strength varies with speed
                    const avgSpeed = { mars: 0.5, mercury: 1.5, jupiter: 0.1, venus: 1.2, saturn: 0.08 };
                    const ratio = Math.min(velocity / (avgSpeed[planet] || 0.5), 2);
                    cheshtaBala = 30 * ratio;
                }
            } else {
                // Sun and Moon don't have Cheshta Bala (always direct)
                cheshtaBala = 0;
            }

            // 5. NAISARGIKA BALA (Natural Strength) - Fixed values
            const naisargikaBala = {
                sun: 60,
                moon: 51.43,
                venus: 42.86,
                jupiter: 34.29,
                mercury: 25.71,
                mars: 17.14,
                saturn: 8.57
            }[planet] || 0;

            // 6. DRIK BALA (Aspectual Strength)
            let drikBala = 0;

            // Calculate aspects from other planets
            Object.entries(planets).forEach(([otherPlanet, otherPos]) => {
                if (otherPlanet === planet || otherPlanet === 'velocities') return;

                let aspectDiff = Math.abs(pos - otherPos);
                if (aspectDiff > 180) aspectDiff = 360 - aspectDiff;

                // Full aspect at 180°, others at 120°, 90°, 60°
                const isBenefic = ['jupiter', 'venus', 'mercury'].includes(otherPlanet);
                const isMalefic = ['mars', 'saturn', 'sun'].includes(otherPlanet);

                if (Math.abs(aspectDiff - 180) < 5) { // Opposition
                    drikBala += isBenefic ? 10 : -10;
                } else if (Math.abs(aspectDiff - 120) < 5) { // Trine
                    drikBala += isBenefic ? 15 : 0;
                } else if (Math.abs(aspectDiff - 90) < 5) { // Square
                    drikBala += isMalefic ? -10 : 0;
                } else if (Math.abs(aspectDiff - 60) < 5) { // Sextile
                    drikBala += isBenefic ? 10 : 0;
                } else if (aspectDiff < 10) { // Conjunction
                    drikBala += isBenefic ? 15 : -15;
                }
            });

            // Normalize Drik Bala to 0-60 range
            drikBala = Math.max(-30, Math.min(60, drikBala + 30));

            // TOTAL SHADBALA (in Rupas)
            // Convert virupas (1/60th of rupa) to rupas
            const totalVirupas = sthanaBala + digBala + kalaBala + cheshtaBala + naisargikaBala + drikBala;
            const totalRupas = totalVirupas / 60;

            // Determine strength category
            const requiredStrength = {
                sun: 5.0, moon: 6.0, mars: 5.0, mercury: 7.0,
                jupiter: 6.5, venus: 5.5, saturn: 5.0
            };

            const required = requiredStrength[planet] || 5.0;
            let strengthCategory = 'Low';
            if (totalRupas >= required * 1.5) strengthCategory = 'Very High';
            else if (totalRupas >= required * 1.2) strengthCategory = 'High';
            else if (totalRupas >= required) strengthCategory = 'Moderate';
            else if (totalRupas >= required * 0.7) strengthCategory = 'Below Average';

            shadbala[planet] = {
                sthanabala: Math.round(sthanaBala * 10) / 10,
                digbala: Math.round(digBala * 10) / 10,
                kalabala: Math.round(kalaBala * 10) / 10,
                cheshtabala: Math.round(cheshtaBala * 10) / 10,
                naisargikabala: Math.round(naisargikaBala * 10) / 10,
                drikbala: Math.round(drikBala * 10) / 10,
                total: Math.round(totalVirupas * 10) / 10,
                totalRupas: Math.round(totalRupas * 100) / 100,
                requiredStrength: required,
                strengthCategory: strengthCategory,
                isStrong: totalRupas >= required
            };
        });

        return shadbala;
    }

    calculateHouseResults(planets, ascendant) {
        const results = {};
        for (let i = 1; i <= 12; i++) {
            results[i] = {
                planets: Object.keys(planets).filter(p => this.getHouseNumber(planets[p], ascendant) === i)
            };
        }
        return results;
    }

    calculateVimshottariDasha(nakshatraData, birthDate) {
        try {
            const birthLord = nakshatraData.moonLord;
            const progress = nakshatraData.progress;
            const totalYears = this.dashaYears[birthLord];
            const yearsRemaining = totalYears - (progress / 100) * totalYears;

            const sequence = this.getDashaSequence(birthLord);
            const dashas = [];
            let currentStartDate = new Date(birthDate.getTime());

            sequence.forEach((planet, idx) => {
                const years = (idx === 0) ? yearsRemaining : this.dashaYears[planet];
                const startDate = new Date(currentStartDate.getTime());
                const endDate = new Date(startDate.getTime());
                endDate.setFullYear(endDate.getFullYear() + years);
                dashas.push({ planet, startDate, endDate, years });
                currentStartDate = endDate;
            });

            const now = new Date();
            const currentMahadasha = dashas.find(d => now >= d.startDate && now <= d.endDate) || dashas[0];
            const antardashas = this.calculateAntardashas(currentMahadasha);

            return { birthDashaPlanet: birthLord, currentMahadasha, antardashas, allDashas: dashas };
        } catch (e) { return { allDashas: [] }; }
    }

    getDashaSequence(startingPlanet) {
        const sequence = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
        const p = (startingPlanet || 'ketu').toLowerCase();
        const startIndex = sequence.indexOf(p);
        const safeStartIndex = startIndex === -1 ? 0 : startIndex;
        return [...sequence.slice(safeStartIndex), ...sequence.slice(0, safeStartIndex)];
    }

    calculateAntardashas(mahadasha) {
        if (!mahadasha || !mahadasha.planet) return { all: [], current: null, pratyantardashas: { all: [] } };
        const mPlanet = mahadasha.planet.toLowerCase();
        const sequence = this.getDashaSequence(mPlanet);
        const antardashas = [];
        let currentStartDate = new Date(mahadasha.startDate.getTime());

        sequence.forEach(planet => {
            const p = planet.toLowerCase();
            const antarYears = (this.dashaYears[mPlanet] * this.dashaYears[p]) / 120;
            const startDate = new Date(currentStartDate.getTime());
            const endDate = new Date(startDate.getTime());
            endDate.setFullYear(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + (antarYears * 365.25));
            antardashas.push({ planet: p, startDate, endDate, years: antarYears });
            currentStartDate = endDate;
        });

        const now = new Date();
        const current = antardashas.find(d => now >= d.startDate && now < d.endDate) || antardashas[0];
        const pratyantardashas = this.calculatePratyantarDashas(current, mPlanet);

        return { all: antardashas, current, pratyantardashas };
    }

    calculatePratyantarDashas(antardasha, mahadashaPlanet) {
        if (!antardasha || !antardasha.planet || !mahadashaPlanet) return { all: [], current: null };
        const mPlanet = mahadashaPlanet.toLowerCase();
        const aPlanet = antardasha.planet.toLowerCase();
        const sequence = this.getDashaSequence(aPlanet);
        const pds = [];
        let currentStartDate = new Date(antardasha.startDate.getTime());

        sequence.forEach(planet => {
            const p = planet.toLowerCase();
            const pdYears = (this.dashaYears[mPlanet] * this.dashaYears[aPlanet] * this.dashaYears[p]) / (120 * 120);
            const startDate = new Date(currentStartDate.getTime());
            const endDate = new Date(startDate.getTime());
            // Use time-based calculation for precision in micro-periods
            endDate.setTime(startDate.getTime() + (pdYears * 365.25 * 24 * 60 * 60 * 1000));
            pds.push({ planet: p, startDate, endDate, years: pdYears });
            currentStartDate = endDate;
        });

        const now = new Date();
        const current = pds.find(d => now >= d.startDate && now < d.endDate) || pds[0];
        return { all: pds, current };
    }

    getNakshatra(longitude) {
        const index = Math.floor(longitude / 13.333333);
        const nak = this.nakshatras[index % 27];
        return { ...nak, index: index % 27, progress: ((longitude % 13.333333) / 13.333333) * 100 };
    }

    getHouseNumber(planetLongitude, ascendantLongitude) {
        const pSign = Math.floor(planetLongitude / 30);
        const aSign = Math.floor(ascendantLongitude / 30);
        return (pSign - aSign + 12) % 12 + 1;
    }

    formatDate(date) {
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    calculateTransits() {
        // Calculate current planetary positions (Gochar)
        const now = new Date();
        const jd = this.calculateJulianDate(now);
        const t = (jd - 2451545.0) / 36525.0;
        const ayanamsa = this.calculatePreciseAyanamsa(t);
        return this.calculatePrecisePlanets(t, ayanamsa);
    }

    getNakshatraImpact(transitNakIdx, birthNakIdx) {
        // Navatara Relationship (9-fold relationship)
        const diff = (transitNakIdx - birthNakIdx + 27) % 9;
        const navatara = [
            { name: 'Janma', impact: 'neutral', description: 'Focus on self and new beginnings' },
            { name: 'Sampat', impact: 'positive', description: 'Wealth and prosperity' },
            { name: 'Vipat', impact: 'negative', description: 'Obstacles and challenges' },
            { name: 'Kshema', impact: 'positive', description: 'Comfort and protection' },
            { name: 'Pratyari', impact: 'negative', description: 'Opposition and competition' },
            { name: 'Sadhaka', impact: 'positive', description: 'Achievement and success' },
            { name: 'Vadha', impact: 'negative', description: 'Critical challenges and stress' },
            { name: 'Mitra', impact: 'positive', description: 'Help and cooperation' },
            { name: 'Ati-Mitra', impact: 'positive', description: 'Great friendship and ease' }
        ];
        return navatara[diff];
    }

    toRadians(degrees) { return degrees * Math.PI / 180; }
    normalize(deg) { let n = deg % 360; return n < 0 ? n + 360 : n; }

    // ── ULTRA-PRECISION DIMENSIONAL STABILITY METRICS ──
    calculateDimensionalMetrics(chart) {
        const zodiacLords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
        const getZodiacLord = (signIndex) => zodiacLords[signIndex];

        // Helper: Get base dignity score (0-10)
        const getDignityScore = (status) => {
            const scores = { 'Exalted': 10, 'Moolatrikona': 8.5, 'Own Sign': 7.5, 'Great Friend': 6.5, 'Friend': 5.5, 'Neutral': 4.5, 'Enemy': 3, 'Great Enemy': 1.5, 'Debilitated': 0 };
            return scores[status] !== undefined ? scores[status] : 5;
        };

        // Helper: Get Ashtakavarga score (0-10) based on 0-8 bindus
        const getBavScore = (planet, sign) => {
            if (!chart.ashtakavarga || !chart.ashtakavarga.bhavas) return 5;
            // Simplified: usually represented by total SAV or specific BAV. Using SAV / 4 for an approx 0-10 scale
            const ascSignIndex = Math.floor(chart.ascendant / 30);
            const houseIndex = (sign - ascSignIndex + 12) % 12;
            const sav = chart.ashtakavarga.bhavas[houseIndex];
            return Math.min(10, Math.max(0, (sav - 20) / 1.5)); // Average SAV is 28. Scale: 20=0, 28=5.3, 35=10
        };

        const ascSignIndex = Math.floor(chart.ascendant / 30);

        // 1. Career Resilience Quotient (10th House, Saturn, Sun, Jupiter, 10th Lord)
        const h10Sign = (ascSignIndex + 9) % 12;
        const lord10 = getZodiacLord(h10Sign);
        const satDetails = chart.planetaryDetails['saturn'] || { status: 'Neutral' };
        const sunDetails = chart.planetaryDetails['sun'] || { status: 'Neutral' };
        const lord10Details = chart.planetaryDetails[lord10] || { status: 'Neutral' };

        // Shadbala ratio (if calculated, usually 1.0 is average requirement)
        const satShadbala = chart.shadbala && chart.shadbala.saturn ? Math.min(1.5, chart.shadbala.saturn.totalRupas / chart.shadbala.saturn.requiredStrength) * 6.66 : 5;
        const lord10Shadbala = chart.shadbala && chart.shadbala[lord10] ? Math.min(1.5, chart.shadbala[lord10].totalRupas / chart.shadbala[lord10].requiredStrength) * 6.66 : 5;

        let careerScore = 0;
        careerScore += getDignityScore(lord10Details.status) * 3; // 10th lord dignity (max 30)
        careerScore += getDignityScore(satDetails.status) * 2;    // Saturn (Karma karaka) dignity (max 20)
        careerScore += lord10Shadbala * 2;                        // 10th lord strength (max ~20)
        careerScore += getBavScore('saturn', h10Sign) * 1.5;      // 10th house strength (max 15)
        careerScore += getDignityScore(sunDetails.status) * 1.5;  // Sun (Authority) (max 15)

        // 2. Relationship Harmony Index (7th House, Venus, Jupiter, Moon)
        const h7Sign = (ascSignIndex + 6) % 12;
        const lord7 = getZodiacLord(h7Sign);
        const venDetails = chart.planetaryDetails['venus'] || { status: 'Neutral' };
        const lord7Details = chart.planetaryDetails[lord7] || { status: 'Neutral', conjunct: [] };

        const venShadbala = chart.shadbala && chart.shadbala.venus ? Math.min(1.5, chart.shadbala.venus.totalRupas / chart.shadbala.venus.requiredStrength) * 6.66 : 5;
        const lord7Shadbala = chart.shadbala && chart.shadbala[lord7] ? Math.min(1.5, chart.shadbala[lord7].totalRupas / chart.shadbala[lord7].requiredStrength) * 6.66 : 5;

        let relScore = 0;
        relScore += getDignityScore(lord7Details.status) * 3;     // 7th lord dignity (max 30)
        relScore += getDignityScore(venDetails.status) * 2.5;     // Venus (Romance) dignity (max 25)
        relScore += lord7Shadbala * 2;                            // 7th lord strength (max ~20)
        relScore += getBavScore('venus', h7Sign) * 1.5;           // 7th house strength (max 15)

        // Afflictions penalty
        const hasRahuAffliction = lord7Details.conjunct && lord7Details.conjunct.includes('rahu');
        const hasMarsAffliction = lord7Details.conjunct && lord7Details.conjunct.includes('mars');
        if (hasRahuAffliction) relScore -= 10;
        if (hasMarsAffliction) relScore -= 8;
        // Boost for D9 (Navamsha)
        const navLord7 = chart.navamsha && chart.navamsha.planets && chart.navamsha.planets[lord7] ? chart.navamsha.planets[lord7].sign : -1;
        if (navLord7 !== -1 && (navLord7 === this.planetaryConstants[lord7].exalt || this.planetaryConstants[lord7].own.includes(navLord7))) relScore += 10;

        // 3. Emotional Steadiness Gauge (Moon, 4th House)
        const h4Sign = (ascSignIndex + 3) % 12;
        const lord4 = getZodiacLord(h4Sign);
        const moonDetails = chart.planetaryDetails['moon'] || { status: 'Neutral', conjunct: [] };
        const lord4Details = chart.planetaryDetails[lord4] || { status: 'Neutral' };

        const moonShadbala = chart.shadbala && chart.shadbala.moon ? Math.min(1.5, chart.shadbala.moon.totalRupas / chart.shadbala.moon.requiredStrength) * 6.66 : 5;

        let emoScore = 0;
        emoScore += getDignityScore(moonDetails.status) * 4;      // Moon dignity is paramount (max 40)
        emoScore += moonShadbala * 2.5;                           // Moon Shadbala (max ~25)
        emoScore += getDignityScore(lord4Details.status) * 2;     // 4th lord dignity (max 20)
        emoScore += getBavScore('moon', h4Sign) * 1.5;            // 4th house strength (max 15)

        // Lunar afflictions
        const moonConj = moonDetails.conjunct || [];
        if (moonConj.includes('rahu')) emoScore -= 15; // Eclipse
        if (moonConj.includes('ketu')) emoScore -= 15; // Eclipse
        if (moonConj.includes('saturn')) emoScore -= 12; // Vish Yoga / Sadness

        // Kemadruma Yoga penalty
        const hasKemadruma = chart.yogas && chart.yogas.find(y => y.name === 'Kemadruma Dosha');
        if (hasKemadruma) emoScore -= 15;

        // 4. Strategic Action Timing (Combining current Mahadasha lord with Ascendant lord)
        let timingScore = 50; // Base neutral
        const ascLord = getZodiacLord(ascSignIndex);
        if (chart.dashas && chart.dashas.currentMahadasha) {
            const mdLord = chart.dashas.currentMahadasha.planet;
            const mdDetails = chart.planetaryDetails[mdLord] || { status: 'Neutral' };

            // Is Mahadasha lord a friend to Ascendant lord?
            const ascP = this.planetaryConstants[ascLord] || { friends: [], enemies: [] };
            if (ascLord && ascLord === mdLord) timingScore += 25;
            else if (ascP.friends.includes(mdLord)) timingScore += 20;
            else if (ascP.enemies.includes(mdLord)) timingScore -= 15;

            // MD lord dignity
            timingScore += (getDignityScore(mdDetails.status) - 5) * 3;

            // Check transits (Simplified approximation based on Gochara from Moon)
            // A full transit engine would check exact degrees. We'll simulate current overall alignment from MD lord.
        }

        // Bound all scores between 0 and 100
        const bound = (val) => Math.min(100, Math.max(0, Math.round(val)));

        careerScore = bound(careerScore);
        relScore = bound(relScore);
        emoScore = bound(emoScore);
        timingScore = bound(timingScore);

        // Helper to get text interpretation
        const getLabel = (score, category) => {
            if (category === 'timing') {
                if (score >= 75) return "Act Boldly (Strong Alignment)";
                if (score >= 45) return "Proceed Steadily (Neutral)";
                return "Delay & Observe (Caution)";
            }
            if (score >= 80) return "Exceptionally Strong";
            if (score >= 60) return "Stable & Positive";
            if (score >= 40) return "Requires Navigation";
            return "Needs Active Transformation";
        };

        return {
            career: { score: careerScore, label: getLabel(careerScore, 'career'), desc: "Measures professional resilience based on 10th House, Saturn (Karma Karaka), and Sun (Authority) alignments." },
            relationships: { score: relScore, label: getLabel(relScore, 'rel'), desc: "Measures harmony potential using 7th House, Venus (Romance Karaka), and Navamsha (D9) dignity." },
            emotional: { score: emoScore, label: getLabel(emoScore, 'emo'), desc: "Measures mental steadiness based on Lunar dignity, Shadbala mass, and 4th House (Inner Peace) strength." },
            timing: { score: timingScore, label: getLabel(timingScore, 'timing'), desc: "Evaluates current action probability based on Ascendant relationship with the active Mahadasha Lord." }
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VedicAstrologyEngine;
}