'use client';

import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  AggressivenessMode,
  GeneratePreviewResponse,
  JobDescriptionAnalysis,
  MergeRankResponse,
  ResumeParseResult,
  SelectionState,
} from '@/lib/resume-advisor/types';
import { extractTextFromPdf } from '@/lib/resume-advisor/pipeline/pdf-client';
import {
  AdvisorSessionRecord,
  getSession,
  listSessions,
  saveBlob,
  saveSession,
} from '@/lib/resume-advisor/storage';

interface ResumeAdvisorAppProps {
  initialAuthenticated: boolean;
}

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  completed: boolean;
  children: ReactNode;
}

const DEFAULT_AGGRESSIVENESS: AggressivenessMode = 'balanced';

const baseInputClass =
  'w-full rounded-2xl bg-white/5 px-5 py-4 text-base leading-relaxed text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-white/[0.07] min-h-[52px]';
const primaryButtonClass =
  'inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-7 py-4 text-base font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[52px] min-w-[120px]';
const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-2xl bg-white/10 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 min-h-[52px] min-w-[100px]';
const successButtonClass =
  'inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-7 py-4 text-base font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[52px] min-w-[120px]';

function shortId() {
  return Math.random().toString(36).slice(2, 9);
}

function nowIso() {
  return new Date().toISOString();
}

function defaultSession(): AdvisorSessionRecord {
  const id = `session-${Date.now()}-${shortId()}`;
  return {
    id,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    title: `Session ${new Date().toLocaleDateString()}`,
    jdText: '',
  };
}

function itemName(
  mergeRankResult: MergeRankResponse | null,
  itemType: 'experience' | 'project' | 'skill',
  id: string,
): string {
  if (!mergeRankResult) return id;

  if (itemType === 'experience') {
    const match = mergeRankResult.mergedProfile.experience.find((item) => item.id === id);
    return match ? `${match.title} @ ${match.company}` : id;
  }

  if (itemType === 'project') {
    const match = mergeRankResult.mergedProfile.projects.find((item) => item.id === id);
    return match ? `${match.title} (${match.role})` : id;
  }

  const match = mergeRankResult.mergedProfile.skills.find((item) => item.id === id);
  return match ? match.label : id;
}

function StepConnector({ completed }: { completed: boolean }) {
  return (
    <div className="flex min-h-[2rem] gap-6 md:gap-10" aria-hidden>
      <div className="flex w-14 shrink-0 flex-col items-center md:w-12">
        <div
          className={`w-px flex-1 min-h-[2rem] ${
            completed
              ? 'border-l-2 border-solid border-emerald-400/70'
              : 'border-l-2 border-dotted border-white/25'
          }`}
        />
      </div>
      <div className="min-w-0 flex-1" />
    </div>
  );
}

function StepCard({ stepNumber, title, description, completed, children }: StepCardProps) {
  return (
    <article className="relative flex gap-6 md:gap-10">
      {/* Left column: circle + line running below it (stays in number column, never behind content) */}
      <div className="relative z-10 flex w-14 shrink-0 flex-col items-center md:w-12">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold transition md:h-12 md:w-12 ${
            completed
              ? 'bg-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.4)]'
              : 'bg-white/10 text-white/90'
          }`}
        >
          {completed ? '✓' : stepNumber}
        </div>
        {/* Line segment from below circle to bottom of card – always in left column */}
        <div
          className={`mt-1 w-px flex-1 min-h-[1.5rem] ${
            completed
              ? 'border-l-2 border-solid border-emerald-400/70'
              : 'border-l-2 border-dotted border-white/25'
          }`}
        />
      </div>

      <div className="min-w-0 flex-1 rounded-3xl bg-black/20 p-8 shadow-[0_18px_45px_rgba(0,0,0,0.25)] backdrop-blur md:p-10">
        <header className="mb-10 space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-indigo-200/75">
            Step {stepNumber}
          </p>
          <h2 className="text-2xl font-semibold leading-tight text-white">{title}</h2>
          <p className="max-w-3xl text-base leading-relaxed text-white/70">{description}</p>
        </header>

        <div className="space-y-8">{children}</div>
      </div>
    </article>
  );
}

export default function ResumeAdvisorApp({ initialAuthenticated }: ResumeAdvisorAppProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [loading, setLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [sessions, setSessions] = useState<AdvisorSessionRecord[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [jdText, setJdText] = useState('');
  const [jdAnalysis, setJdAnalysis] = useState<JobDescriptionAnalysis | null>(null);

  const [manualResumeText, setManualResumeText] = useState('');
  const [resumeParseResult, setResumeParseResult] = useState<ResumeParseResult | null>(null);

  const [mergeRankResult, setMergeRankResult] = useState<MergeRankResponse | null>(null);
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);

  const [previewResult, setPreviewResult] = useState<GeneratePreviewResponse | null>(null);
  const [exportedState, setExportedState] = useState<{ pdf: boolean; docx: boolean }>({
    pdf: false,
    docx: false,
  });

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) || null,
    [sessions, activeSessionId],
  );

  const step1Complete = jdText.trim().length > 0;
  const step2Complete = Boolean(jdAnalysis);
  const step3Complete = Boolean(resumeParseResult);
  const step4Complete = Boolean(mergeRankResult && selectionState);
  const step5Complete = Boolean(previewResult);
  const step6Complete = Boolean(previewResult && (exportedState.pdf || exportedState.docx));

  async function refreshSessions() {
    const all = await listSessions();
    setSessions(all);

    if (!activeSessionId && all.length > 0) {
      setActiveSessionId(all[0].id);
    }
  }

  async function persistCurrentSession(partial: Partial<AdvisorSessionRecord>) {
    if (!activeSessionId) return;

    const existing = await getSession(activeSessionId);
    if (!existing) return;

    const updated: AdvisorSessionRecord = {
      ...existing,
      ...partial,
      updatedAt: nowIso(),
    };

    await saveSession(updated);
    await refreshSessions();
  }

  useEffect(() => {
    const bootstrap = async () => {
      const existing = await listSessions();

      if (existing.length === 0) {
        const session = defaultSession();
        await saveSession(session);
      }

      await refreshSessions();
    };

    bootstrap().catch((error) => {
      console.error('Failed to initialize sessions', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeSession) return;

    setJdText(activeSession.jdText || '');
    setJdAnalysis(activeSession.jdAnalysis || null);
    setResumeParseResult(activeSession.resumeParseResult || null);
    setMergeRankResult(activeSession.mergeRankResult || null);
    setSelectionState(activeSession.mergeRankResult?.selectionState || null);
    setPreviewResult(activeSession.previewResult || null);
    setManualResumeText(activeSession.resumeParseResult?.rawText || '');
    setExportedState({ pdf: false, docx: false });
  }, [activeSession]);

  async function handleLogin() {
    setAuthError(null);
    setLoading('Signing in...');

    try {
      const res = await fetch('/api/internal/resume-advisor/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Login failed.');
      }

      setAuthenticated(true);
      setPassword('');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setLoading(null);
    }
  }

  async function handleLogout() {
    await fetch('/api/internal/resume-advisor/auth/logout', { method: 'POST' });
    setAuthenticated(false);
    setStatusMessage('Session locked.');
  }

  async function createNewSession() {
    const session = defaultSession();
    await saveSession(session);
    await refreshSessions();
    setActiveSessionId(session.id);
  }

  async function analyzeJd() {
    if (!jdText.trim()) {
      setStatusMessage('Paste a job description first.');
      return;
    }

    setLoading('Analyzing JD...');
    setStatusMessage(null);

    try {
      const res = await fetch('/api/internal/resume-advisor/jd/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'JD analysis failed.');
      }

      const body = await res.json();
      setJdAnalysis(body.analysis);

      await persistCurrentSession({
        jdText,
        jdAnalysis: body.analysis,
        title: body.analysis.inferredRoleFamily ? `${body.analysis.inferredRoleFamily} Target` : 'Resume session',
      });

      setStatusMessage('JD analysis complete.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'JD analysis failed.');
    } finally {
      setLoading(null);
    }
  }

  async function parseResumeText(rawText: string, uploadedFile?: File) {
    setLoading('Parsing resume text...');
    setStatusMessage(null);

    try {
      const res = await fetch('/api/internal/resume-advisor/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Resume parsing failed.');
      }

      const body = await res.json();
      setResumeParseResult(body.result);
      setManualResumeText(rawText);

      await persistCurrentSession({
        resumeParseResult: body.result,
      });

      if (uploadedFile && activeSessionId) {
        await saveBlob(activeSessionId, 'resumePdf', uploadedFile);
      }

      if (body.result.confidence < 0.55) {
        setStatusMessage('Resume parse confidence is low. Website-only mode and manual fallback are available.');
      } else {
        setStatusMessage('Resume parsing complete.');
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Resume parse failed.');
    } finally {
      setLoading(null);
    }
  }

  async function onResumeFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading('Extracting PDF text...');
    setStatusMessage(null);

    try {
      const extracted = await extractTextFromPdf(file);
      await parseResumeText(extracted.text, file);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'PDF extraction failed. Use manual text fallback.');
      setLoading(null);
    }
  }

  async function runMergeRank() {
    if (!jdAnalysis) {
      setStatusMessage('Analyze the job description before merge/rank.');
      return;
    }

    setLoading('Merging profile and ranking content...');
    setStatusMessage(null);

    try {
      const res = await fetch('/api/internal/resume-advisor/merge-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdAnalysis,
          resumeParseResult,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Merge/rank failed.');
      }

      const body = await res.json();
      setMergeRankResult(body);
      setSelectionState(body.selectionState);

      await persistCurrentSession({
        mergeRankResult: body,
      });

      setStatusMessage('Merge/rank complete. Review recommendations and adjust selections.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Merge/rank failed.');
    } finally {
      setLoading(null);
    }
  }

  function toggleSelection(type: 'experience' | 'project' | 'skill', id: string) {
    if (!selectionState) return;

    setPreviewResult(null);
    setExportedState({ pdf: false, docx: false });

    if (type === 'experience') {
      const selected = selectionState.selectedExperienceIds.includes(id)
        ? selectionState.selectedExperienceIds.filter((item) => item !== id)
        : [...selectionState.selectedExperienceIds, id];

      setSelectionState({ ...selectionState, selectedExperienceIds: selected });
      return;
    }

    if (type === 'project') {
      const selected = selectionState.selectedProjectIds.includes(id)
        ? selectionState.selectedProjectIds.filter((item) => item !== id)
        : [...selectionState.selectedProjectIds, id];

      setSelectionState({ ...selectionState, selectedProjectIds: selected });
      return;
    }

    const selected = selectionState.selectedSkillNames.includes(id)
      ? selectionState.selectedSkillNames.filter((item) => item !== id)
      : [...selectionState.selectedSkillNames, id];

    setSelectionState({ ...selectionState, selectedSkillNames: selected });
  }

  function updateAggressiveness(mode: AggressivenessMode) {
    if (!selectionState) return;

    setSelectionState({
      ...selectionState,
      aggressiveness: mode,
    });

    setPreviewResult(null);
    setExportedState({ pdf: false, docx: false });
  }

  async function generatePreview() {
    if (!jdAnalysis || !mergeRankResult || !selectionState) {
      setStatusMessage('You need JD analysis and merge/rank results before preview generation.');
      return;
    }

    setLoading('Generating tailored one-page preview...');
    setStatusMessage(null);

    try {
      const res = await fetch('/api/internal/resume-advisor/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdAnalysis,
          mergedProfile: mergeRankResult.mergedProfile,
          selectionState,
          styleProfile: mergeRankResult.styleProfile ?? undefined,
          evidenceMap: mergeRankResult.evidenceMap ?? undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Preview generation failed.');
      }

      const body = await res.json();
      setPreviewResult(body);
      setExportedState({ pdf: false, docx: false });

      await persistCurrentSession({
        mergeRankResult: {
          ...mergeRankResult,
          selectionState,
        },
        previewResult: body,
      });

      setStatusMessage('Preview generated. Export PDF or DOCX when ready.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Preview generation failed.');
    } finally {
      setLoading(null);
    }
  }

  async function exportFile(kind: 'pdf' | 'docx') {
    if (!previewResult) {
      setStatusMessage('Generate a preview before exporting.');
      return;
    }

    setLoading(`Exporting ${kind.toUpperCase()}...`);
    setStatusMessage(null);

    try {
      const endpoint = kind === 'pdf'
        ? '/api/internal/resume-advisor/export/pdf'
        : '/api/internal/resume-advisor/export/docx';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tailoredResume: previewResult.tailoredResume }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `Export ${kind} failed.`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = kind === 'pdf' ? 'tailored-resume.pdf' : 'tailored-resume.docx';
      anchor.click();
      URL.revokeObjectURL(url);

      if (activeSessionId) {
        await saveBlob(activeSessionId, kind === 'pdf' ? 'exportPdf' : 'exportDocx', blob);
      }

      setExportedState((prev) => ({ ...prev, [kind]: true }));
      setStatusMessage(`${kind.toUpperCase()} exported.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : `Export ${kind} failed.`);
    } finally {
      setLoading(null);
    }
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-24 text-white">
        <div className="w-full max-w-xl rounded-3xl bg-black/25 p-10 shadow-[0_22px_50px_rgba(0,0,0,0.35)] backdrop-blur md:p-12">
          <h1 className="text-center text-3xl font-semibold">Resume Advisor</h1>
          <p className="mx-auto mt-6 max-w-md text-center text-base leading-relaxed text-white/75">
            This internal route is private. Enter your password to unlock the resume tailoring workflow.
          </p>
          <div className="mt-10 space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className={baseInputClass}
              placeholder="Enter internal password"
            />
            {authError && <p className="text-sm text-red-300">{authError}</p>}
            <button
              onClick={handleLogin}
              disabled={Boolean(loading)}
              className={`${primaryButtonClass} w-full min-w-0`}
            >
              {loading || 'Unlock Advisor'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-24 text-white sm:px-8 lg:px-10">
      <div className="w-full max-w-6xl space-y-24">
        <section className="rounded-3xl bg-black/25 p-8 shadow-[0_18px_45px_rgba(0,0,0,0.25)] backdrop-blur md:p-10">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-indigo-200/75">
                Internal Tool
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-white">
                Resume Advisor Workflow
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-white/70">
                Follow the timeline from top to bottom: JD input, analysis, resume parse, merge,
                preview, and export.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 sm:flex-row md:w-auto">
              <button onClick={createNewSession} className={successButtonClass}>
                New Session
              </button>
              <button onClick={handleLogout} className={secondaryButtonClass}>
                Lock
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <label className="shrink-0 text-base font-medium text-white/80">Saved Session</label>
            <select
              className={`${baseInputClass} min-w-0 flex-1 sm:max-w-md`}
              value={activeSessionId || ''}
              onChange={(e) => setActiveSessionId(e.target.value)}
            >
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title} • {new Date(session.updatedAt).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8 space-y-4 text-sm">
            {loading && (
              <p className="rounded-2xl bg-indigo-500/15 px-6 py-4 text-base text-indigo-100">
                {loading}
              </p>
            )}
            {statusMessage && (
              <p className="rounded-2xl bg-emerald-500/15 px-6 py-4 text-base text-emerald-100">
                {statusMessage}
              </p>
            )}
          </div>
        </section>

        <section className="relative mx-auto max-w-5xl">
          <div className="space-y-24 md:space-y-32">
            <StepCard
              stepNumber={1}
              completed={step1Complete}
              title="Paste Job Description"
              description="Start by pasting the full job description text. This is the primary target signal for tailoring."
            >
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className={`${baseInputClass} min-h-[260px]`}
                placeholder="Paste the JD text here..."
              />
              <div className="pt-6">
                <button className={primaryButtonClass} onClick={analyzeJd}>
                  Analyze Job Description
                </button>
              </div>
            </StepCard>

            <StepConnector completed={step1Complete} />

            <StepCard
              stepNumber={2}
              completed={step2Complete}
              title="Review JD Analysis"
              description="Inspect extracted ATS keywords, must-have requirements, preferred skills, and the inferred role family."
            >
              {jdAnalysis ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/[0.04] p-6">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">Inferred Target Role</p>
                    <p className="mt-3 text-lg font-semibold">{jdAnalysis.inferredRoleFamily}</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-6">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">ATS Keywords</p>
                    <p className="mt-3 text-base leading-relaxed text-white/85">
                      {jdAnalysis.atsKeywords.map((kw) => kw.keyword).slice(0, 30).join(', ')}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-6">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">Must-Have Skills</p>
                    <p className="mt-3 text-base leading-relaxed text-white/85">
                      {jdAnalysis.mustHaveSkills.join(', ') || 'None detected'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-6">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">Preferred Skills</p>
                    <p className="mt-3 text-base leading-relaxed text-white/85">
                      {jdAnalysis.preferredSkills.join(', ') || 'None detected'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="min-h-[72px] rounded-2xl bg-white/[0.04] px-8 py-6 text-base leading-relaxed text-white/70 break-words">
                  No JD analysis yet. Run Step 1 first.
                </p>
              )}
            </StepCard>

            <StepConnector completed={step2Complete} />

            <StepCard
              stepNumber={3}
              completed={step3Complete}
              title="Upload Resume PDF or Use Manual Fallback"
              description="Upload a resume PDF for parsing. If extraction confidence is low, use website-only mode or paste manual plaintext."
            >
              <div className="space-y-6">
                <div className="rounded-2xl bg-white/[0.04] p-6">
                  <label className="block text-base font-medium text-white/80">Upload Resume PDF</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={onResumeFileChange}
                    className="mt-4 block w-full text-base file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-6 file:py-3 file:font-semibold file:text-white hover:file:bg-indigo-500"
                  />
                </div>

                <div className="rounded-2xl bg-white/[0.04] p-6">
                  <label className="block text-base font-medium text-white/80">Manual Plaintext Fallback</label>
                  <textarea
                    value={manualResumeText}
                    onChange={(e) => setManualResumeText(e.target.value)}
                    className={`${baseInputClass} mt-4 min-h-[200px]`}
                    placeholder="Paste raw resume text if PDF parsing is messy..."
                  />
                  <div className="mt-6">
                    <button
                      className={secondaryButtonClass}
                      onClick={() => parseResumeText(manualResumeText)}
                      disabled={!manualResumeText.trim()}
                    >
                      Parse Manual Text
                    </button>
                  </div>
                </div>

                {resumeParseResult && (
                  <div className="rounded-2xl bg-white/[0.04] p-6">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">Parse confidence:</span> {(resumeParseResult.confidence * 100).toFixed(0)}%{' '}
                      • <span className="font-semibold">Status:</span> {resumeParseResult.succeeded ? 'Parsed' : 'Partial / failed'}
                    </p>

                    {resumeParseResult.warnings.length > 0 && (
                      <div className="mt-4 rounded-2xl bg-amber-500/15 p-4">
                        <p className="text-sm font-semibold text-amber-100">Warnings</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100/90">
                          {resumeParseResult.warnings.map((warning, index) => (
                            <li key={`${warning}-${index}`}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </StepCard>

            <StepConnector completed={step3Complete} />

            <StepCard
              stepNumber={4}
              completed={step4Complete}
              title="Merge, Rank, and Override Selections"
              description="Merge website and resume data (resume preferred on conflict), then review ranked items and adjust selections."
            >
              <button
                className={primaryButtonClass}
                onClick={runMergeRank}
                disabled={!jdAnalysis}
              >
                Merge & Rank Recommendations
              </button>

              {mergeRankResult ? (
                <div className="space-y-5">
                  {mergeRankResult.mergedProfile.conflicts.length > 0 && (
                    <div className="rounded-2xl bg-amber-500/15 p-6">
                      <p className="text-sm font-semibold text-amber-100">Conflicts detected (resume preferred)</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100/90">
                        {mergeRankResult.mergedProfile.conflicts.map((conflict, index) => (
                          <li key={`${conflict.field}-${index}`}>
                            {conflict.field}: website and uploaded resume differ.
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-2xl bg-white/[0.04] p-6">
                    <p className="text-sm font-semibold text-white">Ranked Items</p>
                    <div className="mt-4 max-h-[360px] space-y-4 overflow-auto pr-1">
                      {mergeRankResult.rankedItems.map((item) => {
                        const selected = item.itemType === 'experience'
                          ? selectionState?.selectedExperienceIds.includes(item.id)
                          : item.itemType === 'project'
                            ? selectionState?.selectedProjectIds.includes(item.id)
                            : false;

                        return (
                          <label
                            key={`${item.itemType}-${item.id}`}
                            className="block rounded-2xl bg-white/[0.04] p-5"
                          >
                            <div className="flex items-start gap-3">
                              {item.itemType !== 'skill' ? (
                                <input
                                  type="checkbox"
                                  checked={Boolean(selected)}
                                  onChange={() => toggleSelection(item.itemType, item.id)}
                                  className="mt-1 h-4 w-4"
                                />
                              ) : (
                                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-white/35" />
                              )}

                              <div className="space-y-1">
                                <p className="text-sm font-medium text-white">
                                  [{item.itemType}] {itemName(mergeRankResult, item.itemType, item.id)}
                                </p>
                                <p className="text-xs text-white/70">Score: {item.score} • {item.labels.join(', ')}</p>
                                <p className="text-xs leading-relaxed text-white/70">{item.explanation}</p>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {selectionState && (
                    <div className="rounded-2xl bg-white/[0.04] p-6">
                      <p className="text-sm font-semibold text-white">Skill Selection Overrides</p>
                      <div className="mt-4 grid max-h-[300px] grid-cols-1 gap-3 overflow-auto md:grid-cols-2">
                        {mergeRankResult.mergedProfile.skills.flatMap((group) => (
                          group.skills.map((skill) => (
                            <label
                              key={`${group.id}-${skill}`}
                              className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-3 text-base"
                            >
                              <input
                                type="checkbox"
                                checked={selectionState.selectedSkillNames.includes(skill)}
                                onChange={() => toggleSelection('skill', skill)}
                                className="h-4 w-4"
                              />
                              <span>{skill}</span>
                            </label>
                          ))
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
<p className="min-h-[72px] rounded-2xl bg-white/[0.04] px-8 py-6 text-base leading-relaxed text-white/70 break-words">
                No merge/rank output yet. Complete Steps 1 and 2 first.
                </p>
              )}
            </StepCard>

            <StepConnector completed={step4Complete} />

            <StepCard
              stepNumber={5}
              completed={step5Complete}
              title="Generate One-Page Tailored Resume"
              description="Set aggressiveness, then explicitly generate preview. Exports are enabled after preview is ready."
            >
              <div className="rounded-2xl bg-white/[0.04] p-6">
                <label className="mb-4 block text-base font-medium text-white/80">Aggressiveness Mode</label>
                <select
                  className={baseInputClass}
                  value={selectionState?.aggressiveness || DEFAULT_AGGRESSIVENESS}
                  onChange={(e) => updateAggressiveness(e.target.value as AggressivenessMode)}
                >
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced (Default)</option>
                  <option value="aggressive_ats">Aggressive ATS</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  className={primaryButtonClass}
                  onClick={generatePreview}
                  disabled={!selectionState || !jdAnalysis || !mergeRankResult}
                >
                  Preview (Regenerate)
                </button>

                <button
                  className={successButtonClass}
                  onClick={() => exportFile('pdf')}
                  disabled={!previewResult}
                >
                  Download PDF
                </button>

                <button
                  className={successButtonClass}
                  onClick={() => exportFile('docx')}
                  disabled={!previewResult}
                >
                  Download DOCX
                </button>
              </div>
            </StepCard>

            <StepConnector completed={step5Complete} />

            <StepCard
              stepNumber={6}
              completed={step6Complete}
              title="Review Analysis Panel and Final Preview"
              description="Validate ATS coverage, risks, and provenance, then inspect final one-page layout before exporting."
            >
              {previewResult ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-white/[0.04] p-6">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/60">ATS Match Score</p>
                      <p className="mt-2 text-3xl font-semibold text-emerald-300">
                        {previewResult.generationAnalysis.atsMatchScore}%
                      </p>
                    </div>
                    {previewResult.generationAnalysis.mustHaveCoverage != null && (
                      <div className="rounded-2xl bg-white/[0.04] p-6">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/60">Must-have coverage</p>
                        <p className="mt-2 text-2xl font-semibold text-white/90">
                          {previewResult.generationAnalysis.mustHaveCoverage}%
                        </p>
                      </div>
                    )}
                    {previewResult.generationAnalysis.preferredCoverage != null && (
                      <div className="rounded-2xl bg-white/[0.04] p-6">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/60">Preferred coverage</p>
                        <p className="mt-2 text-2xl font-semibold text-white/90">
                          {previewResult.generationAnalysis.preferredCoverage}%
                        </p>
                      </div>
                    )}
                    <div className="rounded-2xl bg-white/[0.04] p-6 text-sm leading-relaxed text-white/85">
                      <p className="font-semibold">Provenance legend</p>
                      <p className="mt-1">direct_resume = supported by uploaded resume</p>
                      <p>website_only = supported by shared website profile</p>
                      <p>inferred = strategic inferred/stretch phrasing</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white/[0.04] p-6">
                      <p className="text-sm font-semibold">Exact JD Keywords Present</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/80">
                        {previewResult.generationAnalysis.exactKeywordsPresent.join(', ') || 'None'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-6">
                      <p className="text-sm font-semibold">Important JD Keywords Missing</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/80">
                        {previewResult.generationAnalysis.importantKeywordsMissing.join(', ') || 'None'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-6">
                      <p className="text-sm font-semibold">Inferred ATS Synonyms Added</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/80">
                        {previewResult.generationAnalysis.inferredSynonymsAdded.join(', ') || 'None'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-6">
                      <p className="text-sm font-semibold">Missing Qualifications</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/80">
                        {previewResult.generationAnalysis.missingQualifications.join(', ') || 'None detected'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-6">
                    <p className="text-sm font-semibold">Risky Unsupported Additions</p>
                    {previewResult.generationAnalysis.riskyUnsupportedAdditions.length === 0 ? (
                      <p className="mt-2 text-sm text-white/75">None</p>
                    ) : (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                        {previewResult.generationAnalysis.riskyUnsupportedAdditions.map((risk, idx) => (
                          <li key={`${risk.text}-${idx}`}>{risk.text} - {risk.reason}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-6">
                    <p className="text-sm font-semibold">Why Selected Items Were Included</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                      {previewResult.generationAnalysis.itemReasons.map((reason) => (
                        <li key={`${reason.itemType}-${reason.itemId}`}>
                          [{reason.itemType}] {reason.reasonLabel}: {reason.explanation}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-6">
                    <p className="mb-3 text-sm font-semibold">One-Page Resume Preview</p>
                    <iframe
                      title="resume-preview"
                      srcDoc={previewResult.previewHtml}
                      className="h-[920px] w-full rounded-2xl bg-white shadow-lg"
                    />
                  </div>
                </div>
              ) : (
                <p className="min-h-[72px] rounded-2xl bg-white/[0.04] px-8 py-6 text-base leading-relaxed text-white/70 break-words">
                  No preview yet. Complete Step 5 to generate analysis and preview.
                </p>
              )}
            </StepCard>
          </div>
        </section>
      </div>
    </main>
  );
}
