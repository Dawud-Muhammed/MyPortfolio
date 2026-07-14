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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-aurora"
      style={{ opacity: progress >= 100 ? 0 : 1, transition: 'opacity 0.3s ease' }}
    >
      <div className="text-center">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">Alex Rivera</span>
        </div>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-gradient-to-r from-accent-400 to-accent-600 rounded-full transition-all duration-100"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-white/50 text-sm mt-4 font-mono">Loading...</p>
      </div>
    </div>
  );
}
