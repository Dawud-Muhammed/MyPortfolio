import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

/**
 * Wraps children in a parallax container that moves at a different
 * rate than the natural scroll speed. Uses GSAP ScrollTrigger.
 * Respects prefers-reduced-motion.
 */
export function ParallaxSection({
  children,
  speed = 0.3,
  className = '',
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    // The parallax offset is proportional to the section height
    const yOffset = section.offsetHeight * speed;

    gsap.set(inner, { y: -yOffset });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set(inner, {
          y: gsap.utils.interpolate(-yOffset, yOffset, progress),
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [speed]);

  return (
    <div ref={sectionRef} className={`overflow-hidden ${className}`.trim()}>
      <div ref={innerRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
