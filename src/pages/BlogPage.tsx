import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { useBlogPosts, useBlogCategories, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { formatDate } from '../lib/utils';
import { motion } from 'framer-motion';

export function BlogPage() {
  const { data: posts, loading } = useBlogPosts();
  const { data: categories } = useBlogCategories();
  const { data: seoSettings } = useSeoSettings();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const publishedPosts = (posts || []).filter((p) => p.status === 'Published' || p.status === 'Draft');
  const filtered = publishedPosts.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category_id === activeCategory;
    const matchesSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
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
            className="text-center mb-12"
          >
            <p className="text-accent-400 font-mono text-sm tracking-widest mb-2 uppercase">Writing</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Blog</h1>
            <p className="text-foreground/50 max-w-2xl mx-auto">
              Thoughts on software engineering, web development, performance, and developer experience.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === 'all' ? 'bg-accent-500 text-white' : 'glass text-foreground/60 hover:text-foreground'
                }`}
              >
                All
              </button>
              {(categories || []).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat.id ? 'bg-accent-500 text-white' : 'glass text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground !placeholder-foreground-muted/50 pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="h-64 rounded-2xl shimmer" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 rounded-2xl shimmer" />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-foreground/40">No articles found.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featuredPost && (
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="group block glass rounded-3xl overflow-hidden card-hover mb-10"
                >
                  <div className="grid md:grid-cols-2">
                    {featuredPost.cover_image_url && (
                      <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-foreground/5">
                        <img src={featuredPost.cover_image_url} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-8 flex flex-col justify-center">
                      {featuredPost.category && (
                        <span className="text-xs font-medium mb-3" style={{ color: featuredPost.category.color }}>
                          {featuredPost.category.name}
                        </span>
                      )}
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-accent-400 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-foreground/50 mb-4 line-clamp-3">{featuredPost.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-foreground/40">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(featuredPost.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {featuredPost.reading_time} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Rest of posts */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block glass rounded-2xl overflow-hidden card-hover h-full"
                    >
                      {post.cover_image_url && (
                        <div className="aspect-[16/10] overflow-hidden bg-foreground/5">
                          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-5">
                        {post.category && (
                          <span className="text-xs font-medium mb-2 block" style={{ color: post.category.color }}>
                            {post.category.name}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent-400 transition-colors flex items-start gap-1">
                          {post.title}
                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                        </h3>
                        <p className="text-sm text-foreground/50 line-clamp-2 mb-3">{post.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-foreground/40">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(post.published_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {post.reading_time} min
                          </span>
                        </div>
                      </div>
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
