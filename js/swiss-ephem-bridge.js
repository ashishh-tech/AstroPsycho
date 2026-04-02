/**
 * Swiss Ephemeris Bridge for AstroPsycho
 * ========================================
 * Replaces Meeus approximation calculations in astrology-engine-v8.js
 * with NASA JPL-grade accuracy from Swiss Ephemeris WASM.
 *
 * License: Swiss Ephemeris is free for open-source use (AGPL).
 * This bridge is async — waits for WASM to load before patching the engine.
 */

(function () {
    'use strict';

    // ── Config ──────────────────────────────────────────────────────────────
    const WASM_BASE = 'js/';      // path to swisseph.js/wasm/data files
    const DEBUG = false;          // set true to log precision comparisons

    // Planet IDs in Swiss Ephemeris
    const SE = {
        SUN: 0, MOON: 1, MERCURY: 2, VENUS: 3, MARS: 4,
        JUPITER: 5, SATURN: 6, URANUS: 7, NEPTUNE: 8,
        RAHU: 11,  // Mean North Node
        KETU: 11,  // Ketu = Rahu + 180
        SEFLG_SWIEPH: 2,
        SEFLG_SIDEREAL: 65536,
        SE_SIDM_LAHIRI: 1,
        SE_GREG_CAL: 1
    };

    // Map AstroPsycho planet keys → Swiss Ephemeris IDs
    const PLANET_MAP = {
        sun: SE.SUN, moon: SE.MOON, mercury: SE.MERCURY,
        venus: SE.VENUS, mars: SE.MARS, jupiter: SE.JUPITER,
        saturn: SE.SATURN
    };

    let sweInstance = null;
    let bridgeReady = false;

    // ── Load WASM ────────────────────────────────────────────────────────────
    async function loadSwissEph() {
        try {
            // Dynamically import the ES6 module
            const swissephModule = await import('/js/swisseph.js');
            const Swisseph = swissephModule.default;

            // Instantiation of Emscripten WASM module
            sweInstance = await Swisseph({ locateFile: f => WASM_BASE + f });
            if (sweInstance.initSwissEph) await sweInstance.initSwissEph();
            else await waitForReady(sweInstance);

            // Set Lahiri ayanamsa (same as AstroSage / standard Vedic)
            sweInstance.set_sid_mode(SE.SE_SIDM_LAHIRI, 0, 0);

            console.log('✅ Swiss Ephemeris WASM loaded — NASA JPL accuracy active');
            bridgeReady = true;
            patchEngine();
        } catch (e) {
            console.warn('⚠️ Swiss Ephemeris WASM failed to load, using Meeus fallback:', e.message);
        }
    }

    function waitForReady(swe) {
        return new Promise(resolve => {
            if (swe.ready) return resolve();
            swe.onRuntimeInitialized = resolve;
        });
    }

    // ── Core calculation function ─────────────────────────────────────────────
    /**
     * Calculate all planet positions using Swiss Ephemeris
     * @param {number} jd - Julian Day (UT)
     * @returns {object} - planet longitudes in sidereal degrees
     */
    function calcAllPlanets(jd) {
        const flags = SE.SEFLG_SWIEPH | SE.SEFLG_SIDEREAL;
        const result = {};

        for (const [key, id] of Object.entries(PLANET_MAP)) {
            try {
                const pos = sweInstance.calc_ut(jd, id, flags);
                result[key] = ((pos[0] % 360) + 360) % 360;
            } catch (e) {
                // fallback silently
            }
        }

        // Rahu (Mean Node) — Swiss Ephemeris ID 11
        try {
            const rahuPos = sweInstance.calc_ut(jd, SE.RAHU, SE.SEFLG_SWIEPH | SE.SEFLG_SIDEREAL);
            result.rahu = ((rahuPos[0] % 360) + 360) % 360;
            result.ketu = ((result.rahu + 180) % 360);
        } catch (e) {}

        return result;
    }

    /**
     * Get Lahiri ayanamsa for given Julian Day
     */
    function getAyanamsa(jd) {
        try {
            return sweInstance.get_ayanamsa(jd);
        } catch (e) {
            // Fallback to Lahiri approximation
            const T = (jd - 2451545.0) / 36525.0;
            return 23.85 + (T * 50.2882 / 3600);
        }
    }

    /**
     * Calculate ascendant using Swiss Ephemeris
     */
    function calcAscendant(jd, lat, lon) {
        try {
            const cusps = sweInstance.houses(jd, lat, lon, 'W'); // Whole Sign
            sweInstance.set_sid_mode(SE.SE_SIDM_LAHIRI, 0, 0);
            const ayanamsa = sweInstance.get_ayanamsa(jd);
            // Ascendant is tropical - ayanamsa
            let asc = cusps.ascendant - ayanamsa;
            return ((asc % 360) + 360) % 360;
        } catch (e) {
            return null; // let engine use its own calculation
        }
    }

    // ── Patch the VedicAstrologyEngine ───────────────────────────────────────
    function patchEngine() {
        if (typeof VedicAstrologyEngine === 'undefined') {
            // Engine not loaded yet, wait
            setTimeout(patchEngine, 200);
            return;
        }

        const proto = VedicAstrologyEngine.prototype;
        const origCalcPlanets = proto.calculatePrecisePlanets;
        const origCalcAyanamsa = proto.calculatePreciseAyanamsa;

        // Override calculatePrecisePlanets
        proto.calculatePrecisePlanets = function (T, ayanamsa) {
            // T is Julian centuries from J2000 — convert to JD
            const jd = T * 36525.0 + 2451545.0;

            const swePlanets = calcAllPlanets(jd);
            if (Object.keys(swePlanets).length < 7) {
                // Something failed — fall back to original
                return origCalcPlanets.call(this, T, ayanamsa);
            }

            if (DEBUG) {
                const meeusResult = origCalcPlanets.call(this, T, ayanamsa);
                const diff = {};
                for (const [k, v] of Object.entries(swePlanets)) {
                    if (meeusResult[k] !== undefined) {
                        diff[k] = (v - meeusResult[k]).toFixed(4) + '°';
                    }
                }
                console.table({ 'Meeus vs Swiss': diff });
            }

            // Preserve velocities from Meeus (not critical for chart rendering)
            const meeusResult = origCalcPlanets.call(this, T, ayanamsa);
            swePlanets.velocities = meeusResult.velocities;

            return swePlanets;
        };

        // Override ayanamsa with Swiss Ephemeris value (more precise)
        proto.calculatePreciseAyanamsa = function (T) {
            const jd = T * 36525.0 + 2451545.0;
            return getAyanamsa(jd);
        };

        console.log('✅ VedicAstrologyEngine patched with Swiss Ephemeris accuracy');
        window._swissEphReady = true;

        // Trigger recalculation if engine already ran
        if (window._careerEngine?.birthChart) {
            console.log('🔄 Recalculating birth chart with Swiss Ephemeris...');
            window._careerEngine.birthChart = window._careerEngine.astrologyEngine.calculateBirthChart(
                window._careerEngine.userData
            );
            window._careerEngine.renderAll();
        }
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSwissEph);
    } else {
        loadSwissEph();
    }

    // Expose for debugging
    window._sweDebug = { calcAllPlanets, getAyanamsa };

})();
