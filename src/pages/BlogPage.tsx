import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useBlogPosts, useBlogCategories, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { CollectionState, PageHeading } from '../components/PublicContent';
import { formatDate, readingMinutes, safeUrl } from '../lib/utils';

export function BlogPage() {
  const { data: posts, loading, error } = useBlogPosts();
  const { data: categories } = useBlogCategories();
  const { data: seoSettings } = useSeoSettings();
  const [category, setCategory] = useState('all');
  const published = posts.filter(post => post.status === 'Published');
  const populated = categories.filter(item => published.some(post => post.category_id === item.id));
  const filtered = published.filter(post => category === 'all' || post.category_id === category);
  return <div className="section-container pt-32 pb-24">
    <SeoHead title="Blog" description="Notes from Dawud Muhammed on building software, solving problems, and learning along the way." seoSettings={seoSettings} />
    <PageHeading eyebrow="Notes from the studio" title="Thinking, in public.">What I’m building, what I’m figuring out, and the lessons I want to keep.</PageHeading>
    {!!populated.length && <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Article categories">{[{ id: 'all', name: 'All notes' }, ...populated].map(item => <button key={item.id} onClick={() => setCategory(item.id)} aria-pressed={category === item.id} className={`min-h-11 rounded-lg border px-4 ${category === item.id ? 'border-accent-primary text-accent-primary' : 'border-border-subtle text-text-secondary'}`}>{item.name}</button>)}</div>}
    <CollectionState loading={loading} error={error} empty={!filtered.length} name="articles" />
    {!loading && !error && <div className="space-y-10">{filtered.map(post => <article key={post.id} className="editorial-card grid md:grid-cols-[minmax(0,1fr)_260px] gap-7 border border-border-subtle rounded-2xl bg-surface-base p-6 md:p-8"><div className="min-w-0"><div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary mb-4">{post.published_at ? <time dateTime={post.published_at}>{formatDate(post.published_at)}</time> : <span>Publication date not recorded</span>}<span>{readingMinutes(post.content, post.title)} min read</span>{post.category && <span>{post.category.name}</span>}</div><Link to={`/blog/${post.slug}`} className="group"><h2 className="text-2xl md:text-3xl font-semibold text-text-primary leading-snug mb-3 break-words">{post.title}</h2><p className="text-text-secondary leading-relaxed max-w-2xl">{post.excerpt}</p><span className="inline-flex items-center gap-2 text-accent-primary mt-5 min-h-11">Read article <ArrowUpRight size={17} /></span></Link></div>{safeUrl(post.cover_image_url) && <Link to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true" className="editorial-media order-first md:order-last rounded-xl overflow-hidden"><img src={safeUrl(post.cover_image_url)} alt="" loading="lazy" width={600} height={400} className="w-full aspect-[3/2] object-cover rounded-lg bg-surface-elevated border border-border-subtle" /></Link>}</article>)}</div>}
  </div>;
}
