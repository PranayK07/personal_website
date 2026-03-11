import { z } from 'zod';
import { completeJson } from '@/lib/resume-advisor/groq';
import { JobDescriptionAnalysis } from '@/lib/resume-advisor/types';
import { extractTopTerms, normalizeText, uniq } from '@/lib/resume-advisor/pipeline/text';

const analysisSchema = z.object({
  inferredRoleFamily: z.string().min(1),
  atsKeywords: z.array(z.object({
    keyword: z.string().min(1),
    category: z.enum(['technical', 'domain', 'responsibility', 'tooling']),
    inferred: z.boolean(),
  })).min(1),
  mustHaveSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  missingQualifications: z.array(z.string()),
  inferredSynonyms: z.array(z.string()),
});

const ROLE_HINTS: Record<string, string> = {
  backend: 'Backend Software Engineering',
  fullstack: 'Full-Stack Software Engineering',
  machine: 'Machine Learning Engineering',
  ml: 'Machine Learning Engineering',
  ai: 'AI Engineering',
  data: 'Data/Analytics Engineering',
  quant: 'Quantitative Engineering',
  security: 'Security Engineering',
};

function inferRoleFamilyFallback(text: string): string {
  const lower = text.toLowerCase();

  for (const [term, role] of Object.entries(ROLE_HINTS)) {
    if (lower.includes(term)) {
      return role;
    }
  }

  return 'Software Engineering';
}

function fallbackAnalyze(jdText: string): JobDescriptionAnalysis {
  // Heuristic fallback keeps the pipeline usable if LLM JSON parsing fails.
  const lines = jdText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const mustHaveSkills = lines
    .filter((line) => /must|required|need to|minimum/i.test(line))
    .slice(0, 12);

  const preferredSkills = lines
    .filter((line) => /preferred|nice to have|bonus|plus/i.test(line))
    .slice(0, 10);

  const rawKeywords = extractTopTerms(jdText, 30);
  const atsKeywords = rawKeywords.map((keyword) => ({
    keyword,
    category: 'technical' as const,
    inferred: false,
  }));

  const inferredSynonyms = rawKeywords
    .filter((keyword) => keyword.includes('ml') || keyword.includes('ai') || keyword.includes('backend'))
    .flatMap((keyword) => {
      if (keyword.includes('ml') || keyword.includes('ai')) {
        return ['machine learning', 'deep learning'];
      }
      if (keyword.includes('backend')) {
        return ['api development', 'distributed systems'];
      }
      return [];
    })
    .slice(0, 6);

  return {
    jdText: normalizeText(jdText),
    inferredRoleFamily: inferRoleFamilyFallback(jdText),
    atsKeywords,
    mustHaveSkills,
    preferredSkills,
    missingQualifications: [],
    inferredSynonyms: uniq(inferredSynonyms),
  };
}

export async function analyzeJobDescription(jdText: string): Promise<JobDescriptionAnalysis> {
  const cleanJd = normalizeText(jdText);

  const system = [
    'You analyze job descriptions for ATS-optimized resume tailoring.',
    'Return strictly valid JSON only and include only fields requested.',
    'Keep extracted terms concise, practical, and recruiter-relevant.',
    'Infer ATS synonyms strategically; do not invent impossible requirements.',
  ].join(' ');

  const user = [
    'Analyze this job description and return JSON with fields:',
    '{',
    '  "inferredRoleFamily": string,',
    '  "atsKeywords": [{"keyword": string, "category": "technical"|"domain"|"responsibility"|"tooling", "inferred": boolean}],',
    '  "mustHaveSkills": string[],',
    '  "preferredSkills": string[],',
    '  "missingQualifications": string[],',
    '  "inferredSynonyms": string[]',
    '}',
    'Limit atsKeywords to top 40.',
    'Job description:',
    cleanJd,
  ].join('\n');

  try {
    const raw = await completeJson<z.infer<typeof analysisSchema>>({
      system,
      user,
      // Tune this upward only if role-family inference quality drops.
      temperature: 0.1,
      maxTokens: 1400,
    });

    const parsed = analysisSchema.parse(raw);

    return {
      jdText: cleanJd,
      inferredRoleFamily: parsed.inferredRoleFamily,
      atsKeywords: parsed.atsKeywords,
      mustHaveSkills: uniq(parsed.mustHaveSkills),
      preferredSkills: uniq(parsed.preferredSkills),
      missingQualifications: uniq(parsed.missingQualifications),
      inferredSynonyms: uniq(parsed.inferredSynonyms),
    };
  } catch {
    return fallbackAnalyze(cleanJd);
  }
}
