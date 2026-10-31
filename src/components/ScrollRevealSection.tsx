import { ReactNode, useRef } from 'react';
import { useScrollReveal } from '../lib/useScrollTrigger';

interface ScrollRevealSectionProps {
  children: ReactNode;
  type?: 'clip' | 'fade' | 'slide' | 'combined';
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
}

/**
 * Wrapper component for scroll-triggered section reveals
 * Automatically applies scroll animation to children
 */
export function ScrollRevealSection({
  children,
  type = 'combined',
  duration = 0.6,
  delay = 0,
  ease = 'power3.out',
  stagger = 0.05,
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useScrollReveal(ref, {
    type,
    duration,
    delay,
    ease,
    stagger,
  });

  return (
    <div ref={ref} data-scroll-reveal>
      {children}
    </div>
  );
}

interface ScrollRevealItemProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

/**
 * Individual item within a scroll reveal section
 * Use with stagger for cascade animations
 */
export function ScrollRevealItem({
  children,
  className = '',
  stagger = true,
}: ScrollRevealItemProps) {
  return (
    <div
      className={className}
      {...(stagger && { 'data-scroll-stagger': '' })}
    >
      {children}
    </div>
  );
}
