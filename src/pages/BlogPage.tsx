import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { useBlogPosts, useBlogCategories, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { CollectionState, PageHeading } from '../components/PublicContent';
import { formatDate, readingMinutes, safeUrl } from '../lib/utils';
import type { BlogPost } from '../lib/types';

function ArticleMeta({ post }: { post: BlogPost }) {
  return <div className="blog-article-meta">
    {post.published_at ? <time dateTime={post.published_at}>{formatDate(post.published_at)}</time> : <span>Publication date not recorded</span>}
    <span>{readingMinutes(post.content, post.title)} min read</span>
    {post.category && <span>{post.category.name}</span>}
  </div>;
}

function ArticleCover({ src, featured = false }: { src: string | undefined; featured?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className={`editorial-media blog-cover ${featured ? 'blog-cover-featured' : ''}`}>
    {src && !failed ? <img src={src} alt="" width={1440} height={720} loading={featured ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} /> : <div className="blog-cover-placeholder" aria-hidden="true"><BookOpen size={40} strokeWidth={1.2} /><span>Notes from the studio</span></div>}
  </div>;
}

export function BlogPage() {
  const { data: posts, loading, error } = useBlogPosts();
  const { data: categories } = useBlogCategories();
  const { data: seoSettings } = useSeoSettings();
  const [category, setCategory] = useState('all');
  const published = posts.filter(post => post.status === 'Published');
  const populated = categories.filter(item => published.some(post => post.category_id === item.id));
  const activeCategory = populated.some(item => item.id === category) ? category : 'all';
  const filtered = published.filter(post => activeCategory === 'all' || post.category_id === activeCategory);
  const [latest, ...remaining] = filtered;
  const featuredCover = safeUrl(latest?.cover_image_url);
  return <div className="section-container pt-32 pb-24">
    <SeoHead title="Blog" description="Notes from Dawud Muhammed on building software, solving problems, and learning along the way." seoSettings={seoSettings} />
    <PageHeading eyebrow="Notes from the studio" title="Thinking, in public.">What I’m building, what I’m figuring out, and the lessons I want to keep.</PageHeading>
    {!!populated.length && <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Article categories">{[{ id: 'all', name: 'All notes' }, ...populated].map(item => <button key={item.id} onClick={() => setCategory(item.id)} aria-pressed={activeCategory === item.id} className={`min-h-11 rounded-lg border px-4 ${activeCategory === item.id ? 'border-accent-primary text-accent-primary' : 'border-border-subtle text-text-secondary'}`}>{item.name}</button>)}</div>}
    <CollectionState loading={loading} error={error} empty={!filtered.length} name="articles" />
    {!loading && !error && latest && <>
      <article className="editorial-card blog-feature" aria-label="Featured article">
        <Link to={`/blog/${latest.slug}`} className="blog-feature-link">
          <ArticleCover key={featuredCover || 'no-cover'} src={featuredCover} featured />
          <div className="blog-feature-body">
            <span className="label-mono-accent blog-feature-label">{latest.published_at ? activeCategory === 'all' ? 'Latest note' : 'Latest in this category' : 'From the journal'}</span>
            <ArticleMeta post={latest} />
            <h2>{latest.title}</h2>
            {latest.excerpt && <p className="blog-feature-excerpt">{latest.excerpt}</p>}
            <span className="text-link blog-read-link">Read article <ArrowUpRight size={19} aria-hidden="true" /></span>
          </div>
        </Link>
      </article>
      {!!remaining.length && <section className="blog-feed" aria-labelledby="more-notes-heading">
        <div className="blog-feed-heading"><h2 id="more-notes-heading">More notes</h2><span>Newest to oldest</span></div>
        <div className="space-y-5">{remaining.map(post => {
          const cover = safeUrl(post.cover_image_url);
          return <article key={post.id} className="editorial-card blog-list-card">
            <Link to={`/blog/${post.slug}`} className={`blog-list-link ${cover ? 'blog-list-with-cover' : ''}`}>
              <div className="min-w-0">
                <ArticleMeta post={post} />
                <h3>{post.title}</h3>
                {post.excerpt && <p className="text-text-secondary leading-relaxed mt-3">{post.excerpt}</p>}
                <span className="text-link blog-read-link">Read article <ArrowUpRight size={17} aria-hidden="true" /></span>
              </div>
              {cover && <ArticleCover key={cover} src={cover} />}
            </Link>
          </article>;
        })}</div>
      </section>}
    </>}
  </div>;
}
