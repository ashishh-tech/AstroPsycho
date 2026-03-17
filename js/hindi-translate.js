/**
 * AstroPsycho - Hindi Language Toggle
 * Adds a floating "हिंदी" button (top-right) that slides the page into Hindi.
 * Works on all pages. Uses MutationObserver to catch dynamically generated content.
 */

(function () {
    'use strict';

    /* ─────────────────────────────────────────────
       1. TRANSLATION DICTIONARY
    ───────────────────────────────────────────── */
    const HINDI = {
        /* ── App branding (kept in English intentionally) ── */

        /* ── Planets ── */
        'Sun': 'सूर्य \u2600\uFE0F',
        'Moon': 'चंद्र \uD83C\uDF19',
        'Mars': 'मंगल \u2642\uFE0F',
        'Mercury': 'बुध \u263F',
        'Jupiter': 'गुरु \u2643',
        'Venus': 'शुक्र \u2640',
        'Saturn': 'शनि \u2644',
        'Rahu': 'राहु \uD83D\uDC32',
        'Ketu': 'केतु \u2604\uFE0F',
        'Ascendant': 'लग्न',
        'Lagna': 'लग्न',

        /* ── Rashis / Zodiac Signs ── */
        'Aries': 'मेष \u2648',
        'Taurus': 'वृषभ \u2649',
        'Gemini': 'मिथुन \u264A',
        'Cancer': 'कर्क \u264B',
        'Leo': 'सिंह \u264C',
        'Virgo': 'कन्या \u264D',
        'Libra': 'तुला \u264E',
        'Scorpio': 'वृश्चिक \u264F',
        'Sagittarius': 'धनु \u2650',
        'Capricorn': 'मकर \u2651',
        'Aquarius': 'कुंभ \u2652',
        'Pisces': 'मीन \u2653',

        /* ── Nakshatras ── */
        'Ashwini': 'अश्विनी',
        'Bharani': 'भरणी',
        'Krittika': 'कृत्तिका',
        'Rohini': 'रोहिणी',
        'Mrigashira': 'मृगशिरा',
        'Ardra': 'आर्द्रा',
        'Punarvasu': 'पुनर्वसु',
        'Pushya': 'पुष्य',
        'Ashlesha': 'आश्लेषा',
        'Magha': 'मघा',
        'Purva Phalguni': 'पूर्व फाल्गुनी',
        'Uttara Phalguni': 'उत्तर फाल्गुनी',
        'Hasta': 'हस्त',
        'Chitra': 'चित्रा',
        'Swati': 'स्वाती',
        'Vishakha': 'विशाखा',
        'Anuradha': 'अनुराधा',
        'Jyeshtha': 'ज्येष्ठा',
        'Mula': 'मूल',
        'Purva Ashadha': 'पूर्व आषाढ़',
        'Uttara Ashadha': 'उत्तर आषाढ़',
        'Shravana': 'श्रवण',
        'Dhanishtha': 'धनिष्ठा',
        'Dhanishta': 'धनिष्ठा',
        'Shatabhisha': 'शतभिषा',
        'Purva Bhadrapada': 'पूर्व भाद्रपद',
        'Purva_bhadrapada': 'पूर्व भाद्रपद',
        'Uttara Bhadrapada': 'उत्तर भाद्रपद',
        'Uttara_bhadrapada': 'उत्तर भाद्रपद',
        'Revati': 'रेवती',

        /* ── Navatara (Transit Nakshatra Relationships) ── */
        'Janma': 'जन्म',
        'Sampat': 'संपत्',
        'Vipat': 'विपत्',
        'Kshema': 'क्षेम',
        'Pratyak': 'प्रत्यक्',
        'Sadhaka': 'साधक',
        'Vadha': 'वध',
        'Mitra': 'मित्र',
        'Ati-Mitra': 'अति-मित्र',
        'Ati Mitra': 'अति मित्र',

        /* ── Transit Outlook Values ── */
        'Wisdom & Travel': 'ज्ञान और यात्रा',
        'Optimistic Mood': 'आशावादी मनोदशा',
        'Accident Prone': 'दुर्घटना संभावित',
        'Higher Learning': 'उच्च शिक्षा',
        'Spiritual Growth': 'आध्यात्मिक विकास',
        'Cultural Expansion': 'सांस्कृतिक विस्तार',
        'Professional Pressure': 'व्यावसायिक दबाव',
        'Financial Gains': 'आर्थिक लाभ',
        'Health Focus': 'स्वास्थ्य पर ध्यान',
        'Relationship Harmony': 'संबंध सामंजस्य',
        'Career Boost': 'करियर में उन्नति',
        'Emotional Healing': 'भावनात्मक उपचार',
        'Creative Expression': 'रचनात्मक अभिव्यक्ति',
        'Family Matters': 'पारिवारिक मामले',
        'Inner Transformation': 'आंतरिक परिवर्तन',
        'Social Recognition': 'सामाजिक पहचान',
        'Stable': 'स्थिर',
        'Challenging': 'चुनौतीपूर्ण',
        'Favorable': 'अनुकूल',
        'Mixed': 'मिश्रित',
        'Auspicious': 'शुभ',
        'Inauspicious': 'अशुभ',
        'Sade Sati': 'साढ़े साती',
        'Ashtama Shani': 'अष्टम शनि',
        'Kantaka Shani': 'कंटक शनि',
        'Wealth & Recognition': 'धन और सम्मान',
        'Challenges Ahead': 'चुनौतियां',
        'Mixed Results': 'मिश्रित परिणाम',
        'Highly Favorable': 'अत्यंत अनुकूल',
        'Health & Debt Concerns': 'स्वास्थ्य और ऋण की चिंता',
        'Transformation Period': 'परिवर्तन काल',
        'Excellent Fortune': 'उत्कृष्ट भाग्य',
        'Career Tension': 'करियर में तनाव',
        'Gains & Success': 'लाभ और सफलता',
        'Expenses Rise': 'खर्चों में वृद्धि',
        'Sade Sati Peak': 'साढ़े साती का चरम',
        'Sade Sati Ending': 'साढ़े साती की समाप्ति',
        'Victory & Success': 'विजय और सफलता',
        'Domestic Challenges': 'पारिवारिक चुनौतियां',
        'Relationship Strain': 'संबंधों में तनाव',
        'Triumph Over Adversity': 'प्रतिकूलता पर विजय',
        'Partnership Delays': 'साझेदारी में देरी',
        'Severe Testing': 'कठिन परीक्षा',
        'Career Shifts': 'करियर में बदलाव',
        'Sade Sati Begins': 'साढ़े साती का आरंभ',
        'High Energy': 'उच्च ऊर्जा',
        'Financial Activity': 'आर्थिक सक्रियता',
        'Courage Boost': 'साहस में वृद्धि',
        'Domestic Tension': 'पारिवारिक तनाव',
        'Creative Drive': 'रचनात्मक जोश',
        'Victory Over Enemies': 'शत्रु विजय',
        'Partnership Friction': 'साझेदारी में घर्षण',
        'Active Travel': 'सक्रिय यात्रा',
        'Career Ambition': 'करियर की महत्वाकांक्षा',
        'Goals Achieved': 'लक्ष्य प्राप्ति',
        'Energy Drain': 'ऊर्जा की कमी',
        'Mental Clarity': 'मानसिक स्पष्टता',
        'Business Gains': 'व्यापार में लाभ',
        'Communication Excellence': 'बेहतरीन संवाद',
        'Property Deals': 'संपत्ति के सौदे',
        'Intellectual Creativity': 'बौद्धिक रचनात्मकता',
        'Work Efficiency': 'कार्य कुशलता',
        'Partner Communication': 'साथी से संवाद',
        'Deep Research': 'गहन शोध',
        'Career Communication': 'करियर संवाद',
        'Social Networking': 'सामाजिक संपर्क',
        'Introspection': 'आत्मचिंतन',
        'Personal Charm': 'व्यक्तिगत आकर्षण',
        'Wealth & Luxury': 'धन और विलासिता',
        'Creative Communication': 'रचनात्मक संवाद',
        'Domestic Bliss': 'पारिवारिक सुख',
        'Romance Flourishes': 'रोमांस और प्रेम',
        'Service & Health': 'सेवा और स्वास्थ्य',
        'Sensual Intensity': 'इंद्रिय तीव्रता',
        'Professional Grace': 'व्यावसायिक शालीनता',
        'Social Success': 'सामाजिक सफलता',
        'Secret Romance': 'गुप्त प्रेम',
        'Confidence Peak': 'आत्मविश्वास का शिखर',
        'Income Focus': 'आय पर ध्यान',
        'Courage & Communication': 'साहस और संवाद',
        'Home Authority': 'घर में अधिकार',
        'Creative Power': 'रचनात्मक शक्ति',
        'Work Victory': 'कार्य सिद्धि',
        'Partnership Spotlight': 'साझेदारी पर ध्यान',
        'Hidden Strength': 'गुप्त शक्ति',
        'Career Pinnacle': 'करियर का शिखर',
        'Goal Achievement': 'लक्ष्य सिद्धि',
        'Rest & Reflection': 'विश्राम और चिंतन',
        'Emotional Renewal': 'भावनात्मक नवीनीकरण',
        'Security Needs': 'सुरक्षा की आवश्यकता',
        'Restless Mind': 'अशांत मन',
        'Home Comfort': 'घरेलू सुख-सुविधा',
        'Joyful Heart': 'हर्षित हृदय',
        'Emotional Service': 'भावनात्मक सेवा',
        'Relationship Focus': 'संबंधों पर ध्यान',
        'Deep Feelings': 'गहरी भावनाएं',
        'Public Emotions': 'सार्वजनिक भावनाएं',
        'Social Happiness': 'सामाजिक सुख',
        'Emotional Retreat': 'भावनात्मक विश्राम',

        /* ── Dasha / Periods ── */
        'Mahadasha': 'महादशा',
        'Antardasha': 'अंतर्दशा',
        'Pratyantar': 'प्रत्यंतर',
        'Dasha': 'दशा',
        'Current Mahadasha (Major Period)': 'वर्तमान महादशा (मुख्य काल)',
        'Current Antardasha (Sub-Period)': 'वर्तमान अंतर्दशा (उप-काल)',
        'Your Current Planetary Period (Dasha)': 'आपकी वर्तमान ग्रह दशा',
        'What this period brings:': 'यह काल क्या लाता है:',
        'Period:': 'काल:',
        'Duration:': 'अवधि:',
        'years total': 'वर्ष कुल',
        'years': 'वर्ष',
        'months': 'महीने',
        'leadership_development': 'नेतृत्व विकास',
        'self_realization': 'आत्म-साक्षात्कार',
        'confidence_boost': 'आत्मविश्वास में वृद्धि',
        'emotional_intelligence': 'भावनात्मक बुद्धिमत्ता',
        'intuitive_development': 'सहज ज्ञान विकास',
        'nurturing_abilities': 'पालन-पोषण क्षमताएं',
        'courage_development': 'साहस का विकास',
        'energy_channeling': 'ऊर्जा का सही उपयोग',
        'property_gains': 'संपत्ति लाभ',
        'breaking_boundaries': 'सीमाओं को तोड़ना',
        'material_success': 'भौतिक सफलता',
        'foreign_connections': 'विदेशी संपर्क',
        'spiritual_growth': 'आध्यात्मिक विकास',
        'wisdom': 'बुद्धि',
        'wealth': 'धन',
        'children': 'संतान',
        'education': 'शिक्षा',
        'discipline': 'अनुशासन',
        'maturity': 'परिपक्वता',
        'karmic_clearing': 'कर्मों की शुद्धि',
        'spiritual_depth': 'आध्यात्मिक गहराई',
        'intellectual_growth': 'बौद्धिक विकास',
        'business_skills': 'व्यापारिक कौशल',
        'communication_mastery': 'संवाद में निपुणता',
        'moksha': 'मोक्ष',
        'spiritual_enlightenment': 'आध्यात्मिक ज्ञानोदय',
        'intuitive_powers': 'सहज ज्ञान शक्तियां',
        'love': 'प्रेम',
        'marriage': 'विवाह',
        'artistic_success': 'कलात्मक सफलता',
        'comforts': 'सुख-सुविधाएं',
        'vehicles': 'वाहन',
        'Om Suryaya Namaha (108 times)': 'ॐ सूर्याय नम: (108 बार)',
        'Aditya Hridayam': 'आदित्य हृदयम',
        'Gayatri Mantra': 'गायत्री मंत्र',
        'Ruby (Manikya) - 3-6 carats, wear on Sunday morning': 'माणिक्य (3-6 कैरेट), रविवार की सुबह पहनें',
        'Donate wheat, jaggery, red cloth on Sundays to needy': 'रविवार को गेहूं, गुड़, लाल कपड़ा दान करें',
        'Sunday - sunrise to sunset, eat light food': 'रविवार - सूर्योदय से सूर्यास्त तक, हल्का भोजन करें',
        'Lord Surya - Surya Namaskar at sunrise': 'भगवान सूर्य - सूर्योदय के समय सूर्य नमस्कार',
        'Offer water to Sun at sunrise, help father figures, avoid ego conflicts': 'सूर्योदय पर सूर्य को जल दें, पिता तुल्य व्यक्तियों की मदद करें',
        'Om Chandraya Namaha (108 times)': 'ॐ चंद्राय नम: (108 बार)',
        'Chandra Gayatri': 'चंद्र गायत्री',
        'Om Som Somaya Namaha': 'ॐ सों सोमाय नम:',
        'Pearl (Moti) - 5-7 carats, wear on Monday morning': 'मोती (5-7 कैरेट), सोमवार की सुबह पहनें',
        'Donate white items, milk, rice on Mondays': 'सोमवार को सफेद वस्तुओं, दूध, चावल का दान करें',
        'Monday - avoid salt, eat white foods': 'सोमवार - नमक से बचें, सफेद भोजन करें',
        'Lord Shiva, Goddess Parvati': 'भगवान शिव, देवी पार्वती',
        'Keep silver with you, serve mother, drink water from silver vessel': 'चांदी पास रखें, माता की सेवा करें, चांदी के बर्तन में पानी पिएं',
        'Om Mangalaya Namaha (108 times)': 'ॐ मंगलाय नम: (108 बार)',
        'Hanuman Chalisa': 'हनुमान चालीसा',
        'Red Coral (Moonga) - 6-9 carats, wear on Tuesday': 'मूंगा (6-9 कैरेट), मंगलवार को पहनें',
        'Donate red lentils, jaggery, copper items on Tuesdays': 'मंगलवार को मसूर दाल, गुड़, तांबे की वस्तुएं दान करें',
        'Tuesday - eat simple food, avoid meat': 'मंगलवार - सादा भोजन करें, मांस से बचें',
        'Lord Hanuman, Kartikeya': 'भगवान हनुमान, कार्तिकेय',
        'Om Budhaya Namaha (108 times)': 'ॐ बुधाय नम: (108 बार)',
        'Budh Gayatri': 'बुध गायत्री',
        'Emerald (Panna) - 3-6 carats, wear on Wednesday': 'पन्ना (3-6 कैरेट), बुधवार को पहनें',
        'Donate green items, green moong dal, books on Wednesdays': 'बुधवार को हरी वस्तुएं, मूंग दाल, पुस्तकें दान करें',
        'Wednesday - light green food': 'बुधवार - हल्का हरा भोजन',
        'Lord Vishnu, Lord Ganesha': 'भगवान विष्णु, भगवान गणेश',
        'Feed green grass to cows, donate to students, keep parrot feathers': 'गौ माता को हरी घास खिलाएं, विद्यार्थियों को दान करें',
        'Om Gurave Namaha (108 times)': 'ॐ गुरवे नम: (108 बार)',
        'Brihaspati Gayatri': 'बृहस्पति गायत्री',
        'Yellow Sapphire (Pukhraj) - 3-6 carats, wear on Thursday': 'पुखराज (3-6 कैरेट), गुरुवार को पहनें',
        'Donate yellow items, turmeric, gold, books on Thursdays': 'गुरुवार को पीली वस्तुएं, हल्दी, सोना, पुस्तकें दान करें',
        'Thursday - yellow foods like besan, bananas': 'गुरुवार - पीला भोजन जैसे बेसन, केला',
        'Lord Vishnu, Brihaspati': 'भगवान विष्णु, बृहस्पति देव',
        'Respect teachers, serve gurus, worship peepal tree': 'शिक्षकों का सम्मान करें, गुरुओं की सेवा करें, पीपल पूजा',
        'Om Shukraya Namaha (108 times)': 'ॐ शुक्राय नम: (108 बार)',
        'Shukra Gayatri': 'शुक्र गायत्री',
        'Diamond or White Sapphire - 1-2 carats, wear on Friday': 'हीरा या सफेद पुखराज (1-2 कैरेट), शुक्रवार को पहनें',
        'Donate white items, rice, sugar, white clothes on Fridays': 'शुक्रवार को सफेद वस्तुएं, चावल, चीनी, सफेद कपड़े दान करें',
        'Friday - white or sweet foods': 'शुक्रवार - सफेद या मीठा भोजन',
        'Goddess Lakshmi, Goddess Durga': 'देवी लक्ष्मी, देवी दुर्गा',
        'Donate cows, serve wife/women, keep silver in home': 'गौ दान करें, महिलाओं का सम्मान करें, घर में चांदी रखें',
        'Om Shanaye Namaha (108 times)': 'ॐ शनये नम: (108 बार)',
        'Shani Gayatri': 'शनि गायत्री',
        'Blue Sapphire (Neelam) - ONLY after consulting expert, 3-6 carats': 'नीलम (3-6 कैरेट) - केवल विशेषज्ञ की सलाह पर',
        'Donate black items, sesame oil, iron on Saturdays': 'शनिवार को काली वस्तुएं, तिल का तेल, लोहा दान करें',
        'Saturday - simple food, avoid alcohol and meat': 'शनिवार - सादा भोजन, शराब और मांस से बचें',
        'Lord Hanuman, Lord Shiva, Shani Dev': 'भगवान हनुमान, भगवान शिव, शनि देव',
        'Serve crows, feed dogs, donate mustard oil, respect servants': 'कौवों को खिलाएं, कुत्तों को भोजन दें, सरसों तेल दान करें',
        'Om Rahave Namaha (108 times)': 'ॐ राहवे नम: (108 बार)',
        'Rahu Gayatri': 'राहु गायत्री',
        'Hessonite Garnet (Gomed) - 5-8 carats, after consultation': 'गोमेद (5-8 कैरेट) - परामर्श के बाद',
        'Donate black and blue items, mustard, blankets on Saturdays': 'शनिवार को काली और नीली वस्तुएं, कंबल दान करें',
        'Goddess Durga, Lord Bhairava': 'देवी दुर्गा, भगवान भैरव',
        'Keep a dog, help outcasts, bury coconut at crossroads': 'कुत्ता पालें, बहिष्कृतों की मदद करें, चौराहे पर नारियल दबाएं',
        'Om Ketave Namaha (108 times)': 'ॐ केतवे नम: (108 बार)',
        'Ketu Gayatri': 'केतु गायत्री',
        'Cat\'s Eye (Lehsunia) - 5-7 carats, after expert consultation': 'लहसुनिया (5-7 कैरेट) - विशेषज्ञ परामर्श के बाद',
        'Donate multicolor blankets, flags on Thursdays': 'गुरुवार को बहुरंगी कंबल, झंडे दान करें',
        'Lord Ganesha, Lord Kartikeya': 'भगवान गणेश, भगवान कार्तिकेय',
        'Keep a dog, donate to spiritual seekers, feed birds, worship ancestors': 'कुत्ता पालें, अध्यात्मिक साधकों को दान करें, पक्षियों को खिलाएं',

        /* ── Section Labels & UI ── */
        'Psychological Traits:': 'मनोवैज्ञानिक लक्षण:',
        'Psychological Traits': 'मनोवैज्ञानिक लक्षण',
        'Emotional Pattern:': 'भावनात्मक पैटर्न:',
        'Emotional Pattern': 'भावनात्मक पैटर्न',
        'Mental Strengths:': 'मानसिक शक्तियां:',
        'Mental Strengths': 'मानसिक शक्तियां',
        'Mental Challenges:': 'मानसिक चुनौतियां:',
        'Mental Challenges': 'मानसिक चुनौतियां',
        'Career Aptitude:': 'करियर योग्यता:',
        'Career Aptitude': 'करियर योग्यता',
        'Recommendation:': 'सिफारिश:',
        'Recommendation': 'सिफारिश',
        'Expert Recommendation:': 'विशेषज्ञ सिफारिश:',
        'Expert Recommendation': 'विशेषज्ञ सिफारिश',
        'Effect:': 'प्रभाव:',
        'Effect': 'प्रभाव',
        'Recommended Remedies:': 'अनुशंसित उपाय:',
        'Recommended Remedies': 'अनुशंसित उपाय',
        'Recommended Coping Mechanisms': 'अनुशंसित सामना तंत्र',
        'Strength Factors': 'शक्ति कारक',
        'Moon Strength:': 'चंद्र शक्ति:',
        'Moon Strength': 'चंद्र शक्ति',
        'Status:': 'स्थिति:',
        'Moon Sign:': 'चंद्र राशि:',
        'Moon Sign': 'चंद्र राशि',
        'Phase:': 'चरण:',
        'Waxing': 'शुक्ल पक्ष',
        'Waning': 'कृष्ण पक्ष',
        'Waxing (Shukla Paksha)': 'शुक्ल पक्ष',
        'Waning (Krishna Paksha)': 'कृष्ण पक्ष',
        'Shukla Paksha': 'शुक्ल पक्ष',
        'Krishna Paksha': 'कृष्ण पक्ष',
        'Lord:': 'स्वामी:',
        'Degrees:': 'अंश:',
        'Pada:': 'पाद:',
        'Pada': 'पाद',
        'Lord': 'स्वामी',
        'Score:': 'अंक:',
        'Score': 'अंक',
        'Connected to:': 'संबंधित:',
        'Connected to': 'संबंधित',
        'Date:': 'तिथि:',
        'Date': 'तिथि',
        'Opportunities:': 'अवसर:',
        'Opportunities': 'अवसर',
        'Signifies:': 'संकेत:',
        'Signifies': 'संकेत',
        'Basic:': 'मूल:',
        'Advanced:': 'उन्नत:',
        'Basic': 'मूल',
        'Advanced': 'उन्नत',
        'Age:': 'आयु:',
        'Age': 'आयु',
        'Timezone:': 'समय क्षेत्र:',
        'Timezone': 'समय क्षेत्र',
        'Date of Birth': 'जन्म तिथि',
        'Time of Birth': 'जन्म समय',
        'Place of Birth': 'जन्म स्थान',
        'Mental Strength:': 'मानसिक शक्ति:',
        'Mental Strength': 'मानसिक शक्ति',
        'Psychological Insight': 'मनोवैज्ञानिक अंतर्दृष्टि',
        'Emotional Resilience Analysis': 'भावनात्मक लचीलापन विश्लेषण',
        'Lunar Profile': 'चंद्र प्रोफ़ाइल',
        'Sign:': 'राशि:',
        'Mental & Emotional Nature': 'मानसिक और भावनात्मक प्रकृति',
        'Your Mental & Emotional Nature': 'आपकी मानसिक और भावनात्मक प्रकृति',
        'Mental Strengths': 'मानसिक शक्तियां',
        'Mental Challenges': 'मानसिक चुनौतियां',
        'Coping Mechanisms': 'सामना तंत्र',
        'Increasing optimism, emotional stability improves, mental clarity grows': 'बढ़ता हुआ आशावाद, भावनात्मक स्थिरता में सुधार, मानसिक स्पष्टता में वृद्धि',
        'Introspection, emotional sensitivity, need for solitude': 'आत्मनिरीक्षण, भावनात्मक संवेदनशीलता, एकांत की आवश्यकता',
        'Exceptional emotional stability, nurturing abilities, mental peace, contentment': 'असाधारण भावनात्मक स्थिरता, पालन-पोषण की क्षमता, मानसिक शांति, संतोष',
        'Strong emotions, caring nature, good memory, attachment to home and mother': 'बलिष्ठ भावनाएं, देखभाल करने वाला स्वभाव, अच्छी याददाश्त, घर और माता से लगाव',
        'Comfortable emotional expression, generally positive mental state': 'सहज भावनात्मक अभिव्यक्ति, सामान्य रूप से सकारात्मक मानसिक स्थिति',
        'Balanced emotions, adaptable mind, situational comfort': 'संतुलित भावनाएं, अनुकूलनशील मन, स्थितिजन्य आराम',
        'No enemy signs for Moon': 'चंद्र के लिए कोई शत्रु राशि नहीं',
        'Emotional intensity, mood swings, trust issues, deep psychological issues, transformation needed': 'भावनात्मक तीव्रता, मनोदशा परिवर्तन, विश्वास के मुद्दे, गहरे मनोवैज्ञानिक मुद्दे, परिवर्तन की आवश्यकता',
        'Highly emotional and sensitive personality. Mood swings affect overall demeanor. Strong imagination. Mother\'s influence on personality.': 'अत्यधिक भावनात्मक और संवेदनशील व्यक्तित्व। मनोदशा परिवर्तन समग्र व्यवहार को प्रभावित करते हैं। प्रबल कल्पना। व्यक्तित्व पर माता का प्रभाव।',
        'Emotional security tied to material resources. Sweet but fluctuating speech. Family matters affect mental peace.': 'भौतिक संसाधनों से जुड़ी भावनात्मक सुरक्षा। मधुर लेकिन उतार-चढ़ाव वाली वाणी। पारिवारिक मामले मानसिक शांति को प्रभावित करते हैं।',
        'Restless mind seeking variety and stimulation. Strong emotional bond with siblings. Travel brings mental relief.': 'विविधता और उत्तेजना की तलाश में अशांत मन। भाई-बहनों के साथ दृढ़ भावनात्मक संबंध। यात्रा से मानसिक राहत मिलती है।',
        'Natural placement for Moon. Deep emotional fulfillment. Strong mother bond. Mental peace through home environment.': 'चंद्र के लिए स्वाभाविक स्थान। गहरी भावनात्मक पूर्णता। माता के साथ दृढ़ संबंध। घरेलू वातावरण के माध्यम से मानसिक शांति।',
        'Emotional intelligence. Creative mind. Romantic nature. Mental joy through children or creative pursuits.': 'भावनात्मक बुद्धिमत्ता। रचनात्मक मन। रोमांटिक स्वभाव। बच्चों या रचनात्मक कार्यों के माध्यम से मानसिक सुख।',
        'Mental stress from daily conflicts. Health anxiety. Emotional labor in service. Digestive or stomach issues tied to emotions.': 'दैनिक संघर्षों से मानसिक तनाव। स्वास्थ्य की चिंता। सेवा में भावनात्मक परिश्रम। भावनाओं से जुड़े पाचन या पेट के मुद्दे।',
        'Emotional fulfillment through partnerships. Spouse affects mental state significantly. Need for emotional intimacy.': 'साझेदारी के माध्यम से भावनात्मक पूर्णता। जीवनसाथी मानसिक स्थिति को महत्वपूर्ण रूप से प्रभावित करता है। भावनात्मक आत्मीयता की आवश्यकता।',
        'Deep psychological issues. Interest in occult. Sudden emotional upheavals. Transformative mental states. Inheritance from mother.': 'गहरे मनोवैज्ञानिक मुद्दे। गुप्त विद्या में रुचि। अचानक भावनात्मक उथल-पुथल। परिवर्तनकारी मानसिक अवस्थाएँ। माता से विरासत।',
        'Philosophical mind. Emotional connection to spirituality. Fortune through mother. Travel brings mental growth.': 'दार्शनिक मन। आध्यात्मिकता से भावनात्मक जुड़ाव। माता के माध्यम से भाग्य। यात्रा से मानसिक विकास होता है।',
        'Public image tied to emotions. Career involving nurturing/caring. Mother\'s influence on career. Mental fulfillment through profession.': 'भावनाओं से जुड़ी सार्वजनिक छवि। पालन-पोषण/देखभाल से जुड़ा करियर। करियर पर माता का प्रभाव। पेशे के माध्यम से मानसिक पूर्णता।',
        'Emotional fulfillment through friendships and social network. Gains through women. Desires get fulfilled. Elder siblings support.': 'मित्रता और सामाजिक नेटवर्क के माध्यम से भावनात्मक पूर्णता। महिलाओं के माध्यम से लाभ। इच्छाएं पूरी होती हैं। बड़े भाई-बहनों का सहयोग।',
        'Isolation needs. Spiritual seeking. Foreign connections. Subconscious mind active. Sleep issues. Expenses on mother.': 'एकांत की आवश्यकता। आध्यात्मिक खोज। विदेशी संपर्क। अवचेतन मन सक्रिय। नींद के मुद्दे। माता पर व्यय।',

        /* ── House Names ── */
        'Tanu Bhava': 'तनु भाव',
        'Dhana Bhava': 'धन भाव',
        'Sahaja Bhava': 'सहज भाव',
        'Sahaj Bhava': 'सहज भाव',
        'Sukha Bhava': 'सुख भाव',
        'Putra Bhava': 'पुत्र भाव',
        'Ripu/Roga Bhava': 'रिपु/रोग भाव',
        'Ripu Bhava': 'रिपु भाव',
        'Kalatra Bhava': 'कलत्र भाव',
        'Randhra Bhava': 'रंध्र भाव',
        'Ayu Bhava': 'आयु भाव',
        'Dharma Bhava': 'धर्म भाव',
        'Karma Bhava': 'कर्म भाव',
        'Labha Bhava': 'लाभ भाव',
        'Vyaya Bhava': 'व्यय भाव',
        'Self & Personality': 'स्वयं और व्यक्तित्व',
        'Wealth & Family': 'धन और परिवार',
        'Courage & Siblings': 'साहस और भाई-बहन',
        'Home & Mother (Best for Moon!)': 'घर और माता (चंद्र के लिए सर्वोत्तम!)',
        'Children & Creativity': 'संतान और रचनात्मकता',
        'Enemies & Health': 'शत्रु और स्वास्थ्य',
        'Marriage & Partners': 'विवाह और साझेदार',
        'Transformation & Mysteries': 'परिवर्तन और रहस्य',
        'Fortune & Dharma': 'भाग्य और धर्म',
        'Career & Status': 'करियर और प्रतिष्ठा',
        'Gains & Friends': 'लाभ और मित्र',
        'Losses & Spirituality': 'हानि और अध्यात्म',
        'Self, body, personality, overall health, appearance': 'स्वयं, शरीर, व्यक्तित्व, समग्र स्वास्थ्य, रूप',
        'Wealth, family, speech, food, early childhood': 'धन, परिवार, वाणी, भोजन, बचपन',
        'Courage, siblings, short travels, communication, skills': 'साहस, भाई-बहन, छोटी यात्राएं, संवाद, कौशल',
        'Mother, home, emotions, inner peace, vehicles, land': 'माता, घर, भावनाएं, आंतरिक शांति, वाहन, भूमि',
        'Intelligence, creativity, children, romance, past life merit': 'बुद्धि, रचनात्मकता, संतान, रोमांस, पूर्व जन्म के पुण्य',
        'Enemies, disease, debts, service, daily work': 'शत्रु, रोग, ऋण, सेवा, दैनिक कार्य',
        'Spouse, partnerships, marriage, business partners': 'जीवनसाथी, साझेदारी, विवाह, व्यापारिक भागीदार',
        'Longevity, transformation, occult, sudden events, inheritance': 'दीर्घायु, परिवर्तन, गुप्त विद्या, अचानक घटनाएं, विरासत',
        'Dharma, father, guru, fortune, long travels, higher learning': 'धर्म, पिता, गुरु, भाग्य, लंबी यात्राएं, उच्च शिक्षा',
        'Career, status, reputation, authority, mother (alternative)': 'करियर, पद, प्रतिष्ठा, अधिकार, माता (विकल्प)',
        'Gains, friends, desires, elder siblings, networks': 'लाभ, मित्र, इच्छाएं, बड़े भाई-बहन, नेटवर्क',
        'Losses, expenses, foreign lands, spirituality, isolation, moksha': 'हानि, व्यय, विदेश, आध्यात्मिकता, एकांत, मोक्ष',
        'Tanu Bhava (Lagna)': 'तनु भाव (लग्न)',
        'Dhana Bhava (Wealth)': 'धन भाव (धन)',
        'Sahaj Bhava (Communications)': 'सहज भाव (संवाद)',
        'Sukha Bhava (Happiness) - BEST PLACEMENT': 'सुख भाव (प्रसन्नता) - सर्वोत्तम स्थान',
        'Putra Bhava (Creativity/Children)': 'पुत्र भाव (संतान/रचनात्मकता)',
        'Ripu Bhava (Enemies/Health) - CHALLENGING': 'रिपु भाव (शत्रु/स्वास्थ्य) - चुनौतीपूर्ण',
        'Kalatra Bhava (Partnerships)': 'कलत्र भाव (साझेदारी)',
        'Ayu Bhava (Longevity/Transformation) - CHALLENGING': 'आयु भाव (दीर्घायु/परिवर्तन) - चुनौतीपूर्ण',
        'Dharma Bhava (Fortune/Higher Learning) - EXCELLENT': 'धर्म भाव (भाग्य/उच्च शिक्षा) - उत्कृष्ट',
        'Karma Bhava (Career) - EXCELLENT': 'कर्म भाव (करियर) - उत्कृष्ट',
        'Labha Bhava (Gains/Friends) - GOOD': 'लाभ भाव (लाभ/मित्र) - उत्तम',
        'Vyaya Bhava (Losses/Moksha) - CHALLENGING': 'व्यय भाव (हानि/मोक्ष) - चुनौतीपूर्ण',

        /* ── Status Values ── */
        'Exalted': 'उच्च',
        'Debilitated': 'नीच',
        'Own Sign': 'स्वराशि',
        'Great Friend': 'महामित्र',
        'Friend': 'मित्र',
        'Neutral': 'सम',
        'Neutral (Lagna Lord)': 'सम (लग्न स्वामी)',
        'Enemy': 'शत्रु',
        'Great Enemy': 'महाशत्रु',
        'Very Strong': 'अति बलवान',
        'Very High': 'अति उच्च',
        'High': 'उच्च',
        'Strong': 'बलवान',
        'Moderate': 'मध्यम',
        'Below Average': 'औसत से कम',
        'Average': 'औसत',
        'Weak': 'दुर्बल',
        'Very Weak': 'अति दुर्बल',
        'Low': 'निम्न',
        'Retrograde': 'वक्री',
        'Direct': 'मार्गी',
        'Combust': 'अस्त',
        'Strong & Balanced': 'बलवान और संतुलित',
        'Sensitive/Afflicted': 'संवेदनशील/पीड़ित',
        'High Priority': 'उच्च प्राथमिकता',
        'high priority': 'उच्च प्राथमिकता',
        'positive': 'शुभ',
        'negative': 'अशुभ',
        'neutral': 'सम',

        /* ── Yoga Types ── */
        'Gaja Kesari Yoga': 'गज केसरी योग',
        'Budhaditya Yoga': 'बुधादित्य योग',
        'Kemadruma Yoga': 'केमद्रुम योग',
        'Sunapha Yoga': 'सुनफा योग',
        'Anapha Yoga': 'अनफा योग',
        'Durudhara Yoga': 'दुरुधरा योग',
        'Benefic': 'शुभ',
        'Malefic': 'अशुभ',
        'Abundance, wisdom, and long-lasting fame. Great mental strength.': 'प्रचुरता, ज्ञान और दीर्घकालिक प्रसिद्धि। महान मानसिक शक्ति।',
        'Intelligence, administrative skills, and professional success.': 'बुद्धि, प्रशासनिक कौशल और व्यावसायिक सफलता।',

        /* ── Moon Analysis Labels ── */
        'Moon Strength: ': 'चंद्र शक्ति: ',
        'Moon Sign (Rashi)': 'चंद्र राशि',
        'Nakshatra': 'नक्षत्र',
        'House Position': 'भाव स्थिति',
        'No Major Moon Afflictions!': 'कोई प्रमुख चंद्र पीड़ा नहीं!',
        'Moon Mantras': 'चंद्र मंत्र',
        'Debilitated Moon in Scorpio': 'वृश्चिक में नीच चंद्र',
        'Kemadruma Yoga': 'केमद्रुम योग',
        'Mental isolation and emotional loneliness': 'मानसिक एकाकीपन और भावनात्मक अकेलापन',

        /* ── Remedy Categories ── */
        'Mantras': 'मंत्र',
        'Gemstone': 'रत्न',
        'Charitable Acts': 'दान कार्य',
        'Fasting': 'उपवास',
        'Deity Worship': 'देव पूजा',
        'Lal Kitab Special': 'लाल किताब विशेष',
        'Lal Kitab Specific Remedies': 'लाल किताब के विशेष उपाय',
        'Parashar Jyotish:': 'पाराशर ज्योतिष:',
        'Parashar Jyotish': 'पाराशर ज्योतिष',
        'Remedies': 'उपाय',
        'Remedy': 'उपाय',

        /* ── Ashtakavarga ── */
        'Bhinnashtakavarga (Planet-wise Contributions)': 'भिन्नाष्टकवर्ग (ग्रह-वार योगदान)',
        'Sarvashtakavarga Chart': 'सर्वाष्टकवर्ग चार्ट',
        'Total benefic points for each house. Points ≥ 28 indicate auspicious results.': 'प्रत्येक भाव के लिए कुल शुभ अंक। ≥28 अंक शुभ परिणाम दर्शाते हैं।',
        'Each planet contributes benefic points to different signs based on traditional Ashtakavarga rules.': 'प्रत्येक ग्रह पारंपरिक अष्टकवर्ग नियमों के अनुसार विभिन्न राशियों में शुभ अंक देता है।',
        'Auspicious (≥28)': 'शुभ (≥28)',
        'Inauspicious (<25)': 'अशुभ (<25)',
        'Mixed (25-27)': 'मिश्रित (25-27)',

        /* ── Page Titles & Headings ── */
        'Personalized Astro-Psychology Report': 'व्यक्तिगत ज्योतिष-मनोविज्ञान रिपोर्ट',
        'Deep Insights into your Mind, Emotions & Remedies': 'मन, भावनाएं और उपायों की गहरी अंतर्दृष्टि',
        'Where Psychology Meets': 'जहाँ मनोविज्ञान मिलता है',
        'Vedic Wisdom': 'वैदिक ज्ञान से',
        'Discover the cosmic connection between your psychological challenges and planetary periods.': 'अपनी मनोवैज्ञानिक चुनौतियों और ग्रह दशाओं के बीच ब्रह्मांडीय संबंध खोजें।',
        'Receive personalized Vedic remedies based on your Dasha system and birth chart.': 'अपनी दशा प्रणाली और जन्म कुंडली के आधार पर व्यक्तिगत वैदिक उपाय प्राप्त करें।',
        'Begin Your Journey': 'अपनी यात्रा शुरू करें',
        'The Ancient Science of Timing': 'समय का प्राचीन विज्ञान',

        /* ── Assessment Page ── */
        'Welcome to AstroPsycho': 'ज्योतिष मनोविज्ञान में आपका स्वागत है',
        'Choose how you\'d like to proceed with your astrological analysis': 'अपने ज्योतिषीय विश्लेषण के लिए आगे बढ़ने का तरीका चुनें',
        'Full Astro-Psychology Analysis': 'पूर्ण ज्योतिष-मनोविज्ञान विश्लेषण',
        'Kundali Only (Skip Assessment)': 'केवल कुंडली (मूल्यांकन छोड़ें)',
        'Start Full Assessment →': 'पूर्ण मूल्यांकन शुरू करें →',
        'Skip to Birth Details →': 'जन्म विवरण पर जाएं →',
        'Birth Details': 'जन्म विवरण',
        'Full Name *': 'पूरा नाम *',
        'Date of Birth *': 'जन्म तिथि *',
        'Time of Birth *': 'जन्म समय *',
        'Place of Birth *': 'जन्म स्थान *',
        'Latitude': 'अक्षांश',
        'Longitude': 'देशांतर',
        'Timezone Offset (UTC) *': 'समय क्षेत्र (UTC) *',
        'Gender': 'लिंग',
        'Male': 'पुरुष',
        'Female': 'महिला',
        'Other': 'अन्य',
        'Generate My Report →': 'मेरी रिपोर्ट बनाएं →',
        'Analyzing Your Chart...': 'आपकी कुंडली का विश्लेषण हो रहा है...',
        'Psychological Assessment': 'मनोवैज्ञानिक मूल्यांकन',
        'Step 1 of 3': 'चरण 1 / 3',
        'Step 2 of 3': 'चरण 2 / 3',
        'Step 3 of 3': 'चरण 3 / 3',

        /* ── Results Page ── */
        'Visual Kundali (Birth Charts)': 'दृश्य कुंडली (जन्म चार्ट)',
        'North Indian Style': 'उत्तर भारतीय शैली',
        'South Indian Style': 'दक्षिण भारतीय शैली',
        'Birth Chart (D-1)': 'जन्म कुंडली (D-1)',
        'Navamsha Chart (D-9)': 'नवांश कुंडली (D-9)',
        'Transit Outlook': 'गोचर दृष्टिकोण',
        'Planetary Analysis': 'ग्रह विश्लेषण',
        'Planet': 'ग्रह',
        'Rashi': 'राशि',
        'Degree': 'अंश',
        'Status': 'स्थिति',
        'Shadbala (Planetary Strength)': 'षड्बल (ग्रह शक्ति)',
        'Current Transits & Visual Outlook': 'वर्तमान गोचर और दृश्य दृष्टिकोण',
        'Detailed House Analysis': 'विस्तृत भाव विश्लेषण',
        'Detailed Moon & Mind Analysis': 'विस्तृत चंद्र और मन विश्लेषण',
        'Astrological Yogas & Doshas': 'ज्योतिषीय योग और दोष',
        'Explore Detailed Analysis': 'विस्तृत विश्लेषण देखें',
        'Moon Analysis': 'चंद्र विश्लेषण',
        'Your Mind, Emotions & Mental Health': 'आपका मन, भावनाएं और मानसिक स्वास्थ्य',
        'Ashtakavarga': 'अष्टकवर्ग',
        'Detailed Point System & House Strength': 'विस्तृत अंक प्रणाली और भाव शक्ति',
        'Positive Yogas': 'शुभ योग',
        'Your Blessings & Natural Strengths': 'आपके आशीर्वाद और प्राकृतिक शक्तियां',
        'Doshas & Challenges': 'दोष और चुनौतियां',
        'Obstacles & Their Remedies': 'बाधाएं और उनके उपाय',
        'Psychological Assessment Summary': 'मनोवैज्ञानिक मूल्यांकन सारांश',
        'The Connection: Why You Feel This Way': 'संबंध: आप ऐसा क्यों महसूस करते हैं',
        'Your Personalized Vedic Remedies': 'आपके व्यक्तिगत वैदिक उपाय',
        'Timeline: When Will Relief Come?': 'समयरेखा: राहत कब मिलेगी?',
        'Important Note': 'महत्वपूर्ण नोट',
        'Print / Save as PDF': 'प्रिंट / PDF के रूप में सहेजें',
        'Save Report as PDF': 'रिपोर्ट PDF में सहेजें',
        'Back to Home': 'होम पर वापस जाएं',
        'Return to Home': 'होम पर वापस जाएं',
        'Back to Results': 'परिणाम पर वापस जाएं',
        'Back to Full Report': 'पूरी रिपोर्ट पर वापस जाएं',
        'View Results Page': 'परिणाम पृष्ठ देखें',
        'Refresh Page': 'पृष्ठ ताज़ा करें',
        'Retry': 'पुनः प्रयास',
        'Birth': 'जन्म',
        'Transit': 'गोचर',
        'Navatara': 'नवतारा',
        'Outlook': 'दृष्टिकोण',
        'Current Planetary Transits (Gochar)': 'वर्तमान ग्रह गोचर',
        'Transit effects calculated from your natal Moon position and Nakshatra relationships.': 'आपकी जन्म चंद्र स्थिति और नक्षत्र संबंधों से गोचर प्रभाव की गणना।',
        'Strength Leader:': 'शक्ति नेता:',
        'Strength Leader': 'शक्ति नेता',
        'Rupas': 'रूप',
        'Total (Rupa)': 'कुल (रूप)',
        'Strength': 'शक्ति',
        'House Analysis': 'भाव विश्लेषण',

        /* ── Moon Analysis Page ── */
        'Your Moon - The Mind in Vedic Astrology': 'आपका चंद्र - वैदिक ज्योतिष में मन',
        'Understanding your mental and emotional nature through Moon placement': 'चंद्र स्थिति के माध्यम से आपकी मानसिक और भावनात्मक प्रकृति को समझना',
        'Moon = Mind in Vedic Astrology': 'चंद्र = वैदिक ज्योतिष में मन',
        'Moon Strength Analysis': 'चंद्र शक्ति विश्लेषण',
        'Moon Position in Your Chart': 'आपकी कुंडली में चंद्र की स्थिति',
        'Your Psychological Profile (Based on Moon)': 'आपकी मनोवैज्ञानिक प्रोफ़ाइल (चंद्र आधारित)',
        'Moon Afflictions Detected': 'चंद्र पीड़ा का पता चला',
        'Moon Blessings in Your Chart': 'आपकी कुंडली में चंद्र के आशीर्वाद',
        'Moon Strengthening Remedies': 'चंद्र बल वर्धन उपाय',
        'Professional Mental Health Support': 'पेशेवर मानसिक स्वास्थ्य सहायता',
        '\u2728 Your Moon is well-placed for mental peace!': '\u2728 आपका चंद्र मानसिक शांति के लिए उत्तम स्थान पर है!',
        '\uD83D\uDcab Moon has moderate strength. Remedies will help.': '\uD83D\uDcab चंद्र में मध्यम शक्ति है। उपाय सहायक होंगे।',
        '\u26A0\uFE0F Moon needs strengthening. Focus on remedies.': '\u26A0\uFE0F चंद्र को बल की आवश्यकता है। उपायों पर ध्यान दें।',

        /* ── Positive Yogas Page ── */
        'Your Positive Yogas & Blessings': 'आपके शुभ योग और आशीर्वाद',
        'Auspicious planetary combinations in your birth chart': 'आपकी जन्म कुंडली में शुभ ग्रह संयोग',
        'What are Positive Yogas?': 'शुभ योग क्या हैं?',
        'Yoga Summary': 'योग सारांश',
        'Your Detected Positive Yogas': 'आपके पहचाने गए शुभ योग',
        'How to Enhance Your Yogas': 'अपने योगों को कैसे बढ़ाएं',
        'View Negative Yogas →': 'नकारात्मक योग देखें →',

        /* ── Negative Yogas Page ── */
        'Negative Yogas & Doshas': 'नकारात्मक योग और दोष',
        'Understanding challenges and their remedies': 'चुनौतियों और उनके उपायों को समझना',
        'What are Doshas & Negative Yogas?': 'दोष और नकारात्मक योग क्या हैं?',
        'Detected Doshas & Negative Yogas': 'पहचाने गए दोष और नकारात्मक योग',
        'Remedies & Solutions': 'उपाय और समाधान',
        'Professional Support Important': 'पेशेवर सहायता महत्वपूर्ण है',
        'View Positive Yogas →': 'शुभ योग देखें →',

        /* ── Common UI ── */
        'House': 'भाव',
        'Sign': 'राशि',
        /* ── Sun House Results ── */
        'Strong ego, leadership, vitality, but can be arrogant. Strong influence on self-identity.': 'मजबूत अहंकार, नेतृत्व, जीवन शक्ति, लेकिन अहंकारी हो सकते हैं। आत्म-पहचान पर गहरा प्रभाव।',
        'Focus on wealth and family, authoritative speech, potential for government gains.': 'धन और परिवार पर ध्यान, आधिकारिक वाणी, सरकारी लाभ की संभावना।',
        'Courageous, successful in small ventures, authoritative with siblings.': 'साहसी, छोटे उपक्रमों में सफल, भाई-बहनों के साथ आधिकारिक।',
        'Focused on home and mother, but may cause some restlessness or heart-related issues.': 'घर और माता पर केंद्रित, लेकिन कुछ बेचैनी या हृदय संबंधी समस्याओं का कारण बन सकता है।',
        'Intelligence, creative power, success in spiritual pursuits, limited children or strictness with them.': 'बुद्धि, रचनात्मक शक्ति, आध्यात्मिक कार्यों में सफलता, सीमित संतान या उनके साथ सख्ती।',
        'Victory over enemies, good health, success in service and legal matters.': 'शत्रुओं पर विजय, अच्छा स्वास्थ्य, सेवा और कानूनी मामलों में सफलता।',
        'Strong spouse but potential for ego clashes in marriage/partnerships.': 'मजबूत जीवनसाथी लेकिन विवाह/साझेदारी में अहंकार के टकराव की संभावना।',
        'Interest in occult, longevity, but sudden health changes and focus on inheritance.': 'गुप्त विद्याओं में रुचि, दीर्घायु, लेकिन अचानक स्वास्थ्य परिवर्तन और विरासत पर ध्यान।',
        'Dharmic, relationship with father is significant, success in higher learning.': 'धार्मिक, पिता के साथ संबंध महत्वपूर्ण, उच्च शिक्षा में सफलता।',
        'Great career success, power, authority, public recognition.': 'महान करियर सफलता, शक्ति, अधिकार, सार्वजनिक मान्यता।',
        'Influential social circle, financial gains, fulfilling high ambitions.': 'प्रभावशाली सामाजिक दायरा, आर्थिक लाभ, उच्च महत्वाकांक्षाओं की पूर्ति।',
        'Spiritual inclination, expenses on righteous causes, success in foreign lands.': 'आध्यात्मिक झुकाव, नेक कार्यों पर खर्च, विदेशों में सफलता।',

        /* ── Moon House Results ── */
        'Emotionally sensitive, imaginative, beautiful appearance, mood swings.': 'भावनात्मक रूप से संवेदनशील, कल्पनाशील, सुंदर रूप, मनोदशा परिवर्तन।',
        'Wealth through family/fluctuating income, sweet speech, focus on security.': 'परिवार के माध्यम से धन/अस्थिर आय, मधुर वाणी, सुरक्षा पर ध्यान।',
        'Creative mind, traveling, close to siblings, artistic communication.': 'रचनात्मक मन, यात्रा, भाई-बहनों के करीब, कलात्मक संवाद।',
        'Emotional happiness, strong bond with mother, focus on domestic comfort.': 'भावनात्मक खुशी, माता के साथ मजबूत बंधन, घरेलू सुख-सुविधाओं पर ध्यान।',
        'Creative intelligence, emotional romance, many children, fluctuating mind.': 'रचनात्मक बुद्धि, भावनात्मक रोमांस, कई संतान, अस्थिर मन।',
        'Health sensitivity, emotional stress at work, focus on service.': 'स्वास्थ्य संवेदनशीलता, काम पर भावनात्मक तनाव, सेवा पर ध्यान।',
        'Emotional spouse, success in public-facing business, focus on harmony.': 'भावनात्मक जीवनसाथी, सार्वजनिक व्यवसाय में सफलता, सद्भाव पर ध्यान।',
        'Deep intuition, emotional transformations, focus on hidden things.': 'गहरी अंतर्दृष्टि, भावनात्मक परिवर्तन, छिपी हुई चीजों पर ध्यान।',
        'Spiritual, fortunate, religious travels, intuitive wisdom.': 'आध्यात्मिक, भाग्यशाली, धार्मिक यात्राएं, सहज ज्ञान।',
        'Popularity in career, changes in profession, public service.': 'करियर में लोकप्रियता, पेशे में बदलाव, सार्वजनिक सेवा।',
        'Gain through friends/women, fulfilling emotional desires, social success.': 'मित्रों/महिलाओं के माध्यम से लाभ, भावनात्मक इच्छाओं की पूर्ति, सामाजिक सफलता।',
        'Isolating mind, spiritual seeking, expenses on family, subconscious focus.': 'अलगाव वाला मन, आध्यात्मिक खोज, परिवार पर खर्च, अवचेतन पर ध्यान।',

        /* ── Mars House Results ── */
        'Energetic, bold, potential for scars/anger, strong physical presence.': 'ऊर्जावान, साहसी, निशान/क्रोध की संभावना, मजबूत शारीरिक उपस्थिति।',
        'Aggressive speech, focus on earning but potential for family friction.': 'आक्रामक वाणी, कमाई पर ध्यान लेकिन पारिवारिक कलह की संभावना।',
        'Great courage, competitive, strong siblings, active communicator.': 'महान साहस, प्रतिस्पर्धी, मजबूत भाई-बहन, सक्रिय संचारक।',
        'Friction at home, property gains, potential heart/emotional stress.': 'घर में कलह, संपत्ति लाभ, हृदय/भावनात्मक तनाव की संभावना।',
        'Intellectual energy, competitive romance, risk-taking, surgical mind.': 'बौद्धिक ऊर्जा, प्रतिस्पर्धी रोमांस, जोखिम लेना, सर्जिकल दिमाग।',
        'Winning over rivals, success in law/medicine, hardworking.': 'प्रतिद्वंद्वियों पर जीत, कानून/चिकित्सा में सफलता, मेहनती।',
        'Manglik influence: friction in marriage, strong/independent spouse.': 'मांगलिक प्रभाव: विवाह में कलह, मजबूत/स्वतंत्र जीवनसाथी।',
        'Sudden events, energetic transformations, potential for injuries/energy work.': 'अचानक घटनाएं, ऊर्जावान परिवर्तन, चोटों/ऊर्जा कार्य की संभावना।',
        'Independent thinker, friction with authorities, passionate about beliefs.': 'स्वतंत्र विचारक, अधिकारियों के साथ घर्षण, विश्वासों के प्रति जुनूनी।',
        'High authority, success in police/army/tech/building, dynamic career.': 'उच्च अधिकार, पुलिस/सेना/तकनीक/भवन में सफलता, गतिशील करियर।',
        'Gain through brothers, competitive networking, achieving difficult goals.': 'भाई-बहनों के माध्यम से लाभ, प्रतिस्पर्धी नेटवर्किंग, कठिन लक्ष्यों की प्राप्ति।',
        'Hidden anger, secret enemies, expenses on medicine/conflicts, spiritual energy.': 'छिपा हुआ गुस्सा, गुप्त दुश्मन, दवा/विवादों पर खर्च, आध्यात्मिक ऊर्जा।',

        /* ── Mercury House Results ── */
        'Witty, intelligent, youthful appearance, great communicator.': 'हाजिरजवाब, बुद्धिमान, युवा रूप, महान संचारक।',
        'Wealth through business/speech, clever speaker, focus on education.': 'व्यवसाय/वाणी के माध्यम से धन, चतुर वक्ता, शिक्षा पर ध्यान।',
        'Excellent skills, frequent travels, success in writing/media.': 'उत्कृष्ट कौशल, बार-बार यात्राएं, लेखन/मीडिया में सफलता।',
        'Intellectual home life, happiness through learning/mother, stable mind.': 'बौद्धिक घरेलू जीवन, सीखने/माता के माध्यम से खुशी, स्थिर मन।',
        'Genius intelligence, analytical romance, success in speculation/teaching.': 'विलक्षण बुद्धि, विश्लेषणात्मक रोमांस, अटकलबाजी/शिक्षण में सफलता।',
        'Success in accounting/audit, health focus, winning through logic.': 'लेखांकन/ऑडिट में सफलता, स्वास्थ्य पर ध्यान, तर्क के माध्यम से जीत।',
        'Intellectual spouse, success in trading/partnerships, harmony through talk.': 'बौद्धिक जीवनसाथी, व्यापार/साझेदारी में सफलता, बातचीत के माध्यम से सद्भाव।',
        'Research oriented mind, longevity, gain through hidden knowledge.': 'अनुसंधान उन्मुख मन, दीर्घायु, गुप्त ज्ञान के माध्यम से लाभ।',
        'Philosophical, successful in publishing/law, intellectual father figure.': 'दार्शनिक, प्रकाशन/कानून में सफल, बौद्धिक पिता तुल्य।',
        'Business success, diverse career, analytical professional life.': 'व्यावसायिक सफलता, विविध करियर, विश्लेषणात्मक पेशेवर जीवन।',
        'Wealth through networks, intellectual friends, fulfilling goals through logic.': 'नेटवर्क के माध्यम से धन, बौद्धिक मित्र, तर्क के माध्यम से लक्ष्यों की पूर्ति।',
        'Imaginative mind, spiritual research, expenses on books/data, foreign trade.': 'कल्पनाशील मन, आध्यात्मिक अनुसंधान, पुस्तकों/डेटा पर खर्च, विदेशी व्यापार।',

        /* ── Jupiter House Results ── */
        'Wise, optimistic, magnetic personality, divine protection.': 'बुद्धिमान, आशावादी, चुंबकीय व्यक्तित्व, दिव्य सुरक्षा।',
        'Great wealth, family happiness, wise and truthful speech.': 'अपार धन, पारिवारिक सुख, बुद्धिमान और सत्यवादी वाणी।',
        'Wisdom in communication, successful siblings, lucky in short travels.': 'संचार में बुद्धिमत्ता, सफल भाई-बहन, छोटी यात्राओं में भाग्यशाली।',
        'Luxurious home, happiness through mother/property, spiritual peace.': 'विलासी घर, माता/संपत्ति के माध्यम से खुशी, आध्यात्मिक शांति।',
        'High intelligence, virtuous children, wealth through past merit/teaching.': 'उच्च बुद्धि, गुणी संतान, पूर्व पुण्य/शिक्षण के माध्यम से धन।',
        'Protection from health issues, success in service, wisdom in conflicts.': 'स्वास्थ्य समस्याओं से सुरक्षा, सेवा में सफलता, विवादों में बुद्धिमत्ता।',
        'Virtuous and wealthy spouse, successful partnerships, legal harmony.': 'गुणी और धनी जीवनसाथी, सफल साझेदारी, कानूनी सद्भाव।',
        'Deep spiritual wisdom, longevity, gain through legacy/occult.': 'गहरी आध्यात्मिक बुद्धिमत्ता, दीर्घायु, विरासत/गुप्त विद्या के माध्यम से लाभ।',
        'Most fortunate, guru-like father, success in dharma/higher world.': 'सर्वाधिक भाग्यशाली, गुरु समान पिता, धर्म/उच्च जगत में सफलता।',
        'Respected career, high status, success in law/religion/education.': 'सम्मानजनक करियर, उच्च पद, कानून/धर्म/शिक्षा में सफलता।',
        'Vast gains, wise social circle, all desires fulfilled through dharma.': 'विशाल लाभ, बुद्धिमान सामाजिक दायरा, धर्म के माध्यम से सभी इच्छाएं पूर्ण।',
        'Moksha orientation, spiritual expenses, success in meditation/foreign.': 'मोक्ष की ओर झुकाव, आध्यात्मिक खर्च, ध्यान/विदेश में सफलता।',

        /* ── Venus House Results ── */
        'Charming, artistic, physical beauty, focus on luxury/love.': 'आकर्षक, कलात्मक, शारीरिक सुंदरता, विलासिता/प्रेम पर ध्यान।',
        'Wealth through art/luxury, beautiful family, sweet speech.': 'कला/विलासिता के माध्यम से धन, सुंदर परिवार, मधुर वाणी।',
        'Artistic skills, gain through sisters, pleasant communication.': 'कलात्मक कौशल, बहनों के माध्यम से लाभ, सुखद संचार।',
        'Beautiful home, happiness through vehicles/comforts/mother.': 'सुंदर घर, वाहनों/सुविधाओं/माता के माध्यम से खुशी।',
        'Romantic heart, creative talent, success in entertainment/romance.': 'रोमांटिक हृदय, रचनात्मक प्रतिभा, मनोरंजन/रोमांस में सफलता।',
        'Harmonious service, focus on health/diet beauty, avoiding conflicts.': 'सद्भावपूर्ण सेवा, स्वास्थ्य/आहार सौंदर्य पर ध्यान, विवादों से बचना।',
        'Beautiful, artistic spouse; success in luxury trade/marriage.': 'सुंदर, कलात्मक जीवनसाथी; विलासिता व्यापार/विवाह में सफलता।',
        'Deep passion, gain through spouse/partners, interest in secrets.': 'गहरा जुनून, जीवनसाथी/साझेदारों के माध्यम से लाभ, रहस्यों में रुचि।',
        'Fortunate in love/travel, artistic father, spiritual beauty.': 'प्रेम/यात्रा में भाग्यशाली, कलात्मक पिता, आध्यात्मिक सुंदरता।',
        'Career in fashion/media/art/luxury, high social status.': 'फैशन/मीडिया/कला/विलासिता में करियर, उच्च सामाजिक दर्जा।',
        'Gain through social networks/women, artistic social circle.': 'सामाजिक नेटवर्क/महिलाओं के माध्यम से लाभ, कलात्मक सामाजिक दायरा।',
        'Bed pleasures, artistic imagination, expenses on luxury, spiritual love.': 'शयन सुख, कलात्मक कल्पना, विलासिता पर खर्च, आध्यात्मिक प्रेम।',

        /* ── Saturn House Results ── */
        'Mature, disciplined, slow start, serious approach to life.': 'परिपक्व, अनुशासित, धीमी शुरुआत, जीवन के प्रति गंभीर दृष्टिकोण।',
        'Hard-earned wealth, serious speech, delayed family support.': 'कड़ी मेहनत से अर्जित धन, गंभीर वाणी, परिवार के सहयोग में देरी।',
        'Great persistence, disciplined siblings, depth in communication.': 'महान दृढ़ता, अनुशासित भाई-बहन, संचार में गहराई।',
        'Responsibility at home, delayed property gains, emotional maturity.': 'घर पर जिम्मेदारी, संपत्ति लाभ में देरी, भावनात्मक परिपक्वता।',
        'Disciplined mind, late children, success through hard work/research.': 'अनुशासित मन, विलंब से संतान, कड़ी मेहनत/अनुसंधान के माध्यम से सफलता।',
        'Winning after long struggle, success in tech/service/law.': 'लंबे संघर्ष के बाद जीत, तकनीक/सेवा/कानून में सफलता।',
        'Mature/older spouse, delayed marriage, commitment in focus.': 'परिपक्व/वृद्ध जीवनसाथी, विलंब से विवाह, प्रतिबद्धता पर ध्यान।',
        'Long life, slow transformations, depth in legacy matters.': 'लंबा जीवन, धीमी गति से परिवर्तन, विरासत के मामलों में गहराई।',
        'Traditional, serious about dharma, hard-working father figure.': 'पारंपरिक, धर्म के प्रति गंभीर, मेहनती पिता तुल्य।',
        'Slow but steady career rise, high authority, karmic profession.': 'धीमी लेकिन स्थिर करियर वृद्धि, उच्च अधिकार, कर्म आधारित पेशा।',
        'Gains after delay, elderly friends, fulfilling long-term goals.': 'देरी के बाद लाभ, बुजुर्ग मित्र, दीर्घकालिक लक्ष्यों की पूर्ति।',
        'Spiritual isolation, saving money, success in distant lands/meditation.': 'आध्यात्मिक अलगाव, धन की बचत, दूर देशों/ध्यान में सफलता।',

        /* ── Rahu House Results ── */
        'Unconventional personality, obsession with self-image, unique path.': 'अपरंपरागत व्यक्तित्व, आत्म-छवि के प्रति जुनून, अनूठा रास्ता।',
        'Sudden wealth, unusual family dynamics, deceptive speech potential.': 'अचानक धन, असामान्य पारिवारिक गतिशीलता, भ्रामक वाणी की संभावना।',
        'Great courage, tech-savvy, unique siblings, bold communication.': 'महान साहस, तकनीकी जानकार, अनूठे भाई-बहन, साहसिक संचार।',
        'Unusual home/mother, material comforts focus, mental restlessness.': 'असामान्य घर/माता, भौतिक सुख-सुविधाओं पर ध्यान, मानसिक बेचैनी।',
        'Speculative gains, deep obsessions, unconventional children/romance.': 'सट्टा लाभ, गहरा जुनून, अपरंपरागत संतान/रोमांस।',
        'Slaying enemies, success in foreign service/medicine/litigation.': 'शत्रुओं का नाश, विदेश सेवा/चिकित्सा/मुकदमेबाजी में सफलता।',
        'Unconventional/foreign spouse, unique partnerships, friction potential.': 'अपरंपरागत/विदेशी जीवनसाथी, अनूठी साझेदारी, घर्षण की संभावना।',
        'Mysterious health/legacy events, sudden changes, obsession with occult.': 'रहस्यमयी स्वास्थ्य/विरासत की घटनाएं, अचानक परिवर्तन, गुप्त विद्याओं के प्रति जुनून।',
        'Breaking traditions, foreign travels, unique philosophical views.': 'परंपराओं को तोड़ना, विदेशी यात्राएं, अनूठे दार्शनिक विचार।',
        'Sudden fame, unique career path, manipulative or tech success.': 'अचानक प्रसिद्धि, अनूठा करियर पथ, जोड़-तोड़ या तकनीकी सफलता।',
        'Massive gains through networks, unique friendships, fulfilling material goals.': 'नेटवर्क के माध्यम से भारी लाभ, अनूठी मित्रता, भौतिक लक्ष्यों की पूर्ति।',
        'Foreign connections, spiritual illusions, high expenses, subconscious quest.': 'विदेशी संबंध, आध्यात्मिक भ्रम, उच्च खर्च, अवचेतन खोज।',

        /* ── Ketu House Results ── */
        'Detached personality, spiritual aura, identity search, unique look.': 'अलगाव वाला व्यक्तित्व, आध्यात्मिक आभा, पहचान की खोज, अनूठा रूप।',
        'Lack of attachment to wealth, unique speech, detachment from family.': 'धन के प्रति लगाव की कमी, अनूठी वाणी, परिवार से अलगाव।',
        'Intuitive skills, detached from siblings, spiritual courage.': 'सहज ज्ञान युक्त कौशल, भाई-बहनों से अलगाव, आध्यात्मिक साहस।',
        'Lack of peace at home, spiritual mother, detached from property.': 'घर में शांति की कमी, आध्यात्मिक माता, संपत्ति से अलगाव।',
        'Spiritual intelligence, past-life knowledge, detached romance.': 'आध्यात्मिक बुद्धि, पूर्व जन्म का ज्ञान, अलगाव वाला रोमांस।',
        'Mysterious health issues, overcoming enemies through detachment.': 'रहस्यमयी स्वास्थ्य समस्याएं, अलगाव के माध्यम से शत्रुओं पर विजय।',
        'Spiritual/mystical spouse, detached partnerships, friction potential.': 'आध्यात्मिक/रहस्यमयी जीवनसाथी, अलगाया हुआ साझाकरण, घर्षण की संभावना।',
        'Deep occult research, sudden transformations, moksha orientation.': 'गहन गुप्त विद्या अनुसंधान, अचानक परिवर्तन, मोक्ष की ओर झुकाव।',
        'Detached from traditional religion, mystical father, spiritual wisdom.': 'पारंपरिक धर्म से अलगाव, रहस्यमयी पिता, आध्यात्मिक ज्ञान।',
        'Unique/hidden career, lack of attachment to status, spiritual work.': 'अनोखा/छिपा हुआ करियर, पद-प्रतिष्ठा से लगाव की कमी, आध्यात्मिक कार्य।',
        'Gain through spiritual groups, few but deep friends, detached from gains.': 'आध्यात्मिक समूहों के माध्यम से लाभ, कम लेकिन गहरे मित्र, लाभ से अलगाव।',
        'Moksha, enlightenment potential, spiritual isolation, wandering mind.': 'मोक्ष, ज्ञानोदय की संभावना, आध्यात्मिक अलगाव, भटकता हुआ मन।',

        /* ── Mahadasha Effects ── */
        'Leadership opportunities, government connections, health focus, self-realization journey': 'नेतृत्व के अवसर, सरकारी संबंध, स्वास्थ्य पर ध्यान, आत्म-साक्षात्कार की यात्रा',
        'Emotional sensitivity, domestic changes, travel, new relationships, mental fluctuations': 'भावनात्मक संवेदनशीलता, घरेलू परिवर्तन, यात्रा, नए रिश्ते, मानसिक उतार-चढ़ाव',
        'Energy boost, property dealings, conflicts, surgery, assertion of power': 'ऊर्जा में वृद्धि, संपत्ति के सौदे, विवाद, सर्जरी, शक्ति का प्रदर्शन',
        'Business growth, education, communication, short travels, intellectual pursuits': 'व्यवसाय में वृद्धि, शिक्षा, संचार, छोटी यात्राएं, बौद्धिक प्रयास',
        'Spiritual growth, marriage, children, wealth expansion, education, teaching': 'आध्यात्मिक विकास, विवाह, संतान, धन विस्तार, शिक्षा, शिक्षण',
        'Marriage, relationships, artistic pursuits, luxury, vehicles, comforts': 'विवाह, रिश्ते, कलात्मक प्रयास, विलासिता, वाहन, सुख-सुविधाएं',
        'Karmic lessons, delays, hard work, spiritual growth, chronic issues, servants': 'कर्मों का फल, देरी, कड़ी मेहनत, आध्यात्मिक विकास, पुरानी बीमारियां, सेवक',
        'Unexpected changes, foreign travels, unconventional paths, materialism, confusion': 'अचानक परिवर्तन, विदेशी यात्राएं, अपरंपरागत रास्ते, भौतिकवाद, भ्रम',
        'Spiritual awakening, detachment, mystical experiences, losses, moksha pursuit': 'आध्यात्मिक जागृति, अलगाव, रहस्यमय अनुभव, हानि, मोक्ष की खोज',

        /* ── Dasha Interpretation Insights ── */
        "Period of soul development and establishing one's authority": "आत्मा के विकास और अपने अधिकार को स्थापित करने का काल",
        "Time of mental growth and emotional experiences": "मानसिक विकास और भावनात्मक अनुभवों का समय",
        "Period requiring patience and controlled assertion": "धैर्य और नियंत्रित मुखरता की आवश्यकता वाला काल",
        "18 years of Maya (illusion) requiring spiritual grounding": "माया (भ्रम) के 18 वर्ष, जिसमें आध्यात्मिक आधार की आवश्यकता है",
        "Most auspicious period for dharma and expansion": "धर्म और विस्तार के लिए सर्वाधिक शुभ काल",
        "19 years of karmic lessons and necessary delays for soul growth": "कर्मों की सीख के 19 वर्ष और आत्मा के विकास के लिए आवश्यक देरी",
        "The great teacher - harsh but fair, brings ultimate wisdom through hardship": "महान शिक्षक - कठोर लेकिन निष्पक्ष, कठिनाइयों के माध्यम से अंतिम ज्ञान लाता है",
        "17 years of learning and business development": "सीखने और व्यावसायिक विकास के 17 वर्ष",
        "Period of letting go and spiritual awakening": "मोह त्यागने और आध्यात्मिक जागृति का काल",
        "20 years of pleasure, relationships, and creative pursuits": "आनंद, रिश्तों और रचनात्मक प्रयासों के 20 वर्ष",

        /* ── Nakshatra Traits ── */
        'impulsive': 'आवेगी',
        'healing_ability': 'उपचार क्षमता',
        'quick_thinking': 'त्वरित सोच',
        'pioneering': 'अग्रगामी',
        'creative': 'रचनात्मक',
        'passionate': 'जुनूनी',
        'transformative': 'परिवर्तनकारी',
        'intense': 'तीव्र',
        'sharp': 'तीक्ष्ण',
        'critical': 'आलोचनात्मक',
        'purifying': 'शुद्ध करने वाला',
        'determined': 'दृढ़संकल्प',
        'artistic': 'कलात्मक',
        'emotional': 'भावनात्मक',
        'beautiful': 'सुंदर',
        'materialistic': 'भौतिकवादी',
        'searching': 'खोजने वाला',
        'curious': 'जिज्ञासु',
        'gentle': 'सौम्य',
        'restless': 'अशांत',
        'stormy': 'तूफानी',
        'intelligent': 'बुद्धिमान',
        'optimistic': 'आशावादी',
        'returning': 'लौटने वाला',
        'nurturing': 'पोषण करने वाला',
        'wise': 'बुद्धिमान',
        'nourishing': 'पोषक',
        'spiritual': 'आध्यात्मिक',
        'disciplined': 'अनुशासित',
        'supportive': 'सहायक',
        'mysterious': 'रहस्यमयी',
        'intuitive': 'सहज ज्ञान युक्त',
        'manipulative': 'जोड़-तोड़ करने वाला',
        'penetrating': 'सटीक',
        'royal': 'शाही',
        'ancestral': 'पैतृक',
        'proud': 'गर्वित',
        'generous': 'उदार',
        'relaxed': 'शांत',
        'pleasure_loving': 'सुख-प्रेमी',
        'leadership': 'नेतृत्व',
        'organized': 'व्यवस्थित',
        'skillful': 'कुशल',
        'clever': 'चतुर',
        'practical': 'व्यावहारिक',
        'healing': 'उपचार',
        'charismatic': 'करिश्माई',
        'detailed': 'विस्तृत',
        'independent': 'स्वतंत्र',
        'flexible': 'लचीला',
        'diplomatic': 'राजनयिक',
        'scattered': 'बिखरा हुआ',
        'goal_oriented': 'लक्ष्य-उन्मुख',
        'conflicted': 'द्वंद्वपूर्ण',
        'powerful': 'शक्तिशाली',
        'devoted': 'समर्पित',
        'friendly': 'मैत्रीपूर्ण',
        'balanced': 'संतुलित',
        'secretive': 'गुप्त',
        'protective': 'सुरक्षात्मक',
        'senior': 'वरिष्ठ',
        'responsible': 'जिम्मेदार',
        'controlling': 'नियंत्रण करने वाला',
        'root_seeking': 'जड़ खोजने वाला',
        'destroying': 'नष्ट करने वाला',
        'investigating': 'जांच करने वाला',
        'invincible': 'अजेय',
        'victorious': 'विजयी',
        'ethical': 'नैतिक',
        'listening': 'सुनने वाला',
        'learning': 'सीखने वाला',
        'connected': 'जुड़ा हुआ',
        'traditional': 'पारंपरिक',
        'wealthy': 'धनी',
        'musical': 'संगीतमय',
        'adaptable': 'अनुकूलनशील',
        'ambitious': 'महत्वाकांक्षी',
        'cynical': 'शंकालु',
        'deep': 'गहरा',
        'patient': 'धैर्यवान',
        'soft': 'कोमल',
        'completing': 'पूर्ण करने वाला',

        /* ── Dasha UI Labels ── */
        'Current Mahadasha (Major Period)': 'वर्तमान महादशा (मुख्य काल)',
        'Current Antardasha (Sub-Period)': 'वर्तमान अंतर्दशा (उप-काल)',
        'What this period brings:': 'यह काल क्या लाता है:',
        'The sub-period adds ': 'उप-काल जोड़ता है ',
        "'s specific influence to your current ": " का विशिष्ट प्रभाव आपके वर्तमान ",
        " period.": " काल में।",
        'A significant period of life transformation': 'जीवन परिवर्तन का एक महत्वपूर्ण काल',
        'Period:': 'अवधि:',
        'Duration:': 'कुल अवधि:',
        ' total': ' कुल',

        /* ── Mental Health Yoga Effects ── */
        'Mental confusion, emotional turmoil, identity issues': 'मानसिक भ्रम, भावनात्मक उथल-पुथल, पहचान संबंधी समस्याएं',
        'Anxiety, poverty mentality, emotional isolation, mental instability': 'चिंता, गरीबी की मानसिकता, भावनात्मक अलगाव, मानसिक अस्थिरता',
        'Mental affliction, confusion, addictions, health issues': 'मानसिक कष्ट, भ्रम, व्यसन, स्वास्थ्य समस्याएं',
        'Ancestral curses, father issues, lack of direction, depression': 'पैतृक दोष, पिता संबंधी समस्याएं, दिशाहीनता, अवसाद',
        'Mental ups and downs, financial fluctuations, pessimism': 'मानसिक उतार-चढ़ाव, वित्तीय अस्थिरता, निराशावाद',
        'Mental disorders, anxiety, depression, emotional instability': 'मानसिक विकार, चिंता, अवसाद, भावनात्मक अस्थिरता',
        'Great mental strength, wisdom, optimistic outlook, and ability to overcome depression.': 'महान मानसिक शक्ति, बुद्धिमत्ता, आशावादी दृष्टिकोण और अवसाद को दूर करने की क्षमता।',
        'High artistic intelligence, creativity, and balanced mental approach.': 'उच्च कलात्मक बुद्धिमत्ता, रचनात्मकता और संतुलित मानसिक दृष्टिकोण।',
        'Purity of character, professional integrity, and mental peace through career success.': 'चरित्र की पवित्रता, व्यावसायिक अखंडता और करियर की सफलता के माध्यम से मानसिक शांति।',

        /* ── Yoga Remedies ── */
        'Chandra mantra 108 times daily, donate white items on Mondays': 'प्रतिदिन 108 बार चंद्र मंत्र, सोमवार को सफेद वस्तुओं का दान',
        'Pearl gemstone, Moon worship, serve mother, donate milk': 'मोती रत्न, चंद्र पूजन, माता की सेवा, दूध का दान',
        'Prayers during eclipses, donate during eclipse, mantra of afflicted planet': 'ग्रहण के दौरान प्रार्थना, ग्रहण के दौरान दान, पीड़ित ग्रह का मंत्र',
        'Perform Shraddha rituals, help fathers, donate on Sundays, Pitru Tarpan': 'श्राद्ध कर्म करें, पिताओं की मदद करें, रविवार को दान करें, पितृ तर्पण',
        'Jupiter remedies, worship Lord Vishnu, donate yellow items on Thursdays': 'बृहस्पति के उपाय, भगवान विष्णु की पूजा, गुरुवार को पीली वस्तुओं का दान',
        'Moon remedies, mental health support, meditation, spiritual practices': 'चंद्र के उपाय, मानसिक स्वास्थ्य सहायता, ध्यान, आध्यात्मिक अभ्यास',
        'Continue wisdom-based practices, respect teachers.': 'ज्ञान-आधारित अभ्यास जारी रखें, शिक्षकों का सम्मान करें।',
        'Worship Goddess Saraswati, maintain daily learning.': 'देवी सरस्वती की पूजा करें, दैनिक शिक्षा जारी रखें।',
        'Ethical behavior in professional life.': 'पेशेवर जीवन में नैतिक व्यवहार।',





        'Yoga': 'योग',
        'Dosha': 'दोष',
        'Analysis': 'विश्लेषण',
        'Report': 'रिपोर्ट',
        'Chart': 'कुंडली',
        'Prediction': 'भविष्यवाणी',
        'Rating Scale:': 'रेटिंग स्केल:',
        'Never/Not at all': 'कभी नहीं/बिल्कुल नहीं',
        'Rarely/Slightly': 'शायद ही कभी/थोड़ा',
        'Sometimes/Moderately': 'कभी-कभी/मध्यम',
        'Often/Quite a bit': 'अक्सर/काफी',
        'Always/Extremely': 'हमेशा/अत्यंत',
        'Never': 'कभी नहीं',
        'Rarely': 'शायद ही कभी',
        'Sometimes': 'कभी-कभी',
        'Often': 'अक्सर',
        'Always': 'हमेशा',
        'Mental & Emotional Well-being': 'मानसिक और भावनात्मक कल्याण',
        'Relationships & Social Life': 'रिश्ते और सामाजिक जीवन',
        'Career & Financial Matters': 'करियर और वित्तीय मामले',
        'Life Purpose & Direction': 'जीवन का उद्देश्य और दिशा',
        'Behavioral Patterns': 'व्यवहार पैटर्न',
        'Physical Health & Well-being': 'शारीरिक स्वास्थ्य और कल्याण',
        'Self-Esteem & Confidence': 'आत्म-सम्मान और आत्मविश्वास',
        'I feel anxious or worried most of the time': 'मैं अधिकांश समय चिंतित या परेशान महसूस करता हूँ',
        'I have trouble falling asleep or staying asleep': 'मुझे सोने में या सोते रहने में समस्या होती है',
        'I feel sad, hopeless, or have lost interest in things I used to enjoy': 'मैं दुखी, निराश महसूस करता हूँ या उन चीजों में रुचि खो दी है जिनका मैं आनंद लेता था',
        'I feel overwhelmed by daily responsibilities': 'मैं दैनिक जिम्मेदारियों से अभिभूत महसूस करता हूँ',
        'I have racing thoughts or overthink situations': 'मेरे विचार बहुत तेज चलते हैं या मैं स्थितियों के बारे में बहुत अधिक सोचता हूँ',
        'I experience sudden panic attacks or intense fear': 'मुझे अचानक पैनिक अटैक या तीव्र भय का अनुभव होता है',
        'I feel isolated or alone even around others': 'मैं दूसरों के बीच भी अलग-थलग या अकेला महसूस करता हूँ',
        'I have thoughts of self-harm or ending my life': 'मेरे मन में खुद को नुकसान पहुँचाने या जीवन समाप्त करने के विचार आते हैं',
        'I have frequent conflicts with my spouse/partner': 'मेरे अपने जीवनसाथी/साथी के साथ अक्सर विवाद होते हैं',
        'I feel misunderstood or unsupported by my family': 'मैं अपने परिवार द्वारा गलत समझा गया या असमर्थित महसूस करता हूँ',
        'I have trust issues in my relationships': 'मेरे रिश्तों में विश्वास के मुद्दे हैं',
        'I argue frequently with my parents or siblings': 'मेरा अपने माता-पिता या भाई-बहनों के साथ अक्सर झगड़ा होता है',
        'I feel lonely and struggle to maintain friendships': 'मैं अकेलापन महसूस करता हूँ और दोस्ती बनाए रखने में संघर्ष करता हूँ',
        'I avoid social situations due to anxiety': 'मैं चिंता के कारण सामाजिक स्थितियों से बचता हूँ',
        'There is no romance or connection in my marriage': 'मेरे विवाह में कोई रोमांस या संबंध नहीं है',
        'I am unsure about my career direction or goals': 'मैं अपने करियर की दिशा या लक्ष्यों के बारे में अनिश्चित हूँ',
        'I feel unfulfilled or dissatisfied in my current job': 'मैं अपनी वर्तमान नौकरी में असंतुष्ट या अतृप्त महसूस करता हूँ',
        'I constantly worry about money and financial security': 'मैं लगातार पैसे और वित्तीय सुरक्षा के बारे में चिंता करता हूँ',
        'I am in significant debt or struggle to save money': 'मैं महत्वपूर्ण कर्ज में हूँ या पैसे बचाने में संघर्ष करता हूँ',
        'I feel stuck in my career with no growth opportunities': 'मैं अपने करियर में अटका हुआ महसूस करता हूँ और विकास के कोई अवसर नहीं हैं',
        'Work stress affects my physical and mental health': 'काम का तनाव मेरे शारीरिक और मानसिक स्वास्थ्य को प्रभावित करता है',
        'I feel my life lacks meaning or purpose': 'मुझे लगता है कि मेरे जीवन में अर्थ या उद्देश्य की कमी है',
        'I question why I am here and what my goals should be': 'मैं सवाल करता हूँ कि मैं यहाँ क्यों हूँ और मेरे लक्ष्य क्या होने चाहिए',
        'I feel disconnected from my spiritual or religious beliefs': 'मैं अपने आध्यात्मिक या धार्मिक विश्वासों से कटा हुआ महसूस करता हूँ',
        'I struggle to find motivation or direction in life': 'मैं जीवन में प्रेरणा या दिशा खोजने के लिए संघर्ष करता हूँ',
        'I feel lost and don\'t know what path to take': 'मैं खोया हुआ महसूस करता हूँ और नहीं जानता कि कौन सा रास्ता अपनाना है',
        'I have difficulty controlling my anger or temper': 'मुझे अपने गुस्से या स्वभाव को नियंत्रित करने में कठिनाई होती है',
        'I use alcohol, drugs, or other substances to cope with problems': 'मैं समस्याओं से निपटने के लिए शराब, ड्रग्स या अन्य पदार्थों का उपयोग करता हूँ',
        'I engage in compulsive behaviors I can\'t seem to stop': 'मैं ऐसे बाध्यकारी व्यवहारों में संलग्न हूँ जिन्हें मैं रोक नहीं सकता',
        'I frequently lose my temper and say things I regret': 'मैं अक्सर अपना आपा खो देता हूँ और ऐसी बातें कहता हूँ जिनका मुझे पछतावा होता है',
        'I have habits that I know are harmful but can\'t quit': 'मेरी ऐसी आदतें हैं जिन्हें मैं जानता हूँ कि हानिकारक हैं लेकिन छोड़ नहीं सकता',
        'I constantly worry about my health or having a serious disease': 'मैं लगातार अपने स्वास्थ्य या किसी गंभीर बीमारी के बारे में चिंता करता हूँ',
        'I experience frequent headaches, body aches, or fatigue': 'मुझे अक्सर सिरदर्द, शरीर में दर्द या थकान का अनुभव होता है',
        'I have chronic health issues that cause me stress': 'मुझे पुरानी स्वास्थ्य समस्याएं हैं जो मुझे तनाव देती हैं',
        'Physical symptoms appear when I\'m stressed or anxious': 'जब मैं तनावग्रस्त या चिंतित होता हूँ तो शारीरिक लक्षण दिखाई देते हैं',
        'I am afraid of getting sick or injured': 'मुझे बीमार होने या चोटिल होने का डर लगता है',
        'I have low self-esteem and don\'t believe in my abilities': 'मुझमें कम आत्म-सम्मान है और मुझे अपनी क्षमताओं पर विश्वास नहीं है',
        'I fear making decisions because I might fail': 'मुझे निर्णय लेने में डर लगता है क्योंकि मैं असफल हो सकता हूँ',
        'I compare myself negatively to others': 'मैं अपनी तुलना दूसरों से नकारात्मक रूप से करता हूँ',
        'I avoid taking on new challenges or responsibilities': 'मैं नई चुनौतियों या जिम्मेदारियों को लेने से बचता हूँ',
        'I feel inferior or not good enough': 'मैं हीन या पर्याप्त अच्छा नहीं महसूस करता हूँ',
        'Accurate birth time is crucial for Dasha calculations. Check your birth certificate if unsure.': 'सटीक जन्म समय दशा गणना के लिए महत्वपूर्ण है। यदि अनिश्चित हों तो जन्म प्रमाण पत्र देखें।',
        'Type your birth city and select from the suggestions.': 'अपना जन्म शहर टाइप करें और सुझावों में से चुनें।',
        'Search city (e.g. Mumbai, New York)': 'शहर खोजें (जैसे मुंबई, न्यूयॉर्क)',
        'Enter your full name': 'अपना पूरा नाम दर्ज करें',
        'This may take a few moments...': 'इसमें कुछ पल लग सकते हैं...',
        'This platform provides traditional Vedic insights and should complement, not replace, professional mental health care.': 'यह मंच पारंपरिक वैदिक अंतर्दृष्टि प्रदान करता है और इसे पेशेवर मानसिक स्वास्थ्य देखभाल के पूरक के रूप में उपयोग किया जाना चाहिए, न कि विकल्प के रूप में।',
        'Please answer all questions honestly. Rate each statement from 1 to 5.': 'कृपया सभी प्रश्नों का ईमानदारी से उत्तर दें। प्रत्येक कथन को 1 से 5 तक रेट करें।',
        'Please answer all questions before continuing.': 'कृपया जारी रखने से पहले सभी प्रश्नों के उत्तर दें।',
        'Error loading assessment. Please refresh the page.': 'मूल्यांकन लोड करने में त्रुटि। कृपया पृष्ठ को ताज़ा करें।',
        '← Back to Options': '← विकल्पों पर वापस जाएं',
        'Continue to Birth Details →': 'जन्म विवरण पर आगे बढ़ें →',
        '← Back': '← वापस',
        '[Important]': '[महत्वपूर्ण]',
        'Step 1 of 3': 'चरण 1 / 3',
        'Step 2 of 3': 'चरण 2 / 3',
        'Step 3 of 3': 'चरण 3 / 3',
        'Step': 'चरण',
        'of': '/',
        'Loading...': 'लोड हो रहा है...',
        'Please wait...': 'कृपया प्रतीक्षा करें...',
        'Type:': 'प्रकार:',
        'Type': 'प्रकार',
        'Benefic': 'शुभ',
        'Malefic/Challenge': 'अशुभ/चुनौती',
        'Wealth, comforts, and social standing.': 'धन, सुख-सुविधाएं और सामाजिक प्रतिष्ठा।',
        'Good health, polite nature, and fame.': 'अच्छा स्वास्थ्य, विनम्र स्वभाव और प्रसिद्धि।',
        'Self-made wealth and high intelligence.': 'स्व-अर्जित धन और उच्च बुद्धि।',
        'Loneliness or struggle in early life. Requires mental discipline.': 'प्रारंभिक जीवन में अकेलापन या संघर्ष। मानसिक अनुशासन की आवश्यकता।',
        'Obstacles and constant pressure. Requires perseverance.': 'बाधाएं और निरंतर दबाव। दृढ़ता की आवश्यकता।',
        'Paapa Kartari Yoga (Lagna)': 'पाप कर्तरी योग (लग्न)',
        'Note:': 'नोट:',
        'Transit effects are calculated from your natal Moon position (Chandra Lagna), which is the primary method in Vedic astrology for understanding emotional and mental impacts. \u26A0\uFE0F indicates Sade Sati phases, \uD83D\uDD25 shows Ashtama Shani, \u26A1 marks Kantaka Shani.': 'गोचर प्रभाव की गणना आपकी जन्म कुंडली के चंद्र (चंद्र लग्न) से की जाती है, जो भावनात्मक और मानसिक प्रभावों को समझने के लिए वैदिक ज्योतिष की प्राथमिक विधि है। \u26A0\uFE0F साढ़े साती के चरणों को दर्शाता है, \uD83D\uDD25 अष्टम शनि को और \u26A1 कंटक शनि को दर्शाता है।',
        'The Moon is the \'Manas\' or mind. Your': 'चंद्र \'मानस\' या मन है। आपकी',
        'Moon in': 'चंद्र',
        'House suggests a': 'भाव में है, जो एक',
        'stable and resilient': 'स्थिर और लचीला',
        'deeply emotional and sensitive': 'गहरा भावनात्मक और संवेदनशील',
        'approach to life\'s challenges.': 'जीवन की चुनौतियों के प्रति दृष्टिकोण दर्शाता है।',
        'Your emotional world is governed by': 'आपका भावनात्मक जगत',
        'and': 'और',
        'You may experience frequent mood swings or anxiety. Focus on stabilizing your routine.': 'आप बार-बार मनोदशा परिवर्तन या चिंता का अनुभव कर सकते हैं। अपनी दिनचर्या को स्थिर करने पर ध्यान दें।',
        'You possess natural emotional intelligence and ability to handle stress.': 'आपमें प्राकृतिक भावनात्मक बुद्धिमत्ता और तनाव को संभालने की क्षमता है।',
        '\u2728 Your Moon is well-placed for mental peace!': '\u2728 आपका चंद्र मानसिक शांति के लिए उत्तम स्थान पर है!',
        '\uD83D\uDcab Moon has moderate strength. Remedies will help.': '\uD83D\uDcab चंद्र में मध्यम शक्ति है। उपाय सहायक होंगे।',
        '\u26A0\uFE0F Moon needs strengthening. Focus on remedies.': '\u26A0\uFE0F चंद्र को बल की आवश्यकता है। उपायों पर ध्यान दें।',
        'Chandra Mangala Conjunction': 'चंद्र मंगल युति',
        'Chandra Shani Conjunction - Vish Yoga': 'चंद्र शनि युति - विष योग',
        'Chandra Rahu Conjunction - Grahan Yoga': 'चंद्र राहु युति - ग्रहण योग',
        'Chandra Ketu Conjunction - Grahan Yoga': 'चंद्र केतु युति - ग्रहण योग',
        'Kemadruma Yoga': 'केमद्रुम योग',
        'Moon in 6th House': 'छठे भाव में चंद्र',
        'Moon in 8th House': 'आठवें भाव में चंद्र',
        'Moon in 12th House': 'बारहवें भाव में चंद्र',
        'Moon in Scorpio (Debilitation)': 'वृश्चिक में चंद्र (नीच)',
        'Anger management': 'क्रोध प्रबंधन',
        'Cool foods and drinks': 'ठंडा भोजन और पेय',
        'Avoid spicy food': 'मसालेदार भोजन से बचें',
        'Saturn remedies': 'शनि के उपाय',
        'Serve elderly': 'बुजुर्गों की सेवा करें',
        'Hanuman worship': 'हनुमान जी की पूजा',
        'Rahu remedies critical': 'राहु के उपाय अनिवार्य',
        'Durga worship': 'दुर्गा आराधना',
        'Avoid addictive substances': 'नशीले पदार्थों से बचें',
        'Meditation essential': 'ध्यान अत्यंत आवश्यक',
        'Ganesha worship': 'गणेश पूजा',
        'Daily Chandra mantra 108 times': 'दैनिक चंद्र मंत्र 108 बार',
        'Donate white items Mondays': 'सोमवार को सफेद वस्तुओं का दान',
        'Professional counseling': 'पेशेवर परामर्श',
        'Yoga and meditation': 'योग और ध्यान',
        'Digestive care': 'पाचन का ध्यान रखें',
        'Professional therapy ESSENTIAL': 'पेशेवर थेरेपी अत्यंत आवश्यक',
        'Professional therapy MANDATORY': 'पेशेवर थेरेपी अनिवार्य',
        'Pearl gemstone essential': 'मोती रत्न अनिवार्य',
        'Pearl gemstone ESSENTIAL': 'मोती रत्न अत्यंत आवश्यक',
        'Daily Chandra mantra': 'दैनिक चंद्र मंत्र',
        'Donate milk Mondays': 'सोमवार को दूध का दान',
        'Avoid toxic relationships': 'विषाक्त संबंधों से बचें',
        'Professional mental health support ESSENTIAL': 'पेशेवर मानसिक स्वास्थ्य सहायता अत्यंत आवश्यक',
        'Stress management techniques': 'तनाव प्रबंधन तकनीक',
        'Regular health checkups': 'नियमित स्वास्थ्य जांच',
        'Sleep hygiene': 'नींद की स्वच्छता',
        'Service to hospitalized': 'अस्पताल में सेवा',
        'Avoid isolation': 'अकेलेपन से बचें',
        'By Ashish Chaurasia': 'आशीष चौरसिया द्वारा',
        'Created by Ashish Chaurasia': 'आशीष चौरसिया द्वारा निर्मित',
        'Emotionally sensitive, imaginative, beautiful appearance, mood swings.': 'भावनात्मक रूप से संवेदनशील, कल्पनाशील, सुंदर रूप, मनोदशा परिवर्तन।',
        'Mature, disciplined, slow start, serious approach to life.': 'परिपक्व, अनुशासित, धीमी शुरुआत, जीवन के प्रति गंभीर दृष्टिकोण।',
        'Great wealth, family happiness, wise and truthful speech.': 'महान धन, पारिवारिक सुख, बुद्धिमान और सत्यवादी वाणी।',
        'Quick mind, impulsive decisions, healing abilities, pioneering spirit': 'तेज़ मन, जल्दबाज़ी में निर्णय, उपचार क्षमताएं, अग्रणी भावना',
        'Strong-willed, transformative, intense emotions, creative power': 'दृढ़ इच्छाशक्ति, परिवर्तनकारी, तीव्र भावनाएं, रचनात्मक शक्ति',
        'Sharp intellect, critical thinking, purifying nature, direct communication': 'तीक्ष्ण बुद्धि, आलोचनात्मक सोच, शुद्ध करने वाला स्वभाव, सीधा संवाद',
        'Beautiful mind, artistic, sensual, emotional depth, attachment': 'सुंदर मन, कलात्मक, कामुक, भावनात्मक गहराई, लगाव',
        'Searching mind, curious, gentle yet restless, seeks knowledge': 'खोजने वाला मन, जिज्ञासु, सौम्य फिर भी अशांत, ज्ञान की तलाश',
        'Stormy emotions, intense mind, transformative, sharp intelligence': 'तूफानी भावनाएं, तीव्र मन, परिवर्तनकारी, तीक्ष्ण बुद्धि',
        'Optimistic, returning to happiness, nurturing, philosophical': 'आशावादी, प्रसन्नता की ओर वापसी, पालन-पोषण करने वाला, दार्शनिक',
        'Nourishing mind, spiritual, disciplined, supportive nature': 'पोषण देने वाला मन, आध्यात्मिक, अनुशासित, सहायक स्वभाव',
        'Mysterious mind, psychological insight, manipulative potential, secretive': 'रहस्यमयी मन, मनोवैज्ञानिक अंतर्दृष्टि, जोड़-तोड़ करने की क्षमता, गुप्त',
        'Royal mind, ancestral pride, authoritative, connected to lineage and tradition': 'शाही मन, पैतृक गौरव, आधिकारिक, वंश और परंपरा से जुड़ा',
        'Pleasure-seeking mind, creative, artistic, romantic nature, luxury-loving': 'सुख चाहने वाला मन, रचनात्मक, कलात्मक, रोमांटिक स्वभाव, विलासिता प्रेमी',
        'Helpful mind, service-oriented, stable relationships, supportive nature': 'सहायक मन, सेवा-उन्मुख, स्थिर संबंध, सहायक स्वभाव',
        'Skilled mind, dexterous, clever with hands, detail-oriented, intelligent': 'कुशल मन, निपुण, हाथों से चतुर, विवरण-उन्मुख, बुद्धिमान',
        'Artistic architect mind, visionary, desires beauty, creative intelligence': 'कलात्मक वास्तुकार मन, दूरदर्शी, सुंदरता की इच्छा, रचनात्मक बुद्धि',
        'Independent mind, freedom-loving, flexible like wind, adaptable nature': 'स्वतंत्र मन, स्वतंत्रता प्रेमी, हवा की तरह लचीला, अनुकूलनशील स्वभाव',
        'Goal-oriented mind, ambitious, determined, transformative focus': 'लक्ष्य-उन्मुख मन, महत्वाकांक्षी, दृढ़, परिवर्तनकारी फोकस',
        'Devotional mind, loyal, disciplined, capable of deep friendships': 'भक्तिपूर्ण मन, वफादार, अनुशासित, गहरी दोस्ती में सक्षम',
        'Chief mind, protective, authoritative, intense intelligence, strategic': 'प्रमुख मन, सुरक्षात्मक, आधिकारिक, तीव्र बुद्धि, रणनीतिक',
        'Root-seeking mind, philosophical, investigates origins, transformative nature': 'जड़ खोजने वाला मन, दार्शनिक, उत्पत्ति की जांच करने वाला, परिवर्तनकारी स्वभाव',
        'Invincible mind, optimistic, confident, victorious nature, philosophical': 'अजेय मन, आशावादी, आत्मविश्वासी, विजयी स्वभाव, दार्शनिक',
        'Permanent victory mind, ethical, responsible, leadership qualities': 'स्थायी विजय मन, नैतिक, जिम्मेदार, नेतृत्व गुण',
        'Listening mind, learning-oriented, wise, seeks knowledge through hearing': 'सुनने वाला मन, सीखने के प्रति उन्मुख, बुद्धिमान, सुनकर ज्ञान प्राप्त करने वाला',
        'Wealthy mind, musical, rhythmic, resourceful, ambitious': 'धनी मन, संगीतमय, लयबद्ध, साधन संपन्न, महत्वाकांक्षी',
        'Healing mind, secretive, mystical, hundred physicians, transformative healer': 'उपचारक मन, गुप्त, रहस्यमयी, सौ चिकित्सक, परिवर्तनकारी उपचारक',
        'Dual nature mind, intense, spiritual seeking, transformative idealism': 'दोहरी प्रकृति का मन, तीव्र, आध्यात्मिक खोज, परिवर्तनकारी आदर्शवाद',
        'Deep wisdom mind, patient, spiritual depth, stable mystic nature': 'गहरी बुद्धि वाला मन, धैर्यवान, आध्यात्मिक गहराई, स्थिर रहस्यवादी स्वभाव',
        'Compassionate emotions, nurturing feelings, protective nature': 'दयालु भावनाएं, पोषण करने वाली भावनाएं, सुरक्षात्मक स्वभाव',
        'Mental isolation and emotional loneliness': 'मानसिक अलगाव और भावनात्मक अकेलापन',
        'Affects mental and emotional balance': 'मानसिक और भावनात्मक संतुलन को प्रभावित करता है',
        'Moon strengthening practices': 'चंद्र को बल देने वाले अभ्यास',
        'This house placement influences your emotional and mental nature.': 'यह भाव स्थिति आपकी भावनात्मक और मानसिक प्रकृति को प्रभावित करती है।',
        'Expert Recommendation:': 'विशेषज्ञ सिफारिश:',
        'Your Moon is relatively free from major afflictions. This is an excellent blessing for mental and emotional health. Continue with regular Moon strengthening practices to maintain this balance.': 'आपका चंद्र प्रमुख पीड़ाओं से अपेक्षाकृत मुक्त है। यह मानसिक और भावनात्मक स्वास्थ्य के लिए एक उत्कृष्ट आशीर्वाद है। इस संतुलन को बनाए रखने के लिए नियमित चंद्र बल वर्धन अभ्यास जारी रखें।',
        'Focus on enhancing your already strong Moon through meditation, service to mother, and maintaining emotional balance.': 'ध्यान, माता की सेवा और भावनात्मक संतुलन बनाए रखने के माध्यम से अपने पहले से ही मजबूत चंद्र को बढ़ाने पर ध्यान दें।',

        /* ── Footer ── */
        '© 2026 AstroPsycho. Ancient Wisdom for Modern Minds.': '© 2026 ज्योतिष मनोविज्ञान। आधुनिक मन के लिए प्राचीन ज्ञान।',
        'Ancient Wisdom for Modern Minds.': 'आधुनिक मन के लिए प्राचीन ज्ञान।',
        'Consult professional astrologers for personalized guidance.': 'व्यक्तिगत मार्गदर्शन के लिए पेशेवर ज्योतिषियों से परामर्श करें।',
    };

    /* ─────────────────────────────────────────────
       2. STATE
    ───────────────────────────────────────────── */
    const STORAGE_KEY = 'astropsycho_lang';
    let isHindi = false;
    const originalTexts = new Map(); // node → original text
    let mutationObserver = null;

    /* ─────────────────────────────────────────────
       3. TRANSLATION ENGINE
    ───────────────────────────────────────────── */
    // Pre-sort keys by length (longest first) for greedy matching
    const sortedKeys = Object.keys(HINDI).sort((a, b) => b.length - a.length);

    function translateText(text) {
        let result = text;
        for (const key of sortedKeys) {
            if (!result.includes(key)) continue;

            // Build a regex that matches the key only at word boundaries
            // We use a lookahead/lookbehind approach:
            // - Before the key: must be start-of-string, space, or punctuation (not a letter/digit)
            // - After the key: must be end-of-string, space, or punctuation (not a letter/digit)
            try {
                // Escape special regex characters in the key
                const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Word boundary: not preceded/followed by a letter or digit
                const pattern = new RegExp(
                    '(?<![\\p{L}\\p{N}])' + escaped + '(?![\\p{L}\\p{N}])',
                    'gu'
                );
                const replaced = result.replace(pattern, HINDI[key]);
                result = replaced;
            } catch (e) {
                // Fallback: simple split/join for environments without Unicode property escapes
                result = result.split(key).join(HINDI[key]);
            }
        }
        return result;
    }

    function translateNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (!parent) return;
            const tag = parent.tagName;
            if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(tag)) return;
            // Skip the toggle button itself
            if (parent.id === 'hindiToggleBtn' || parent.closest('#hindiToggleBtn') || parent.closest('#hindiSlideOverlay')) return;

            const original = node.textContent;
            const trimmed = original.trim();
            if (!trimmed) return;

            const translated = translateText(original);
            if (translated !== original) {
                if (!originalTexts.has(node)) originalTexts.set(node, original);
                node.textContent = translated;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Skip button and overlay
            if (node.id === 'hindiToggleBtn' || node.id === 'hindiSlideOverlay') return;

            // Translate placeholder attributes
            if (node.placeholder) {
                const translated = translateText(node.placeholder);
                if (translated !== node.placeholder) {
                    const stored = originalTexts.get(node) || {};
                    if (!stored.placeholder) stored.placeholder = node.placeholder;
                    originalTexts.set(node, stored);
                    node.placeholder = translated;
                }
            }
            // Translate title attributes
            if (node.title && node.id !== 'hindiToggleBtn') {
                const translated = translateText(node.title);
                if (translated !== node.title) {
                    const stored = originalTexts.get(node) || {};
                    if (!stored.title) stored.title = node.title;
                    originalTexts.set(node, stored);
                    node.title = translated;
                }
            }
            for (const child of node.childNodes) {
                translateNode(child);
            }
        }
    }

    function restoreNode(node) {
        if (originalTexts.has(node)) {
            const orig = originalTexts.get(node);
            if (typeof orig === 'string') {
                node.textContent = orig;
            } else {
                if (orig.placeholder !== undefined) node.placeholder = orig.placeholder;
                if (orig.title !== undefined) node.title = orig.title;
            }
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            for (const child of node.childNodes) {
                restoreNode(child);
            }
        }
    }

    function applyTranslation() {
        translateNode(document.body);
        // Also update document title
        const titleEl = document.querySelector('title');
        if (titleEl) {
            const orig = titleEl.textContent;
            const translated = translateText(orig);
            if (translated !== orig) {
                if (!originalTexts.has(titleEl)) originalTexts.set(titleEl, orig);
                titleEl.textContent = translated;
            }
        }
        // Add body class so CSS can react to Hindi mode (e.g. en-text/hi-text toggling)
        document.body.classList.add('hindi-mode');
    }

    function restoreTranslation() {
        for (const [node, orig] of originalTexts.entries()) {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = orig;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (typeof orig === 'string') {
                    node.textContent = orig;
                } else {
                    if (orig.placeholder !== undefined) node.placeholder = orig.placeholder;
                    if (orig.title !== undefined) node.title = orig.title;
                }
            }
        }
        originalTexts.clear();
        // Remove body class when restoring to English
        document.body.classList.remove('hindi-mode');
    }

    /* ─────────────────────────────────────────────
       4. MUTATION OBSERVER — catches dynamic content
    ───────────────────────────────────────────── */
    function startObserver() {
        if (mutationObserver) return;
        mutationObserver = new MutationObserver((mutations) => {
            if (!isHindi) return;
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.id === 'hindiToggleBtn' || node.id === 'hindiSlideOverlay') continue;
                    translateNode(node);
                }
                // Also handle text changes in existing nodes
                if (mutation.type === 'characterData') {
                    if (mutation.target.parentElement &&
                        !mutation.target.parentElement.closest('#hindiToggleBtn') &&
                        !mutation.target.parentElement.closest('#hindiSlideOverlay')) {
                        translateNode(mutation.target);
                    }
                }
            }
        });
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: false
        });
    }

    function stopObserver() {
        if (mutationObserver) {
            mutationObserver.disconnect();
            mutationObserver = null;
        }
    }

    /* ─────────────────────────────────────────────
       5. BUTTON & OVERLAY INJECTION
    ───────────────────────────────────────────── */
    function injectButton() {
        // Button
        const btn = document.createElement('button');
        btn.innerHTML = `<span class="hindi-btn-icon">\uD83C\uDDEE\uD83C\uDDF3</span><span class="hindi-btn-label">हिंदी</span>`;
        btn.setAttribute('aria-label', 'Toggle Hindi Language');
        btn.setAttribute('title', 'हिंदी / English');

        // Force compact pill layout inline — prevents any CSS from making it a tall strip
        Object.assign(btn.style, {
            display: 'inline-flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            width: 'max-content',
            height: 'max-content',
            maxHeight: '40px', /* Prevent vertical stretching */
            whiteSpace: 'nowrap',
            padding: '0.4rem 0.85rem',
            lineHeight: '1',
            alignSelf: 'center' /* If in a flex column, this stops stretching */
        });

        document.body.appendChild(btn);

        // Slide overlay (covers page during transition)
        const overlay = document.createElement('div');
        overlay.id = 'hindiSlideOverlay';
        overlay.innerHTML = `<div class="hindi-overlay-text">
            <div class="hindi-overlay-icon">\uD83D\uDD49\uFE0F</div>
            <div class="hindi-overlay-msg" id="hindiOverlayMsg">हिंदी में अनुवाद हो रहा है...</div>
        </div>`;
        document.body.appendChild(overlay);

        btn.addEventListener('click', handleToggle);
    }

    function handleToggle() {
        const btn = document.getElementById('hindiToggleBtn');
        const overlay = document.getElementById('hindiSlideOverlay');
        const msg = document.getElementById('hindiOverlayMsg');

        // Slide overlay in
        overlay.classList.add('active');
        btn.classList.add('active');

        if (!isHindi) {
            msg.textContent = '\u0939\u093F\u0902\u0926\u0940 \u0921\u0947\u0902 \u0905\u0928\u0941\u0935\u093E\u0926 \u0939\u094B \u0930\u0939\u093E \u0939\u0948... \uD83D\uDD49\uFE0F';
        } else {
            msg.textContent = 'Switching back to English... \uD83C\uDF1F';
        }


        setTimeout(() => {
            if (!isHindi) {
                applyTranslation();
                startObserver();
                setButtonHindi(btn);
                localStorage.setItem(STORAGE_KEY, 'hi'); // 💾 persist
                isHindi = true;
            } else {
                stopObserver();
                restoreTranslation();
                setButtonEnglish(btn);
                localStorage.setItem(STORAGE_KEY, 'en'); // 💾 persist
                isHindi = false;
            }

            // Slide overlay out
            overlay.classList.add('slide-out');
            setTimeout(() => {
                overlay.classList.remove('active', 'slide-out');
                btn.classList.remove('active');
            }, 500);
        }, 600);
    }

    function setButtonHindi(btn) {
        btn.innerHTML = `<span class="hindi-btn-icon">\uD83C\uDF10</span><span class="hindi-btn-label">English</span>`;
        btn.setAttribute('title', 'Switch to English');
    }

    function setButtonEnglish(btn) {
        btn.innerHTML = `<span class="hindi-btn-icon">🇮🇳</span><span class="hindi-btn-label">हिंदी</span>`;
        btn.setAttribute('title', 'हिंदी / English');
    }

    /* ─────────────────────────────────────────────
       6. INIT
    ───────────────────────────────────────────── */
    function init() {
        injectButton();

        // Auto-apply Hindi if user previously selected it
        if (localStorage.getItem(STORAGE_KEY) === 'hi') {
            const btn = document.getElementById('hindiToggleBtn');
            // Wait for dynamic JS content to render first, then translate
            setTimeout(() => {
                applyTranslation();
                startObserver();
                setButtonHindi(btn);
                isHindi = true;
            }, 800);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
