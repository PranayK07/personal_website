import {
  EvidenceMap,
  EvidenceStrength,
  JobDescriptionAnalysis,
  MergedProfile,
  RequirementEvidence,
  ItemEvidence,
} from '@/lib/resume-advisor/types';
import { normalizeKeyword } from '@/lib/resume-advisor/pipeline/filters';
import { tokenize } from '@/lib/resume-advisor/pipeline/text';

function textForExperience(item: MergedProfile['experience'][number]): string {
  return [
    item.title,
    item.company,
    item.summary,
    ...(item.bullets || []),
    ...(item.technologies || []),
  ].join(' ').toLowerCase();
}

function textForProject(item: MergedProfile['projects'][number]): string {
  return [
    item.title,
    item.role,
    item.summary,
    ...(item.bullets || []),
    ...(item.technologies || []),
  ].join(' ').toLowerCase();
}

function textForSkillGroup(group: MergedProfile['skills'][number]): string {
  return [group.label, ...group.skills].join(' ').toLowerCase();
}

function phraseOverlap(requirement: string, text: string): number {
  const reqTokens = new Set(tokenize(requirement));
  const textTokens = new Set(tokenize(text));
  let hits = 0;
  for (const t of reqTokens) {
    if (textTokens.has(t)) hits++;
  }
  return reqTokens.size > 0 ? hits / reqTokens.size : 0;
}

/**
 * Build requirement-to-evidence and item-to-evidence maps for ranking and rewrite context.
 */
function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
}

export function buildEvidenceMap(
  jdAnalysis: JobDescriptionAnalysis,
  mergedProfile: MergedProfile,
): EvidenceMap {
  const requirementEvidence: RequirementEvidence[] = [];
  const reqs = [
    ...jdAnalysis.mustHaveSkills.map((r) => ({ text: r, id: `must-${normalizeKey(r)}`, isMust: true })),
    ...jdAnalysis.preferredSkills.map((r) => ({ text: r, id: `pref-${normalizeKey(r)}`, isMust: false })),
  ];

  for (const { text, id, isMust } of reqs) {
    const supporting: { itemId: string; type: 'experience' | 'project' | 'skill'; score: number }[] = [];

    for (const exp of mergedProfile.experience) {
      const score = phraseOverlap(text, textForExperience(exp));
      if (score > 0) supporting.push({ itemId: exp.id, type: 'experience', score });
    }
    for (const proj of mergedProfile.projects) {
      const score = phraseOverlap(text, textForProject(proj));
      if (score > 0) supporting.push({ itemId: proj.id, type: 'project', score });
    }
    for (const group of mergedProfile.skills) {
      const score = phraseOverlap(text, textForSkillGroup(group));
      if (score > 0) supporting.push({ itemId: group.id, type: 'skill', score });
    }

    supporting.sort((a, b) => b.score - a.score);
    const top = supporting.slice(0, 3);
    const strength: EvidenceStrength =
      top.some((s) => s.score >= 0.5) ? 'direct'
        : top.some((s) => s.score >= 0.25) ? 'partial'
          : top.length > 0 ? 'inferred_risky'
            : 'none';

    requirementEvidence.push({
      requirementId: id,
      requirementText: text,
      evidenceStrength: strength,
      supportingItemIds: top.map((s) => s.itemId),
      supportingItemType: top[0]?.type ?? 'experience',
      confidence: top[0]?.score ?? 0,
      notes: top.length === 0 ? 'No direct match' : undefined,
    });
  }

  const itemEvidence: ItemEvidence[] = [];
  const requiredSet = new Set(jdAnalysis.mustHaveSkills.map((s) => normalizeKeyword(s)));
  const preferredSet = new Set(jdAnalysis.preferredSkills.map((s) => normalizeKeyword(s)));
  const domainTerms = new Set(
    (jdAnalysis.taxonomy?.domain_terms || []).map((s) => normalizeKeyword(s)),
  );

  for (const exp of mergedProfile.experience) {
    const text = textForExperience(exp);
    const tokens = new Set(tokenize(text));
    const matchedRequired = jdAnalysis.mustHaveSkills.filter((s) =>
      tokenize(s).some((t) => tokens.has(t)),
    );
    const matchedPreferred = jdAnalysis.preferredSkills.filter((s) =>
      tokenize(s).some((t) => tokens.has(t)),
    );
    const matchedDomain = (jdAnalysis.taxonomy?.domain_terms || []).filter((s) =>
      tokenize(s).some((t) => tokens.has(t)),
    );
    const strength =
      (matchedRequired.length / Math.max(1, jdAnalysis.mustHaveSkills.length)) * 0.6 +
      (matchedPreferred.length / Math.max(1, jdAnalysis.preferredSkills.length)) * 0.3 +
      (matchedDomain.length / Math.max(1, domainTerms.size || 1)) * 0.1;
    const riskLevel: ItemEvidence['riskLevel'] =
      strength >= 0.4 ? 'low' : strength >= 0.2 ? 'medium' : 'high';

    itemEvidence.push({
      itemId: exp.id,
      itemType: 'experience',
      matchedRequiredSkills: matchedRequired,
      matchedPreferredSkills: matchedPreferred,
      matchedDomainTerms: matchedDomain,
      evidenceStrength: Math.min(1, strength),
      riskLevel,
      recommendationReason:
        matchedRequired.length > 0
          ? `Include: ${matchedRequired.slice(0, 2).join(', ')}`
          : matchedPreferred.length > 0
            ? `Include: preferred ${matchedPreferred.slice(0, 2).join(', ')}`
            : 'Transferable',
    });
  }

  for (const proj of mergedProfile.projects) {
    const text = textForProject(proj);
    const tokens = new Set(tokenize(text));
    const matchedRequired = jdAnalysis.mustHaveSkills.filter((s) =>
      tokenize(s).some((t) => tokens.has(t)),
    );
    const matchedPreferred = jdAnalysis.preferredSkills.filter((s) =>
      tokenize(s).some((t) => tokens.has(t)),
    );
    const matchedDomain = (jdAnalysis.taxonomy?.domain_terms || []).filter((s) =>
      tokenize(s).some((t) => tokens.has(t)),
    );
    const strength =
      (matchedRequired.length / Math.max(1, jdAnalysis.mustHaveSkills.length)) * 0.6 +
      (matchedPreferred.length / Math.max(1, jdAnalysis.preferredSkills.length)) * 0.3 +
      (matchedDomain.length / Math.max(1, domainTerms.size || 1)) * 0.1;
    const riskLevel: ItemEvidence['riskLevel'] =
      strength >= 0.4 ? 'low' : strength >= 0.2 ? 'medium' : 'high';

    itemEvidence.push({
      itemId: proj.id,
      itemType: 'project',
      matchedRequiredSkills: matchedRequired,
      matchedPreferredSkills: matchedPreferred,
      matchedDomainTerms: matchedDomain,
      evidenceStrength: Math.min(1, strength),
      riskLevel,
      recommendationReason:
        matchedRequired.length > 0
          ? `Include: ${matchedRequired.slice(0, 2).join(', ')}`
          : matchedPreferred.length > 0
            ? `Include: preferred ${matchedPreferred.slice(0, 2).join(', ')}`
            : 'Relevant',
    });
  }

  for (const group of mergedProfile.skills) {
    const text = textForSkillGroup(group);
    const tokens = new Set(tokenize(text));
    const matchedRequired = jdAnalysis.mustHaveSkills.filter((s) =>
      tokenize(s).some((t) => tokens.has(t)),
    );
    const matchedPreferred = jdAnalysis.preferredSkills.filter((s) =>
      tokenize(s).some((t) => tokens.has(t)),
    );
    const matchedDomain = (jdAnalysis.taxonomy?.domain_terms || []).filter((s) =>
      tokenize(s).some((t) => tokens.has(t)),
    );
    const strength =
      (matchedRequired.length / Math.max(1, jdAnalysis.mustHaveSkills.length)) * 0.5 +
      (matchedPreferred.length / Math.max(1, jdAnalysis.preferredSkills.length)) * 0.4 +
      (matchedDomain.length / Math.max(1, domainTerms.size || 1)) * 0.1;
    const riskLevel: ItemEvidence['riskLevel'] =
      strength >= 0.3 ? 'low' : strength >= 0.15 ? 'medium' : 'high';

    itemEvidence.push({
      itemId: group.id,
      itemType: 'skill',
      matchedRequiredSkills: matchedRequired,
      matchedPreferredSkills: matchedPreferred,
      matchedDomainTerms: matchedDomain,
      evidenceStrength: Math.min(1, strength),
      riskLevel,
      recommendationReason:
        matchedRequired.length > 0
          ? `Include: ${matchedRequired.slice(0, 3).join(', ')}`
          : 'Supporting',
    });
  }

  return { requirementEvidence, itemEvidence };
}
