import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * A thin scroll-progress bar fixed to the top of the viewport.
 * Uses GSAP ScrollTrigger for accurate progress tracking.
 * Gradient from accent-cyan to status-emerald.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      bar.style.display = 'none';
      return;
    }

    // Set initial scale
    gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });

    const trigger = ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        gsap.to(bar, {
          scaleX: self.progress,
          duration: 0.15,
          ease: 'none',
          overwrite: true,
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 z-40 h-[3px] pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, #38BDF8, #10B981)',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  );
}
