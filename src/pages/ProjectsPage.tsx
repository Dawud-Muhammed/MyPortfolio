import { useState } from 'react';
import { Search } from 'lucide-react';
import { useProjects, useProjectCategories, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { CollectionState, PageHeading, ProjectCard } from '../components/PublicContent';

export function ProjectsPage() {
  const { data: projects, loading, error } = useProjects();
  const { data: categories } = useProjectCategories();
  const { data: seoSettings } = useSeoSettings();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const populated = categories.filter(item => projects.some(project => project.category_id === item.id));
  const filtered = projects.filter(project => (category === 'all' || project.category_id === category) && [project.title, project.excerpt, project.description, ...(project.technologies || []).map(item => item.name)].join(' ').toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return <div className="pt-32 pb-24 section-container">
    <SeoHead title="Projects" description="Selected engineering work by Dawud Muhammed. Explore the problem, implementation, and available evidence behind each project." seoSettings={seoSettings} />
    <PageHeading eyebrow="Selected work / project index" title="Ideas, built into systems.">The things I’ve built, the decisions behind them, and what I learned along the way.</PageHeading>
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 p-5 md:p-6 rounded-2xl border border-border-subtle bg-surface-base">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Project categories"><button className={`min-h-11 px-4 rounded-lg border ${category === 'all' ? 'border-accent-primary text-accent-primary' : 'border-border-subtle text-text-secondary'}`} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>All work</button>{populated.map(item => <button key={item.id} onClick={() => setCategory(item.id)} aria-pressed={category === item.id} className={`min-h-11 px-4 rounded-lg border ${category === item.id ? 'border-accent-primary text-accent-primary' : 'border-border-subtle text-text-secondary'}`}>{item.name}</button>)}</div>
      <div className="w-full md:w-72"><label htmlFor="project-search" className="block text-sm text-text-secondary mb-2">Search projects</label><div className="relative"><Search size={18} className="absolute left-3 top-3.5 text-text-tertiary" aria-hidden="true" /><input id="project-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name or technology" className="w-full min-h-11 pl-10 pr-3 rounded-lg border border-border-subtle bg-surface-base text-text-primary" /></div></div>
    </div>
    <CollectionState loading={loading} error={error} empty={!filtered.length} name="projects" />
    {!loading && !error && <><p className="text-sm text-text-secondary mb-6" role="status">{filtered.length} {filtered.length === 1 ? 'project' : 'projects'}</p><div className="grid md:grid-cols-2 gap-7">{filtered.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}</div></>}
  </div>;
}
