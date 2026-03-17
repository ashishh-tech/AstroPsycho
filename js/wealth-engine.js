/**
 * AstroPsycho — Wealth Analysis Engine
 * Analyzes 2nd (accumulated wealth), 11th (income/gains), 8th (sudden gains/losses/inheritance),
 * 4th (property/land/vehicles), Venus (luxury/comforts), Jupiter (overall prosperity),
 * Saturn (delays in wealth), Rahu (unconventional wealth sources).
 */

class WealthEngine {
    constructor() {
        this.signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        this.signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.lordMap = { aries: 'mars', taurus: 'venus', gemini: 'mercury', cancer: 'moon', leo: 'sun', virgo: 'mercury', libra: 'venus', scorpio: 'mars', sagittarius: 'jupiter', capricorn: 'saturn', aquarius: 'saturn', pisces: 'jupiter' };
        this.exaltationMap = { sun: 'aries', moon: 'taurus', mars: 'capricorn', mercury: 'virgo', jupiter: 'cancer', venus: 'pisces', saturn: 'libra', rahu: 'taurus', ketu: 'scorpio' };
        this.debilitationMap = { sun: 'libra', moon: 'scorpio', mars: 'cancer', mercury: 'pisces', jupiter: 'capricorn', venus: 'virgo', saturn: 'aries', rahu: 'scorpio', ketu: 'taurus' };
        this.ownSignMap = { sun: ['leo'], moon: ['cancer'], mars: ['aries', 'scorpio'], mercury: ['gemini', 'virgo'], jupiter: ['sagittarius', 'pisces'], venus: ['taurus', 'libra'], saturn: ['capricorn', 'aquarius'], rahu: [], ketu: [] };
    }

    analyze(chart) {
        const planets = chart.planetaryDetails;
        // chart.ascendant is a raw longitude number (0-360)
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

        const h2 = inHouse(2), h4 = inHouse(4), h8 = inHouse(8), h11 = inHouse(11), h12 = inHouse(12);
        const jupStr = strength('jupiter'), venStr = strength('venus'), satStr = strength('saturn');
        const moonStr = strength('moon'), sunStr = strength('sun');
        const jupHouse = getHouse('jupiter'), venHouse = getHouse('venus');
        const satHouse = getHouse('saturn'), rahuHouse = getHouse('rahu');
        const moonHouse = getHouse('moon');

        return {
            wealthScore: this._wealthScore(jupStr, venStr, h2, h11, h8, satStr),
            wealthSources: this._wealthSources(planets, h2, h11, h8, jupHouse, venHouse, rahuHouse),
            propertyAnalysis: this._propertyAnalysis(h4, venStr, satStr, moonStr, jupStr),
            vehicleLuxury: this._vehicleLuxury(venStr, venHouse, h4, h11, jupStr),
            lossRisks: this._lossRisks(h12, h8, satStr, satHouse, rahuHouse),
            inheritance: this._inheritance(h8, h2, planets),
            wealthTimeline: this._wealthTimeline(chart, jupStr, satStr, rahuHouse),
            remedies: this._wealthRemedies(jupStr, venStr, satStr, h12)
        };
    }

    _wealthScore(jupStr, venStr, h2, h11, h8, satStr) {
        let score = 5;
        const breakdown = [];

        if (jupStr === 'exalted') { score += 2.5; breakdown.push({ label: 'Jupiter Exalted', impact: '+2.5 \u2728', note: 'Dhana Yoga potential — exceptional wealth accumulation over lifetime.' }); }
        else if (jupStr === 'strong') { score += 1.5; breakdown.push({ label: 'Jupiter in Own Sign', impact: '+1.5', note: 'Strong overall prosperity and generosity of fortune.' }); }
        else if (jupStr === 'debilitated') { score -= 2; breakdown.push({ label: 'Jupiter Debilitated', impact: '-2.0 \u26A0\uFE0F', note: 'Challenges in permanent wealth accumulation; gains may not hold.' }); }

        if (venStr === 'exalted') { score += 2; breakdown.push({ label: 'Venus Exalted', impact: '+2.0 \u2728', note: 'Excellent material comforts, luxury, vehicles, and aesthetic wealth.' }); }
        else if (venStr === 'strong') { score += 1; breakdown.push({ label: 'Venus in Own Sign', impact: '+1.0', note: 'Good access to comforts, beauty, and pleasurable assets.' }); }
        else if (venStr === 'debilitated') { score -= 1.5; breakdown.push({ label: 'Venus Debilitated', impact: '-1.5', note: 'Luxury and comforts may feel elusive or short-lived.' }); }

        const benef = ['jupiter', 'venus', 'moon', 'mercury'];
        const b2 = h2.filter(p => benef.includes(p)), b11 = h11.filter(p => benef.includes(p));
        if (b2.length) { score += b2.length * 1.5; breakdown.push({ label: `Benefic(s) in 2nd House`, impact: `+${(b2.length * 1.5).toFixed(1)}`, note: `${b2.map(p => p[0].toUpperCase() + p.slice(1)).join(', ')} in 2H directly boost wealth accumulation.` }); }
        if (b11.length) { score += b11.length * 1.2; breakdown.push({ label: `Benefic(s) in 11th House`, impact: `+${(b11.length * 1.2).toFixed(1)}`, note: `${b11.map(p => p[0].toUpperCase() + p.slice(1)).join(', ')} in 11H increase income streams significantly.` }); }

        const mal = ['saturn', 'mars', 'rahu', 'ketu'];
        const m2 = h2.filter(p => mal.includes(p)), m11 = h11.filter(p => mal.includes(p));
        if (m2.length) { score -= m2.length; breakdown.push({ label: `Malefic(s) in 2nd House`, impact: `-${m2.length}.0`, note: `${m2.map(p => p[0].toUpperCase() + p.slice(1)).join(', ')} in 2H can cause financial instability or family wealth disputes.` }); }

        if (satStr === 'debilitated' && satStr !== 'exalted') { score -= 1; breakdown.push({ label: 'Saturn Debilitated', impact: '-1.0', note: 'Wealth comes slowly and with considerable effort; discipline essential.' }); }
        if (h8.includes('rahu') || h8.includes('saturn')) { score += 0.5; breakdown.push({ label: 'Sudden Wealth Indicator', impact: '+0.5', note: 'Rahu/Saturn in 8H can bring unexpected inheritance or windfall gains.' }); }

        score = Math.max(0, Math.min(10, score));
        return { score: Math.round(score * 10) / 10, breakdown };
    }

    _wealthSources(planets, h2, h11, h8, jupHouse, venHouse, rahuHouse) {
        const sources = [];

        // Active income sources based on 11th house planets
        if (h11.includes('sun')) sources.push({ icon: '\u2600\uFE0F', source: 'Government & Authority Roles', detail: 'Sun in the 11th house is a classic indicator of income from government jobs, administration, political positions, or roles associated with prestige and public authority.' });
        if (h11.includes('moon')) sources.push({ icon: '\uD83C\uDF19', source: 'Public, Hospitality & Nurturing Businesses', detail: 'Moon in 11th shows gains from public-facing businesses — restaurants, retail, travel, tourism, healthcare, or real estate catering to the masses.' });
        if (h11.includes('mars')) sources.push({ icon: '\uD83D\uDD25', source: 'Technical, Military & Construction Fields', detail: 'Mars in 11th directs income toward physical, competitive, and technical domains — engineering, real estate, military contracts, sports, or entrepreneurship.' });
        if (h11.includes('mercury')) sources.push({ icon: '\uD83D\uDCAC', source: 'Communication, IT, Media & Trade', detail: 'Mercury in 11th shows substantial income from communication-based businesses, IT, writing, publishing, trade networks, or stock market analysis.' });
        if (h11.includes('jupiter')) sources.push({ icon: '\uD83D\uDCD6', source: 'Teaching, Finance, Law & Consulting', detail: 'Jupiter in 11th is one of the strongest wealth indicators — income flows abundantly from advisory roles, legal services, education, investment, or religious work.' });
        if (h11.includes('venus')) sources.push({ icon: '\uD83D\uDC8E', source: 'Arts, Luxury, Beauty & Entertainment', detail: 'Venus in 11th creates income through creative industries — fashion, luxury brands, cosmetics, entertainment, music, and the hospitality industry.' });
        if (h11.includes('saturn')) sources.push({ icon: '\uD83D\uDCC7', source: 'Industry, Manufacturing & Long-term Investments', detail: 'Saturn in 11th brings slow but extremely reliable income from industry, real estate, construction, or long-term stock market investments. Gains increase significantly after age 36.' });
        if (h11.includes('rahu')) sources.push({ icon: '\uD83C\uDF10', source: 'Technology, Foreign Business & Unconventional Income', detail: 'Rahu in 11th is a powerful wealth indicator — income from foreign sources, technology, internet-based business, stock speculation, or unconventional entrepreneurship is strongly indicated.' });

        // 2nd house planets (accumulated wealth patterns)
        if (h2.includes('jupiter')) sources.push({ icon: '\uD83E\uDE99', source: 'Inherited Wealth & Family Money', detail: 'Jupiter in 2nd house indicates a wealthy family background and the ability to preserve and grow generational wealth.' });
        if (h2.includes('venus')) sources.push({ icon: '\uD83C\uDFDB', source: 'Luxury Trade, Jewelry & Art Investment', detail: 'Venus in 2nd shows wealth accumulated through luxury goods, jewelry, fine arts, and high-value asset trading.' });
        if (h2.includes('mercury')) sources.push({ icon: '\uD83D\uDCCA', source: 'Trading, Stock Market & Multiple Income Streams', detail: 'Mercury in 2nd creates a sharp financial mind — income comes through multiple simultaneous channels, including trading, finance, and intellectual work.' });

        // 8th house (sudden/unexpected wealth)
        if (h8.includes('jupiter') || h8.includes('venus')) sources.push({ icon: '\uD83C\uDFAF', source: 'Inheritance & Sudden Windfall', detail: 'Benefics in 8th house indicate possible inheritance, large unexpected financial gains, insurance payouts, or gains from a partner\'s income.' });
        if (rahuHouse === 11) sources.push({ icon: '\uD83D\uDCC8', source: 'Speculation, Crypto & High-Risk Investments', detail: 'Rahu placed exactly in the 11th house is a very strong indicator of massive gains through speculative investments — stocks, crypto, or high-risk business ventures.' });

        if (sources.length === 0) sources.push({ icon: '\u2696\uFE0F', source: 'Steady Salaried Income', detail: 'The planetary configuration suggests steady, consistent income from employment or service — less dependency on speculative or business income.' });

        return sources;
    }

    _propertyAnalysis(h4, venStr, satStr, moonStr, jupStr) {
        let propertyProspect = '', propertyTiming = '', details = [];

        // Calculate property score
        let pScore = 5;
        if (h4.includes('jupiter')) { pScore += 2; details.push('Jupiter in 4th house is the strongest indicator of owning large, valuable property — possibly multiple homes or ancestral land.'); }
        if (h4.includes('venus')) { pScore += 1.5; details.push('Venus in 4th house indicates beautiful, well-decorated property in prime locations, with a particular taste for luxurious home environments.'); }
        if (h4.includes('moon')) { pScore += 1; details.push('Moon in 4th brings emotional attachment to homeland and ancestral property — strong chance of inheriting or occupying family land.'); }
        if (h4.includes('mars')) { pScore += 0.5; details.push('Mars in 4th indicates buying or building property through active effort and real estate transactions — also possible construction business.'); }
        if (h4.includes('saturn')) { pScore -= 1; details.push('Saturn in 4th creates delays in property acquisition — first major property may come after age 35, but it will be long-lasting and substantial.'); }
        if (h4.includes('rahu')) { pScore += 0.5; details.push('Rahu in 4th can bring multiple property transactions, unconventional housing (foreign lands, unusual locations), and real estate speculation.'); }
        if (h4.includes('ketu')) { pScore -= 0.5; details.push('Ketu in 4th suggests detachment from property — you may not feel deeply connected to material real estate or may frequently change residences.'); }

        if (venStr === 'exalted') { pScore += 1.5; details.push('Exalted Venus ensures access to luxurious accommodations and high-value real estate throughout life.'); }
        if (jupStr === 'exalted' || jupStr === 'strong') { pScore += 1; details.push('Strong Jupiter is the guarantor of property ownership and stable housing in Vedic Jyotish — this significantly boosts property prospects.'); }
        if (satStr === 'debilitated') { pScore -= 0.5; details.push('Debilitated Saturn can cause structural issues with property, disputes over land, or difficulties in completing property transactions.'); }

        pScore = Math.max(0, Math.min(10, pScore));

        if (pScore >= 8) propertyProspect = '\uD83C\uDFE0 Excellent \u2014 Multiple property acquisitions likely, including ancestral and purchased real estate';
        else if (pScore >= 6) propertyProspect = '\uD83C\uDFE1 Very Good \u2014 Stable property ownership through personal effort and timing';
        else if (pScore >= 4) propertyProspect = '\u2696\uFE0F Moderate \u2014 Property possible but may come through struggle, delayed timing, or limited choices';
        else propertyProspect = '\u26A0\uFE0F Challenging \u2014 Property ownership requires significant effort, remedies, and patient timing';

        if (h4.includes('saturn') || satStr === 'debilitated') propertyTiming = 'Property acquisition is most stable after age 35-38. Avoid major real estate purchases during Saturn Mahadasha or when Saturn transits the 4th house.';
        else if (h4.includes('jupiter') || jupStr === 'exalted') propertyTiming = 'Jupiter Mahadasha and Jupiter transiting the 4th or 11th house are ideal windows for purchasing property. Jupiter\'s 12-year cycle brings major real estate opportunities.';
        else propertyTiming = 'Look for Venus or Jupiter transit over your 4th house or 11th house for favorable property purchase windows.';

        return { pScore: Math.round(pScore * 10) / 10, propertyProspect, propertyTiming, details };
    }

    _vehicleLuxury(venStr, venHouse, h4, h11, jupStr) {
        let vehicleProspect = '', luxuryLevel = '', details = [];

        let vScore = 5;
        if (venStr === 'exalted') { vScore += 3; details.push('Venus exalted in Pisces is the ultimate luxury indicator — access to premium vehicles, high-end lifestyle, fine dining, and opulent surroundings throughout life.'); }
        else if (venStr === 'strong') { vScore += 2; details.push('Venus in own sign provides consistent access to beautiful vehicles, fashionable clothing, refined taste, and comfortable lifestyle upgrades.'); }
        else if (venStr === 'debilitated') { vScore -= 1.5; details.push('Debilitated Venus may struggle to maintain luxury — vehicles may require frequent repairs, or luxury items come with significant financial strain.'); }

        if (h4.includes('venus')) { vScore += 1.5; details.push('Venus in 4th house is a direct indicator of owning personal vehicles and a comfortable, well-decorated home environment.'); }
        if (h4.includes('jupiter')) { vScore += 1; details.push('Jupiter in 4th house often brings large, high-quality vehicles — SUVs, premium sedans, or commercial vehicles as business assets.'); }
        if (h11.includes('venus')) { vScore += 1; details.push('Venus in 11th house indicates that luxury vehicles and comforts come through consistent income improvements — progressively upgrading lifestyle with age and career.'); }
        if (jupStr === 'exalted' || jupStr === 'strong') { vScore += 0.5; details.push('Strong Jupiter amplifies all material comforts, including vehicles, making premium models more accessible in Jupiter Mahadasha/antardasha periods.'); }

        vScore = Math.max(0, Math.min(10, vScore));

        if (vScore >= 8) { vehicleProspect = '\uD83D\uDE98 Premium \u2014 Luxury vehicles and high-end assets throughout life'; luxuryLevel = '\uD83D\uDC8E Ultra-Premium \u2014 Access to true luxury: fine dining, international travel, branded jewelry, premium real estate'; }
        else if (vScore >= 6) { vehicleProspect = '\uD83D\uDE97 Good \u2014 Comfortable, well-maintained vehicles with eventual upgrades'; luxuryLevel = '\u2728 High Comfort \u2014 Good quality of life, branded goods, comfortable travel, and regular lifestyle upgrades'; }
        else if (vScore >= 4) { vehicleProspect = '\uD83D\uDEF5 Moderate \u2014 Standard vehicles; luxury upgrades come gradually'; luxuryLevel = '\u2696\uFE0F Moderate Comfort \u2014 Functional lifestyle with occasional luxury experiences'; }
        else { vehicleProspect = '\uD83D\uDEB6 Minimal \u2014 Vehicle acquisition requires deliberate savings and timing'; luxuryLevel = '\u26A0\uFE0F Basic Comfort \u2014 Luxury is accessible during specific Dasha periods only'; }

        return { vehicleProspect, luxuryLevel, vScore: Math.round(vScore * 10) / 10, details };
    }

    _lossRisks(h12, h8, satStr, satHouse, rahuHouse) {
        const risks = [];
        const cautionPeriods = [];
        const protections = [];

        if (h12.includes('sun')) risks.push({ factor: 'Sun in 12th House', severity: 'High', detail: 'Sun in 12th can cause expenditure exceeding income, especially on healthcare, foreign travel, or prestige-related spending. Ego-driven financial decisions should be carefully monitored.' });
        if (h12.includes('mars')) risks.push({ factor: 'Mars in 12th House', severity: 'Moderate', detail: 'Mars in 12th creates risk of financial losses through impulsive decisions, legal battles, accidents, or hidden enemies deliberately undermining financial stability.' });
        if (h12.includes('rahu')) risks.push({ factor: 'Rahu in 12th House', severity: 'High', detail: 'Rahu in 12th house is a strong indicator of unchecked spending, foreign-related losses, addiction risks, or money disappearing through unknown channels.' });
        if (h12.includes('saturn')) risks.push({ factor: 'Saturn in 12th House', severity: 'Moderate', detail: 'Saturn in 12th suggests slow financial bleeding through chronic expenses, medical costs, or long-term obligations that quietly deplete savings.' });
        if (h8.includes('mars')) risks.push({ factor: 'Mars in 8th House', severity: 'Moderate', detail: 'Mars in 8th house brings risk of sudden accidental expenses, surgical costs, or financial losses through partner\'s decisions or hidden market forces.' });
        if (satStr === 'debilitated') risks.push({ factor: 'Debilitated Saturn', severity: 'High', detail: 'A weakened Saturn fails to provide the discipline and structure needed for long-term wealth building — money earned may not be preserved effectively.' });
        if (rahuHouse === 12) risks.push({ factor: 'Rahu in 12th', severity: 'High', detail: 'Rahu\'s placement here creates a constant psychological pull toward overspending on intangible pleasures, foreign travel, and speculative ventures.' });

        if (satHouse) cautionPeriods.push(`Saturn Mahadasha / Shani Dasha returns (7.5-year Sade Sati periods) — these windows require heightened financial caution and conservative investment choices.`);
        cautionPeriods.push('When Rahu or Ketu transit the 2nd, 8th, or 12th house — these windows (approximately every 18 months) can bring sudden financial surprises, both gains and losses.');
        cautionPeriods.push('When the lord of 12th house runs its Mahadasha — this period is classically associated with increased expenditure, giving, or foreign travel expenses.');

        protections.push('Maintain an emergency fund worth at least 6 months of expenses before taking on debt or large investments.');
        protections.push('Avoid speculative investments (cryptocurrency, options trading) during Rahu or Saturn Mahadasha unless the chart specifically shows 11th house strength.');
        protections.push('Worship Lord Vishnu or Goddess Lakshmi on Fridays. Recite Lakshmi Ashtakam for material protection and wealth preservation.');
        if (h12.includes('rahu') || rahuHouse === 12) protections.push('For Rahu in 12th: Donate to foreign relief charities or hospitals. Fast on Saturdays. Feed black dogs on Saturdays.');
        if (satStr === 'debilitated') protections.push('For debilitated Saturn: Touch the feet of elderly people daily. Donate iron or black sesame on Saturdays. Light sesame oil lamp under Peepal tree.');

        if (risks.length === 0) risks.push({ factor: 'No Major Loss Indicators', severity: 'Low', detail: 'Your planetary configuration does not show significant financial loss risks. Standard financial prudence (savings habit, insurance, diversification) will protect your wealth effectively.' });

        return { risks, cautionPeriods, protections };
    }

    _inheritance(h8, h2, planets) {
        let prospect = '', indicators = [];

        let iScore = 0;
        if (h8.includes('jupiter')) { iScore += 3; indicators.push('Jupiter in 8th house is the strongest inheritance indicator in Vedic astrology — this person is likely to receive significant wealth, property, or assets from an elder family member or spouse.'); }
        if (h8.includes('venus')) { iScore += 2; indicators.push('Venus in 8th house points to inheritance of luxury assets, jewelry, high-end vehicles, or art collections from family members.'); }
        if (h8.includes('moon')) { iScore += 1.5; indicators.push('Moon in 8th house suggests inheritance connected to maternal side of the family — ancestral property or savings from mother\'s lineage.'); }
        if (h8.includes('mercury')) { iScore += 1; indicators.push('Mercury in 8th indicates inheritance of intellectual properties — business, trade licenses, or accumulated savings from a family business.'); }
        if (h2.includes('jupiter')) { iScore += 1; indicators.push('Jupiter in 2nd house indicates a wealthy family background from which inheritance is naturally expected.'); }

        if (iScore >= 4) prospect = '\uD83D\uDCB0 Strong \u2014 Significant inheritance or unexpected windfall is strongly indicated in this chart';
        else if (iScore >= 2) prospect = '\uD83C\uDF81 Moderate \u2014 Some inheritance possible through family or partner connections';
        else if (iScore >= 1) prospect = '\uD83E\uDDB2 Mild \u2014 Minor inheritance or gifts from family are possible';
        else { prospect = '\uD83D\uDCBC Self-Made \u2014 Wealth is primarily self-generated; inheritance is not a significant factor'; indicators.push('Your chart indicates self-made wealth. While inheritance may not be a major financial source, your own earning potential and investments are the primary wealth-building mechanisms.'); }

        return { prospect, indicators };
    }

    _wealthTimeline(chart, jupStr, satStr, rahuHouse) {
        const events = [];

        events.push({ phase: 'Ages 15-25: Foundation Building', status: jupStr === 'exalted' || jupStr === 'strong' ? '\uD83C\uDF31 Favorable' : '\u26A0\uFE0F Moderate', note: jupStr === 'exalted' ? 'Strong Jupiter makes early financial decisions instinctively wise. This age sees building of skills and early earning potential.' : 'Financial foundation builds slowly. Focus on education and skill-building during this phase rather than wealth accumulation.' });

        events.push({ phase: 'Ages 25-35: Primary Earning Years', status: '\u2B50 Key Window', note: 'Venus and Mercury Dashas in this window strongly support career income growth. Business ventures started in Jupiter periods during this decade show strongest returns.' });

        events.push({ phase: 'Ages 35-50: Wealth Solidification', status: satStr === 'debilitated' ? '\u26A0\uFE0F Challenging' : '\uD83D\uDE80 Peak Phase', note: satStr === 'debilitated' ? 'Saturn Dasha challenges financial stability during this phase. Conservative investment, avoiding debt, and real estate are safer choices than speculation.' : 'Saturn Mahadasha during this window (if applicable) can bring slow but very stable wealth accumulation — especially in property and long-term investments.' });

        if (rahuHouse === 11 || rahuHouse === 2) {
            events.push({ phase: 'Rahu Mahadasha (18-year period)', status: '📈 High Volatility Window', note: 'This 18-year Rahu period contains the most dramatic financial swings in the entire lifetime — capable of generating wealth quickly OR causing sudden financial reversals. Speculative markets, foreign income, and technology businesses are highlighted.' });
        }

        events.push({ phase: 'Ages 50+: Wealth Preservation', status: '🏦 Stability Focus', note: 'After 50, financial focus should shift from accumulation to preservation. Strong Jupiter in the chart indicates generational wealth can be passed down. Spiritual charity (daan) during this phase activates Lakshmi protection.' });

        return events;
    }

    _wealthRemedies(jupStr, venStr, satStr, h12) {
        const remedies = [];

        remedies.push({ planet: 'General Lakshmi', mantra: 'Om Shreem Mahalakshmiye Namaha (108 times daily)', ritual: 'Light a ghee lamp facing east every Friday at sunrise. Keep a Lakshmi yantra in your home puja space.', gemstone: 'Keep a crystal quartz cluster in your home — it amplifies prosperity energy.' });

        if (jupStr === 'debilitated') {
            remedies.push({ planet: 'Jupiter (Guru) Remediation', mantra: 'Om Graam Greem Graum Sah Gurave Namaha (108 times on Thursdays)', ritual: 'Feed yellow sweets (besan ladoo) to pandits on Thursdays. Touch the feet of your teachers and spiritual guides regularly.', gemstone: 'Yellow Sapphire (Pukhraj) 3-5 carats in gold, worn on the index finger on Thursday morning after sunrise bath (consult expert).' });
        }
        if (venStr === 'debilitated') {
            remedies.push({ planet: 'Venus (Shukra) Remediation', mantra: 'Om Draam Dreem Draum Sah Shukraya Namaha (108 times on Fridays)', ritual: 'Donate white rice, white sugar, or white clothing to women on Fridays. Respect and serve women in your life, especially maternal figures.', gemstone: 'Diamond or White Topaz in silver, worn on the ring finger (consult expert).' });
        }
        if (satStr === 'debilitated') {
            remedies.push({ planet: 'Saturn (Shani) Remediation', mantra: 'Om Praam Preem Praum Sah Shanaischaraya Namaha (108 times on Saturdays)', ritual: 'Feed black sesame mixed with jaggery to crows every Saturday. Donate black blankets to the underprivileged on Saturdays.', gemstone: 'Blue Sapphire (Neelam) — ONLY after expert astrological consultation as this is a powerful and sensitive gemstone.' });
        }
        if (h12.includes('rahu') || h12.includes('saturn')) {
            remedies.push({ planet: 'Protection Against Financial Losses', mantra: 'Suktam Shri Suktam recitation on Fridays', ritual: 'Perform Rudrabhishek for protection against financial drains. Keep your accounts organized and review investments quarterly.', gemstone: 'Citrine or Green Aventurine in the northwest corner of your home or office for abundance magnetization.' });
        }

        return remedies;
    }
}
