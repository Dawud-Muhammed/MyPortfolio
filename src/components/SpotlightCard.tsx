import { ReactNode, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card component with mouse-tracking spotlight effect
 * Creates a radial gradient glow that follows the cursor within the card bounds
 */
export function SpotlightCard({
  children,
  className = '',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const spotlight = spotlightRef.current;

    if (!card || !spotlight) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Set initial CSS vars
    gsap.set(spotlight, {
      '--mouse-x': '50%',
      '--mouse-y': '50%',
    } as any);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(spotlight, {
        '--mouse-x': `${x}px`,
        '--mouse-y': `${y}px`,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
      } as any);
    };

    const handleMouseEnter = () => {
      gsap.to(spotlight, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });

      // Increase box-shadow on hover
      gsap.to(card, {
        boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(spotlight, {
        '--mouse-x': '50%',
        '--mouse-y': '50%',
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      } as any);

      gsap.to(card, {
        boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    // Set initial box-shadow
    gsap.set(card, {
      boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
    });

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
      } as any}
    >
      {/* Spotlight glow overlay */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity"
        style={{
          background: `radial-gradient(
            600px at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(56, 189, 248, 0.3),
            transparent 80%
          )`,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
