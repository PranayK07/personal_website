'use client';

/**
 * Monolith Precision backdrop: tonal base + drafting-table dot grid (no decorative gradients).
 */
export default function MonolithBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 monolith-backdrop-grid"
      aria-hidden
    />
  );
}
