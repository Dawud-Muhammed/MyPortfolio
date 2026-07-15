export function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-500/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-700/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent-400/10 rounded-full blur-[80px] animate-float" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgb(var(--fg)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--fg)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
