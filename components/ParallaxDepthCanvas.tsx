'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ParallaxDepthCanvas
 *
 * A full-screen canvas rendering three depth layers of particles with mouse
 * and scroll-driven parallax effects. Particles are sized and styled to create
 * an illusion of 3D depth:
 *   - Layer 0 (far):  small, slower parallax, dimmer (alpha 0.06)
 *   - Layer 1 (mid):  medium size, moderate parallax, medium brightness (alpha 0.10)
 *   - Layer 2 (near): larger, stronger parallax, brightest (alpha 0.18)
 *
 * Performance optimizations:
 *   - Pauses animation when tab is hidden (visibilitychange)
 *   - Respects prefers-reduced-motion user preference
 *   - Uses high-DPI canvas scaling for crisp rendering on retina displays
 *
 * @remarks
 * This component is decorative and marked with aria-hidden for accessibility.
 */

/**
 * Represents a single particle in a depth layer
 */
interface Particle {
  /** Particle radius in pixels */
  r: number;
  /** Depth layer (0=far, 1=mid, 2=near) */
  layer: 0 | 1 | 2;
  /** Initial X position in CSS pixels */
  baseX: number;
  /** Initial Y position in CSS pixels */
  baseY: number;
}

/**
 * Configuration for each depth layer
 */
const LAYER_CONFIG = [
  // Far layer: small, dim, subtle parallax
  { count: 55, minR: 0.5, maxR: 1.2, alpha: 0.06, parallax: 0.012 },
  // Mid layer: medium size and brightness
  { count: 35, minR: 1.0, maxR: 1.8, alpha: 0.10, parallax: 0.028 },
  // Near layer: large, bright, strong parallax
  { count: 22, minR: 1.5, maxR: 2.5, alpha: 0.18, parallax: 0.048 },
] as const;

export default function ParallaxDepthCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Track page visibility to pause animation when tab is hidden
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let W = 0, H = 0;

    /**
     * Resizes the canvas for high-DPI displays and reinitializes particles.
     * Uses devicePixelRatio to ensure crisp rendering on retina screens.
     */
    function resize() {
      if (!canvas || !ctx) return;

      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      // Set CSS size
      canvas.style.width = cssWidth + 'px';
      canvas.style.height = cssHeight + 'px';

      // Set actual canvas size accounting for device pixel ratio
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);

      // Scale context to ensure drawing coordinates are in CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Store CSS dimensions for particle positioning
      W = cssWidth;
      H = cssHeight;

      initParticles();
    }

    /**
     * Initializes particles across all depth layers based on current canvas size.
     */
    function initParticles() {
      const pts: Particle[] = [];
      LAYER_CONFIG.forEach((cfg, layerIdx) => {
        for (let i = 0; i < cfg.count; i++) {
          const x = Math.random() * W;
          const y = Math.random() * H;
          pts.push({
            baseX: x,
            baseY: y,
            r: cfg.minR + Math.random() * (cfg.maxR - cfg.minR),
            layer: layerIdx as 0 | 1 | 2,
          });
        }
      });
      particlesRef.current = pts;
    }

    /**
     * Main draw loop - renders all particles with parallax effects.
     * Only runs when page is visible and motion is not reduced.
     */
    function draw() {
      if (!canvas || !ctx) return;

      // Pause animation if tab is hidden or user prefers reduced motion
      if (!isVisible || prefersReducedMotion) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      const mx = (mouseRef.current.x / W - 0.5) * 2; // Normalize to -1 → 1
      const my = (mouseRef.current.y / H - 0.5) * 2;
      const sy = scrollRef.current;

      // Render each particle with layer-specific parallax
      for (const p of particlesRef.current) {
        const cfg = LAYER_CONFIG[p.layer];
        const px = cfg.parallax;

        // Mouse parallax (opposite direction creates depth illusion)
        const dx = -mx * px * W * 0.5;
        const dy = -my * px * H * 0.5;

        // Scroll parallax — far layers scroll less, appearing to "fall behind"
        const scrollDrift = sy * px * 0.6;

        // Wrap particles at edges for infinite scroll effect
        const fx = ((p.baseX + dx) % W + W) % W;
        const fy = ((p.baseY + dy - scrollDrift) % H + H) % H;

        ctx.beginPath();
        ctx.arc(fx, fy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${cfg.alpha})`;
        ctx.fill();
      }

      // Draw subtle horizontal scanline for additional depth plane effect
      const horizY = Math.max(0, H * 0.62 - sy * 0.1);
      const grad = ctx.createLinearGradient(0, horizY - 1, 0, horizY + 1);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.04)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, horizY - 1, W, 2);

      animRef.current = requestAnimationFrame(draw);
    }

    function onMouse(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function onScroll() {
      scrollRef.current = window.scrollY;
    }

    // Register event listeners
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    resize();
    animRef.current = requestAnimationFrame(draw);

    // Cleanup function
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [isVisible, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ mixBlendMode: 'screen', opacity: 0.9 }}
    />
  );
}
