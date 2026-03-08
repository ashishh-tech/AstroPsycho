/**
 * medical-engine.js — Vedic Medical Astrology (Ayur Jyotish) Engine
 * Analyzes health vulnerabilities, 5-year disease forecast, and remedies.
 */

class MedicalAstrologyEngine {
    constructor() {
        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.signLords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];

        // Body parts & Systems mapping by Planet
        this.planetAnatomy = {
            sun: { system: 'Cardiovascular & Skeletal', parts: ['Heart', 'Bones', 'Right Eye', 'Stomach', 'Vitality', 'Spine'], dosha: 'Pitta' },
            moon: { system: 'Lymphatic & Psychological', parts: ['Body Fluids', 'Blood', 'Left Eye', 'Mind', 'Breasts', 'Lungs'], dosha: 'Vata-Kapha' },
            mars: { system: 'Muscular & Hematological', parts: ['Muscle Tissue', 'Bone Marrow', 'Head', 'Blood Hemoglobin', 'Genitals'], dosha: 'Pitta' },
            mercury: { system: 'Nervous & Respiratory', parts: ['Nerves', 'Skin', 'Lungs', 'Speech', 'Intestines', 'Arms'], dosha: 'Tridosha' },
            jupiter: { system: 'Hepatic & Metabolic', parts: ['Liver', 'Gallbladder', 'Fat Tissue', 'Pancreas', 'Thighs', 'Hearing'], dosha: 'Kapha' },
            venus: { system: 'Reproductive & Endocrine', parts: ['Reproductive Organs', 'Kidneys', 'Throat', 'Face', 'Glands', 'Semen/Ova'], dosha: 'Kapha-Vata' },
            saturn: { system: 'Skeletal & Excretory', parts: ['Teeth', 'Joints', 'Knees', 'Hair', 'Nerves', 'Excretory System'], dosha: 'Vata' },
            rahu: { system: 'Autoimmune & Toxic', parts: ['Poisons', 'Phobias', 'Undiagnosed Illnesses', 'Epidemics', 'Intestines'], dosha: 'Vata' },
            ketu: { system: 'Nervous & Genetic', parts: ['Viral Infections', 'Wounds', 'Spinal Cord', 'Strange Diseases'], dosha: 'Pitta' }
        };

        // Body parts mapping by Sign/House
        this.houseAnatomy = [
            'Head, Brain, Face, Vitality',            // H1 (Aries)
            'Face, Right Eye, Throat, Neck, Teeth',   // H2 (Taurus)
            'Right Ear, Shoulders, Arms, Hands',      // H3 (Gemini)
            'Chest, Heart, Lungs, Breasts',           // H4 (Cancer)
            'Stomach, Liver, Upper Abdomen',          // H5 (Leo)
            'Lower Abdomen, Intestines, Kidneys',     // H6 (Virgo) - Primary Disease House
            'Pelvis, Lower Groin, Uterus, Prostate',  // H7 (Libra)
            'Genitals, Excretory organs, Rectum',     // H8 (Scorpio) - Chronic Disease
            'Thighs, Hips, Femur',                    // H9 (Sagittarius)
            'Knees, Joints, Bones',                   // H10 (Capricorn)
            'Calves, Ankles, Left Ear',               // H11 (Aquarius)
            'Feet, Left Eye, Immune System'           // H12 (Pisces) - Hospitalization
        ];

        this.diseaseMapping = {
            sun: ['Fever', 'Heart Disease', 'Eye Problems', 'Bone Weakness', 'Migraine', 'Sunstroke'],
            moon: ['Depression', 'Anxiety', 'Insomnia', 'Asthma', 'Blood Pressure', 'Fluid Imbalance', 'Hormonal Issues'],
            mars: ['Inflammation', 'Cuts/Wounds', 'Surgery', 'Blood Disorders', 'Ulcers', 'Accidents', 'Piles'],
            mercury: ['Anxiety', 'Skin Diseases (Eczema, Psoriasis)', 'Nerve Disorders', 'Speech Defects', 'Digestive Issues'],
            jupiter: ['Liver Cirrhosis', 'Diabetes', 'Obesity', 'Cholesterol', 'Tumors', 'Gallbladder Stones'],
            venus: ['Kidney Stones', 'Reproductive Issues', 'UTI', 'Thyroid', 'Throat Infections', 'Venereal Diseases'],
            saturn: ['Arthritis', 'Paralysis', 'Tooth Decay', 'Chronic Fatigue', 'Bone Fractures', 'Osteoporosis', 'Constipation'],
            rahu: ['Autoimmune Diseases', 'Phobias', 'Poisoning', 'Cancerous Growths', 'Undiagnosable Illnesses', 'Viruses'],
            ketu: ['Epidemics', 'Viral Infections', 'Worms', 'Mysterious Fevers', 'Deafness', 'Amputation']
        };
    }

    getHouseNumber(longitude, ascendant) {
        const offset = (longitude - ascendant + 360) % 360;
        return Math.floor(offset / 30) + 1;
    }

    getLagnaLord(ascendantDeg) {
        return this.signLords[Math.floor(ascendantDeg / 30)];
    }

    getHouseLord(houseNum, ascendantDeg) {
        const lagnaSign = Math.floor(ascendantDeg / 30);
        const houseSign = (lagnaSign + houseNum - 1) % 12;
        return this.signLords[houseSign];
    }

    /**
     * Identifies planetary combinations for diseases
     */
    analyzeHealth(chart) {
        const { planets, ascendant, planetaryDetails } = chart;
        const lagnaLord = this.getLagnaLord(ascendant);
        const lord6 = this.getHouseLord(6, ascendant);
        const lord8 = this.getHouseLord(8, ascendant);
        const lord12 = this.getHouseLord(12, ascendant);

        const vulnerabilities = [];
        const affectedParts = new Set();
        let overallImmunity = 100;

        // 1. Analyze Lagna Lord (Overall Health)
        const llDetail = planetaryDetails[lagnaLord];
        let llNotes = [];
        if (llDetail.house === 6 || llDetail.house === 8 || llDetail.house === 12) {
            overallImmunity -= 30;
            llNotes.push(`Placed in Dusthana (House ${llDetail.house}) - Reduced immunity`);
        }
        if (llDetail.status.includes('Debilitated')) {
            overallImmunity -= 25;
            llNotes.push(`Debilitated in ${llDetail.sign} - Vitality is low`);
        }
        if (llDetail.status.includes('Exalted') || llDetail.status.includes('Own')) {
            overallImmunity += 25;
            llNotes.push(`Strong in ${llDetail.sign} - Excellent natural recovery`);
        }

        // 2. Analyze the 6th House (Disease & Daily Health)
        // Find planets in 6th house
        const planetsIn6 = Object.keys(planetaryDetails).filter(p => planetaryDetails[p].house === 6 && p !== 'velocities');
        if (planetsIn6.length > 0) {
            planetsIn6.forEach(p => {
                overallImmunity -= 15;
                vulnerabilities.push({
                    planet: p,
                    cause: `${p.charAt(0).toUpperCase() + p.slice(1)} in 6th House (House of Disease)`,
                    system: this.planetAnatomy[p].system,
                    risks: this.diseaseMapping[p],
                    severity: ['sun', 'mars', 'saturn', 'rahu', 'ketu'].includes(p) ? 'High' : 'Moderate'
                });
                this.planetAnatomy[p].parts.forEach(part => affectedParts.add(part));
            });
        }

        // 3. Analyze the 8th House (Chronic & Surgery)
        const planetsIn8 = Object.keys(planetaryDetails).filter(p => planetaryDetails[p].house === 8 && p !== 'velocities');
        if (planetsIn8.length > 0) {
            planetsIn8.forEach(p => {
                overallImmunity -= 20;
                vulnerabilities.push({
                    planet: p,
                    cause: `${p.charAt(0).toUpperCase() + p.slice(1)} in 8th House (House of Chronic Illness)`,
                    system: this.planetAnatomy[p].system,
                    risks: this.diseaseMapping[p].map(r => `Chronic ${r}`),
                    severity: 'High'
                });
                this.planetAnatomy[p].parts.forEach(part => affectedParts.add(part));
            });
        }

        // 4. Analyze placements of 6th and 8th Lords
        const l6Detail = planetaryDetails[lord6];
        if (l6Detail) {
            vulnerabilities.push({
                planet: lord6,
                cause: `6th Lord (${lord6}) placed in House ${l6Detail.house} (Affects ${this.houseAnatomy[l6Detail.house - 1].split(',')[0]})`,
                system: this.planetAnatomy[lord6].system,
                risks: this.diseaseMapping[lord6],
                severity: 'Moderate'
            });
        }

        // 5. Special Yogas / Afflictions
        // Moon Afflictions (Mental health)
        const moonHouse = planetaryDetails.moon.house;
        if (moonHouse === 6 || moonHouse === 8 || moonHouse === 12) {
            vulnerabilities.push({
                planet: 'moon',
                cause: `Moon in Dusthana (House ${moonHouse})`,
                system: 'Psychological & Mental Health',
                risks: ['Anxiety', 'Depression', 'Emotional Instability', 'Phobias'],
                severity: 'High'
            });
        }

        // Sun Afflictions (Heart/Bones)
        if (planetaryDetails.sun.status.includes('Debilitated') || planetaryDetails.sun.house === 8) {
            vulnerabilities.push({
                planet: 'sun',
                cause: `Weak Sun (Significator of Vitality)`,
                system: 'Cardiovascular / Skeletal / Eyes',
                risks: ['Low Vitality', 'Heart Weakness', 'Eyesight Issues', 'Bone Density Issues'],
                severity: 'Moderate'
            });
        }

        // Limit immunity score
        overallImmunity = Math.max(15, Math.min(100, overallImmunity));

        // Deduplicate vulnerabilities
        const uniqueVulns = [];
        const seen = new Set();
        for (let v of vulnerabilities) {
            const key = `${v.planet}-${v.cause}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueVulns.push(v);
            }
        }

        return {
            lagnaLord,
            lagnaLordStrength: llDetail.status,
            lagnaLordNotes: llNotes,
            immunityScore: overallImmunity,
            immunityLabel: overallImmunity >= 80 ? 'Excellent' : overallImmunity >= 60 ? 'Good' : overallImmunity >= 40 ? 'Fair' : 'Vulnerable',
            vulnerabilities: uniqueVulns,
            affectedBodyParts: Array.from(affectedParts).slice(0, 6)
        };
    }

    /**
   * Generates a 5-year forecast based on Vimshottari Mahadasha/Antardasha,
   * specifically mapping to Health themes if 6/8/12 lords are involved.
   */
    generate5YearForecast(dashaObject, chart) {
        if (!dashaObject || !dashaObject.allDashas) return [];

        // Flatten dashas into a timeline
        let timeline = [];
        const pd = chart.planetaryDetails;
        const ascendant = chart.ascendant;
        const lord6 = this.getHouseLord(6, ascendant);
        const lord8 = this.getHouseLord(8, ascendant);
        const lord12 = this.getHouseLord(12, ascendant);

        // VedicAstrologyEngine.calculateVimshottariDasha returns { allDashas: [{planet, startDate, endDate, years}] }
        // It does not calculate all antardashas by default, we must calculate them loosely here.
        const allDashas = dashaObject.allDashas;
        const sequence = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
        const dashaYears = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 };

        allDashas.forEach(maha => {
            // Calculate Antardashas for this Mahadasha
            const mdPlanet = maha.planet;
            const startIndex = sequence.indexOf(mdPlanet);
            const adSequence = [...sequence.slice(startIndex), ...sequence.slice(0, startIndex)];

            let currentStartDate = new Date(maha.startDate.getTime());

            adSequence.forEach(adPlanet => {
                // Formula: AD Years = (MD Years * AD Planet Years) / 120
                const adYears = (maha.years * dashaYears[adPlanet]) / 120;
                const endDate = new Date(currentStartDate.getTime());
                endDate.setMonth(endDate.getMonth() + Math.round(adYears * 12));

                timeline.push({
                    planet: adPlanet,
                    mahaPlanet: mdPlanet,
                    startDate: new Date(currentStartDate),
                    endDate: new Date(endDate),
                    years: adYears
                });

                currentStartDate = endDate;
            });
        });

        const now = new Date();
        const endForecast = new Date();
        endForecast.setFullYear(now.getFullYear() + 5);

        // Filter to next 5 years
        const upcoming = timeline.filter(d => d.endDate >= now && d.startDate <= endForecast);

        // Analyze each period for health impacts
        return upcoming.map(period => {
            const mdPlanet = period.mahaPlanet;
            const adPlanet = period.planet;

            const mdHouse = pd[mdPlanet] ? pd[mdPlanet].house : 0;
            const adHouse = pd[adPlanet] ? pd[adPlanet].house : 0;

            let riskLevel = 'Low';
            let healthNotes = 'Generally stable health period. Routine care advised.';
            let possibleIssues = [];
            let severityColor = '#64ffda'; // Safe

            // Triggers for Health Issues:
            // 1. Period of 6th, 8th, or 12th Lord
            // 2. Planet sitting in 6th, 8th, or 12th House
            // 3. Maraka dashas (2nd or 7th Lord)
            const isMdAfflicted = (mdPlanet === lord6 || mdPlanet === lord8 || mdPlanet === lord12 || mdHouse === 6 || mdHouse === 8 || mdHouse === 12);
            const isAdAfflicted = (adPlanet === lord6 || adPlanet === lord8 || adPlanet === lord12 || adHouse === 6 || adHouse === 8 || adHouse === 12);

            let mdIssues = this.diseaseMapping[mdPlanet] || [];
            let adIssues = this.diseaseMapping[adPlanet] || [];

            if (isMdAfflicted && isAdAfflicted) {
                riskLevel = 'High';
                severityColor = '#ff6b9d';
                healthNotes = 'Vulnerable period. High possibility of onset or aggravation of illness.';
                // Take 2 from MD, 2 from AD for combined effect
                possibleIssues = [...mdIssues.slice(0, 2), ...adIssues.slice(0, 2)];
            } else if (isMdAfflicted || isAdAfflicted) {
                riskLevel = 'Moderate';
                severityColor = '#f97316';
                healthNotes = 'Watchful period. Minor ailments or chronicity may trigger. Preventive care needed.';
                // Always mix to show difference across Antardashas
                possibleIssues = [...mdIssues.slice(0, 2), ...adIssues.slice(0, 2)];
            }

            // Special AD combinations
            if (mdPlanet === 'rahu' || mdPlanet === 'ketu' || adPlanet === 'rahu' || adPlanet === 'ketu') {
                if (riskLevel !== 'High') { riskLevel = 'Moderate'; severityColor = '#f4c430'; }
                if (!healthNotes.includes('Vulnerable')) healthNotes = 'Unpredictable health energy. Focus on diagnosis if symptoms appear.';
                possibleIssues.push('Viral infections', 'Undiagnosed fatigue');
            }

            // Convert to Set to ensure uniqueness, slice to max 5 items
            possibleIssues = [...new Set(possibleIssues)].slice(0, 5);

            return {
                mahadasha: mdPlanet,
                antardasha: adPlanet,
                startDate: period.startDate,
                endDate: period.endDate,
                riskLevel,
                severityColor,
                healthNotes,
                possibleIssues
            };
        });
    }

    getRemedies(vulnerabilities) {
        const uniquePlanets = [...new Set(vulnerabilities.map(v => v.planet))];
        const remediesMap = {
            sun: { herb: 'Ashwagandha & Brahmi', mantra: 'Om Ghrini Surya Aditya', action: 'Morning sunlight exposure, Drink from copper vessel, Consume ginger.' },
            moon: { herb: 'Shatavari & Tulsi', mantra: 'Om Som Somaya Namah', action: 'Meditation, Hydration, Avoid cold foods at night, Silver vessel water.' },
            mars: { herb: 'Neem & Turmeric', mantra: 'Om Kram Krim Kraum Sah Bhaumaya Namah', action: 'Regular exercise, Blood donation, Avoid spicy/fried foods.' },
            mercury: { herb: 'Gotu Kola & Amla', mantra: 'Om Bram Brim Braum Sah Budhaya Namah', action: 'Green leafy vegetables, Deep breathing (Pranayama), Mental detox.' },
            jupiter: { herb: 'Turmeric & Licorice', mantra: 'Om Gram Grim Graum Sah Gurave Namah', action: 'Yoga, Avoid excessive sweets/fats, Fasting on Thursdays.' },
            venus: { herb: 'Triphala & Rose', mantra: 'Om Dram Drim Draum Sah Shukraya Namah', action: 'Maintain hygiene, Consume probiotics (yogurt), Avoid excess sugar.' },
            saturn: { herb: 'Triphala & Ashwagandha', mantra: 'Om Pram Prim Praum Sah Shanaishcharaya Namah', action: 'Oil massage (Abhyanga), Warm cooked foods, Rest joints, Dental care.' },
            rahu: { herb: 'Sandalwood & Tulsi', mantra: 'Om Bhram Bhrim Bhraum Sah Rahave Namah', action: 'Avoid junk food, Digital detox, regular sleep schedule.' },
            ketu: { herb: 'Ashwagandha & Neem', mantra: 'Om Sram Srim Sraum Sah Ketave Namah', action: 'Yoga, Meditation, Focus on immunity building, Avoid intoxicants.' }
        };

        return uniquePlanets.map(p => ({
            planet: p,
            remedy: remediesMap[p]
        })).slice(0, 4); // Top 4 to avoid overwhelming
    }
}
