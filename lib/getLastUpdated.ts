const GITHUB_OWNER = 'PranayK07';
const GITHUB_REPO = 'personal_website';

// Hardcoded fallback — the date of the latest commit at build time.
// Update this if the live GitHub fetch is unavailable. (ISO from `git log -1 --format=%cI`)
const FALLBACK_ISO = '2026-03-26T13:42:57-04:00';

function formatLabel(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export type LastUpdated = {
  /** ISO timestamp for the semantic <time dateTime={...}> element. */
  iso: string;
  /** Human-friendly label, e.g. "Mar 26, 2026". */
  label: string;
};

/**
 * Resolves the last-updated date for the site.
 *
 * Prefers the latest commit date from the GitHub REST API (fetched server-side
 * with ISR caching so there are no client-side rate limits). Falls back to a
 * hardcoded date on any error or non-200 response.
 */
export async function getLastUpdated(): Promise<LastUpdated> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?per_page=1`,
      {
        next: { revalidate: 86400 },
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'personal-website',
        },
      },
    );

    if (!res.ok) {
      return { iso: FALLBACK_ISO, label: formatLabel(FALLBACK_ISO) };
    }

    const data = (await res.json()) as Array<{
      commit?: { committer?: { date?: string }; author?: { date?: string } };
    }>;

    const iso =
      data?.[0]?.commit?.committer?.date ?? data?.[0]?.commit?.author?.date;

    if (!iso) {
      return { iso: FALLBACK_ISO, label: formatLabel(FALLBACK_ISO) };
    }

    return { iso, label: formatLabel(iso) };
  } catch {
    return { iso: FALLBACK_ISO, label: formatLabel(FALLBACK_ISO) };
  }
}
