const { CohereClientV2 } = require("cohere-ai");
const env = require("../config/env");

const cohere = new CohereClientV2({ token: env.cohereApiKey })

const modelName = "command-a-03-2025";

const getResponseLanguage = (language) => {
    return language === "ru" ? "Russian" : "English";
};

const normalizeText = (value) => {
    return String(value || "").toLowerCase().trim();
};

const getBookTitle = (book) => {
    if (typeof book === "string") return book;
    return book?.title || "";
};

const getBookLabel = (book) => {
    if (typeof book === "string") return book;
    if (!book?.title) return "";

    return book.author ? `${book.title} by ${book.author}` : book.title;
};

const generateSingleBook = async (req, res) => {
    try {
        const {
            interests = [],
            mood = [],
            similarBooks = [],
            excluded = [],
            language
        } = req.body;

        const responseLanguage = getResponseLanguage(language);
        const queryParts = [];
        const similarBooksList = similarBooks.map(getBookLabel).filter(Boolean).join(", ");
        if (similarBooksList) queryParts.push(`Similar to: ${similarBooksList}`);
        if (interests.length) queryParts.push(`Interests: ${interests.join(", ")}`);
        if (mood.length) queryParts.push(`Mood: ${mood.join(", ")}`);
        const excludedList = [...similarBooks, ...excluded]
            .map(getBookLabel)
            .filter(Boolean)
            .slice(0, 50)
            .join(", ");

        const prompt = `
            You are a niche book scout.
            Rules:
            - Recommend only real, published books by real authors.
            - Do not invent, translate, paraphrase, or alter book titles or author names.
            - If you are not sure that a book exists, do not include it.
            - Prefer well-known books with reliable bibliographic information.
            - Prefer modern books published from 2000 onward.
            - All books must have different authors.
            - Do not include excluded books.
            - Avoid all excluded titles exactly, even if they strongly match the criteria.
            - Generate the response in ${responseLanguage}.
            - Keep JSON keys exactly as shown below: "books", "title", "author", "rating".
            - Output ONLY valid JSON:
            {
            "books": [
                { "title": "string", "author": "string", "rating": "string" }
            ]
            }
            Return 6 unique books. Return fewer if needed to avoid uncertain or invented books.
            ${queryParts.length ? `Criteria: ${queryParts.join("; ")}` : "Any genre."}
            Excluded books:
            ${excludedList || "None"}
            `;

        const cohereStartedAt = Date.now();
        const response = await cohere.chat({
            model: modelName,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });
        console.log(`Cohere book generation took ${Date.now() - cohereStartedAt}ms`);

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

        const excludedTitles = new Set(
            [...similarBooks, ...excluded]
                .map(getBookTitle)
                .map(normalizeText)
                .filter(Boolean)
        );

        const seenBooks = new Set();
        const seenAuthors = new Set();
        const unique = data.books.filter(b => {
            if (!b?.title || !b?.author) return false;

            const title = normalizeText(b.title);
            const author = normalizeText(b.author);
            const key = `${title}::${author}`;

            if (excludedTitles.has(title)) return false;
            if (seenBooks.has(key)) return false;
            if (seenAuthors.has(author)) return false;

            seenBooks.add(key);
            seenAuthors.add(author);
            return true;
        });

        if (!unique.length) {
            return res.status(422).json({ error: "No unique books generated" });
        }

        const book = unique[Math.floor(Math.random() * unique.length)];

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
        const { title, author, language } = req.body;
        const responseLanguage = getResponseLanguage(language);

        const prompt = `Write a short 2–3 sentence description in ${responseLanguage} of the book "${title}" by ${author || "unknown author"}. Return only the plain text description, no JSON or explanations.`;

        const cohereStartedAt = Date.now();
        const response = await cohere.chat({
            model: modelName,
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 250,
        });
        console.log(`Cohere book description took ${Date.now() - cohereStartedAt}ms`);

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
