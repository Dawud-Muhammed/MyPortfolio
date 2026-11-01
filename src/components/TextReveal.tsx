import { useEffect, useRef, useMemo, createElement, type ElementType } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type SplitType = 'chars' | 'words' | 'lines';
type TagName = 'h1' | 'h2' | 'h3' | 'p' | 'span';

interface TextRevealProps {
  children: string;
  type?: SplitType;
  delay?: number;
  duration?: number;
  stagger?: number;
  className?: string;
  as?: TagName;
}

/**
 * Reveals text character-by-character, word-by-word, or line-by-line
 * using GSAP ScrollTrigger. Respects reduced-motion.
 */
export function TextReveal({
  children,
  type = 'words',
  delay = 0,
  duration = 0.6,
  stagger = 0.03,
  className = '',
  as = 'p',
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Split text into fragments
  const fragments = useMemo(() => {
    switch (type) {
      case 'chars':
        return children.split('');
      case 'lines':
        return children.split('\n').filter(Boolean);
      case 'words':
      default:
        return children.split(/(\s+)/);
    }
  }, [children, type]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const spans = spansRef.current.filter(Boolean) as HTMLSpanElement[];
    if (spans.length === 0) return;

    // Only animate non-whitespace spans
    const animatableSpans = spans.filter(
      (span) => span.textContent && span.textContent.trim().length > 0
    );

    gsap.set(animatableSpans, { opacity: 0, y: 20 });

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(animatableSpans, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          delay,
          ease: 'power3.out',
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [fragments, delay, duration, stagger, prefersReducedMotion]);

  const renderedFragments = fragments.map((fragment, i) => {
    // Preserve whitespace as-is
    if (/^\s+$/.test(fragment)) {
      return (
        <span key={`ws-${i}`} aria-hidden="true">
          {fragment}
        </span>
      );
    }

    return (
      <span
        key={`${fragment}-${i}`}
        ref={(el) => {
          spansRef.current[i] = el;
        }}
        className="inline-block will-change-transform"
        style={prefersReducedMotion ? undefined : { opacity: 0 }}
      >
        {fragment}
      </span>
    );
  });

  // Use createElement to render the dynamic tag
  return createElement(
    as as ElementType,
    {
      ref: containerRef,
      className: `${type === 'lines' ? '' : 'flex flex-wrap'} ${className}`.trim(),
      'aria-label': children,
    },
    renderedFragments
  );
}
