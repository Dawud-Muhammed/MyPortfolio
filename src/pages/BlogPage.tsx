import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useBlogPosts, useBlogCategories, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { formatDate } from '../lib/utils';
import { motion } from 'framer-motion';

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
    <>
      <SeoHead title="Blog" description="Thoughts on software engineering, web development, and developer experience." seoSettings={seoSettings} />

      <div className="pt-32 pb-20">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <p className="label-mono mb-2">
              WRITINGS • TECHNICAL INSIGHTS
            </p>
            <h1 className="heading-section text-text-primary mb-4">Blog</h1>
            <p className="text-base text-text-secondary max-w-2xl">
              Thoughts on software engineering, web development, performance, and developer experience.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-12">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-accent-primary text-void-950'
                  : 'border border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            {(categories || []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-accent-primary text-void-950'
                    : 'border border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="h-64 rounded-lg shimmer" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 rounded-lg shimmer" />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-secondary">No articles found.</p>
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
                    className="group block surface-card rounded-lg overflow-hidden card-spotlight"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-surface-elevated relative">
                      {featuredPost.cover_image_url && (
                        <img
                          src={featuredPost.cover_image_url}
                          alt={featuredPost.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-transparent" />
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="label-mono">
                          {new Date(featuredPost.published_at).toLocaleDateString()}
                        </span>
                        <span className="text-border-subtle">•</span>
                        <span className="label-mono">
                          {Math.ceil((featuredPost.content || '').split(' ').length / 200)} min read
                        </span>
                      </div>
                      <h2 className="heading-display text-text-primary mb-3">{featuredPost.title}</h2>
                      <p className="text-text-secondary line-clamp-2">{featuredPost.excerpt}</p>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Recent posts grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restPosts.slice(0, 6).map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      delay: i * 0.05,
                    }}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block surface-card rounded-lg p-6 card-spotlight h-full flex flex-col"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="label-mono">
                          {new Date(post.published_at).toLocaleDateString()}
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
                        <span className="label-mono-accent text-xs">
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
    </>
  );
}
