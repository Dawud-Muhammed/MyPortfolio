import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBlogPostBySlug, useBlogComments, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { CollectionState, SafeMarkdown } from '../components/PublicContent';
import { articleContent, formatDate, readingMinutes, safeUrl } from '../lib/utils';

export function BlogDetailPage() {
  const { slug = '' } = useParams();
  const { data: post, loading, error } = useBlogPostBySlug(slug);
  const { data: comments } = useBlogComments(post?.id || '');
  const { data: seoSettings } = useSeoSettings();
  if (loading || error) return <div className="section-container pt-32 pb-24"><CollectionState loading={loading} error={error} empty={false} name="article" /></div>;
  if (!post || post.status !== 'Published') return <div className="section-container pt-32 pb-24"><SeoHead title="Article not found" noindex /><h1 className="text-3xl text-text-primary mb-6">Article not found</h1><p className="text-text-secondary mb-6">This article may be unpublished or the address may have changed.</p><Link to="/blog" className="text-accent-primary underline">Back to all notes</Link></div>;
  return <article className="section-container pt-28 pb-24">
    <SeoHead title={post.seo_title || post.title} description={post.seo_description || post.excerpt} image={post.og_image_url || post.cover_image_url || undefined} seoSettings={seoSettings} />
    <div className="max-w-[48rem] mx-auto">
      <Link to="/blog" className="inline-flex items-center gap-2 min-h-11 mb-8 text-text-secondary hover:text-accent-primary"><ArrowLeft size={16} /> All notes</Link>
      <header className="mb-9">{post.category && <p className="label-mono-accent mb-4">{post.category.name}</p>}<h1 className="page-heading-title text-display-md font-bold leading-tight text-text-primary break-words mb-6">{post.title}</h1><p className="text-lg text-text-secondary leading-relaxed mb-6">{post.excerpt}</p><div className="flex flex-wrap gap-4 text-sm text-text-secondary">{post.published_at ? <time dateTime={post.published_at}>Published {formatDate(post.published_at)}</time> : <span>Publication date not recorded</span>}<span>{readingMinutes(post.content, post.title)} min read</span></div></header>
      {safeUrl(post.cover_image_url) && <img src={safeUrl(post.cover_image_url)} alt={post.title} width={1200} height={750} className="w-full aspect-[16/10] object-cover rounded-xl mb-10" />}
      <SafeMarkdown>{articleContent(post.content, post.title)}</SafeMarkdown>
      {!!post.tags?.length && <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-6 mt-10" aria-label="Article tags">{post.tags.map(tag => <span key={tag.id} className="badge">{tag.name}</span>)}</div>}
      {!!comments.length && <section className="mt-12 border-t border-border-subtle pt-8"><h2 className="text-2xl text-text-primary mb-6">Reader notes</h2>{comments.map(comment => <article key={comment.id} className="border-b border-border-subtle py-5"><div className="flex flex-wrap gap-3 text-sm mb-3"><h3 className="font-medium text-text-primary">{comment.name}</h3><time dateTime={comment.created_at} className="text-text-secondary">{formatDate(comment.created_at)}</time></div><p className="whitespace-pre-wrap text-text-secondary break-words">{comment.comment}</p></article>)}</section>}
      <footer className="border-t border-border-subtle mt-12 pt-8"><p className="text-text-secondary mb-4">Have a question or a different approach?</p><Link to="/contact" className="text-accent-primary underline min-h-11 inline-flex items-center">Send me a note</Link></footer>
    </div>
  </article>;
}
