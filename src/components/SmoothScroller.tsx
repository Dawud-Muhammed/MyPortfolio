import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollerProps {
  children: ReactNode;
}

/**
 * Lenis smooth scroll wrapper that integrates with GSAP ScrollTrigger.
 * Respects prefers-reduced-motion by disabling smooth scrolling.
 */
export function SmoothScroller({ children }: SmoothScrollerProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      // Still register ScrollTrigger refresh for layout correctness
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Pipe Lenis scroll updates into GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Sync GSAP ticker with Lenis RAF loop
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(lenis.raf as unknown as gsap.TickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
