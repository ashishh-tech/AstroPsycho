const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { OpenAI } = require('openai');

const KNOWLEDGE_DIR = path.join(__dirname, '../../data/ai-knowledge-base');
const DB_FILE = path.join(__dirname, '../local-vector-db.json');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const EMBED_MODEL = 'text-embedding-3-small';

async function ingestKnowledge() {
    console.log("🌟 Starting Astrological Knowledge Ingestion to Local DB...");

    try {
        const dbCards = [];

        // 1. Read all files recursively in the Knowledge Base
        const files = [];
        const processDirectory = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    processDirectory(fullPath);
                } else if (entry.isFile() && fullPath.endsWith('.json')) {
                    files.push(fullPath);
                }
            }
        };

        processDirectory(KNOWLEDGE_DIR);
        console.log(`Found ${files.length} knowledge text(s). Processing...`);

        // 2. Process each JSON file
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            let data;

            try {
                data = JSON.parse(content);
            } catch (err) {
                console.error(`Skipping ${file} - Invalid JSON`);
                continue;
            }

            const textToEmbed = `Topic: ${data.topic || 'Astrology'}\n` +
                `Tags: ${(data.tags || []).join(', ')}\n\n` +
                `Expert Knowledge:\n${data.expert_knowledge || ''}\n\n` +
                `Classical References:\n${data.classical_references || 'None'}\n\n` +
                `Remedies:\n${data.psychological_remedy || 'None'}`;

            const sourceName = path.basename(file);

            console.log(`Generating math embedding for: ${sourceName} using ${EMBED_MODEL}...`);

            const response = await openai.embeddings.create({
                model: EMBED_MODEL,
                input: textToEmbed
            });

            dbCards.push({
                source: sourceName,
                text: textToEmbed,
                embedding: response.data[0].embedding
            });

            console.log(`✅ Ingested ${sourceName}`);
        }

        // 3. Save to a simple local JSON file instead of Chroma
        fs.writeFileSync(DB_FILE, JSON.stringify(dbCards, null, 2));

        console.log("\n🎯 All Knowledge ingested successfully! Saved to local-vector-db.json.");

    } catch (error) {
        console.error("\n❌ Error during ingestion:", error.message);
        console.log("Did you set OPENAI_API_KEY in the .env file?");
    }
}

ingestKnowledge();
