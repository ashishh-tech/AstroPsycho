/**
 * RashifalEngine — Daily / Monthly / Yearly horoscope scoring
 * Uses birth chart from VedicAstrologyEngine + current transit positions
 * to compute 0-100 scores for 5 life aspects.
 * Zero external dependencies — runs fully offline in the browser.
 */
class RashifalEngine {
    constructor() {
        this.PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
        this.SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.MONTHS_HI = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
        this.NAKSHATRA_LORDS = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury', 'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury', 'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
        // Planet base quality on each house (1-12)
        this.PLANET_HOUSE_QUAL = {
            sun: [9, 4, 5, 6, 10, 7, 3, 6, 7, 9, 5, 4],
            moon: [7, 8, 5, 10, 6, 5, 4, 3, 6, 5, 6, 8],
            mars: [8, 4, 7, 3, 8, 5, 3, 5, 6, 8, 5, 3],
            mercury: [7, 7, 8, 5, 6, 9, 7, 5, 7, 7, 8, 5],
            jupiter: [9, 7, 6, 8, 9, 6, 4, 5, 9, 8, 7, 7],
            venus: [7, 9, 7, 6, 5, 7, 9, 5, 7, 6, 8, 8],
            saturn: [5, 7, 4, 3, 4, 8, 7, 6, 5, 8, 8, 4],
            rahu: [5, 7, 8, 4, 5, 5, 6, 5, 5, 6, 8, 5],
            ketu: [5, 4, 5, 6, 5, 5, 5, 7, 7, 5, 5, 6]
        };
        // Aspect definitions: which natal houses & transit planets matter most
        this.ASPECTS = {
            health: {
                emoji: '🏥', label: 'Health',
                natalHouses: [1, 6, 8, 12],
                keyPlanets: ['sun', 'mars', 'saturn', 'moon'],
                benefic: ['sun', 'jupiter', 'venus'],
                malefic: ['saturn', 'mars', 'rahu']
            },
            education: {
                emoji: '🎓', label: 'Education',
                natalHouses: [4, 5, 9],
                keyPlanets: ['mercury', 'jupiter', 'sun'],
                benefic: ['mercury', 'jupiter', 'sun'],
                malefic: ['rahu', 'ketu', 'saturn']
            },
            wealth: {
                emoji: '💰', label: 'Wealth',
                natalHouses: [2, 11, 5, 9],
                keyPlanets: ['jupiter', 'venus', 'mercury'],
                benefic: ['jupiter', 'venus', 'mercury'],
                malefic: ['saturn', 'ketu', 'mars']
            },
            career: {
                emoji: '💼', label: 'Career',
                natalHouses: [10, 6, 2, 11],
                keyPlanets: ['saturn', 'sun', 'mars', 'jupiter'],
                benefic: ['sun', 'jupiter', 'saturn'],
                malefic: ['rahu', 'moon', 'ketu']
            },
            family: {
                emoji: '👨‍👩‍👧', label: 'Family',
                natalHouses: [4, 7, 2, 12],
                keyPlanets: ['moon', 'venus', 'jupiter'],
                benefic: ['moon', 'venus', 'jupiter'],
                malefic: ['saturn', 'mars', 'rahu']
            }
        };
    }

    /**
     * Main entry — call this once with a chart object.
     * Returns computed rashifal for daily, monthly, yearly.
     */
    analyze(chart) {
        this.chart = chart;
        this.ascendant = chart.ascendant;
        this.planets = chart.planets; // { sun: degrees, moon: degrees, ... }
        const now = new Date();
        return {
            daily: this._computePeriod('daily', now),
            monthly: this._computePeriod('monthly', now),
            yearly: this._computePeriod('yearly', now),
            meta: {
                date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
                month: this.MONTHS[now.getMonth()] + ' ' + now.getFullYear(),
                year: now.getFullYear()
            }
        };
    }

    _computePeriod(period, date) {
        const results = {};
        // Get transit positions approximate for the period
        const transitPlanets = this._getTransitApprox(period, date);
        Object.keys(this.ASPECTS).forEach(aspect => {
            results[aspect] = this._scoreAspect(aspect, transitPlanets, period, date);
        });
        return results;
    }

    /**
     * Approximate planetary positions for transit calculation.
     * Uses mean motion rates and current date — no ephemeris API needed.
     */
    _getTransitApprox(period, date) {
        // Approximate daily mean motion (degrees/day) per planet
        const meanMotion = {
            sun: 1.0,
            moon: 13.2,
            mars: 0.524,
            mercury: 1.38,
            jupiter: 0.083,
            venus: 1.2,
            saturn: 0.034,
            rahu: -0.053,
            ketu: -0.053
        };
        // Known reference position for J2000 (Jan 1, 2000) approximate degrees
        const refPos = {
            sun: 280.46, moon: 218.32, mars: 355.45, mercury: 280.0,
            jupiter: 34.0, venus: 181.0, saturn: 49.94,
            rahu: 125.0, ketu: 305.0
        };
        const j2000 = new Date('2000-01-01');
        let refDate = new Date(date);
        if (period === 'monthly') {
            // Use mid-month position
            refDate = new Date(date.getFullYear(), date.getMonth(), 15);
        } else if (period === 'yearly') {
            // Use April 1 position (Vedic new year approximate)
            refDate = new Date(date.getFullYear(), 3, 1);
        }
        const daysSince = (refDate - j2000) / 86400000;
        const positions = {};
        this.PLANETS.forEach(pl => {
            positions[pl] = ((refPos[pl] + meanMotion[pl] * daysSince) % 360 + 360) % 360;
        });
        return positions;
    }

    _scoreAspect(aspect, transitPos, period, date) {
        const def = this.ASPECTS[aspect];
        let score = 50; // base

        // --- Natal birth chart base ---
        // Check how strong natal planets in key houses are
        const asc = this.ascendant;
        def.natalHouses.forEach(h => {
            const hLong = (asc + (h - 1) * 30) % 360;
            // Check if any beneficial planet is in this house natally
            def.benefic.forEach(pl => {
                const plong = this.planets[pl];
                if (plong !== undefined) {
                    const pHouse = Math.floor(((plong - asc + 360) % 360) / 30) + 1;
                    if (pHouse === h) score += 5;
                }
            });
            def.malefic.forEach(pl => {
                const plong = this.planets[pl];
                if (plong !== undefined) {
                    const pHouse = Math.floor(((plong - asc + 360) % 360) / 30) + 1;
                    if (pHouse === h) score -= 4;
                }
            });
        });

        // --- Transit modifier ---
        const moonTransitSign = Math.floor(transitPos.moon / 30);
        const natalMoonSign = Math.floor(this.planets.moon / 30);
        const moonOffset = ((moonTransitSign - natalMoonSign + 12) % 12) + 1;
        // Moon transit auspiciousness from natal moon (Vedic rule)
        const moonAusp = [0, -5, -3, 8, -5, 5, 8, -8, -5, 8, 5, 5, -5]; // 1-12
        score += moonAusp[moonOffset] || 0;

        // Jupiter/Saturn transit influences
        const jupTransitH = Math.floor(((transitPos.jupiter - asc + 360) % 360) / 30) + 1;
        const satTransitH = Math.floor(((transitPos.saturn - asc + 360) % 360) / 30) + 1;
        if (def.benefic.includes('jupiter')) {
            score += (def.natalHouses.includes(jupTransitH)) ? 8 : -2;
        }
        if (def.malefic.includes('saturn')) {
            score -= (def.natalHouses.includes(satTransitH)) ? 6 : 0;
        }

        // Dasha modifier (if available)
        if (this.chart.dashas && this.chart.dashas.currentMahadasha) {
            const md = this.chart.dashas.currentMahadasha.planet;
            if (def.benefic.includes(md)) score += 8;
            if (def.malefic.includes(md)) score -= 6;
        }

        // Period-specific fine-tuning
        if (period === 'daily') {
            // Day of week lord effect
            const weekday = date.getDay(); // 0=Sun, 1=Mon, ...
            const dayLords = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
            const dl = dayLords[weekday];
            if (def.benefic.includes(dl)) score += 6;
            if (def.malefic.includes(dl)) score -= 5;
        } else if (period === 'monthly') {
            // Tithi variance (approximate using moon speed)
            const tithi = Math.floor(((transitPos.moon - transitPos.sun + 360) % 360) / 12) + 1;
            const shubhTithi = [2, 3, 5, 7, 10, 11, 12, 13];
            score += shubhTithi.includes(tithi) ? 5 : -3;
        } else if (period === 'yearly') {
            // Antardasha impact
            if (this.chart.dashas && this.chart.dashas.antardashas && this.chart.dashas.antardashas.current) {
                const ad = this.chart.dashas.antardashas.current.planet;
                if (def.benefic.includes(ad)) score += 6;
                if (def.malefic.includes(ad)) score -= 5;
            }
        }

        score = Math.max(10, Math.min(100, Math.round(score)));
        return {
            score,
            level: score >= 65 ? 'good' : score >= 35 ? 'average' : 'caution',
            interpretation: this._interpret(aspect, score, period),
            remedy: this._remedy(aspect, score)
        };
    }

    _interpret(aspect, score, period) {
        const p = period === 'daily' ? 'today' : period === 'monthly' ? 'this month' : 'this year';
        const maps = {
            health: {
                good: [
                    `${p.charAt(0).toUpperCase() + p.slice(1)} your vitality is strong. Planets favour physical energy, immunity, and overall wellbeing. Ideal time for fitness routines.`,
                    `Your health stars shine brightly ${p}. Excellent planetary support from benefic transits keeps illness at bay.`
                ],
                average: [
                    `Health is generally stable ${p} but minor stress-related issues are possible. Maintain sleep and hydration.`,
                    `Planetary energies are mixed for health ${p}. Avoid overexertion and take diet seriously.`
                ],
                caution: [
                    `${p.charAt(0).toUpperCase() + p.slice(1)} planetary pressures may affect vitality. Rest well and avoid risky activities or environments.`,
                    `Extra care needed for health ${p}. Saturn/Mars transit warns against neglecting small symptoms.`
                ]
            },
            education: {
                good: [
                    `An excellent period ${p} for studies, exams, and learning. Mercury and Jupiter favour sharp memory and clarity of thought.`,
                    `Knowledge flows freely ${p}. Ideal for competitive exams, interviews, or creative intellectual projects.`
                ],
                average: [
                    `Average intellectual energy ${p}. Progress in studies is possible but needs sustained effort and discipline.`,
                    `Mixed academic outcomes are likely ${p}. Rahu may cause distraction — set clear goals.`
                ],
                caution: [
                    `Educational challenges are possible ${p}. Delays or confusion in studies may arise — stay focused and seek guidance.`,
                    `Unfavourable transit for academic work ${p}. Rethink strategies and avoid hasty decisions in educational matters.`
                ]
            },
            wealth: {
                good: [
                    `Financial gains are strongly indicated ${p}. Jupiter and Venus bless the wealth houses — new income sources may open.`,
                    `An auspicious period for investments, negotiations, and monetary gains ${p}.`
                ],
                average: [
                    `Financial position is steady ${p} but avoid risky investments. Focus on savings and debt repayment.`,
                    `Mixed financial signals ${p}. Income is possible but unexpected expenses may arise. Budget wisely.`
                ],
                caution: [
                    `${p.charAt(0).toUpperCase() + p.slice(1)} caution is advised in financial matters. Saturn's influence warns against major spending or borrowing.`,
                    `Risk of financial loss or delays ${p}. Avoid speculation and keep emergency funds ready.`
                ]
            },
            career: {
                good: [
                    `Career momentum is strong ${p}. The 10th house receives powerful support — recognition and promotions are likely.`,
                    `Ideal time ${p} to take bold career steps, present ideas, or start a new professional chapter.`
                ],
                average: [
                    `Career is steady ${p} but progress requires patience. Workplace relationships need attention.`,
                    `Mixed professional signals ${p}. Maintain diplomacy at work and avoid conflicts with superiors.`
                ],
                caution: [
                    `Career pressures may intensify ${p}. Avoid major job changes and focus on completing ongoing responsibilities.`,
                    `Challenging transits for career ${p}. Rahu's influence may cause confusion in professional direction — stay grounded.`
                ]
            },
            family: {
                good: [
                    `Harmonious family atmosphere ${p}. Moon and Venus bless the home sector — bonds deepen and disputes resolve peacefully.`,
                    `Auspicious for family gatherings, celebrations, and domestic happiness ${p}. Relationships with parents are especially warm.`
                ],
                average: [
                    `Family life is generally calm ${p} but some minor tensions at home are possible. Communication is key.`,
                    `Mixed domestic signals ${p}. Attend to family needs with patience and empathy.`
                ],
                caution: [
                    `Family tensions may surface ${p}. Saturn's aspect warns of misunderstandings with family members — choose words carefully.`,
                    `Domestic harmony requires effort ${p}. Mars/Rahu influence may cause friction at home — practise patience.`
                ]
            }
        };
        const opts = maps[aspect][score >= 65 ? 'good' : score >= 35 ? 'average' : 'caution'];
        return opts[Math.floor(Math.random() * opts.length)];
    }

    _remedy(aspect, score) {
        const remedies = {
            health: {
                good: 'Chant the Surya Mantra at sunrise and practice 20 minutes of yoga daily to maintain peak health.',
                average: 'Chant "Om Hanumate Namah" 11 times each Tuesday. Avoid spicy and oily food mid-week.',
                caution: 'Offer water to the Sun every morning. Visit a Shiva temple on Mondays and fast on Saturdays.'
            },
            education: {
                good: 'Read one chapter of a stimulating book today. This auspicious period turbo-charges your learning capacity.',
                average: 'Chant "Om Budhaya Namah" 9 times before study sessions. Keep a clear green plant on your desk.',
                caution: 'Offer green fruits to Lord Ganesha on Wednesdays. Light incense while studying and avoid distractions.'
            },
            wealth: {
                good: 'Invest or start a new income initiative this period. Light a ghee lamp for Lakshmi Devi on Fridays.',
                average: 'Chant "Om Shreem Mahalakshmiyei Namah" 21 times on Fridays. Donate to a food charity.',
                caution: 'Wear a yellow Topaz or Citrine ring on the index finger. Donate yellow items on Thursdays and chant Vishnu Sahasranama.'
            },
            career: {
                good: 'Act boldly in career matters this period. Seek the blessings of your superiors and trust your instincts.',
                average: 'Chant "Om Ravaye Namah" 12 times at sunrise. Respect your professional boundaries and focus on quality work.',
                caution: 'Donate black sesame seeds to the poor on Saturdays. Wear an iron ring on the middle finger. Avoid major career decisions for now.'
            },
            family: {
                good: 'Spend quality time with loved ones. Offer white flowers at a Goddess temple on Mondays.',
                average: 'Chant "Om Chandraya Namah" 11 times on Mondays. Practice active listening during family conversations.',
                caution: 'Light a camphor lamp at home each evening. Avoid arguments and chant "Om Shanti" to bring peace to the household.'
            }
        };
        const lvl = score >= 65 ? 'good' : score >= 35 ? 'average' : 'caution';
        return remedies[aspect][lvl];
    }

    /**
     * Returns readable score label for display
     */
    static scoreLabel(score) {
        if (score >= 80) return 'अत्युत्तम / Exceptional';
        if (score >= 65) return 'उत्तम / Good';
        if (score >= 50) return 'श्रेष्ठ / Above Average';
        if (score >= 35) return 'सामान्य / Average';
        if (score >= 20) return 'नेष्ट / Below Average';
        return 'निकृष्ट / Challenging';
    }
}
