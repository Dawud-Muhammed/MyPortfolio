import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MessageCircle, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useBlogPostBySlug, useBlogComments, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { formatDate } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, loading } = useBlogPostBySlug(slug || '');
  const { data: comments } = useBlogComments(post?.id || '');
  const { data: seoSettings } = useSeoSettings();
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!commentForm.name || !commentForm.email || !commentForm.comment) {
      setError('All fields are required.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from('blog_comments').insert({
      post_id: post?.id,
      name: commentForm.name,
      email: commentForm.email,
      comment: commentForm.comment,
      status: 'pending',
    });
    setSubmitting(false);
    if (err) {
      setError('Failed to submit comment. Please try again.');
      return;
    }
    setSubmitted(true);
    setCommentForm({ name: '', email: '', comment: '' });
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="pt-32 pb-20">
          <div className="section-container max-w-3xl">
            <div className="h-8 w-32 skeleton rounded-lg mb-6" />
            <div className="h-12 w-full skeleton rounded-lg mb-4" />
            <div className="h-6 w-3/4 skeleton rounded-lg mb-8" />
            <div className="aspect-video rounded-2xl skeleton mb-8" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!post) {
    return (
      <PageTransition>
        <div className="pt-32 pb-20 text-center">
          <div className="section-container">
            <h1 className="text-3xl font-bold text-text-primary mb-4">Article not found</h1>
            <Link to="/blog" className="inline-flex items-center gap-2 text-accent-primary hover:underline">
              <ArrowLeft size={16} /> Back to Blog
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SeoHead
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        image={post.cover_image_url || post.og_image_url || undefined}
        seoSettings={seoSettings}
      />

      <article className="pt-28 pb-24">
        <div className="section-container max-w-3xl">
          {/* Back link */}
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-text-tertiary hover:text-text-primary text-sm mb-8 group transition-colors">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span className="font-mono text-xs uppercase tracking-[0.12em]">Back to Blog</span>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {post.category && (
              <span className="label-mono-accent text-xs mb-4 block">{post.category.name}</span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 leading-tight">{post.title}</h1>
            <p className="text-lg text-text-secondary mb-5">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-text-tertiary">
              <span className="flex items-center gap-1.5 font-mono text-xs">
                <Calendar size={13} />
                {formatDate(post.published_at)}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-xs">
                <Clock size={13} />
                {post.reading_time} min read
              </span>
            </div>
          </motion.div>

          {/* Cover image */}
          {post.cover_image_url && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="aspect-video rounded-2xl overflow-hidden mb-10 border border-border-subtle"
            >
              <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
            </motion.div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span key={tag.id} className="badge">{tag.name}</span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Comments */}
          <div className="mt-16 pt-8 border-t border-border-subtle">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <MessageCircle size={18} />
              Comments ({(comments || []).length})
            </h2>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-card rounded-xl p-6 text-center mb-6"
              >
                <p className="text-status-emerald font-medium text-sm">Thanks for your comment! It will appear once approved.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="surface-card rounded-xl p-6 mb-8 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    className="w-full bg-surface-base/50 border border-border-subtle focus:border-accent-primary/30 rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-tertiary focus:outline-none transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={commentForm.email}
                    onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    className="w-full bg-surface-base/50 border border-border-subtle focus:border-accent-primary/30 rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-tertiary focus:outline-none transition-all"
                  />
                </div>
                <textarea
                  placeholder="Share your thoughts..."
                  value={commentForm.comment}
                  onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                  rows={4}
                  className="w-full bg-surface-base/50 border border-border-subtle focus:border-accent-primary/30 rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-tertiary focus:outline-none transition-all resize-none"
                />
                {error && <p className="text-danger-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-text-primary text-void-950 rounded-lg font-mono text-xs uppercase tracking-[0.12em] font-semibold hover:bg-text-primary/90 disabled:opacity-50 transition-all"
                >
                  <Send size={13} />
                  {submitting ? 'Submitting...' : 'Post Comment'}
                </button>
              </form>
            )}

            <div className="space-y-4">
              {(comments || []).map((c) => (
                <div key={c.id} className="surface-card rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 border border-accent-primary/20 flex items-center justify-center text-text-primary font-bold text-xs">
                      {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-text-primary font-medium text-sm">{c.name}</p>
                      <p className="text-text-mono text-[10px] font-mono">{formatDate(c.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">{c.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </PageTransition>
  );
}
