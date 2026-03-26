'use client';

import { useEffect, useRef } from 'react';

/**
 * ParallaxDepthCanvas
 *
 * Renders 3 layers of drifting particles on a canvas:
 *   Layer 0 (far)    – small, slow, very dim
 *   Layer 1 (mid)    – medium, medium-speed
 *   Layer 2 (near)   – larger, faster, slightly brighter
 *
 * Parallax is driven by both scroll position and mouse position,
 * creating an authentic sense of depth and making the site feel alive.
 */

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  layer: 0 | 1 | 2;
  baseX: number;
  baseY: number;
}

const LAYER_CONFIG = [
  { count: 55, minR: 0.5, maxR: 1.2, alpha: 0.18, parallax: 0.012 },
  { count: 35, minR: 1.0, maxR: 1.8, alpha: 0.10, parallax: 0.028 },
  { count: 22, minR: 1.5, maxR: 2.5, alpha: 0.06, parallax: 0.048 },
] as const;

export default function ParallaxDepthCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      const pts: Particle[] = [];
      LAYER_CONFIG.forEach((cfg, layerIdx) => {
        for (let i = 0; i < cfg.count; i++) {
          const x = Math.random() * W;
          const y = Math.random() * H;
          pts.push({
            x, y,
            baseX: x,
            baseY: y,
            r: cfg.minR + Math.random() * (cfg.maxR - cfg.minR),
            speed: 0.15 + Math.random() * 0.2,
            layer: layerIdx as 0 | 1 | 2,
          });
        }
      });
      particlesRef.current = pts;
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, W, H);

      const mx = (mouseRef.current.x / W - 0.5) * 2; // -1 → 1
      const my = (mouseRef.current.y / H - 0.5) * 2;
      const sy = scrollRef.current;

      for (const p of particlesRef.current) {
        const cfg = LAYER_CONFIG[p.layer];
        const px = cfg.parallax;

        // Mouse parallax (opposite direction for depth illusion)
        const dx = -mx * px * W * 0.5;
        const dy = -my * px * H * 0.5;

        // Scroll parallax — far layers scroll less = they "fall behind"
        const scrollDrift = sy * px * 0.6;

        const fx = ((p.baseX + dx) % W + W) % W;
        const fy = ((p.baseY + dy - scrollDrift) % H + H) % H;

        ctx.beginPath();
        ctx.arc(fx, fy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${cfg.alpha})`;
        ctx.fill();
      }

      // Subtle horizontal scanline at scroll-0 — adds a depth plane effect
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

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    resize();
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ mixBlendMode: 'screen', opacity: 0.9 }}
    />
  );
}
