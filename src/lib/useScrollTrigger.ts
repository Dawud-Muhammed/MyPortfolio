import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Hook to detect prefers-reduced-motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, []);

  return prefersReduced;
}

export interface ScrollRevealOptions {
  /**
   * Animation type: 'clip' for vertical reveal, 'fade' for opacity only, 'slide' for translateY
   */
  type?: 'clip' | 'fade' | 'slide' | 'combined';
  /**
   * Duration in seconds
   */
  duration?: number;
  /**
   * Delay before animation starts
   */
  delay?: number;
  /**
   * GSAP easing (default: power3.out)
   */
  ease?: string;
  /**
   * Stagger between multiple elements (in seconds)
   */
  stagger?: number;
  /**
   * Trigger margin (default: "-100px")
   */
  triggerMargin?: string;
  /**
   * Optional: callback when animation completes
   */
  onComplete?: () => void;
}

/**
 * Hook for scroll-triggered reveals using GSAP ScrollTrigger
 * Automatically respects prefers-reduced-motion
 */
export function useScrollReveal(
  ref: React.RefObject<HTMLElement>,
  options: ScrollRevealOptions = {}
) {
  const {
    type = 'combined',
    duration = 0.6,
    delay = 0,
    ease = 'power3.out',
    stagger = 0,
    triggerMargin = '-100px',
    onComplete,
  } = options;

  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current) return;

    // If user prefers reduced motion, skip animations
    if (prefersReduced) {
      // Just ensure the element is visible
      gsap.set(ref.current, {
        opacity: 1,
        clipPath: 'inset(0%)',
        y: 0,
      });
      return;
    }

    const element = ref.current;
    const queriedElements = element.querySelectorAll('[data-scroll-reveal], [data-scroll-stagger]');
    const targets = queriedElements.length > 0 ? queriedElements : [element];

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: `top ${triggerMargin}`,
        once: true,
      },
    });

    targets.forEach((target, idx) => {
      const el = target as HTMLElement;
      const hasStagger = el.getAttribute('data-scroll-stagger') !== null;
      const elementDelay = hasStagger ? idx * (stagger || 0.1) : 0;

      if (type === 'combined' || type === 'clip') {
        // Clip animation for text/heading reveals
        gsap.set(el, {
          clipPath: 'inset(0% 0% 100% 0%)',
        });

        timeline.to(
          el,
          {
            clipPath: 'inset(0%)',
            duration: duration,
            ease: ease,
          },
          delay + elementDelay
        );
      }

      if (type === 'combined' || type === 'slide') {
        // Translate + opacity for cards/elements
        gsap.set(el, {
          y: 30,
          opacity: 0,
        });

        const slideConfig: any = {
          y: 0,
          opacity: 1,
          duration: type === 'combined' ? duration : duration,
          ease: ease,
        };

        if (type === 'combined') {
          timeline.to(el, slideConfig, delay + elementDelay);
        } else {
          timeline.to(el, slideConfig, delay + elementDelay);
        }
      }

      if (type === 'fade') {
        gsap.set(el, { opacity: 0 });
        timeline.to(
          el,
          {
            opacity: 1,
            duration: duration,
            ease: ease,
          },
          delay + elementDelay
        );
      }
    });

    if (onComplete) {
      timeline.call(onComplete, undefined, `+=${duration}`);
    }

    return () => {
      timeline.kill();
    };
  }, [ref, type, duration, delay, ease, stagger, triggerMargin, prefersReduced, onComplete]);
}

/**
 * Hook for card spotlight/mouse-tracking effect
 * Respects prefers-reduced-motion
 */
export function useCardSpotlight(ref: React.RefObject<HTMLElement>) {
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current || prefersReduced) return;

    const card = ref.current;
    const spotlight = card.querySelector('[data-spotlight]') as HTMLElement;

    if (!spotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(spotlight, {
        '--mouse-x': `${x}px`,
        '--mouse-y': `${y}px`,
        duration: 0.2,
        ease: 'power2.out',
      } as any);
    };

    const handleMouseLeave = () => {
      gsap.to(spotlight, {
        '--mouse-x': '50%',
        '--mouse-y': '50%',
        duration: 0.3,
        ease: 'power2.out',
      } as any);
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, prefersReduced]);
}

/**
 * Hook for button fill-sweep micro-interaction
 */
export function useButtonHoverEffect(ref: React.RefObject<HTMLButtonElement>) {
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current || prefersReduced) return;

    const button = ref.current;
    const fillElement = button.querySelector('[data-fill-sweep]') as HTMLElement;

    if (!fillElement) return;

    const handleMouseEnter = () => {
      gsap.to(fillElement, {
        x: '100%',
        duration: 0.4,
        ease: 'power2.inOut',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(fillElement, {
        x: '-100%',
        duration: 0.3,
        ease: 'power2.inOut',
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, prefersReduced]);
}
