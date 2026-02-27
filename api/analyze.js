import { callGeminiWithCascade, safeParseJSON } from './_lib/geminiRouter.js';
import { verifyAuth } from './_lib/authMiddleware.js';
import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_lib/corsHelper.js';

export default async function handler(req, res) {
    // W-8: CORS headers on every response including preflight
    if (applyCors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Verify Authentication
    const user = await verifyAuth(req, res);
    if (!user) return;

    try {
        const { jobTitle, industry, description, resumeText, resumeData } = req.body;

        // ═══ Daily Credit Gate ═══
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        let usageData = { type: 'base' };
        // Base: governed by credit balance (decrement_credits in store) — skip daily cap.
        // Standard: 40 analyses/day | Premium: 50 analyses/day — enforced here.
        if (supabaseUrl && serviceKey) {
            const supabaseAdmin = createClient(supabaseUrl, serviceKey);

            const { data: profile } = await supabaseAdmin
                .from('user_profiles')
                .select('tier, daily_credits_used, daily_credits_reset_at')
                .eq('id', user.id)
                .single();

            const tier = profile?.tier || 'base';

            if (tier !== 'base') {
                // C-2 FIX: consume_daily_credit is now FATAL — if it fails, block the analysis.
                // This prevents premium users from getting unlimited free analyses on RPC error.
                const { data: allowed, error: rpcError } = await supabaseAdmin
                    .rpc('consume_daily_credit', { p_user_id: user.id });

                if (rpcError) {
                    console.error('[Analyze] consume_daily_credit RPC error:', rpcError.message);
                    return res.status(500).json({ error: 'Credit system error. Please try again.' });
                }

                if (allowed === false) {
                    const cap = tier === 'premium' ? 50 : 40;
                    const resetAt = profile?.daily_credits_reset_at
                        ? new Date(new Date(profile.daily_credits_reset_at).getTime() + 24 * 60 * 60 * 1000)
                        : new Date(Date.now() + 24 * 60 * 60 * 1000);
                    return res.status(429).json({
                        error: `Daily limit reached. Your ${tier} plan includes ${cap} analyses per day.`,
                        daily_cap: cap,
                        resets_at: resetAt.toISOString(),
                    });
                }
                usageData = { type: 'daily', used: (profile.daily_credits_used || 0) + 1, cap: tier === 'premium' ? 50 : 40 };
            } else {
                usageData = { type: 'balance', remaining: profile?.current_credit_balance || 0 };
                // Ensure base user has at least 3 credits
                if ((profile?.current_credit_balance || 0) < 3) {
                    return res.status(402).json({ error: 'Insufficient credits. Deep Analysis costs 3 credits. Please top up.' });
                }
            }
        }
        // ═══ End Credit Gate ═══

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'No GEMINI_API_KEY configured.' });
        }

        // 2. Optimized Prompt (Apex-ATS v2.0) logic integrated with JSON requirement
        const systemPrompt = `You are 'Apex-ATS', an elite dual-engine AI combining the ruthless exactness of an enterprise ATS with the strategic positioning of a Fortune 500 Career Coach.

[Core Objective]
Analyze the provided Job Description (JD) and Resume. Execute a step-by-step Chain-of-Thought evaluation:
1. The ATS Parse: Extract mandatory hard skills, soft skills, and experience from JD. Map strictly against Resume (explicit text only, no hallucinations).
2. The Scoring Engine: Compute "Job Match Score (%)" strictly using this weighted rubric:
   - Mandatory Skills & Keywords Match (40%)
   - Experience Level & Scope Alignment (30%)
   - Preferred/Bonus Qualifications (20%)
   - Industry/Contextual Alignment (10%)
3. Fit Analysis: Isolate exactly where the resume filter will reject or accept based on friction/alignment.
4. Draft & Critique (Adversarial Validation): 
   - Draft a modern, zero-fluff cover letter tailored to JD.
   - Internal Red Team Critique: Review for generic filler or hallucinated experience.
   - Final Draft: Output only the refined result.

[Boundary Conditions]
- If match < 20%, recommend heavy upskilling.

[Output Rules]
You MUST respond ONLY with a raw JSON object matching this schema:
{
  "matchScore": number (1-100),
  "summary": "2-sentence breakdown of the rubric-based math behind the score.",
  "matchedProfile": [{"skill": "Skill Name", "description": "Why it's a match"}],
  "gapAnalysis": [{"missingSkill": "Skill Name", "description": "Impact of this gap"}],
  "coverLetter": "Final Draft letter text (concise, corporate, quantifiable)",
  "optimization": {
    "strategicAdvice": ["3-5 high-impact actionable items"],
    "structuralEdits": [{"before": "weak bullet", "after": "X-Y-Z formula bullet"}],
    "atsKeywords": ["List of critical keywords to inject"]
  }
}`;

        // 3. User content — strictly separated
        let userContent = `Job Title: ${jobTitle}\nIndustry: ${industry}\nJob Description: ${description}`;

        const parts = [{ text: userContent }];

        if (resumeData && resumeData.mimeType === 'application/pdf') {
            parts.push({
                inlineData: {
                    data: resumeData.data,
                    mimeType: resumeData.mimeType
                }
            });
        } else if (resumeData && resumeData.mimeType.startsWith('text/')) {
            const decodedText = Buffer.from(resumeData.data, 'base64').toString('utf-8');
            userContent += `\n\nResume Context (Extracted Text):\n${decodedText}`;
            parts[0].text = userContent;
        } else if (resumeData) {
            // N-1 FIX: generic instruction instead of leaking dev test string
            userContent += `\n\nResume Context: The user uploaded a file named ${resumeData.name}, but its contents could not be extracted. Provide a general analysis based on the job requirements only.`;
            parts[0].text = userContent;
        } else {
            // N-1 FIX: neutral fallback — no more internal test string
            userContent += `\n\nResume Context: ${resumeText || 'No resume provided. Provide a general-purpose analysis based on the job description only.'}`;
            parts[0].text = userContent;
        }

        // 4. Call Gemini with Cascade Router
        const { text, modelUsed } = await callGeminiWithCascade(apiKey, {
            systemInstruction: systemPrompt,
            contents: [{ role: "user", parts }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // Use safeParseJSON for robustness
        const parsedData = safeParseJSON(text);

        return res.status(200).json({
            ...parsedData,
            _routing: { model: modelUsed },
            _usage: usageData
        });
    } catch (error) {
        console.error("AI Analysis Error:", error);

        // Handle specific Gemini error types (like 429)
        if (error.status === 429) {
            return res.status(429).json({
                error: 'AI service is temporarily unavailable due to high demand (Rate Limit). Please try again in 1-2 minutes.',
                details: 'Gemini API 429: Too Many Requests'
            });
        }

        // Handle 404 or other statuses
        if (error.status) {
            return res.status(error.status).json({
                error: `AI service error (${error.status}). Please try again later.`,
                details: error.message
            });
        }

        return res.status(500).json({ error: 'Failed to process analysis' });
    }
}
