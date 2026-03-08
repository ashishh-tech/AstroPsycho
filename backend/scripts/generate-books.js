const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(__dirname, '../../data/ai-knowledge-base');

const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const houses = [
    { num: 1, name: '1st House (Lagna/Ascendant)', themes: 'Personality, physical body, vitality, early life, sense of self, head/face.' },
    { num: 2, name: '2nd House (Dhana Bhava)', themes: 'Wealth, family lineage, speech, early education, food habits, face/throat.' },
    { num: 3, name: '3rd House (Sahaja Bhava)', themes: 'Courage, younger siblings, communication, short travels, efforts, shoulders/arms.' },
    { num: 4, name: '4th House (Matru Bhava)', themes: 'Mother, home, inner peace, real estate, vehicles, childhood, heart/chest.' },
    { num: 5, name: '5th House (Putra Bhava)', themes: 'Children, romance, creativity, speculative intelligence, past life karma (poorva punya), stomach.' },
    { num: 6, name: '6th House (Ari Bhava)', themes: 'Enemies, debts, diseases, daily routines, service, litigation, digestion/intestines.' },
    { num: 7, name: '7th House (Kalatra Bhava)', themes: 'Marriage, business partnerships, the public, spouse, open enemies, lower abdomen/kidneys.' },
    { num: 8, name: '8th House (Ayu Bhava)', themes: 'Longevity, sudden events, taxes, occult, transformation, chronic health issues, reproductive organs.' },
    { num: 9, name: '9th House (Bhagya Bhava)', themes: 'Luck, religion, higher education, father, gurus, long journeys, thighs/hips.' },
    { num: 10, name: '10th House (Karma Bhava)', themes: 'Career, public status, authority, fame, karma in this life, knees/joints.' },
    { num: 11, name: '11th House (Labha Bhava)', themes: 'Gains, large networks, elder siblings, fulfillment of desires, calves/ankles.' },
    { num: 12, name: '12th House (Vyaya Bhava)', themes: 'Losses, foreign lands, spirituality, isolation, bed pleasures, subconscious, feet.' }
];

const planetDetails = {
    'Sun': { essence: 'Soul, ego, father, authority, vitality, government.', remedy: 'Offer water to the rising sun, chant Gayatri Mantra.' },
    'Moon': { essence: 'Mind, emotions, mother, intuition, fluidity, public.', remedy: 'Meditate, offer water to Shiva, respect mother.' },
    'Mars': { essence: 'Energy, anger, siblings, land, courage, military.', remedy: 'Donate red items, respect brothers, chant Hanuman Chalisa.' },
    'Mercury': { essence: 'Intellect, speech, youth, business, fast-moving thoughts.', remedy: 'Worship Ganesha, feed green grass to cows, mindfulness.' },
    'Jupiter': { essence: 'Wisdom, wealth, husband (for women), gurus, expansion, fat.', remedy: 'Respect teachers, chant Vishnu Sahasranama, donate yellow items.' },
    'Venus': { essence: 'Love, wife (for men), luxury, arts, vehicles, reproduction.', remedy: 'Respect women, maintain cleanliness, chant Durga mantras.' },
    'Saturn': { essence: 'Karma, delays, restriction, focus, longevity, servants.', remedy: 'Help the elderly, discipline routines, feed black dogs.' },
    'Rahu': { essence: 'Illusion, obsession, foreigners, expansion, technology, outcasts.', remedy: 'Avoid gambling, worship Bhairava or Durga, feed street dogs.' },
    'Ketu': { essence: 'Detachment, moksha, sudden losses, spirituality, headless.', remedy: 'Donate blankets to ascetics, worship Ganesha, practice deep meditation.' }
};

function generateContent() {
    console.log("Generating 108 Astrological Context Blocks...");

    planets.forEach(planet => {
        // Create folder for planet if it doesn't exist
        const planetFolder = path.join(KNOWLEDGE_DIR, planet.toLowerCase());
        if (!fs.existsSync(planetFolder)) {
            fs.mkdirSync(planetFolder, { recursive: true });
        }

        houses.forEach(house => {
            const fileName = `${planet.toLowerCase()}_house_${house.num}.json`;
            const filePath = path.join(planetFolder, fileName);

            // Skip if it already exists (like saturn_house_1 which we wrote manually)
            if (fs.existsSync(filePath)) {
                return;
            }

            const jsonData = {
                topic: `${planet} in the ${house.name}`,
                tags: [planet, `${house.num} House`, "Astrology", "Planetary Placement"],
                expert_knowledge: `When ${planet} is placed in the ${house.name}, its fundamental energy (${planetDetails[planet].essence}) directly influences the themes of this house (${house.themes}). Psychologically, this planetary placement acts as a lens through which the native interacts with these areas of life. Because ${planet} represents ${planetDetails[planet].essence.split(',')[0].toLowerCase()}, its presence here ensures that the native's journey regarding ${house.themes.split(',')[0].toLowerCase()} will be heavily colored by this energy. This creates profound psychological patterns that dictate how they respond to associated rewards or challenges.`,
                classical_references: `Classical Vedic texts indicate that ${planet} in the ${house.num} house shapes the native's destiny specifically through the manifestation of ${planetDetails[planet].essence.split(',')[1].trim()} interacting with ${house.themes.split(',')[1].trim()}. If well-placed, it brings immense strength; if afflicted, it creates karmic obstacles requiring conscious awareness.`,
                psychological_remedy: `To harness this energy positively, the native must cultivate awareness around how ${planet} drives their actions in the realm of the ${house.num} house. Traditional remedy: ${planetDetails[planet].remedy}`
            };

            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4));
            console.log(`Created: ${fileName}`);
        });
    });

    console.log("✅ Successfully generated all 108 combinations!");
}

generateContent();
