import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setDone(true), 300);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-void-950"
      style={{ opacity: progress >= 100 ? 0 : 1, transition: 'opacity 0.3s ease' }}
    >
      <div className="text-center">
        {/* Monogram + name */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-md bg-gradient-to-br from-accent-cyan to-accent-cyan/60 border border-accent-cyan/50 flex items-center justify-center">
            <span className="text-text-primary font-bold text-base tracking-wider">D</span>
          </div>
          <span className="text-text-primary font-bold text-lg tracking-tight">Dawud</span>
        </div>
        
        {/* Progress bar: Sleek minimal design */}
        <div className="w-48 h-1 bg-surface-base rounded-full overflow-hidden mx-auto border border-border-subtle">
          <div
            className="h-full bg-gradient-to-r from-accent-cyan to-accent-cyan/80 rounded-full transition-all duration-100 shadow-glow-cyan"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        {/* Loading text in monospace */}
        <p className="text-text-tertiary text-xs mt-6 font-mono uppercase tracking-widest">Initializing</p>
      </div>
    </div>
  );
}
