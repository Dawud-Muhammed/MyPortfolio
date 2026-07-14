import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="section-container text-center">
        <p className="text-[10rem] md:text-[15rem] font-bold text-gradient leading-none">404</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-4">Page Not Found</h1>
        <p className="text-white/50 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary group">
            <Home size={16} />
            Back to Home
          </Link>
          <Link to="/projects" className="btn-ghost !text-white !border-white/20 hover:!bg-white/10">
            <ArrowLeft size={16} />
            View Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
