import {
  JobDescriptionAnalysis,
  MergedProfile,
  SelectionState,
  StyleProfile,
  EvidenceMap,
} from '@/lib/resume-advisor/types';

export interface JDContextPacket {
  role: string;
  seniority?: string;
  domain?: string;
  mustHaveRequirements: string[];
  preferredRequirements: string[];
  topAtsTerms: string[];
  taxonomySummary: Record<string, string[]>;
  inferredSynonyms: string[];
}

export interface CandidateContextPacket {
  role: string;
  selectedExperienceIds: string[];
  selectedProjectIds: string[];
  selectedSkillNames: string[];
  styleProfile: StyleProfile | null;
  experienceSummaries: { id: string; title: string; company: string; bullets: string[] }[];
  projectSummaries: { id: string; title: string; role: string; bullets: string[] }[];
  skillsList: string[];
}

export interface MatchContextPacket {
  mustHaveCoverage: string[];
  preferredCoverage: string[];
  itemReasons: { itemId: string; itemType: string; reason: string; matchedSkills: string[] }[];
  missingHard: string[];
  riskNotes: string[];
}

export function buildJDContextPacket(jd: JobDescriptionAnalysis): JDContextPacket {
  const taxonomySummary: Record<string, string[]> = {};
  if (jd.taxonomy) {
    for (const [k, v] of Object.entries(jd.taxonomy)) {
      if (Array.isArray(v) && v.length > 0) taxonomySummary[k] = v.slice(0, 15);
    }
  }
  return {
    role: jd.inferredRoleFamily,
    seniority: jd.seniority,
    domain: jd.domain,
    mustHaveRequirements: jd.mustHaveSkills.slice(0, 20),
    preferredRequirements: jd.preferredSkills.slice(0, 15),
    topAtsTerms: (jd.topAtsTerms || jd.atsKeywords.map((a) => a.keyword)).slice(0, 35),
    taxonomySummary,
    inferredSynonyms: jd.inferredSynonyms.slice(0, 12),
  };
}

export function buildCandidateContextPacket(
  merged: MergedProfile,
  selection: SelectionState,
  styleProfile: StyleProfile | null,
): CandidateContextPacket {
  const experienceSummaries = merged.experience
    .filter((e) => selection.selectedExperienceIds.includes(e.id))
    .map((e) => ({
      id: e.id,
      title: e.title,
      company: e.company,
      bullets: e.bullets || [e.summary],
    }));

  const projectSummaries = merged.projects
    .filter((p) => selection.selectedProjectIds.includes(p.id))
    .map((p) => ({
      id: p.id,
      title: p.title,
      role: p.role,
      bullets: p.bullets || [p.summary],
    }));

  const skillsList = merged.skills.flatMap((g) =>
    g.skills.filter((s) => selection.selectedSkillNames.includes(s)),
  );

  return {
    role: merged.basics.role,
    selectedExperienceIds: selection.selectedExperienceIds,
    selectedProjectIds: selection.selectedProjectIds,
    selectedSkillNames: selection.selectedSkillNames,
    styleProfile,
    experienceSummaries,
    projectSummaries,
    skillsList: [...new Set(skillsList)],
  };
}

export function buildMatchContextPacket(
  jd: JobDescriptionAnalysis,
  evidenceMap: EvidenceMap | undefined,
  itemReasons: { itemId: string; itemType: string; reason: string; matchedSkills: string[] }[],
): MatchContextPacket {
  const mustHaveCoverage: string[] = [];
  const preferredCoverage: string[] = [];
  const missingHard: string[] = [];
  const riskNotes: string[] = [];

  if (evidenceMap) {
    for (const re of evidenceMap.requirementEvidence) {
      if (re.evidenceStrength === 'direct' || re.evidenceStrength === 'partial') {
        if (re.requirementId.startsWith('must-')) mustHaveCoverage.push(re.requirementText);
        else preferredCoverage.push(re.requirementText);
      } else if (re.requirementId.startsWith('must-') && re.evidenceStrength === 'none') {
        missingHard.push(re.requirementText);
      }
      if (re.evidenceStrength === 'inferred_risky') {
        riskNotes.push(`Risky inference for: ${re.requirementText}`);
      }
    }
  }

  return {
    mustHaveCoverage,
    preferredCoverage,
    itemReasons,
    missingHard: missingHard.slice(0, 15),
    riskNotes: riskNotes.slice(0, 10),
  };
}
