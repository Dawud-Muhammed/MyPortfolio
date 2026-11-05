import { Link } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';
import { useServices, useProjects, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { CollectionState, PageHeading } from '../components/PublicContent';

export function ServicesPage() {
  const { data: services, loading, error } = useServices();
  const { data: projects } = useProjects();
  const { data: seoSettings } = useSeoSettings();
  return <div className="section-container pt-32 pb-24">
    <SeoHead title="Services" description="Explore Dawud Muhammed’s development services, deliverables, and related project evidence." seoSettings={seoSettings} />
    <PageHeading eyebrow="How I can help" title="Good systems start with a clear problem.">A new idea, a stubborn problem, or an application ready for its next chapter. Here’s where I can help.</PageHeading>
    <CollectionState loading={loading} error={error} empty={!services.length} name="services" />
    {!loading && !error && <div className="space-y-12">{services.map((service, index) => {
      const evidence = projects.filter(project => service.evidence_project_ids?.includes(project.id));
      return <article id={service.id} key={service.id} className="service-card border border-border-subtle rounded-2xl bg-surface-base p-6 md:p-8 grid md:grid-cols-[60px_minmax(0,1fr)_minmax(0,1fr)] gap-5 md:gap-8 scroll-mt-24"><span className="font-mono text-accent-primary text-2xl">{String(index + 1).padStart(2, '0')}</span><div><h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4 break-words">{service.title}</h2><p className="text-text-secondary leading-relaxed">{service.description}</p></div><div>{!!service.included_items?.length && <><h3 className="text-sm font-medium text-text-primary mb-4">What’s included</h3><ul className="space-y-3">{service.included_items.map((item, i) => <li key={i} className="flex gap-3 text-text-secondary"><Check size={17} className="shrink-0 mt-1 text-accent-primary" />{item}</li>)}</ul></>}{!!evidence.length && <div className="border-t border-border-subtle mt-6 pt-5"><h3 className="text-sm font-medium text-text-primary mb-2">Related project evidence</h3>{evidence.map(project => <Link key={project.id} to={`/projects/${project.slug}`} className="flex items-center gap-2 text-accent-primary min-h-11">{project.title}<ArrowUpRight size={16} /></Link>)}</div>}<Link to="/contact" className="studio-button inline-flex gap-2 items-center min-h-11 mt-6 text-accent-primary">Discuss this service <ArrowUpRight size={16} /></Link></div></article>;
    })}</div>}
    <section className="mt-20 border-t border-border-subtle pt-10"><h2 className="text-2xl text-text-primary font-medium mb-4">Have an existing application?</h2><p className="text-text-secondary max-w-2xl leading-relaxed mb-5">Share what’s working, what isn’t, and the outcome you need. We can start with the problem and work out an appropriate scope.</p><Link to="/contact" className="studio-button primary inline-flex items-center gap-2 min-h-11">Start a conversation <ArrowUpRight size={17} /></Link></section>
  </div>;
}
