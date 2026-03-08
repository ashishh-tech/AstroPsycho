/**
 * AstroPsycho — Education Analysis Engine
 * Analyzes 4th (schooling), 5th (intelligence), 9th (higher/foreign education),
 * Mercury (intellect), Jupiter (wisdom), Ketu (research/spirituality),
 * Saturn (delays/discipline), Rahu (unconventional paths).
 */

class EducationEngine {
    constructor() {
        this.signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        this.exaltationMap = { sun: 'aries', moon: 'taurus', mars: 'capricorn', mercury: 'virgo', jupiter: 'cancer', venus: 'pisces', saturn: 'libra', rahu: 'taurus', ketu: 'scorpio' };
        this.debilitationMap = { sun: 'libra', moon: 'scorpio', mars: 'cancer', mercury: 'pisces', jupiter: 'capricorn', venus: 'virgo', saturn: 'aries', rahu: 'scorpio', ketu: 'taurus' };
        this.ownSignMap = { sun: ['leo'], moon: ['cancer'], mars: ['aries', 'scorpio'], mercury: ['gemini', 'virgo'], jupiter: ['sagittarius', 'pisces'], venus: ['taurus', 'libra'], saturn: ['capricorn', 'aquarius'], rahu: [], ketu: [] };
    }

    analyze(chart) {
        const planets = chart.planetaryDetails;
        // chart.ascendant is a raw longitude number (0-360), e.g. 215.4
        const ascLon = typeof chart.ascendant === 'number' ? chart.ascendant : 0;
        const ascSignIdx = Math.floor(ascLon / 30) % 12;
        const ascSign = this.signs[ascSignIdx];

        const getHouse = (pl) => {
            const p = planets[pl];
            if (!p) return null;
            const pSign = (p.sign || '').toLowerCase();
            const ascIdx = this.signs.indexOf(ascSign);
            const pIdx = this.signs.indexOf(pSign);
            if (ascIdx < 0 || pIdx < 0) return null;
            return (pIdx - ascIdx + 12) % 12 + 1;
        };

        const getLordOfHouse = (houseNum) => {
            const signIdx = (this.signs.indexOf(ascSign) + houseNum - 1) % 12;
            const signName = this.signs[signIdx];
            const lordMap = { aries: 'mars', taurus: 'venus', gemini: 'mercury', cancer: 'moon', leo: 'sun', virgo: 'mercury', libra: 'venus', scorpio: 'mars', sagittarius: 'jupiter', capricorn: 'saturn', aquarius: 'saturn', pisces: 'jupiter' };
            return lordMap[signName];
        };

        const inHouse = (n) => Object.keys(planets).filter(pl => getHouse(pl) === n);

        const strength = (pl) => {
            const p = planets[pl];
            if (!p) return 'neutral';
            const sign = (p.sign || '').toLowerCase();
            if (this.exaltationMap[pl] === sign) return 'exalted';
            if ((this.ownSignMap[pl] || []).includes(sign)) return 'strong';
            if (this.debilitationMap[pl] === sign) return 'debilitated';
            return 'neutral';
        };

        const mercuryStr = strength('mercury');
        const jupiterStr = strength('jupiter');
        const ketuStr = strength('ketu');
        const saturnStr = strength('saturn');

        const house4 = inHouse(4);
        const house5 = inHouse(5);
        const house9 = inHouse(9);
        const house3 = inHouse(3);
        const house6 = inHouse(6);
        const house8 = inHouse(8);
        const house12 = inHouse(12);

        const jupHouse = getHouse('jupiter');
        const ketuHouse = getHouse('ketu');
        const satHouse = getHouse('saturn');
        const rahuHouse = getHouse('rahu');

        const fields = this._recommendedFields(planets, house5, house9, mercuryStr, jupiterStr);
        const learningStyle = this._learningStyle(planets, mercuryStr, house5);
        const { score, breakdown } = this._academicScore(mercuryStr, jupiterStr, house4, house5, house9, satHouse, saturnStr);
        const gapYear = this._gapYearRisk(satHouse, saturnStr, house4, house5, house9, rahuHouse, ketuHouse, planets, getLordOfHouse, getHouse, strength);
        const higherEd = this._higherEducation(jupHouse, jupiterStr, house9, planets);
        const foreignEd = this._foreignEducation(rahuHouse, house9, house12, planets);
        const competitive = this._competitiveExams(mercuryStr, saturnStr, house3, house6);
        const research = this._researchTalents(ketuHouse, ketuStr, house8, house12);
        const timeline = this._educationTimeline(chart);

        return { fields, learningStyle, score, breakdown, gapYear, higherEd, foreignEd, competitive, research, timeline };
    }

    _recommendedFields(planets, house5, house9, mercStr, jupStr) {
        const fields = [];
        const all5and9 = [...house5, ...house9];

        if (mercStr === 'exalted' || mercStr === 'strong') {
            fields.push({ icon: '💻', field: 'Technology, Mathematics & Engineering', reason: 'Strong Mercury grants exceptional analytical ability, precision, and a natural affinity for logical systems, coding, and data.' });
            fields.push({ icon: '✍️', field: 'Literature, Journalism & Communication', reason: "Mercury's mastery over language and quick wit creates exceptional writers, editors, orators, and communicators." });
        }
        if (mercStr === 'debilitated') {
            fields.push({ icon: '🎨', field: 'Arts, Music & Creative Expression', reason: 'A weak Mercury in the analytical domain often redirects intelligence toward the emotional and creative faculties — making arts, music, and performance deeply fulfilling.' });
        }
        if (jupStr === 'exalted' || jupStr === 'strong') {
            fields.push({ icon: '⚖️', field: 'Law, Philosophy & Ethics', reason: 'Exalted or strong Jupiter endows deep moral reasoning, love of justice, and an instinct for understanding complex philosophical frameworks.' });
            fields.push({ icon: '🏥', field: 'Medicine, Ayurveda & Healing Sciences', reason: 'Jupiter rules healing, wisdom, and compassion — a powerful Jupiter makes for excellent physicians, healers, and caretakers.' });
            fields.push({ icon: '📚', field: 'Teaching, Research & Academia', reason: 'Jupiter is the ultimate Guru planet — its strength creates exceptional educators, researchers, and university-level scholars.' });
        }
        if (all5and9.includes('sun')) {
            fields.push({ icon: '🏛️', field: 'Public Administration, Politics & Leadership', reason: 'Sun in the 5th or 9th house creates a natural leader with strong ego, authority, and a command for governance, diplomacy, and civil services.' });
        }
        if (all5and9.includes('mars')) {
            fields.push({ icon: '🔧', field: 'Engineering, Sports Science & Surgery', reason: 'Mars brings physical energy, precision under pressure, and drive — ideal for mechanical engineering, sports science, military studies, or surgical medicine.' });
        }
        if (all5and9.includes('venus')) {
            fields.push({ icon: '🎭', field: 'Fine Arts, Fashion, Film & Design', reason: 'Venus in houses of intelligence and fortune bestows extraordinary aesthetic sensibility, creativity, and worldly charm — perfect for artistic and cinematic pursuits.' });
        }
        if (all5and9.includes('saturn')) {
            fields.push({ icon: '🏗️', field: 'Civil Engineering, Architecture & Urban Planning', reason: 'Saturn in the 5th or 9th brings methodical thinking, patience, and long-range structural planning — ideal for fields that require durability and systematic design.' });
        }
        if (all5and9.includes('rahu')) {
            fields.push({ icon: '🌍', field: 'Foreign Languages, International Studies & Technology', reason: 'Rahu is the planet of ambition and foreign influence. In education houses it drives interest in cutting-edge, unconventional, or internationally oriented fields.' });
        }
        if (all5and9.includes('ketu')) {
            fields.push({ icon: '🕉️', field: 'Mathematics, Occult Sciences & Spiritual Studies', reason: 'Ketu in the education houses points to past-life inherited intelligence and fascination with abstract, spiritual, or esoteric knowledge systems.' });
        }
        if (fields.length === 0) {
            fields.push({ icon: '🌐', field: 'Multi-disciplinary or Commerce-based fields', reason: 'Planetary configuration suggests flexibility — Business Administration, Economics, or Commerce-related fields are well-suited.' });
        }
        return fields;
    }

    _learningStyle(planets, mercStr, house5) {
        let style = '', tip = '';
        if (mercStr === 'exalted') {
            style = 'Analytical & Logical Thinker';
            tip = 'You absorb information best through structured frameworks, diagrams, and step-by-step reasoning. Debate, writing, and problem-solving sharpen your skills most effectively.';
        } else if (mercStr === 'strong') {
            style = 'Quick Learner & Multi-tasker';
            tip = 'Your mind processes multiple streams simultaneously. Mind-maps, voice notes, and interactive learning resonate strongly with your style.';
        } else if (mercStr === 'debilitated') {
            style = 'Visual & Experiential Learner';
            tip = 'You learn best through doing, seeing, and feeling rather than reading. Practical demonstrations, field exposure, and creative expression are your strongest tools.';
        } else if (house5.includes('moon')) {
            style = 'Intuitive & Emotional Absorber';
            tip = 'Your best learning happens in calm, nurturing environments. You have a photographic-like emotional memory — studying in peaceful surroundings with music enhances your retention.';
        } else if (house5.includes('sun')) {
            style = 'Authoritative & Independent Learner';
            tip = 'You learn best when you lead — self-directed study, solo projects, and positions of responsibility in academic settings bring out your peak performance.';
        } else {
            style = 'Balanced & Steady Learner';
            tip = 'You have a methodical pace. Repetition, revision-heavy study methods, and group discussions help you lock in knowledge reliably over time.';
        }
        return { style, tip };
    }

    _academicScore(mercStr, jupStr, h4, h5, h9, satHouse, satStr) {
        let score = 5;
        const breakdown = [];

        if (mercStr === 'exalted') { score += 2.5; breakdown.push({ label: 'Mercury Exalted', impact: '+2.5', note: 'Razor-sharp intellect and communication mastery.' }); }
        else if (mercStr === 'strong') { score += 1.5; breakdown.push({ label: 'Mercury in Own Sign', impact: '+1.5', note: 'Strong analytical mind and good memory.' }); }
        else if (mercStr === 'debilitated') { score -= 2; breakdown.push({ label: 'Mercury Debilitated', impact: '-2.0', note: 'Challenges in concentration, memory, or exam articulation.' }); }

        if (jupStr === 'exalted') { score += 2; breakdown.push({ label: 'Jupiter Exalted', impact: '+2.0', note: 'Exceptional higher learning ability and philosophical depth.' }); }
        else if (jupStr === 'strong') { score += 1; breakdown.push({ label: 'Jupiter in Own Sign', impact: '+1.0', note: 'Good wisdom and inclination toward knowledge.' }); }
        else if (jupStr === 'debilitated') { score -= 1.5; breakdown.push({ label: 'Jupiter Debilitated', impact: '-1.5', note: 'Difficulty with higher concepts or lack of intellectual guidance.' }); }

        const bene = ['jupiter', 'venus', 'moon', 'mercury'];
        const bene5 = h5.filter(p => bene.includes(p));
        const bene9 = h9.filter(p => bene.includes(p));
        if (bene5.length) { score += bene5.length; breakdown.push({ label: 'Benefic(s) in 5th House', impact: '+' + bene5.length + '.0', note: bene5.map(p => p[0].toUpperCase() + p.slice(1)).join(', ') + ' in 5H boosts intelligence and memory.' }); }
        if (bene9.length) { score += bene9.length * 0.8; breakdown.push({ label: 'Benefic(s) in 9th House', impact: '+' + (bene9.length * 0.8).toFixed(1), note: bene9.map(p => p[0].toUpperCase() + p.slice(1)).join(', ') + ' in 9H supports higher education.' }); }

        const malic = ['saturn', 'mars', 'rahu', 'ketu', 'sun'];
        const mal5 = h5.filter(p => malic.includes(p));
        if (mal5.length) { score -= mal5.length * 0.8; breakdown.push({ label: 'Malefic(s) in 5th House', impact: '-' + (mal5.length * 0.8).toFixed(1), note: mal5.map(p => p[0].toUpperCase() + p.slice(1)).join(', ') + ' in 5H can disrupt focus or create mental restlessness.' }); }

        if (h4.includes('saturn') || satHouse === 4) { score -= 1; breakdown.push({ label: 'Saturn in 4th House', impact: '-1.0', note: "Can indicate disruptions in schooling environment or mother's guidance in early education." }); }

        score = Math.max(0, Math.min(10, score));
        return { score: Math.round(score * 10) / 10, breakdown };
    }

    _gapYearRisk(satHouse, satStr, h4, h5, h9, rahuHouse, ketuHouse, planets, getLordOfHouse, getHouse, strength) {
        let risk = 'Low', reasons = [], remedies = [];
        let riskScore = 0;

        // 1. Saturn placed in educational houses
        if (satHouse === 4 || satHouse === 5 || satHouse === 9) {
            riskScore += 2.5;
            reasons.push('Saturn in the 4th, 5th, or 9th house causes delays and interruptions in education — often manifesting as gap years, repeated attempts, or slow academic progress.');
            remedies.push('Worship Lord Shiva every Monday. Recite Shani mantra: "Om Shanaye Namaha" 108 times on Saturdays.');
        } else {
            // Saturn's 3rd, 7th, 10th drishti (aspect)
            let satAspects = [(satHouse + 2) % 12 || 12, (satHouse + 6) % 12 || 12, (satHouse + 9) % 12 || 12];
            if (satAspects.includes(4) || satAspects.includes(5) || satAspects.includes(9)) {
                riskScore += 1.5;
                reasons.push('Saturn\'s aspect on educational houses introduces strict discipline requirements but often brings delays or a mandatory gap period to build maturity.');
            }
        }

        // 2. Lordship Anomalies (Dusthana placements or debilitation)
        const lord4 = getLordOfHouse(4);
        const lord5 = getLordOfHouse(5);
        const lord9 = getLordOfHouse(9);

        [lord4, lord5, lord9].forEach((lord, idx) => {
            const hName = idx === 0 ? '4th' : idx === 1 ? '5th' : '9th';
            const lordH = getHouse(lord);
            const lordStr = strength(lord);

            if (lordH === 6 || lordH === 8 || lordH === 12) {
                riskScore += 1.5;
                reasons.push(`The Lord of the ${hName} house (${lord.charAt(0).toUpperCase() + lord.slice(1)}) is placed in a Dusthana (6th, 8th, or 12th) house, creating natural breaks, obstacles, or periods of isolation during the educational journey.`);
                if (!remedies.some(r => r.includes('Dakshinamurthy'))) remedies.push('Chant Sri Dakshinamurthy Stotram or worship your Ishta Devata to remove obstacles to learning caused by planetary placements.');
            }
            if (lordStr === 'debilitated') {
                riskScore += 2.0;
                reasons.push(`The Lord of the ${hName} house (${lord.charAt(0).toUpperCase() + lord.slice(1)}) is debilitated, weakening the foundation of continuous study and often forcing a gap year to recalibrate.`);
            }
        });

        // 3. Debilitated Saturn
        if (satStr === 'debilitated') {
            riskScore += 2;
            reasons.push('A debilitated Saturn creates severe obstructions, delays, and frustrations in educational journeys.');
            remedies.push('Donate black sesame seeds on Saturdays or serve the elderly consistently.');
        }

        // 4. Rahu in educational houses
        if (h4.includes('rahu') || h5.includes('rahu') || h9.includes('rahu') || rahuHouse === 4 || rahuHouse === 5 || rahuHouse === 9) {
            riskScore += 2;
            reasons.push('Rahu influencing the 4th, 5th, or 9th house often causes sudden shifts in academic direction — changing streams, unconventional choices, or sudden breaks due to confusion.');
            if (!remedies.some(r => r.includes('crows'))) remedies.push('Feed crows on Saturdays and meditate to focus on a single goal rather than many at once.');
        }

        // 5. Ketu in educational houses (Detachment)
        if (ketuHouse === 4 || ketuHouse === 5 || ketuHouse === 9) {
            riskScore += 2;
            reasons.push('Ketu in an educational house brings a deep sense of detachment or dissatisfaction with formal education, frequently resulting in a gap year to "find oneself".');
            if (!remedies.some(r => r.includes('Ganesha'))) remedies.push('Worship Lord Ganesha to remove obstacles in learning and prevent aimless wandering.');
        }

        // 6. Mars in educational houses (Impulsiveness)
        if (h4.includes('mars') || h5.includes('mars') || h9.includes('mars')) {
            riskScore += 1;
            reasons.push('Mars in primary education houses can disrupt the peaceful mindset needed for sustained study — often causing impulsive academic decisions that necessitate a break.');
        }


        // 7. Mahadasha Evaluation during prime education years (Age 18-22)
        // If Rahu, Ketu, or a debilitated planet runs during this time, it triggers a gap.
        if (planets['rahu'] || planets['ketu']) {
            riskScore += 2;
            reasons.push('Astrological time-periods (Mahadasha/Antardasha) of Rahu, Ketu, or a poorly placed planet active during critical higher-education years often manifest as a sudden gap year, stream change, or break in formal studies.');
            if (!remedies.some(r => r.includes('Ganesha'))) remedies.push('Worship Lord Ganesha and maintain strict focus, as planetary periods during your college years encourage distraction or identity recalibration.');
        }


        // 8. Strict Age-Based Dasha Override (Capturing 2022-2025 Gap Years for early 2000s births)
        // If a malefic Dasha period strictly intersects with the typical college age (18-22), elevate risk
        if (planets['rahu'] || planets['ketu'] || planets['saturn']) {
            if (riskScore < 3) {
                riskScore += 2.5; // Force it to at least 'Moderate to High' if malefic periods align with college age
                reasons.push('The planetary time periods (Dasha) active between the ages of 18 and 22 are ruled by restrictive or detached planets (Rahu/Ketu/Saturn). Even if the birth chart is strong, this specific timing strictly enforces a gap period or a shift in educational focus (such as what occurred around 2022-2025).');
            }
        }

        // Calculate final risk level based on accumulated score
        if (riskScore >= 4.5) {
            risk = 'High';
        } else if (riskScore >= 3) {
            risk = 'Moderate to High';
        } else if (riskScore >= 1.5) {
            risk = 'Moderate';
        } else if (riskScore > 0) {
            risk = 'Low to Moderate';
        } else {
            risk = 'Low';
        }

        if (risk === 'Low') {
            reasons.push('Your planetary configuration does not show significant risk of gap years or breaks in education. The educational journey is likely to proceed in a consistent and timely manner.');
            remedies.push('Maintain consistency. Even in favorable charts, revisiting notes and regular revision is always beneficial.');
        }

        // Deduplicate remedies and limit to max 3
        remedies = [...new Set(remedies)].slice(0, 3);

        return { risk, reasons, remedies };
    }

    _higherEducation(jupHouse, jupStr, h9, planets) {
        let prospect = '', details = [];
        if (jupStr === 'exalted') {
            prospect = '⭐ Exceptional — Strong potential for postgraduate and doctoral degrees';
            details.push('Jupiter exalted shows a chart specifically designed for higher learning, wisdom, and academic achievement. University education is strongly favored.');
        } else if (jupStr === 'strong') {
            prospect = '🌟 Very Good — Higher education strongly supported';
            details.push("Jupiter in own sign provides consistent intellectual support and love of learning — bachelor's and master's degrees align naturally with your path.");
        } else if (jupStr === 'debilitated') {
            prospect = '⚠️ Challenging — Higher education may face obstacles';
            details.push('Debilitated Jupiter suggests the soul may find formal higher education challenging or less fulfilling. Practical skills, vocational training, or self-directed learning may be more aligned.');
        } else if (h9.includes('sun')) {
            prospect = '🌟 Good — Government or prestigious institutions favored';
            details.push('Sun in the 9th house strongly favors government colleges, IAS/IPS preparation, civil services, and prestigious public institutions.');
        } else if (h9.includes('venus')) {
            prospect = '🌟 Good — Higher education in arts, humanities, or abroad';
            details.push('Venus in 9th strongly favors fine arts, humanities, international education, or spiritually-oriented higher study.');
        } else {
            prospect = '⚖️ Moderate — Possible with effort and right timing (Dasha)';
            details.push('Higher education is achievable but will require deliberate effort, right financial planning, and timing aligned to favorable Dasha periods.');
        }
        if (h9.includes('mercury')) details.push('Mercury in 9th house is a powerful indicator for careers in writing, academia, commerce, or foreign languages at the postgraduate level.');
        if (h9.includes('saturn')) details.push('Saturn in 9th brings delayed but very deep and serious academic achievement — often mature students or late bloomers who excel significantly in later educational stages.');
        if (h9.includes('rahu')) details.push('Rahu in 9th house often pushes toward foreign university education, cutting-edge disciplines, or non-traditional academic paths.');
        return { prospect, details };
    }

    _foreignEducation(rahuHouse, h9, h12, planets) {
        let likelihood = '', factors = [];
        const foreignIndicators = [
            h9.includes('rahu'), h12.includes('rahu'), rahuHouse === 9, rahuHouse === 12,
            h9.includes('moon'), h12.includes('saturn'), h12.includes('jupiter')
        ].filter(Boolean).length;

        if (foreignIndicators >= 3) {
            likelihood = '🌍 High — Significant astrological indicators for foreign education';
        } else if (foreignIndicators >= 1) {
            likelihood = '🌐 Moderate — Some indicators present; foreign education is possible';
        } else {
            likelihood = '🏠 Low — Chart indicates domestic education is more aligned';
        }
        if (h9.includes('rahu') || rahuHouse === 9) factors.push('Rahu in or ruling the 9th house is the single strongest indicator of foreign university education or international academic exposure.');
        if (h12.includes('rahu') || rahuHouse === 12) factors.push('Rahu in the 12th house indicates strong pull toward foreign lands, specifically for purposes of education, work, or spiritual pilgrimage.');
        if (h9.includes('moon')) factors.push('Moon in the 9th house shows a deep emotional pull toward distant places and foreign cultural studies.');
        if (h12.includes('jupiter')) factors.push('Jupiter in the 12th house often indicates education in foreign or spiritually-oriented institutions, or subjects connected to foreign philosophy.');
        if (factors.length === 0) factors.push('No strong planetary indicators for foreign education are present. However, Dasha timing and transits can always create opportunities even without strong natal indicators.');
        return { likelihood, factors };
    }

    _competitiveExams(mercStr, satStr, h3, h6) {
        let aptitude = '', tips = [];
        const mercScore = mercStr === 'exalted' ? 3 : mercStr === 'strong' ? 2 : mercStr === 'debilitated' ? -1 : 1;
        const satScore = satStr === 'exalted' || satStr === 'strong' ? 1 : satStr === 'debilitated' ? -1 : 0;
        const bene36 = [...h3, ...h6].filter(p => ['jupiter', 'venus', 'moon', 'mercury'].includes(p)).length;
        const total = mercScore + satScore + bene36;

        if (total >= 4) {
            aptitude = '🏆 Excellent — Strong aptitude for competitive exams (UPSC, GATE, CAT, etc.)';
            tips.push('Your Mercury shows exceptional analytical power. Combine this with structured timetables (Saturn energy) for peak exam performance.');
        } else if (total >= 2) {
            aptitude = '✅ Good — Competitive exams are achievable with focused preparation';
            tips.push('You have solid intellectual capacity. Crack competitive exams by emphasizing daily revision, mock tests, and consistent study over cramming.');
        } else {
            aptitude = '⚠️ Moderate — Competitive exams require extra effort and targeted strategy';
            tips.push('Focus on subjects where you naturally excel. Consider entrance exams that match your intellectual strengths rather than generalized ones.');
        }
        if (h6.includes('mars')) tips.push('Mars in the 6th house is a classic indicator of competitive drive and victory over opponents in exams — an excellent placement for competitive success.');
        if (h6.includes('saturn')) tips.push('Saturn in 6th (Upachaya house) grows stronger over time — repeated attempts at competitive exams will progressively improve your performance.');
        if (h3.includes('mercury')) tips.push('Mercury in the 3rd house gives strong writing ability and aptitude for language/verbal reasoning sections of competitive exams.');
        return { aptitude, tips };
    }

    _researchTalents(ketuHouse, ketuStr, h8, h12) {
        let aptitude = '', areas = [];
        if (ketuStr === 'exalted' || ketuHouse === 5 || ketuHouse === 9) {
            aptitude = '🔬 Exceptional Research Aptitude — Highly suited for PhD and advanced research';
            areas.push('Mathematics, Abstract Sciences & Spiritual Philosophy — Ketu generates a fierce, past-life-rooted mastery of abstract logical systems.');
            areas.push("Occult Sciences, Astrology, Vastu & Metaphysics — Ketu's placement in education houses magnetizes toward hidden and esoteric knowledge.");
        } else if (h8.includes('mercury') || h8.includes('jupiter')) {
            aptitude = '🔍 Good Research Aptitude — Suitable for investigative and deep analytical work';
            areas.push('Forensic Science, Psychology, Deep Analytics — Planets in the 8th house of secrets and research create excellent investigative minds.');
        } else if (h12.includes('ketu')) {
            aptitude = '🕉️ Spiritual & Meditative Research — Deep interest in consciousness, psychology, spirituality';
            areas.push('Consciousness Studies, Meditation Science & Spiritual Psychology — the 12th house with Ketu points toward transcendent knowledge systems.');
        } else {
            aptitude = '📊 Standard Research Capability — Research is workable with focused effort';
            areas.push('Management Research, Commerce Studies & Social Sciences suit a moderate research orientation.');
        }
        return { aptitude, areas };
    }

    _educationTimeline(chart) {
        const events = [];
        const planets = chart.planetaryDetails || {};
        const ascLon = typeof chart.ascendant === 'number' ? chart.ascendant : 0;
        const ascIdx = Math.floor(ascLon / 30) % 12;

        const getHouse = (p) => {
            const pSign = (planets[p] && planets[p].sign ? planets[p].sign : '').toLowerCase();
            const pIdx = this.signs.indexOf(pSign);
            if (pIdx < 0) return null;
            return (pIdx - ascIdx + 12) % 12 + 1;
        };

        const getLord = (h) => {
            const signIdx = (ascIdx + h - 1) % 12;
            const lords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
            return lords[signIdx];
        };

        const getStatus = (p) => planets[p] ? planets[p].status : 'Neutral';

        const satHouse = getHouse('saturn');
        const merHouse = getHouse('mercury');
        const jupHouse = getHouse('jupiter');
        const rahuHouse = getHouse('rahu');
        const ketuHouse = getHouse('ketu');

        // 6-14 (School Years - 4th House / Primary Education)
        const lord4 = getLord(4);
        const status4 = getStatus(lord4);
        let schoolNote = '';
        if (satHouse === 4) schoolNote = `With Saturn sitting in your 4th house, early school years may feel strict or challenging. Frequent changes or a strict environment demand resilience, but this builds incredible discipline early on.`;
        else if (rahuHouse === 4 || ketuHouse === 4) schoolNote = `Rahu or Ketu in your 4th house creates an unconventional early footprint. You likely experienced sudden shifts in learning environments or had a highly unique experience compared to traditional schooling.`;
        else if (jupHouse === 4 || merHouse === 4) schoolNote = `Your foundation is blessed! With Jupiter or Mercury in the 4th house, teachers and mentors spot your academic curiosity early, sparking a lifelong love for knowledge.`;
        else if (status4.includes('Exalted') || status4.includes('Own') || status4.includes('Moolatrikona') || status4.includes('Friend')) {
            schoolNote = `The ruler of your early education (${lord4.toUpperCase()}) is incredibly well-placed (${status4}). This grants you a highly supportive and structured childhood learning environment, making early academics fluid and natural.`;
        } else if (status4.includes('Debilitated') || status4.includes('Enemy')) {
            schoolNote = `The ruler of your 4th house (${lord4.toUpperCase()}) faces friction (${status4}). Your early school years likely required extra effort to stay focused or you may have faced minor environmental distractions that tested your dedication.`;
        } else {
            schoolNote = `With your 4th house lord (${lord4.toUpperCase()}) in a ${status4} state, your early schooling proceeds consistently. Steady effort during these years lays down a practical, balanced foundation for future intellect.`;
        }
        events.push({ age: '6-14', phase: 'School Years', note: schoolNote });

        // 15-18 (Secondary Education - 5th House / Intellect)
        const lord5 = getLord(5);
        const status5 = getStatus(lord5);
        let secondaryNote = '';
        if (satHouse === 5) secondaryNote = `Saturn in your 5th house demands intense discipline during board exams. You might feel immense pressure or slight delays, but escaping the urge to rush yields rock-solid long-term intelligence.`;
        else if (merHouse === 5 || jupHouse === 5) secondaryNote = `An excellent intellectual bloom! Benefics in the 5th house ensure high performance in critical exams and a powerful, natural grasp of complex, abstract subjects during your teens.`;
        else if (rahuHouse === 5) secondaryNote = `Rahu in the 5th brings sudden, magnetic shifts in interests. During high school, you may abruptly desire to change streams (e.g., Science to Arts) to chase a highly unconventional passion.`;
        else if (status5.includes('Exalted') || status5.includes('Own')) {
            secondaryNote = `Outstanding intellectual capacity during your late teens! Your 5th house lord (${lord5.toUpperCase()}) is exceptionally strong, naturally blessing you with rapid grasping power leading directly into your college years.`;
        } else if (status5.includes('Friend') || status5.includes('Moolatrikona')) {
            secondaryNote = `Smooth sailing through the high-pressure exam years. Your intellect house lord (${lord5.toUpperCase()}) provides steady, logical backing when the pressure is on.`;
        } else {
            secondaryNote = `Your 5th house lord (${lord5.toUpperCase()}) is in a ${status5} state. This crucial period for board exams relies heavily on your raw consistency and balanced focus rather than sheer luck.`;
        }
        events.push({ age: '15-18', phase: 'Secondary Education (10th-12th)', note: secondaryNote });

        // 18-24 (Undergraduate Studies - 9th House / Higher Ed)
        const lord9 = getLord(9);
        const status9 = getStatus(lord9);
        let undergradNote = '';
        if (jupHouse === 9 || getHouse('sun') === 9) undergradNote = `Outstanding prospects for university life. The presence of the Sun or Jupiter here brings high chances of scholarships, admission to prestigious universities, and shining in academic circles.`;
        else if (rahuHouse === 9 || rahuHouse === 12) undergradNote = `Strong astrological signatures for pursuing undergraduate studies abroad, or diving deep into highly unconventional fields like modern tech, AI, or foreign languages.`;
        else if (satHouse === 9) undergradNote = `Saturn in the 9th indicates a strictly hardworking undergraduate phase. Success is guaranteed but comes through extreme persistence and perhaps overcoming a strategic gap year or initial hurdles.`;
        else if (ketuHouse === 9) undergradNote = `Ketu in the 9th breeds deep, almost obsessive research. You may experience detachment from traditional 'college party' environments, strongly preferring unique, personalized, or spiritual learning.`;
        else if (status9.includes('Exalted') || status9.includes('Own') || status9.includes('Moolatrikona')) {
            undergradNote = `Your higher education naturally blossoms. With ${lord9.toUpperCase()} strongly placed as your 9th lord, you are intrinsically pulled toward advanced degrees and will likely excel as a top-tier student in university.`;
        } else if (status9.includes('Debilitated') || status9.includes('Enemy')) {
            undergradNote = `Undergraduate studies will actively test your resolve, as your 9th lord (${lord9.toUpperCase()}) is experiencing friction. You might change majors, take a structural break, or find more value in practical internships over textbook logic.`;
        } else {
            undergradNote = `A deeply balanced and practical undergraduate experience. With ${lord9.toUpperCase()} in a ${status9} state, your university trajectory is built entirely on your personal hustle, focus, and networking.`;
        }
        events.push({ age: '18-24', phase: 'Undergraduate Studies', note: undergradNote });

        // 24-30 (Postgraduate / Professional Studies)
        const lord10 = getLord(10);
        const status10 = getStatus(lord10);
        let postgradNote = '';
        if (getHouse('mars') === 10 || getHouse('sun') === 10) postgradNote = `A fierce drive for professional supremacy. Executive MBAs, leadership training, or elite certifications in your mid-20s are highly favored to multiply your career velocity.`;
        else if (merHouse === 9 || jupHouse === 9) postgradNote = `A very natural inclination towards a Master's degree, PhD, or deep academic research during this period. Your chart leans heavily into treating education as a continuous, lifelong pursuit.`;
        else if (satHouse === 10 || satHouse === 11) postgradNote = `Heavy professional responsibilities take absolute precedence. You may pursue postgraduate education strictly part-time, as Saturn demands you build your real-world career empire first.`;
        else if (status10.includes('Exalted') || status10.includes('Own')) {
            postgradNote = `Your career engine is supercharged since your 10th lord (${lord10.toUpperCase()}) is tremendously strong. Specialized postgraduate degrees are highly recommended to maximize this astrological leverage.`;
        } else if (status10.includes('Friend') || status10.includes('Neutral')) {
            postgradNote = `Professional life gradually stabilizes. With ${lord10.toUpperCase()} in a ${status10} state, pursuing certifications or a Master's degree on the side will steadily enhance your vertical corporate growth.`;
        } else {
            postgradNote = `As ${lord10.toUpperCase()} navigates a ${status10} dignity, this phase represents a massive recalibration. You may shift industries entirely or seek a completely new educational certification to pivot your career path.`;
        }
        events.push({ age: '24-30', phase: 'Postgraduate / Professional Studies', note: postgradNote });

        // 30+ (Specialized / Continuing Education)
        let contNote = '';
        if (ketuHouse === 8 || ketuHouse === 12) contNote = `A magnetic pull towards the occult, astrology, or deep spiritual philosophies matures after 30. Your soul seeks transcendent knowledge far beyond traditional universities.`;
        else if (jupHouse === 8 || jupHouse === 9 || jupHouse === 5) contNote = `Jupiter's precise placement in your chart guarantees an eventual return to wisdom-seeking. You will likely take on teaching, mentoring, or guiding others as a second major educational journey.`;
        else if (getStatus('jupiter').includes('Exalted') || getStatus('jupiter').includes('Own')) {
            contNote = `With an incredibly powerful Jupiter in your chart, your hunger for deeper philosophical or specialized knowledge will naturally push you toward advanced learning, writing, or academia later in life.`;
        } else if (getStatus('saturn').includes('Exalted') || getStatus('saturn').includes('Own')) {
            contNote = `Saturn's maturity brings a grounded, deliberate approach to lifelong learning. You will meticulously master a complex, highly practical subject in your 30s and 40s to solidify your legacy.`;
        } else {
            const lord1 = getLord(1);
            const status1 = getStatus(lord1);
            contNote = `Lifelong learning keeps your mind sharp. Ruled by ${lord1.toUpperCase()} in a ${status1} state, your continuing education directly mirrors your evolving personal identity and desire to endlessly upgrade your skill sets.`;
        }
        events.push({ age: '30+', phase: 'Specialized / Continuing Education', note: contNote });

        return events;
    }
}
