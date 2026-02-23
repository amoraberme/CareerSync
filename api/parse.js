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

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
      Extract the following details from this job listing and return it strictly as a JSON object with these exact keys:
      - jobTitle (string)
      - industry (string)
      - experienceLevel (string)
      - requiredSkills (array of strings)
      - cleanDescription (string)

      Raw Listing Context:
      """
      ${text}
      """
      
      Respond ONLY with valid JSON. Do not use markdown blocks around the JSON.
    `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);

        return res.status(200).json(parsedData);
    } catch (error) {
        console.error("AI Parse Error:", error);
        return res.status(500).json({ error: 'Failed to process parse request' });
    }
}
