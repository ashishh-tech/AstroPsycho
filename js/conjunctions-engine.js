// Planetary Conjunctions Engine
// Detects 2-planet pairs AND 3/4/5/6/7-planet stelliums within a sign/orb

class ConjunctionsController {
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
            this.renderConjunctions();
        } catch (error) {
            console.error('Conjunctions Error:', error);
            this.showError('Error loading conjunction data. Please try again.');
        }
    }

    loadUserData() {
        const data = localStorage.getItem('astropsycho_assessment');
        return data ? JSON.parse(data) : null;
    }

    showError(message) {
        const content = document.getElementById('conjunctionsContent');
        if (content) {
            content.innerHTML = `
                <div class="info-box" style="border-color: #a78bfa; margin-top: 2rem;">
                    <h3 style="color: #a78bfa;">🪐 Quick Conjunctions Analysis</h3>
                    <p style="margin-bottom: 1.5rem;">Enter your birth details to analyze your planetary combinations.</p>
                    ${this.createBirthForm('quickConjForm')}
                </div>
            `;
            document.getElementById('quickConjForm').addEventListener('submit', (e) => {
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
                    <label>Place of Birth (City)</label>
                    <input type="text" id="quickPlace" required placeholder="e.g. Mumbai">
                </div>
                <div class="button-group" style="margin-top: 1.5rem;">
                    <button type="submit" class="btn btn-primary">Analyze Conjunctions 🪐</button>
                    <a href="index.html" class="btn btn-secondary">← Back to Home</a>
                </div>
            </form>
        `;
    }

    processQuickBirthDetails() {
        const bd = {
            fullName: document.getElementById('quickName').value,
            birthDate: document.getElementById('quickDate').value,
            birthTime: document.getElementById('quickTime').value,
            birthPlace: document.getElementById('quickPlace').value,
            latitude: 28.61,
            longitude: 77.20,
            timezone: 5.5
        };
        this.userData = { birthDetails: bd, timestamp: new Date().toISOString() };
        localStorage.setItem('astropsycho_assessment', JSON.stringify(this.userData));
        this.birthChart = this.astrologyEngine.calculateBirthChart(bd);
        this.renderConjunctions();
    }

    // ─────────────────────────────────────────────────────────────
    // CORE UTILITIES
    // ─────────────────────────────────────────────────────────────

    _orb(a, b) {
        let diff = Math.abs(((a % 360) + 360) % 360 - ((b % 360) + 360) % 360);
        if (diff > 180) diff = 360 - diff;
        return diff;
    }

    _norm(deg) { return ((deg % 360) + 360) % 360; }
    _signOf(deg) { return Math.floor(this._norm(deg) / 30); }
    _signNameOf(deg) {
        const s = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        return s[this._signOf(deg)];
    }
    _houseOf(planetDeg, ascDeg) {
        return this.astrologyEngine.getHouseNumber(planetDeg, ascDeg);
    }
    _cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    // ─────────────────────────────────────────────────────────────
    // MULTI-PLANET CONJUNCTION DETECTION
    // ─────────────────────────────────────────────────────────────

    /**
     * Detects stelliums of 3+ planets within the same sign.
     * For groups of 2–3 planets also checks across sign boundary (orb ≤ 10°).
     * @param {Object} planets  { planet: longitude, … }
     * @param {number} ascendant
     * @returns {{ stelliums: [], pairs: [] }}
     */
    detectAllConjunctions(planets, ascendant) {
        const planetList = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

        // Build position map, normalising degrees
        const pos = {};
        planetList.forEach(p => { pos[p] = this._norm(planets[p]); });

        // ── 1. Group planets by zodiac sign ──────────────────────
        const bySign = {};
        planetList.forEach(p => {
            const si = this._signOf(pos[p]);
            if (!bySign[si]) bySign[si] = [];
            bySign[si].push(p);
        });

        const stelliums = [];
        const usedInStellium = new Set(); // track planets consumed by 3+ groups

        // ── 2. Extract 3–7 planet groups from each sign ──────────
        Object.keys(bySign).forEach(si => {
            const group = bySign[si];
            if (group.length < 3) return;

            // Compute span (max − min degree within sign)
            const degs = group.map(p => pos[p]);
            const minDeg = Math.min(...degs);
            const maxDeg = Math.max(...degs);
            const span = maxDeg - minDeg;

            // Include if span ≤ 18° (classical stellium orb)
            if (span <= 18) {
                group.forEach(p => usedInStellium.add(p));
                const midDeg = (minDeg + maxDeg) / 2 + parseInt(si) * 30;
                stelliums.push({
                    planets: group,
                    count: group.length,
                    span: parseFloat(span.toFixed(2)),
                    isTight: span <= 6,
                    signIdx: parseInt(si),
                    signName: this._signNameOf(degs[0]),
                    house: this._houseOf(midDeg, ascendant),
                    interpretation: this.getStelliumInterpretation(group, this._houseOf(midDeg, ascendant), this._signNameOf(degs[0]))
                });
            }
        });

        // Sort stelliums: more planets first, then tightest span
        stelliums.sort((a, b) => b.count - a.count || a.span - b.span);

        // ── 3. Detect 2-planet pairs ─────────────────────────────
        const pairs = [];
        for (let i = 0; i < planetList.length; i++) {
            for (let j = i + 1; j < planetList.length; j++) {
                const p1 = planetList[i], p2 = planetList[j];
                if ((p1 === 'rahu' && p2 === 'ketu') || (p1 === 'ketu' && p2 === 'rahu')) continue;

                const orb = this._orb(pos[p1], pos[p2]);
                const sameSign = this._signOf(pos[p1]) === this._signOf(pos[p2]);

                if (orb <= 10.0 || (sameSign && orb <= 15.0)) {
                    pairs.push({
                        p1, p2,
                        orb: parseFloat(orb.toFixed(2)),
                        isTight: orb <= 5.0,
                        signName: this._signNameOf(pos[p1]),
                        sameSign,
                        house: this._houseOf(pos[p1], ascendant),
                        interpretation: this.getInterpretation(p1, p2, this._houseOf(pos[p1], ascendant))
                    });
                }
            }
        }
        pairs.sort((a, b) => a.orb - b.orb);

        return { stelliums, pairs };
    }

    // ─────────────────────────────────────────────────────────────
    // STELLIUM INTERPRETATIONS (3–7 planets)
    // ─────────────────────────────────────────────────────────────

    getStelliumInterpretation(planets, house, sign) {
        const key = [...planets].sort().join('-');
        const db = this._buildStelliumDB();
        let data = db[key];
        if (!data) data = this._synthesizeStelliumInterpretation(planets, house, sign);
        return data;
    }

    _buildStelliumDB() {
        // Pre-built 3-planet combinations (most common)
        return {
            // ── SUN combos ──────────────────────────────────────────────
            'mars-moon-sun': {
                title: 'Sun–Moon–Mars Confluence', power: 'Intense',
                theme: 'Raw Willpower + Emotional Drive',
                effect: 'A fiercely passionate configuration. The ego, emotions, and willpower fuse into an extraordinary reservoir of personal drive. These natives are unstoppable when motivated but can be volatile under pressure. Natural commanders and entrepreneurs. Health and vitality are paramount to them.'
            },
            'jupiter-moon-sun': {
                title: 'Sun–Moon–Jupiter Triple Conjunction', power: 'Highly Auspicious',
                theme: 'Royal Wisdom Yoga',
                effect: 'One of the finest triple conjunctions possible. Noble character, deep optimism, and an expansive worldview. The self, emotions, and wisdom all align beautifully. Natural teachers, philosophers, or leaders. Strong moral integrity and ability to inspire others. Immense inner contentment.'
            },
            'mercury-moon-sun': {
                title: 'Budha-Aditya-Chandra Yoga', power: 'Strong',
                theme: 'Brilliant Communicator',
                effect: 'The mind (Mercury), heart (Moon), and ego (Sun) unite — producing an extraordinarily articulate, emotionally intelligent, and self-aware individual. Exceptional writers, orators, or counselors. All communication is deeply personal and carries authority. Prone to overthinking.'
            },
            'moon-saturn-sun': {
                title: 'Sun–Moon–Saturn Compression', power: 'Challenging',
                theme: 'Duty-Bound Identity',
                effect: 'A heavy configuration that compresses the native\'s identity under the weight of duty and restriction. Deep-seated sense of responsibility and discipline. Success comes after immense hardship. Often associated with significant father-related karma. Profound maturity at a young age. Inner life feels constantly constrained by obligation.'
            },
            'moon-rahu-sun': {
                title: 'Solar-Lunar Eclipse Yoga', power: 'Intense',
                theme: 'Destiny & Illusion',
                effect: 'A rare and powerful triple conjunction echoing the eclipse energy. Identity and emotions are swept into Rahu\'s vortex of ambition, illusion, and unconventional fate. These natives experience dramatic life chapters, intense public encounters, and a magnetic yet unpredictable personality. Fame or notoriety is possible.'
            },
            // ── MARS combos ─────────────────────────────────────────────
            'jupiter-mars-mercury': {
                title: 'Mercury–Mars–Jupiter Stellium', power: 'Highly Auspicious',
                theme: 'Strategic Brilliance',
                effect: 'Logic (Mercury) + action (Mars) + wisdom (Jupiter) — a supremely capable combination. Engineers, lawyers, surgeons, and military strategists. The native thinks fast, acts decisively, and expands boldly. Excellent debater and leader. Success in technical and competitive fields is almost guaranteed.'
            },
            'mars-saturn-sun': {
                title: 'Sun–Mars–Saturn Stellium', power: 'Challenging',
                theme: 'Iron Determination',
                effect: 'This triple alliance of fire and stone creates individuals of extraordinary endurance and discipline. The native fights through enormous obstacles and builds lasting structures in life. A perfect soldier, athlete, or hard-core entrepreneur. However, internalized rage, physical strain, and conflict with authority can manifest. Release valves are essential.'
            },
            'mars-rahu-sun': {
                title: 'Angarak–Grahan Stellium', power: 'Intense',
                theme: 'Explosive Ambition',
                effect: 'Among the most electrifying and volatile three-planet combinations. Sun (ego), Mars (action), and Rahu (obsession) create a juggernaut of ambition. These natives chase power and recognition relentlessly, often crossing conventional limits. Extraordinary achievers but prone to accidents, controversies, and burnout. Channel this energy with discipline.'
            },
            // ── VENUS combos ─────────────────────────────────────────────
            'jupiter-moon-venus': {
                title: 'Lakshmi Yoga Triple (Moon–Venus–Jupiter)', power: 'Highly Auspicious',
                theme: 'Abundance & Charm',
                effect: 'A gloriously auspicious stellium. Moon (heart), Venus (beauty/wealth), and Jupiter (grace/expansion) unite to produce a deeply charismatic, wealthy, and emotionally fulfilled person. Natural talent for arts, music, and healing. Relationships are deeply nourishing. Financial prosperity often comes early and grows steadily.'
            },
            'mercury-venus-sun': {
                title: 'Saraswati Triad (Sun–Mercury–Venus)', power: 'Strong',
                theme: 'Creative Intelligence',
                effect: 'Artistic intellect at its finest. The individual has both the creative vision (Venus), the articulation skills (Mercury), and the self-confidence (Sun) to make a powerful mark in the arts, media, public speaking, or commerce. Naturally charming and magnetic. Their words and creations carry beauty and authority.'
            },
            'mars-saturn-venus': {
                title: 'Venus–Mars–Saturn Stellium', power: 'Mixed',
                theme: 'Disciplined Passion',
                effect: 'Love and desire (Venus + Mars) undergo the refining pressure of Saturn. Romantic life can be delayed or complicated by duty and fear. But once commitment is made, it is rock solid. Great for craftsmanship, structured art forms (sculpture, architecture), and any creative field demanding endurance. Relationships require patience to bloom.'
            },
            // ── JUPITER combos ───────────────────────────────────────────
            'jupiter-saturn-sun': {
                title: 'Dharma-Karma-Atma Stellium', power: 'Profound',
                theme: 'Destiny-Driven Leader',
                effect: 'Sun (soul), Jupiter (dharma), and Saturn (karma) — a tremendously weighty triple conjunction that marks a souls of great destiny. These individuals carry authority, wisdom, and a sense of serious duty. Philosophers, statesmen, or renunciants. Life is experienced as a karmic mission. Success is hard-earned but monumental and lasting.'
            },
            'jupiter-rahu-sun': {
                title: 'Guru Chandal Solar Stellium', power: 'Intense',
                theme: 'Unconventional Wisdom Power',
                effect: 'Sun (authority), Jupiter (wisdom), and Rahu (transgression) — a complex trio that creates iconoclasts, reformers, and path-breakers. These natives question everything, including their own identity. They can achieve outsized fame through unconventional means. Must guard against ego inflation and manipulation of knowledge for power. Immense potential for either greatness or controversy.'
            },
            // ── SATURN-RAHU combos ───────────────────────────────────────
            'ketu-rahu-saturn': {
                title: 'Karmic Axis–Saturn Stellium', power: 'Karmic',
                theme: 'Deep Past-Life Imprint',
                effect: 'An extremely rare and karmic configuration. Saturn conjoining the nodal axis creates profound delays, isolation, and a sense of being tied to a heavy destiny. The native is often placed in situations requiring immense patience and detachment. However, this also grants extraordinary depth, mystical perception, and mastery over the darker aspects of life and reality.'
            },
            // ── 4-planet keys ────────────────────────────────────────────
            'jupiter-mars-mercury-sun': {
                title: 'Four-Planet Sun Sign Stellium', power: 'Extraordinary',
                theme: 'Four Pillars of Greatness',
                effect: 'Sun, Mercury, Mars, and Jupiter co-present in one sign creates a formidable personality: authoritative, eloquent, courageous, and wise. The native is a force of nature who can lead, debate, fight, and inspire simultaneously. Career success is pronounced. However, the house containing this stellium becomes an overwhelming area of life focus — its themes dominate the entire chart.'
            },
            'jupiter-moon-mercury-sun': {
                title: 'Chaturgraha (Sun–Moon–Mercury–Jupiter)', power: 'Extraordinary',
                theme: 'Luminous Intelligence',
                effect: 'When the luminaries (Sun, Moon), the intellect (Mercury), and the great benefic (Jupiter) cluster together, it produces one of the most auspicious multi-planet configurations imaginable. Exceptional intelligence, emotional richness, and spiritual wisdom. The native is inherently blessed, often recognised from an early age. Teaching, writing, counselling, or spiritual leadership are natural paths.'
            }
        };
    }

    _synthesizeStelliumInterpretation(planets, house, sign) {
        // Classify each planet
        const benefics = ['jupiter', 'venus', 'moon', 'mercury'];
        const malefics = ['saturn', 'mars', 'rahu', 'ketu', 'sun'];
        const luminaries = ['sun', 'moon'];
        const shadowNodes = ['rahu', 'ketu'];

        const beneficCount = planets.filter(p => benefics.includes(p)).length;
        const maleficCount = planets.filter(p => malefics.includes(p)).length;
        const hasJupiter = planets.includes('jupiter');
        const hasRahu = planets.includes('rahu');
        const hasSaturn = planets.includes('saturn');
        const hasMars = planets.includes('mars');
        const hasSun = planets.includes('sun');
        const hasVenus = planets.includes('venus');

        const count = planets.length;
        const planetStr = planets.map(p => this._cap(p)).join(', ');
        const sizeLabel = ['', '', '', 'Triple', 'Quadruple', 'Quintuple', 'Sextuple', 'Septuple'][count] || `${count}-Planet`;

        let power, theme, effect;

        // Determine power
        if (count >= 6) power = 'Legendary';
        else if (count === 5) power = 'Extraordinary';
        else if (beneficCount > maleficCount) power = 'Auspicious';
        else if (maleficCount > beneficCount) power = 'Challenging';
        else power = 'Mixed';

        // Theme synthesis
        if (hasJupiter && beneficCount >= 2) theme = 'Wisdom & Expansion';
        else if (hasMars && hasSaturn) theme = 'Iron Discipline & Struggle';
        else if (hasRahu && hasSun) theme = 'Ambition & Unconventional Power';
        else if (hasVenus && beneficCount >= 2) theme = 'Beauty, Love & Prosperity';
        else if (hasSaturn && count >= 4) theme = 'Heavy Karma & Endurance';
        else theme = 'Complex Planetary Fusion';

        // Effect text
        const houseThemes = {
            1: 'self-identity, health, and personal beginnings',
            2: 'wealth, family, and speech',
            3: 'courage, communication, and siblings',
            4: 'home, mother, and emotional roots',
            5: 'creativity, children, and romance',
            6: 'service, health struggles, and enemies',
            7: 'marriage, partnerships, and business',
            8: 'transformation, secrets, and occult',
            9: 'dharma, father, and higher wisdom',
            10: 'career, authority, and public life',
            11: 'gains, aspirations, and social networks',
            12: 'loss, liberation, and foreign lands'
        };

        const houseDesc = houseThemes[house] || 'all areas of life';

        effect = `A ${sizeLabel.toLowerCase()} stellium of ${planetStr} in ${sign} falls in your ${house}${this._ordSuffix(house)} house — the realm of ${houseDesc}. `;

        if (count >= 6) {
            effect += `With ${count} planets clustered here, this house becomes the singular gravitational centre of your entire life. Every major theme — career, relationships, spirituality — eventually traces back to the energy of this massive conjunction. `;
        } else if (count === 5) {
            effect += `Five planets in one sign is extraordinarily rare and concentrates tremendous destiny-force in this area of life. `;
        } else {
            effect += `This concentration of planetary energy makes the themes of this house exceptionally prominent and complex throughout your life. `;
        }

        if (beneficCount > maleficCount) {
            effect += `With ${beneficCount} benefics dominant, this stellium tends toward growth, opportunity, and positive manifestation, though the sheer concentration of energy may still feel overwhelming at times.`;
        } else if (maleficCount > beneficCount) {
            effect += `With ${maleficCount} malefics prominent, this stellium presents significant challenges — delays, frustrations, or obsessive drives — but also forges extraordinary resilience, depth, and mastery through struggle.`;
        } else {
            effect += `The balanced mix of benefic and malefic energies creates a complex push-pull dynamic — this area of life is both a source of great strength and persistent friction.`;
        }

        return {
            title: `${sizeLabel} Stellium in ${sign} — House ${house}`,
            power,
            theme,
            effect
        };
    }

    _ordSuffix(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return (s[(v - 20) % 10] || s[v] || s[0]);
    }

    // ─────────────────────────────────────────────────────────────
    // 2-PLANET INTERPRETATIONS (unchanged database)
    // ─────────────────────────────────────────────────────────────

    getInterpretation(p1, p2, house) {
        const pair = [p1, p2].sort().join('-');
        const db = {
            'moon-sun': {
                name: 'Amavasya / Surya-Chandra Yoga', type: 'mixed',
                effect: 'Merging of ego (Sun) and emotions (Moon). Deep internalized feelings, strong subjective focus. Prone to intense mood states but possesses incredible single-minded determination. Identity is deeply tied to emotional security.',
                domains: 'Identity, Emotional balance, Inner life'
            },
            'mars-sun': {
                name: 'Solar Fire (Surya-Mangal)', type: 'intense',
                effect: 'Extremely high energy, drive, and ambition. Courageous but prone to anger, impulsiveness, and ego clashes. Natural leadership ability but must learn patience and diplomacy.',
                domains: 'Career, Leadership, Physical vitality'
            },
            'jupiter-sun': {
                name: 'Brahma Yoga (Surya-Guru)', type: 'benefic',
                effect: 'Noble, optimistic, and highly principled. Brings wisdom, authority, and respect from society. Usually drawn to teaching, guidance, or spiritual leadership. Very strong moral compass.',
                domains: 'Wisdom, Dharma, Finance, Authority'
            },
            'saturn-sun': {
                name: 'Pitra Karma (Surya-Shani)', type: 'challenging',
                effect: 'Clash between authority (Sun) and limitation/duty (Saturn). Often indicates early struggles with father figures or authority. Success comes late in life through immense hard work. Fosters deep inner discipline.',
                domains: 'Career, Relationship with father, Authority'
            },
            'rahu-sun': {
                name: 'Grahan Yoga (Surya-Rahu)', type: 'intense',
                effect: 'Ego distortion. Deep desire for fame, recognition, or power. Unconventional approach to life and authority. Susceptible to illusions of grandeur but highly innovative.',
                domains: 'Status, Ambition, Self-image'
            },
            'ketu-sun': {
                name: 'Spiritual Ego (Surya-Ketu)', type: 'challenging',
                effect: 'Detachment from material ego. Native may feel unseen or lack self-confidence early on, but possesses profound spiritual depth and highly internalized self-awareness.',
                domains: 'Spirituality, Ego dissolution, Deep focus'
            },
            'mars-moon': {
                name: 'Chandra-Mangal Yoga', type: 'mixed',
                effect: 'Passionate, emotionally intense, and highly driven. Excellent for wealth generation and business, but can cause emotional volatility, rash decisions, and argumentative nature.',
                domains: 'Wealth, Emotions, Action'
            },
            'mercury-moon': {
                name: 'Intelligent Mind (Chandra-Budh)', type: 'benefic',
                effect: 'Excellent communication skills, vivid imagination, and sharp intellect. Fluctuation of thoughts is common. Writer, speaker, or analytical thinker. Extremely perceptive.',
                domains: 'Communication, Intellect, Emotions'
            },
            'jupiter-moon': {
                name: 'Gaja Kesari Yoga', type: 'benefic',
                effect: 'One of the best yogas. Grants wisdom, purity of heart, optimism, and immense mental strength. Protects the native like a lion guards its territory. Respected and well-liked.',
                domains: 'Mental peace, Wisdom, Reputation'
            },
            'moon-venus': {
                name: 'Artistic Soul (Chandra-Shukra)', type: 'benefic',
                effect: 'Highly refined aesthetic sense, deep capacity for love, and natural charm. Drawn to luxury, art, and comfort. Very sensitive and empathetic to others\' feelings.',
                domains: 'Romance, Art, Comforts, Empathy'
            },
            'moon-saturn': {
                name: 'Vish Yoga (Chandra-Shani)', type: 'challenging',
                effect: 'Mind feels heavy or constrained by duty. Prone to melancholy, overthinking, or pessimism. However, gives incredible endurance, profound maturity, and ability to handle extreme pressure.',
                domains: 'Mental limits, Discipline, Emotional grit'
            },
            'moon-rahu': {
                name: 'Mental Grahan (Chandra-Rahu)', type: 'intense',
                effect: 'Highly imaginative but prone to anxiety, phobias, or illusions. Deep psychological sensitivity. Can perceive things others miss, giving success in psychology, tech, or foreign fields.',
                domains: 'Psychology, Obsessions, Innovation'
            },
            'ketu-moon': {
                name: 'Mystic Mind (Chandra-Ketu)', type: 'mixed',
                effect: 'Deeply intuitive, psychic, and spiritually detached. Mind cannot be satisfied by material things alone. Intense emotional depth, often requiring periods of solitude.',
                domains: 'Intuition, Detachment, Inner peace'
            },
            'mars-mercury': {
                name: 'Sharp Tongue (Budh-Mangal)', type: 'mixed',
                effect: 'Extremely quick intellect, sharp wit, and argumentative skills. Excellent in debates, engineering, or detailed analytical work. Must watch out for sarcastic or hurtful speech.',
                domains: 'Debate, Logic, Aggressive intellect'
            },
            'jupiter-mars': {
                name: 'Guru-Mangal Yoga', type: 'benefic',
                effect: 'Righteous action. Combines wisdom (Jupiter) with courage (Mars). Native is principled, energetic, and protective. Will fight for a noble cause. Excellent for military, engineering, or leadership.',
                domains: 'Dharma, Action, Protection'
            },
            'mars-venus': {
                name: 'Passion Combo (Shukra-Mangal)', type: 'intense',
                effect: 'Intense romantic and sensual desires. Very passionate and dramatic in love. High physical vitality and creative spark. Wants relationships to be exciting and fulfilling.',
                domains: 'Romance, Sexuality, Creativity'
            },
            'mars-saturn': {
                name: 'Angarak / Extreme Tension (Shani-Mangal)', type: 'challenging',
                effect: 'The unstoppable force meets the immovable object. Deep frustration and blocked energy that can erupt. Unbelievable capacity for hard work under extreme conditions. Must find constructive outlets for stress.',
                domains: 'Struggle, Endurance, Technical skills'
            },
            'mars-rahu': {
                name: 'Angarak Yoga (Mangal-Rahu)', type: 'intense',
                effect: 'Explosive, daring, and reckless energy. Unconventional courage. Highly ambitious but prone to accidents or sudden anger. Can achieve massive technological or athletic success.',
                domains: 'Risk-taking, Tech, Unconventional action'
            },
            'ketu-mars': {
                name: 'Hidden Fire (Mangal-Ketu)', type: 'challenging',
                effect: 'Action without thought, or suppressed anger. Precision skills (surgery, martial arts, coding). Native often acts on sudden intuition but may lack sustained motivation for worldly desires.',
                domains: 'Precision, Sudden action, Technical focus'
            },
            'jupiter-mercury': {
                name: 'Saraswati Yoga traits (Budh-Guru)', type: 'benefic',
                effect: 'Highly learned, eloquent, and analytical. Excellent memory and analytical capability. Superb for teaching, writing, law, and advisory roles. Balances logic with philosophy.',
                domains: 'Education, Speech, Advising'
            },
            'mercury-venus': {
                name: 'Budh-Shukra Yoga', type: 'benefic',
                effect: 'Charming speech, artistic intellect, and excellent diplomatic skills. Often gives beautiful handwriting, musical talent, or success in commerce and the beauty/art industry.',
                domains: 'Arts, Commerce, Diplomatic communication'
            },
            'mercury-saturn': {
                name: 'Deep Thinker (Budh-Shani)', type: 'mixed',
                effect: 'Slow, methodical, and extremely profound thinking. Skeptical mind. Excellent for profound research, coding, or long-term projects. May lack superficial charm but possesses deep knowledge.',
                domains: 'Research, Logic, Patience'
            },
            'mercury-rahu': {
                name: 'Clever Mind (Budh-Rahu)', type: 'intense',
                effect: 'Extremely tricky, out-of-the-box thinker. Excellent at hacking, sleight of hand, marketing, or manipulating data. Highly intelligent but must maintain ethical boundaries.',
                domains: 'Technology, Manipulation, Marketing'
            },
            'ketu-mercury': {
                name: 'Intuitive Logic (Budh-Ketu)', type: 'mixed',
                effect: 'Logic is pierced by intuition. Difficulties with conventional rote learning, but flashes of pure genius. Excellent for astrology, profound analytical research, and understanding hidden codes.',
                domains: 'Astrology, Coding, Unconventional logic'
            },
            'jupiter-venus': {
                name: 'Dual Gurus (Guru-Shukra)', type: 'benefic',
                effect: 'Knowledge of both spiritual (Jupiter) and material (Venus) realms. Cultured, wealthy, and refined. However, can indicate a clash in belief systems or philosophical differences in relationships.',
                domains: 'Wealth, Luxury, Philosophy vs Aesthetics'
            },
            'jupiter-saturn': {
                name: 'Dharma-Karma Adhipati', type: 'mixed',
                effect: 'The teacher (Jupiter) meets the taskmaster (Saturn). Brings great realism and pragmatism. Success is solid but slow. The person takes their duties and beliefs very seriously.',
                domains: 'Duty, Slow growth, Realistic spirituality'
            },
            'jupiter-rahu': {
                name: 'Guru Chandal Yoga', type: 'intense',
                effect: 'Rebellious wisdom. Challenging traditional norms and religions. Highly innovative thinker, but can be susceptible to false beliefs or using knowledge for material extremes.',
                domains: 'Unconventional wisdom, Rebellion'
            },
            'jupiter-ketu': {
                name: 'Paramahamsa Yoga', type: 'benefic',
                effect: 'Profoundly spiritual combination. Deeply internalizes wisdom. Seeking the absolute truth and ultimate liberation (Moksha). May detach from orthodox religious rituals in favor of pure mysticism.',
                domains: 'Moksha, Deep spirituality, Unseen wisdom'
            },
            'saturn-venus': {
                name: 'Practical Love (Shukra-Shani)', type: 'mixed',
                effect: 'Love and duty are intertwined. Relationships may start late or require much patience. Deep loyalty and commitment once formed. Affinities for antique beauty and structured art forms.',
                domains: 'Commitment, Older/mature partners, Hard work in art'
            },
            'rahu-venus': {
                name: 'Obsessive Desires (Shukra-Rahu)', type: 'intense',
                effect: 'Insatiable desires for love, luxury, and aesthetics. Unconventional or taboo-breaking relationships. Massive charm and magnetism. Can gain immense wealth through media or arts.',
                domains: 'Glamour, Obsession, Unconventional love'
            },
            'ketu-venus': {
                name: 'Detached Love (Shukra-Ketu)', type: 'challenging',
                effect: 'Past-life karmic connections in love, but ultimate dissatisfaction with worldly romance. Seeks an ideal/divine love that doesn\'t exist in the physical realm. Spiritualizes passions.',
                domains: 'Karmic relationships, Spiritual love, Asceticism'
            },
            'rahu-saturn': {
                name: 'Shrapit Yoga / Deep Karma', type: 'challenging',
                effect: 'Intense past-life karmic burdens. Struggles, delays, and feelings of isolation. However, incredibly resilient. Highly capable of dealing with the dark, hidden, or grueling aspects of reality.',
                domains: 'Heavy labor, Karmic blockages, Endurance'
            },
            'ketu-saturn': {
                name: 'Ascetic Discipline (Shani-Ketu)', type: 'challenging',
                effect: 'Ultimate detachment from worldly structures. Feels no satisfaction from conventional career success. Strong ascetic tendencies. Works best in isolation or deep research.',
                domains: 'Renunciation, Isolation, Deep specialized work'
            }
        };

        const defaultResult = {
            name: `${this._cap(p1)} + ${this._cap(p2)} Conjunction`,
            type: 'mixed',
            effect: `The energies of ${p1} and ${p2} blend together in this house. The exact manifestation depends on the sign, but these two planets must inherently cooperate or compromise in your life.`,
            domains: 'General life synthesis'
        };

        return db[pair] || db[[p2, p1].sort().join('-')] || defaultResult;
    }

    // ─────────────────────────────────────────────────────────────
    // RENDERING
    // ─────────────────────────────────────────────────────────────

    getPlanetSymbol(p) {
        const sym = { sun: '☀️', moon: '🌙', mars: '♂️', mercury: '☿', jupiter: '♃', venus: '♀️', saturn: '♄', rahu: '☊', ketu: '☋' };
        return sym[p] || '';
    }

    renderConjunctions() {
        const container = document.getElementById('conjunctionsContainer');
        const summary = document.getElementById('conjunctionsSummary');
        const userNameEl = document.getElementById('userName');

        if (this.userData?.birthDetails?.fullName && userNameEl) {
            userNameEl.textContent = `${this.userData.birthDetails.fullName}'s`;
        }

        const { planets, ascendant } = this.birthChart;
        const { stelliums, pairs } = this.detectAllConjunctions(planets, ascendant);
        const totalCount = stelliums.length + pairs.length;

        if (summary) {
            const stelliumBadge = stelliums.length > 0
                ? `<span style="color:#f4c430;"> · <strong>${stelliums.length}</strong> stellium${stelliums.length > 1 ? 's' : ''} (3+ planets)</span>`
                : '';
            summary.innerHTML = `
                <div class="info-box" style="border-color: #a78bfa; background: rgba(167, 139, 250, 0.05);">
                    <h3 style="color: #a78bfa; margin-bottom: 0.8rem;">✨ ${totalCount} Planetary Conjunctions Detected${stelliumBadge}</h3>
                    <p style="color: var(--soft-white); line-height: 1.8;">
                        When planets are within 10° of each other or share a zodiac sign, their energies fuse.
                        <strong>Stelliums (3+ planets)</strong> create a overwhelming concentration of destiny in one area.
                        <strong>Tight conjunctions (&lt;5°)</strong> are the most powerful individual pairs.
                    </p>
                </div>
            `;
        }

        if (totalCount === 0) {
            container.innerHTML = `
                <div class="remedy-card" style="border-left-color: var(--moon-silver);">
                    <h3 style="color: var(--moon-silver);">🌌 Spacious Chart</h3>
                    <p style="color: var(--soft-white); margin-top: 1rem; line-height: 1.8;">
                        You have no planets within 10 degrees of each other. Your planetary energies operate independently
                        and distinctly. Clear, well-separated phases of life without intense internal conflicts.
                    </p>
                </div>
            `;
            return;
        }

        let html = '';

        // ── STELLIUM SECTION ─────────────────────────────────────
        if (stelliums.length > 0) {
            const sizeLabel = n => ['', '', '', 'Triple', 'Quadruple', 'Quintuple', 'Sextuple', 'Septuple'][n] || `${n}-Planet`;
            const powerColor = p => ({
                'Legendary': '#f4c430', 'Extraordinary': '#fb7185', 'Highly Auspicious': '#4ade80',
                'Auspicious': '#86efac', 'Challenging': '#fb7185', 'Mixed': '#94a3b8',
                'Intense': '#fde047', 'Strong': '#60a5fa', 'Profound': '#c4b5fd', 'Karmic': '#a78bfa'
            })[p] || '#94a3b8';

            html += `
                <div style="margin-bottom: 0.5rem; display:flex; align-items:center; gap:0.8rem;">
                    <h2 style="color:#f4c430; font-family:var(--font-display); font-size:1.2rem; margin:0;">
                        🌟 Stelliums — Multi-Planet Concentrations
                    </h2>
                    <span style="background:rgba(244,196,48,0.15); color:#f4c430; font-size:0.75rem; font-weight:700; padding:2px 10px; border-radius:20px; border:1px solid rgba(244,196,48,0.3);">
                        ${stelliums.length} GROUP${stelliums.length > 1 ? 'S' : ''}
                    </span>
                </div>
                <p style="color:var(--moon-silver); font-size:0.88rem; margin-bottom:1.5rem; line-height:1.6;">
                    A stellium occurs when 3 or more planets occupy the same zodiac sign. This concentrates an
                    enormous amount of energy — and destiny — into one area of your life.
                </p>
            `;

            stelliums.forEach(s => {
                const pc = powerColor(s.interpretation.power);
                const countLabel = sizeLabel(s.count);
                html += `
                    <div class="remedy-card" style="border-left-color:${pc}; background: linear-gradient(135deg, rgba(244,196,48,0.04), rgba(255,255,255,0.02)); margin-bottom:1.5rem;">
                        <!-- Header Row -->
                        <div style="display:flex; justify-content:space-between; align-items:start; flex-wrap:wrap; gap:0.8rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:1rem; margin-bottom:1rem;">
                            <div>
                                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:6px;">
                                    <span style="background:rgba(244,196,48,0.15); color:#f4c430; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:20px; border:1px solid rgba(244,196,48,0.35);">
                                        ${s.count}⭐ ${countLabel.toUpperCase()} STELLIUM
                                    </span>
                                    <span style="background:rgba(${pc === '#4ade80' ? '74,222,128' : '251,113,133'},0.12); color:${pc}; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:20px;">
                                        ${s.interpretation.power}
                                    </span>
                                    ${s.isTight ? '<span style="background:rgba(167,139,250,0.2); color:#c4b5fd; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:20px;">🔥 TIGHT</span>' : ''}
                                </div>
                                <h3 style="color:var(--soft-white); font-size:1.25rem; font-family:var(--font-display); margin:0 0 4px 0;">
                                    ${s.interpretation.title}
                                </h3>
                                <p style="color:${pc}; font-size:0.95rem; font-weight:600; margin:0;">
                                    ${s.interpretation.theme}
                                </p>
                            </div>
                            <div style="text-align:right; flex-shrink:0;">
                                <div style="color:var(--moon-silver); font-size:0.85rem;">Span: <strong style="color:var(--soft-white);">${s.span.toFixed(1)}°</strong></div>
                                <div style="color:var(--moon-silver); font-size:0.85rem;">H${s.house} · ${s.signName}</div>
                            </div>
                        </div>
                        <!-- Planet Pills Row -->
                        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:1rem;">
                            ${s.planets.map(p => `
                                <span style="background:rgba(255,255,255,0.08); color:var(--soft-white); padding:5px 12px; border-radius:20px; font-size:0.88rem; font-weight:600; display:inline-flex; align-items:center; gap:5px;">
                                    ${this.getPlanetSymbol(p)} ${this._cap(p)}
                                </span>
                            `).join('')}
                        </div>
                        <!-- Effect -->
                        <p style="color:var(--soft-white); line-height:1.85; font-size:0.95rem;">
                            ${s.interpretation.effect}
                        </p>
                    </div>
                `;
            });
        }

        // ── PAIR SECTION ─────────────────────────────────────────
        if (pairs.length > 0) {
            if (stelliums.length > 0) {
                html += `
                    <div style="margin:2rem 0 1rem; display:flex; align-items:center; gap:0.8rem;">
                        <h2 style="color:#a78bfa; font-family:var(--font-display); font-size:1.2rem; margin:0;">
                            🪐 Two-Planet Conjunctions
                        </h2>
                        <span style="background:rgba(167,139,250,0.15); color:#a78bfa; font-size:0.75rem; font-weight:700; padding:2px 10px; border-radius:20px; border:1px solid rgba(167,139,250,0.3);">
                            ${pairs.length} PAIR${pairs.length > 1 ? 'S' : ''}
                        </span>
                    </div>
                `;
            }

            pairs.forEach(c => {
                const typeColor = c.interpretation.type === 'benefic' ? '#4ade80' :
                    c.interpretation.type === 'challenging' ? '#fb7185' :
                        c.interpretation.type === 'intense' ? '#fde047' : '#94a3b8';

                html += `
                    <div class="remedy-card" style="border-left-color: ${typeColor}; background: rgba(255,255,255,0.03);">
                        <div style="display:flex; justify-content:space-between; align-items:start; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.8rem; margin-bottom: 1rem;">
                            <div>
                                <h3 style="color: var(--soft-white); font-size: 1.3rem; display: flex; align-items: center; gap: 8px;">
                                    ${this.getPlanetSymbol(c.p1)} + ${this.getPlanetSymbol(c.p2)}
                                    <span style="font-size: 1rem; color: #e2e8f0; font-family: var(--font-body); font-weight: 500;">
                                        ${this._cap(c.p1)} &amp; ${this._cap(c.p2)}
                                    </span>
                                </h3>
                                <p style="color: ${typeColor}; font-weight: 600; font-size: 0.95rem; margin-top: 4px;">
                                    ${c.interpretation.name}
                                </p>
                            </div>
                            <div style="text-align:right;">
                                <span style="display:inline-block; background: ${c.isTight ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${c.isTight ? '#c4b5fd' : '#cbd5e1'}; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight:600;">
                                    Orb: ${c.orb.toFixed(2)}° ${c.isTight ? '🔥 TIGHT' : ''}
                                </span>
                                <div style="color: var(--moon-silver); font-size: 0.85rem; margin-top: 6px;">
                                    House ${c.house} · ${c.signName}
                                </div>
                            </div>
                        </div>
                        <p style="color: var(--soft-white); line-height: 1.8; font-size: 0.95rem;">
                            <strong>EFFECT:</strong> ${c.interpretation.effect}
                        </p>
                        <div style="margin-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 0.8rem; font-size: 0.85rem;">
                            <span style="color: var(--moon-silver);"><strong>Domains:</strong> <span style="color:#e2e8f0;">${c.interpretation.domains}</span></span>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window._conjCtrl = new ConjunctionsController();
});
