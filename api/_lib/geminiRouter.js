import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Rotational Flow Architecture (LLM Cascade Router)
 * Attempts the best model and falls back to alternatives if rate-limited (429) or failed.
 */
export async function callGeminiWithCascade(apiKey, { systemInstruction, contents, generationConfig }) {
    // Defined hierarchy of models
    const modelRotation = [
        'models/gemini-2.5-flash',
        'models/gemini-flash-latest',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
    ];

    let lastError = null;

    for (const modelName of modelRotation) {
        try {
            console.log(`[Router] Attempting AI call with: ${modelName}`);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction
            });

            const result = await model.generateContent({
                contents,
                generationConfig
            });

            const text = result.response.text();
            if (!text) throw new Error("Empty response from AI");

            return {
                text,
                modelUsed: modelName
            };
        } catch (error) {
            console.error(`[Router] Failure with ${modelName}:`, error.message);
            lastError = error;

            // If it's a 429 (Rate Limit) or 5xx, or if it's a 404 (Model Not Found) - which might happen if names change
            if (error.status === 429 || error.status === 404 || (error.status >= 500 && error.status < 600)) {
                console.log(`[Router] Cascading to next model due to status ${error.status}...`);
                continue;
            }

            // For other errors, we might stop or continue depending on preference.
            if (error.message.includes("API_KEY_INVALID") || error.status === 401) {
                throw error;
            }

            console.log("[Router] Unexpected error, attempting next model fallback...");
        }
    }

    throw lastError || new Error("All models in rotation failed.");
}

/**
 * Robustly extracts and parses JSON from AI responses. 
 * Handles cases where the AI wraps the JSON in markdown blocks or adds extra text.
 */
export function safeParseJSON(text) {
    if (!text) return null;

    // 1. Try direct parse first
    try {
        return JSON.parse(text);
    } catch (e) {
        // Continue to extraction logic
    }

    // 2. Try to find JSON block: ```json ... ``` or ``` ... ```
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonBlockRegex);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            // Continue
        }
    }

    // 3. Try to find the first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = text.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(potentialJson);
        } catch (e) {
            // Continue
        }
    }

    throw new Error("Failed to extract valid JSON from AI response.");
}
