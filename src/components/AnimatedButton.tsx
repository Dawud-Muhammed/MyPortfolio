import { ReactNode, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  title?: string;
  ariaLabel?: string;
}

export function AnimatedButton({
  children,
  onClick,
  variant = 'secondary',
  className = '',
  disabled = false,
  type = 'button',
  title,
  ariaLabel,
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    const isTouchDevice = () => {
      return (
        (typeof window !== 'undefined' &&
          ('ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            (navigator as any).msMaxTouchPoints > 0)) ||
        window.matchMedia('(hover: none) and (pointer: coarse)').matches
      );
    };

    setIsTouchDevice(isTouchDevice());
  }, []);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button || isTouchDevice) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleMouseEnter = () => {
      // Scale animation
      gsap.to(button, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out',
      });

      // Fill sweep for primary button
      if (variant === 'primary' && fillRef.current) {
        gsap.to(fillRef.current, {
          x: '100%',
          duration: 0.4,
          ease: 'power2.inOut',
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      });

      if (variant === 'primary' && fillRef.current) {
        gsap.to(fillRef.current, {
          x: '-100%',
          duration: 0.3,
          ease: 'power2.inOut',
        });
      }
    };

    const handleMouseDown = () => {
      if (disabled) return;
      gsap.to(button, {
        scale: 0.98,
        duration: 0.1,
        ease: 'power2.in',
      });
    };

    const handleMouseUp = () => {
      gsap.to(button, {
        scale: 1.02,
        duration: 0.1,
        ease: 'power2.out',
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('mousedown', handleMouseDown);
    button.addEventListener('mouseup', handleMouseUp);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      button.removeEventListener('mousedown', handleMouseDown);
      button.removeEventListener('mouseup', handleMouseUp);
    };
  }, [variant, disabled, isTouchDevice]);

  // Base button styles with responsive touch targets (48px minimum)
  const baseClasses =
    'font-mono text-xs uppercase tracking-[0.18em] px-8 py-4 rounded-lg font-bold transition-all duration-300 cursor-pointer relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-h-[3rem] min-w-[3rem]';

  // Variant-specific classes
  let variantClasses = '';
  if (variant === 'primary') {
    variantClasses =
      'bg-text-primary text-void-950 hover:bg-text-primary/90 border border-text-primary';
  } else if (variant === 'secondary') {
    variantClasses =
      'border border-border-subtle rounded-lg text-text-primary hover:bg-surface-elevated/60 hover:border-border-hover';
  } else if (variant === 'ghost') {
    variantClasses = 'text-text-primary hover:bg-surface-elevated/40';
  }

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      type={type}
      title={title}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={{
        transformOrigin: 'center',
      }}
    >
      {/* Fill sweep overlay for primary button */}
      {variant === 'primary' && (
        <div
          ref={fillRef}
          className="absolute inset-0 bg-text-primary/20 pointer-events-none"
          style={{
            transform: 'translateX(-100%)',
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
