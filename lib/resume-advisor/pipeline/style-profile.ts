import { z } from 'zod';
import { completeJsonWithMeta, getConfiguredLLM } from '@/lib/resume-advisor/groq';
import { LLMConfig, LLMUsage, StyleProfile } from '@/lib/resume-advisor/types';
import { normalizeText } from '@/lib/resume-advisor/pipeline/text';

const styleProfileSchema = z.object({
  averageBulletLength: z.number().optional(),
  tenseUsage: z.enum(['past', 'present', 'mixed']).optional(),
  verbStyle: z.array(z.string()).optional(),
  metricDensity: z.enum(['high', 'medium', 'low']).optional(),
  punctuationStyle: z.string().optional(),
  tone: z.enum(['technical', 'business', 'mixed']).optional(),
  compressionLevel: z.enum(['high', 'medium', 'low']).optional(),
}).strict();

const STYLE_PROFILER_SYSTEM = `You are a resume style profiler. Analyze the candidate's resume writing style and output a structured style profile as JSON only.

Focus on: bullet length, verb patterns, tense (past/present/mixed), metric usage, punctuation rhythm, clause shape, density, tone (technical/business/mixed), compression.

Do not rewrite content. Do not judge quality. Output a single JSON object with optional fields: averageBulletLength (number), tenseUsage ("past"|"present"|"mixed"), verbStyle (string[]), metricDensity ("high"|"medium"|"low"), punctuationStyle (string), tone ("technical"|"business"|"mixed"), compressionLevel ("high"|"medium"|"low").`;

function computeBulletStats(text: string): { avgLen: number; count: number } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => /^[-*•]\s*/.test(l) || (l.length > 20 && l.length < 400));
  const lengths = bullets.map((b) => b.replace(/^[-*•]\s*/, '').length).filter((n) => n > 0);
  const avgLen = lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 0;
  return { avgLen, count: bullets.length };
}

/**
 * Extract a writing-style fingerprint from resume text (and optionally merged profile).
 * Used during rewrite to keep bullets consistent with the candidate's voice.
 */
export async function extractStyleProfile(
  resumeOrProfileText: string,
  llmConfig?: LLMConfig | null,
): Promise<StyleProfile> {
  const configured = getConfiguredLLM(llmConfig);
  const fallbackUsage: LLMUsage = {
    provider: configured.provider,
    model: configured.model,
    stage: 'styleProfile',
    source: 'fallback',
  };

  const clean = normalizeText(resumeOrProfileText).slice(0, 8000);
  const { avgLen, count } = computeBulletStats(clean);

  if (count < 2) {
    return {
      averageBulletLength: avgLen || 120,
      tenseUsage: 'past',
      metricDensity: 'medium',
      tone: 'technical',
      compressionLevel: 'medium',
      llmUsage: {
        ...fallbackUsage,
        note: 'Insufficient bullet signal for LLM style profiling; used heuristic defaults.',
      },
    };
  }

  try {
    const { data, meta } = await completeJsonWithMeta<z.infer<typeof styleProfileSchema>>({
      system: STYLE_PROFILER_SYSTEM,
      user: `Analyze this resume text and return only a JSON object with the style profile fields.\n\nResume text:\n${clean}`,
      temperature: 0.1,
      maxTokens: 400,
    }, llmConfig);

    const parsed = styleProfileSchema.parse(data);
    return {
      averageBulletLength: parsed.averageBulletLength ?? avgLen,
      tenseUsage: parsed.tenseUsage,
      verbStyle: parsed.verbStyle,
      metricDensity: parsed.metricDensity,
      punctuationStyle: parsed.punctuationStyle,
      tone: parsed.tone,
      compressionLevel: parsed.compressionLevel,
      llmUsage: {
        provider: meta.provider,
        model: meta.model,
        stage: 'styleProfile',
        source: 'llm',
      },
    };
  } catch {
    return {
      averageBulletLength: avgLen,
      tenseUsage: 'past',
      metricDensity: 'medium',
      tone: 'technical',
      compressionLevel: 'medium',
      llmUsage: {
        ...fallbackUsage,
        note: 'LLM style profiling failed; used heuristic defaults.',
      },
    };
  }
}
