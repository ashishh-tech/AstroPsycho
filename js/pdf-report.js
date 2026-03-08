/**
 * Psychological Profile PDF Report Engine
 * Generates deep psychological insights from the birth chart
 */

class PsychProfileReport {
    constructor() {
        this.astrologyEngine = new VedicAstrologyEngine();
        this.userData = null;
        this.birthChart = null;

        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.planetEmoji = { sun: '☀️', moon: '🌙', mars: '♂️', mercury: '☿️', jupiter: '♃', venus: '♀️', saturn: '♄', rahu: '☊', ketu: '☋' };
        this.lordMap = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];

        // Big 5 trait descriptions per planet
        this.big5Map = {
            openness: {
                planet: 'mercury',
                label: 'Openness to Experience',
                icon: '🌀',
                color: '#22c55e',
                high: 'Highly curious, creative, imaginative. You seek novelty and love abstract thinking.',
                low: 'Prefers routine and practicality. Grounded in the concrete and familiar.'
            },
            conscientiousness: {
                planet: 'saturn',
                label: 'Conscientiousness',
                icon: '⚖️',
                color: '#8b5cf6',
                high: 'Extremely organized, disciplined, and goal-oriented. You plan before you act.',
                low: 'Spontaneous and flexible. Rules and schedules feel restrictive to your spirit.'
            },
            extraversion: {
                planet: 'sun',
                label: 'Extraversion',
                icon: '🌟',
                color: '#f97316',
                high: 'Energized by social interaction. You naturally command attention and radiate presence.',
                low: 'Deeply introspective. You recharge in solitude and think before speaking.'
            },
            agreeableness: {
                planet: 'venus',
                label: 'Agreeableness',
                icon: '💕',
                color: '#ec4899',
                high: 'Warm, empathetic, and cooperative. You naturally seek harmony with others.',
                low: 'Direct, assertive, and competitive. You prioritize truth over tact.'
            },
            neuroticism: {
                planet: 'moon',
                label: 'Emotional Sensitivity',
                icon: '🌊',
                color: '#64b5f6',
                high: 'Deeply emotional and reactive. Your inner world is rich and turbulent.',
                low: 'Calm and emotionally stable. Stress rolls off you without lasting impact.'
            }
        };

        // Shadow archetypes by planet and house
        this.shadowArchetypes = {
            saturn: { name: 'The Inner Critic', symbol: '⚫', desc: 'Deeply internalized shame, fear of failure, and self-sabotage. Saturn\'s shadow creates perfectionism and harsh self-judgment.' },
            mars: { name: 'The Warrior Shadow', symbol: '🔥', desc: 'Suppressed anger that erupts as aggression or turns inward as self-destruction. Fear of powerlessness.' },
            rahu: { name: 'The Obsessive', symbol: '🌀', desc: 'Endless craving, compulsive behavior, and identity confusion. The shadow of never feeling enough.' },
            ketu: { name: 'The Abandoner', symbol: '🌑', desc: 'Disconnection, dissociation, and sudden withdrawal. Fear of attachment born from past-life wounds.' },
            moon: { name: 'The Wounded Child', symbol: '🌙', desc: 'Unresolved emotional wounds from childhood. Excessive need for validation and fear of abandonment.' },
            sun: { name: 'The Ego Tyrant', symbol: '☀️', desc: 'Inflated self-importance as a defense mechanism against deep insecurity. Inability to receive criticism.' }
        };

        // Healing paths by planet/house
        this.healingPaths = {
            rahu: 'Meditation, grounding practices, and boundaries. Learn to distinguish genuine needs from compulsive desires.',
            ketu: 'Past-life regression work, spiritual practices, and reconnection to purpose. Avoid isolation.',
            saturn: 'Compassionate self-compassion practices, therapy for inner critic. Embrace imperfection.',
            mars: 'Physical exercise, martial arts, breathwork. Channel anger into creative or physical outlets.',
            moon: 'Inner child healing, journaling, emotional somatic work. Build self-soothing capacity.',
            sun: 'Humility practices, service to others, authentic expression without validation-seeking.'
        };
    }

    loadData() {
        const raw = localStorage.getItem('astropsycho_assessment');
        if (!raw) return false;
        try {
            const stored = JSON.parse(raw);
            const bd = stored.birthDetails;
            this.userData = {
                birthDate: bd.birthDate, birthTime: bd.birthTime,
                birthPlace: bd.birthPlace || 'Unknown',
                latitude: parseFloat(bd.latitude) || 28.61,
                longitude: parseFloat(bd.longitude) || 77.20,
                timezone: parseFloat(bd.timezone) || 5.5,
                fullName: bd.fullName || 'User',
                gender: bd.gender || 'Unknown',
                responses: stored.responses || {}
            };
            this.birthChart = this.astrologyEngine.calculateBirthChart(this.userData);
            return true;
        } catch (e) { console.error('Report load error:', e); return false; }
    }

    // Big 5 Personality from Shadbala + planet positions
    generateBig5() {
        const { shadbala, planets, ascendant } = this.birthChart;
        const getStrength = (planet) => {
            const s = shadbala?.[planet];
            if (!s) return 50;
            return Math.min(100, Math.round((s.totalRupas / s.requiredStrength) * 50));
        };

        const moonPos = planets.moon;
        const sunPos = planets.sun;
        const elongation = (moonPos - sunPos + 360) % 360;
        const isWaxing = elongation < 180;
        const moonBonus = isWaxing ? 15 : 0;

        const mercuryHouse = this.astrologyEngine.getHouseNumber(planets.mercury, ascendant);
        const openness = Math.min(100, getStrength('mercury') + (mercuryHouse === 1 || mercuryHouse === 9 ? 20 : 0));

        const saturnHouse = this.astrologyEngine.getHouseNumber(planets.saturn, ascendant);
        const conscientiousness = Math.min(100, getStrength('saturn') + ([1, 10].includes(saturnHouse) ? 20 : 0));

        const sunHouse = this.astrologyEngine.getHouseNumber(planets.sun, ascendant);
        const extraversion = Math.min(100, getStrength('sun') + ([1, 5, 10].includes(sunHouse) ? 20 : 0));

        const venusHouse = this.astrologyEngine.getHouseNumber(planets.venus, ascendant);
        const agreeableness = Math.min(100, getStrength('venus') + ([1, 7, 11].includes(venusHouse) ? 15 : 0));

        const moonSign = Math.floor(planets.moon / 30);
        const neuroticism = Math.min(100, getStrength('moon') + moonBonus + (moonSign === 3 ? 20 : moonSign === 7 ? -10 : 0));

        return [
            { ...this.big5Map.openness, score: openness },
            { ...this.big5Map.conscientiousness, score: conscientiousness },
            { ...this.big5Map.extraversion, score: extraversion },
            { ...this.big5Map.agreeableness, score: agreeableness },
            { ...this.big5Map.neuroticism, score: neuroticism }
        ];
    }

    // Shadow Self — malefics in challenging houses
    analyzeShadow() {
        const { planets, ascendant } = this.birthChart;
        const malefics = ['saturn', 'mars', 'rahu', 'ketu', 'sun'];
        const challengeHouses = [6, 8, 12, 2];
        const shadows = [];

        malefics.forEach(planet => {
            const house = this.astrologyEngine.getHouseNumber(planets[planet], ascendant);
            const archetype = this.shadowArchetypes[planet];
            if (archetype && (challengeHouses.includes(house) || [6, 8, 12].includes(house))) {
                shadows.push({ planet, house, ...archetype });
            }
        });

        const consciousArchetypes = {
            jupiter: 'A profound natural wisdom, optimism, and ability to guide others. Your spiritual philosophy is a source of strength.',
            venus: 'An innate gift for creating beauty, harmony, and deep connections. You attract grace through diplomacy.',
            mercury: 'Brilliant adaptability and a sharp intellect. You possess the gift of translating complex ideas into clear action.',
            moon: 'Deep emotional intelligence and empathy. Your nurturing presence heals both yourself and those around you.'
        };

        // Benefic strengths (conscious self)
        const conscious = [];
        const benefics = ['jupiter', 'venus', 'mercury', 'moon'];
        benefics.forEach(planet => {
            const house = this.astrologyEngine.getHouseNumber(planets[planet], ascendant);
            if ([1, 5, 9, 10, 11, 7].includes(house)) {
                const sign = this.signs[Math.floor(planets[planet] / 30)];
                const desc = consciousArchetypes[planet] || 'A natural gift that flows with grace in your life.';
                conscious.push({ planet, house, sign, desc });
            }
        });

        return { shadows, conscious };
    }

    // Atmakaraka — planet with highest degree in sign
    getAtmakaraka() {
        const { planets } = this.birthChart;
        const relevant = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
        let maxDeg = -1, ak = 'sun';
        relevant.forEach(p => {
            const deg = planets[p] % 30;
            if (deg > maxDeg) { maxDeg = deg; ak = p; }
        });

        const akMeanings = {
            sun: { mission: 'Soul of Leadership & Authority', path: 'You are here to lead, to shine, to govern. Your dharma involves guiding others through your authentic self-expression and courage.', mantra: 'Aditya Hridayam' },
            moon: { mission: 'Soul of Nurturing & Empathy', path: 'Your soul purpose is to heal, nurture, and sensitize the world. Emotional intelligence is your greatest spiritual gift.', mantra: 'Chandra Kavacham' },
            mars: { mission: 'Soul of Courage & Action', path: 'You came to this world to act decisively, protect the vulnerable, and fight for righteousness. Action is your meditation.', mantra: 'Mangala Stotra' },
            mercury: { mission: 'Soul of Wisdom & Communication', path: 'Your dharma is to learn, teach, and bridge minds. You are a messenger between worlds — use your intellect in service.', mantra: 'Budha Ashtakam' },
            jupiter: { mission: 'Soul of Wisdom & Expansion', path: 'The great teacher — your dharma is to expand consciousness, share wisdom, and be a lighthouse of hope and knowledge.', mantra: 'Guru Stotram' },
            venus: { mission: 'Soul of Love & Harmony', path: 'You came to beautify the world, cultivate deep love, and create art that transforms. Your relationships are your greatest spiritual teachers.', mantra: 'Shukra Kavacham' },
            saturn: { mission: 'Soul of Discipline & Liberation', path: 'The karmic master — your dharma is to teach through patient endurance. You came to master the material world and then transcend it.', mantra: 'Shani Chalisa' },
            rahu: { mission: 'Soul of Innovation & Expansion', path: 'Rahu as Atmakaraka points to a soul longing for new experiences and worldly mastery. Your path involves facing your deepest obsessions.', mantra: 'Rahu Kavacham' },
            ketu: { mission: 'Soul of Liberation & Moksha', path: 'Your soul is ancient and weary of worldly cycles. Your dharma is spiritual liberation — this is your final or near-final incarnation.', mantra: 'Ketu Stotram' }
        };

        return { planet: ak, degree: maxDeg.toFixed(2), ...akMeanings[ak] };
    }

    // Psychological wounds from 12th house and Rahu/Ketu
    analyzeWounds() {
        const { planets, ascendant } = this.birthChart;
        const wounds = [];

        // 12th house planets
        const twelfthHousePlanets = Object.keys(planets).filter(p => {
            if (p === 'velocities') return false;
            return this.astrologyEngine.getHouseNumber(planets[p], ascendant) === 12;
        });
        twelfthHousePlanets.forEach(p => {
            const healing = this.healingPaths[p] || 'Spiritual practices and self-reflection.';
            wounds.push({
                title: `${this.planetEmoji[p]} ${this.capitalize(p)} in the 12th House`,
                desc: `The 12th house governs the subconscious. ${this.capitalize(p)} here creates patterns of ${this.get12thWoundDesc(p)}`,
                healing
            });
        });

        // Rahu
        const rahuHouse = this.astrologyEngine.getHouseNumber(planets.rahu, ascendant);
        const rahuSign = this.signs[Math.floor(planets.rahu / 30)];
        wounds.push({
            title: `☊ Rahu in ${rahuSign} (House ${rahuHouse}) — The Obsession Zone`,
            desc: `Rahu shows where you have an insatiable hunger. In House ${rahuHouse}, you obsess over ${this.getRahuObsession(rahuHouse)}. This can manifest as anxiety, compulsion, or never feeling "enough" in this life area.`,
            healing: this.healingPaths.rahu
        });

        // Ketu
        const ketuHouse = this.astrologyEngine.getHouseNumber(planets.ketu, ascendant);
        const ketuSign = this.signs[Math.floor(planets.ketu / 30)];
        wounds.push({
            title: `☋ Ketu in ${ketuSign} (House ${ketuHouse}) — Past Life Gift & Detachment`,
            desc: `Ketu shows what you've already mastered in past lives and may now abandon. In House ${ketuHouse}, you have deep karmic wisdom around ${this.getKetuGift(ketuHouse)}, but may feel disconnected or disinterested in it this lifetime.`,
            healing: this.healingPaths.ketu
        });

        return wounds;
    }

    get12thWoundDesc(planet) {
        const map = { sun: 'hidden identity and suppressed ego', moon: 'secret emotions and unconscious fears', mars: 'hidden anger and suppressed desires', jupiter: 'unexpressed wisdom and spiritual longing', venus: 'hidden romantic longings and aesthetic wounds', saturn: 'deep shame, guilt, and karmic isolation', mercury: 'mental loops, secret anxieties, and overthinking' };
        return map[planet] || 'subconscious patterns that emerge in dreams and isolation';
    }

    getRahuObsession(house) {
        const map = { 1: 'identity and appearance — never feeling "real" enough', 2: 'wealth and family — hoarding or compulsive spending', 3: 'skills and communication — performing for validation', 4: 'home security — never feeling settled', 5: 'love and creativity — romantic obsession', 6: 'health and service — hypochondria or workaholism', 7: 'relationships — needing a partner to feel whole', 8: 'hidden knowledge and power — occult obsessions', 9: 'truth and philosophy — fanaticism', 10: 'career and status — never feeling successful enough', 11: 'social validation — collecting relationships without depth', 12: 'spirituality and escape — addiction or fantasy' };
        return map[house] || 'this life area';
    }

    getKetuGift(house) {
        const map = { 1: 'self-identity and personal power', 2: 'wealth accumulation and family karma', 3: 'communication and performance', 4: 'emotional security and homeland', 5: 'creativity and teaching', 6: 'healing and service', 7: 'partnerships and relationships', 8: 'transformation and hidden knowledge', 9: 'philosophy and long travel', 10: 'career achievement and authority', 11: 'social networking and group dynamics', 12: 'meditation and spiritual isolation' };
        return map[house] || 'this life area';
    }

    capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
}
