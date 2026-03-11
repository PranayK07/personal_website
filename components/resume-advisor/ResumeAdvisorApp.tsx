'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
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

const DEFAULT_AGGRESSIVENESS: AggressivenessMode = 'balanced';

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

  const activeSession = useMemo(() => sessions.find((session) => session.id === activeSessionId) || null, [sessions, activeSessionId]);

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

      setStatusMessage('Merge/rank complete. Review recommendations and override selections.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Merge/rank failed.');
    } finally {
      setLoading(null);
    }
  }

  function toggleSelection(
    type: 'experience' | 'project' | 'skill',
    id: string,
  ) {
    if (!selectionState) return;

    setPreviewResult(null);

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

  async function updateAggressiveness(mode: AggressivenessMode) {
    if (!selectionState) return;

    setSelectionState({
      ...selectionState,
      aggressiveness: mode,
    });

    setPreviewResult(null);
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
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Preview generation failed.');
      }

      const body = await res.json();
      setPreviewResult(body);

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
      const a = document.createElement('a');
      a.href = url;
      a.download = kind === 'pdf' ? 'tailored-resume.pdf' : 'tailored-resume.docx';
      a.click();
      URL.revokeObjectURL(url);

      if (activeSessionId) {
        await saveBlob(activeSessionId, kind === 'pdf' ? 'exportPdf' : 'exportDocx', blob);
      }

      setStatusMessage(`${kind.toUpperCase()} exported.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : `Export ${kind} failed.`);
    } finally {
      setLoading(null);
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen px-4 py-16 text-white bg-[var(--background)]">
        <div className="max-w-md mx-auto p-6 rounded-xl border border-white/10 bg-black/30 backdrop-blur">
          <h1 className="text-2xl font-semibold mb-4">Internal Resume Advisor</h1>
          <p className="text-sm text-white/70 mb-4">
            This route is private. Enter the admin password to unlock the tool.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-3 py-2 rounded bg-black/50 border border-white/20"
            placeholder="Password"
          />
          {authError && <p className="text-red-300 text-sm mt-3">{authError}</p>}
          <button
            onClick={handleLogin}
            disabled={Boolean(loading)}
            className="mt-4 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading || 'Unlock'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 text-white bg-[var(--background)]">
      <div className="max-w-[1440px] mx-auto flex items-start justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Resume Advisor (Internal)</h1>
        <div className="flex gap-2">
          <button onClick={createNewSession} className="px-3 py-2 text-sm rounded bg-emerald-600 hover:bg-emerald-500">
            New Session
          </button>
          <button onClick={handleLogout} className="px-3 py-2 text-sm rounded bg-zinc-700 hover:bg-zinc-600">
            Lock
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto mb-4 flex gap-3 items-center">
        <label className="text-sm text-white/75">Session</label>
        <select
          className="px-3 py-2 rounded bg-black/40 border border-white/20"
          value={activeSessionId || ''}
          onChange={(e) => setActiveSessionId(e.target.value)}
        >
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.title} • {new Date(session.updatedAt).toLocaleString()}
            </option>
          ))}
        </select>
        {loading && <span className="text-sm text-white/70">{loading}</span>}
        {statusMessage && <span className="text-sm text-indigo-200">{statusMessage}</span>}
      </div>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4">
        <section className="space-y-4">
          <div className="p-4 rounded-xl border border-white/10 bg-black/25 backdrop-blur">
            <h2 className="text-lg font-medium mb-2">1) Job Description</h2>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full min-h-[180px] px-3 py-2 rounded bg-black/50 border border-white/20"
              placeholder="Paste JD text here..."
            />
            <button className="mt-3 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500" onClick={analyzeJd}>
              Analyze JD
            </button>

            {jdAnalysis && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">Inferred Role</p>
                  <p>{jdAnalysis.inferredRoleFamily}</p>
                </div>
                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">ATS Keywords</p>
                  <p>{jdAnalysis.atsKeywords.map((kw) => kw.keyword).slice(0, 25).join(', ')}</p>
                </div>
                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">Must-Have Skills</p>
                  <p>{jdAnalysis.mustHaveSkills.join(', ') || 'None detected'}</p>
                </div>
                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">Preferred Skills</p>
                  <p>{jdAnalysis.preferredSkills.join(', ') || 'None detected'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-black/25 backdrop-blur">
            <h2 className="text-lg font-medium mb-2">2) Resume Parse (Optional, Recommended)</h2>
            <input
              type="file"
              accept="application/pdf"
              onChange={onResumeFileChange}
              className="block w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
            />
            <p className="text-sm text-white/70 mt-2">
              If parsing confidence is low, continue with website-only mode or paste plain resume text below.
            </p>

            <textarea
              value={manualResumeText}
              onChange={(e) => setManualResumeText(e.target.value)}
              className="w-full min-h-[120px] px-3 py-2 mt-3 rounded bg-black/50 border border-white/20"
              placeholder="Manual plaintext fallback for messy PDFs..."
            />
            <button
              className="mt-3 px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600"
              onClick={() => parseResumeText(manualResumeText)}
            >
              Parse Manual Text
            </button>

            {resumeParseResult && (
              <div className="mt-4 text-sm space-y-2">
                <p>
                  <strong>Confidence:</strong> {(resumeParseResult.confidence * 100).toFixed(0)}%
                </p>
                <p><strong>Status:</strong> {resumeParseResult.succeeded ? 'Parsed' : 'Failed / partial'}</p>
                {resumeParseResult.warnings.length > 0 && (
                  <div className="p-3 rounded border border-amber-500/50 bg-amber-500/10">
                    <p className="font-medium mb-1">Warnings</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {resumeParseResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-black/25 backdrop-blur">
            <h2 className="text-lg font-medium mb-2">3) Merge + Rank</h2>
            <button className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500" onClick={runMergeRank}>
              Merge & Rank Recommendations
            </button>

            {mergeRankResult && (
              <div className="mt-4 space-y-3">
                {mergeRankResult.mergedProfile.conflicts.length > 0 && (
                  <div className="p-3 rounded border border-amber-500/40 bg-amber-500/10 text-sm">
                    <p className="font-medium mb-1">Conflicts (resume preferred)</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {mergeRankResult.mergedProfile.conflicts.map((conflict, index) => (
                        <li key={`${conflict.field}-${index}`}>
                          {conflict.field}: website vs uploaded resume conflict detected
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-sm">
                  <p className="font-medium mb-2">Ranked Recommendations</p>
                  <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                    {mergeRankResult.rankedItems.map((item) => {
                      const selected = item.itemType === 'experience'
                        ? selectionState?.selectedExperienceIds.includes(item.id)
                        : item.itemType === 'project'
                          ? selectionState?.selectedProjectIds.includes(item.id)
                          : false;

                      return (
                        <label
                          key={`${item.itemType}-${item.id}`}
                          className="block p-2 rounded border border-white/10 bg-black/30"
                        >
                          <div className="flex items-start gap-2">
                            {item.itemType !== 'skill' && (
                              <input
                                type="checkbox"
                                checked={Boolean(selected)}
                                onChange={() => toggleSelection(item.itemType, item.id)}
                              />
                            )}
                            <div>
                              <p className="font-medium">
                                [{item.itemType}] {itemName(mergeRankResult, item.itemType, item.id)}
                              </p>
                              <p className="text-xs text-white/70">Score: {item.score} • {item.labels.join(', ')}</p>
                              <p className="text-xs text-white/70">{item.explanation}</p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {selectionState && (
                  <div className="pt-2">
                    <p className="font-medium text-sm mb-2">Skill Selection Overrides</p>
                    <div className="max-h-[180px] overflow-auto grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {mergeRankResult.mergedProfile.skills.flatMap((group) => (
                        group.skills.map((skill) => (
                          <label key={`${group.id}-${skill}`} className="flex items-center gap-2 p-2 rounded border border-white/10 bg-black/30">
                            <input
                              type="checkbox"
                              checked={selectionState.selectedSkillNames.includes(skill)}
                              onChange={() => toggleSelection('skill', skill)}
                            />
                            <span>{skill}</span>
                          </label>
                        ))
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-black/25 backdrop-blur">
            <h2 className="text-lg font-medium mb-2">4) Generate & Export</h2>
            <label className="block text-sm mb-2">Aggressiveness</label>
            <select
              className="px-3 py-2 rounded bg-black/40 border border-white/20"
              value={selectionState?.aggressiveness || DEFAULT_AGGRESSIVENESS}
              onChange={(e) => updateAggressiveness(e.target.value as AggressivenessMode)}
            >
              <option value="conservative">Conservative</option>
              <option value="balanced">Balanced (Default)</option>
              <option value="aggressive_ats">Aggressive ATS</option>
            </select>

            <div className="mt-3 flex gap-2 flex-wrap">
              <button className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500" onClick={generatePreview}>
                Preview (Regenerate)
              </button>
              <button
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500"
                onClick={() => exportFile('pdf')}
                disabled={!previewResult}
              >
                Download PDF
              </button>
              <button
                className="px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600"
                onClick={() => exportFile('docx')}
                disabled={!previewResult}
              >
                Download DOCX
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="p-4 rounded-xl border border-white/10 bg-black/25 backdrop-blur">
            <h2 className="text-lg font-medium mb-2">Analysis Panel</h2>
            {previewResult ? (
              <div className="text-sm space-y-3">
                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p><strong>ATS Match Score:</strong> {previewResult.generationAnalysis.atsMatchScore}%</p>
                </div>

                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">Exact JD Keywords Present</p>
                  <p>{previewResult.generationAnalysis.exactKeywordsPresent.join(', ') || 'None'}</p>
                </div>

                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">Important JD Keywords Missing</p>
                  <p>{previewResult.generationAnalysis.importantKeywordsMissing.join(', ') || 'None'}</p>
                </div>

                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">Inferred ATS Synonyms Added</p>
                  <p>{previewResult.generationAnalysis.inferredSynonymsAdded.join(', ') || 'None'}</p>
                </div>

                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">Missing Qualifications</p>
                  <p>{previewResult.generationAnalysis.missingQualifications.join(', ') || 'None detected'}</p>
                </div>

                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">Risky Unsupported Additions</p>
                  {previewResult.generationAnalysis.riskyUnsupportedAdditions.length === 0 ? (
                    <p>None</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1">
                      {previewResult.generationAnalysis.riskyUnsupportedAdditions.map((risk, idx) => (
                        <li key={`${risk.text}-${idx}`}>{risk.text} — {risk.reason}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">Why Items Were Included</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {previewResult.generationAnalysis.itemReasons.map((reason) => (
                      <li key={`${reason.itemType}-${reason.itemId}`}>
                        [{reason.itemType}] {reason.reasonLabel}: {reason.explanation}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded border border-white/10 bg-black/30">
                  <p className="font-medium mb-1">Provenance Legend</p>
                  <p>direct_resume = directly supported by uploaded resume</p>
                  <p>website_only = supported by website profile data only</p>
                  <p>inferred = strategic inferred/stretch phrasing</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/70">Generate preview to view ATS analysis, risk audit, and provenance labels.</p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-black/25 backdrop-blur min-h-[820px]">
            <h2 className="text-lg font-medium mb-2">One-Page Resume Preview</h2>
            {previewResult ? (
              <iframe
                title="resume-preview"
                srcDoc={previewResult.previewHtml}
                className="w-full h-[760px] rounded border border-white/20 bg-white"
              />
            ) : (
              <p className="text-sm text-white/70">No preview yet. Run “Preview (Regenerate)” after making selections.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
