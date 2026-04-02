/**
 * house-planet-data-1.js — Sun & Moon in Houses (Parashari)
 * Auto-loaded by house-engine-v3.js
 */

(function() {
  if (typeof HouseAnalysisEngine === 'undefined') return;
  const proto = HouseAnalysisEngine.prototype;
  const origInit = proto._initPlanetInHouseEffects;
  proto._initPlanetInHouseEffects = function() {
    if (origInit) origInit.call(this);
    if (!this.planetInHouseEffects) this.planetInHouseEffects = {};

    this.planetInHouseEffects['Sun'] = {
      1: { en: "Strong, confident personality with natural leadership. Health is robust. Commands attention. Soul's purpose shines directly through the self.", hi: "मजबूत, आत्मविश्वासी व्यक्तित्व और प्राकृतिक नेतृत्व। स्वास्थ्य मजबूत। ध्यान आकर्षित करता है। आत्मा का उद्देश्य सीधे चमकता है।" },
      2: { en: "Father or authority figures influence wealth. Proud speech, commanding voice. Earns through government or leadership. Possible eye issues later.", hi: "पिता या अधिकारी धन को प्रभावित करते हैं। गर्वीली वाणी। सरकार या नेतृत्व से आय। बाद में नेत्र समस्या संभव।" },
      3: { en: "Courageous, willful, self-motivated. Strong writing and communication abilities. Success in media and self-made ventures.", hi: "साहसी, दृढ़ इच्छाशक्ति, स्वप्रेरित। लेखन और संचार में सशक्त। मीडिया और स्वनिर्मित उद्यमों में सफलता।" },
      4: { en: "Potential tension with mother. Pride in home and property. Strong civic sense. May attain political position. Heart care needed in middle age.", hi: "माता के साथ तनाव संभव। घर और संपत्ति में गर्व। राजनीतिक पद संभव। मध्य आयु में हृदय सावधानी आवश्यक।" },
      5: { en: "Intelligent, creative, invested in children. Natural aptitude for speculation. Spiritual practices include solar mantras. Father-like bond with children.", hi: "बुद्धिमान, रचनात्मक, संतान में रुचि। सट्टे में स्वाभाविक योग्यता। सूर्य मंत्रों की ओर झुकाव। संतान से पिता जैसा बंधन।" },
      6: { en: "Excellent for defeating enemies and overcoming debts. Success in competitive fields, government, medical, or legal. Rivals rarely win against this native.", hi: "शत्रुओं पर विजय और ऋण मुक्ति के लिए उत्तम। प्रतिस्पर्धी क्षेत्रों में सफलता। प्रतिद्वंद्वी शायद ही जीतें।" },
      7: { en: "Partner may be from a notable family. Ego clashes in marriage possible. Business partnerships with authority figures. Prominent public life.", hi: "साथी प्रभावशाली परिवार से। विवाह में अहंकार टकराव संभव। अधिकारी व्यक्तियों के साथ साझेदारी। प्रमुख सार्वजनिक जीवन।" },
      8: { en: "Longevity tested; care for heart and vitality needed. Potential inheritance from father. Deep interest in occult or research. Sudden transformations.", hi: "आयु परीक्षित; हृदय की देखभाल आवश्यक। पिता से विरासत संभव। तंत्र या शोध में गहरी रुचि। अचानक बदलाव।" },
      9: { en: "Strong dharmic nature. Father is influential and a mentor. Fortune linked to authority, government, or spirituality. Travel for higher purpose.", hi: "मजबूत धार्मिक स्वभाव। पिता प्रभावशाली मार्गदर्शक। भाग्य सत्ता या आध्यात्मिकता से जुड़ा। उच्च उद्देश्य के लिए यात्राएं।" },
      10: { en: "Excellent for career — rises to authority and leadership. Government, administration, politics, CEO roles are natural fits. Strong public recognition.", hi: "करियर के लिए उत्तम — अधिकार और नेतृत्व में उत्थान। सरकार, प्रशासन, राजनीति स्वाभाविक। मजबूत सार्वजनिक पहचान।" },
      11: { en: "Excellent for gains — income from authority, government, or senior connections. Desire fulfillment especially social recognition. Elder siblings may be prominent.", hi: "लाभ के लिए उत्तम — सत्ता या वरिष्ठों से आय। इच्छा पूर्ति, विशेषतः सामाजिक मान्यता। बड़े भाई-बहन प्रमुख।" },
      12: { en: "Expenses related to father or authority. Foreign government assignments possible. Spiritual practices linked to Sun (Surya Namaskar, Gayatri). Ego dissolution through isolation.", hi: "पिता या सत्ता से व्यय। विदेश सरकारी नियुक्ति संभव। सूर्य से जुड़ी साधना। एकांत से अहंकार विलय।" }
    };

    this.planetInHouseEffects['Moon'] = {
      1: { en: "Deeply emotional, intuitive, empathetic personality. Soft, attractive appearance. Emotions directly affect health. Mother's strong influence on character.", hi: "गहरा भावनात्मक, सहज ज्ञानी, सहानुभूतिशील व्यक्तित्व। नरम आकर्षक रूप। भावनाएं स्वास्थ्य को प्रभावित करती हैं। माता का गहरा प्रभाव।" },
      2: { en: "Wealth fluctuates with Moon's phases. Emotional speech carrying feeling. Deep family bonds. Earns through public, hospitality, or nourishment fields.", hi: "धन चंद्र की कलाओं के साथ बदलता है। भावनात्मक वाणी। गहरे पारिवारिक बंधन। जनसंपर्क या आतिथ्य से आय।" },
      3: { en: "Emotionally charged communication. Close bond with siblings. Frequent short travels by curiosity. Writing and storytelling come naturally.", hi: "भावनात्मक संचार। भाई-बहनों से गहरा बंधन। जिज्ञासा से छोटी यात्राएं। लेखन और कहानी स्वाभाविक।" },
      4: { en: "Moon in own domain — very powerful. Nurturing mother. Deep love for home and homeland. Emotional security tied to property. High domestic happiness.", hi: "चंद्रमा अपने स्थान पर — अत्यंत शक्तिशाली। पोषक माता। घर और मातृभूमि से गहरा प्रेम। उच्च गृह सुख।" },
      5: { en: "Creative, imaginative mind. Strong attachment to children. Romantic and poetic nature. Intuitive intelligence. Investment decisions emotionally driven — needs caution.", hi: "रचनात्मक कल्पनाशील मन। संतान से गहरा लगाव। रोमांटिक काव्यात्मक स्वभाव। सहज बुद्धि। निवेश में सावधानी आवश्यक।" },
      6: { en: "Emotional stress from daily work. Sensitive digestion and hormonal health. Mother may be source of conflict. Strong caring instinct — good healer.", hi: "कार्य से भावनात्मक तनाव। संवेदनशील पाचन और हार्मोनल स्वास्थ्य। माता से संघर्ष संभव। मजबूत देखभाल वृत्ति — अच्छे उपचारक।" },
      7: { en: "Partner is nurturing, sensitive, possibly moody. Emotional needs central to marriage. Strong chemistry. Business may involve public or female clientele.", hi: "साथी पोषक, संवेदनशील, मनमौजी। विवाह में भावनात्मक जरूरतें केंद्रीय। मजबूत आकर्षण। सार्वजनिक या महिला ग्राहक।" },
      8: { en: "Psychic abilities and intuitive connection to hidden realms. Emotional upheavals. Mother's health may concern. Gains through inheritance. Interest in psychology.", hi: "मनोवैज्ञानिक क्षमताएं और छिपे क्षेत्रों से संबंध। भावनात्मक उथल-पुथल। माता का स्वास्थ्य चिंताजनक। विरासत से लाभ। मनोविज्ञान में रुचि।" },
      9: { en: "Strong devotion and emotional faith. Mother is first guru. Fortune linked to spirituality and travel. Intuitive philosophical understanding. Pilgrimages deeply fulfilling.", hi: "मजबूत भक्ति और भावनात्मक आस्था। माता पहली गुरु। भाग्य आध्यात्मिकता और यात्रा से जुड़ा। तीर्थयात्रा गहरी तृप्ति देती है।" },
      10: { en: "Career linked to public, masses, nurturing industries. Fame from the public. Career fluctuates but recovers. Mother supports career. Strong public image.", hi: "करियर जनता, पोषण उद्योगों से जुड़ा। जनता से प्रसिद्धि। करियर में उतार-चढ़ाव पर सुधार। माता का करियर में समर्थन।" },
      11: { en: "Gains from public, female networks, or fluctuating markets. Large nurturing social circle. Elder sibling may be female and supportive.", hi: "जनता, महिला नेटवर्क या बदलते बाजार से लाभ। बड़ा सहायक सामाजिक दायरा। बड़ी बहन सहायक।" },
      12: { en: "Rich dream life and strong spiritual intuition. Deep meditation potential. Expenses linked to mother or home. Foreign lands feel emotionally comfortable.", hi: "समृद्ध स्वप्न जीवन और मजबूत आध्यात्मिक अंतर्ज्ञान। ध्यान की गहरी संभावना। माता या घर से व्यय। विदेश भावनात्मक रूप से आरामदायक।" }
    };
  };
})();
