import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'No text provided for parsing.' });
        }

        const apiKeys = [process.env.GEMINI_API_KEY, 'AIzaSyD1fkQkgw76nEnaEOA3Iqp6fz6wNjFLkc8'].filter(Boolean);

        if (apiKeys.length === 0) {
            return res.status(500).json({ error: 'No GEMINI_API_KEY configured.' });
        }

        const generatePrompt = `
        You are a highly analytical technical recruiter. Given the following unstructured text, extract the exact data into strict JSON format.
        
        Input text:
        ${text}

        You MUST respond ONLY with a raw JSON object matching this exact schema:
        {
          "jobTitle": "Extracted Job Title (Keep it standard, e.g., Senior Software Engineer)",
          "industry": "Extracted Industry or Company Name",
          "experienceLevel": "Entry / Mid / Senior / Lead",
          "requiredSkills": ["Skill 1", "Skill 2"],
          "cleanDescription": "A concise, grammatically clean 3-4 sentence paragraph summarizing the core responsibilities of this role."
        }`;

        let result = null;
        let lastError = null;

        // Round-Robin Retry Loop
        for (let i = 0; i < apiKeys.length; i++) {
            try {
                const genAI = new GoogleGenerativeAI(apiKeys[i]);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

                result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: generatePrompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                });

                break; // Success, exit retry loop
            } catch (error) {
                lastError = error;
                console.warn(`[Load Balancer Parse] Key at index ${i} failed. Attempting fallback...`);
            }
        }

        if (!result) {
            throw lastError || new Error("All API keys for extraction were exhausted or rate limited.");
        }

        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);

        return res.status(200).json(parsedData);
    } catch (error) {
        console.error("AI Parse Error:", error);
        return res.status(500).json({ error: error.message || 'Failed to process parse request' });
    }
}
