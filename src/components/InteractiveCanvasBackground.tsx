import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetX: number;
  targetY: number;
  baseVelocityX: number;
  baseVelocityY: number;
}

interface Point {
  x: number;
  y: number;
}

export function InteractiveCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const isVisibleRef = useRef(true);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotionRef.current) {
      return; // Skip animation setup if reduced motion is preferred
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2); // Cap at 2
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();

    // Initialize particles
    const initParticles = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const particleCount = width < 768 ? 50 : 120; // Fewer particles on mobile

      const particles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 1.5 + 0.5,
          targetX: Math.random() * width,
          targetY: Math.random() * height,
          baseVelocityX: (Math.random() - 0.5) * 0.5,
          baseVelocityY: (Math.random() - 0.5) * 0.3,
        });
      }
      particlesRef.current = particles;
    };

    initParticles();

    // Mouse tracking listener (passive)
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    // Intersection Observer for visibility
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);

    // Animation loop
    const animate = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Skip rendering if off-screen
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear canvas with slight fade trail
      ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Update particles
      particlesRef.current.forEach((particle) => {
        // Gentle drift upward (scroll response)
        const scrollY = window.scrollY;
        const driftY = scrollY * 0.0001;

        // Mouse attraction (subtle)
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const attractionRange = 200;

        if (distance < attractionRange) {
          const force = 0.1 * (1 - distance / attractionRange) * 0.3; // Reduced force
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }

        // Apply base velocity + drift
        particle.vx = particle.baseVelocityX + driftY * 0.5;
        particle.vy = particle.baseVelocityY - driftY;

        // Damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary wrapping
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 3
        );
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
        gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Optional: Draw subtle connecting lines between nearby particles
      const connectionDistance = 150;
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dist = Math.sqrt(
            (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
          );

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.15;
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize();
      initParticles();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Don't render canvas if prefers-reduced-motion
  if (prefersReducedMotionRef.current) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-screen pointer-events-none -z-10"
      style={{
        backgroundColor: '#050505',
      }}
    />
  );
}
