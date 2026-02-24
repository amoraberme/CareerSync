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

        const promptPart = {
            text: `
      You are an expert career consultant and technical recruiter. 
      Analyze the following candidate's resume against the provided job description.
      
      Job Title: ${jobTitle}
      Industry: ${industry}
      Job Description: ${description}
      
      Return a strict JSON object containing EXACTLY these keys:
      - matchScore (number 1-100)
      - summary (short paragraph explaining the score)
      - matchedProfile (array of objects, each with 'skill' and 'description' strings)
      - gapAnalysis (array of objects, each with 'missingSkill' and 'description' strings)
      - coverLetter (generated text pivoting the candidate's background to fit the role, 3 paragraphs)
      - optimization (an object with three arrays of strings: 'strategicAdvice', 'structuralEdits' (which is an array of objects showing 'before' and 'after'), and 'atsKeywords')
      
      Do not include any extra fields or text.
    `};

        const parts = [promptPart];

        if (resumeData && resumeData.mimeType === 'application/pdf') {
            parts.push({
                inlineData: {
                    data: resumeData.data,
                    mimeType: resumeData.mimeType
                }
            });
        } else if (resumeData && resumeData.mimeType.startsWith('text/')) {
            const decodedText = Buffer.from(resumeData.data, 'base64').toString('utf-8');
            parts[0].text += `\n\nResume Context (Extracted Text):\n${decodedText}`;
        } else if (resumeData) {
            parts[0].text += `\n\nResume Context: The user uploaded a file named ${resumeData.name}, but its contents could not be extracted. Use standard inferences based on the job requirements.`;
        } else {
            parts[0].text += `\n\nResume Context: ${resumeText || "Senior Frontend Developer, 5 years Experience. React, Tailwind, GSAP. No WebGL."}`;
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
