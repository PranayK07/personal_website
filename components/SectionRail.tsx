'use client';

const SECTIONS = [
  { id: 'home', num: '01', label: 'Intro' },
  { id: 'chat', num: '02', label: 'Ask' },
  { id: 'work', num: '03', label: 'Work' },
  { id: 'stack', num: '04', label: 'Stack' },
  { id: 'projects', num: '05', label: 'Projects' },
  { id: 'contact', num: '06', label: 'Contact' },
] as const;

export default function SectionRail({
  activeId,
  scrollProgress,
}: {
  activeId: string;
  scrollProgress: number;
}) {
  return (
    <aside
      className="pointer-events-none fixed left-0 top-[var(--site-header-h)] z-40 hidden h-[calc(100dvh-var(--site-header-h))] w-[var(--rail-width)] lg:block"
      aria-hidden="true"
    >
      <div className="pointer-events-auto relative flex h-full flex-col items-center pt-8 pb-12">
        <div
          className="absolute left-1/2 top-8 bottom-12 w-px -translate-x-1/2 bg-[var(--line)]"
          aria-hidden
        />
        <div
          className="absolute left-1/2 top-8 bottom-12 w-px -translate-x-1/2 overflow-hidden"
          aria-hidden
        >
          <div
            className="h-full w-full origin-top bg-[var(--accent)] will-change-transform motion-reduce:transition-none"
            style={{
              transform: `scaleY(${scrollProgress})`,
              transition: 'transform 120ms ease-out',
            }}
          />
        </div>

        <nav className="relative z-[1] flex flex-1 flex-col justify-between py-1" aria-label="Section index">
          {SECTIONS.map((s) => {
            const active = activeId === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`group flex w-full flex-col items-center gap-0.5 px-1 text-center transition-colors ${
                  active ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
                title={s.label}
              >
                <span
                  className={`font-display text-[0.65rem] tabular-nums tracking-widest ${
                    active ? 'opacity-100' : 'opacity-55 group-hover:opacity-90'
                  }`}
                >
                  {s.num}
                </span>
                <span className="max-w-[3.5rem] text-[0.55rem] font-medium uppercase leading-tight tracking-[0.14em] opacity-80">
                  {s.label}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
