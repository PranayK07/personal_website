'use client';

import React, { useEffect, useRef } from 'react';

type GlowAnimation = 'instant' | 'ease' | 'spring';
type MouseGravity = 'attract' | 'repel';
type StarsInteractionType = 'bounce' | 'merge';

export interface GravityStarsBackgroundProps extends React.ComponentProps<'div'> {
  starsCount?: number;
  starsSize?: number;
  starsOpacity?: number;
  glowIntensity?: number;
  glowAnimation?: GlowAnimation;
  movementSpeed?: number;
  mouseInfluence?: number;
  mouseGravity?: MouseGravity;
  gravityStrength?: number;
  starsInteraction?: boolean;
  starsInteractionType?: StarsInteractionType;
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  size: number;
}

const GravityStarsBackground: React.FC<GravityStarsBackgroundProps> = ({
  starsCount = 350,
  starsSize = 3,
  starsOpacity = 0.75,
  glowIntensity = 20,
  glowAnimation = 'spring',
  movementSpeed = 0.1,
  mouseInfluence = 60,
  mouseGravity = 'attract',
  gravityStrength = 75,
  starsInteraction = false,
  starsInteractionType = 'merge',
  className = '',
  style,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrame: number;
    let stars: Star[] = [];

    let mouseX = Infinity;
    let mouseY = Infinity;

    const setCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      // Skip sizing if layout not ready yet
      if (width === 0 || height === 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initStars();
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starsCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.5 + Math.random()) * movementSpeed;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          baseSize: (0.5 + Math.random()) * starsSize,
          size: 0,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = Infinity;
      mouseY = Infinity;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Movement
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around edges
        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;
        if (star.y < -10) star.y = height + 10;
        if (star.y > height + 10) star.y = -10;

        // Mouse gravity
        if (Number.isFinite(mouseX) && Number.isFinite(mouseY)) {
          const dx = mouseX - star.x;
          const dy = mouseY - star.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < mouseInfluence && dist > 0.0001) {
            const force = (mouseInfluence - dist) / mouseInfluence;
            const strength = (gravityStrength / 1000) * force;
            const ax = (dx / dist) * strength;
            const ay = (dy / dist) * strength;

            if (mouseGravity === 'attract') {
              star.vx += ax;
              star.vy += ay;
            } else {
              star.vx -= ax;
              star.vy -= ay;
            }
          }
        }

        // Star-star interaction (optional)
        if (starsInteraction && starsInteractionType === 'bounce') {
          for (let j = i + 1; j < stars.length; j++) {
            const other = stars[j];
            const dx = other.x - star.x;
            const dy = other.y - star.y;
            const distSq = dx * dx + dy * dy;
            const minDist = (star.baseSize + other.baseSize) * 1.2;

            if (distSq < minDist * minDist && distSq > 0) {
              const tempVx = star.vx;
              const tempVy = star.vy;
              star.vx = other.vx;
              star.vy = other.vy;
              other.vx = tempVx;
              other.vy = tempVy;
            }
          }
        }

        // Glow / size animation
        let targetSize = star.baseSize;
        if (Number.isFinite(mouseX) && Number.isFinite(mouseY)) {
          const dx = mouseX - star.x;
          const dy = mouseY - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseInfluence) {
            const t = 1 - dist / mouseInfluence;
            targetSize = star.baseSize * (1 + t * 1.5);
          }
        }

        let lerpFactor = 1;
        if (glowAnimation === 'ease') lerpFactor = 0.15;
        else if (glowAnimation === 'spring') lerpFactor = 0.25;

        star.size = star.size + (targetSize - star.size) * lerpFactor;

        // Draw star with glow
        const alpha = starsOpacity;
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowBlur = glowIntensity;
        ctx.shadowColor = `rgba(99, 102, 241, ${Math.min(1, alpha + 0.25)})`;
        ctx.arc(star.x, star.y, Math.max(0.5, star.size / 2), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrame = requestAnimationFrame(animate);
    };

    setCanvasSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        setCanvasSize();
      });
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', setCanvasSize);
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', setCanvasSize);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [
    starsCount,
    starsSize,
    starsOpacity,
    glowIntensity,
    glowAnimation,
    movementSpeed,
    mouseInfluence,
    mouseGravity,
    gravityStrength,
    starsInteraction,
    starsInteractionType,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={style}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default GravityStarsBackground;

