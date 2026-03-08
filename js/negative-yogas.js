// Negative Yogas & Doshas Page Logic
// Full dosha analysis: Kal Sarp, Manglik, Pitra Dosh, Kemadruma (corrected), Guru Chandal, Shakata, Grahan, Amavasya

class NegativeYogasController {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();
        this.userData = null;
        this.birthChart = null;
        this.init();
    }

    async init() {
        try {
            this.userData = this.loadUserData();
            if (!this.userData || !this.userData.birthDetails) {
                this.showError('No birth data found. Please complete the assessment first.');
                return;
            }
            this.birthChart = this.astrologyEngine.calculateBirthChart(this.userData.birthDetails);
            this.renderNegativeYogas();
        } catch (error) {
            console.error('Negative Yogas Error:', error);
            this.showError('Error loading dosha analysis. Please try again.');
        }
    }

    loadUserData() {
        const data = localStorage.getItem('astropsycho_assessment');
        return data ? JSON.parse(data) : null;
    }

    showError(message) {
        const content = document.getElementById('negativeYogasContent');
        if (content) {
            content.innerHTML = `
                <div class="info-box" style="border-color: var(--accent-pink); margin-top: 2rem;">
                    <h3 style="color: var(--accent-pink);">⚠️ Quick Dosha Analysis</h3>
                    <p style="margin-bottom: 1.5rem;">Enter your birth details to identify challenges and receive remedies.</p>
                    ${this.createBirthForm('quickDoshaForm')}
                </div>
            `;
            document.getElementById('quickDoshaForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.processQuickBirthDetails();
            });
        }
    }

    createBirthForm(formId) {
        return `
            <form id="${formId}" style="max-width: 600px;">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="quickName" required placeholder="Your full name">
                </div>
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" id="quickDate" required>
                </div>
                <div class="form-group">
                    <label>Time of Birth</label>
                    <input type="time" id="quickTime" required>
                </div>
                <div class="form-group">
                    <label>Place of Birth</label>
                    <input type="text" id="quickPlace" required placeholder="e.g. Kolkata, Mumbai, Delhi"
                        oninput="window._negYogaCtrl && window._negYogaCtrl.onQuickCityInput(this.value)">
                    <div id="quickCityStatus" style="font-size:0.78rem;margin-top:4px;min-height:18px;"></div>
                </div>
                <div class="button-group" style="margin-top: 1.5rem;">
                    <button type="submit" class="btn btn-primary">Analyze Doshas ⚠️</button>
                    <a href="index.html" class="btn btn-secondary">← Back to Home</a>
                </div>
            </form>
        `;
    }

    getCityCoords(cityName) {
        const db = {
            'kolkata': [22.5726, 88.3639], 'calcutta': [22.5726, 88.3639],
            'mumbai': [19.0760, 72.8777], 'bombay': [19.0760, 72.8777],
            'delhi': [28.6139, 77.2090], 'new delhi': [28.6139, 77.2090],
            'bangalore': [12.9716, 77.5946], 'bengaluru': [12.9716, 77.5946],
            'chennai': [13.0827, 80.2707], 'madras': [13.0827, 80.2707],
            'hyderabad': [17.3850, 78.4867], 'pune': [18.5204, 73.8567],
            'ahmedabad': [23.0225, 72.5714], 'jaipur': [26.9124, 75.7873],
            'lucknow': [26.8467, 80.9462], 'kanpur': [26.4499, 80.3319],
            'nagpur': [21.1458, 79.0882], 'indore': [22.7196, 75.8577],
            'bhopal': [23.2599, 77.4126], 'patna': [25.5941, 85.1376],
            'surat': [21.1702, 72.8311], 'vadodara': [22.3072, 73.1812],
            'agra': [27.1767, 78.0081], 'varanasi': [25.3176, 82.9739],
            'benaras': [25.3176, 82.9739], 'kashi': [25.3176, 82.9739],
            'allahabad': [25.4358, 81.8463], 'prayagraj': [25.4358, 81.8463],
            'meerut': [28.9845, 77.7064], 'visakhapatnam': [17.6868, 83.2185],
            'vizag': [17.6868, 83.2185], 'coimbatore': [11.0168, 76.9558],
            'madurai': [9.9252, 78.1198], 'kochi': [9.9312, 76.2673],
            'cochin': [9.9312, 76.2673], 'trivandrum': [8.5241, 76.9366],
            'thiruvananthapuram': [8.5241, 76.9366], 'kozhikode': [11.2588, 75.7804],
            'chandigarh': [30.7333, 76.7794], 'amritsar': [31.6340, 74.8723],
            'ludhiana': [30.9010, 75.8573], 'guwahati': [26.1445, 91.7362],
            'bhubaneswar': [20.2961, 85.8245], 'raipur': [21.2514, 81.6296],
            'ranchi': [23.3441, 85.3096], 'dehradun': [30.3165, 78.0322],
            'shimla': [31.1048, 77.1734], 'srinagar': [34.0837, 74.7973],
            'jammu': [32.7266, 74.8570], 'goa': [15.2993, 74.1240],
            'panaji': [15.4909, 73.8278], 'mangalore': [12.9141, 74.8560],
            'mysore': [12.2958, 76.6394], 'vijayawada': [16.5062, 80.6480],
            'tirupati': [13.6288, 79.4192], 'nashik': [20.0059, 73.7902],
            'jodhpur': [26.2389, 73.0243], 'udaipur': [24.5854, 73.7125],
            'noida': [28.5355, 77.3910], 'gurgaon': [28.4595, 77.0266],
            'gurugram': [28.4595, 77.0266], 'faridabad': [28.4089, 77.3178],
            'thane': [19.2183, 72.9781],
        };
        const key = cityName.trim().toLowerCase();
        if (db[key]) return db[key];
        for (const c in db) { if (c.startsWith(key) || key.startsWith(c)) return db[c]; }
        return null;
    }

    onQuickCityInput(value) {
        const el = document.getElementById('quickCityStatus');
        if (!el) return;
        const coords = this.getCityCoords(value);
        if (coords) {
            el.innerHTML = `<span style="color:#4ade80;">✓ ${value} (${coords[0].toFixed(2)}°N, ${coords[1].toFixed(2)}°E)</span>`;
        } else if (value.length > 2) {
            el.innerHTML = '<span style="color:#fbbf24;">City not in offline database — will use Delhi coords as fallback</span>';
        } else { el.innerHTML = ''; }
    }

    processQuickBirthDetails() {
        const placeVal = document.getElementById('quickPlace').value;
        const coords = this.getCityCoords(placeVal);
        const lat = coords ? coords[0] : 28.6139;
        const lon = coords ? coords[1] : 77.2090;
        const birthDetails = {
            fullName: document.getElementById('quickName').value,
            birthDate: document.getElementById('quickDate').value,
            birthTime: document.getElementById('quickTime').value,
            birthPlace: placeVal,
            latitude: lat,
            longitude: lon,
            timezone: 5.5,
            gender: 'not-specified'
        };
        this.userData = { birthDetails, responses: { skipped: true }, timestamp: new Date().toISOString() };
        localStorage.setItem('astropsycho_assessment', JSON.stringify(this.userData));
        this.birthChart = this.astrologyEngine.calculateBirthChart(birthDetails);
        this.renderNegativeYogas();
    }

    renderNegativeYogas() {
        this.renderUserGreeting();
        const doshas = this.detectAllDoshas();
        this.renderSummaryTable(doshas);
        this.renderDoshaCards(doshas);
        this.renderRemediesGuidance(doshas);
    }

    renderUserGreeting() {
        const container = document.getElementById('userGreeting');
        if (!container) return;
        const name = this.userData?.birthDetails?.fullName || 'Valued User';
        container.innerHTML = `
            <h2 style="color: var(--star-gold); font-family: var(--font-display); font-size: 1.8rem;">
                ${name}'s Dosha Analysis
            </h2>
            <p style="color: var(--moon-silver); margin-top:0.5rem;">Classical Vedic analysis — 6 major doshas checked</p>
        `;
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    _signOf(deg) { return Math.floor(((deg % 360) + 360) % 360 / 30); }

    _houseOf(planetDeg, ascDeg) {
        return this.astrologyEngine.getHouseNumber(planetDeg, ascDeg);
    }

    _signNameOf(deg) {
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        return signs[this._signOf(deg)];
    }

    _orb(a, b) {
        let diff = Math.abs(((a % 360) + 360) % 360 - ((b % 360) + 360) % 360);
        if (diff > 180) diff = 360 - diff;
        return diff;
    }

    _isInArc(planetDeg, fromDeg, toDeg) {
        // Is planetDeg in the arc going clockwise from fromDeg to toDeg?
        const p = ((planetDeg % 360) + 360) % 360;
        const f = ((fromDeg % 360) + 360) % 360;
        const t = ((toDeg % 360) + 360) % 360;
        if (f <= t) return p >= f && p <= t;
        return p >= f || p <= t; // wraps around 0
    }

    // ─────────────────────────────────────────────────────────────
    // 1. KAL SARP DOSHA
    // ─────────────────────────────────────────────────────────────
    detectKalSarpDosha(planets, ascendant) {
        const truePlanets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
        const rahuDeg = ((planets.rahu % 360) + 360) % 360;
        const ketuDeg = ((planets.ketu % 360) + 360) % 360;

        // Check if ALL true planets are in the Rahu→Ketu arc (clockwise)
        const allInRahuArc = truePlanets.every(p => this._isInArc(planets[p], rahuDeg, ketuDeg));
        // Check the reverse arc Ketu→Rahu (Kaal Amrit variant)
        const allInKetuArc = truePlanets.every(p => this._isInArc(planets[p], ketuDeg, rahuDeg));

        const present = allInRahuArc || allInKetuArc;
        if (!present) return { present: false };

        const rahuHouse = this._houseOf(planets.rahu, ascendant);
        const ketuHouse = this._houseOf(planets.ketu, ascendant);
        const kalSarpNames = [
            'Anant', 'Kulik', 'Vasuki', 'Shankhpal', 'Padma', 'Mahapadma',
            'Takshak', 'Karkotak', 'Shankhnaad', 'Patak', 'Vishakata', 'Sheshnag'
        ];
        const typeName = kalSarpNames[(rahuHouse - 1) % 12];
        const variant = allInRahuArc ? 'Kaal Sarp' : 'Kaal Amrit';

        return {
            present: true,
            name: `${typeName} Kaal Sarp Dosha`,
            variant,
            rahuHouse,
            ketuHouse,
            rahuSign: this._signNameOf(planets.rahu),
            severity: 'high',
            condition: `All 7 planets hemmed between Rahu (${this._signNameOf(planets.rahu)}, H${rahuHouse}) and Ketu (${this._signNameOf(planets.ketu)}, H${ketuHouse}). ${variant} variant.`,
            effect: `The ${typeName} Kaal Sarp Dosha creates a powerful karmic constraint. All planetary energies are trapped within Rahu–Ketu axis, leading to periodic setbacks, struggles with fate, ancestral karma, delays in major life goals, and intense life experiences. Despite hardships, strong spiritual inclination and eventual success after persistent effort are also indicated. The ${variant} variant ${allInRahuArc ? 'brings worldly ambition and desire-driven struggle' : 'indicates inward spiritual focus and detachment from materialism'}.`,
            remedies: [
                'Perform Kaal Sarp Dosha Nivaran Puja at Trimbakeshwar or any Shiva temple',
                'Worship Nag Devata — offer milk to live snake or snake idol on Nag Panchami',
                'Recite Maha Mrityunjaya Mantra 108 times daily',
                'Wear a silver ring with snake design on the right hand ring finger on Saturday',
                'Feed birds (specially black crows) on Saturdays',
                'Chant "Om Namah Shivaya" 1008 times on Ekadashi',
                'Donate black sesame seeds, mustard oil, and iron utensils on Saturdays'
            ]
        };
    }

    // ─────────────────────────────────────────────────────────────
    // 2. MANGLIK DOSHA (KUJA DOSHA)
    // ─────────────────────────────────────────────────────────────
    detectManglikDosha(planets, ascendant) {
        const marsHouseLagna = this._houseOf(planets.mars, ascendant);
        const marsHouseMoon = this._houseOf(planets.mars, planets.moon);
        const marsSign = this._signOf(planets.mars);
        const lagnaSign = this._signOf(ascendant);

        const manglikHouses = [1, 4, 7, 8, 12];
        const presentFromLagna = manglikHouses.includes(marsHouseLagna);
        const presentFromMoon = manglikHouses.includes(marsHouseMoon);

        if (!presentFromLagna && !presentFromMoon) return { present: false };

        // Check cancellations
        let cancellationReason = null;

        // Mars in own sign (Aries=0, Scorpio=7) or exalted (Capricorn=9)
        if ([0, 7, 9].includes(marsSign)) {
            const signNames = { 0: 'Aries', 7: 'Scorpio', 9: 'Capricorn' };
            cancellationReason = `Mars is in ${signNames[marsSign]} (${marsSign === 9 ? 'exalted' : 'own sign'}) — dosha significantly mitigated`;
        }

        // Lagna is Cancer (3) or Leo (4) — Mars is Yogakaraka
        if (!cancellationReason && [3, 4].includes(lagnaSign)) {
            cancellationReason = `${lagnaSign === 3 ? 'Cancer' : 'Leo'} ascendant — Mars becomes Yogakaraka (benefic lord), Manglik Dosha cancelled`;
        }

        // Mars conjunct Jupiter (within 10°)
        const marsJupOrb = this._orb(planets.mars, planets.jupiter);
        if (!cancellationReason && marsJupOrb < 10) {
            cancellationReason = `Mars is conjunct Jupiter (orb: ${marsJupOrb.toFixed(1)}°) — Jupiter's benefic influence cancels the dosha`;
        }

        // Jupiter aspects Mars (Jupiter's 7th aspect = Jupiter + 180°)
        const jupAspectPoint = (planets.jupiter + 180) % 360;
        const jupAspectOrb = this._orb(planets.mars, jupAspectPoint);
        if (!cancellationReason && jupAspectOrb < 15) {
            cancellationReason = `Mars receives Jupiter's 7th aspect (orb: ${jupAspectOrb.toFixed(1)}°) — dosha strongly mitigated`;
        }

        const severity = cancellationReason ? 'cancelled' : (presentFromLagna && presentFromMoon ? 'very_high' : 'high');
        const placements = [];
        if (presentFromLagna) placements.push(`H${marsHouseLagna} from Lagna`);
        if (presentFromMoon) placements.push(`H${marsHouseMoon} from Moon`);

        return {
            present: true,
            cancelled: !!cancellationReason,
            cancellationReason,
            name: 'Manglik Dosha (Kuja Dosha)',
            marsHouseLagna,
            marsHouseMoon,
            marsSign: this._signNameOf(planets.mars),
            severity,
            condition: `Mars is in ${placements.join(' and ')} in ${this._signNameOf(planets.mars)} (${marsSign === 9 ? '♂ Exalted' : marsSign === 4 ? '♂ Debilitated' : ''})`,
            effect: cancellationReason
                ? `Manglik Dosha is present in your chart but is effectively cancelled/mitigated. ${cancellationReason}. The martial energy manifests as drive and discipline in relationships rather than conflict.`
                : `Manglik Dosha creates intense Mars energy in the marital axis. This can manifest as aggression, impatience, and friction in close relationships and marriage. The native may have a dominant, independent nature that requires a strong partner. With proper remedies and marrying a fellow Manglik, effects are significantly reduced.`,
            remedies: cancellationReason ? [
                'Perform regular Mars rituals on Tuesdays as a general strengthener',
                'Offer red flowers to Lord Hanuman on Tuesdays',
                'Recite Hanuman Chalisa daily'
            ] : [
                'Perform Manglik Dosha Shanti Puja before marriage',
                'Marry a fellow Manglik (Dosha Samyam — both having same dosha cancels it)',
                'Offer red lentils (masoor dal) and red cloth to lord Hanuman on Tuesdays',
                'Recite Mangal Stotra or Hanuman Chalisa 11 times every Tuesday',
                'Fast on Tuesdays and eat only once at night',
                'Wear coral (Moonga) gemstone in gold/copper ring on ring finger of right hand after consulting astrologer',
                'Perform Kumbh Vivah (symbolic marriage to a peepal tree or idol) if severely afflicted'
            ]
        };
    }

    // ─────────────────────────────────────────────────────────────
    // 3. PITRA DOSH
    // ─────────────────────────────────────────────────────────────
    detectPitraDosh(planets, ascendant) {
        const ninthHouseCondition = (planet) => this._houseOf(planet, ascendant) === 9;
        const orb15 = (a, b) => this._orb(a, b) < 15;
        const orb10 = (a, b) => this._orb(a, b) < 10;

        const conditions = [];
        let severity = null;

        // Primary: Sun in 9th house + afflicted by Rahu, Ketu, or Saturn
        if (ninthHouseCondition(planets.sun)) {
            if (orb15(planets.sun, planets.rahu)) {
                conditions.push('Sun conjunct Rahu in 9th house (most severe — Pitru Grahan Yoga)');
                severity = 'very_high';
            }
            if (orb15(planets.sun, planets.ketu)) {
                conditions.push('Sun conjunct Ketu in 9th house (disconnection from ancestral blessings)');
                severity = severity || 'high';
            }
            if (orb15(planets.sun, planets.saturn)) {
                conditions.push('Sun conjunct Saturn in 9th house (karmic debt from father)');
                severity = severity || 'high';
            }
            if (!severity) {
                conditions.push('Sun in 9th house (moderate Pitru karma indicator)');
                severity = 'moderate';
            }
        }

        // Secondary: Rahu or Ketu in 9th house without Sun
        if (ninthHouseCondition(planets.rahu) && !conditions.some(c => c.includes('Sun conjunct Rahu in 9th'))) {
            conditions.push('Rahu in 9th house (ancestral debt, disrupted dharma)');
            if (!severity) severity = 'moderate';
        }
        if (ninthHouseCondition(planets.ketu) && !conditions.some(c => c.includes('Sun conjunct Ketu in 9th'))) {
            conditions.push('Ketu in 9th house (detachment from ancestral lineage)');
            if (!severity) severity = 'moderate';
        }

        // Tertiary: Sun–Rahu conjunction anywhere (Solar eclipse yoga)
        if (!ninthHouseCondition(planets.sun) && orb10(planets.sun, planets.rahu)) {
            const house = this._houseOf(planets.sun, ascendant);
            conditions.push(`Sun conjunct Rahu in H${house} ${this._signNameOf(planets.sun)} (Grahan Yoga — mild Pitra Dosh)`);
            if (!severity) severity = 'moderate';
        }

        // Also check: Saturn in 9th
        if (ninthHouseCondition(planets.saturn) && !conditions.some(c => c.includes('Saturn'))) {
            conditions.push('Saturn in 9th house (ancestral karmic delays, father relationship karma)');
            if (!severity) severity = 'moderate';
        }

        if (!conditions.length) return { present: false };

        return {
            present: true,
            name: 'Pitra Dosh (Ancestral Karma)',
            severity,
            condition: conditions.join('; '),
            effect: `Pitra Dosh indicates unresolved karma from the paternal lineage — ancestors who may have had unfulfilled duties, broken promises, or neglected post-death rituals. Manifestations include obstacles in career and life progress, strained relationship with father or father-figures, lack of ancestral blessings, delays in childbirth, and recurring family-level patterns. It is NOT a curse but an invitation to resolve ancestral debts through specific rites (Shraddha, Tarpan, Pind Daan).`,
            remedies: [
                'Perform Shraddha and Tarpan rituals for ancestors during Pitru Paksha (annual 16-day period)',
                'Offer Pind Daan at holy sites: Gaya, Trimbakeshwar, Haridwar, or Prayagraj',
                'Worship the Peepal tree — water it daily and light a diya under it on Saturdays',
                'Recite Pitra Mantra: "Om Pitrubhyah Namah" 108 times daily',
                'Offer food (especially rice and sesame) to Brahmins and needy on Amavasya (new moon)',
                'Donate to orphanages or help elderly people without families',
                'Chant Gayatri Mantra 108 times at sunrise facing East',
                'Recite Vishnu Sahasranama or perform Narayan Bali puja for severe cases'
            ]
        };
    }

    // ─────────────────────────────────────────────────────────────
    // 4. KEMADRUMA DOSHA (CORRECTED)
    // ─────────────────────────────────────────────────────────────
    detectKemadruma(planets, ascendant) {
        const moonSign = this._signOf(planets.moon);
        const prevSign = (moonSign + 11) % 12;
        const nextSign = (moonSign + 1) % 12;
        const truePlanets = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

        // Step 1: Is any true planet in 2nd or 12th sign from Moon?
        const hasAdjacentPlanet = truePlanets.some(p => {
            const s = this._signOf(planets[p]);
            return s === prevSign || s === nextSign;
        });

        if (hasAdjacentPlanet) return { present: false }; // Base condition not met

        // Step 2: Check cancellations
        const moonHouse = this._houseOf(planets.moon, ascendant);
        const kendrHouses = [1, 4, 7, 10];

        // Moon in Kendra from Lagna
        if (kendrHouses.includes(moonHouse)) {
            return {
                present: true,
                cancelled: true,
                name: 'Kemadruma Yoga',
                cancellationReason: `Moon is in H${moonHouse} (a Kendra house) from the Ascendant — dosha cancelled`,
                severity: 'cancelled'
            };
        }

        // Any true planet in Kendra from Moon?
        const hasPlanetInKendraFromMoon = truePlanets.some(p => {
            const h = this._houseOf(planets[p], planets.moon);
            return kendrHouses.includes(h);
        });
        if (hasPlanetInKendraFromMoon) {
            return {
                present: true,
                cancelled: true,
                name: 'Kemadruma Yoga',
                cancellationReason: 'A benefic/true planet occupies a Kendra (1/4/7/10) from Moon — dosha cancelled',
                severity: 'cancelled'
            };
        }

        // Moon conjunct a benefic (Jupiter, Venus, Mercury) within 10°?
        const conjBenefic = ['jupiter', 'venus', 'mercury'].some(p => this._orb(planets.moon, planets[p]) < 10);
        if (conjBenefic) {
            return {
                present: true,
                cancelled: true,
                name: 'Kemadruma Yoga',
                cancellationReason: 'Moon is conjunct a benefic planet — dosha cancelled by benefic influence',
                severity: 'cancelled'
            };
        }

        return {
            present: true,
            cancelled: false,
            name: 'Kemadruma Yoga',
            moonSign: this._signNameOf(planets.moon),
            moonHouse,
            severity: 'high',
            condition: `No true planet (Mars/Mercury/Jupiter/Venus/Saturn) in the 2nd or 12th zodiac sign from Moon (${this._signNameOf(planets.moon)}, H${moonHouse}). No cancellation factors found.`,
            effect: `Kemadruma Yoga makes the Moon feel isolated — no supporting planet flanks it on either side. This leads to emotional instability, lack of support in life, difficulty in sustaining relationships, mental restlessness, and struggles in accumulating wealth. The native often feels alone even in crowds. Career can have sudden ups and downs. Note: Moon with Mars does NOT create Kemadruma — Mars adjacent to Moon actually cancels it.`,
            remedies: [
                'Worship Chandra (Moon) — offer white flowers and raw milk at a Shiva temple on Mondays',
                'Fast on Mondays and eat only white foods (rice, milk, curd)',
                'Wear pearl (Moti) in a silver ring on the ring finger of right hand on a Monday',
                'Recite Chandra Mantra: "Om Som Somaya Namah" 108 times daily',
                'Donate white items (cloth, rice, sugar, milk) on Mondays',
                'Keep a silver bowl of water near the head while sleeping',
                'Maintain harmonious relationships — avoid emotional isolation'
            ]
        };
    }

    // ─────────────────────────────────────────────────────────────
    // 5. GURU CHANDAL YOGA
    // ─────────────────────────────────────────────────────────────
    detectGuruChandal(planets) {
        const jupRahuOrb = this._orb(planets.jupiter, planets.rahu);
        const jupKetuOrb = this._orb(planets.jupiter, planets.ketu);
        const minOrb = Math.min(jupRahuOrb, jupKetuOrb);

        if (minOrb >= 12) return { present: false };

        const node = jupRahuOrb < jupKetuOrb ? 'Rahu' : 'Ketu';
        const actualOrb = Math.min(jupRahuOrb, jupKetuOrb);

        return {
            present: true,
            name: 'Guru Chandal Yoga',
            severity: actualOrb < 5 ? 'very_high' : 'high',
            condition: `Jupiter conjunct ${node} within ${actualOrb.toFixed(1)}° in ${this._signNameOf(planets.jupiter)}`,
            effect: `Guru Chandal Yoga forms when Jupiter (the planet of wisdom, dharma, ethics) merges with ${node} (shadow planet of worldly desires/past karma). This creates a paradox of intelligence — the native is extremely clever and philosophically inclined but may use wisdom for selfish or unconventional ends. Challenges include confusion about right and wrong, clash between traditional wisdom and rebellious thinking, potential for being misled by false gurus, or becoming one. However, with awareness, this can produce revolutionary thinkers, spiritual rebels, and visionaries who challenge established structures.`,
            remedies: [
                `Worship Lord Vishnu on Thursdays — offer yellow flowers, turmeric, and chana dal`,
                'Recite Guru Mantra: "Om Brim Brihaspataye Namah" 108 times daily',
                'Visit a Vishnu/Brihaspati temple every Thursday and light a diya with ghee',
                'Donate yellow items (turmeric, yellow cloth, gold) to Brahmins on Thursdays',
                'Avoid lying, cheating, and any form of guru-disrespect',
                'Serve your legitimate guru/teacher with devotion',
                'Wear a yellow sapphire (Pukhraj) in gold ring on index finger after consulting astrologer',
                node === 'Rahu' ? 'Offer coconut and camphor to Lord Ganesha on Wednesdays' :
                    'Offer sesame seeds and brown/black items at Ketu shrine'
            ]
        };
    }

    // ─────────────────────────────────────────────────────────────
    // 6. SHAKATA YOGA
    // ─────────────────────────────────────────────────────────────
    detectShakata(planets, ascendant) {
        const jupHouse = this._houseOf(planets.jupiter, ascendant);
        const moonHouse = this._houseOf(planets.moon, ascendant);
        const dist = (jupHouse - moonHouse + 12) % 12;

        if (![6, 8, 12].includes(dist)) return { present: false };

        return {
            present: true,
            name: 'Shakata Yoga',
            severity: 'moderate',
            condition: `Moon is in H${moonHouse}, Jupiter is in H${jupHouse} — Jupiter falls in the ${dist === 6 ? '6th' : dist === 8 ? '8th' : '12th'} from Moon`,
            effect: `Shakata Yoga (the "wheel" yoga) occurs when Jupiter and Moon are in a 6/8 or 12th relationship. Like a wheel that alternates between high and low positions, Shakata gives a life of oscillating fortunes — periods of great success followed by reversals. Emotional ups and downs are pronounced. The beneficial guidance of Jupiter does not flow well to the emotional Moon. Trust in mentors and elders may be tested.`,
            remedies: [
                'Pay equal reverence to both Moon (Mondays) and Jupiter (Thursdays) — don\'t neglect either',
                'Perform daily meditation and journaling to stabilize emotional fluctuations',
                'Recite both Chandra Mantra and Guru Mantra in the same sitting',
                'Offer white flowers to Moon deity and yellow flowers to Jupiter deity on respective days',
                'Avoid major financial decisions during emotionally unstable phases',
                'Build a strong support network — this yoga can cause isolation; consciously counter it'
            ]
        };
    }

    // ─────────────────────────────────────────────────────────────
    // 7. AMAVASYA DOSHA
    // ─────────────────────────────────────────────────────────────
    detectAmavasya(planets) {
        const diff = Math.abs(((planets.sun - planets.moon) % 360 + 360) % 360);
        const angDiff = Math.min(diff, 360 - diff);
        if (angDiff >= 12) return { present: false };

        return {
            present: true,
            name: 'Amavasya Dosha (New Moon Birth)',
            severity: 'moderate',
            condition: `Sun and Moon are within ${angDiff.toFixed(1)}° of each other — New Moon (Amavasya) birth`,
            effect: `Amavasya Dosha occurs when a person is born on or very close to a New Moon, when the Moon is closest to the Sun and loses its light. This weakens the Moon — the planet of mind, emotions, and mother. Such natives may struggle with emotional introspection (the Moon's reflective quality is subsumed by the Sun), may have a complex relationship with their mother, and could face mental restlessness. On the positive side, the merging of solar (ego/soul) and lunar (mind/emotion) energies can produce exceptional focus and single-minded determination.`,
            remedies: [
                'Worship Shiva and Parvati together on Amavasya (new moon day) each month',
                'Donate raw rice, milk, and white cloth on Amavasya',
                'Observe fast on Amavasya and break it only after sunset with satvic food',
                'Offer Tarpan (water libations) to ancestors on every Amavasya',
                'Moonlight meditation — sit in moonlight on Purnima (full moon) nights',
                'Strengthen the Moon: wear pearl, worship Chandra, drink water from a silver vessel'
            ]
        };
    }

    // ─────────────────────────────────────────────────────────────
    // DETECT ALL DOSHAS
    // ─────────────────────────────────────────────────────────────
    detectAllDoshas() {
        const { planets, ascendant } = this.birthChart;
        return [
            this.detectKalSarpDosha(planets, ascendant),
            this.detectManglikDosha(planets, ascendant),
            this.detectPitraDosh(planets, ascendant),
            this.detectKemadruma(planets, ascendant),
            this.detectGuruChandal(planets),
            this.detectShakata(planets, ascendant),
            this.detectAmavasya(planets)
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // RENDER SUMMARY TABLE
    // ─────────────────────────────────────────────────────────────
    renderSummaryTable(doshas) {
        const container = document.getElementById('doshaSummaryTable');
        if (!container) return;

        const allDoshaNames = [
            'Kaal Sarp Dosha', 'Manglik Dosha', 'Pitra Dosh',
            'Kemadruma Yoga', 'Guru Chandal Yoga', 'Shakata Yoga', 'Amavasya Dosha'
        ];

        const doshaMap = {};
        doshas.forEach(d => {
            if (d.name) doshaMap[d.name] = d;
        });

        const rows = allDoshaNames.map(name => {
            // find by name match
            const d = doshas.find(x => x.name && x.name.includes(name.split(' ')[0]));
            let statusHtml;
            if (!d || !d.present) {
                statusHtml = `<span style="color:#4ade80; font-weight:600;">✓ Not Present</span>`;
            } else if (d.cancelled) {
                statusHtml = `<span style="color:#fbbf24; font-weight:600;">⚡ Cancelled</span>`;
            } else {
                const colors = { very_high: '#f87171', high: '#fb923c', moderate: '#fbbf24' };
                const col = colors[d.severity] || '#fbbf24';
                statusHtml = `<span style="color:${col}; font-weight:600;">⚠️ Present</span>`;
            }
            return `<tr>
                <td style="color:var(--soft-white);padding:0.6rem 1rem;border-bottom:1px solid rgba(255,255,255,0.07);">${name}</td>
                <td style="padding:0.6rem 1rem;border-bottom:1px solid rgba(255,255,255,0.07);">${statusHtml}</td>
            </tr>`;
        }).join('');

        container.innerHTML = `
            <div class="remedy-card" style="border-left-color: var(--accent-cyan); margin-bottom: 2rem;">
                <h3 style="color: var(--accent-cyan); margin-bottom: 1.2rem;">📋 Dosha Overview</h3>
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th style="text-align:left;color:var(--moon-silver);padding:0.5rem 1rem;border-bottom:1px solid rgba(255,255,255,0.15);">Dosha</th>
                            <th style="text-align:left;color:var(--moon-silver);padding:0.5rem 1rem;border-bottom:1px solid rgba(255,255,255,0.15);">Status</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────
    // RENDER DOSHA CARDS
    // ─────────────────────────────────────────────────────────────
    renderDoshaCards(doshas) {
        const container = document.getElementById('negativeYogasContainer');
        if (!container) return;

        const presentDoshas = doshas.filter(d => d.present && !d.cancelled);
        const cancelledDoshas = doshas.filter(d => d.present && d.cancelled);
        const absentDoshas = doshas.filter(d => !d.present);

        let html = '';

        if (presentDoshas.length === 0) {
            html += `
                <div class="remedy-card" style="border-left-color: var(--accent-cyan);">
                    <h3 style="color: var(--accent-cyan);">✨ No Active Major Doshas Detected!</h3>
                    <p style="color: var(--soft-white); margin-top: 1rem; line-height: 1.8;">
                        Your chart is relatively free from major active doshas. This indicates good karmic balance.
                        ${cancelledDoshas.length > 0 ? `Note: ${cancelledDoshas.length} dosha(s) are present but cancelled by protective yoga formations.` : ''}
                    </p>
                </div>
            `;
        }

        presentDoshas.forEach(d => { html += this._buildDoshaCard(d); });

        if (cancelledDoshas.length > 0) {
            html += `<div style="margin: 2rem 0 1rem;">
                <h3 style="color: #fbbf24; font-family: var(--font-display);">⚡ Cancelled / Mitigated Doshas</h3>
                <p style="color: var(--moon-silver); font-size: 0.9rem;">These doshas exist in the chart but are neutralized by protective planetary positions.</p>
            </div>`;
            cancelledDoshas.forEach(d => { html += this._buildCancelledCard(d); });
        }

        container.innerHTML = html;
    }

    _buildDoshaCard(d) {
        const colors = { very_high: 'var(--accent-pink)', high: '#fb923c', moderate: '#fbbf24' };
        const color = colors[d.severity] || '#fbbf24';
        const sevLabel = { very_high: 'Very High', high: 'High', moderate: 'Moderate' };

        return `
            <div class="remedy-card" style="border-left-color: ${color}; margin-bottom: 1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:start; flex-wrap:wrap; gap:0.5rem;">
                    <h3 style="color:${color};">⚠️ ${d.name}</h3>
                    <span style="background:rgba(255,100,100,0.15); padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:${color}; white-space:nowrap;">
                        Severity: ${sevLabel[d.severity] || d.severity}
                    </span>
                </div>

                ${d.condition ? `
                    <div style="background:rgba(255,255,255,0.05); border-radius:8px; padding:0.8rem; margin-top:0.8rem;">
                        <p style="color:var(--moon-silver); font-size:0.9rem; line-height:1.6;">
                            <strong style="color:${color};">📍 Condition:</strong> ${d.condition}
                        </p>
                    </div>
                ` : ''}

                <p style="color:var(--soft-white); margin-top:1rem; line-height:1.8;">
                    <strong>Effect:</strong> ${d.effect}
                </p>

                <div style="background:rgba(100,255,218,0.07); padding:1rem; border-radius:8px; margin-top:1rem; border:1px solid rgba(100,255,218,0.15);">
                    <h5 style="color:var(--accent-cyan); margin-bottom:0.6rem;">🌟 Classical Remedies:</h5>
                    <ul style="margin:0 0 0 1.2rem; color:var(--soft-white); line-height:2.1;">
                        ${d.remedies.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    _buildCancelledCard(d) {
        return `
            <div class="remedy-card" style="border-left-color:#fbbf24; opacity:0.8; margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                    <h3 style="color:#fbbf24;">⚡ ${d.name}</h3>
                    <span style="background:rgba(74,222,128,0.15); padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; color:#4ade80; white-space:nowrap;">
                        ✓ Cancelled / Mitigated
                    </span>
                </div>
                <p style="color:var(--moon-silver); margin-top:0.6rem; font-size:0.9rem; line-height:1.6;">
                    ${d.cancellationReason}
                </p>
            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────
    // REMEDIES GUIDANCE
    // ─────────────────────────────────────────────────────────────
    renderRemediesGuidance(doshas) {
        const container = document.getElementById('remediesGuidance');
        if (!container) return;
        const activeDoshas = doshas.filter(d => d.present && !d.cancelled);

        container.innerHTML = `
            <div class="remedy-card" style="border-left-color: var(--star-gold);">
                <h4 style="color: var(--star-gold);">🙏 How Remedies Work</h4>
                <p style="color: var(--soft-white); margin-top: 0.5rem; line-height: 1.8;">
                    Astrological remedies work on multiple levels to mitigate doshas:
                </p>
                <ul style="margin-top: 0.5rem; color: var(--moon-silver); line-height: 1.8;">
                    <li><strong>Energy Balancing:</strong> Mantras and gemstones adjust planetary energies</li>
                    <li><strong>Karmic Resolution:</strong> Charity and service help clear karmic debts</li>
                    <li><strong>Consciousness Elevation:</strong> Meditation raises you above planetary influences</li>
                    <li><strong>Practical Action:</strong> Behavioral changes address root causes</li>
                </ul>
            </div>

            ${activeDoshas.length > 0 ? `
            <div class="remedy-card" style="border-left-color: var(--accent-cyan); margin-top: 1.5rem;">
                <h4 style="color: var(--accent-cyan);">📋 Your Priority Action Plan</h4>
                <p style="color: var(--soft-white); margin-top: 0.5rem; line-height: 1.8;">
                    You have <strong>${activeDoshas.length} active dosha(s)</strong> to address:
                </p>
                <ol style="margin-top: 0.5rem; color: var(--moon-silver); line-height: 1.8; margin-left: 1.5rem;">
                    <li>Start with the highest-severity dosha first</li>
                    <li>Begin simple daily mantras for affected planets this week</li>
                    <li>Perform weekly charity as recommended for each dosha</li>
                    <li>Consult an expert astrologer for gemstone recommendations</li>
                    <li>Be patient — remedies work gradually over 40–90 days of consistent practice</li>
                </ol>
            </div>` : ''}

            <div class="remedy-card" style="border-left-color: var(--moon-silver); margin-top: 1.5rem;">
                <h4 style="color: var(--moon-silver);">💡 Remember</h4>
                <p style="color: var(--soft-white); margin-top: 0.5rem; line-height: 1.8;">
                    Doshas are <strong>NOT curses</strong>. They are karmic indicators showing areas for growth.
                    With proper remedies and sincere effort, every dosha can be overcome or significantly reduced.
                    History's most successful people often had challenging yogas that they transformed into strengths.
                </p>
            </div>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window._negYogaCtrl = new NegativeYogasController();
});
