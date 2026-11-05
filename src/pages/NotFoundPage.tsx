import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
export function NotFoundPage() {
  return <div className="section-container pt-40 pb-32 min-h-[70vh]"><SeoHead noindex title="Page not found" description="This page could not be found. Explore Dawud Muhammed’s work or return to the homepage." /><p className="label-mono-accent mb-6">404 / A missing connection</p><h1 className="text-display-lg font-medium text-text-primary mb-6">This page isn’t here.</h1><p className="text-lg text-text-secondary max-w-xl mb-9">The address may have changed, or this page may no longer be published. You can still explore the rest of the studio.</p><div className="flex flex-wrap gap-6"><Link to="/" className="inline-flex items-center gap-2 min-h-11 text-accent-primary"><ArrowLeft size={17} /> Back home</Link><Link to="/projects" className="inline-flex items-center min-h-11 text-text-primary underline">View all projects</Link></div></div>;
}
