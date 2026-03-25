import { Profile, ResumeParseResult, ResumeParseSection } from '@/lib/resume-advisor/types';
import { normalizeText, splitLines } from '@/lib/resume-advisor/pipeline/text';

const SECTION_KEYWORDS = ['education', 'experience', 'projects', 'skills', 'activities', 'interests'];

const SKILL_TERMS = [
  'Python',
  'Java',
  'JavaScript',
  'TypeScript',
  'C',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Kotlin',
  'Swift',
  'SQL',
  'NoSQL',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'DynamoDB',
  'Snowflake',
  'BigQuery',
  'Pandas',
  'NumPy',
  'Scikit-learn',
  'TensorFlow',
  'PyTorch',
  'XGBoost',
  'Hugging Face',
  'LangChain',
  'OpenAI',
  'LLM',
  'NLP',
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'FastAPI',
  'Flask',
  'Django',
  'Spring Boot',
  'GraphQL',
  'REST',
  'Microservices',
  'AWS',
  'GCP',
  'Azure',
  'Docker',
  'Kubernetes',
  'Terraform',
  'Linux',
  'Git',
  'GitHub Actions',
  'CI/CD',
  'Jenkins',
  'Tableau',
  'Power BI',
  'Excel',
  'Spark',
  'Hadoop',
  'Airflow',
  'ETL',
  'API',
  'gRPC',
  'OAuth',
  'Jest',
  'Pytest',
  'Playwright',
];

type ResumeInputSource = 'uploaded_resume' | 'manual_input';

function uniq(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const item of items) {
    const normalized = item.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(item);
  }

  return out;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSkillToken(token: string): string {
  return token
    .trim()
    .replace(/^[-*•]/, '')
    .replace(/^\d+\.?\s*/, '')
    .replace(/\s+/g, ' ')
    .replace(/[|]+/g, ' ')
    .replace(/^[^a-z0-9+#]+/i, '')
    .replace(/[^a-z0-9+#.\/-]+$/i, '');
}

function extractKnownSkills(text: string): string[] {
  const lower = ` ${text.toLowerCase()} `;
  const hits = SKILL_TERMS.filter((term) => {
    const pattern = new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(term.toLowerCase())}([^a-z0-9+#]|$)`, 'i');
    return pattern.test(lower);
  });

  return uniq(hits);
}

function splitSkillLikeTokens(text: string): string[] {
  return text
    .replace(/technical skills\s*:?/gi, '')
    .replace(/languages\s*:?/gi, '')
    .replace(/frameworks\s*:?/gi, '')
    .replace(/tools\s*:?/gi, '')
    .replace(/technologies\s*:?/gi, '')
    .split(/[;,|\n]/)
    .map(normalizeSkillToken)
    .filter((token) => token.length >= 2 && token.length <= 40)
    .filter((token) => !/^(skills?|tools?|technologies|interests?|activities)$/i.test(token));
}

function inferSkillsFromText(rawText: string): string[] {
  const known = extractKnownSkills(rawText);
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const skillLikeLines = lines.filter((line) => {
    if (/(skills?|technologies|tools?|frameworks?|languages?|stack)/i.test(line)) {
      return true;
    }

    const delimiterCount = (line.match(/[;,|]/g) || []).length;
    return delimiterCount >= 3 && line.length <= 220;
  });

  const explicitText = skillLikeLines.join('; ');
  const tokenized = explicitText
    ? splitSkillLikeTokens(explicitText).filter((token) => /[a-z]/i.test(token)).slice(0, 120)
    : [];

  return uniq([...known, ...tokenized]).slice(0, 60);
}

function parseTechnologiesFromText(text: string): string[] {
  const inferred = inferSkillsFromText(text);
  return inferred.slice(0, 12);
}

function detectHeading(line: string): boolean {
  const compact = line.trim();
  const lower = compact.toLowerCase();
  if (SECTION_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return true;
  }

  return compact.length <= 45 && compact.toUpperCase() === compact && /[A-Z]/.test(compact);
}

function chunkSections(lines: string[]): ResumeParseSection[] {
  const sections: ResumeParseSection[] = [];
  let current: ResumeParseSection | null = null;

  for (const line of lines) {
    if (detectHeading(line)) {
      if (current) {
        sections.push(current);
      }

      current = {
        heading: line,
        rawLines: [],
      };
      continue;
    }

    if (!current) {
      current = { heading: 'BASICS', rawLines: [] };
    }

    current.rawLines.push(line);
  }

  if (current) {
    sections.push(current);
  }

  return sections;
}

function extractBullets(lines: string[]): string[] {
  const bullets = lines
    .filter((line) => /^[-*•]/.test(line))
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);

  if (bullets.length > 0) {
    return bullets;
  }

  return lines.filter((line) => line.length > 20).slice(0, 4);
}

function parseEducationSection(section: ResumeParseSection, source: ResumeInputSource) {
  const lines = section.rawLines;
  if (lines.length === 0) {
    return [];
  }

  const firstLine = lines[0] || '';
  const secondLine = lines[1] || '';
  const dateMatch = section.rawLines.find((line) => /20\d\d|present|expected/i.test(line));

  return [
    {
      id: 'resume-education-1',
      school: firstLine || 'Unknown School',
      degree: secondLine || 'Degree not detected',
      location: '',
      graduationDate: dateMatch || 'Unknown',
      gpa: section.rawLines.find((line) => /gpa/i.test(line)),
      coursework: section.rawLines.find((line) => /coursework/i.test(line))
        ?.replace(/.*coursework\s*:?/i, '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      provenance: {
        source,
        confidence: 0.85,
      },
    },
  ];
}

function parseExperienceSection(section: ResumeParseSection, source: ResumeInputSource) {
  const lines = section.rawLines;
  const entries: Profile['experience'] = [];
  let block: string[] = [];

  const flushBlock = () => {
    if (block.length === 0) {
      return;
    }

    const header = block[0] || 'Unknown Experience';
    const headerParts = header.split('|').map((part) => part.trim());
    const titleCompany = headerParts[0] || header;
    const dateLine = block.find((line) => /20\d\d|present/i.test(line)) || '';

    const titleCompanyParts = titleCompany.split(',').map((part) => part.trim());
    const blockText = block.join(' ');

    entries.push({
      id: `resume-exp-${entries.length + 1}`,
      title: titleCompanyParts[0] || 'Role',
      company: titleCompanyParts[1] || titleCompanyParts[0] || 'Company',
      location: '',
      date: dateLine || 'Unknown',
      summary: blockText.slice(0, 320),
      bullets: extractBullets(block),
      technologies: parseTechnologiesFromText(blockText),
      provenance: {
        source,
        confidence: 0.85,
      },
    });

    block = [];
  };

  for (const line of lines) {
    const looksLikeHeader = /\b(20\d\d|present)\b/i.test(line) && !/^[-*•]/.test(line);

    if (looksLikeHeader && block.length > 0) {
      flushBlock();
    }

    block.push(line);
  }

  flushBlock();
  return entries;
}

function parseProjectSection(section: ResumeParseSection, source: ResumeInputSource) {
  const lines = section.rawLines;
  const entries: Profile['projects'] = [];
  let block: string[] = [];

  const flushBlock = () => {
    if (block.length === 0) {
      return;
    }

    const first = block[0] || 'Project';
    const dateLine = block.find((line) => /20\d\d|present/i.test(line)) || '';
    const blockText = block.join(' ');

    entries.push({
      id: `resume-proj-${entries.length + 1}`,
      title: first,
      role: 'Contributor',
      date: dateLine || 'Unknown',
      summary: blockText.slice(0, 300),
      bullets: extractBullets(block),
      technologies: parseTechnologiesFromText(blockText),
      provenance: {
        source,
        confidence: 0.82,
      },
    });

    block = [];
  };

  for (const line of lines) {
    const looksLikeHeader = !/^[-*•]/.test(line) && line.length < 120 && /\b(20\d\d|present)\b/i.test(line);

    if (looksLikeHeader && block.length > 0) {
      flushBlock();
    }

    block.push(line);
  }

  flushBlock();

  return entries;
}

function parseSkillsSection(section: ResumeParseSection, source: ResumeInputSource) {
  const lines = section.rawLines.join(' ');
  const explicitTokens = splitSkillLikeTokens(lines);
  const inferred = extractKnownSkills(lines);
  const skillTokens = uniq([...explicitTokens, ...inferred]).slice(0, 60);

  return [
    {
      id: 'resume-skills-1',
      label: 'Resume Skills',
      skills: skillTokens,
      provenance: {
        source,
        confidence: 0.8,
      },
    },
  ];
}

export function parseResumeText(rawText: string, source: ResumeInputSource = 'uploaded_resume'): ResumeParseResult {
  const normalized = normalizeText(rawText);

  if (!normalized) {
    return {
      succeeded: false,
      confidence: 0,
      rawText: '',
      sections: [],
      warnings: ['No resume text was provided.'],
    };
  }

  const lines = splitLines(rawText);
  const sections = chunkSections(lines);

  const educationSection = sections.find((section) => /education/i.test(section.heading));
  const experienceSection = sections.find((section) => /experience/i.test(section.heading));
  const projectSection = sections.find((section) => /project/i.test(section.heading));
  const skillsSection = sections.find((section) => /skill|activities|interests/i.test(section.heading));

  const headingScore = [educationSection, experienceSection, projectSection, skillsSection].filter(Boolean).length / 4;
  const lengthScore = Math.min(1, lines.length / 60);
  // Confidence weights are intentionally simple and should be tuned with real resume samples.
  const confidence = Number(((headingScore * 0.65) + (lengthScore * 0.35)).toFixed(2));

  const warnings: string[] = [];
  if (!educationSection) warnings.push('Education section was not confidently detected.');
  if (!experienceSection) warnings.push('Experience section was not confidently detected.');
  if (!projectSection) warnings.push('Projects section was not confidently detected.');
  if (!skillsSection) warnings.push('Skills section was not confidently detected.');
  if (confidence < 0.55) warnings.push('Overall parse confidence is low. Use website-only mode or manual text fallback.');

  const inferredSkills = inferSkillsFromText(rawText);

  const parsedProfile: Partial<Profile> = {
    education: educationSection ? parseEducationSection(educationSection, source) : [],
    experience: experienceSection ? parseExperienceSection(experienceSection, source) : [],
    projects: projectSection ? parseProjectSection(projectSection, source) : [],
    skills: skillsSection
      ? parseSkillsSection(skillsSection, source)
      : (inferredSkills.length > 0
        ? [{
          id: 'resume-skills-inferred',
          label: 'Inferred Skills',
          skills: inferredSkills,
          provenance: {
            source,
            confidence: 0.65,
            note: 'Extracted from raw resume/manual text due missing explicit skills section.',
          },
        }]
        : []),
  };

  return {
    succeeded: confidence >= 0.35,
    confidence,
    rawText,
    sections,
    parsedProfile,
    warnings,
  };
}
