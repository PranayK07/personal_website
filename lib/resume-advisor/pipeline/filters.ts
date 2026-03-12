/**
 * Deterministic stopwords and junk filters for ATS keyword extraction.
 * Used to strip filler so only recruiter-significant terms remain.
 */

export const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 'in', 'is', 'it',
  'its', 'of', 'on', 'or', 'that', 'the', 'to', 'with', 'will', 'you', 'your', 'our', 'we', 'they',
  'this', 'these', 'those', 'was', 'were', 'been', 'being', 'would', 'could', 'should', 'can', 'may',
  'might', 'must', 'shall', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'which',
  'who', 'whom', 'what', 'how', 'why', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'also', 'able', 'ability', 'work', 'working', 'experience', 'team', 'teams', 'role', 'roles',
  'responsibilities', 'responsibility', 'requirements', 'skills', 'skill', 'years', 'year', 'strong',
  'preferred', 'plus', 'using', 'use', 'used', 'their', 'them', 'must', 'need', 'needs', 'required',
]);

/** Low-signal phrases that should not appear as top ATS keywords (may appear in soft_skills only). */
export const JUNK_PHRASES = new Set([
  'responsible for', 'ability to', 'strong communication', 'communication skills', 'team player',
  'self-starter', 'fast-paced', 'detail oriented', 'detail-oriented', 'hard working', 'hard-working',
  'think outside the box', 'synergy', 'leverage', 'utilize', 'various', 'etc', 'e.g', 'i.e',
]);

/** Single chars or punctuation-only tokens. */
export const isJunkToken = (s: string): boolean =>
  s.length <= 1 || /^[\s.,;:!?'"-]+$/.test(s) || /^\d+$/.test(s);

export function normalizeKeyword(value: string): string {
  const t = value.trim().toLowerCase().replace(/\s+/g, ' ');
  return t.length > 0 ? t : '';
}

export function isStopword(token: string): boolean {
  return STOPWORDS.has(normalizeKeyword(token));
}

export function isJunkPhrase(phrase: string): boolean {
  const n = normalizeKeyword(phrase);
  if (STOPWORDS.has(n)) return true;
  for (const junk of JUNK_PHRASES) {
    if (n === junk || n.includes(junk) || junk.includes(n)) return true;
  }
  return false;
}

/**
 * Filter a list of keyword strings: remove stopwords, junk phrases, duplicates, and normalize.
 * Dedupes by normalized form and keeps first occurrence.
 */
export function filterKeywordList(keywords: string[], options?: { minLength?: number }): string[] {
  const minLen = options?.minLength ?? 2;
  const seen = new Set<string>();
  const out: string[] = [];

  for (const k of keywords) {
    const n = normalizeKeyword(k);
    if (n.length < minLen) continue;
    if (isJunkToken(n) || isStopword(n) || isJunkPhrase(n)) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(k.trim());
  }

  return out;
}

/**
 * Filter ATS keyword objects: same as filterKeywordList but preserves category/inferred.
 */
export function filterATSKeywords<T extends { keyword: string }>(
  items: T[],
  options?: { minLength?: number },
): T[] {
  const minLen = options?.minLength ?? 2;
  const seen = new Set<string>();
  const out: T[] = [];

  for (const item of items) {
    const n = normalizeKeyword(item.keyword);
    if (n.length < minLen) continue;
    if (isJunkToken(n) || isStopword(n) || isJunkPhrase(n)) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(item);
  }

  return out;
}
