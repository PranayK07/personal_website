export default function Hero() {
  return (
    <section
      id="home"
      className="relative px-4 sm:px-6 lg:px-8"
      style={{
        paddingTop: 'calc(var(--site-header-h) + clamp(3rem, 12vw, 5rem))',
        minHeight: 'min(92dvh, 900px)',
      }}
    >
      <div className="mx-auto max-w-[var(--content-max)]">
        <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[var(--muted)]">
          Portfolio · Computer Science
        </p>
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.25rem)] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--fg)]">
          Pranay Kakkar
        </h1>
        <p className="mt-4 max-w-[42ch] text-[clamp(1.05rem,2vw,1.2rem)] text-[var(--muted)]">
          CS @ UConn
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-[var(--line)]" aria-hidden />
            Connecticut
          </span>
        </div>
        <p className="mt-12 max-w-[62ch] text-[1.0625rem] leading-[1.75] text-[color-mix(in_oklch,var(--fg)_82%,var(--muted))]">
          Hi, I&apos;m Pranay Kakkar, a Computer Science major at UConn, passionate about applying data and machine
          learning to real-world problems. I&apos;ve researched cryptography, ML, and physics while also enjoying
          soccer, astronomy, and side projects that help me learn new skills.
        </p>
      </div>
    </section>
  );
}
