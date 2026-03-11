import { z } from 'zod';

export const loginSchema = z.object({
  password: z.string().min(1),
});

export const jdAnalyzeSchema = z.object({
  jdText: z.string().min(20),
});

export const resumeParseSchema = z.object({
  rawText: z.string().min(1),
});

export const atsKeywordSchema = z.object({
  keyword: z.string(),
  category: z.enum(['technical', 'domain', 'responsibility', 'tooling']),
  inferred: z.boolean(),
});

export const jdAnalysisSchema = z.object({
  jdText: z.string(),
  inferredRoleFamily: z.string(),
  atsKeywords: z.array(atsKeywordSchema),
  mustHaveSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  missingQualifications: z.array(z.string()),
  inferredSynonyms: z.array(z.string()),
});

const provenanceSchema = z.object({
  source: z.enum(['website', 'uploaded_resume', 'manual_input', 'inferred']),
  confidence: z.number(),
  note: z.string().optional(),
});

const linkSchema = z.object({
  label: z.string(),
  url: z.string(),
  provenance: provenanceSchema,
});

const educationSchema = z.object({
  id: z.string(),
  school: z.string(),
  degree: z.string(),
  location: z.string(),
  graduationDate: z.string(),
  gpa: z.string().optional(),
  coursework: z.array(z.string()).optional(),
  honors: z.array(z.string()).optional(),
  bullets: z.array(z.string()).optional(),
  provenance: provenanceSchema,
});

const experienceSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  date: z.string(),
  summary: z.string(),
  bullets: z.array(z.string()).optional(),
  technologies: z.array(z.string()),
  provenance: provenanceSchema,
});

const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  role: z.string(),
  company: z.string().optional(),
  date: z.string(),
  summary: z.string(),
  bullets: z.array(z.string()).optional(),
  technologies: z.array(z.string()),
  githubUrl: z.string().optional(),
  provenance: provenanceSchema,
});

const skillGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  skills: z.array(z.string()),
  provenance: provenanceSchema,
});

const basicsSchema = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  bio: z.string(),
  graduationDate: z.string().optional(),
  gpa: z.string().optional(),
  links: z.array(linkSchema),
  provenance: provenanceSchema,
});

export const profileSchema = z.object({
  basics: basicsSchema,
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillGroupSchema),
  techStack: z.array(z.object({
    name: z.string(),
    logo: z.string().optional(),
    icon: z.string().optional(),
    color: z.string(),
    provenance: provenanceSchema,
  })),
  overrides: z.array(z.object({
    key: z.string(),
    value: z.string(),
    provenance: provenanceSchema,
  })).optional(),
});

export const resumeParseResultSchema = z.object({
  succeeded: z.boolean(),
  confidence: z.number(),
  rawText: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    rawLines: z.array(z.string()),
  })),
  parsedProfile: profileSchema.partial().optional(),
  warnings: z.array(z.string()),
});

export const mergeRankSchema = z.object({
  jdAnalysis: jdAnalysisSchema,
  resumeParseResult: resumeParseResultSchema.nullable(),
});

export const selectionStateSchema = z.object({
  selectedExperienceIds: z.array(z.string()),
  selectedProjectIds: z.array(z.string()),
  selectedSkillNames: z.array(z.string()),
  aggressiveness: z.enum(['conservative', 'balanced', 'aggressive_ats']),
});

export const generatePreviewSchema = z.object({
  jdAnalysis: jdAnalysisSchema,
  mergedProfile: profileSchema.extend({
    conflicts: z.array(z.object({
      field: z.string(),
      websiteValue: z.string(),
      resumeValue: z.string(),
      preferredSource: z.enum(['uploaded_resume', 'website']),
    })),
  }),
  selectionState: selectionStateSchema,
});

const tailoredBulletSchema = z.object({
  text: z.string(),
  provenance: provenanceSchema,
  support: z.enum(['direct_resume', 'website_only', 'inferred']),
});

export const tailoredResumeSchema = z.object({
  basics: basicsSchema,
  education: z.array(educationSchema),
  experience: z.array(z.object({
    id: z.string(),
    title: z.string(),
    company: z.string(),
    location: z.string(),
    date: z.string(),
    bullets: z.array(tailoredBulletSchema),
    technologies: z.array(z.string()),
    provenance: provenanceSchema,
  })),
  projects: z.array(z.object({
    id: z.string(),
    title: z.string(),
    role: z.string(),
    company: z.string().optional(),
    date: z.string(),
    bullets: z.array(tailoredBulletSchema),
    technologies: z.array(z.string()),
    githubUrl: z.string().optional(),
    provenance: provenanceSchema,
  })),
  skills: z.array(skillGroupSchema),
});

export const exportSchema = z.object({
  tailoredResume: tailoredResumeSchema,
});
