import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Project } from '../lib/types';
import { safeUrl } from '../lib/utils';

export function PageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <header className="page-heading mb-14 max-w-4xl">
    <p className="label-mono-accent mb-5 inline-flex items-center gap-3"><span className="tiny-square" aria-hidden="true" />{eyebrow}</p>
    <h1 className="page-heading-title text-display-lg font-bold text-text-primary tracking-tight mb-6 break-words">{title}</h1>
    {children && <div className="page-heading-copy text-lg text-text-secondary leading-relaxed max-w-2xl">{children}</div>}
  </header>;
}

export function CollectionState({ loading, error, empty, name }: { loading: boolean; error?: string | null; empty: boolean; name: string }) {
  if (loading) return <p role="status" className="py-12 text-text-secondary">Loading {name}…</p>;
  if (error) return <div role="status" className="py-10 text-text-secondary"><p>{name[0].toUpperCase() + name.slice(1)} couldn’t be loaded.</p><button className="mt-3 underline text-accent-primary min-h-11" onClick={() => window.location.reload()}>Try again</button></div>;
  if (empty) return <p role="status" className="py-12 text-text-secondary">No {name} to show yet.</p>;
  return null;
}

export function SafeMarkdown({ children }: { children: string }) {
  return <div className="prose-content break-words"><ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} components={{
    h1: ({ children }) => <h2>{children}</h2>,
    a: ({ href, children }) => { const url = safeUrl(href); return url ? <a href={url} rel="noopener noreferrer">{children}</a> : <span>{children}</span>; },
    img: ({ src, alt }) => safeUrl(src) ? <img src={safeUrl(src)} alt={alt || ''} loading="lazy" className="rounded-lg max-w-full" /> : null,
    pre: ({ children }) => <pre tabIndex={0} className="overflow-x-auto max-w-full">{children}</pre>,
  }}>{children}</ReactMarkdown></div>;
}

function ProjectCover({ src, title, category, index }: { src?: string; title: string; category?: string; index: number }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
  return <>
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center" style={{ visibility: state === 'loaded' ? 'hidden' : 'visible' }} aria-hidden="true">
      <span className="font-mono text-7xl text-text-tertiary">{String(index + 1).padStart(2, '0')}</span>
      <span className="text-xs font-mono uppercase tracking-widest text-text-secondary">{category || 'Project case study'}</span>
    </div>
    {src && state !== 'failed' && <img src={src} alt={`${title} project preview`} loading="lazy" decoding="async" width={960} height={600} onLoad={() => setState('loaded')} onError={() => setState('failed')} className="project-card-image absolute inset-0 w-full h-full object-cover" style={{ opacity: state === 'loaded' ? 1 : 0 }} />}
  </>;
}

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const coverUrl = safeUrl(project.cover_image_url);
  const evidence = [
    { label: 'Demo', href: safeUrl(project.demo_url) },
    { label: 'Source', href: safeUrl(project.github_url) },
    { label: 'Video', href: safeUrl(project.video_demo_url) },
  ].filter(item => item.href);
  return <article className="project-card min-w-0 group rounded-2xl border border-border-subtle bg-surface-base overflow-hidden">
    <Link to={`/projects/${project.slug}`} className="block">
      <div className="project-card-visual relative aspect-[16/10] overflow-hidden bg-surface-elevated">
        <ProjectCover key={coverUrl || 'no-cover'} src={coverUrl} title={project.title} category={project.category?.name} index={index} />
        <span className="absolute left-4 top-4 rounded-full border border-border-subtle bg-surface-base px-3 py-1.5 text-xs font-mono text-text-primary" aria-hidden="true">PROJECT / {String(index + 1).padStart(2, '0')}</span>
        <span className="project-card-arrow absolute bottom-4 right-4 rounded-full bg-surface-base text-text-primary border border-border-subtle w-12 h-12 flex items-center justify-center" aria-hidden="true"><ArrowUpRight size={23} /></span>
      </div>
      <div className="project-card-body p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs font-mono text-text-secondary"><span>{project.category?.name || 'Project case study'}</span><span>{project.status}</span></div>
        <h2 className="text-2xl md:text-3xl text-text-primary font-semibold leading-tight break-words">{project.title}</h2>
        <p className="mt-4 text-text-secondary leading-relaxed">{project.excerpt || project.description.slice(0, 180)}</p>
        <span className="text-link inline-flex items-center gap-2 mt-5 min-h-11 font-medium">Explore the case study <ArrowUpRight size={17} aria-hidden="true" /></span>
      </div>
    </Link>
    <div className="project-card-meta flex flex-wrap items-center gap-x-5 gap-y-2 text-sm border-t border-border-subtle px-6 md:px-7 py-3 text-text-secondary">
      {evidence.length ? <><span className="text-xs font-mono">TAKE A LOOK</span>{evidence.map(item => <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${project.title}: ${item.label}`} className="inline-flex items-center gap-1.5 min-h-11 text-accent-primary">{item.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</> : <span className="min-h-11 inline-flex items-center">Case study only · no public demo linked</span>}
    </div>
  </article>;
}

export interface MediaItem { src: string; alt: string; caption?: string; href?: string }
export function MediaLightbox({ items, index, onIndexChange, onClose }: { items: MediaItem[]; index: number; onIndexChange: (index: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    const active = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previous; active?.focus(); };
  }, []);
  const item = items[index];
  useEffect(() => { if (!item) closeRef.current(); }, [item]);
  if (!item) return null;
  return <dialog ref={ref} aria-label="Image viewer" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); onIndexChange((index + 1) % items.length); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); onIndexChange((index - 1 + items.length) % items.length); }
  }} className="bg-surface-base text-text-primary border border-border-subtle rounded-xl p-4 md:p-6 w-[calc(100%_-_2rem)] max-w-6xl max-h-[94dvh] backdrop:bg-black/80">
    <div className="flex items-center justify-between mb-4 gap-3"><span className="text-sm text-text-secondary">Image {index + 1} of {items.length}</span><button autoFocus onClick={onClose} className="min-w-11 min-h-11 flex items-center justify-center" aria-label="Close image viewer"><X /></button></div>
    <img src={item.src} alt={item.alt} className="max-h-[65dvh] w-full object-contain" />
    <div className="flex justify-between gap-3 items-center mt-4"><button onClick={() => onIndexChange((index - 1 + items.length) % items.length)} disabled={items.length < 2} className="min-w-11 min-h-11 disabled:opacity-30" aria-label="Previous image"><ChevronLeft /></button><div className="text-center text-sm text-text-secondary"><p>{item.caption || item.alt}</p>{safeUrl(item.href) && <a href={safeUrl(item.href)} className="inline-block mt-2 underline text-accent-primary">Related work</a>}</div><button onClick={() => onIndexChange((index + 1) % items.length)} disabled={items.length < 2} className="min-w-11 min-h-11 disabled:opacity-30" aria-label="Next image"><ChevronRight /></button></div>
  </dialog>;
}
