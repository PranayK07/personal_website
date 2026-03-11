import {
  ConflictItem,
  JobDescriptionAnalysis,
  MergeRankResponse,
  MergedProfile,
  Profile,
  RankedItem,
  ResumeParseResult,
} from '@/lib/resume-advisor/types';
import { tokenize, uniq } from '@/lib/resume-advisor/pipeline/text';

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
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
        source: 'uploaded_resume',
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
        source: 'uploaded_resume',
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
        source: 'uploaded_resume',
        confidence: Math.max(existing.provenance.confidence, resumeGroup.provenance.confidence),
      },
    };
  }

  return merged;
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
    ...jdAnalysis.atsKeywords.map((item) => item.keyword),
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
    ...jdAnalysis.inferredSynonyms,
  ]);

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
      explanation: `Matched ${overlap.length} relevant JD terms; strongest overlap includes ${overlap.slice(0, 5).join(', ') || 'transferable experience'}.`,
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
      explanation: `Project maps to ${overlap.length} JD terms and supports ATS keyword coverage with concrete tools.`,
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
        ? `Contains ${overlap.length} directly requested skills from the JD.`
        : 'Useful adjacent tools, but lower direct keyword overlap with this JD.',
    });
  }

  return ranked.sort((a, b) => b.score - a.score);
}

export function buildMergeRankResponse(
  baseProfile: Profile,
  resumeParse: ResumeParseResult | null,
  jdAnalysis: JobDescriptionAnalysis,
): MergeRankResponse {
  const mergedProfile = mergeProfiles(baseProfile, resumeParse);
  const rankedItems = rankMergedProfile(mergedProfile, jdAnalysis);

  const selectedExperienceIds = rankedItems
    .filter((item) => item.itemType === 'experience')
    .slice(0, 4)
    .map((item) => item.id);

  const selectedProjectIds = rankedItems
    .filter((item) => item.itemType === 'project')
    .slice(0, 3)
    .map((item) => item.id);

  const selectedSkillNames = mergedProfile.skills
    .flatMap((group) => group.skills)
    .filter((skill) => {
      const key = normalizeKey(skill);
      return jdAnalysis.atsKeywords.some((kw) => normalizeKey(kw.keyword) === key)
        || jdAnalysis.mustHaveSkills.some((req) => normalizeKey(req) === key)
        || jdAnalysis.preferredSkills.some((req) => normalizeKey(req) === key);
    });

  return {
    mergedProfile,
    rankedItems,
    selectionState: {
      selectedExperienceIds,
      selectedProjectIds,
      selectedSkillNames: uniq(selectedSkillNames).slice(0, 16),
      aggressiveness: 'balanced',
    },
  };
}
