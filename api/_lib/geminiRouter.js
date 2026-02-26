import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Rotational Flow Architecture (LLM Cascade Router)
 * Attempts the best model and falls back to alternatives if rate-limited (429) or failed.
 */
export async function callGeminiWithCascade(apiKey, { systemInstruction, contents, generationConfig }) {
    // Defined hierarchy of models
    const modelRotation = [
        'gemini-2.0-flash',
        'models/gemini-2.5-flash',
        'models/gemini-flash-latest'
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

            // If it's a 429 (Rate Limit) or 5xx, we cascade. 
            // 400 (Bad Request) or 401 (Unauthorized) might not benefit from rotation.
            if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
                console.log(`[Router] Cascading to next model due to status ${error.status}...`);
                continue;
            }

            // For other errors, we might stop or continue depending on preference.
            // Here we continue unless it's a fatal config error.
            if (error.message.includes("API_KEY_INVALID") || error.status === 401) {
                throw error;
            }

            console.log("[Router] Unknown error, attempting next model fallback...");
        }
    }

    throw lastError || new Error("All models in rotation failed.");
}
