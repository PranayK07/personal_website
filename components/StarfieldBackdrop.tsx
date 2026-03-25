'use client';

import GravityStarsBackground from '@/components/GravityStarsBackground';

/**
 * Starfield tuned for readability: fewer, dimmer stars + warm dim layer so content stays primary.
 */
export default function StarfieldBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <GravityStarsBackground
        className="absolute inset-0 h-full w-full"
        starsCount={96}
        starsSize={2.25}
        starsOpacity={0.22}
        glowIntensity={5}
        glowAnimation="ease"
        movementSpeed={0.045}
        mouseInfluence={36}
        gravityStrength={48}
      />
      <div
        className="absolute inset-0 bg-[var(--bg)]"
        style={{ opacity: 0.68 }}
        aria-hidden
      />
    </div>
  );
}
