import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

/**
 * Custom cursor follower for desktop only.
 * - Small dot (8px) follows cursor exactly
 * - Larger ring (40px) follows with a smooth delay via GSAP
 * - Ring expands when hovering interactive elements
 * - Hidden on touch devices and when reduced motion is preferred
 */
export function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Bail out on touch devices or reduced motion
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (isTouchDevice || prefersReducedMotion) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Show cursor elements after mount
    setVisible(true);

    // Mouse position tracking
    const mouse = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Dot follows instantly
      gsap.set(dot, { x: mouse.x, y: mouse.y });

      // Ring follows with smooth delay
      gsap.to(ring, {
        x: mouse.x,
        y: mouse.y,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: true,
      });
    };

    // Detect hoverable elements for ring expansion
    const INTERACTIVE_SELECTOR =
      'a, button, [data-cursor="expand"], input[type="submit"], [role="button"]';

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(INTERACTIVE_SELECTOR)) {
        gsap.to(ring, {
          width: 56,
          height: 56,
          borderWidth: 1,
          opacity: 0.5,
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, {
          scale: 0.5,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(INTERACTIVE_SELECTOR)) {
        gsap.to(ring, {
          width: 40,
          height: 40,
          borderWidth: 1.5,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    // Hide when cursor leaves viewport
    const onMouseLeave = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };

    const onMouseEnter = () => {
      gsap.to(dot, { opacity: 1, duration: 0.2 });
      gsap.to(ring, { opacity: 1, duration: 0.2 });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  return (
    <>
      {/* Dot – follows cursor exactly */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#FAFAFA',
          transform: 'translate(-50%, -50%)',
          opacity: visible ? 1 : 0,
          willChange: 'transform',
        }}
        aria-hidden="true"
      />
      {/* Ring – follows with delay */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1.5px solid #FAFAFA',
          transform: 'translate(-50%, -50%)',
          opacity: visible ? 1 : 0,
          willChange: 'transform, width, height',
        }}
        aria-hidden="true"
      />
    </>
  );
}
