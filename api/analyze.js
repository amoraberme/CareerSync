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
      You are an expert career consultant and technical recruiter. 
      Analyze the following candidate's resume against the provided job description.
      
      Job Title: ${jobTitle}
      Industry: ${industry}
      Job Description: ${description}
      
      Provide a JSON response strictly adhering to this structure:
      {
        "score": 85,
        "scoreSummary": "Brief 1-line reason for score",
        "strategicSynthesis": "A 3-4 sentence synthesis explaining why they are a good fit and what they lack.",
        "verifiedStrengths": ["Strength 1", "Strength 2", "Strength 3"],
        "identifiedGaps": ["Gap 1", "Gap 2"],
        "coverLetter": "A professional, cinematic 3-paragraph cover letter.",
        "strategicShift": "1 sentence advice on how to reframe their title or profile.",
        "atsKeywords": ["Keyword1", "Keyword2"],
        "structuralEdits": [
          { "before": "Old bullet point", "after": "Cinematic rewritten bullet point" }
        ]
      }
      
      Respond ONLY with valid JSON. Do not use markdown blocks around the JSON.
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

        const result = await model.generateContent(parts);
        const text = result.response.text();

        // Clean up potential markdown formatting from Gemini response
        let cleanJson = text;
        if (text.startsWith('\`\`\`json')) {
            cleanJson = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
        } else if (text.startsWith('\`\`\`')) {
            cleanJson = text.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
        }

        const parsedData = JSON.parse(cleanJson);

        return res.status(200).json(parsedData);
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return res.status(500).json({ error: 'Failed to process analysis' });
    }
}
