export type SourceType = 'website' | 'uploaded_resume' | 'manual_input' | 'inferred';

export interface Provenance {
  source: SourceType;
  confidence: number;
  note?: string;
}

export interface ProfileLink {
  label: string;
  url: string;
  provenance: Provenance;
}

export interface Basics {
  name: string;
  role: string;
  location: string;
  email: string;
  phone?: string;
  bio: string;
  graduationDate?: string;
  gpa?: string;
  links: ProfileLink[];
  provenance: Provenance;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  location: string;
  graduationDate: string;
  gpa?: string;
  coursework?: string[];
  honors?: string[];
  bullets?: string[];
  provenance: Provenance;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  summary: string;
  bullets?: string[];
  technologies: string[];
  provenance: Provenance;
}

export interface ProjectItem {
  id: string;
  title: string;
  role: string;
  company?: string;
  date: string;
  summary: string;
  bullets?: string[];
  technologies: string[];
  githubUrl?: string;
  provenance: Provenance;
}

export interface SkillGroup {
  id: string;
  label: string;
  skills: string[];
  provenance: Provenance;
}

export interface ProfileOverride {
  key: string;
  value: string;
  provenance: Provenance;
}

export interface Profile {
  basics: Basics;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillGroup[];
  techStack: {
    name: string;
    logo?: string;
    icon?: string;
    color: string;
    provenance: Provenance;
  }[];
  overrides?: ProfileOverride[];
}

export type ATSKeywordCategory =
  | 'technical'
  | 'domain'
  | 'responsibility'
  | 'tooling'
  | 'programming_languages'
  | 'frameworks_libraries'
  | 'cloud_devops'
  | 'data_ml'
  | 'databases'
  | 'methodologies'
  | 'soft_skills'
  | 'metrics_outcome';

export interface ATSKeyword {
  keyword: string;
  category: 'technical' | 'domain' | 'responsibility' | 'tooling';
  inferred: boolean;
}

/** Taxonomy of JD keywords by category for recruiter-grade screening. */
export interface JDKeywordTaxonomy {
  programming_languages?: string[];
  frameworks_libraries?: string[];
  cloud_devops?: string[];
  data_ml?: string[];
  security?: string[];
  analytics_bi?: string[];
  backend_platform?: string[];
  frontend_platform?: string[];
  databases?: string[];
  tooling?: string[];
  methodologies?: string[];
  domain_terms?: string[];
  soft_skills?: string[];
  responsibility_phrases?: string[];
  metrics_outcome_terms?: string[];
}

export interface JobDescriptionAnalysis {
  jdText: string;
  inferredRoleFamily: string;
  atsKeywords: ATSKeyword[];
  mustHaveSkills: string[];
  preferredSkills: string[];
  missingQualifications: string[];
  inferredSynonyms: string[];
  /** Optional: seniority, domain, structured requirements. */
  seniority?: string;
  domain?: string;
  /** Optional: taxonomy by category; used for better ranking and context. */
  taxonomy?: JDKeywordTaxonomy;
  /** Top ATS terms ranked by importance (filtered, no junk). */
  topAtsTerms?: string[];
}

export interface ResumeParseSection {
  heading: string;
  rawLines: string[];
}

export interface ResumeParseResult {
  succeeded: boolean;
  confidence: number;
  rawText: string;
  sections: ResumeParseSection[];
  parsedProfile?: Partial<Profile>;
  warnings: string[];
}

export interface ConflictItem {
  field: string;
  websiteValue: string;
  resumeValue: string;
  preferredSource: 'uploaded_resume' | 'website';
}

export interface RankedItem {
  id: string;
  itemType: 'experience' | 'project' | 'skill';
  score: number;
  labels: string[];
  explanation: string;
}

export interface MergedProfile extends Profile {
  conflicts: ConflictItem[];
}

export interface SelectionState {
  selectedExperienceIds: string[];
  selectedProjectIds: string[];
  selectedSkillNames: string[];
  aggressiveness: AggressivenessMode;
}

/** Optional metadata per bullet for analysis panel and audit. */
export interface TailoredBulletMetadata {
  matchedKeywords?: string[];
  matchedRequirements?: string[];
  sourceSupport: 'direct_resume' | 'website_only' | 'inferred';
  riskLevel?: 'low' | 'medium' | 'high';
  styleFitScore?: number;
  evidenceNotes?: string;
}

export interface TailoredBullet {
  text: string;
  provenance: Provenance;
  support: 'direct_resume' | 'website_only' | 'inferred';
  metadata?: TailoredBulletMetadata;
}

export interface TailoredExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  bullets: TailoredBullet[];
  technologies: string[];
  provenance: Provenance;
}

export interface TailoredProjectItem {
  id: string;
  title: string;
  role: string;
  company?: string;
  date: string;
  bullets: TailoredBullet[];
  technologies: string[];
  githubUrl?: string;
  provenance: Provenance;
}

export interface TailoredResume {
  basics: Basics;
  education: EducationItem[];
  experience: TailoredExperienceItem[];
  projects: TailoredProjectItem[];
  skills: SkillGroup[];
}

export interface ItemReason {
  itemId: string;
  itemType: 'experience' | 'project' | 'skill';
  reasonLabel: string;
  explanation: string;
}

export interface RiskyAddition {
  text: string;
  reason: string;
}

export interface GenerationAnalysis {
  atsMatchScore: number;
  mustHaveCoverage?: number;
  preferredCoverage?: number;
  exactKeywordsPresent: string[];
  importantKeywordsMissing: string[];
  inferredSynonymsAdded: string[];
  missingQualifications: string[];
  riskyUnsupportedAdditions: RiskyAddition[];
  itemReasons: ItemReason[];
}

export type AggressivenessMode = 'conservative' | 'balanced' | 'aggressive_ats';

/** Writing-style fingerprint from resume for consistent bullet rewriting. */
export interface StyleProfile {
  averageBulletLength?: number;
  tenseUsage?: 'past' | 'present' | 'mixed';
  verbStyle?: string[];
  metricDensity?: 'high' | 'medium' | 'low';
  punctuationStyle?: string;
  tone?: 'technical' | 'business' | 'mixed';
  compressionLevel?: 'high' | 'medium' | 'low';
}

/** Evidence strength for a requirement. */
export type EvidenceStrength = 'direct' | 'partial' | 'none' | 'inferred_risky';

export interface RequirementEvidence {
  requirementId: string;
  requirementText: string;
  evidenceStrength: EvidenceStrength;
  supportingItemIds: string[];
  supportingItemType: 'experience' | 'project' | 'skill';
  confidence: number;
  notes?: string;
}

export interface ItemEvidence {
  itemId: string;
  itemType: 'experience' | 'project' | 'skill';
  matchedRequiredSkills: string[];
  matchedPreferredSkills: string[];
  matchedDomainTerms: string[];
  evidenceStrength: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendationReason: string;
}

export interface EvidenceMap {
  requirementEvidence: RequirementEvidence[];
  itemEvidence: ItemEvidence[];
}

export interface MergeRankResponse {
  mergedProfile: MergedProfile;
  rankedItems: RankedItem[];
  selectionState: SelectionState;
  styleProfile?: StyleProfile;
  evidenceMap?: EvidenceMap;
}

export interface GeneratePreviewResponse {
  tailoredResume: TailoredResume;
  generationAnalysis: GenerationAnalysis;
  previewHtml: string;
}
