// Recommendation Engine
// Correlates psychological assessment with Dasha periods and generates personalized remedies

class RecommendationEngine {
    constructor() {
        this.vedicKnowledge = null;
        this.dashaMapping = null;
    }

    async init() {
        if (!this.vedicKnowledge) {
            await this.loadKnowledgeData();
        }
    }

    async loadKnowledgeData() {
        try {
            const [vedicResponse, mappingResponse] = await Promise.all([
                fetch('data/vedic-astro-knowledge.json'),
                fetch('data/psychology-dasha-mappings.json')
            ]);

            this.vedicKnowledge = await vedicResponse.json();
            this.dashaMapping = await mappingResponse.json();
        } catch (error) {
            console.error('Error loading knowledge data:', error);
        }
    }

    // Analyze psychological responses and identify key concerns
    analyzePsychology(responses) {
        // Handle skipped assessment
        if (responses.skipped === true) {
            return {
                concerns: {},
                allScores: {},
                skipped: true
            };
        }

        const concerns = {};
        const scores = {};

        // Safety check: if data hasn't loaded, return empty
        if (!this.dashaMapping) {
            console.warn('Dasha mapping data not loaded yet');
            return { concerns: {}, allScores: {} };
        }

        // Calculate scores for each psychological issue
        Object.keys(this.dashaMapping).forEach(issue => {
            scores[issue] = 0;
        });

        // Tally responses based on indicators
        Object.values(responses).forEach(response => {
            if (response.indicators) {
                response.indicators.forEach(indicator => {
                    if (scores.hasOwnProperty(indicator)) {
                        scores[indicator] += response.value;
                    }
                });
            }
        });

        // Identify high-priority concerns (scores above moderate threshold)
        const threshold = 15; // Moderate concern level
        Object.entries(scores).forEach(([issue, score]) => {
            if (score >= threshold) {
                concerns[issue] = {
                    score: score,
                    severity: score >= 25 ? 'high' : 'moderate',
                    data: this.dashaMapping[issue]
                };
            }
        });

        return { concerns, allScores: scores };
    }

    // Generate comprehensive report correlating Dasha with psychology
    generateReport(userData, birthChart) {
        const psychAnalysis = this.analyzePsychology(userData.responses);
        const { currentMahadasha, antardashas } = birthChart.dashas;
        const currentAntardasha = antardashas.current;

        // Core analysis: Does current Dasha correlate with psychological issues?
        const dashaCorrelations = this.correlateDashaWithConcerns(
            currentMahadasha,
            currentAntardasha,
            psychAnalysis.concerns
        );

        // Generate personalized remedies
        const remedies = this.generateRemedies(
            psychAnalysis.concerns,
            currentMahadasha,
            currentAntardasha,
            birthChart
        );

        // Timeline predictions
        const timeline = this.generateTimeline(birthChart.dashas, psychAnalysis.concerns);

        return {
            psychAnalysis,
            dashaInfo: {
                mahadasha: currentMahadasha,
                antardasha: currentAntardasha,
                nextMahadasha: birthChart.dashas.nextMahadasha
            },
            correlations: dashaCorrelations,
            remedies,
            timeline,
            birthChart
        };
    }

    correlateDashaWithConcerns(mahadasha, antardasha, concerns) {
        const correlations = [];

        // Safety check: if no mahadasha, can't correlate
        if (!mahadasha || !mahadasha.planet) {
            return correlations;
        }

        Object.entries(concerns).forEach(([issue, data]) => {
            const triggers = data.data.dasha_triggers || {};

            // Check Mahadasha correlation
            const mahaKey = `${mahadasha.planet}_mahadasha`;
            if (triggers[mahaKey]) {
                correlations.push({
                    issue,
                    severity: data.severity,
                    dashaType: 'mahadasha',
                    planet: mahadasha.planet,
                    explanation: triggers[mahaKey],
                    strong: true
                });
            }

            // Check Antardasha correlation
            if (antardasha && antardasha.planet) {
                const antarKey = `${mahadasha.planet}_${antardasha.planet}`;
                if (triggers[antarKey]) {
                    correlations.push({
                        issue,
                        severity: data.severity,
                        dashaType: 'antardasha',
                        planets: `${mahadasha.planet}-${antardasha.planet}`,
                        explanation: triggers[antarKey],
                        strong: true
                    });
                }
            }

            // Check if concern planets match Dasha planets
            const concernPlanets = data.data.primary_planets || [];
            if (concernPlanets.includes(mahadasha.planet)) {
                // Capitalize planet for display
                const planetCap = mahadasha.planet.charAt(0).toUpperCase() + mahadasha.planet.slice(1);
                correlations.push({
                    issue,
                    severity: data.severity,
                    dashaType: 'planetary_match',
                    planet: mahadasha.planet,
                    explanation: `Your current ${planetCap} Mahadasha directly influences ${issue.replace(/_/g, ' ')}`,
                    strong: true
                });
            }
        });

        return correlations;
    }

    generateRemedies(concerns, mahadasha, antardasha, birthChart) {
        const remedies = [];
        const planetsToStrengthen = new Set();

        // Identify planets needing strengthening
        Object.entries(concerns).forEach(([issue, data]) => {
            const planets = data.data.primary_planets || [];
            planets.forEach(planet => planetsToStrengthen.add(planet));
        });

        // Add Mahadasha lord (only if mahadasha exists)
        if (mahadasha && mahadasha.planet) {
            planetsToStrengthen.add(mahadasha.planet);
        }
        if (antardasha && antardasha.planet) {
            planetsToStrengthen.add(antardasha.planet);
        }

        // If no planets to strengthen, add all planets for general guidance
        if (planetsToStrengthen.size === 0) {
            // Add Sun and Moon as default for general well-being
            planetsToStrengthen.add('sun');
            planetsToStrengthen.add('moon');
        }

        // Generate remedies for each planet
        planetsToStrengthen.forEach(planet => {
            const planetData = this.vedicKnowledge.planetary_influences[planet];
            if (planetData && planetData.remedies) {
                remedies.push({
                    planet,
                    sanskritName: planetData.sanskrit_name,
                    remedies: planetData.remedies,
                    parasharInsights: planetData.parashar_insights,
                    priority: (mahadasha && planet === mahadasha.planet) ? 'high' : 'medium'
                });
            }
        });

        // Add specific remedy recommendations from Lal Kitab for issues
        const lalKitabRemedies = [];
        Object.entries(concerns).forEach(([issue, data]) => {
            if (data.data.lal_kitab_remedies) {
                lalKitabRemedies.push({
                    issue: issue.replace(/_/g, ' '),
                    remedy: data.data.lal_kitab_remedies
                });
            }
        });

        return { planetary: remedies, lalKitab: lalKitabRemedies };
    }

    generateTimeline(dashas, concerns) {
        const timeline = [];
        const now = new Date();

        // When will current Mahadasha end (potential relief)?
        if (dashas.currentMahadasha) {
            const endDate = dashas.currentMahadasha.endDate;
            const yearsRemaining = (endDate - now) / (1000 * 60 * 60 * 24 * 365.25);

            const planetCap = dashas.currentMahadasha.planet.charAt(0).toUpperCase() + dashas.currentMahadasha.planet.slice(1);
            timeline.push({
                event: `Current ${planetCap} Mahadasha ends`,
                date: endDate,
                yearsFromNow: yearsRemaining.toFixed(1),
                significance: 'Major shift in life energy and challenges'
            });
        }

        // When will next Mahadasha bring relief?
        if (dashas.nextMahadasha) {
            const nextPlanet = dashas.nextMahadasha.planet;
            const nextPlanetCap = nextPlanet.charAt(0).toUpperCase() + nextPlanet.slice(1);
            const nextDashaData = this.vedicKnowledge.dasha_system.dasha_interpretations[`${nextPlanet}_mahadasha`];

            if (nextDashaData) {
                timeline.push({
                    event: `${nextPlanetCap} Mahadasha begins`,
                    date: dashas.nextMahadasha.startDate,
                    opportunities: nextDashaData.growth_opportunities,
                    challenges: nextDashaData.psychological_challenges,
                    significance: nextDashaData.brigu_insights || nextDashaData.parashar_insights
                });
            }
        }

        // Antardasha changes (next 2-3 periods)
        if (dashas.antardashas && dashas.antardashas.all) {
            const upcomingAntardashas = dashas.antardashas.all
                .filter(antar => antar.startDate > now)
                .slice(0, 3);

            upcomingAntardashas.forEach(antar => {
                timeline.push({
                    event: `${antar.planet} Antardasha`,
                    date: antar.startDate,
                    duration: `${antar.years.toFixed(1)} years`,
                    type: 'sub-period'
                });
            });
        }

        return timeline.sort((a, b) => a.date - b.date);
    }

    formatConcernName(concern) {
        return concern.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getPlanetEmoji(planet) {
        const emojis = {
            sun: '☀️',
            moon: '🌙',
            mars: '♂️',
            mercury: '☿',
            jupiter: '♃',
            venus: '♀',
            saturn: '♄',
            rahu: '☊',
            ketu: '☋'
        };
        return emojis[planet] || '●';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecommendationEngine;
}
