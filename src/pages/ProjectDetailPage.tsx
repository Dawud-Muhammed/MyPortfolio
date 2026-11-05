import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Github, Play } from 'lucide-react';
import { useProjectBySlug, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { CollectionState, MediaLightbox, SafeMarkdown } from '../components/PublicContent';
import { safeUrl } from '../lib/utils';

function videoEmbed(value: string): string | undefined {
  try {
    const url = new URL(value);
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : ['youtube.com', 'www.youtube.com'].includes(url.hostname) ? url.searchParams.get('v') || url.pathname.split('/embed/')[1] : null;
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
  } catch { return undefined; }
}

export function ProjectDetailPage() {
  const { slug = '' } = useParams();
  const { data: project, loading, error } = useProjectBySlug(slug);
  const { data: seoSettings } = useSeoSettings();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [playVideo, setPlayVideo] = useState(false);
  useEffect(() => { setLightbox(null); setPlayVideo(false); }, [slug]);
  if (loading || error) return <div className="section-container pt-32 pb-24"><CollectionState loading={loading} error={error} empty={false} name="project" /></div>;
  if (!project) return <div className="section-container pt-32 pb-24"><SeoHead title="Project not found" noindex /><h1 className="text-3xl text-text-primary mb-6">Project not found</h1><p className="text-text-secondary mb-6">This project may be unpublished or the address may have changed.</p><Link to="/projects" className="text-accent-primary underline">Back to all work</Link></div>;
  const demo = safeUrl(project.demo_url), source = safeUrl(project.github_url), video = safeUrl(project.video_demo_url);
  const media = (project.gallery || []).map((src, index) => ({ src: safeUrl(src) || '', alt: project.gallery_captions?.[index] || `${project.title} — screenshot ${index + 1}`, caption: project.gallery_captions?.[index] })).filter(item => item.src);
  const sections = [
    ['The problem', project.problem], ['Who it is for', project.intended_users], ['My role', project.role], ['Team contribution', project.team_contribution], ['Key decisions', project.decisions], ['Implementation', project.implementation], ['Challenges', project.challenges], ['Evidence', project.evidence], ['Outcomes & next steps', project.outcomes],
  ].filter((section): section is [string, string] => !!section[1]?.trim());
  const techs = (project.technologies || []).map(tech => tech.name);
  return <div className="section-container pt-28 pb-24">
    <SeoHead title={project.seo_title || project.title} description={project.seo_description || project.excerpt || project.description.slice(0, 160)} image={project.cover_image_url || undefined} seoSettings={seoSettings} />
    <Link to="/projects" className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-primary mb-10 min-h-11"><ArrowLeft size={16} /> All work</Link>
    <header className="page-heading max-w-4xl mb-10"><div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-5">{project.category && <span>{project.category.name}</span>}<span>Status: {project.status}</span></div><h1 className="page-heading-title text-display-lg tracking-tight font-bold text-text-primary break-words mb-6">{project.title}</h1><p className="text-lg text-text-secondary max-w-3xl leading-relaxed">{project.excerpt}</p>
      <div className="flex flex-wrap gap-3 mt-7">{demo && <a href={demo} target="_blank" rel="noopener noreferrer" className="studio-button primary inline-flex items-center gap-2 min-h-11 px-5">Visit demo <ArrowUpRight size={16} /></a>}{source && <a href={source} target="_blank" rel="noopener noreferrer" className="studio-button inline-flex items-center gap-2 min-h-11 px-5"><Github size={16} /> Source code</a>}{video && <a href="#project-video" className="inline-flex items-center gap-2 min-h-11 px-5 text-text-primary"><Play size={16} /> Watch walkthrough</a>}</div>
      {!demo && !source && !video && <p className="mt-6 text-sm text-text-secondary">A public demo, source repository, or video is not currently linked. <Link to="/contact" className="text-accent-primary underline">Ask about this project.</Link></p>}
    </header>
    {safeUrl(project.cover_image_url) && <img src={safeUrl(project.cover_image_url)} alt={`${project.title} overview`} width={1440} height={900} className="aspect-[16/10] md:aspect-video w-full object-contain bg-surface-elevated rounded-xl border border-border-subtle mb-14" />}
    <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-12 lg:gap-20">
      <div className="min-w-0 max-w-3xl"><section className="mb-10"><h2 className="text-2xl font-medium text-text-primary mb-4">Project overview</h2><SafeMarkdown>{project.description}</SafeMarkdown></section>
        {sections.map(([title, text]) => <section key={title} className="border-t border-border-subtle pt-7 mb-10"><h2 className="text-2xl font-medium text-text-primary mb-4">{title}</h2><SafeMarkdown>{text}</SafeMarkdown></section>)}
        {video && <section id="project-video" className="scroll-mt-24 my-12"><h2 className="text-2xl font-medium text-text-primary mb-5">Project walkthrough</h2>{!playVideo ? <button onClick={() => setPlayVideo(true)} className="aspect-video w-full bg-surface-elevated text-accent-primary border border-border-subtle rounded-xl flex flex-col items-center justify-center gap-4"><Play size={32} /><span>Load video</span></button> : videoEmbed(video) ? <iframe src={videoEmbed(video)} title={`${project.title} walkthrough`} className="w-full aspect-video rounded-xl" allow="fullscreen; picture-in-picture" allowFullScreen /> : /\.(mp4|webm|ogg)(\?|$)/i.test(video) ? <video src={video} controls preload="none" className="w-full rounded-xl" aria-label={`${project.title} walkthrough`} /> : <a href={video} target="_blank" rel="noopener noreferrer" className="text-accent-primary underline">Open the walkthrough</a>}</section>}
        {!!media.length && <section className="mt-12"><h2 className="text-2xl font-medium text-text-primary mb-5">Inside the project</h2><div className="grid sm:grid-cols-2 gap-5">{media.map((item, index) => <figure key={`${item.src}-${index}`}><button onClick={() => setLightbox(index)} aria-label={`Enlarge ${item.alt}`} className="block w-full border border-border-subtle rounded-lg overflow-hidden"><img src={item.src} alt={item.alt} loading="lazy" width={800} height={600} className="w-full aspect-[4/3] object-cover" /></button>{item.caption && <figcaption className="text-sm text-text-secondary mt-3">{item.caption}</figcaption>}</figure>)}</div></section>}
      </div>
      <aside className="surface-card self-start rounded-2xl border border-border-subtle bg-surface-base p-6"><h2 className="text-sm font-mono uppercase tracking-wider text-text-secondary mb-5">Technical details</h2>{techs.length > 0 ? <ul className="flex flex-wrap gap-2">{techs.map(tech => <li key={tech} className="badge">{tech}</li>)}</ul> : <p className="text-sm text-text-secondary leading-relaxed">The technology list has not been documented yet. <Link to="/contact" className="underline text-accent-primary">Ask me for details.</Link></p>}<div className="border-t border-border-subtle mt-8 pt-6"><p className="text-text-secondary mb-4">Working on something similar?</p><Link to="/contact" className="text-accent-primary inline-flex items-center gap-2 min-h-11">Let’s talk <ArrowUpRight size={16} /></Link></div></aside>
    </div>
    {lightbox !== null && <MediaLightbox items={media} index={lightbox} onIndexChange={setLightbox} onClose={() => setLightbox(null)} />}
  </div>;
}
