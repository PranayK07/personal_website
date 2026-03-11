# Resume Advisor (Internal)

## Purpose
This is a hidden admin-only mini-app inside the personal website for generating ATS-tailored one-page resumes.

It is intentionally not linked in public navigation and is designed for private owner use only.

## Access and Privacy
1. Set `RESUME_ADVISOR_ROUTE_SLUG` and `RESUME_ADVISOR_PASSWORD` in environment variables.
2. Open: `/internal/<RESUME_ADVISOR_ROUTE_SLUG>/resume-advisor`
3. Enter the password in the unlock prompt.
4. The tool sets an HttpOnly session cookie (no max age):
   - Refresh keeps you logged in.
   - Closing the browser ends the session.

## End-to-End Workflow
1. Paste a job description.
2. Click `Analyze JD`.
3. Optionally upload a resume PDF (recommended).
4. If parse confidence is low, use:
   - website-only mode, or
   - manual plaintext fallback (paste resume text and parse).
5. Click `Merge & Rank Recommendations`.
6. Review recommended experiences/projects/skills.
7. Override selections as needed.
8. Set aggressiveness mode.
9. Click `Preview (Regenerate)`.
10. Review:
   - analysis panel (ATS score, keyword coverage, gaps, risks, provenance),
   - one-page resume preview.
11. Export:
   - `Download PDF` (fidelity-first),
   - `Download DOCX` (editability-first).

## Aggressiveness Modes
- `Conservative`: minimal reframing, lower stretch.
- `Balanced` (default): strategic ATS alignment with plausibility.
- `Aggressive ATS`: stronger keyword optimization with higher stretch risk.

## Data Sources and Conflict Behavior
- Inputs:
  - shared website profile model,
  - optional uploaded resume parse,
  - pasted JD text.
- Merge precedence: `uploaded resume > website profile` when conflicts are detected.
- Conflicts are surfaced in the merge/rank panel.
- Immutable fact guards are enforced in generation for:
  - employer names,
  - school info,
  - job titles,
  - GPA,
  - links,
  - dates (except grad-date cap enforcement: never later than 2029).

## Local Persistence (IndexedDB)
Primary persistence is in browser IndexedDB:
- Session history
- JD text
- JD analysis
- Uploaded resume PDF blob
- Resume parse output
- Merge/rank output
- Selection state
- Generated preview state
- Exported PDF blob
- Exported DOCX blob

No server-side filesystem persistence is required.

## Analysis Panel Outputs
The analysis panel includes:
- ATS match score
- Exact JD keywords present
- Important JD keywords missing
- Inferred ATS synonyms added
- Missing qualifications
- Risky unsupported additions
- Why each selected item was included
- Provenance support legend:
  - `direct_resume`
  - `website_only`
  - `inferred`

## Export Architecture
- Canonical tailored resume JSON is the source of truth.
- PDF path: server-side Chromium (`puppeteer-core` + `@sparticuz/chromium`) from fixed Jake-style HTML template.
- DOCX path: direct JSON-to-DOCX (`docx`) for clean Word editability.
- No PDF-to-DOCX conversion is used.

## Required Environment Variables
- `GROQ_API_KEY` (existing LLM backend key)
- `RESUME_ADVISOR_ROUTE_SLUG`
- `RESUME_ADVISOR_PASSWORD`
- `RESUME_ADVISOR_SESSION_SECRET`
- Optional: `RESUME_ADVISOR_MODEL`

## Required Packages
- `zod`
- `idb`
- `pdfjs-dist`
- `docx`
- `puppeteer-core`
- `@sparticuz/chromium`

## Security Caveat
This is a lightweight owner-only gate, not enterprise authentication.
Do not treat it as strong security for sensitive multi-user/admin workloads.

## Troubleshooting
- `Unauthorized` from API routes:
  - session cookie is missing or expired (unlock again).
- Resume parse confidence low:
  - continue in website-only mode or use manual plaintext fallback.
- PDF export fails in local dev:
  - set `CHROMIUM_EXECUTABLE_PATH` to a local Chromium/Chrome binary.
- LLM failures:
  - verify `GROQ_API_KEY` and optional `RESUME_ADVISOR_MODEL`.
