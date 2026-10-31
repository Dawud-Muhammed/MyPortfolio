export function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-void-950">
      {/* Void background */}
      <div className="absolute inset-0 bg-void-950" />

      {/* Dot-matrix grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 0.5px, transparent 0.5px)',
          backgroundSize: '50px 50px',
          backgroundPosition: '0 0',
        }}
      />

      {/* Ambient spotlight layers - subtle radial glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-accent-cyan/5 to-transparent rounded-full blur-[140px] opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-status-emerald/5 to-transparent rounded-full blur-[120px] opacity-20" />
      
      {/* Far background accent glow */}
      <div className="absolute top-1/3 right-0 w-[800px] h-[400px] bg-gradient-to-l from-accent-warm/3 to-transparent rounded-full blur-[150px] opacity-15" />
    </div>
  );
}
