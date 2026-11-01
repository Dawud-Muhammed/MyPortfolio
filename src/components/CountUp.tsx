import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/**
 * Animated counter that counts from 0 to `end` when scrolled into view.
 * Uses GSAP for the number tween and ScrollTrigger for viewport detection.
 * Shows final value immediately when reduced motion is preferred.
 */
export function CountUp({
  end,
  duration = 2,
  suffix = '',
  prefix = '',
  className = '',
}: CountUpProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<string>(`${prefix}0${suffix}`);
  const hasAnimated = useRef(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(`${prefix}${formatNumber(end)}${suffix}`);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;

        const obj = { value: 0 };
        gsap.to(obj, {
          value: end,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            setDisplay(
              `${prefix}${formatNumber(Math.round(obj.value))}${suffix}`
            );
          },
          onComplete: () => {
            setDisplay(`${prefix}${formatNumber(end)}${suffix}`);
          },
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [end, duration, suffix, prefix, prefersReducedMotion]);

  return (
    <span
      ref={containerRef}
      className={`tabular-nums ${className}`.trim()}
      aria-label={`${prefix}${formatNumber(end)}${suffix}`}
    >
      {display}
    </span>
  );
}

/** Format numbers with locale-aware separators */
function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}
