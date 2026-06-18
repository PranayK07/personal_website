'use client';

import { useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { MAP_VIEWBOX, US_STATE_PATHS, CITY_XY } from '@/components/usaMapData';

type Medal = 'gold' | 'silver' | 'bronze' | null;

interface Hackathon {
  id: string;
  name: string;
  year: string;
  track: string;
  placement: string;
  medal: Medal;
  built: string;
  learned: string;
  city: string;
  state: string;
  projectId: string;
  x: number;
  y: number;
}

// New Haven hosts two events; nudge the markers apart so both stay hoverable.
const NH = CITY_XY.newHaven;

const HACKATHONS: Hackathon[] = [
  {
    id: 'codelinc',
    name: 'CodeLinc 10',
    year: '2025',
    track: 'General',
    placement: '2nd Place Overall',
    medal: 'silver',
    built:
      'FinMate — an AI-powered personal finance assistant that helps new hires understand and manage their benefits (401k, retirement) through intelligent insights, planning tools, and an in-app teaching layer, backed by a cloud RAG architecture on AWS.',
    learned:
      'My first hackathon ever. Learned to rapidly scope and ship a production-ready app under pressure, balance AI capability with real user needs, design scalable cloud infrastructure, and build a full RAG pipeline with an emphasis on AI safety and guardrails.',
    city: 'Greensboro',
    state: 'NC',
    projectId: 'project-finmate',
    x: CITY_XY.greensboro.x,
    y: CITY_XY.greensboro.y,
  },
  {
    id: 'iquhack',
    name: 'MIT iQuHACK 2026',
    year: '2026',
    track: 'State Street × Classiq Quantum Finance Challenge',
    placement: '3rd Place',
    medal: 'bronze',
    built:
      'A quantum finance framework estimating Value at Risk (VaR) and Conditional VaR (CVaR) via Iterative Quantum Amplitude Estimation. Benchmarked classical Monte Carlo against quantum approaches (O(1/ε²) → O(1/ε)) across Gaussian, skewed, and fat-tailed distributions, culminating in a formal research paper and open-source Classiq implementation.',
    learned:
      'Deepened my grasp of amplitude estimation and quantum risk analysis, and the challenge of encoding probabilistic models onto quantum systems. Sharpened research and technical-writing skills by running literature reviews, designing experiments, and co-authoring a publication-quality paper.',
    city: 'Cambridge',
    state: 'MA',
    projectId: 'project-var',
    x: CITY_XY.cambridge.x,
    y: CITY_XY.cambridge.y,
  },
  {
    id: 'bitcamp',
    name: 'Bitcamp 2026',
    year: '2026',
    track: 'Game Development',
    placement: '1st Place — Best Moonshot Hack',
    medal: 'gold',
    built:
      'EchoLocate — an AI-powered digital forensics strategy game where players investigate cyberattacks using specialized AI agents for log analysis, network tracing, artifact recovery, and timeline reconstruction. Built an interactive cyber city, evidence-graph system, and multi-agent investigation workflow.',
    learned:
      'Learned to design engaging gameplay around complex technical concepts, orchestrate multiple AI agents in a real-time app, and balance system complexity with UX, while building game systems on a modern web stack and visualizing cybersecurity workflows.',
    city: 'College Park',
    state: 'MD',
    projectId: 'project-echolocate',
    x: CITY_XY.collegePark.x,
    y: CITY_XY.collegePark.y,
  },
  {
    id: 'yquantum',
    name: 'YQuantum 2026',
    year: '2026',
    track: 'Raytheon × QuantumCT × qBraid Challenge',
    placement: '2nd Place',
    medal: 'silver',
    built:
      "Schrödinger's Husky — a hybrid quantum-classical framework for Capacitated Vehicle Routing Problems. Combined clustering, QUBO formulations, QAOA, QITE, DQI, and classical optimization to benchmark routing across approaches, tested on simulators and real quantum hardware via IBM and qBraid.",
    learned:
      'Built a stronger understanding of quantum optimization and the limits of current hardware. Learned that problem formulation, decomposition, and encoding often matter as much as the algorithm, and gained experience benchmarking where hybrid systems give a real advantage.',
    city: 'New Haven',
    state: 'CT',
    projectId: 'project-schrodingers-husky',
    x: NH.x - 13,
    y: NH.y - 10,
  },
  {
    id: 'yhack',
    name: 'YHack 2025',
    year: '2025',
    track: 'Societal Impact',
    placement: 'Finalist — K2 Think V2 Track',
    medal: null,
    built:
      'Veritas — an AI-powered platform for combating misinformation and helping users evaluate the credibility of online information. Combined NLP, source analysis, and user-facing tools to promote informed decision-making and media literacy.',
    learned:
      'Learned how hard it is to balance accuracy, explainability, and usability in systems that influence user trust, and gained experience designing AI for social-impact use cases and turning complex analysis into actionable insight.',
    city: 'New Haven',
    state: 'CT',
    projectId: 'project-veritas',
    x: NH.x + 13,
    y: NH.y + 10,
  },
];

// Chronological route through the locations — reinforces the "circuit" idea.
const ROUTE_ORDER = ['codelinc', 'yhack', 'iquhack', 'bitcamp', 'yquantum'];
const ROUTE_POINTS = ROUTE_ORDER.map((id) => {
  const h = HACKATHONS.find((x) => x.id === id)!;
  return `${h.x},${h.y}`;
}).join(' ');

const MEDAL_LABEL: Record<Exclude<Medal, null>, string> = {
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

// ── Derived stats ──────────────────────────────────────────────────────
const entered = HACKATHONS.length;
const podium = HACKATHONS.filter((h) => h.medal !== null).length;
const podiumRate = Math.round((podium / entered) * 100);
const golds = HACKATHONS.filter((h) => h.medal === 'gold').length;
const silvers = HACKATHONS.filter((h) => h.medal === 'silver').length;
const bronzes = HACKATHONS.filter((h) => h.medal === 'bronze').length;
const quantumPodiums = HACKATHONS.filter(
  (h) => /quantum/i.test(h.track) && h.medal !== null,
).length;

function medalClass(medal: Medal): string {
  if (medal === 'gold') return 'medal-dot medal-dot--gold';
  if (medal === 'silver') return 'medal-dot medal-dot--silver';
  if (medal === 'bronze') return 'medal-dot medal-dot--bronze';
  return 'medal-dot medal-dot--none';
}

function scrollToProject(projectId: string) {
  const el = document.getElementById(projectId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.classList.remove('project-highlight');
  // Force reflow so the animation can replay on repeat clicks.
  void el.offsetWidth;
  el.classList.add('project-highlight');
  window.setTimeout(() => el.classList.remove('project-highlight'), 1800);
}

function StatCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--ghost-border)] pt-4">
      <p className="font-mono-label text-[0.58rem] uppercase tracking-[0.18em] text-[var(--secondary)]">
        {label}
      </p>
      <div className="mt-2 font-display text-2xl font-medium tracking-[-0.02em] text-[var(--on-surface)] sm:text-[1.75rem]">
        {children}
      </div>
    </div>
  );
}

function MedalChip({ medal, placement }: { medal: Medal; placement: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={medalClass(medal)} aria-hidden />
      <span className="font-mono-label text-[0.6rem] uppercase tracking-[0.12em] text-[var(--secondary)]">
        {placement}
      </span>
    </span>
  );
}

export default function HackathonCircuit() {
  const [ref, isVisible] = useScrollAnimation(0.12);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = HACKATHONS.find((h) => h.id === activeId) ?? null;
  // The detail panel is never empty: fall back to the first event when nothing
  // is hovered/focused. The tooltip still uses `active` so it only shows on hover.
  const detail = active ?? HACKATHONS[0];
  const [vbX, vbY, vbW, vbH] = MAP_VIEWBOX.split(' ').map(Number);

  const handleSelect = useCallback((h: Hackathon) => {
    scrollToProject(h.projectId);
  }, []);

  return (
    <section id="hackathons" className="px-4 py-[var(--spacing-section)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div ref={ref} className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}>
          <header className="mb-12 max-w-3xl">
            <p className="ds-section-meta">05 // Circuit</p>
            <h2 className="ds-section-title mt-4">Hackathon circuit</h2>
            <p className="mt-6 max-w-[58ch] font-body text-[0.9375rem] leading-[1.6] text-[var(--secondary)]">
              An East Coast run of build sprints across fintech, quantum, security, and social impact.
              Hover a marker to preview the event; click it to jump to the build.
            </p>
          </header>

          {/* ── Active event detail — driven by hover/focus, defaults to first ── */}
          <article
            key={detail.id}
            className="hack-detail mb-8 border border-[var(--ghost-border)] bg-[var(--surface-container-low)] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className={medalClass(detail.medal)} aria-hidden />
                  <h3 className="font-display text-lg font-medium tracking-[-0.01em] text-[var(--on-surface)] sm:text-xl">
                    {detail.name}
                  </h3>
                </div>
                <p className="mt-2 font-mono-label text-[0.58rem] uppercase tracking-[0.14em] text-[var(--secondary)]">
                  {detail.placement} · {detail.city}, {detail.state} · {detail.track}
                </p>
              </div>
              <button
                type="button"
                onClick={() => scrollToProject(detail.projectId)}
                className="ds-btn-secondary inline-flex shrink-0 items-center gap-2 !py-2 !px-3 !text-[0.6rem]"
              >
                View project
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="font-mono-label text-[0.55rem] uppercase tracking-[0.18em] text-[var(--secondary)]">
                  Built
                </dt>
                <dd className="mt-1.5 font-body text-[0.875rem] leading-[1.6] text-[color-mix(in_srgb,var(--on-surface)_82%,var(--secondary))]">
                  {detail.built}
                </dd>
              </div>
              <div>
                <dt className="font-mono-label text-[0.55rem] uppercase tracking-[0.18em] text-[var(--secondary)]">
                  Learned
                </dt>
                <dd className="mt-1.5 font-body text-[0.875rem] leading-[1.6] text-[color-mix(in_srgb,var(--on-surface)_82%,var(--secondary))]">
                  {detail.learned}
                </dd>
              </div>
            </dl>
          </article>

          {/* ── Map ────────────────────────────────────────────────── */}
          <div className="grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:items-stretch">
            <div className="ds-card relative p-4 sm:p-6">
              <div className="relative">
                <svg
                  viewBox={MAP_VIEWBOX}
                  className="block h-auto w-full"
                  role="img"
                  aria-label="Map of the eastern United States with hackathon locations"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <g className="map-states">
                    {US_STATE_PATHS.map((s) => (
                      <path key={s.name} d={s.d} className="map-state" />
                    ))}
                  </g>
                  <polyline points={ROUTE_POINTS} className="map-route" />
                </svg>

                {/* Interactive markers overlaid as buttons for native focus/a11y */}
                {HACKATHONS.map((h) => {
                  const left = ((h.x - vbX) / vbW) * 100;
                  const top = ((h.y - vbY) / vbH) * 100;
                  const isActive = activeId === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      className={`map-marker ${isActive ? 'is-active' : ''}`}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      aria-label={`${h.name} — ${h.placement}. View project.`}
                      onMouseEnter={() => setActiveId(h.id)}
                      onMouseLeave={() => setActiveId((cur) => (cur === h.id ? null : cur))}
                      onFocus={() => setActiveId(h.id)}
                      onBlur={() => setActiveId((cur) => (cur === h.id ? null : cur))}
                      onClick={() => handleSelect(h)}
                    >
                      <span className={medalClass(h.medal)} aria-hidden />
                    </button>
                  );
                })}

                {/* Tooltip */}
                {active && (
                  <div
                    className="map-tooltip"
                    style={{
                      left: `${((active.x - vbX) / vbW) * 100}%`,
                      top: `${((active.y - vbY) / vbH) * 100}%`,
                    }}
                  >
                    <p className="font-display text-sm font-medium tracking-[-0.01em] text-[var(--on-surface)]">
                      {active.name}
                    </p>
                    <p className="mt-1 font-body text-xs text-[var(--secondary)]">
                      {active.city}, {active.state}
                    </p>
                    <div className="mt-2">
                      <MedalChip medal={active.medal} placement={active.placement} />
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--ghost-border)] pt-4">
                {(['gold', 'silver', 'bronze'] as const).map((m) => (
                  <span key={m} className="inline-flex items-center gap-2">
                    <span className={medalClass(m)} aria-hidden />
                    <span className="font-mono-label text-[0.58rem] uppercase tracking-[0.14em] text-[var(--secondary)]">
                      {MEDAL_LABEL[m]}
                    </span>
                  </span>
                ))}
                <span className="inline-flex items-center gap-2">
                  <span className={medalClass(null)} aria-hidden />
                  <span className="font-mono-label text-[0.58rem] uppercase tracking-[0.14em] text-[var(--secondary)]">
                    Finalist
                  </span>
                </span>
              </div>
            </div>

            {/* ── Event list — internally scrollable, fills the map's height on lg+ ── */}
            {/* The wrapper is `lg:relative` and the list is absolutely filled so it
                doesn't drive the grid row height — the map defines the row height and
                the list matches it exactly, bottoms aligned at every width. */}
            <div className="lg:relative">
              <ul className="flex flex-col gap-3 overscroll-contain lg:absolute lg:inset-0 lg:overflow-y-auto lg:pr-2 [scrollbar-color:var(--ghost-border)_transparent] [scrollbar-width:thin] motion-reduce:scroll-auto motion-safe:scroll-smooth">
                {HACKATHONS.map((h) => {
                const isActive = activeId === h.id;
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      className={`hack-card w-full text-left ${isActive ? 'is-active' : ''}`}
                      onMouseEnter={() => setActiveId(h.id)}
                      onMouseLeave={() => setActiveId((cur) => (cur === h.id ? null : cur))}
                      onFocus={() => setActiveId(h.id)}
                      onBlur={() => setActiveId((cur) => (cur === h.id ? null : cur))}
                      onClick={() => handleSelect(h)}
                      aria-label={`${h.name}, ${h.placement}. View associated project.`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display text-[0.95rem] font-medium tracking-[-0.01em] text-[var(--on-surface)]">
                            {h.name}
                          </p>
                          <p className="mt-0.5 font-mono-label text-[0.58rem] uppercase tracking-[0.12em] text-[var(--secondary)]">
                            {h.city}, {h.state} · {h.track}
                          </p>
                        </div>
                        <ArrowRight
                          className="hack-card-arrow mt-0.5 h-4 w-4 shrink-0 text-[var(--secondary)]"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </div>
                      <div className="mt-2.5">
                        <MedalChip medal={h.medal} placement={h.placement} />
                      </div>
                    </button>
                  </li>
                );
                })}
              </ul>
            </div>
          </div>

          {/* ── Stat band ──────────────────────────────────────────── */}
          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            <StatCell label="Hackathons">{entered}</StatCell>
            <StatCell label="Podium rate">{podiumRate}%</StatCell>
            <StatCell label="Medals G / S / B">
              <span className="inline-flex items-center gap-3 text-xl sm:text-2xl">
                <span className="inline-flex items-center gap-1.5">
                  <span className="medal-dot medal-dot--gold" aria-hidden />
                  {golds}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="medal-dot medal-dot--silver" aria-hidden />
                  {silvers}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="medal-dot medal-dot--bronze" aria-hidden />
                  {bronzes}
                </span>
              </span>
            </StatCell>
            <StatCell label="Domains spanned">5</StatCell>
            <StatCell label="Quantum podiums">{quantumPodiums}</StatCell>
          </div>
        </div>
      </div>
    </section>
  );
}
