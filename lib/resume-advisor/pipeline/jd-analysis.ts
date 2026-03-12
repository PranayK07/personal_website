import { z } from 'zod';
import { completeJson } from '@/lib/resume-advisor/groq';
import { JobDescriptionAnalysis, JDKeywordTaxonomy } from '@/lib/resume-advisor/types';
import { filterATSKeywords, filterKeywordList } from '@/lib/resume-advisor/pipeline/filters';
import { extractTopTerms, normalizeText, uniq } from '@/lib/resume-advisor/pipeline/text';

const taxonomySchema = z.object({
  programming_languages: z.array(z.string()).optional(),
  frameworks_libraries: z.array(z.string()).optional(),
  cloud_devops: z.array(z.string()).optional(),
  data_ml: z.array(z.string()).optional(),
  databases: z.array(z.string()).optional(),
  tooling: z.array(z.string()).optional(),
  methodologies: z.array(z.string()).optional(),
  domain_terms: z.array(z.string()).optional(),
  soft_skills: z.array(z.string()).optional(),
  responsibility_phrases: z.array(z.string()).optional(),
  metrics_outcome_terms: z.array(z.string()).optional(),
}).strict().optional();

const analysisSchema = z.object({
  inferredRoleFamily: z.string().min(1),
  seniority: z.string().optional(),
  domain: z.string().optional(),
  mustHaveRequirements: z.array(z.string()).optional(),
  preferredRequirements: z.array(z.string()).optional(),
  atsKeywords: z.array(z.object({
    keyword: z.string().min(1),
    category: z.enum(['technical', 'domain', 'responsibility', 'tooling']),
    inferred: z.boolean(),
  })),
  mustHaveSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  missingQualifications: z.array(z.string()),
  inferredSynonyms: z.array(z.string()),
  taxonomy: taxonomySchema,
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
    if (lower.includes(term)) return role;
  }
  return 'Software Engineering';
}

function filterTaxonomy(tax: JDKeywordTaxonomy | undefined): JDKeywordTaxonomy | undefined {
  if (!tax) return undefined;
  const out: JDKeywordTaxonomy = {};
  const keys = [
    'programming_languages', 'frameworks_libraries', 'cloud_devops', 'data_ml', 'databases',
    'tooling', 'methodologies', 'domain_terms', 'soft_skills', 'responsibility_phrases', 'metrics_outcome_terms',
  ] as const;
  for (const k of keys) {
    const arr = (tax as Record<string, string[] | undefined>)[k];
    if (Array.isArray(arr) && arr.length > 0) {
      const filtered = filterKeywordList(arr, { minLength: 2 });
      if (filtered.length > 0) (out as Record<string, string[]>)[k] = filtered;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function fallbackAnalyze(jdText: string): JobDescriptionAnalysis {
  const lines = jdText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const mustHaveSkills = lines
    .filter((line) => /must|required|need to|minimum/i.test(line))
    .slice(0, 12)
    .map((l) => l.slice(0, 120));

  const preferredSkills = lines
    .filter((line) => /preferred|nice to have|bonus|plus/i.test(line))
    .slice(0, 10)
    .map((l) => l.slice(0, 120));

  const rawKeywords = extractTopTerms(jdText, 50);
  const filtered = filterKeywordList(rawKeywords, { minLength: 2 });
  const atsKeywords = filtered.slice(0, 35).map((keyword) => ({
    keyword,
    category: 'technical' as const,
    inferred: false,
  }));

  const inferredSynonyms = filterKeywordList(
    rawKeywords.filter((k) => /ml|ai|backend|data|python|java|sql/i.test(k)).slice(0, 8),
    { minLength: 2 },
  );

  return {
    jdText: normalizeText(jdText),
    inferredRoleFamily: inferRoleFamilyFallback(jdText),
    atsKeywords,
    mustHaveSkills: uniq(filterKeywordList(mustHaveSkills, { minLength: 2 })),
    preferredSkills: uniq(filterKeywordList(preferredSkills, { minLength: 2 })),
    missingQualifications: [],
    inferredSynonyms: uniq(inferredSynonyms),
  };
}

const JD_ANALYZER_SYSTEM = `You are an ATS/recruiter screening analyst. Your task is to convert a raw job description into a structured screening target for resume tailoring.

Critical rules:
- Extract ONLY recruiter-significant screening terms: technical skills, tools, frameworks, platforms, qualifications, domain concepts, seniority signals, and concrete responsibility phrases.
- Do NOT output stopwords or filler as keywords. Never include: "to", "and", "or", "with", "for", "of", "in", "the", "a", "an", "that", "this", "it", "is", "are", "be", "have", "has", "will", "would", "can", "could", "ability", "responsible for", "strong communication", "team player", "self-starter" as top ATS keywords.
- Prefer noun phrases and multi-word technical phrases (e.g. "machine learning", "distributed systems", "REST APIs").
- Distinguish explicit terms (stated in the JD) from inferred ATS synonyms (likely screening equivalents).
- Separate must-have vs preferred. If the JD does not clearly separate them, infer from language (required/must vs preferred/nice to have).
- Output strict JSON only. No markdown. No explanation outside JSON.
- Favor precision over recall for top-priority ATS keywords. If a term is generic or low-signal, omit it.`;

export async function analyzeJobDescription(jdText: string): Promise<JobDescriptionAnalysis> {
  const cleanJd = normalizeText(jdText);

  const user = [
    'Analyze this job description and return a single JSON object with these exact fields:',
    JSON.stringify({
      inferredRoleFamily: 'string – e.g. Backend Software Engineering, Machine Learning Engineering',
      seniority: 'string or omit – e.g. Senior, Mid-level',
      domain: 'string or omit – e.g. fintech, healthcare',
      mustHaveRequirements: 'string[] – full requirement phrases that are mandatory',
      preferredRequirements: 'string[] – preferred but not mandatory',
      atsKeywords: '[{ keyword: string, category: "technical"|"domain"|"responsibility"|"tooling", inferred: boolean }] – max 45 items; only recruiter-significant terms; no stopwords',
      mustHaveSkills: 'string[] – concrete skills/tools explicitly required',
      preferredSkills: 'string[] – preferred skills',
      missingQualifications: 'string[] – only if you want to flag gaps',
      inferredSynonyms: 'string[] – ATS-style alternate phrasings (e.g. ML for machine learning)',
      taxonomy: {
        programming_languages: 'string[]',
        frameworks_libraries: 'string[]',
        cloud_devops: 'string[]',
        data_ml: 'string[]',
        databases: 'string[]',
        tooling: 'string[]',
        domain_terms: 'string[]',
        responsibility_phrases: 'string[]',
      },
    }),
    'Job description:',
    cleanJd.slice(0, 12000),
  ].join('\n');

  try {
    const raw = await completeJson<z.infer<typeof analysisSchema>>({
      system: JD_ANALYZER_SYSTEM,
      user,
      temperature: 0.1,
      maxTokens: 2200,
    });

    const parsed = analysisSchema.parse(raw);

    const mustHaveSkills = uniq(filterKeywordList(parsed.mustHaveSkills, { minLength: 2 }));
    const preferredSkills = uniq(filterKeywordList(parsed.preferredSkills, { minLength: 2 }));
    const missingQualifications = uniq(filterKeywordList(parsed.missingQualifications, { minLength: 2 }));
    const inferredSynonyms = uniq(filterKeywordList(parsed.inferredSynonyms, { minLength: 2 }));

    const atsKeywords = filterATSKeywords(parsed.atsKeywords, { minLength: 2 });
    if (atsKeywords.length === 0) {
      const fallbackKws = filterKeywordList(
        parsed.atsKeywords.map((a) => a.keyword),
        { minLength: 2 },
      ).slice(0, 30);
      atsKeywords.push(
        ...fallbackKws.map((keyword) => ({ keyword, category: 'technical' as const, inferred: false })),
      );
    }

    const taxonomy = filterTaxonomy(parsed.taxonomy as JDKeywordTaxonomy | undefined);

    const topAtsTerms = uniq([
      ...mustHaveSkills,
      ...atsKeywords.slice(0, 25).map((a) => a.keyword),
      ...preferredSkills.slice(0, 15),
    ].map((s) => s.trim()).filter(Boolean));

    return {
      jdText: cleanJd,
      inferredRoleFamily: parsed.inferredRoleFamily.trim() || inferRoleFamilyFallback(cleanJd),
      atsKeywords,
      mustHaveSkills,
      preferredSkills,
      missingQualifications,
      inferredSynonyms,
      seniority: parsed.seniority?.trim(),
      domain: parsed.domain?.trim(),
      taxonomy,
      topAtsTerms: filterKeywordList(topAtsTerms, { minLength: 2 }),
    };
  } catch {
    return fallbackAnalyze(cleanJd);
  }
}
