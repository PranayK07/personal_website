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

export interface ATSKeyword {
  keyword: string;
  category: 'technical' | 'domain' | 'responsibility' | 'tooling';
  inferred: boolean;
}

export interface JobDescriptionAnalysis {
  jdText: string;
  inferredRoleFamily: string;
  atsKeywords: ATSKeyword[];
  mustHaveSkills: string[];
  preferredSkills: string[];
  missingQualifications: string[];
  inferredSynonyms: string[];
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

export interface TailoredBullet {
  text: string;
  provenance: Provenance;
  support: 'direct_resume' | 'website_only' | 'inferred';
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
  exactKeywordsPresent: string[];
  importantKeywordsMissing: string[];
  inferredSynonymsAdded: string[];
  missingQualifications: string[];
  riskyUnsupportedAdditions: RiskyAddition[];
  itemReasons: ItemReason[];
}

export type AggressivenessMode = 'conservative' | 'balanced' | 'aggressive_ats';

export interface MergeRankResponse {
  mergedProfile: MergedProfile;
  rankedItems: RankedItem[];
  selectionState: SelectionState;
}

export interface GeneratePreviewResponse {
  tailoredResume: TailoredResume;
  generationAnalysis: GenerationAnalysis;
  previewHtml: string;
}
