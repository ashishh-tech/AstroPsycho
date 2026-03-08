const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const AI_MODEL = 'gpt-4o-mini';
const EMBED_MODEL = 'text-embedding-3-small';
const DB_FILE = path.join(__dirname, '../local-vector-db.json');

// Helper Function: Cosine Similarity Math
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

router.post('/', async (req, res) => {
    try {
        const { messages, userContext } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is required.' });
        }

        const latestQuestion = messages[messages.length - 1].content;

        // 1. RETRIEVAL (Custom Lightweight JSON RAG)
        let retrievedContext = "No specific ancient texts found for this query in the local database.";
        let sources = [];

        try {
            if (fs.existsSync(DB_FILE)) {
                console.log(`Searching knowledge base for: "${latestQuestion}"`);
                const dbCards = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

                // Embed the user's question
                const questionEmbeddingResp = await openai.embeddings.create({
                    model: EMBED_MODEL,
                    input: latestQuestion
                });
                const questionVector = questionEmbeddingResp.data[0].embedding;

                // Score all cards in the DB using Cosine Similarity
                const scoredCards = dbCards.map(card => {
                    return {
                        ...card,
                        score: cosineSimilarity(questionVector, card.embedding)
                    };
                });

                // Sort by highest score (closest match)
                scoredCards.sort((a, b) => b.score - a.score);

                // Take top 2 best matches (assuming they reach a reasonable threshold like > 0.4)
                const topMatches = scoredCards.slice(0, 2).filter(c => c.score > 0.4);

                if (topMatches.length > 0) {
                    retrievedContext = topMatches.map(c => `[Source Database: ${c.source}]\n${c.text}`).join("\n\n============\n\n");
                    sources = topMatches.map(c => c.source);
                    console.log(`Found relevant contexts: ${sources.join(', ')}`);
                }
            } else {
                console.log("Vector DB Note: local-vector-db.json not found. Run ingest script first.");
            }
        } catch (dbError) {
            console.log("Vector DB Error:", dbError.message);
        }

        // 2. GENERATION
        let chartDataStr = "No birth chart provided.";
        if (userContext && userContext.birthDetails) {
            const bd = userContext.birthDetails;
            chartDataStr = `User: ${bd.fullName}. Born: ${bd.dateOfBirth} at ${bd.timeOfBirth}, in ${bd.birthPlace}.`;
        }

        const systemPrompt = `You are a Master Vedic Astrologer named AstroPsycho AI. 
You provide deeply psychological, compassionate, and highly accurate astrological readings.

--- CURRENT USER CHART CONTEXT ---
${chartDataStr}

--- LOCAL KNOWLEDGE BASE CONTEXT ---
${retrievedContext}

--- INSTRUCTIONS ---
1. You MUST answer the user's question using the LOCAL KNOWLEDGE BASE CONTEXT provided above if it is relevant.
2. If the user asks about a specific planet (e.g., Saturn) or House, and a provided context block is about a completely different planet (e.g., Sun/Mercury), IGNORE that specific context block. Do not give the user information about the wrong planet.
3. If the knowledge base context is relevant, weave its psychological insights, classical references, and remedies into your response naturally.
4. If no relevant context is found in the knowledge base, answer using your general elite astrological knowledge.
5. Respond in clear Markdown format. Keep the tone profound, respectful, and highly psychological.`;

        const openaiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        // 3. Call Paid API Model
        try {
            const response = await openai.chat.completions.create({
                model: AI_MODEL,
                messages: openaiMessages,
            });

            res.json({
                role: 'assistant',
                content: response.choices[0].message.content,
                sources: [...new Set(sources)]
            });

        } catch (openaiError) {
            console.error("OpenAI Connection Error:", openaiError);
            return res.status(503).json({
                error: 'Could not connect to OpenAI API.',
                details: 'Ensure your OPENAI_API_KEY is valid.'
            });
        }

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'An internal server error occurred processing your chat.' });
    }
});

module.exports = router;
