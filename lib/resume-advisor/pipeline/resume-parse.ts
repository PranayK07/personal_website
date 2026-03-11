import { Profile, ResumeParseResult, ResumeParseSection } from '@/lib/resume-advisor/types';
import { normalizeText, splitLines } from '@/lib/resume-advisor/pipeline/text';

const SECTION_KEYWORDS = ['education', 'experience', 'projects', 'skills', 'activities', 'interests'];

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

  return lines.filter((line) => line.length > 20).slice(0, 3);
}

function parseEducationSection(section: ResumeParseSection) {
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
        source: 'uploaded_resume' as const,
        confidence: 0.85,
      },
    },
  ];
}

function parseExperienceSection(section: ResumeParseSection) {
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

    entries.push({
      id: `resume-exp-${entries.length + 1}`,
      title: titleCompanyParts[0] || 'Role',
      company: titleCompanyParts[1] || titleCompanyParts[0] || 'Company',
      location: '',
      date: dateLine || 'Unknown',
      summary: block.join(' ').slice(0, 280),
      bullets: extractBullets(block),
      technologies: [],
      provenance: {
        source: 'uploaded_resume',
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

function parseProjectSection(section: ResumeParseSection) {
  const lines = section.rawLines;
  const entries: Profile['projects'] = [];
  let block: string[] = [];

  const flushBlock = () => {
    if (block.length === 0) {
      return;
    }

    const first = block[0] || 'Project';
    const dateLine = block.find((line) => /20\d\d|present/i.test(line)) || '';

    entries.push({
      id: `resume-proj-${entries.length + 1}`,
      title: first,
      role: 'Contributor',
      date: dateLine || 'Unknown',
      summary: block.join(' ').slice(0, 260),
      bullets: extractBullets(block),
      technologies: [],
      provenance: {
        source: 'uploaded_resume',
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

function parseSkillsSection(section: ResumeParseSection) {
  const lines = section.rawLines.join(' ');
  const skillTokens = lines
    .replace(/technical skills\s*:?/gi, '')
    .split(/[;,|]/)
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 1)
    .slice(0, 40);

  return [
    {
      id: 'resume-skills-1',
      label: 'Resume Skills',
      skills: skillTokens,
      provenance: {
        source: 'uploaded_resume' as const,
        confidence: 0.8,
      },
    },
  ];
}

export function parseResumeText(rawText: string): ResumeParseResult {
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

  const parsedProfile: Partial<Profile> = {
    education: educationSection ? parseEducationSection(educationSection) : [],
    experience: experienceSection ? parseExperienceSection(experienceSection) : [],
    projects: projectSection ? parseProjectSection(projectSection) : [],
    skills: skillsSection ? parseSkillsSection(skillsSection) : [],
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
