import { z } from 'zod';
import { completeJson } from '@/lib/resume-advisor/groq';
import {
  AggressivenessMode,
  GenerationAnalysis,
  GeneratePreviewResponse,
  ItemReason,
  JobDescriptionAnalysis,
  MergedProfile,
  SelectionState,
  TailoredBullet,
  TailoredExperienceItem,
  TailoredProjectItem,
  TailoredResume,
} from '@/lib/resume-advisor/types';
import { tokenize, uniq } from '@/lib/resume-advisor/pipeline/text';

const rewriteSchema = z.object({
  experiences: z.array(z.object({
    id: z.string(),
    bullets: z.array(z.string()),
  })),
  projects: z.array(z.object({
    id: z.string(),
    bullets: z.array(z.string()),
  })),
  riskyUnsupportedAdditions: z.array(z.object({
    text: z.string(),
    reason: z.string(),
  })),
});

function scoreKeywordCoverage(text: string, keywords: string[]): string[] {
  const tokens = new Set(tokenize(text));

  return keywords.filter((keyword) => {
    const keywordTokens = tokenize(keyword);
    return keywordTokens.some((token) => tokens.has(token));
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateBullet(bullet: string, maxChars: number): string {
  if (bullet.length <= maxChars) {
    return bullet;
  }

  return `${bullet.slice(0, maxChars - 1).trimEnd()}…`;
}

function maxCharsForMode(mode: AggressivenessMode): number {
  if (mode === 'conservative') {
    return 165;
  }

  if (mode === 'aggressive_ats') {
    return 200;
  }

  return 180;
}

function enforceOnePageBudget(resume: TailoredResume, mode: AggressivenessMode): TailoredResume {
  // These caps are the primary one-page control knobs for PDF fidelity.
  const maxChars = maxCharsForMode(mode);
  const maxExperienceBullets = mode === 'aggressive_ats' ? 4 : 3;
  const maxProjectBullets = mode === 'aggressive_ats' ? 3 : 2;

  const experience = resume.experience.map((item) => ({
    ...item,
    bullets: item.bullets
      .slice(0, maxExperienceBullets)
      .map((bullet) => ({ ...bullet, text: truncateBullet(bullet.text, maxChars) })),
  }));

  const projects = resume.projects.map((item) => ({
    ...item,
    bullets: item.bullets
      .slice(0, maxProjectBullets)
      .map((bullet) => ({ ...bullet, text: truncateBullet(bullet.text, maxChars) })),
  }));

  return {
    ...resume,
    experience,
    projects,
  };
}

function manualRewrite(
  bullets: string[],
  keywords: string[],
  mode: AggressivenessMode,
): string[] {
  const selectedKeywords = keywords.slice(0, mode === 'aggressive_ats' ? 3 : 2);

  return bullets.slice(0, mode === 'aggressive_ats' ? 4 : 3).map((bullet, index) => {
    const keyword = selectedKeywords[index % Math.max(1, selectedKeywords.length)] || '';
    if (!keyword) {
      return bullet;
    }

    if (bullet.toLowerCase().includes(keyword.toLowerCase())) {
      return bullet;
    }

    if (mode === 'conservative') {
      return `${bullet} (${keyword})`;
    }

    return `${bullet} leveraging ${keyword}`;
  });
}

function supportFromSource(source: string): TailoredBullet['support'] {
  if (source === 'uploaded_resume') {
    return 'direct_resume';
  }

  if (source === 'website') {
    return 'website_only';
  }

  return 'inferred';
}

async function rewriteSelectedBullets(
  experience: TailoredExperienceItem[],
  projects: TailoredProjectItem[],
  jdAnalysis: JobDescriptionAnalysis,
  aggressiveness: AggressivenessMode,
): Promise<z.infer<typeof rewriteSchema>> {
  const keywordFocus = uniq([
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
    ...jdAnalysis.atsKeywords.map((item) => item.keyword),
    ...jdAnalysis.inferredSynonyms,
  ]).slice(0, 24);

  const system = [
    'You rewrite resume bullets for ATS optimization while preserving plausibility.',
    'Never change employer names, school names, titles, GPA, links, or dates.',
    'Respect role integrity and avoid impossible fabrication.',
    'Return strict JSON only.',
  ].join(' ');

  const aggressivenessLabel = aggressiveness === 'aggressive_ats'
    ? 'Aggressive ATS (high keyword saturation, still plausible).'
    : aggressiveness === 'conservative'
      ? 'Conservative (minimal reframing).'
      : 'Balanced (default; strategic but plausible).';

  const user = JSON.stringify({
    aggressiveness: aggressivenessLabel,
    keywordFocus,
    experience,
    projects,
    outputShape: {
      experiences: [{ id: 'string', bullets: ['string'] }],
      projects: [{ id: 'string', bullets: ['string'] }],
      riskyUnsupportedAdditions: [{ text: 'string', reason: 'string' }],
    },
  });

  return rewriteSchema.parse(await completeJson({
    system,
    user,
    // Slightly higher temperature helps phrasing diversity while keeping structure stable.
    temperature: 0.35,
    maxTokens: 1700,
  }));
}

function buildReasons(
  resume: TailoredResume,
  jdAnalysis: JobDescriptionAnalysis,
): ItemReason[] {
  const keywords = uniq([
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
    ...jdAnalysis.atsKeywords.map((item) => item.keyword),
  ]);

  const reasons: ItemReason[] = [];

  for (const exp of resume.experience) {
    const text = `${exp.title} ${exp.company} ${exp.bullets.map((bullet) => bullet.text).join(' ')}`;
    const matched = scoreKeywordCoverage(text, keywords);

    reasons.push({
      itemId: exp.id,
      itemType: 'experience',
      reasonLabel: matched.length >= 5 ? 'high keyword overlap' : matched.length >= 2 ? 'role-aligned experience' : 'transferable experience',
      explanation: matched.length > 0
        ? `Selected because it covers ${matched.slice(0, 5).join(', ')} and maps directly to the JD scope.`
        : 'Selected for transferable responsibilities despite lower direct keyword overlap.',
    });
  }

  for (const proj of resume.projects) {
    const text = `${proj.title} ${proj.bullets.map((bullet) => bullet.text).join(' ')}`;
    const matched = scoreKeywordCoverage(text, keywords);

    reasons.push({
      itemId: proj.id,
      itemType: 'project',
      reasonLabel: matched.length >= 4 ? 'high keyword overlap' : 'project relevance',
      explanation: matched.length > 0
        ? `Included to strengthen ATS keyword density for ${matched.slice(0, 5).join(', ')}.`
        : 'Included as adjacent, credible project evidence.',
    });
  }

  const flattenedSkills = resume.skills.flatMap((group) => group.skills);
  const matchedSkills = scoreKeywordCoverage(flattenedSkills.join(' '), keywords);
  reasons.push({
    itemId: 'skills',
    itemType: 'skill',
    reasonLabel: matchedSkills.length > 0 ? 'ATS-aligned skills' : 'adjacent transferable skills',
    explanation: matchedSkills.length > 0
      ? `Skills section includes ${matchedSkills.slice(0, 8).join(', ')} for ATS coverage.`
      : 'Skills were retained for transferable relevance.',
  });

  return reasons;
}

function buildAnalysis(
  resume: TailoredResume,
  jdAnalysis: JobDescriptionAnalysis,
  itemReasons: ItemReason[],
  riskyUnsupportedAdditions: GenerationAnalysis['riskyUnsupportedAdditions'],
): GenerationAnalysis {
  const allKeywords = uniq([
    ...jdAnalysis.atsKeywords.map((item) => item.keyword),
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
  ]);

  const textBlob = [
    resume.education.map((item) => `${item.school} ${item.degree} ${item.coursework?.join(' ') || ''}`).join(' '),
    resume.experience.map((item) => `${item.title} ${item.company} ${item.bullets.map((bullet) => bullet.text).join(' ')}`).join(' '),
    resume.projects.map((item) => `${item.title} ${item.bullets.map((bullet) => bullet.text).join(' ')}`).join(' '),
    resume.skills.map((group) => `${group.label} ${group.skills.join(' ')}`).join(' '),
  ].join(' ');

  const present = scoreKeywordCoverage(textBlob, allKeywords);
  const missing = allKeywords.filter((keyword) => !present.includes(keyword)).slice(0, 20);

  const score = allKeywords.length === 0
    ? 0
    : Math.round((present.length / allKeywords.length) * 100);

  return {
    atsMatchScore: score,
    exactKeywordsPresent: present,
    importantKeywordsMissing: missing,
    inferredSynonymsAdded: jdAnalysis.inferredSynonyms.filter((synonym) => textBlob.toLowerCase().includes(synonym.toLowerCase())),
    missingQualifications: jdAnalysis.missingQualifications,
    riskyUnsupportedAdditions,
    itemReasons,
  };
}

export function renderResumePreviewHtml(resume: TailoredResume): string {
  const educationHtml = resume.education.map((item) => {
    const coursework = item.coursework && item.coursework.length > 0
      ? `<li>Relevant Coursework: ${escapeHtml(item.coursework.join(', '))}</li>`
      : '';

    const gpa = item.gpa ? `<li>GPA: ${escapeHtml(item.gpa)}</li>` : '';

    return `
      <article class="entry">
        <div class="entry-row">
          <h3>${escapeHtml(item.school)}</h3>
          <span class="date">${escapeHtml(item.location)}</span>
        </div>
        <div class="entry-row sub">
          <p>${escapeHtml(item.degree)}</p>
          <span class="date">${escapeHtml(item.graduationDate)}</span>
        </div>
        <ul>${gpa}${coursework}</ul>
      </article>
    `;
  }).join('');

  const experienceHtml = resume.experience.map((item) => `
    <article class="entry">
      <div class="entry-row">
        <h3>${escapeHtml(item.company)}</h3>
        <span class="date">${escapeHtml(item.location)}</span>
      </div>
      <div class="entry-row sub">
        <p>${escapeHtml(item.title)}</p>
        <span class="date">${escapeHtml(item.date)}</span>
      </div>
      <ul>
        ${item.bullets.map((bullet) => `<li>${escapeHtml(bullet.text)}</li>`).join('')}
      </ul>
    </article>
  `).join('');

  const projectsHtml = resume.projects.map((item) => {
    const companySuffix = item.company ? ` | ${item.company}` : '';
    return `
      <article class="entry">
        <div class="entry-row sub">
          <p><strong>${escapeHtml(item.title)}</strong> | ${escapeHtml(item.role)}${escapeHtml(companySuffix)}</p>
          <span class="date">${escapeHtml(item.date)}</span>
        </div>
        <ul>
          ${item.bullets.map((bullet) => `<li>${escapeHtml(bullet.text)}</li>`).join('')}
        </ul>
      </article>
    `;
  }).join('');

  const skillsHtml = resume.skills
    .map((group) => `<p><strong>${escapeHtml(group.label)}:</strong> ${escapeHtml(group.skills.join(', '))}</p>`)
    .join('');

  const links = resume.basics.links
    .map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`)
    .join(' | ');

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      @page { size: Letter; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body {
        width: 8.5in;
        min-height: 11in;
        font-family: 'Times New Roman', Times, serif;
        color: #000;
      }
      .page {
        box-sizing: border-box;
        width: 8.5in;
        height: 11in;
        padding: 0.58in 0.74in 0.56in;
        overflow: hidden;
      }
      h1 {
        font-size: 22px;
        margin: 0;
        text-align: center;
        font-weight: 500;
      }
      .basics {
        text-align: center;
        font-size: 11px;
        margin-top: 4px;
      }
      .section-title {
        font-size: 12px;
        font-weight: 700;
        margin: 11px 0 4px;
        letter-spacing: 0.06em;
        border-bottom: 1px solid #000;
      }
      .entry { margin: 0 0 6px; }
      .entry-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
      }
      .entry-row h3,
      .entry-row p {
        margin: 0;
        font-size: 11px;
        line-height: 1.2;
      }
      .entry-row.sub p {
        font-style: italic;
      }
      .date {
        font-size: 11px;
        white-space: nowrap;
      }
      ul {
        margin: 2px 0 0 16px;
        padding: 0;
      }
      li {
        font-size: 10.5px;
        line-height: 1.18;
        margin: 0 0 2px;
      }
      #skills p {
        margin: 0 0 3px;
        font-size: 10.5px;
        line-height: 1.18;
      }
      a { color: inherit; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="page">
      <header>
        <h1>${escapeHtml(resume.basics.name)}</h1>
        <div class="basics">${escapeHtml(resume.basics.location)} | ${escapeHtml(resume.basics.email)}${resume.basics.phone ? ` | ${escapeHtml(resume.basics.phone)}` : ''}</div>
        <div class="basics">${links}</div>
      </header>

      <section id="education">
        <h2 class="section-title">EDUCATION</h2>
        ${educationHtml}
      </section>

      <section id="experience">
        <h2 class="section-title">EXPERIENCE</h2>
        ${experienceHtml}
      </section>

      <section id="projects">
        <h2 class="section-title">PROJECTS</h2>
        ${projectsHtml}
      </section>

      <section id="skills">
        <h2 class="section-title">SKILLS</h2>
        ${skillsHtml}
      </section>
    </div>
  </body>
</html>
  `;
}

function ensureImmutableFields(mergedProfile: MergedProfile, resume: TailoredResume): TailoredResume {
  const safeEducation = resume.education.map((item, index) => {
    const source = mergedProfile.education[index] || item;
    const gradYearMatch = String(source.graduationDate || '').match(/(20\d{2})/);
    if (gradYearMatch) {
      const year = Number(gradYearMatch[1]);
      if (year > 2029) {
        source.graduationDate = source.graduationDate.replace(String(year), '2029');
      }
    }

    return {
      ...item,
      school: source.school,
      degree: source.degree,
      gpa: source.gpa,
      graduationDate: source.graduationDate,
      location: source.location,
    };
  });

  const safeExperience = resume.experience.map((item) => {
    const source = mergedProfile.experience.find((exp) => exp.id === item.id);
    if (!source) return item;

    return {
      ...item,
      title: source.title,
      company: source.company,
      date: source.date,
      location: source.location,
    };
  });

  return {
    ...resume,
    basics: {
      ...resume.basics,
      name: mergedProfile.basics.name,
      email: mergedProfile.basics.email,
      phone: mergedProfile.basics.phone,
      links: mergedProfile.basics.links,
    },
    education: safeEducation,
    experience: safeExperience,
  };
}

export async function generateTailoredPreview(
  mergedProfile: MergedProfile,
  selectionState: SelectionState,
  jdAnalysis: JobDescriptionAnalysis,
): Promise<GeneratePreviewResponse> {
  const selectedExperiences = mergedProfile.experience
    .filter((item) => selectionState.selectedExperienceIds.includes(item.id))
    .slice(0, 4)
    .map<TailoredExperienceItem>((item) => ({
      id: item.id,
      title: item.title,
      company: item.company,
      location: item.location,
      date: item.date,
      bullets: (item.bullets || [item.summary]).map<TailoredBullet>((bullet) => ({
        text: bullet,
        provenance: item.provenance,
        support: supportFromSource(item.provenance.source),
      })),
      technologies: item.technologies,
      provenance: item.provenance,
    }));

  const selectedProjects = mergedProfile.projects
    .filter((item) => selectionState.selectedProjectIds.includes(item.id))
    .slice(0, 3)
    .map<TailoredProjectItem>((item) => ({
      id: item.id,
      title: item.title,
      role: item.role,
      company: item.company,
      date: item.date,
      bullets: (item.bullets || [item.summary]).map<TailoredBullet>((bullet) => ({
        text: bullet,
        provenance: item.provenance,
        support: supportFromSource(item.provenance.source),
      })),
      technologies: item.technologies,
      githubUrl: item.githubUrl,
      provenance: item.provenance,
    }));

  const selectedSkills = mergedProfile.skills.map((group) => ({
    ...group,
    skills: group.skills.filter((skill) => {
      return selectionState.selectedSkillNames.includes(skill)
        || group.skills.length <= 5;
    }),
  })).filter((group) => group.skills.length > 0);

  const keywordFocus = uniq([
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
    ...jdAnalysis.atsKeywords.map((item) => item.keyword),
    ...jdAnalysis.inferredSynonyms,
  ]).slice(0, 20);

  let riskyUnsupportedAdditions: GenerationAnalysis['riskyUnsupportedAdditions'] = [];

  try {
    const rewritten = await rewriteSelectedBullets(
      selectedExperiences,
      selectedProjects,
      jdAnalysis,
      selectionState.aggressiveness,
    );

    riskyUnsupportedAdditions = rewritten.riskyUnsupportedAdditions;

    for (const exp of selectedExperiences) {
      const rewrite = rewritten.experiences.find((item) => item.id === exp.id);
      if (!rewrite) continue;

      exp.bullets = rewrite.bullets.slice(0, 4).map((bullet) => ({
        text: bullet,
        provenance: {
          source: exp.provenance.source,
          confidence: Math.max(0.6, exp.provenance.confidence - 0.1),
          note: 'LLM rewritten for ATS alignment',
        },
        support: exp.bullets[0]?.support || 'website_only',
      }));
    }

    for (const project of selectedProjects) {
      const rewrite = rewritten.projects.find((item) => item.id === project.id);
      if (!rewrite) continue;

      project.bullets = rewrite.bullets.slice(0, 3).map((bullet) => ({
        text: bullet,
        provenance: {
          source: project.provenance.source,
          confidence: Math.max(0.6, project.provenance.confidence - 0.1),
          note: 'LLM rewritten for ATS alignment',
        },
        support: project.bullets[0]?.support || 'website_only',
      }));
    }
  } catch {
    for (const exp of selectedExperiences) {
      exp.bullets = manualRewrite(
        exp.bullets.map((bullet) => bullet.text),
        keywordFocus,
        selectionState.aggressiveness,
      ).map((text) => ({
        text,
        provenance: exp.provenance,
        support: exp.bullets[0]?.support || 'website_only',
      }));
    }

    for (const project of selectedProjects) {
      project.bullets = manualRewrite(
        project.bullets.map((bullet) => bullet.text),
        keywordFocus,
        selectionState.aggressiveness,
      ).map((text) => ({
        text,
        provenance: project.provenance,
        support: project.bullets[0]?.support || 'website_only',
      }));
    }
  }

  let tailoredResume: TailoredResume = {
    basics: mergedProfile.basics,
    education: mergedProfile.education,
    experience: selectedExperiences,
    projects: selectedProjects,
    skills: selectedSkills,
  };

  tailoredResume = ensureImmutableFields(mergedProfile, tailoredResume);
  tailoredResume = enforceOnePageBudget(tailoredResume, selectionState.aggressiveness);

  const reasons = buildReasons(tailoredResume, jdAnalysis);
  const analysis = buildAnalysis(tailoredResume, jdAnalysis, reasons, riskyUnsupportedAdditions);

  return {
    tailoredResume,
    generationAnalysis: analysis,
    previewHtml: renderResumePreviewHtml(tailoredResume),
  };
}
