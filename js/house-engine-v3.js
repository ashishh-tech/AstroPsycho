/**
 * AstroPsycho — House Analysis Engine v3.0
 * Deep Parashari Vedic Content with Planet-in-House Effects
 */

class HouseAnalysisEngine {
  constructor() {
    this.signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    this.signLords = { Aries:'Mars', Taurus:'Venus', Gemini:'Mercury', Cancer:'Moon', Leo:'Sun', Virgo:'Mercury', Libra:'Venus', Scorpio:'Mars', Sagittarius:'Jupiter', Capricorn:'Saturn', Aquarius:'Saturn', Pisces:'Jupiter' };

    this.planetNameHi = { sun:'सूर्य', moon:'चंद्र', mars:'मंगल', mercury:'बुध', jupiter:'गुरु', venus:'शुक्र', saturn:'शनि', rahu:'राहु', ketu:'केतु' };

    this._initSignifications();
    this._initPlanetInHouseEffects();
  }

  // ── Bilingual House Significations ──
  _initSignifications() {
    this.houseSignifications = {};
    const data = [
      ["Self, physical body, personality, temperament, vitality, health, early childhood, self-image, willpower, and the soul's primary expression.", "स्वयं, शरीर, व्यक्तित्व, स्वभाव, स्वास्थ्य, प्रारंभिक जीवन, आत्म-छवि, इच्छाशक्ति, और आत्मा की मुख्य अभिव्यक्ति।"],
      ["Accumulated wealth, family lineage, speech and voice, food habits, face, values, early education, and self-earned resources.", "संचित धन, परिवार, वाणी और स्वर, खान-पान, चेहरा, मूल्य, प्रारंभिक शिक्षा, और स्वयं के संसाधन।"],
      ["Courage, siblings, short travels, communication, writing, media, hands and arms, desires, neighbors, and self-made efforts.", "साहस, भाई-बहन, छोटी यात्राएं, संचार, लेखन, मीडिया, हाथ, इच्छाशक्ति, पड़ोसी, और स्वबल।"],
      ["Mother, home, real estate, heart, emotional foundation, education, vehicles, private life, and deepest psychological roots.", "माता, घर, अचल संपत्ति, हृदय, भावनात्मक नींव, शिक्षा, वाहन, निजी जीवन, और मनोवैज्ञानिक जड़ें।"],
      ["Intelligence, creativity, children, romantic love, speculation, past-life merits (Purva Punya), mantras, sports, and purest joy.", "बुद्धि, सृजनशीलता, संतान, प्रेम, सट्टा, पूर्व पुण्य, मंत्र, खेल, और आनंद।"],
      ["Enemies, debts, diseases, daily service, servants, competition, litigation, maternal uncle, digestion, and overcoming adversity.", "शत्रु, ऋण, रोग, दैनिक सेवा, सेवक, प्रतिस्पर्धा, मुकदमा, मामा, पाचन, और विपत्ति पर विजय।"],
      ["Marriage and life partner, business partnerships, open enemies, public image, foreign travel, contracts, and committed relationships.", "विवाह और जीवनसाथी, व्यापार साझेदारी, खुले शत्रु, सार्वजनिक छवि, विदेश, अनुबंध, और प्रतिबद्ध संबंध।"],
      ["Longevity, transformation, hidden matters, occult, inheritance, sexual energy, sudden events, chronic illness, research, and deepest karmic lessons.", "आयु, परिवर्तन, गुप्त विषय, तंत्र, विरासत, यौन ऊर्जा, अचानक घटनाएं, पुरानी बीमारी, शोध, और गहरे कार्मिक पाठ।"],
      ["Dharma, fortune, father, long travels, philosophy, religion, higher education, Guru, law, and past-life blessings.", "धर्म, भाग्य, पिता, दूर की यात्राएं, दर्शन, धर्म, उच्च शिक्षा, गुरु, कानून, और पूर्व जन्म के आशीर्वाद।"],
      ["Career, public reputation, authority, government, ambition, father's legacy, superiors, visible achievements, and worldly karma.", "करियर, प्रतिष्ठा, सत्ता, सरकार, महत्वाकांक्षा, पिता की विरासत, अधिकारी, उपलब्धियां, और सांसारिक कर्म।"],
      ["Gains, income, desire fulfillment, elder siblings, social networks, friends, awards, and material rewards from effort.", "लाभ, आय, इच्छा पूर्ति, बड़े भाई-बहन, सामाजिक नेटवर्क, मित्र, पुरस्कार, और प्रयास का भौतिक फल।"],
      ["Moksha, foreign lands, losses, expenses, isolation, sleep, dreams, hospitals, hidden enemies, spiritual practices, and ego dissolution.", "मोक्ष, विदेश, हानि, व्यय, एकांत, नींद, स्वप्न, अस्पताल, छुपे शत्रु, आध्यात्मिक साधना, और अहंकार विलय।"]
    ];
    for (let i = 0; i < 12; i++) {
      this.houseSignifications[i + 1] = { en: data[i][0], hi: data[i][1] };
    }
  }

  // ── Planet-in-House Effects placeholder — filled by _initPlanetInHouseEffects ──
  _initPlanetInHouseEffects() {
    // Will be populated in separate part files
    this.planetInHouseEffects = {};
  }

  // ── Core calculation methods (kept from v1) ──
  getHouseNumber(longitude, ascendant) {
    return Math.floor(((longitude - ascendant + 360) % 360) / 30) + 1;
  }

  getAspects(planetaryDetails) {
    const houseAspects = {};
    for (let i = 1; i <= 12; i++) houseAspects[i] = [];

    Object.entries(planetaryDetails).forEach(([planet, pd]) => {
      if (planet === 'velocities') return;
      const h = pd.house;
      const target7 = ((h + 6 - 1) % 12) + 1;
      houseAspects[target7].push(planet);

      if (planet === 'mars') {
        houseAspects[((h + 3 - 1) % 12) + 1].push(planet);
        houseAspects[((h + 7 - 1) % 12) + 1].push(planet);
      } else if (planet === 'jupiter' || planet === 'rahu' || planet === 'ketu') {
        houseAspects[((h + 4 - 1) % 12) + 1].push(planet);
        houseAspects[((h + 8 - 1) % 12) + 1].push(planet);
      } else if (planet === 'saturn') {
        houseAspects[((h + 2 - 1) % 12) + 1].push(planet);
        houseAspects[((h + 9 - 1) % 12) + 1].push(planet);
      }
    });
    for (let i = 1; i <= 12; i++) houseAspects[i] = [...new Set(houseAspects[i])];
    return houseAspects;
  }

  // ── Main Analysis Generator ──
  generate12HouseAnalysis(chart) {
    const { planets, ascendant, planetaryDetails } = chart;
    const lagnaSignIndex = Math.floor(ascendant / 30);
    const aspectsList = this.getAspects(planetaryDetails);
    const fullAnalysis = [];

    for (let h = 1; h <= 12; h++) {
      const signIndex = (lagnaSignIndex + h - 1) % 12;
      const signName = this.signs[signIndex];
      const lordPlanet = this.signLords[signName];
      const lordKey = lordPlanet.toLowerCase();
      const lordDetails = planetaryDetails[lordKey];
      const lordHouse = lordDetails ? lordDetails.house : null;

      // Lord status
      let lordStatus = 'Average';
      if (lordDetails) {
        const s = lordDetails.status;
        if (s.includes('Exalted')) lordStatus = 'Excellent (Exalted)';
        else if (s.includes('Debilitated')) lordStatus = 'Weak (Debilitated)';
        else if (s.includes('Moolatrikona')) lordStatus = 'Very Strong (Moolatrikona)';
        else if (s.includes('Own')) lordStatus = 'Strong (Own Sign)';
        else if (s.includes('Friend')) lordStatus = 'Good (Friend Sign)';
        else if (s.includes('Neutral')) lordStatus = 'Average (Neutral)';
        else if (s.includes('Enemy')) lordStatus = 'Challenged (Enemy Sign)';
      }

      // Occupants
      const occupants = Object.keys(planetaryDetails).filter(p => planetaryDetails[p].house === h && p !== 'velocities');

      // Aspecting planets
      const aspectingPlanets = aspectsList[h] || [];

      // Lord effect (bilingual)
      const lordEffect = this._getLordPlacementEffect(h, lordHouse, lordPlanet);

      // Occupant effects (specific Parashari)
      const occupantEffects = this._getOccupantEffects(h, occupants);

      // Synthesis
      const synthesis = this._synthesizeHouse(h, lordStatus, occupants, aspectingPlanets, signName, lordPlanet, lordHouse, occupantEffects);

      fullAnalysis.push({
        houseNumber: h,
        houseTitle: this._getHouseTitle(h),
        significations: this.houseSignifications[h],
        sign: signName,
        lord: lordPlanet,
        lordPlacementHouse: lordHouse,
        lordStatus,
        lordEffect,
        occupants,
        occupantEffects,
        aspectingPlanets,
        synthesis
      });
    }
    return fullAnalysis;
  }

  _getHouseTitle(h) {
    const titles = {
      1: { en: "1st House (Lagna)", hi: "प्रथम भाव (लग्न)" },
      2: { en: "2nd House (Dhana)", hi: "द्वितीय भाव (धन)" },
      3: { en: "3rd House (Sahaja)", hi: "तृतीय भाव (सहज)" },
      4: { en: "4th House (Sukha)", hi: "चतुर्थ भाव (सुख)" },
      5: { en: "5th House (Putra)", hi: "पंचम भाव (पुत्र)" },
      6: { en: "6th House (Ripu)", hi: "षष्ठ भाव (रिपु)" },
      7: { en: "7th House (Kalatra)", hi: "सप्तम भाव (कलत्र)" },
      8: { en: "8th House (Ayu)", hi: "अष्टम भाव (आयु)" },
      9: { en: "9th House (Bhagya)", hi: "नवम भाव (भाग्य)" },
      10: { en: "10th House (Karma)", hi: "दशम भाव (कर्म)" },
      11: { en: "11th House (Labha)", hi: "एकादश भाव (लाभ)" },
      12: { en: "12th House (Vyaya)", hi: "द्वादश भाव (व्यय)" }
    };
    return titles[h];
  }

  _getOccupantEffects(house, occupants) {
    if (!occupants.length || !this.planetInHouseEffects) return [];
    return occupants.map(p => {
      const key = p.charAt(0).toUpperCase() + p.slice(1);
      const effects = this.planetInHouseEffects[key];
      if (effects && effects[house]) return { planet: p, effect: effects[house] };
      return { planet: p, effect: null };
    });
  }

  _getLordPlacementEffect(house, lordPlacedHouse, lordPlanet) {
    if (!lordPlacedHouse) return { en: "Information unavailable.", hi: "जानकारी उपलब्ध नहीं।" };
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const pEn = cap(lordPlanet);
    const pHi = this.planetNameHi[lordPlanet.toLowerCase()] || pEn;
    const dusthana = [6, 8, 12];
    const kendra = [1, 4, 7, 10];
    const trikona = [1, 5, 9];

    if (house === lordPlacedHouse) {
      return {
        en: `${pEn} sits in its own house, making this domain extremely well-protected and naturally strong. This grants exceptional stability.`,
        hi: `${pHi} अपने ही भाव में विराजमान हैं, जिससे यह क्षेत्र अत्यंत सुरक्षित और स्वाभाविक रूप से मजबूत है। यह असाधारण स्थायित्व प्रदान करता है।`
      };
    }

    let en = `The lord ${pEn} has moved to House ${lordPlacedHouse}, linking this house's themes with House ${lordPlacedHouse}'s domain. `;
    let hi = `स्वामी ${pHi} भाव ${lordPlacedHouse} में गए हैं, जो इस भाव के विषयों को भाव ${lordPlacedHouse} से जोड़ता है। `;

    if (dusthana.includes(lordPlacedHouse)) {
      en += `Placed in a Dusthana, progress here requires navigating hardship, but it also builds extraordinary inner strength and potential Viparita Raja Yoga.`;
      hi += `दुस्थान में होने से यहाँ प्रगति के लिए कठिनाइयों से गुजरना होगा, पर यह विपरीत राजयोग की संभावना भी बनाता है।`;
    } else if (trikona.includes(lordPlacedHouse)) {
      en += `Placed in a Trikona, divine luck and past-life merit flow naturally into this house — one of the most auspicious placements.`;
      hi += `त्रिकोण में होने से इस भाव में ईश्वरीय भाग्य और पूर्व पुण्य स्वाभाविक रूप से प्रवाहित होते हैं — अत्यंत शुभ स्थिति।`;
    } else if (kendra.includes(lordPlacedHouse)) {
      en += `Placed in a Kendra, this house's themes become a prominent, active, and visible pillar of your life.`;
      hi += `केंद्र में होने से इस भाव के विषय आपके जीवन का एक प्रमुख और सक्रिय स्तंभ बनते हैं।`;
    } else {
      en += `This creates a dynamic interaction between these life themes requiring balance and effort.`;
      hi += `यह इन जीवन विषयों के बीच एक गतिशील संपर्क बनाता है जिसमें संतुलन आवश्यक है।`;
    }
    return { en, hi };
  }

  _synthesizeHouse(h, lordStatus, occupants, aspectingPlanets, sign, lordPlanet, lordHouse, occupantEffects) {
    const benefics = ['jupiter', 'venus', 'moon', 'mercury'];
    const malefics = ['saturn', 'mars', 'rahu', 'ketu', 'sun'];
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const hiName = this.planetNameHi;

    let beneficsIn = occupants.filter(p => benefics.includes(p));
    let maleficsIn = occupants.filter(p => malefics.includes(p));
    let beneficsAsp = aspectingPlanets.filter(p => benefics.includes(p));
    let maleficsAsp = aspectingPlanets.filter(p => malefics.includes(p));

    // Score
    let score = 5;
    if (lordStatus.includes('Exalted') || lordStatus.includes('Moolatrikona')) score += 2.5;
    else if (lordStatus.includes('Strong')) score += 2;
    else if (lordStatus.includes('Good')) score += 1;
    else if (lordStatus.includes('Weak') || lordStatus.includes('Challenged')) score -= 2.5;
    if ([6,8,12].includes(h) && [6,8,12].includes(lordHouse)) score += 2;
    score += beneficsIn.length * 2 - maleficsIn.length * 1.5;
    score += beneficsAsp.length * 1 - maleficsAsp.length * 0.8;

    let enParts = [], hiParts = [];

    // Specific planet effects (NEW in v3)
    if (occupantEffects && occupantEffects.length > 0) {
      occupantEffects.forEach(oe => {
        if (oe.effect) {
          const pHi = hiName[oe.planet] || cap(oe.planet);
          enParts.push(`<strong>${cap(oe.planet)} in this House:</strong> ${oe.effect.en}`);
          hiParts.push(`<strong>${pHi} इस भाव में:</strong> ${oe.effect.hi}`);
        }
      });
    }

    if (occupants.length === 0) {
      enParts.push(`<strong>Occupants:</strong> No planets placed here — the house lord ${cap(lordPlanet)} is the primary governor.`);
      hiParts.push(`<strong>निवासी:</strong> कोई ग्रह यहाँ नहीं — भावेश ${hiName[lordPlanet.toLowerCase()] || lordPlanet} ही मुख्य नियंत्रक हैं।`);
    }

    // Lord condition
    const pHi = hiName[lordPlanet.toLowerCase()] || lordPlanet;
    if (lordStatus.includes('Exalted')) {
      enParts.push(`<strong>Lord's Strength:</strong> ${cap(lordPlanet)} is Exalted — one of the most powerful positions, granting exceptional grace to this house.`);
      hiParts.push(`<strong>भावेश की शक्ति:</strong> ${pHi} उच्च अवस्था में — सबसे शक्तिशाली स्थिति, इस भाव को असाधारण कृपा प्रदान करती है।`);
    } else if (lordStatus.includes('Weak') || lordStatus.includes('Challenged')) {
      enParts.push(`<strong>Lord's Strength:</strong> ${cap(lordPlanet)} is weakened — this house needs remediation through mantras, gemstones, or spiritual discipline.`);
      hiParts.push(`<strong>भावेश की शक्ति:</strong> ${pHi} कमजोर हैं — इस भाव को मंत्र, रत्न या साधना से उपाय की आवश्यकता है।`);
    }

    // Aspects
    if (aspectingPlanets.length > 0) {
      let aspEn = '<strong>Aspects:</strong> ';
      let aspHi = '<strong>दृष्टि:</strong> ';
      if (beneficsAsp.length > 0) {
        aspEn += `Benefic gaze from ${beneficsAsp.map(cap).join(', ')} adds divine protection. `;
        aspHi += `${beneficsAsp.map(p => hiName[p] || p).join(', ')} की शुभ दृष्टि ईश्वरीय सुरक्षा जोड़ती है। `;
      }
      if (maleficsAsp.length > 0) {
        aspEn += `${maleficsAsp.map(cap).join(', ')} aspect creates periodic tension and demands discipline.`;
        aspHi += `${maleficsAsp.map(p => hiName[p] || p).join(', ')} की दृष्टि तनाव बनाती है और अनुशासन माँगती है।`;
      }
      enParts.push(aspEn.trim());
      hiParts.push(aspHi.trim());
    }

    // Verdict
    let vEn, vHi;
    if (score >= 9) { vEn = '✨ This is one of the strongest houses in your chart — blessed with remarkable divine support and effortless success.'; vHi = '✨ यह आपके चार्ट के सबसे मजबूत भावों में से एक है — असाधारण ईश्वरीय समर्थन और सहज सफलता से भरपूर।'; }
    else if (score >= 7) { vEn = '🌟 This house is well-supported — with deliberate effort and right timing, deeply rewarding outcomes flow here.'; vHi = '🌟 यह भाव अच्छी तरह समर्थित है — सही दशा में प्रयासों से यहाँ गहरे लाभकारी परिणाम मिलेंगे।'; }
    else if (score >= 5) { vEn = '⚖️ Mixed energies here — success depends on Dasha timing and your sustained personal effort.'; vHi = '⚖️ मिश्रित ऊर्जाएं — सफलता दशा और आपके निरंतर प्रयास पर निर्भर करती है।'; }
    else if (score >= 3) { vEn = '⚠️ Karmically demanding — sustained patience, specific remedies, and resilience are needed here.'; vHi = '⚠️ कार्मिक रूप से चुनौतीपूर्ण — धैर्य, उपाय और लचीलापन आवश्यक है।'; }
    else { vEn = '🔥 Intense karmic area — spiritual practices and remedies are essential keys to transformation.'; vHi = '🔥 तीव्र कार्मिक क्षेत्र — आध्यात्मिक साधना और उपाय परिवर्तन की आवश्यक कुंजी हैं।'; }

    enParts.push(`<strong>Conclusion:</strong> ${vEn}`);
    hiParts.push(`<strong>निष्कर्ष:</strong> ${vHi}`);

    return {
      en: `<ul style="margin:0;padding-left:1.2rem"><li>${enParts.join('</li><li style="margin-top:0.6rem">')}</li></ul>`,
      hi: `<ul style="margin:0;padding-left:1.2rem"><li>${hiParts.join('</li><li style="margin-top:0.6rem">')}</li></ul>`
    };
  }
}
