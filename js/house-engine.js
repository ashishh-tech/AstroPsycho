/**
 * house-engine.js — Detailed 12-House Vedic Analysis
 * Analyzes every house, including empty ones, by calculating Lordship, Dispositors,
 * planetary placements, and aspects hitting the house.
 */

class HouseAnalysisEngine {
    constructor() {
        this.signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        this.signLords = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];

        // Core significations of the 12 Houses
        this.houseSignifications = [
            { name: "1st House (Lagna / Ascendant)", meaning: "Self, Physical Body, Vitality, Personality, General Life Path." },
            { name: "2nd House (Dhana Bhava)", meaning: "Wealth, Family, Speech, Food intake, Values, Early Education." },
            { name: "3rd House (Sahaja Bhava)", meaning: "Courage, Siblings, Short Travels, Communication, Writing, Skills." },
            { name: "4th House (Matru Bhava)", meaning: "Mother, Home, Real Estate, Vehicles, Inner Peace, Foundations." },
            { name: "5th House (Putra Bhava)", meaning: "Children, Romance, Intellect, Creativity, Speculation, Past Life Merit (Purva Punya)." },
            { name: "6th House (Ari Bhava)", meaning: "Enemies, Debts, Diseases, Daily Routine, Competitions, Service (Job)." },
            { name: "7th House (Kalatra Bhava)", meaning: "Marriage, Partnerships, Business, Public Image, Foreign Travels." },
            { name: "8th House (Ayu Bhava)", meaning: "Longevity, Sudden Events, Occult, Inheritance, Chronic Illness, Secrets." },
            { name: "9th House (Bhagya Bhava)", meaning: "Fortune, Dharma, Father, Religion, Higher Education, Long Travels." },
            { name: "10th House (Karma Bhava)", meaning: "Career, Profession, Status, Reputation, Authority, Government." },
            { name: "11th House (Labha Bhava)", meaning: "Gains, Income, Elder Siblings, Large Networks, Wish Fulfillment." },
            { name: "12th House (Vyaya Bhava)", meaning: "Losses, Expenses, Foreign Settlement, Spirituality, Hospitals, Bed Pleasures, Moksha." }
        ];
    }

    getHouseNumber(longitude, ascendant) {
        const offset = (longitude - ascendant + 360) % 360;
        return Math.floor(offset / 30) + 1;
    }

    // Which house is house number B relative to house number A
    getHouseFromHouse(houseA, houseB) {
        return (houseB - houseA + 12) % 12 + 1;
    }

    getAspects(planets, planetaryDetails, ascendant) {
        const houseAspects = {};
        for (let i = 1; i <= 12; i++) {
            houseAspects[i] = [];
        }

        Object.entries(planetaryDetails).forEach(([planet, pd]) => {
            if (planet === 'velocities') return;
            const h = pd.house;

            // Every planet aspects the 7th house from itself
            houseAspects[this.getHouseFromHouse(1, h + 6)].push(planet);

            // Special Aspects
            if (planet === 'mars') {
                houseAspects[this.getHouseFromHouse(1, h + 3)].push(planet); // 4th aspect
                houseAspects[this.getHouseFromHouse(1, h + 7)].push(planet); // 8th aspect
            } else if (planet === 'jupiter' || planet === 'rahu' || planet === 'ketu') {
                houseAspects[this.getHouseFromHouse(1, h + 4)].push(planet); // 5th aspect
                houseAspects[this.getHouseFromHouse(1, h + 8)].push(planet); // 9th aspect
            } else if (planet === 'saturn') {
                houseAspects[this.getHouseFromHouse(1, h + 2)].push(planet); // 3rd aspect
                houseAspects[this.getHouseFromHouse(1, h + 9)].push(planet); // 10th aspect
            }
        });

        // Remove duplicates
        for (let i = 1; i <= 12; i++) {
            houseAspects[i] = [...new Set(houseAspects[i])];
        }
        return houseAspects;
    }

    generate12HouseAnalysis(chart) {
        const { planets, ascendant, planetaryDetails } = chart;
        const lagnaSignIndex = Math.floor(ascendant / 30);
        const aspectsList = this.getAspects(planets, planetaryDetails, ascendant);

        const fullAnalysis = [];

        for (let h = 1; h <= 12; h++) {
            // 1. House Sign & Lord
            const signIndex = (lagnaSignIndex + h - 1) % 12;
            const signName = this.signs[signIndex];
            const lordPlanet = this.signLords[signIndex];
            const lordDetails = planetaryDetails[lordPlanet];

            // 2. Lord's Placement (Dispositor Impact)
            const lordHouse = lordDetails ? lordDetails.house : null;
            let lordStatus = 'Average';
            if (lordDetails) {
                if (lordDetails.status.includes('Exalted')) lordStatus = 'Excellent (Exalted)';
                else if (lordDetails.status.includes('Debilitated')) lordStatus = 'Weak (Debilitated)';
                else if (lordDetails.status.includes('Moolatrikona')) lordStatus = 'Very Strong (Moolatrikona)';
                else if (lordDetails.status.includes('Own')) lordStatus = 'Strong (Own Sign)';
                else if (lordDetails.status.includes('Friend')) lordStatus = 'Good (Friend Sign)';
                else if (lordDetails.status.includes('Neutral')) lordStatus = 'Average (Neutral Sign)';
                else if (lordDetails.status.includes('Enemy')) lordStatus = 'Challenged (Enemy Sign)';
            }

            const lordEffectDescription = this.evaluateLordPlacement(h, lordHouse, lordPlanet);

            // 3. Planets Placed In This House (Occupants/Conjunctions)
            const occupants = Object.keys(planetaryDetails).filter(p => planetaryDetails[p].house === h && p !== 'velocities');
            let occupantsDesc = 'Empty House. (This is normal and shifts focus to the ruling planet).';
            if (occupants.length > 0) {
                occupantsDesc = occupants.map(p => {
                    const status = planetaryDetails[p].status;
                    return `${p.charAt(0).toUpperCase() + p.slice(1)} (${status})`;
                }).join(', ');
            }

            // 4. Planets Aspecting This House
            const aspectingPlanets = aspectsList[h] || [];
            const aspectsDesc = aspectingPlanets.length > 0
                ? aspectingPlanets.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
                : 'None';

            // 5. Overall House Synthesis
            const synthesis = this.synthesizeHouse(h, lordStatus, occupants, aspectingPlanets, signName, lordPlanet, lordHouse);

            fullAnalysis.push({
                houseNumber: h,
                houseTitle: this.houseSignifications[h - 1].name,
                significations: this.houseSignifications[h - 1].meaning,
                sign: signName,
                lord: lordPlanet.charAt(0).toUpperCase() + lordPlanet.slice(1),
                lordPlacementHouse: lordHouse,
                lordStatus: lordStatus,
                lordEffect: lordEffectDescription,
                occupants: occupants,
                occupantsDesc: occupantsDesc,
                aspectingPlanets: aspectingPlanets,
                aspectsDesc: aspectsDesc,
                synthesis: synthesis
            });
        }

        return fullAnalysis;
    }

    evaluateLordPlacement(house, lordPlacedHouse, lordPlanet) {
        if (!lordPlacedHouse) return { en: "Information unavailable.", hi: "जानकारी उपलब्ध नहीं है।" };

        const hiName = {
            'sun': 'सूर्य', 'moon': 'चंद्र', 'mars': 'मंगल', 'mercury': 'बुध',
            'jupiter': 'गुरु', 'venus': 'शुक्र', 'saturn': 'शनि', 'rahu': 'राहु', 'ketu': 'केतु'
        };

        const originEn = [
            "your personality and overall life path",
            "your resources, wealth, and verbal expression",
            "your courage, sibling bonds, and communication skills",
            "your foundational peace, home, and mother",
            "your creative expression, intellect, and children",
            "your approach to illness, debts, and daily service",
            "your partnerships and public interactions",
            "your capacity for transformation and handling sudden events",
            "your fortune, higher beliefs, and luck",
            "your professional ambitions and status",
            "your capacity for gains and networking",
            "your spiritual growth, losses, and detachment"
        ];
        const originHi = [
            "आपके व्यक्तित्व और जीवन पथ",
            "आपके संसाधनों, धन और वाणी",
            "आपके साहस, भाई-बहनों और संचार कौशल",
            "आपकी आंतरिक शांति, घर और माता",
            "आपकी रचनात्मकता, बुद्धि और संतान",
            "आपके रोग, ऋण और दैनिक सेवा",
            "आपकी साझेदारियों और सार्वजनिक संपर्क",
            "आपकी परिवर्तन क्षमता और अचानक घटनाओं से निपटने",
            "आपके भाग्य, उच्च विश्वासों और लक्ष्मी",
            "आपकी व्यावसायिक महत्वाकांक्षाओं और प्रतिष्ठा",
            "आपकी लाभ क्षमता और नेटवर्किंग",
            "आपके आध्यात्मिक विकास, हानि और वैराग्य"
        ];
        const destEn = [
            "self-oriented focus and vitality",
            "financial assets and family dynamics",
            "relentless self-effort and dynamic communication",
            "domestic security and inner peace",
            "intellectual power and joyous creation",
            "overcoming obstacles and daily routines",
            "deep connection with others and business dealings",
            "unexpected spiritual changes and hidden depths",
            "divine guidance and philosophical wisdom",
            "authority, ambition, and career manifestation",
            "wish-fulfillment and expansive networks",
            "foreign energies and profound spiritual isolation"
        ];
        const destHi = [
            "आत्म-केंद्रित फोकस और जीवन शक्ति",
            "वित्तीय संपत्ति और पारिवारिक गतिशीलता",
            "अथक प्रयास और गतिशील संचार",
            "घरेलू सुरक्षा और आंतरिक शांति",
            "बौद्धिक शक्ति और आनंदपूर्ण सृजन",
            "बाधाओं पर विजय और दैनिक दिनचर्या",
            "दूसरों के साथ गहरा संबंध और व्यापारिक कार्य",
            "अप्रत्याशित आध्यात्मिक परिवर्तन और छिपी गहराइयाँ",
            "ईश्वरीय मार्गदर्शन और दार्शनिक ज्ञान",
            "अधिकार, महत्वाकांक्षा और करियर निर्माण",
            "इच्छा पूर्ति और व्यापक नेटवर्क",
            "विदेशी ऊर्जाएं और गहरी आध्यात्मिक एकांत"
        ];

        const pName = lordPlanet.charAt(0).toUpperCase() + lordPlanet.slice(1);
        const pNameHi = hiName[lordPlanet.toLowerCase()] || pName;
        const origin = originEn[house - 1];
        const originH = originHi[house - 1];
        const dest = destEn[lordPlacedHouse - 1];
        const destH = destHi[lordPlacedHouse - 1];

        if (house === lordPlacedHouse) {
            return {
                en: `${pName} sits proudly in its own house, making ${origin} extremely well-protected and naturally stronger in your life. This grants native stability here.`,
                hi: `${pNameHi} अपने ही भाव में बैठे हैं, जिससे ${originH} आपके जीवन में अत्यंत सुरक्षित और स्वाभाविक रूप से मजबूत है। यह यहाँ स्थायित्व प्रदान करता है।`
            };
        }

        const displacement = (lordPlacedHouse - house + 12) % 12 + 1;
        let enText = `The lord of this house (${pName}) has travelled to House ${lordPlacedHouse}, directly interlinking ${origin} with themes of ${dest}. `;
        let hiText = `इस भाव के स्वामी (${pNameHi}) भाव ${lordPlacedHouse} में गए हैं, जो ${originH} को सीधे ${destH} के विषयों से जोड़ता है। `;

        if ([6, 8, 12].includes(lordPlacedHouse)) {
            const typeEn = lordPlacedHouse === 6 ? "struggles and competition" : lordPlacedHouse === 8 ? "sudden disruption and chronic issues" : "expenses and detachment";
            const typeHi = lordPlacedHouse === 6 ? "संघर्ष और प्रतिस्पर्धा" : lordPlacedHouse === 8 ? "अचानक व्यवधान और दीर्घकालिक समस्याओं" : "खर्च और वैराग्य";
            enText += `House ${lordPlacedHouse} is a Dusthana (challenging house), so achieving goals here requires navigating through ${typeEn}, demanding profound resilience.`;
            hiText += `भाव ${lordPlacedHouse} एक दुस्थान है, इसलिए यहाँ लक्ष्य प्राप्त करने के लिए ${typeHi} से गुजरना पड़ेगा। यह गहरे लचीलेपन की मांग करता है।`;
        } else if ([1, 4, 7, 10].includes(lordPlacedHouse)) {
            enText += `House ${lordPlacedHouse} is a Kendra (angular house), so ${origin} will form a highly active, visible, and foundational pillar of your life journey.`;
            hiText += `भाव ${lordPlacedHouse} एक केंद्र है, इसलिए ${originH} आपके जीवन पथ का एक अत्यधिक सक्रिय और प्रमुख स्तंभ बनेगा।`;
        } else if ([5, 9].includes(lordPlacedHouse)) {
            enText += `House ${lordPlacedHouse} is a Trikona (auspicious trine), bringing natural luck, divine blessing, and effortless grace surrounding ${origin}.`;
            hiText += `भाव ${lordPlacedHouse} एक त्रिकोण (शुभ त्रिकोण) है, जो ${originH} के चारों ओर प्राकृतिक भाग्य, ईश्वरीय आशीर्वाद और सहज कृपा लाता है।`;
        } else if (displacement === 2 || displacement === 11) {
            enText += `This placement suggests steady financial or personal gains continually flowing through the matters of this house.`;
            hiText += `यह स्थिति इस भाव के विषयों से निरंतर स्थिर वित्तीय या व्यक्तिगत लाभ का संकेत देती है।`;
        } else if (displacement === 12) {
            enText += `Placed 12 houses away, it points to a loss or expenditure pattern here. Success demands a spiritual, selfless, or detached approach.`;
            hiText += `12वें स्थान पर होने से यहाँ हानि या व्यय का पैटर्न दिखता है। सफलता के लिए आध्यात्मिक एवं निःस्वार्थ दृष्टिकोण जरूरी है।`;
        } else {
            enText += `This creates a dynamic interaction between these life themes that requires constant balance and energy.`;
            hiText += `यह इन जीवन विषयों के बीच एक गतिशील संपर्क बनाता है जिसके लिए निरंतर संतुलन और ऊर्जा की आवश्यकता है।`;
        }

        return { en: enText, hi: hiText };

    }

    synthesizeHouse(h, lordStatus, occupants, aspectingPlanets, sign, lordPlanet, lordPlacedHouse) {
        const benefics = ['jupiter', 'venus', 'moon', 'mercury'];
        const malefics = ['saturn', 'mars', 'rahu', 'ketu', 'sun'];
        const dusthanaHouses = [6, 8, 12];
        const kendraHouses = [1, 4, 7, 10];
        const trikonaHouses = [1, 5, 9];

        // Hindi dictionary for dynamic names
        const hiName = {
            'sun': 'सूर्य', 'moon': 'चंद्र', 'mars': 'मंगल', 'mercury': 'बुध',
            'jupiter': 'गुरु', 'venus': 'शुक्र', 'saturn': 'शनि', 'rahu': 'राहु', 'ketu': 'केतु',
            'aries': 'मेष', 'taurus': 'वृषभ', 'gemini': 'मिथुन', 'cancer': 'कर्क',
            'leo': 'सिंह', 'virgo': 'कन्या', 'libra': 'तुला', 'scorpio': 'वृश्चिक',
            'sagittarius': 'धनु', 'capricorn': 'मकर', 'aquarius': 'कुंभ', 'pisces': 'मीन'
        };

        // Count influences
        let beneficsInHouse = occupants.filter(p => benefics.includes(p));
        let maleficsInHouse = occupants.filter(p => malefics.includes(p));
        let beneficsAspecting = aspectingPlanets.filter(p => benefics.includes(p));
        let maleficsAspecting = aspectingPlanets.filter(p => malefics.includes(p));

        const cap = p => p.charAt(0).toUpperCase() + p.slice(1);
        const listEn = arr => arr.map(cap).join(', ');
        const listHi = arr => arr.map(p => hiName[p.toLowerCase()] || p).join(', ');

        const sLordHi = hiName[lordPlanet.toLowerCase()];
        const sSignHi = sign ? hiName[sign.toLowerCase()] : '';

        // Score calculation
        let score = 5;
        if (lordStatus.includes('Excellent') || lordStatus.includes('Exalted') || lordStatus.includes('Moolatrikona')) score += 2.5;
        else if (lordStatus.includes('Strong')) score += 2;
        else if (lordStatus.includes('Good')) score += 1;
        else if (lordStatus.includes('Weak') || lordStatus.includes('Challenged')) score -= 2.5;

        if (dusthanaHouses.includes(h) && dusthanaHouses.includes(lordPlacedHouse)) score += 2; // Viparita

        score += beneficsInHouse.length * 2;
        score -= maleficsInHouse.length * 1.5;
        score += beneficsAspecting.length * 1;
        score -= maleficsAspecting.length * 0.8;

        const houseCoreEn = [
            "your Self, personal identity, physical vitality, and overall life direction",
            "your accumulated wealth, family harmony, speech quality, and sense of personal values",
            "your personal courage, relationship with siblings, communication abilities, and skill development",
            "your domestic peace, bond with your mother, property matters, and emotional foundations",
            "your creative intelligence, romantic life, relationship with children, and past life merits (Purva Punya)",
            "your daily health discipline, management of debts and enemies, and service-oriented work",
            "your marriage partnership, business relationships, public reputation, and ability to negotiate",
            "your resilience through sudden life changes, access to occult knowledge, and inheritance matters",
            "your long-term fortune, dharmic alignment, relationship with your father, and access to higher wisdom",
            "your professional status, career trajectory, public authority, and social reputation",
            "your capacity for financial gains, network of influential connections, and fulfillment of cherished desires",
            "your path toward moksha (liberation), foreign connections, handling of expenses, and deep spiritual practice"
        ];

        const houseCoreHi = [
            "आपके व्यक्तित्व, शारीरिक स्वास्थ्य, जीवन की दिशा और आत्म-पहचान",
            "आपके संचित धन, पारिवारिक सुख, वाणी और व्यक्तिगत मूल्यों",
            "आपके साहस, भाई-बहनों के साथ संबंध, संचार कौशल और पराक्रम",
            "आपकी मानसिक शांति, माता का सुख, संपत्ति और घरेलू नींव",
            "आपकी रचनात्मक बुद्धि, प्रेम जीवन, संतान सुख और पूर्व जन्म के पुण्यों",
            "आपके स्वास्थ्य अनुशासन, ऋण/शत्रु प्रबंधन और सेवा कार्य",
            "आपके वैवाहिक जीवन, व्यापारिक साझेदारी, सार्वजनिक छवि और जीवनसाथी",
            "अचानक होने वाले परिवर्तनों में आपका लचीलापन, गुप्त ज्ञान और विरासत",
            "आपके भाग्य, धर्म, पिता के साथ संबंध और उच्च ज्ञान",
            "आपके व्यावसायिक स्तर, करियर, सार्वजनिक अधिकार और सामाजिक प्रतिष्ठा",
            "आपके वित्तीय लाभ, प्रभावशाली संपर्कों और इच्छाओं की पूर्ति",
            "मोक्ष की ओर आपकी यात्रा, विदेशी संबंधों, खर्चों और आध्यात्मिक अभ्यास"
        ];

        const coreEn = houseCoreEn[h - 1];
        const coreHi = houseCoreHi[h - 1];

        let enParts = [];
        let hiParts = [];

        // 1. Occupants
        if (occupants.length > 0) {
            if (beneficsInHouse.length > 0 && maleficsInHouse.length === 0) {
                enParts.push(`<strong>Occupants' Energy:</strong> ${listEn(beneficsInHouse)} ${beneficsInHouse.length > 1 ? 'reside' : 'resides'} directly in this house, bestowing protective, expansive, and nurturing energy upon ${coreEn}.`);
                hiParts.push(`<strong>निवासी ऊर्जा:</strong> ${listHi(beneficsInHouse)} इस भाव में स्थित हैं, जो ${coreHi} पर सुरक्षात्मक, विस्तारवादी और पोषणकारी ऊर्जा प्रदान करते हैं।`);
            } else if (maleficsInHouse.length > 0 && beneficsInHouse.length === 0) {
                if (dusthanaHouses.includes(h)) {
                    enParts.push(`<strong>Occupants' Energy:</strong> ${listEn(maleficsInHouse)} ${maleficsInHouse.length > 1 ? 'occupy' : 'occupies'} this house. While malefics in a Dusthana (6th/8th/12th) can initially cause struggle, they simultaneously build extraordinary resilience, and for certain planets this constitutes Viparita Raja Yoga — potential reversal of fortune that ultimately elevates you.`);
                    hiParts.push(`<strong>निवासी ऊर्जा:</strong> ${listHi(maleficsInHouse)} इस भाव में हैं। यद्यपि दुस्थान (6/8/12) में पापी ग्रह प्रारंभिक संघर्ष का कारण बनते हैं, वे असाधारण लचीलापन भी बनाते हैं और कुछ मामलों में यह 'विपरीत राजयोग' बनाता है, जो अंततः सफलता दिलाता है।`);
                } else {
                    enParts.push(`<strong>Occupants' Energy:</strong> ${listEn(maleficsInHouse)} ${maleficsInHouse.length > 1 ? 'sit' : 'sits'} in this house, creating friction and karmic pressure upon ${coreEn}. This calls for heightened discipline, patience, and spiritual maturity to navigate the challenges these planetary energies impose.`);
                    hiParts.push(`<strong>निवासी ऊर्जा:</strong> ${listHi(maleficsInHouse)} इस भाव में स्थित हैं, जो ${coreHi} से जुड़े मामलों में संघर्ष और दबाव पैदा करते हैं। इन चुनौतियों को पार करने के लिए उच्च अनुशासन, धैर्य और आध्यात्मिक परिपक्वता की आवश्यकता होगी।`);
                }
            } else if (beneficsInHouse.length > 0 && maleficsInHouse.length > 0) {
                enParts.push(`<strong>Occupants' Energy:</strong> This house holds a mix of ${listEn(beneficsInHouse)} (benefic) and ${listEn(maleficsInHouse)} (malefic), creating a complex push-pull dynamic around ${coreEn}. You will experience both periods of graceful growth and seasons of intense challenge, often intertwined.`);
                hiParts.push(`<strong>निवासी ऊर्जा:</strong> यह भाव शुभ (${listHi(beneficsInHouse)}) और अशुभ (${listHi(maleficsInHouse)}) दोनों ग्रहों का मिश्रण रखता है, जो ${coreHi} में एक जटिल गतिशीलता बनाता है। आपको विकास और तीव्र चुनौती दोनों के मिश्रित परिणाम देखने को मिलेंगे।`);
            }
        } else {
            enParts.push(`<strong>Occupants' Energy:</strong> No planets are placed directly in this house — making the house lord ${sign ? `(${cap(lordPlanet)}, ruling the ${sign} sign here)` : ''} the primary governor of ${coreEn}. Its strength and placement in your chart are the critical deciding factors.`);
            hiParts.push(`<strong>निवासी ऊर्जा:</strong> इस भाव में सीधे तौर पर कोई ग्रह स्थित नहीं है - इसलिए भावेश ${sign ? `(यहाँ ${sSignHi} राशि के स्वामी ${sLordHi})` : ''} ही ${coreHi} के मुख्य नियंत्रक हैं। चार्ट में उनकी ताकत बहुत महत्वपूर्ण है।`);
        }

        // 2. Lord Status
        if (lordStatus.includes('Excellent') || lordStatus.includes('Exalted')) {
            enParts.push(`<strong>House Lord's Condition:</strong> The house lord (${cap(lordPlanet)}) is in an exalted state — one of the most powerful positions in Vedic Jyotish. This grants exceptional strength and inherent grace to ${coreEn}, enabling remarkable achievements with considerably less effort than average.`);
            hiParts.push(`<strong>भावेश की स्थिति:</strong> भावेश (${sLordHi}) उच्च (Exalted) अवस्था में हैं - जो ज्योतिष में सबसे शक्तिशाली स्थिति है। यह ${coreHi} को असाधारण शक्ति और जन्मजात कृपा प्रदान करता है, जिससे कम प्रयास में बड़ी सफलता मिलती है।`);
        } else if (lordStatus.includes('Moolatrikona')) {
            enParts.push(`<strong>House Lord's Condition:</strong> ${cap(lordPlanet)} occupies its Moolatrikona sign — a near-exalted, extremely stable position. This provides powerful, consistent, and long-lasting support to ${coreEn} throughout your life.`);
            hiParts.push(`<strong>भावेश की स्थिति:</strong> ${sLordHi} अपनी मूलत्रिकोण राशि में हैं - जो एक अत्यंत स्थिर स्थिति है। यह जीवन भर ${coreHi} को शक्तिशाली और सुसंगत समर्थन प्रदान करता है।`);
        } else if (lordStatus.includes('Strong')) {
            enParts.push(`<strong>House Lord's Condition:</strong> ${cap(lordPlanet)} is in its own sign, lending direct, pure, and unobstructed strength to ${coreEn}. This is a significantly positive configuration that gives you natural authority over these life themes.`);
            hiParts.push(`<strong>भावेश की स्थिति:</strong> ${sLordHi} अपनी स्वराशि में हैं, जो ${coreHi} को प्रत्यक्ष, शुद्ध और निर्बाध शक्ति दे रहा है। यह एक बहुत ही सकारात्मक विन्यास है जो आपको इन विषयों पर स्वाभाविक अधिकार देता है।`);
        } else if (lordStatus.includes('Good')) {
            enParts.push(`<strong>House Lord's Condition:</strong> ${cap(lordPlanet)} is positioned in a friendly sign, providing steady and reliable support to ${coreEn}. While not as powerfully placed as exaltation, this is a consistently positive and dependable influence.`);
            hiParts.push(`<strong>भावेश की स्थिति:</strong> ${sLordHi} मित्र राशि में स्थित हैं, जो ${coreHi} को स्थिर और विश्वसनीय समर्थन प्रदान कर रहे हैं। यह एक निरंतर सकारात्मक प्रभाव है।`);
        } else if (lordStatus.includes('Challenged') || lordStatus.includes('Weak')) {
            enParts.push(`<strong>House Lord's Condition:</strong> ${cap(lordPlanet)} is weakened in an enemy or debilitated sign. This is the primary challenge to ${coreEn} — the house is under-resourced, meaning you must work significantly harder to achieve results in this area. Remediation of ${cap(lordPlanet)} through gemstones, mantras, or service is strongly advisable.`);
            hiParts.push(`<strong>भावेश की स्थिति:</strong> ${sLordHi} शत्रु या नीच (Debilitated) राशि में कमजोर हैं। यह ${coreHi} के लिए मुख्य चुनौती है - आपको यहां परिणाम प्राप्त करने के लिए अधिक मेहनत करनी होगी। ${sLordHi} के उपाय (रत्न, मंत्र) करने की सलाह दी जाती है।`);
        } else {
            enParts.push(`<strong>House Lord's Condition:</strong> ${cap(lordPlanet)} holds a neutral position, indicating that ${coreEn} will produce moderate results — neither exceptionally blessed nor significantly burdened. Outcomes here rely heavily on timing (Dashas) and your sustained personal effort.`);
            hiParts.push(`<strong>भावेश की स्थिति:</strong> ${sLordHi} तटस्थ (Neutral) स्थिति में हैं, जो यह दर्शाता है कि ${coreHi} मध्यम परिणाम देगा। परिणाम काफी हद तक दशाओं और आपके निरंतर प्रयास पर निर्भर करेंगे।`);
        }

        // 3. Aspects
        if (aspectingPlanets.length > 0) {
            let aspEn = `<strong>Influence of Aspects:</strong> `;
            let aspHi = `<strong>दृष्टि का प्रभाव:</strong> `;
            if (beneficsAspecting.length > 0) {
                aspEn += `Benefic aspect${beneficsAspecting.length > 1 ? 's' : ''} from ${listEn(beneficsAspecting)} ${beneficsAspecting.length > 1 ? 'cast' : 'casts'} a protective and amplifying gaze upon this house, adding a layer of divine grace and occasional good fortune to ${coreEn}. `;
                aspHi += `${listHi(beneficsAspecting)} की शुभ दृष्टि इस भाव पर पड़ रही है, जो ${coreHi} में ईश्वरीय कृपा और सौभाग्य का आवरण जोड़ती है। `;
            }
            if (maleficsAspecting.length > 0) {
                aspEn += `However, ${listEn(maleficsAspecting)} ${maleficsAspecting.length > 1 ? 'aspect' : 'aspects'} this house from a distance, creating periodic tension and demanding conscious effort, discipline, or karmic purification in matters relating to ${coreEn}.`;
                aspHi += `हालांकि, ${listHi(maleficsAspecting)} की दूर से दृष्टि इस भाव पर है, जो समय-समय पर तनाव पैदा करती है और ${coreHi} के मामलों में सचेत प्रयास और अनुशासन की मांग करती है।`;
            }
            enParts.push(aspEn.trim());
            hiParts.push(aspHi.trim());
        }

        // 4. Lord placement
        if (lordPlacedHouse) {
            if (trikonaHouses.includes(lordPlacedHouse) && !kendraHouses.includes(h)) {
                enParts.push(`<strong>Lord's Placement:</strong> With the house lord placed in a Trikona (House ${lordPlacedHouse}), divine luck and past life merit flow naturally into ${coreEn}. This is one of the most auspicious lord placements in the chart.`);
                hiParts.push(`<strong>भावेश का स्थान:</strong> भावेश के त्रिकोण (भाव ${lordPlacedHouse}) में होने से, ईश्वरीय भाग्य और पूर्व जन्म के पुण्य स्वाभाविक रूप से ${coreHi} में प्रवाहित होते हैं। यह अत्यधिक शुभ स्थिति है।`);
            } else if (kendraHouses.includes(lordPlacedHouse)) {
                enParts.push(`<strong>Lord's Placement:</strong> The lord's placement in a Kendra house (House ${lordPlacedHouse}) makes ${coreEn} a prominent, active, and highly visible theme in your life — one that you will actively shape and build upon.`);
                hiParts.push(`<strong>भावेश का स्थान:</strong> भावेश का केंद्र (भाव ${lordPlacedHouse}) में बैठना ${coreHi} को आपके जीवन का एक अत्यधिक सक्रिय और प्रमुख विषय बनाता है, जिसे आप स्वयं आकार देंगे।`);
            } else if (dusthanaHouses.includes(lordPlacedHouse)) {
                enParts.push(`<strong>Lord's Placement:</strong> The house lord in House ${lordPlacedHouse} (a Dusthana) signals that progress in ${coreEn} will require navigating genuine hardship, disruptions, or losses. However, this also trains deep inner strength and can produce dramatic reversals of fortune (Viparita potential).`);
                hiParts.push(`<strong>भावेश का स्थान:</strong> भावेश का दुस्थान (भाव ${lordPlacedHouse}) में होना यह संकेत देता है कि ${coreHi} में प्रगति के लिए कठिनाइयों और बाधाओं को पार करना होगा। यह जीवन में गहरी आंतरिक शक्ति का निर्माण करेगा।`);
            }
        }

        // 5. Verdict
        let verdictEn = `<strong>Synthesis & Conclusion:</strong> `, verdictHi = `<strong>निष्कर्ष:</strong> `;
        const vIndex = (h + Math.floor(score)) % 3;

        if (score >= 9) {
            const arrEn = [
                `✨ This is one of the strongest houses in your birth chart. ${cap(coreEn)} flows with remarkable divine support, and your life path in this domain is exceptionally well-configured for achievement and fulfilment.`,
                `✨ The planetary energies here are exceptionally blessed. You will find that matters regarding ${coreEn} manifest with grace, profound luck, and minimal friction.`,
                `✨ This domain is a powerful pillar in your chart. The universe provides extraordinary backing for ${coreEn}, setting you up for sustained success and natural mastery here.`
            ];
            const arrHi = [
                `✨ यह आपके चार्ट के सबसे मजबूत भावों में से एक है। ${coreHi} को असाधारण ईश्वरीय समर्थन प्राप्त है, और यह क्षेत्र अत्यंत सफलता के लिए बना है।`,
                `✨ यहाँ की ग्रहीय ऊर्जा अत्यंत शुभ है। आप पाएंगे कि ${coreHi} से जुड़े मामले असीम कृपा, भाग्य और न्यूनतम संघर्ष के साथ प्रकट होते हैं।`,
                `✨ यह क्षेत्र आपके चार्ट का एक शक्तिशाली स्तंभ है। ब्रह्मांड ${coreHi} के लिए असाधारण समर्थन प्रदान करता है, जो आपको सफलता की ओर ले जाता है।`
            ];
            verdictEn += arrEn[vIndex];
            verdictHi += arrHi[vIndex];
        } else if (score >= 7) {
            const arrEn = [
                `🌟 This house is well-supported. With deliberate effort and awareness of its timing triggers (Dashas), ${coreEn} will yield deeply rewarding, stable, and meaningful outcomes in your life.`,
                `🌟 There is a strong, positive foundation here. While you must still put in the work, your efforts toward ${coreEn} are highly favored to bring growth and substantial rewards.`,
                `🌟 The underlying energy here is highly favorable. Cultivating patience and aligning with the right planetary periods will ensure ${coreEn} continues to flourish.`
            ];
            const arrHi = [
                `🌟 यह भाव अच्छी तरह से समर्थित है। जानबूझकर किए गए प्रयासों और सही दशाओं के दौरान, ${coreHi} आपको अत्यंत लाभकारी और स्थिर परिणाम प्रदान करेगा।`,
                `🌟 यहाँ एक मजबूत और सकारात्मक नींव है। हालाँकि आपको अभी भी काम करना होगा, ${coreHi} की दिशा में आपके प्रयास अत्यधिक अनुकूल हैं।`,
                `🌟 अंतर्निहित ऊर्जा यहाँ अत्यधिक अनुकूल है। सही ग्रहीय अवधियों के साथ तालमेल बिठाने से ${coreHi} फलता-फूलता रहेगा।`
            ];
            verdictEn += arrEn[vIndex];
            verdictHi += arrHi[vIndex];
        } else if (score >= 5) {
            const arrEn = [
                `⚖️ This house carries mixed energies. Your experience of ${coreEn} will oscillate between favorable periods and challenging ones — Dasha timing will be a decisive factor in when opportunities open and when obstacles arise.`,
                `⚖️ A dynamic balance characterizes this area of your life. ${cap(coreEn)} will require adaptability as you navigate alternating cycles of steady progress and necessary course corrections.`,
                `⚖️ The influences here are neutral to mixed. Success regarding ${coreEn} isn't simply handed to you, but it isn't blocked either; it directly reflects the karma and conscious effort you choose to invest.`
            ];
            const arrHi = [
                `⚖️ इस भाव में मिश्रित ऊर्जाएं हैं। ${coreHi} को लेकर आपके अनुभव अनुकूल और चुनौतीपूर्ण अवधियों के बीच झूलेंगे - अवसर और बाधाएं काफी हद तक 'दशा' पर निर्भर करेंगी।`,
                `⚖️ आपके जीवन के इस क्षेत्र में एक गतिशील संतुलन है। ${coreHi} में निरंतर प्रगति और आवश्यक सुधार के चक्रों से गुजरते हुए आपको अनुकूलनशीलता की आवश्यकता होगी।`,
                `⚖️ यहाँ के प्रभाव तटस्थ या मिश्रित हैं। ${coreHi} के संबंध में सफलता आसानी से नहीं मिलती, लेकिन यह अवरुद्ध भी नहीं है; यह सीधे आपके कर्म को दर्शाती है।`
            ];
            verdictEn += arrEn[vIndex];
            verdictHi += arrHi[vIndex];
        } else if (score >= 3) {
            const arrEn = [
                `⚠️ This is a karmically demanding house. Meaningful progress in ${coreEn} will require sustained patience, specific planetary remedies, and a willingness to learn from setbacks rather than being defeated by them.`,
                `⚠️ The energies here present notable friction. You are being pushed to develop resilience, as ${coreEn} will likely test your boundaries before yielding its eventual rewards.`,
                `⚠️ This domain requires careful navigation. To unlock positive outcomes in ${coreEn}, you must embrace discipline and look toward spiritual or astrological remediation to smooth the path.`
            ];
            const arrHi = [
                `⚠️ यह एक उच्च-कर्म वाला भाव है। ${coreHi} में सार्थक प्रगति के लिए निरंतर धैर्य, विशिष्ट ग्रह उपायों और असफलताओं से सीखने की इच्छा की आवश्यकता होगी।`,
                `⚠️ यहाँ की ऊर्जा में बहुत संघर्ष है। आपको लचीलापन विकसित करने के लिए प्रेरित किया जा रहा है, क्योंकि ${coreHi} संभवतः लाभ देने से पहले आपकी सीमाओं का परीक्षण करेगा।`,
                `⚠️ इस क्षेत्र में सावधानीपूर्वक नेविगेशन की आवश्यकता है। ${coreHi} में सकारात्मक परिणाम अनलॉक करने के लिए आपको अनुशासन अपनाना होगा।`
            ];
            verdictEn += arrEn[vIndex];
            verdictHi += arrHi[vIndex];
        } else {
            const arrEn = [
                `🔥 This is a high-intensity karmic area. The soul has chosen a path of deep purification and growth through ${coreEn}. Spiritual practices, humility, and consistent remedies are not optional here — they are the essential keys to transformation.`,
                `🔥 A zone of profound challenge and eventual rebirth. Matters involving ${coreEn} will demand your highest spiritual maturity, stripping away illusions to build ultimate inner strength.`,
                `🔥 The planetary alignment here is highly demanding. Navigating ${coreEn} will be a central theme of overcoming adversity in your life, requiring deep surrender and karmic healing.`
            ];
            const arrHi = [
                `🔥 यह एक उच्च-तीव्रता वाला क्षेत्र है। आत्मा ने ${coreHi} के माध्यम से गहरी शुद्धि का मार्ग चुना है। आध्यात्मिक अभ्यास और निरंतर उपाय यहां परिवर्तन की आवश्यक कुंजी हैं।`,
                `🔥 गहरी चुनौती और अंततः पुनर्जन्म का एक क्षेत्र। ${coreHi} से जुड़े मामलों में आपकी सर्वोच्च आध्यात्मिक परिपक्वता की आवश्यकता होगी।`,
                `🔥 यहाँ का ग्रहीय संरेखण अत्यधिक मांग वाला है। ${coreHi} आपके जीवन में विपरीत परिस्थितियों पर काबू पाने का एक केंद्रीय विषय होगा।`
            ];
            verdictEn += arrEn[vIndex];
            verdictHi += arrHi[vIndex];
        }

        enParts.push(verdictEn);
        hiParts.push(verdictHi);

        return {
            en: `<ul style="margin: 0; padding-left: 1.2rem;"><li>${enParts.join('</li><li style="margin-top:0.6rem">')}</li></ul>`,
            hi: `<ul style="margin: 0; padding-left: 1.2rem;"><li>${hiParts.join('</li><li style="margin-top:0.6rem">')}</li></ul>`
        };
    }
}
