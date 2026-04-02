/**
 * house-planet-data-2.js — Mars & Mercury in Houses (Parashari)
 */
(function() {
  if (typeof HouseAnalysisEngine === 'undefined') return;
  const origInit = HouseAnalysisEngine.prototype._initPlanetInHouseEffects;
  HouseAnalysisEngine.prototype._initPlanetInHouseEffects = function() {
    if (origInit) origInit.call(this);
    if (!this.planetInHouseEffects) this.planetInHouseEffects = {};

    this.planetInHouseEffects['Mars'] = {
      1: { en: "Dynamic, energetic, action-oriented personality. Athletic build. Can be impulsive or aggressive. Natural warrior spirit. Leadership is direct and commanding.", hi: "गतिशील, ऊर्जावान, कर्म-उन्मुख व्यक्तित्व। एथलेटिक शरीर। आवेगी हो सकता है। योद्धा भावना। सीधा नेतृत्व।" },
      2: { en: "Aggressive direct speech — words can wound. Earns through engineering, sports, real estate, or military. Family disputes over finances possible.", hi: "वाणी में आक्रामक — शब्द चोट कर सकते हैं। इंजीनियरिंग, खेल, रियल एस्टेट से आय। परिवार में वित्तीय विवाद।" },
      3: { en: "Exceptionally courageous and bold. Succeeds through willpower. Siblings may be competitive. Technical skills and physical work bring success.", hi: "असाधारण साहसी और निडर। इच्छाशक्ति से सफलता। भाई-बहन प्रतिस्पर्धी। तकनीकी कौशल से सफलता।" },
      4: { en: "Tension at home and with mother. Property disputes possible. High domestic energy. Aggressive property building. Emotional restlessness drives ambition.", hi: "घर और माता से तनाव। संपत्ति विवाद संभव। घरेलू ऊर्जा उच्च। आक्रामक संपत्ति निर्माण। बेचैनी महत्वाकांक्षा बढ़ाती है।" },
      5: { en: "Sharp analytical intelligence. Competitive in sports. Children are active and bold. Passionate romantic life. Speculative gains through calculated risk. Strong mantra power.", hi: "तीक्ष्ण विश्लेषणात्मक बुद्धि। खेल में प्रतिस्पर्धी। संतान सक्रिय। जुनूनी प्रेम। गणनात्मक जोखिम से लाभ। मंत्र शक्ति मजबूत।" },
      6: { en: "Excellent — Mars destroys enemies decisively. Competitive edge in sports, military, police, surgery. Strong immunity. Debts cleared through effort.", hi: "उत्तम — मंगल शत्रुओं को निर्णायक रूप से नष्ट करता है। खेल, सेना, पुलिस, सर्जरी में बढ़त। मजबूत प्रतिरक्षा। ऋण मेहनत से चुकता।" },
      7: { en: "Partner may be aggressive or athletic. Marriage can involve power struggles. Passionate but argumentative relationship. Action-oriented partnerships.", hi: "साथी आक्रामक या एथलेटिक। विवाह में शक्ति संघर्ष। भावुक पर तर्कशील संबंध। कर्म-उन्मुख साझेदारी।" },
      8: { en: "Intense transformative energy. Interest in surgery, occult, tantra, extreme sports. Risk of accidents. Sudden gains and losses. Long life if supported.", hi: "तीव्र परिवर्तनकारी ऊर्जा। सर्जरी, तंत्र, चरम खेलों में रुचि। दुर्घटना का जोखिम। अचानक लाभ-हानि। समर्थन हो तो दीर्घायु।" },
      9: { en: "Dharma is action-oriented — beliefs are acted upon. Father may be military or engineering background. Fortune through courageous action.", hi: "धर्म कर्म-उन्मुख — विश्वास पर कार्य। पिता सैन्य या इंजीनियरिंग पृष्ठभूमि। साहसी कार्य से भाग्य।" },
      10: { en: "Strong career drive in engineering, military, surgery, sports, real estate. Relentless ambition. Powerful executive potential. Career involves competition.", hi: "इंजीनियरिंग, सेना, सर्जरी, खेल में करियर ड्राइव। अथक महत्वाकांक्षा। शक्तिशाली कार्यकारी। करियर में प्रतिस्पर्धा।" },
      11: { en: "Gains through competitive fields, technical work, real estate. Aggressive pursuit of desires — usually fulfilled. Bold, action-oriented friends.", hi: "प्रतिस्पर्धी क्षेत्रों, तकनीकी कार्य से लाभ। इच्छाओं की आक्रामक खोज — आमतौर पर पूर्ण। साहसी मित्र।" },
      12: { en: "Energy spent on hidden or spiritual battles. Expenses from surgeries or accidents. Powerful spiritual warrior. Weakened for worldly gains, strengthened for moksha.", hi: "छुपी या आध्यात्मिक लड़ाइयों में ऊर्जा। सर्जरी या दुर्घटनाओं से व्यय। मोक्ष के लिए मजबूत पर सांसारिक लाभ के लिए कमजोर।" }
    };

    this.planetInHouseEffects['Mercury'] = {
      1: { en: "Intelligent, witty, communicative, youthful appearance. Quick thinker, fast talker. Adaptable and curious. Success in communication fields. Dual nature.", hi: "बुद्धिमान, हाजिर-जवाब, संचारी, युवा दिखावट। तेज सोच, तेज बोलने वाला। अनुकूलनीय और जिज्ञासु। संचार क्षेत्रों में सफलता।" },
      2: { en: "Skilled in financial analysis. Wealth through commerce, writing, tech, teaching. Persuasive analytical speech. Good financial memory. May be overly logical in family.", hi: "वित्तीय विश्लेषण में कुशल। वाणिज्य, लेखन, प्रौद्योगिकी से धन। प्रेरक वाणी। परिवार में अत्यधिक तार्किक।" },
      3: { en: "Natural communicator and writer. Excellent in journalism, blogging, marketing. Quick-witted humor. Multiple skill sets. Siblings are intellectual and helpful.", hi: "प्राकृतिक संचारक और लेखक। पत्रकारिता, मार्केटिंग में उत्कृष्ट। तेज बुद्धि। कई कौशल। भाई-बहन बौद्धिक और सहायक।" },
      4: { en: "Intellectual home environment. Multiple properties or frequent moves. Education is strong. Mental peace linked to learning. Mother is intelligent and communicative.", hi: "बौद्धिक घरेलू वातावरण। कई संपत्तियां या बार-बार स्थानांतरण। शिक्षा मजबूत। सीखने से मानसिक शांति। माता बुद्धिमान।" },
      5: { en: "Highly intelligent and analytical. Love for puzzles, games, strategy. Children are smart and communicative. Romantic expression through words and wit.", hi: "अत्यधिक बुद्धिमान और विश्लेषणात्मक। पहेली, खेल, रणनीति में रुचि। संतान चतुर और संचारी। शब्दों से रोमांस।" },
      6: { en: "Sharp and analytical approach to problems. Success in accounting, law, healthcare administration. Good at defeating enemies through intellect. Nervous system health sensitive.", hi: "समस्याओं का तीक्ष्ण विश्लेषणात्मक दृष्टिकोण। लेखांकन, कानून में सफलता। बुद्धि से शत्रुओं को हराने में अच्छा। तंत्रिका तंत्र संवेदनशील।" },
      7: { en: "Partner is intelligent, communicative, and youthful. Business partnerships are intellectually stimulating. Multiple partnerships or contracts possible. Public speaking skills.", hi: "साथी बुद्धिमान, संवादी और युवा। व्यापार साझेदारी बौद्धिक रूप से उत्तेजक। कई साझेदारियां संभव। सार्वजनिक भाषण कौशल।" },
      8: { en: "Research-oriented mind drawn to mysteries. Analytical approach to occult. Financial gains through investigation or insurance. Mercury here gives psychological depth.", hi: "रहस्यों की ओर आकर्षित शोध-उन्मुख मन। तंत्र का विश्लेषणात्मक दृष्टिकोण। शोध या बीमा से वित्तीय लाभ। मनोवैज्ञानिक गहराई।" },
      9: { en: "Scholar and lifelong learner. Multiple degrees or extensive travel for education. Teaching and publishing bring fortune. Father is intellectual. Philosophy is logical.", hi: "विद्वान और आजीवन शिक्षार्थी। कई डिग्री या शिक्षा के लिए व्यापक यात्रा। शिक्षण और प्रकाशन से भाग्य। पिता बौद्धिक।" },
      10: { en: "Career in communication, writing, IT, commerce, accounting, or teaching. Versatile professional. Multiple career changes. Success through intellect and networking.", hi: "संचार, लेखन, आईटी, वाणिज्य, शिक्षण में करियर। बहुमुखी पेशेवर। कई करियर परिवर्तन। बुद्धि और नेटवर्किंग से सफलता।" },
      11: { en: "Gains through intellect, commerce, writing, or technology. Wide social network of intelligent people. Desires fulfilled through strategic thinking.", hi: "बुद्धि, वाणिज्य, लेखन या प्रौद्योगिकी से लाभ। बुद्धिमान लोगों का विस्तृत सामाजिक नेटवर्क। रणनीतिक सोच से इच्छा पूर्ति।" },
      12: { en: "Creative imagination and intuitive intelligence. Writing in isolation. Foreign connections through communication. Expenses on education. Private thoughts are deep.", hi: "रचनात्मक कल्पना और सहज बुद्धि। एकांत में लेखन। संचार से विदेशी संबंध। शिक्षा पर व्यय। निजी विचार गहरे।" }
    };
  };
})();
