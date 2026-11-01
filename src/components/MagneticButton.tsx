import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

type MagneticVariant = 'primary' | 'secondary' | 'ghost';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  href?: string;
  variant?: MagneticVariant;
  disabled?: boolean;
  ariaLabel?: string;
}

const variantStyles: Record<MagneticVariant, string> = {
  primary:
    'bg-accent-primary text-void-950 hover:bg-accent-primary/90 font-semibold',
  secondary:
    'border border-border-subtle text-text-primary hover:border-border-hover bg-transparent',
  ghost:
    'text-text-secondary hover:text-text-primary bg-transparent',
};

/**
 * A magnetic button that subtly moves toward the cursor on hover.
 * Uses GSAP for smooth tracking and elastic spring-back.
 * Falls back to standard hover on touch devices or when reduced motion is preferred.
 */
export function MagneticButton({
  children,
  className = '',
  onClick,
  href,
  variant = 'primary',
  disabled = false,
  ariaLabel,
}: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);

  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enableMagnetic = !isTouchDevice && !prefersReducedMotion && !disabled;

  const MAX_DISPLACEMENT = 8;

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!enableMagnetic || !wrapperRef.current || !contentRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Normalize displacement to max range
      const moveX = (deltaX / (rect.width / 2)) * MAX_DISPLACEMENT;
      const moveY = (deltaY / (rect.height / 2)) * MAX_DISPLACEMENT;

      gsap.to(contentRef.current, {
        x: moveX,
        y: moveY,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
      });
    },
    [enableMagnetic]
  );

  const handleMouseLeave = useCallback(() => {
    if (!enableMagnetic || !contentRef.current) return;

    gsap.to(contentRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
      overwrite: true,
    });
  }, [enableMagnetic]);

  const baseClasses = [
    'inline-flex items-center justify-center gap-2',
    'px-6 py-3 rounded-lg',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void-950',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.97]',
    variantStyles[variant],
    className,
  ].join(' ');

  const inner = (
    <span ref={contentRef} className="inline-flex items-center gap-2 will-change-transform">
      {children}
    </span>
  );

  const wrapperProps = {
    ref: wrapperRef,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    className: 'inline-block',
    'data-cursor': 'expand' as const,
  };

  if (href) {
    // External link
    if (href.startsWith('http') || href.startsWith('mailto:')) {
      return (
        <div {...wrapperProps}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClasses}
            onClick={onClick}
            aria-label={ariaLabel}
          >
            {inner}
          </a>
        </div>
      );
    }

    // Internal link via react-router
    return (
      <div {...wrapperProps}>
        <Link
          to={href}
          className={baseClasses}
          onClick={onClick}
          aria-label={ariaLabel}
        >
          {inner}
        </Link>
      </div>
    );
  }

  return (
    <div {...wrapperProps}>
      <button
        type="button"
        className={baseClasses}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {inner}
      </button>
    </div>
  );
}
