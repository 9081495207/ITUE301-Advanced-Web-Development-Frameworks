/**
 * Practical 13: AI API Integration
 * AI Route — POST /api/ai/generate-description
 *
 * Accepts a task title and returns an AI-generated description.
 * The OpenAI API key is stored server-side only in .env — never exposed to the frontend.
 *
 * Features:
 *  - Graceful degradation: if the AI call fails, returns a fallback message
 *  - Basic per-task rate limiting: max 1 request per title per 60 seconds
 *  - Input sanitisation: title length check before sending to AI
 */

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// ── Rate Limit Store (in-memory, keyed by title hash) ────────────────────────
const rateLimitStore = new Map(); // Map<titleKey, lastRequestTimestamp>
const RATE_LIMIT_MS = 60 * 1000;  // 60 seconds

function isRateLimited(titleKey) {
  const lastRequest = rateLimitStore.get(titleKey);
  if (!lastRequest) return false;
  return Date.now() - lastRequest < RATE_LIMIT_MS;
}

// ── POST /api/ai/generate-description ────────────────────────────────────────
router.post('/generate-description', async (req, res) => {
  const { title } = req.body;

  // 1. Input validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'A non-empty task title is required to generate a description.'
    });
  }

  const cleanTitle = title.trim().substring(0, 200); // cap length for safety
  const titleKey = cleanTitle.toLowerCase();

  // 2. Rate limiting — 1 AI request per unique title per 60 seconds
  if (isRateLimited(titleKey)) {
    const remaining = Math.ceil(
      (RATE_LIMIT_MS - (Date.now() - rateLimitStore.get(titleKey))) / 1000
    );
    return res.status(429).json({
      status: 429,
      error: 'Too Many Requests',
      message: `Rate limit: please wait ${remaining}s before generating another description for this task.`,
      fallback: true
    });
  }

  // 3. Check API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[AI Route] OPENAI_API_KEY not set — returning fallback.');
    return res.status(200).json({
      description: '',
      fallback: true,
      fallbackReason: 'AI service not configured (OPENAI_API_KEY missing).'
    });
  }

  // 4. Call OpenAI GPT-4o-mini
  try {
    rateLimitStore.set(titleKey, Date.now()); // record request time before call

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional task management assistant. Write concise, actionable task descriptions in 1–2 sentences. Focus on what needs to be done and why. Do not mention AI or that you wrote this.'
        },
        {
          role: 'user',
          content: `Write a short task description for: "${cleanTitle}"`
        }
      ],
      max_tokens: 120,
      temperature: 0.7
    });

    const description = completion.choices[0]?.message?.content?.trim() || '';

    console.log(`[AI Route] Generated description for "${cleanTitle}" (${description.length} chars)`);

    return res.status(200).json({
      description,
      fallback: false,
      model: 'gpt-4o-mini'
    });

  } catch (err) {
    // 5. Graceful degradation — AI failed, app keeps working
    console.error('[AI Route] OpenAI API error (graceful degradation):', err.message);

    return res.status(200).json({
      description: '',
      fallback: true,
      fallbackReason: err.message || 'AI service temporarily unavailable.'
    });
  }
});

module.exports = router;
