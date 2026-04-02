
HouseAnalysisEngine.prototype.getHouseKeyword = function(n) {
  var k = {
    1:'self and personal identity', 2:'wealth and family', 3:'courage and communication',
    4:'home and mother', 5:'intelligence and creativity', 6:'service and competition',
    7:'partnerships and marriage', 8:'transformation and hidden matters',
    9:'dharma and fortune', 10:'career and public status',
    11:'gains and social networks', 12:'spiritual liberation and foreign lands'
  };
  return k[n] || 'House '+n+' themes';
};

HouseAnalysisEngine.prototype.getSignPersonality = function(s) {
  var t = {
    'Aries':'bold, pioneering, and assertively direct',
    'Taurus':'steady, sensual, patient, and deeply rooted',
    'Gemini':'intellectually versatile, witty, and communicatively gifted',
    'Cancer':'emotionally deep, nurturing, and protectively loyal',
    'Leo':'warmly generous, creatively expressive, and naturally authoritative',
    'Virgo':'analytically precise, service-oriented, and discriminatingly intelligent',
    'Libra':'diplomatically balanced, aesthetically refined, and relationally skilled',
    'Scorpio':'intensely transformative, psychologically penetrating, and powerfully magnetic',
    'Sagittarius':'philosophically expansive, optimistically adventurous, and truth-seeking',
    'Capricorn':'disciplined, structurally ambitious, and patiently enduring',
    'Aquarius':'innovatively idealistic, collectively minded, and unconventionally wise',
    'Pisces':'spiritually sensitive, compassionately boundless, and artistically transcendent'
  };
  return t[s] || s + ' nature';
};

HouseAnalysisEngine.prototype.getSignElement = function(s) {
  if (['Aries','Leo','Sagittarius'].includes(s)) return 'Fire';
  if (['Taurus','Virgo','Capricorn'].includes(s)) return 'Earth';
  if (['Gemini','Libra','Aquarius'].includes(s)) return 'Air';
  return 'Water';
};

HouseAnalysisEngine.prototype.getSignBodyTrait = function(s) {
  var t = {
    'Aries':'a medium build with sharp features, reddish complexion, and active energy',
    'Taurus':'a sturdy, well-built physique, full features, and attractive eyes',
    'Gemini':'a tall, lean, quick-moving body with alert and expressive eyes',
    'Cancer':'a round, soft face with full cheeks and a body that fluctuates with the moon',
    'Leo':'a broad-shouldered, dignified, and commanding physical presence',
    'Virgo':'a neat, well-proportioned, and somewhat delicate physique',
    'Libra':'a graceful, well-balanced, and often quite attractive physique',
    'Scorpio':'a penetrating gaze, compact but intense physicality, and magnetic features',
    'Sagittarius':'a tall, athletic, and expansive build with an optimistic, open expression',
    'Capricorn':'a lean, angular physique that carries the weight of responsibility in its posture',
    'Aquarius':'an unusual, distinctive, and often tall physicality with memorable features',
    'Pisces':'a soft, fluid physicality with dreamy eyes and a gentle, yielding presence'
  };
  return t[s] || s + ' elemental physique';
};

HouseAnalysisEngine.prototype.getSignHealthTrait = function(s) {
  var t = {
    'Aries':'head, brain, and inflammatory conditions',
    'Taurus':'throat, neck, thyroid, and metabolic concerns',
    'Gemini':'lungs, respiratory system, nervous system, and shoulders',
    'Cancer':'stomach, digestive system, chest, and hormonal balance',
    'Leo':'heart, spine, and cardiovascular system',
    'Virgo':'intestines, digestion, nervous system, and anxiety-related conditions',
    'Libra':'kidneys, bladder, lower back, and hormonal balance',
    'Scorpio':'reproductive system, elimination organs, and deep-seated chronic conditions',
    'Sagittarius':'hips, thighs, liver, and sciatic nerve',
    'Capricorn':'knees, bones, joints, skin, and teeth',
    'Aquarius':'calves, ankles, circulation, and nervous system',
    'Pisces':'feet, lymphatic system, immune function, and psychosomatic conditions'
  };
  return t[s] || s + '-related areas';
};

HouseAnalysisEngine.prototype.getSignPartnerTrait = function(s) {
  var t = {
    'Aries':'a bold, independent, and assertively direct partner',
    'Taurus':'a stable, sensual, patient, and materially grounded partner',
    'Gemini':'an intellectually curious, communicative, and versatile partner',
    'Cancer':'a nurturing, emotionally deep, and home-oriented partner',
    'Leo':'a generous, proud, creatively expressive, and naturally authoritative partner',
    'Virgo':'an analytical, service-oriented, health-conscious, and precise partner',
    'Libra':'a diplomatic, aesthetically refined, and harmoniously social partner',
    'Scorpio':'an intensely loyal, psychologically penetrating, and transformatively powerful partner',
    'Sagittarius':'a philosophically adventurous, optimistic, and freedom-loving partner',
    'Capricorn':'a disciplined, ambitious, and structurally responsible partner',
    'Aquarius':'an intellectually innovative, idealistic, and unconventionally unique partner',
    'Pisces':'a spiritually sensitive, compassionately giving, and artistically creative partner'
  };
  return t[s] || s + '-type partner';
};

HouseAnalysisEngine.prototype.getSignCareerTrait = function(s) {
  var t = {
    'Aries':'engineering, military, sports, surgery, and competitive leadership',
    'Taurus':'banking, agriculture, luxury goods, real estate, and music',
    'Gemini':'communication, technology, media, teaching, and writing',
    'Cancer':'hospitality, healthcare, public service, and real estate',
    'Leo':'entertainment, politics, administration, and creative leadership',
    'Virgo':'medicine, accounting, data analysis, editing, and quality control',
    'Libra':'law, diplomacy, arts, luxury, design, and counseling',
    'Scorpio':'research, investigation, psychology, surgery, and intelligence work',
    'Sagittarius':'education, law, publishing, travel, and international business',
    'Capricorn':'administration, politics, engineering, banking, and institutional leadership',
    'Aquarius':'technology, social entrepreneurship, science, and innovation',
    'Pisces':'spirituality, healing, arts, marine industries, and metaphysical sciences'
  };
  return t[s] || s + '-aligned professions';
};

HouseAnalysisEngine.prototype.getSignFoodTrait = function(s) {
  var t = {
    'Aries':'spicy, hot, and quickly prepared foods — you eat fast and with great appetite',
    'Taurus':'rich, indulgent, and high-quality foods — dining is a sensual experience',
    'Gemini':'variety and snacking — eating is often secondary to mental activity',
    'Cancer':'comfort foods, dairy, and emotionally comforting home-cooked meals',
    'Leo':'generous, restaurant-quality dining — presentation and status matter',
    'Virgo':'health-conscious, carefully selected, and nutritionally aware eating',
    'Libra':'balanced, aesthetically plated, and socially enjoyable dining',
    'Scorpio':'intense flavors, fermented foods, and a private relationship with eating',
    'Sagittarius':'love for diverse, international, and adventurous cuisine',
    'Capricorn':'simple, practical, and traditional foods — nutrition over indulgence',
    'Aquarius':'unconventional diets and experimental foods',
    'Pisces':'seafood, liquid foods, and soft emotionally comforting textures'
  };
  return t[s] || s + '-flavored food habits';
};

HouseAnalysisEngine.prototype.getSignEmotionTrait = function(s) {
  var t = {
    'Aries':'passionate but quick-burning emotions — you feel intensely and move on fast',
    'Taurus':'deep, slow, and stubborn emotions — you process slowly but feel profoundly',
    'Gemini':'quick, intellectually-mediated emotions — you analyze feelings before fully experiencing them',
    'Cancer':'oceanic emotional depth — you feel everything and need safe emotional containers',
    'Leo':'warm, generous emotions that need expression and recognition',
    'Virgo':'analytical emotions — you critique your feelings before allowing yourself to fully feel them',
    'Libra':'balanced emotions that seek harmony — disharmony is genuinely physically uncomfortable',
    'Scorpio':'volcanic emotional depth — you feel everything intensely but share selectively',
    'Sagittarius':'optimistic, philosophical emotions — you find meaning in your feelings quickly',
    'Capricorn':'disciplined, sometimes suppressed emotions — your inner world is richer than you show',
    'Aquarius':'intellectually mediated emotions — you observe your feelings somewhat detachedly',
    'Pisces':'boundless, empathic emotions — you absorb the feelings of everyone around you'
  };
  return t[s] || s + '-flavored emotional landscape';
};

HouseAnalysisEngine.prototype.getSignFamilyTrait = function(s) {
  var t = {
    'Aries':'active, competitive, and independently spirited',
    'Taurus':'stable, materially comfortable, and tradition-oriented',
    'Gemini':'communicative, intellectually lively, and somewhat restless',
    'Cancer':'deeply nurturing, emotionally bonded, and home-centered',
    'Leo':'proud, generous, and status-conscious',
    'Virgo':'organized, health-conscious, and service-oriented',
    'Libra':'harmonious, aesthetically aware, and socially graceful',
    'Scorpio':'intense, private, and deeply loyal with strong undercurrents',
    'Sagittarius':'philosophically open, adventurous, and freedom-valuing',
    'Capricorn':'disciplined, achievement-oriented, and structured',
    'Aquarius':'unconventional, intellectually progressive, and idealistic',
    'Pisces':'emotionally sensitive, spiritually oriented, and creatively imaginative'
  };
  return t[s] || s + '-flavored';
};

HouseAnalysisEngine.prototype.getSignSpeechTrait = function(s) {
  var t = {
    'Aries':'direct, assertive, and sometimes blunt',
    'Taurus':'warm, melodious, and persuasively steady',
    'Gemini':'quick, witty, and intellectually engaging',
    'Cancer':'nurturing, emotionally resonant, and intuitively empathetic',
    'Leo':'commanding, proud, and naturally attention-holding',
    'Virgo':'precise, analytical, and carefully constructed',
    'Libra':'diplomatic, harmonious, and beautifully balanced',
    'Scorpio':'penetrating, intense, and psychologically impactful',
    'Sagittarius':'philosophical, enthusiastic, and expansively honest',
    'Capricorn':'measured, serious, and authoritatively reliable',
    'Aquarius':'innovative, progressive, and intellectually stimulating',
    'Pisces':'poetic, emotionally flowing, and spiritually suggestive'
  };
  return t[s] || s + '-flavored speech';
};

HouseAnalysisEngine.prototype.getSignRelationTrait = function(s) {
  var t = {
    'Aries':'competitive but energizing', 'Taurus':'steady and quietly supportive',
    'Gemini':'communicative and intellectually lively', 'Cancer':'emotionally deep and nurturing',
    'Leo':'warm, generous, and occasionally dramatic', 'Virgo':'practical and helpfully critical',
    'Libra':'harmonious and diplomatically balanced', 'Scorpio':'intense, loyal, and psychologically complex',
    'Sagittarius':'adventurous and philosophically expansive', 'Capricorn':'dutiful, formal, and achievement-focused',
    'Aquarius':'unusual, freedom-oriented, and stimulating', 'Pisces':'emotionally empathic and spiritually connected'
  };
  return t[s] || s + '-colored';
};
