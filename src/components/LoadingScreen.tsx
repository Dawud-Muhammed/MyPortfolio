import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Animate progress with GSAP for smooth interpolation
    const obj = { val: 0 };
    gsap.to(obj, {
      val: 100,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(obj.val);
        setProgress(v);
        if (counterRef.current) {
          counterRef.current.textContent = String(v).padStart(3, '0');
        }
      },
      onComplete: () => {
        setExiting(true);
        setTimeout(() => setDone(true), 600);
      },
    });
  }, []);

  if (done) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-void-950"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <motion.div
            className="relative flex flex-col items-center"
            animate={exiting ? { y: -30, opacity: 0, filter: 'blur(8px)' } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {/* Monogram */}
            <motion.div
              className="mb-8 h-16 w-16 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 border border-accent-primary/30 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <span className="text-text-primary font-bold text-lg tracking-wider">D</span>
            </motion.div>

            {/* Progress bar */}
            <div className="w-56 h-[2px] bg-surface-elevated/50 rounded-full overflow-hidden mb-6">
              <motion.div
                ref={barRef}
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #38BDF8, #10B981)',
                }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Counter + label */}
            <div className="flex items-center gap-4">
              <span
                ref={counterRef}
                className="font-mono text-xs text-text-tertiary tabular-nums tracking-[0.2em]"
              >
                000
              </span>
              <span className="text-text-tertiary text-xs font-mono uppercase tracking-[0.15em]">
                Loading
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
