const env = require("../config/env");

const modelName = "gpt-5-mini";

const getOpenAIText = (data) => {
    if (typeof data?.output_text === "string") return data.output_text;

    const output = Array.isArray(data?.output) ? data.output : [];
    for (const item of output) {
        const content = Array.isArray(item?.content) ? item.content : [];
        for (const part of content) {
            if (typeof part?.text === "string") return part.text;
        }
    }

    return "";
};

const getOpenAIHeaders = (headers) => ({
    requestId: headers.get("x-request-id"),
    organization: headers.get("openai-organization"),
    limitRequests: headers.get("x-ratelimit-limit-requests"),
    limitTokens: headers.get("x-ratelimit-limit-tokens"),
    remainingRequests: headers.get("x-ratelimit-remaining-requests"),
    remainingTokens: headers.get("x-ratelimit-remaining-tokens"),
    resetRequests: headers.get("x-ratelimit-reset-requests"),
    resetTokens: headers.get("x-ratelimit-reset-tokens")
});

const createOpenAIResponse = async ({ input, maxOutputTokens, text }) => {
    if (!env.openaiApiKey) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${env.openaiApiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: modelName,
            input,
            max_output_tokens: maxOutputTokens,
            reasoning: { effort: "minimal" },
            text
        })
    });

    const data = await response.json();
    const openAIHeaders = getOpenAIHeaders(response.headers);

    console.log("OpenAI response meta:", {
        status: response.status,
        ok: response.ok,
        model: modelName,
        headers: openAIHeaders
    });

    if (!response.ok) {
        const message = data?.error?.message || "OpenAI request failed";
        console.error("OpenAI response error:", {
            status: response.status,
            type: data?.error?.type,
            code: data?.error?.code,
            message,
            headers: openAIHeaders,
            error: data?.error
        });

        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        error.openAIHeaders = openAIHeaders;
        throw error;
    }

    return getOpenAIText(data).trim();
};

const getResponseLanguage = (language) => {
    return language === "ru" ? "Russian" : "English";
};

const getBookOutputLanguageRule = (language) => {
    if (language === "ru") {
        return "Find books in English first for accuracy. Then translate titles, authors into Russian. ONLY recommend books that have an official Russian translation.";
    }

    return "Return title and author in English or in the book's original commonly used English-market spelling.";
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
        const bookOutputLanguageRule = getBookOutputLanguageRule(language);
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
            - Do not invent, paraphrase, or alter book titles or author names.
            - ${bookOutputLanguageRule}
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
            Return 5 unique books. Return fewer if needed to avoid uncertain or invented books.
            ${queryParts.length ? `Criteria: ${queryParts.join("; ")}` : "Any genre."}
            Excluded books:
            ${excludedList || "None"}
            `;

        const openaiStartedAt = Date.now();
        const text = await createOpenAIResponse({
            input: prompt,
            maxOutputTokens: 350,
            text: {
                verbosity: "low",
                format: {
                    type: "json_schema",
                    name: "book_recommendations",
                    strict: true,
                    schema: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            books: {
                                type: "array",
                                items: {
                                    type: "object",
                                    additionalProperties: false,
                                    properties: {
                                        title: { type: "string" },
                                        author: { type: "string" },
                                        rating: { type: "string" }
                                    },
                                    required: ["title", "author", "rating"]
                                }
                            }
                        },
                        required: ["books"]
                    }
                }
            }
        });
        console.log(`OpenAI book generation took ${Date.now() - openaiStartedAt}ms`);

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
            console.error("Failed to parse OpenAI JSON:", text);
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
        console.error("OpenAI Error:", error.data || error);
        res.status(500).json({ error: "Failed to generate book" });
    }
};

const getBookDescription = async (req, res) => {
    try {
        const { title, author, language } = req.body;
        const responseLanguage = getResponseLanguage(language);

        const prompt = `Write a short 2–3 sentence description in ${responseLanguage} of the book "${title}" by ${author || "unknown author"}. Return only the plain text description, no JSON or explanations.`;

        const openaiStartedAt = Date.now();
        const description = await createOpenAIResponse({
            input: prompt,
            maxOutputTokens: 250,
            text: { verbosity: "low" }
        });
        console.log(`OpenAI book description took ${Date.now() - openaiStartedAt}ms`);

        res.json({ description });
    } catch (error) {
        console.error("OpenAI error:", error.data || error);
        res.status(500).json({
            error: "Failed to get book description",
            details: error.message || error,
        });
    }
};

module.exports = { generateSingleBook, getBookDescription };
