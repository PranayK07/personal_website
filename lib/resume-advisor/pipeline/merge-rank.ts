import {
  ConflictItem,
  JobDescriptionAnalysis,
  LLMConfig,
  MergeRankResponse,
  MergedProfile,
  Profile,
  RankedItem,
  ResumeParseResult,
  StyleProfile,
} from '@/lib/resume-advisor/types';
import { tokenize, uniq } from '@/lib/resume-advisor/pipeline/text';
import { buildEvidenceMap } from '@/lib/resume-advisor/pipeline/evidence-map';
import { extractStyleProfile } from '@/lib/resume-advisor/pipeline/style-profile';

const MAX_TOTAL_SELECTED_ITEMS = 5;
const MIN_ITEMS_PER_TYPE = 2;
const MAX_ITEMS_PER_TYPE = 3;
const MAX_AUTO_SELECTED_SKILLS = 22;

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#]/g, '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsTerm(text: string, term: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return false;
  const pattern = new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(normalized)}([^a-z0-9+#]|$)`, 'i');
  return pattern.test(text.toLowerCase());
}

function buildExperienceKey(item: Profile['experience'][number]): string {
  return `${normalizeKey(item.title)}-${normalizeKey(item.company)}`;
}

function buildProjectKey(item: Profile['projects'][number]): string {
  return `${normalizeKey(item.title)}-${normalizeKey(item.date)}`;
}

function mergeExperience(
  baseItems: Profile['experience'],
  resumeItems: Profile['experience'],
  conflicts: ConflictItem[],
): Profile['experience'] {
  const merged = [...baseItems];
  const byKey = new Map<string, number>();

  merged.forEach((item, index) => {
    byKey.set(buildExperienceKey(item), index);
  });

  for (const resumeItem of resumeItems) {
    const key = buildExperienceKey(resumeItem);
    const idx = byKey.get(key);

    if (idx === undefined) {
      merged.push(resumeItem);
      byKey.set(key, merged.length - 1);
      continue;
    }

    const existing = merged[idx];
    if (existing.summary !== resumeItem.summary) {
      conflicts.push({
        field: `experience.${existing.id}.summary`,
        websiteValue: existing.summary,
        resumeValue: resumeItem.summary,
        preferredSource: 'uploaded_resume',
      });
    }

    merged[idx] = {
      ...existing,
      ...resumeItem,
      technologies: uniq([...(existing.technologies || []), ...(resumeItem.technologies || [])]),
      provenance: {
        source: resumeItem.provenance.source,
        confidence: Math.max(existing.provenance.confidence, resumeItem.provenance.confidence),
      },
    };
  }

  return merged;
}

function mergeProjects(
  baseItems: Profile['projects'],
  resumeItems: Profile['projects'],
  conflicts: ConflictItem[],
): Profile['projects'] {
  const merged = [...baseItems];
  const byKey = new Map<string, number>();

  merged.forEach((item, index) => {
    byKey.set(buildProjectKey(item), index);
  });

  for (const resumeItem of resumeItems) {
    const key = buildProjectKey(resumeItem);
    const idx = byKey.get(key);

    if (idx === undefined) {
      merged.push(resumeItem);
      byKey.set(key, merged.length - 1);
      continue;
    }

    const existing = merged[idx];
    if (existing.summary !== resumeItem.summary) {
      conflicts.push({
        field: `projects.${existing.id}.summary`,
        websiteValue: existing.summary,
        resumeValue: resumeItem.summary,
        preferredSource: 'uploaded_resume',
      });
    }

    merged[idx] = {
      ...existing,
      ...resumeItem,
      technologies: uniq([...(existing.technologies || []), ...(resumeItem.technologies || [])]),
      provenance: {
        source: resumeItem.provenance.source,
        confidence: Math.max(existing.provenance.confidence, resumeItem.provenance.confidence),
      },
    };
  }

  return merged;
}

function mergeSkills(base: Profile['skills'], resume: Profile['skills']): Profile['skills'] {
  if (resume.length === 0) {
    return base;
  }

  const merged = [...base];

  for (const resumeGroup of resume) {
    const existingIdx = merged.findIndex((group) => normalizeKey(group.label) === normalizeKey(resumeGroup.label));

    if (existingIdx === -1) {
      merged.push(resumeGroup);
      continue;
    }

    const existing = merged[existingIdx];
    merged[existingIdx] = {
      ...existing,
      skills: uniq([...existing.skills, ...resumeGroup.skills]),
      provenance: {
        source: resumeGroup.provenance.source,
        confidence: Math.max(existing.provenance.confidence, resumeGroup.provenance.confidence),
      },
    };
  }

  return merged;
}

function inferParseSource(resumeParse: ResumeParseResult | null): 'uploaded_resume' | 'manual_input' | 'website' {
  if (!resumeParse?.parsedProfile) return 'website';

  const explicit = resumeParse.parsedProfile.skills?.[0]?.provenance.source
    || resumeParse.parsedProfile.experience?.[0]?.provenance.source
    || resumeParse.parsedProfile.projects?.[0]?.provenance.source;

  if (explicit === 'manual_input') return 'manual_input';
  return 'uploaded_resume';
}

function augmentSkillsWithDynamicSignals(
  mergedProfile: MergedProfile,
  resumeParse: ResumeParseResult | null,
  jdAnalysis: JobDescriptionAnalysis,
): MergedProfile {
  const existingSkills = mergedProfile.skills.flatMap((group) => group.skills);
  const existingSet = new Set(existingSkills.map((skill) => normalizeKey(skill)));

  const fromTech = uniq([
    ...mergedProfile.experience.flatMap((item) => item.technologies || []),
    ...mergedProfile.projects.flatMap((item) => item.technologies || []),
  ]).filter((skill) => skill.length >= 2);

  const jdTerms = uniq([
    ...(jdAnalysis.topAtsTerms || jdAnalysis.atsKeywords.map((item) => item.keyword)),
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
    ...jdAnalysis.inferredSynonyms,
  ]).filter((term) => term.length >= 2 && term.length <= 40);

  const rawText = resumeParse?.rawText || '';
  const fromRawText = rawText
    ? jdTerms.filter((term) => containsTerm(rawText, term))
    : [];

  const dynamicSkills = uniq([...fromTech, ...fromRawText])
    .filter((skill) => !existingSet.has(normalizeKey(skill)))
    .slice(0, 36);

  if (dynamicSkills.length === 0) {
    return mergedProfile;
  }

  const source = inferParseSource(resumeParse);

  return {
    ...mergedProfile,
    skills: [
      ...mergedProfile.skills,
      {
        id: 'auto-derived-skills',
        label: 'Auto-Derived Skills',
        skills: dynamicSkills,
        provenance: {
          source,
          confidence: 0.7,
          note: 'Inferred from uploaded/manual resume text and role-targeted terms.',
        },
      },
    ],
  };
}

function buildDefaultItemSelection(rankedItems: RankedItem[]): { selectedExperienceIds: string[]; selectedProjectIds: string[] } {
  const rankedExperience = rankedItems
    .filter((item) => item.itemType === 'experience')
    .sort((a, b) => b.score - a.score);

  const rankedProjects = rankedItems
    .filter((item) => item.itemType === 'project')
    .sort((a, b) => b.score - a.score);

  const availableTotal = rankedExperience.length + rankedProjects.length;
  const desiredTotal = Math.min(MAX_TOTAL_SELECTED_ITEMS, availableTotal);

  if (desiredTotal === 0) {
    return { selectedExperienceIds: [], selectedProjectIds: [] };
  }

  const strictMixPossible = rankedExperience.length >= MIN_ITEMS_PER_TYPE && rankedProjects.length >= MIN_ITEMS_PER_TYPE && desiredTotal >= 4;

  const selectedExperience: RankedItem[] = strictMixPossible
    ? rankedExperience.slice(0, MIN_ITEMS_PER_TYPE)
    : [];

  const selectedProjects: RankedItem[] = strictMixPossible
    ? rankedProjects.slice(0, MIN_ITEMS_PER_TYPE)
    : [];

  const selectedIds = new Set<string>([
    ...selectedExperience.map((item) => item.id),
    ...selectedProjects.map((item) => item.id),
  ]);

  const remainder = [...rankedExperience, ...rankedProjects]
    .filter((item) => !selectedIds.has(item.id))
    .sort((a, b) => b.score - a.score);

  const perTypeCap = strictMixPossible ? MAX_ITEMS_PER_TYPE : MAX_TOTAL_SELECTED_ITEMS;

  while ((selectedExperience.length + selectedProjects.length) < desiredTotal && remainder.length > 0) {
    const nextIdx = remainder.findIndex((candidate) => {
      if (candidate.itemType === 'experience') {
        return selectedExperience.length < perTypeCap;
      }
      return selectedProjects.length < perTypeCap;
    });

    if (nextIdx === -1) break;

    const [candidate] = remainder.splice(nextIdx, 1);
    if (candidate.itemType === 'experience') {
      selectedExperience.push(candidate);
    } else {
      selectedProjects.push(candidate);
    }
  }

  return {
    selectedExperienceIds: selectedExperience.slice(0, MAX_ITEMS_PER_TYPE).map((item) => item.id),
    selectedProjectIds: selectedProjects.slice(0, MAX_ITEMS_PER_TYPE).map((item) => item.id),
  };
}

function scoreTextAgainstKeywords(text: string, keywords: string[]): { score: number; overlap: string[] } {
  const tokens = new Set(tokenize(text));
  const overlaps: string[] = [];

  for (const keyword of keywords) {
    const normalized = normalizeKey(keyword);
    if (!normalized) continue;

    const keywordTokens = tokenize(keyword);
    const hasHit = keywordTokens.some((kwToken) => tokens.has(kwToken));
    if (hasHit) {
      overlaps.push(keyword);
    }
  }

  const score = keywords.length > 0 ? overlaps.length / keywords.length : 0;
  return { score, overlap: overlaps };
}

function reasonLabels(overlapCount: number, text: string): string[] {
  const labels: string[] = [];
  const lower = text.toLowerCase();

  if (overlapCount >= 6) {
    labels.push('high keyword overlap');
  } else if (overlapCount >= 3) {
    labels.push('solid keyword coverage');
  }

  if (/backend|api|service|cloud|aws|database/.test(lower)) {
    labels.push('strong backend relevance');
  }

  if (/machine learning|ml|ai|model|cuda|pytorch|scikit/.test(lower)) {
    labels.push('strong ML/AI relevance');
  }

  if (labels.length === 0) {
    labels.push('transferable relevance');
  }

  return labels.slice(0, 3);
}

export function rankMergedProfile(mergedProfile: MergedProfile, jdAnalysis: JobDescriptionAnalysis): RankedItem[] {
  const keywordList = uniq([
    ...(jdAnalysis.topAtsTerms || jdAnalysis.atsKeywords.map((item) => item.keyword)),
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
    ...jdAnalysis.inferredSynonyms,
  ]).filter((k) => k.length >= 2);

  const ranked: RankedItem[] = [];

  for (const experience of mergedProfile.experience) {
    const text = `${experience.title} ${experience.company} ${experience.summary} ${(experience.bullets || []).join(' ')} ${experience.technologies.join(' ')}`;
    const { score, overlap } = scoreTextAgainstKeywords(text, keywordList);
    const labels = reasonLabels(overlap.length, text);

    ranked.push({
      id: experience.id,
      itemType: 'experience',
      score: Number((score * 100).toFixed(2)),
      labels,
      explanation: overlap.length > 0
        ? `Include: ${overlap.slice(0, 3).join(', ')}`
        : 'Transferable',
    });
  }

  for (const project of mergedProfile.projects) {
    const text = `${project.title} ${project.role} ${project.summary} ${(project.bullets || []).join(' ')} ${project.technologies.join(' ')}`;
    const { score, overlap } = scoreTextAgainstKeywords(text, keywordList);
    const labels = reasonLabels(overlap.length, text);

    ranked.push({
      id: project.id,
      itemType: 'project',
      score: Number((score * 100).toFixed(2)),
      labels,
      explanation: overlap.length > 0
        ? `Include: ${overlap.slice(0, 3).join(', ')}`
        : 'Relevant',
    });
  }

  for (const group of mergedProfile.skills) {
    const text = `${group.label} ${group.skills.join(' ')}`;
    const { score, overlap } = scoreTextAgainstKeywords(text, keywordList);

    ranked.push({
      id: group.id,
      itemType: 'skill',
      score: Number((score * 100).toFixed(2)),
      labels: overlap.length > 0 ? ['keyword-supported skill group'] : ['lower direct relevance'],
      explanation: overlap.length > 0
        ? `Include: ${overlap.slice(0, 3).join(', ')}`
        : 'Supporting',
    });
  }

  return ranked.sort((a, b) => b.score - a.score);
}

function rankWithEvidenceMap(
  mergedProfile: MergedProfile,
  jdAnalysis: JobDescriptionAnalysis,
  evidenceMap: ReturnType<typeof buildEvidenceMap>,
): RankedItem[] {
  const byItem = new Map<string, { strength: number; reason: string; matched: string[] }>();
  for (const ie of evidenceMap.itemEvidence) {
    const matched = [
      ...ie.matchedRequiredSkills.slice(0, 5),
      ...ie.matchedPreferredSkills.slice(0, 3),
    ];
    byItem.set(ie.itemId, {
      strength: ie.evidenceStrength,
      reason: ie.recommendationReason,
      matched,
    });
  }

  const ranked: RankedItem[] = [];

  for (const exp of mergedProfile.experience) {
    const ev = byItem.get(exp.id);
    const score = ev ? ev.strength * 100 : 0;
    const labels = ev && ev.matched.length >= 3 ? ['high evidence match'] : ev && ev.matched.length >= 1 ? ['solid match'] : ['transferable'];
    const sourceLabel = exp.provenance.source === 'uploaded_resume'
      ? 'resume-supported'
      : exp.provenance.source === 'manual_input'
        ? 'manual-context-supported'
        : 'website-supported';

    ranked.push({
      id: exp.id,
      itemType: 'experience',
      score: Number(score.toFixed(2)),
      labels: labels.slice(0, 3),
      explanation: `${ev?.reason ?? 'Transferable'}; ${sourceLabel}${ev?.matched.length ? `; keywords: ${ev.matched.slice(0, 3).join(', ')}` : ''}`,
    });
  }

  for (const proj of mergedProfile.projects) {
    const ev = byItem.get(proj.id);
    const score = ev ? ev.strength * 100 : 0;
    const labels = ev && ev.matched.length >= 2 ? ['high evidence match'] : ev ? ['solid match'] : ['relevant project'];
    const sourceLabel = proj.provenance.source === 'uploaded_resume'
      ? 'resume-supported'
      : proj.provenance.source === 'manual_input'
        ? 'manual-context-supported'
        : 'website-supported';

    ranked.push({
      id: proj.id,
      itemType: 'project',
      score: Number(score.toFixed(2)),
      labels: labels.slice(0, 3),
      explanation: `${ev?.reason ?? 'Relevant'}; ${sourceLabel}${ev?.matched.length ? `; keywords: ${ev.matched.slice(0, 3).join(', ')}` : ''}`,
    });
  }

  for (const group of mergedProfile.skills) {
    const ev = byItem.get(group.id);
    const score = ev ? ev.strength * 100 : 0;
    ranked.push({
      id: group.id,
      itemType: 'skill',
      score: Number(score.toFixed(2)),
      labels: ev && ev.matched.length > 0 ? ['JD-aligned skills'] : ['supporting skills'],
      explanation: ev?.reason ?? 'Supporting',
    });
  }

  return ranked.sort((a, b) => b.score - a.score);
}

function tokenOverlapCount(skill: string, terms: string[]): number {
  const skillTokens = new Set(tokenize(skill));
  if (skillTokens.size === 0) return 0;

  let maxOverlap = 0;
  for (const term of terms) {
    const termTokens = tokenize(term);
    if (termTokens.length === 0) continue;

    let hit = 0;
    for (const token of termTokens) {
      if (skillTokens.has(token)) hit += 1;
    }

    maxOverlap = Math.max(maxOverlap, hit);
  }

  return maxOverlap;
}

function buildAutoSkillSelection(
  mergedProfile: MergedProfile,
  jdAnalysis: JobDescriptionAnalysis,
  selectedExperienceIds: string[],
  selectedProjectIds: string[],
): string[] {
  const mustSet = new Set(jdAnalysis.mustHaveSkills.map((item) => normalizeKey(item)));
  const preferredSet = new Set(jdAnalysis.preferredSkills.map((item) => normalizeKey(item)));
  const topSet = new Set((jdAnalysis.topAtsTerms || jdAnalysis.atsKeywords.map((item) => item.keyword)).map((item) => normalizeKey(item)));
  const synonymSet = new Set(jdAnalysis.inferredSynonyms.map((item) => normalizeKey(item)));

  const selectedTech = new Set([
    ...mergedProfile.experience
      .filter((item) => selectedExperienceIds.includes(item.id))
      .flatMap((item) => item.technologies),
    ...mergedProfile.projects
      .filter((item) => selectedProjectIds.includes(item.id))
      .flatMap((item) => item.technologies),
  ].map((item) => normalizeKey(item)));

  const profileTextBlob = [
    ...mergedProfile.experience.flatMap((item) => [item.summary, ...(item.bullets || []), ...item.technologies]),
    ...mergedProfile.projects.flatMap((item) => [item.summary, ...(item.bullets || []), ...item.technologies]),
    ...mergedProfile.skills.flatMap((group) => group.skills),
  ].join(' ').toLowerCase();

  const candidateSkills = uniq([
    ...mergedProfile.skills.flatMap((group) => group.skills),
    ...mergedProfile.experience.flatMap((item) => item.technologies),
    ...mergedProfile.projects.flatMap((item) => item.technologies),
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
  ]).filter((skill) => skill.length >= 2 && skill.length <= 40);

  const scored = candidateSkills
    .map((skill) => {
      const normalized = normalizeKey(skill);
      let score = 0;

      if (mustSet.has(normalized)) score += 80;
      if (preferredSet.has(normalized)) score += 55;
      if (topSet.has(normalized)) score += 40;
      if (synonymSet.has(normalized)) score += 20;
      if (selectedTech.has(normalized)) score += 22;

      const overlapMust = tokenOverlapCount(skill, jdAnalysis.mustHaveSkills);
      const overlapPreferred = tokenOverlapCount(skill, jdAnalysis.preferredSkills);
      score += overlapMust * 12;
      score += overlapPreferred * 8;

      if (containsTerm(profileTextBlob, skill)) score += 6;

      return { skill, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.localeCompare(b.skill));

  const dedupedSkills: string[] = [];
  const seen = new Set<string>();
  for (const entry of scored) {
    const key = normalizeKey(entry.skill);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    dedupedSkills.push(entry.skill);
  }

  const topSkills = dedupedSkills.slice(0, MAX_AUTO_SELECTED_SKILLS);

  if (topSkills.length > 0) {
    return topSkills;
  }

  return mergedProfile.skills.flatMap((group) => group.skills).slice(0, MAX_AUTO_SELECTED_SKILLS);
}

export function mergeProfiles(baseProfile: Profile, resumeParse: ResumeParseResult | null): MergedProfile {
  const conflicts: ConflictItem[] = [];

  if (!resumeParse?.parsedProfile) {
    return {
      ...baseProfile,
      conflicts,
    };
  }

  const parsed = resumeParse.parsedProfile;

  const merged: MergedProfile = {
    ...baseProfile,
    education: (parsed.education && parsed.education.length > 0) ? parsed.education : baseProfile.education,
    experience: mergeExperience(baseProfile.experience, parsed.experience || [], conflicts),
    projects: mergeProjects(baseProfile.projects, parsed.projects || [], conflicts),
    skills: mergeSkills(baseProfile.skills, parsed.skills || []),
    conflicts,
  };

  return merged;
}

export async function buildMergeRankResponse(
  baseProfile: Profile,
  resumeParse: ResumeParseResult | null,
  jdAnalysis: JobDescriptionAnalysis,
  options?: { llmConfig?: LLMConfig | null },
): Promise<MergeRankResponse> {
  const mergedProfile = augmentSkillsWithDynamicSignals(
    mergeProfiles(baseProfile, resumeParse),
    resumeParse,
    jdAnalysis,
  );

  const evidenceMap = buildEvidenceMap(jdAnalysis, mergedProfile);
  const rankedItems = rankWithEvidenceMap(mergedProfile, jdAnalysis, evidenceMap);

  const {
    selectedExperienceIds,
    selectedProjectIds,
  } = buildDefaultItemSelection(rankedItems);

  const selectedSkillNames = buildAutoSkillSelection(
    mergedProfile,
    jdAnalysis,
    selectedExperienceIds,
    selectedProjectIds,
  );

  let styleProfile: StyleProfile | undefined;
  try {
    const rawText = resumeParse?.rawText || mergedProfile.experience.flatMap((e) => e.bullets || []).join('\n') || mergedProfile.basics.bio;
    styleProfile = rawText.length > 100 ? await extractStyleProfile(rawText, options?.llmConfig) : undefined;
  } catch {
    styleProfile = undefined;
  }

  return {
    mergedProfile,
    rankedItems,
    selectionState: {
      selectedExperienceIds,
      selectedProjectIds,
      selectedSkillNames: uniq(selectedSkillNames).slice(0, MAX_AUTO_SELECTED_SKILLS),
      aggressiveness: 'balanced',
    },
    styleProfile,
    evidenceMap,
    llmUsage: {
      styleProfile: styleProfile?.llmUsage,
    },
  };
}
