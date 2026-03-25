import { z } from 'zod';
import { completeJsonWithMeta, getConfiguredLLM } from '@/lib/resume-advisor/groq';
import {
  AggressivenessMode,
  EvidenceMap,
  GenerationAnalysis,
  GeneratePreviewResponse,
  ItemReason,
  JobDescriptionAnalysis,
  LLMConfig,
  LLMUsage,
  MergedProfile,
  SelectionState,
  StyleProfile,
  TailoredBullet,
  TailoredExperienceItem,
  TailoredProjectItem,
  TailoredResume,
} from '@/lib/resume-advisor/types';
import { tokenize, uniq } from '@/lib/resume-advisor/pipeline/text';
import { buildJDContextPacket } from '@/lib/resume-advisor/pipeline/context-packets';

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

const MAX_SELECTED_EXPERIENCE = 3;
const MAX_SELECTED_PROJECTS = 3;
const MAX_SELECTED_TOTAL = 5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function dedupeOrdered(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    const key = normalizeWhitespace(value).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(normalizeWhitespace(value));
  }

  return out;
}

function bulletLengthTarget(mode: AggressivenessMode, styleProfile: StyleProfile | null): { target: number; min: number; max: number } {
  const profileTarget = styleProfile?.averageBulletLength;

  const defaultTarget = mode === 'aggressive_ats'
    ? 180
    : mode === 'conservative'
      ? 145
      : 165;

  const target = clamp(profileTarget || defaultTarget, 115, 220);
  return {
    target,
    min: clamp(Math.round(target * 0.7), 85, 170),
    max: clamp(Math.round(target * 1.15), 130, 240),
  };
}

function truncateBullet(bullet: string, maxChars: number): string {
  if (bullet.length <= maxChars) {
    return bullet;
  }
  const slice = bullet.slice(0, maxChars);
  const lastPeriod = slice.lastIndexOf('.');
  const lastSpace = slice.lastIndexOf(' ');
  if (lastPeriod > maxChars * 0.4) {
    return slice.slice(0, lastPeriod + 1).trim();
  }
  if (lastSpace > maxChars * 0.5) {
    return slice.slice(0, lastSpace).trim();
  }
  return `${slice.trimEnd()}…`;
}

function sanitizeBulletText(
  bullet: string,
  context: { title?: string; company?: string; role?: string },
  maxChars: number,
): string {
  let text = normalizeWhitespace(bullet.replace(/^[-*•]\s*/, ''));
  if (!text) return '';

  const titleParts = [context.title, context.company, context.role]
    .filter(Boolean)
    .map((part) => normalizeWhitespace(String(part)))
    .filter((part) => part.length >= 3);

  for (const part of titleParts) {
    const prefixPattern = new RegExp(`^${escapeRegExp(part)}\\s*[:|\\-]\\s*`, 'i');
    text = text.replace(prefixPattern, '');
  }

  text = text.replace(/\b(\w+)(\s+\1\b){1,}/gi, '$1');
  text = normalizeWhitespace(text);

  if (/^i\s+/i.test(text)) {
    text = text.replace(/^i\s+/i, '');
  }

  if (!/[.!?]$/.test(text)) {
    text = `${text}.`;
  }

  return truncateBullet(text, maxChars);
}

function cleanBulletCollection(
  bullets: string[],
  context: { title?: string; company?: string; role?: string },
  maxChars: number,
): string[] {
  const cleaned = dedupeOrdered(
    bullets
      .map((bullet) => sanitizeBulletText(bullet, context, maxChars))
      .filter((bullet) => bullet.length > 0),
  );

  return cleaned;
}

function maxCharsForMode(mode: AggressivenessMode, styleProfile: StyleProfile | null): number {
  const target = bulletLengthTarget(mode, styleProfile).target;

  if (mode === 'conservative') {
    return clamp(target, 140, 185);
  }

  if (mode === 'aggressive_ats') {
    return clamp(target + 15, 165, 230);
  }

  return clamp(target + 10, 155, 215);
}

function enforceOnePageBudget(resume: TailoredResume, mode: AggressivenessMode, styleProfile: StyleProfile | null): TailoredResume {
  // These caps are the primary one-page control knobs for PDF fidelity.
  const maxChars = maxCharsForMode(mode, styleProfile);
  const totalItems = resume.experience.length + resume.projects.length;
  const denseLayout = totalItems <= MAX_SELECTED_TOTAL;
  const maxExperienceBullets = denseLayout
    ? (mode === 'conservative' ? 3 : 4)
    : (mode === 'aggressive_ats' ? 4 : 3);
  const maxProjectBullets = denseLayout
    ? (mode === 'conservative' ? 2 : 3)
    : (mode === 'aggressive_ats' ? 3 : 2);

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
  const maxChars = maxCharsForMode(mode, null);
  const selectedKeywords = keywords.slice(0, mode === 'aggressive_ats' ? 3 : 2);

  return bullets.slice(0, mode === 'aggressive_ats' ? 4 : 3).map((bullet, index) => {
    const base = sanitizeBulletText(bullet, {}, maxChars);
    const keyword = selectedKeywords[index % Math.max(1, selectedKeywords.length)] || '';
    if (!keyword) {
      return base;
    }

    if (base.toLowerCase().includes(keyword.toLowerCase())) {
      return base;
    }

    if (mode === 'conservative') {
      return sanitizeBulletText(`${base.replace(/[.]$/, '')} (${keyword}).`, {}, maxChars);
    }

    return sanitizeBulletText(`${base.replace(/[.]$/, '')} using ${keyword}.`, {}, maxChars);
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

const BULLET_REWRITER_SYSTEM = `You are a recruiter-aware resume bullet optimizer. Rewrite only the selected experience and project bullets.

Critical rules:
- Every bullet MUST be a complete sentence. Start with a strong verb, end with a period. Never truncate, cut off, or leave a sentence unfinished. If space is limited, rewrite the full thought in fewer words rather than stopping mid-sentence.
- Preserve immutable facts: employer, school, title, GPA, links, dates. Do not change them.
- Preserve plausibility and chronology. Do not invent experiences or impossible claims.
- Incorporate high-value JD terms naturally; avoid keyword stuffing.
- Follow the candidate's style profile when provided (bullet length, tense, tone).
- Enforce proven resume bullet structure quality:
  1) Action + context/scope + measurable result whenever possible.
  2) Use quantification when supported (percent, latency, throughput, cost, users, revenue, defects, cycle time).
  3) Keep each bullet in an ATS-readable 1-2 line equivalent range and avoid filler.
  4) Use past tense for completed work and avoid first-person pronouns.
  5) Avoid duplicate or repeated phrases, especially repeating project/job titles inside bullets.
- For each selected experience/project item, produce high-detail bullets (target 3-4 bullets per item unless source content is sparse).
- Return strict JSON only. Output shape: { experiences: [{ id, bullets: string[] }], projects: [{ id, bullets: string[] }], riskyUnsupportedAdditions: [{ text, reason }] }.
- In riskyUnsupportedAdditions list any phrase you added that is not directly supported by the original bullet or profile.`;

async function rewriteSelectedBullets(
  experience: TailoredExperienceItem[],
  projects: TailoredProjectItem[],
  jdAnalysis: JobDescriptionAnalysis,
  aggressiveness: AggressivenessMode,
  styleProfile: StyleProfile | null,
  jdPacket: ReturnType<typeof buildJDContextPacket>,
  llmConfig?: LLMConfig | null,
): Promise<{ rewritten: z.infer<typeof rewriteSchema>; llmUsage: LLMUsage }> {
  const keywordFocus = uniq([
    ...(jdAnalysis.topAtsTerms || jdAnalysis.atsKeywords.map((item) => item.keyword)),
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
    ...jdAnalysis.inferredSynonyms,
  ]).filter((k) => k.length >= 2).slice(0, 28);

  const aggressivenessLabel = aggressiveness === 'aggressive_ats'
    ? 'Aggressive ATS (high keyword saturation, still plausible).'
    : aggressiveness === 'conservative'
      ? 'Conservative (minimal reframing).'
      : 'Balanced (strategic but plausible).';

  const bulletGuide = bulletLengthTarget(aggressiveness, styleProfile);

  const user = JSON.stringify({
    aggressiveness: aggressivenessLabel,
    keywordFocus,
    jdRole: jdPacket.role,
    topAtsTerms: jdPacket.topAtsTerms.slice(0, 20),
    styleHints: styleProfile ? {
      averageBulletLength: styleProfile.averageBulletLength,
      tense: styleProfile.tenseUsage,
      tone: styleProfile.tone,
    } : undefined,
    bulletLengthGuide: {
      targetChars: bulletGuide.target,
      minChars: bulletGuide.min,
      maxChars: bulletGuide.max,
      lineGuidance: 'Approximate one to two lines in resume layout.',
    },
    experience: experience.map((e) => ({
      id: e.id,
      title: e.title,
      company: e.company,
      source: e.provenance.source,
      technologies: e.technologies,
      bullets: e.bullets.map((b) => b.text),
    })),
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      role: p.role,
      company: p.company,
      source: p.provenance.source,
      technologies: p.technologies,
      bullets: p.bullets.map((b) => b.text),
    })),
    outputShape: {
      experiences: [{ id: 'string', bullets: ['string'] }],
      projects: [{ id: 'string', bullets: ['string'] }],
      riskyUnsupportedAdditions: [{ text: 'string', reason: 'string' }],
    },
    reminder: 'Each bullet must be a complete sentence, avoid title repetition, preserve detail, and end with a period.',
  });

  const { data, meta } = await completeJsonWithMeta<z.infer<typeof rewriteSchema>>({
    system: BULLET_REWRITER_SYSTEM,
    user,
    temperature: 0.3,
    maxTokens: 2400,
  }, llmConfig);

  return {
    rewritten: rewriteSchema.parse(data),
    llmUsage: {
      provider: meta.provider,
      model: meta.model,
      stage: 'bulletRewrite',
      source: 'llm',
    },
  };
}

function buildReasons(
  resume: TailoredResume,
  jdAnalysis: JobDescriptionAnalysis,
  evidenceMap: EvidenceMap | undefined,
): ItemReason[] {
  const keywords = uniq([
    ...(jdAnalysis.topAtsTerms || jdAnalysis.atsKeywords.map((item) => item.keyword)),
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
  ]).filter((k) => k.length >= 2);

  const byItem = evidenceMap ? new Map(evidenceMap.itemEvidence.map((ie) => [ie.itemId, ie])) : undefined;

  const reasons: ItemReason[] = [];

  for (const exp of resume.experience) {
    const ev = byItem?.get(exp.id);
    const text = `${exp.title} ${exp.company} ${exp.bullets.map((b) => b.text).join(' ')}`;
    const matched = scoreKeywordCoverage(text, keywords);
    const matchList = ev ? [...ev.matchedRequiredSkills, ...ev.matchedPreferredSkills] : matched;
    const sourceNote = exp.provenance.source === 'uploaded_resume'
      ? 'directly supported by uploaded resume'
      : exp.provenance.source === 'manual_input'
        ? 'supported by manual resume context'
        : 'supported by website profile';
    const topMatches = matchList.slice(0, 3);

    reasons.push({
      itemId: exp.id,
      itemType: 'experience',
      reasonLabel: (matchList.length >= 4 ? 'high overlap' : matchList.length >= 2 ? 'role-aligned' : 'transferable'),
      explanation: topMatches.length > 0
        ? `${sourceNote}; matches ${topMatches.join(', ')}; selected for role-fit and one-page detail density.`
        : `${sourceNote}; selected as adjacent transferable evidence for the target role.`,
    });
  }

  for (const proj of resume.projects) {
    const ev = byItem?.get(proj.id);
    const text = `${proj.title} ${proj.bullets.map((b) => b.text).join(' ')}`;
    const matched = scoreKeywordCoverage(text, keywords);
    const matchList = ev ? [...ev.matchedRequiredSkills, ...ev.matchedPreferredSkills] : matched;
    const sourceNote = proj.provenance.source === 'uploaded_resume'
      ? 'directly supported by uploaded resume'
      : proj.provenance.source === 'manual_input'
        ? 'supported by manual resume context'
        : 'supported by website profile';
    const topMatches = matchList.slice(0, 3);

    reasons.push({
      itemId: proj.id,
      itemType: 'project',
      reasonLabel: matchList.length >= 3 ? 'high overlap' : 'relevant',
      explanation: topMatches.length > 0
        ? `${sourceNote}; matches ${topMatches.join(', ')}; selected to strengthen direct JD keyword coverage.`
        : `${sourceNote}; selected as high-signal project context for transferable requirements.`,
    });
  }

  const flattenedSkills = resume.skills.flatMap((group) => group.skills);
  const matchedSkills = scoreKeywordCoverage(flattenedSkills.join(' '), keywords);
  reasons.push({
    itemId: 'skills',
    itemType: 'skill',
    reasonLabel: matchedSkills.length > 0 ? 'ATS-aligned' : 'transferable',
    explanation: matchedSkills.length > 0 ? `Include: ${matchedSkills.slice(0, 4).join(', ')}` : 'Supporting',
  });

  return reasons;
}

function buildAnalysis(
  resume: TailoredResume,
  jdAnalysis: JobDescriptionAnalysis,
  itemReasons: ItemReason[],
  riskyUnsupportedAdditions: GenerationAnalysis['riskyUnsupportedAdditions'],
  evidenceMap: EvidenceMap | undefined,
): GenerationAnalysis {
  const allKeywords = uniq([
    ...(jdAnalysis.topAtsTerms || jdAnalysis.atsKeywords.map((item) => item.keyword)),
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
  ]).filter((k) => k.length >= 2);

  const textBlob = [
    resume.education.map((item) => `${item.school} ${item.degree} ${item.coursework?.join(' ') || ''}`).join(' '),
    resume.experience.map((item) => `${item.title} ${item.company} ${item.bullets.map((b) => b.text).join(' ')}`).join(' '),
    resume.projects.map((item) => `${item.title} ${item.bullets.map((b) => b.text).join(' ')}`).join(' '),
    resume.skills.map((group) => `${group.label} ${group.skills.join(' ')}`).join(' '),
  ].join(' ');

  const present = scoreKeywordCoverage(textBlob, allKeywords);
  const missing = allKeywords.filter((keyword) => !present.includes(keyword)).slice(0, 25);

  const score = allKeywords.length === 0
    ? 0
    : Math.round((present.length / allKeywords.length) * 100);

  const mustHaveList = jdAnalysis.mustHaveSkills.filter((k) => k.length >= 2);
  const preferredList = jdAnalysis.preferredSkills.filter((k) => k.length >= 2);
  const mustHavePresent = scoreKeywordCoverage(textBlob, mustHaveList);
  const preferredPresent = scoreKeywordCoverage(textBlob, preferredList);
  const mustHaveCoverage = mustHaveList.length === 0 ? 100 : Math.round((mustHavePresent.length / mustHaveList.length) * 100);
  const preferredCoverage = preferredList.length === 0 ? 100 : Math.round((preferredPresent.length / preferredList.length) * 100);

  return {
    atsMatchScore: score,
    mustHaveCoverage,
    preferredCoverage,
    exactKeywordsPresent: present,
    importantKeywordsMissing: missing,
    inferredSynonymsAdded: jdAnalysis.inferredSynonyms.filter((synonym) => textBlob.toLowerCase().includes(synonym.toLowerCase())),
    missingQualifications: jdAnalysis.missingQualifications,
    riskyUnsupportedAdditions,
    itemReasons,
  };
}

function dedupeHeaderSegments(segments: Array<string | undefined>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const segment of segments) {
    const clean = normalizeWhitespace(segment || '');
    if (!clean) continue;
    const normalized = clean.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(clean);
  }

  return out;
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
    const headerSegments = dedupeHeaderSegments([item.title, item.role, item.company]);
    return `
      <article class="entry">
        <div class="entry-row sub">
          <p><strong>${escapeHtml(headerSegments[0] || item.title)}</strong>${headerSegments.slice(1).map((part) => ` | ${escapeHtml(part)}`).join('')}</p>
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

function enforceSelectionCaps(
  selectionState: SelectionState,
  mergedProfile: MergedProfile,
): { experienceIds: string[]; projectIds: string[] } {
  const experiencePool = mergedProfile.experience.map((item) => item.id);
  const projectPool = mergedProfile.projects.map((item) => item.id);

  const strictMix = experiencePool.length >= 2 && projectPool.length >= 2;
  const maxExp = strictMix ? MAX_SELECTED_EXPERIENCE : MAX_SELECTED_TOTAL;
  const maxProj = strictMix ? MAX_SELECTED_PROJECTS : MAX_SELECTED_TOTAL;

  const experienceIds = dedupeOrdered(selectionState.selectedExperienceIds)
    .filter((id) => experiencePool.includes(id))
    .slice(0, maxExp);

  const projectIds = dedupeOrdered(selectionState.selectedProjectIds)
    .filter((id) => projectPool.includes(id))
    .slice(0, maxProj);

  if (strictMix) {
    for (const id of experiencePool) {
      if (experienceIds.length >= 2) break;
      if (!experienceIds.includes(id)) experienceIds.push(id);
    }
    for (const id of projectPool) {
      if (projectIds.length >= 2) break;
      if (!projectIds.includes(id)) projectIds.push(id);
    }
  }

  while ((experienceIds.length + projectIds.length) > MAX_SELECTED_TOTAL) {
    if (experienceIds.length > projectIds.length && experienceIds.length > (strictMix ? 2 : 1)) {
      experienceIds.pop();
      continue;
    }
    if (projectIds.length > (strictMix ? 2 : 1)) {
      projectIds.pop();
      continue;
    }
    break;
  }

  const remaining = MAX_SELECTED_TOTAL - (experienceIds.length + projectIds.length);
  if (remaining > 0) {
    const candidates = [
      ...experiencePool.filter((id) => !experienceIds.includes(id)).map((id) => ({ id, type: 'experience' as const })),
      ...projectPool.filter((id) => !projectIds.includes(id)).map((id) => ({ id, type: 'project' as const })),
    ];

    for (const candidate of candidates) {
      if ((experienceIds.length + projectIds.length) >= MAX_SELECTED_TOTAL) break;
      if (candidate.type === 'experience' && experienceIds.length < maxExp) {
        experienceIds.push(candidate.id);
      }
      if (candidate.type === 'project' && projectIds.length < maxProj) {
        projectIds.push(candidate.id);
      }
    }
  }

  return { experienceIds, projectIds };
}

export async function generateTailoredPreview(
  mergedProfile: MergedProfile,
  selectionState: SelectionState,
  jdAnalysis: JobDescriptionAnalysis,
  options?: { styleProfile?: StyleProfile | null; evidenceMap?: EvidenceMap | null; llmConfig?: LLMConfig | null },
): Promise<GeneratePreviewResponse> {
  const configuredLLM = getConfiguredLLM(options?.llmConfig);
  const styleProfile = options?.styleProfile ?? null;
  const evidenceMap = options?.evidenceMap ?? null;
  const jdPacket = buildJDContextPacket(jdAnalysis);
  const cappedSelection = enforceSelectionCaps(selectionState, mergedProfile);

  const selectedExperiences = mergedProfile.experience
    .filter((item) => cappedSelection.experienceIds.includes(item.id))
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
    .filter((item) => cappedSelection.projectIds.includes(item.id))
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

  const selectedSkillSet = new Set(selectionState.selectedSkillNames.map((skill) => normalizeWhitespace(skill).toLowerCase()));

  let selectedSkills = mergedProfile.skills
    .map((group) => ({
      ...group,
      skills: group.skills.filter((skill) => selectedSkillSet.has(normalizeWhitespace(skill).toLowerCase())),
    }))
    .filter((group) => group.skills.length > 0);

  if (selectedSkills.length === 0) {
    selectedSkills = mergedProfile.skills
      .map((group) => ({ ...group, skills: group.skills.slice(0, 8) }))
      .filter((group) => group.skills.length > 0)
      .slice(0, 2);
  }

  const keywordFocus = uniq([
    ...(jdAnalysis.topAtsTerms || jdAnalysis.atsKeywords.map((item) => item.keyword)),
    ...jdAnalysis.mustHaveSkills,
    ...jdAnalysis.preferredSkills,
    ...jdAnalysis.inferredSynonyms,
  ]).filter((k) => k.length >= 2).slice(0, 24);

  let riskyUnsupportedAdditions: GenerationAnalysis['riskyUnsupportedAdditions'] = [];
  let bulletRewriteUsage: LLMUsage = {
    provider: configuredLLM.provider,
    model: configuredLLM.model,
    stage: 'bulletRewrite',
    source: 'fallback',
    note: 'Heuristic bullet rewriting was used because LLM rewrite was unavailable.',
  };

  const maxBulletChars = maxCharsForMode(selectionState.aggressiveness, styleProfile);
  const minExperienceBullets = selectionState.aggressiveness === 'conservative' ? 2 : 3;
  const minProjectBullets = selectionState.aggressiveness === 'conservative' ? 2 : 3;

  try {
    const rewrittenResult = await rewriteSelectedBullets(
      selectedExperiences,
      selectedProjects,
      jdAnalysis,
      selectionState.aggressiveness,
      styleProfile,
      jdPacket,
      options?.llmConfig,
    );
    const rewritten = rewrittenResult.rewritten;
    bulletRewriteUsage = rewrittenResult.llmUsage;

    riskyUnsupportedAdditions = rewritten.riskyUnsupportedAdditions;

    for (const exp of selectedExperiences) {
      const rewrite = rewritten.experiences.find((item) => item.id === exp.id);
      const support = exp.bullets[0]?.support || 'website_only';
      const originalTexts = exp.bullets.map((bullet) => bullet.text);
      const rewrittenTexts = rewrite?.bullets || [];
      const cleaned = cleanBulletCollection(
        [...rewrittenTexts, ...originalTexts],
        { title: exp.title, company: exp.company },
        maxBulletChars,
      );
      const finalTexts = cleaned.slice(0, 4);

      while (finalTexts.length < minExperienceBullets && originalTexts.length > finalTexts.length) {
        const candidate = sanitizeBulletText(
          originalTexts[finalTexts.length],
          { title: exp.title, company: exp.company },
          maxBulletChars,
        );
        if (candidate && !finalTexts.includes(candidate)) {
          finalTexts.push(candidate);
        } else {
          break;
        }
      }

      exp.bullets = finalTexts.map((bullet) => {
        const matched = scoreKeywordCoverage(bullet, keywordFocus);
        const riskLevel = matched.length >= 3 ? 'low' : matched.length >= 1 ? 'medium' : 'high';
        return {
          text: bullet,
          provenance: {
            source: exp.provenance.source,
            confidence: Math.max(0.6, exp.provenance.confidence - 0.1),
            note: 'LLM rewritten for ATS alignment',
          },
          support,
          metadata: {
            matchedKeywords: matched.slice(0, 8),
            sourceSupport: support,
            riskLevel: riskLevel as 'low' | 'medium' | 'high',
            evidenceNotes: matched.length > 0 ? `Matches: ${matched.slice(0, 4).join(', ')}` : undefined,
          },
        };
      });
    }

    for (const project of selectedProjects) {
      const rewrite = rewritten.projects.find((item) => item.id === project.id);
      const support = project.bullets[0]?.support || 'website_only';
      const originalTexts = project.bullets.map((bullet) => bullet.text);
      const rewrittenTexts = rewrite?.bullets || [];
      const cleaned = cleanBulletCollection(
        [...rewrittenTexts, ...originalTexts],
        { title: project.title, company: project.company, role: project.role },
        maxBulletChars,
      );
      const finalTexts = cleaned.slice(0, 3);

      while (finalTexts.length < minProjectBullets && originalTexts.length > finalTexts.length) {
        const candidate = sanitizeBulletText(
          originalTexts[finalTexts.length],
          { title: project.title, company: project.company, role: project.role },
          maxBulletChars,
        );
        if (candidate && !finalTexts.includes(candidate)) {
          finalTexts.push(candidate);
        } else {
          break;
        }
      }

      project.bullets = finalTexts.map((bullet) => {
        const matched = scoreKeywordCoverage(bullet, keywordFocus);
        const riskLevel = matched.length >= 2 ? 'low' : matched.length >= 1 ? 'medium' : 'high';
        return {
          text: bullet,
          provenance: {
            source: project.provenance.source,
            confidence: Math.max(0.6, project.provenance.confidence - 0.1),
            note: 'LLM rewritten for ATS alignment',
          },
          support,
          metadata: {
            matchedKeywords: matched.slice(0, 6),
            sourceSupport: support,
            riskLevel: riskLevel as 'low' | 'medium' | 'high',
            evidenceNotes: matched.length > 0 ? `Matches: ${matched.slice(0, 3).join(', ')}` : undefined,
          },
        };
      });
    }
  } catch {
    for (const exp of selectedExperiences) {
      const fallbackTexts = manualRewrite(
        exp.bullets.map((bullet) => bullet.text),
        keywordFocus,
        selectionState.aggressiveness,
      );
      const cleaned = cleanBulletCollection(
        fallbackTexts,
        { title: exp.title, company: exp.company },
        maxBulletChars,
      ).slice(0, 4);

      exp.bullets = cleaned.map((text) => ({
        text,
        provenance: exp.provenance,
        support: exp.bullets[0]?.support || 'website_only',
      }));
    }

    for (const project of selectedProjects) {
      const fallbackTexts = manualRewrite(
        project.bullets.map((bullet) => bullet.text),
        keywordFocus,
        selectionState.aggressiveness,
      );
      const cleaned = cleanBulletCollection(
        fallbackTexts,
        { title: project.title, company: project.company, role: project.role },
        maxBulletChars,
      ).slice(0, 3);

      project.bullets = cleaned.map((text) => ({
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
  tailoredResume = enforceOnePageBudget(tailoredResume, selectionState.aggressiveness, styleProfile);

  const reasons = buildReasons(tailoredResume, jdAnalysis, evidenceMap ?? undefined);
  const analysis = buildAnalysis(tailoredResume, jdAnalysis, reasons, riskyUnsupportedAdditions, evidenceMap ?? undefined);

  return {
    tailoredResume,
    generationAnalysis: analysis,
    previewHtml: renderResumePreviewHtml(tailoredResume),
    llmUsage: {
      bulletRewrite: bulletRewriteUsage,
    },
  };
}
