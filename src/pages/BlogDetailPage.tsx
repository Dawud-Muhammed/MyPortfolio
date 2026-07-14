import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MessageCircle, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useBlogPostBySlug, useBlogComments, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { formatDate } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

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
      <div className="pt-32 pb-20">
        <div className="section-container max-w-3xl">
          <div className="h-8 w-32 shimmer rounded-lg mb-6" />
          <div className="h-12 w-full shimmer rounded-lg mb-4" />
          <div className="h-6 w-3/4 shimmer rounded-lg mb-8" />
          <div className="aspect-video rounded-2xl shimmer mb-8" />
          <div className="h-6 w-full shimmer rounded-lg mb-2" />
          <div className="h-6 w-full shimmer rounded-lg mb-2" />
          <div className="h-6 w-2/3 shimmer rounded-lg" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-32 pb-20 text-center">
        <div className="section-container">
          <h1 className="text-3xl font-bold text-white mb-4">Article not found</h1>
          <Link to="/blog" className="btn-primary">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        image={post.cover_image_url || post.og_image_url || undefined}
        seoSettings={seoSettings}
      />

      <article className="pt-28 pb-20">
        <div className="section-container max-w-3xl">
          {/* Back link */}
          <Link to="/blog" className="inline-flex items-center gap-1 text-white/50 hover:text-white text-sm mb-8 group">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Blog
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {post.category && (
              <span className="text-sm font-medium mb-4 block" style={{ color: post.category.color }}>
                {post.category.name}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
            <p className="text-lg text-white/50 mb-4">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {formatDate(post.published_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {post.reading_time} min read
              </span>
            </div>
          </motion.div>

          {/* Cover image */}
          {post.cover_image_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-video rounded-2xl overflow-hidden mb-10 glass"
            >
              <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
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
          <div className="prose-content text-white/75">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Comments section */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageCircle size={20} />
              Comments ({(comments || []).length})
            </h2>

            {/* Comment form */}
            {submitted ? (
              <div className="glass rounded-2xl p-6 text-center mb-6">
                <p className="text-success-400 font-medium">Thanks for your comment! It will appear once approved.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 mb-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    className="input-field !bg-white/5 !border-white/10 !text-white !placeholder-white/30"
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={commentForm.email}
                    onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    className="input-field !bg-white/5 !border-white/10 !text-white !placeholder-white/30"
                  />
                </div>
                <textarea
                  placeholder="Share your thoughts..."
                  value={commentForm.comment}
                  onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                  rows={4}
                  className="input-field !bg-white/5 !border-white/10 !text-white !placeholder-white/30 resize-none"
                />
                {error && <p className="text-error-400 text-sm">{error}</p>}
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                  <Send size={14} />
                  {submitting ? 'Submitting...' : 'Post Comment'}
                </button>
              </form>
            )}

            {/* Comments list */}
            <div className="space-y-4">
              {(comments || []).map((c) => (
                <div key={c.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white font-bold text-sm">
                      {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{c.name}</p>
                      <p className="text-white/30 text-xs">{formatDate(c.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{c.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
