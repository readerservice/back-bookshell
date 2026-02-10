const { CohereClientV2 } = require("cohere-ai");
const env = require("../config/env");

const cohere = new CohereClientV2({ token: env.cohereApiKey })

const modelName = "command-r7b-12-2024";

const generateSingleBook = async (req, res) => {
    try {
        const {
            interests = [],
            mood = [],
            similarBooks = [],
            excluded = []
        } = req.body;

        const queryParts = [];
        if (similarBooks.length) queryParts.push(`Similar to: ${similarBooks.join(", ")}`);
        if (interests.length) queryParts.push(`Interests: ${interests.join(", ")}`);
        if (mood.length) queryParts.push(`Mood: ${mood.join(", ")}`);

        const prompt = `
            You are a niche book scout.
            Rules:
            - Recommend only lesser-known / hidden-gem books (no bestsellers).
            - All books must have different authors.
            - Do not include excluded books.
            - Output ONLY valid JSON:
            {
            "books": [
                { "title": "string", "author": "string", "rating": "string" }
            ]
            }
            Return 8–12 unique books.
            ${queryParts.length ? `Criteria: ${queryParts.join("; ")}` : "Any genre."}
            Excluded:
            ${[...similarBooks, ...excluded].slice(0, 30).join(", ")}
            `;

        const response = await cohere.chat({
            model: modelName,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 800
        });

        const text = response.message.content[0].text.trim();

        let data;
        try {
            const cleaned = text
                .replace(/```json|```/g, '')
                .replace(/#.*$/gm, '')
                .trim();

            const match = cleaned.match(/\{[\s\S]*\}/);
            if (!match) {
                throw new Error('JSON not found');
            }

            data = JSON.parse(match[0])
        } catch (err) {
            console.error("Failed to parse Cohere JSON:", text);
            return res.status(422).json({ error: "Invalid JSON format from AI" });
        }

        if (!Array.isArray(data?.books)) {
            return res.status(422).json({ error: "Books array not found in AI response" });
        }

        const seen = new Set();
        const unique = data.books.filter(b => {
            if (!b?.title || !b?.author) return false;
            const key =
                b.title.toLowerCase().trim() + "::" +
                b.author.toLowerCase().trim();

            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        if (!unique.length) {
            return res.status(422).json({ error: "No unique books generated" });
        }

        const K = Math.min(6, unique.length);
        const book = unique[Math.floor(Math.random() * K)];

        res.json({
            book
        });

    } catch (error) {
        console.error("Cohere Error:", error);
        res.status(500).json({ error: "Failed to generate book" });
    }
};

const getBookDescription = async (req, res) => {
    try {
        const { title, author } = req.body;

        const prompt = `Write a short 2–3 sentence description of the book "${title}" by ${author || "unknown author"}. Return only the plain text description, no JSON or explanations.`;

        const response = await cohere.chat({
            model: modelName,
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 150,
        });

        const description = response.message.content[0].text.trim();

        res.json({ description });
    } catch (error) {
        console.error("Cohere error:", error);
        res.status(500).json({
            error: "Failed to get book description",
            details: error.message || error,
        });
    }
};

module.exports = { generateSingleBook, getBookDescription };