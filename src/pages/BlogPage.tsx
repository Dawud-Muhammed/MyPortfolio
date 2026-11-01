import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useBlogPosts, useBlogCategories, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';

export function BlogPage() {
  const { data: posts, loading } = useBlogPosts();
  const { data: categories } = useBlogCategories();
  const { data: seoSettings } = useSeoSettings();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const publishedPosts = (posts || []).filter((p) => p.status === 'Published' || p.status === 'Draft');
  const filtered = publishedPosts.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category_id === activeCategory;
    return matchesCat;
  });

  const featuredPost = filtered.find((p) => p.is_featured) || filtered[0];
  const restPosts = filtered.filter((p) => p.id !== featuredPost?.id);

  return (
    <PageTransition>
      <SeoHead title="Blog" description="Thoughts on software engineering, web development, and developer experience." seoSettings={seoSettings} />

      <div className="pt-32 pb-24">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <p className="label-mono-accent mb-3">Writings</p>
            <h1 className="heading-display text-text-primary mb-4">Blog</h1>
            <p className="text-body-lg text-text-secondary max-w-2xl">
              Thoughts on software engineering, web development, performance, and developer experience.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-2 mb-12"
          >
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-[0.12em] transition-all duration-300 ${
                activeCategory === 'all'
                  ? 'bg-accent-primary text-void-950'
                  : 'border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-hover'
              }`}
            >
              All
            </button>
            {(categories || []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-[0.12em] transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-accent-primary text-void-950'
                    : 'border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-hover'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </motion.div>

          {loading ? (
            <div className="space-y-6">
              <div className="h-64 rounded-xl skeleton" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-xl skeleton" />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-text-tertiary">No articles found.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featuredPost && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-16"
                >
                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="group block surface-card rounded-xl overflow-hidden card-spotlight"
                  >
                    <div className="grid md:grid-cols-2">
                      <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-surface-elevated relative">
                        {featuredPost.cover_image_url && (
                          <img
                            src={featuredPost.cover_image_url}
                            alt={featuredPost.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="label-mono">
                            {featuredPost.published_at && new Date(featuredPost.published_at).toLocaleDateString()}
                          </span>
                          <span className="text-border-subtle">•</span>
                          <span className="label-mono">
                            {Math.ceil((featuredPost.content || '').split(' ').length / 200)} min read
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 group-hover:text-accent-primary transition-colors">{featuredPost.title}</h2>
                        <p className="text-text-secondary line-clamp-3 mb-4">{featuredPost.excerpt}</p>
                        <span className="inline-flex items-center gap-2 text-accent-primary text-sm font-medium group-hover:gap-3 transition-all">
                          Read article <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Posts grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restPosts.slice(0, 9).map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block surface-card rounded-xl p-6 card-spotlight h-full flex flex-col"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="label-mono">
                          {post.published_at && new Date(post.published_at).toLocaleDateString()}
                        </span>
                        <span className="text-border-subtle">•</span>
                        <span className="label-mono">
                          {Math.ceil((post.content || '').split(' ').length / 200)} min
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent-primary transition-colors flex-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      {post.category && (
                        <span className="label-mono-accent text-[10px]">
                          {post.category.name}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
