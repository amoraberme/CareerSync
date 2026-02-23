import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { jobTitle, industry, description, resumeText, resumeData } = req.body;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const promptPart = {
            text: `
      Act as an expert ATS and technical recruiter. Compare this Resume against this Job Description.
      
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

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const text = result.response.text();
        const parsedData = JSON.parse(text);

        return res.status(200).json(parsedData);
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return res.status(500).json({ error: 'Failed to process analysis' });
    }
}
