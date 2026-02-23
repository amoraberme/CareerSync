import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { jobTitle, industry, description, resumeText, resumeData } = req.body;

        const apiKeys = [process.env.GEMINI_API_KEY, 'AIzaSyD1fkQkgw76nEnaEOA3Iqp6fz6wNjFLkc8'].filter(Boolean);

        if (apiKeys.length === 0) {
            return res.status(500).json({ error: 'No GEMINI_API_KEY configured.' });
        }

        let result = null;
        let lastError = null;

        // Round-Robin Retry Loop
        for (let i = 0; i < apiKeys.length; i++) {
            try {
                const genAI = new GoogleGenerativeAI(apiKeys[i]);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

                result = await model.generateContent({
                    contents: [{ role: "user", parts }],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                });

                // If successful, break out of the retry loop
                break;
            } catch (error) {
                lastError = error;
                console.warn(`[Load Balancer] Key at index ${i} failed. Attempting fallback...`);
                // If it's the last key in the array, the loop will exit and we throw later
            }
        }

        if (!result) {
            throw lastError || new Error("All API keys exhausted or rate limited.");
        }

        const text = result.response.text();
        const parsedData = JSON.parse(text);

        return res.status(200).json(parsedData);
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return res.status(500).json({ error: 'Failed to process analysis' });
    }
}
