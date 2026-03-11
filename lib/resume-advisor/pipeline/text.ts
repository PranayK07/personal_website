const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'you', 'your', 'our', 'are', 'was', 'were', 'have', 'has',
  'will', 'would', 'should', 'can', 'could', 'about', 'into', 'across', 'using', 'use', 'used', 'their', 'them',
  'must', 'preferred', 'plus', 'also', 'able', 'ability', 'work', 'working', 'experience', 'team', 'teams',
  'role', 'responsibilities', 'responsibility', 'requirements', 'skills', 'skill', 'years', 'year', 'strong',
]);

export function normalizeText(input: string): string {
  return input
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function tokenize(input: string): string[] {
  const clean = normalizeText(input).toLowerCase();
  return clean
    .split(/[^a-z0-9+.#/-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

export function extractTopTerms(text: string, limit = 30): string[] {
  const counts = new Map<string, number>();

  for (const token of tokenize(text)) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function uniq(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
