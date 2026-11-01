import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, Filter } from 'lucide-react';
import { useProjects, useProjectCategories, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';

export function ProjectsPage() {
  const { data: projects, loading } = useProjects();
  const { data: categories } = useProjectCategories();
  const { data: seoSettings } = useSeoSettings();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = (projects || []).filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category_id === activeCategory;
    const matchesSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <PageTransition>
      <SeoHead title="Projects" description="Explore my portfolio of web applications, open source tools, and developer products." seoSettings={seoSettings} />

      <div className="pt-32 pb-24">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="mb-16"
          >
            <p className="label-mono-accent mb-3">Portfolio</p>
            <h1 className="heading-display text-text-primary mb-4">Projects</h1>
            <p className="text-body-lg text-text-secondary max-w-2xl">
              A collection of things I've built — from open source libraries to full-scale products. Each project represents a problem I wanted to solve.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10"
          >
            <div className="flex flex-wrap items-center gap-2">
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
            </div>

            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-surface-base/50 border border-border-subtle focus:border-accent-primary/30 rounded-lg py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder-text-tertiary focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(56,189,248,0.06)]"
              />
            </div>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-xl skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <Filter className="mx-auto text-text-tertiary/30 mb-4" size={48} />
              <p className="text-text-tertiary">No projects found matching your filters.</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((project, i) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  >
                    <Link
                      to={`/projects/${project.slug}`}
                      className="group block surface-card rounded-xl overflow-hidden card-spotlight h-full"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-surface-elevated relative">
                        {project.cover_image_url && (
                          <img
                            src={project.cover_image_url}
                            alt={project.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`badge text-[10px] ${project.status === 'Live' ? '!bg-status-emerald/15 !text-status-emerald !border-status-emerald/25' : '!bg-warning-500/15 !text-warning-400 !border-warning-500/25'}`}>
                            {project.status}
                          </span>
                        </div>
                        {project.is_featured && (
                          <div className="absolute top-3 left-3">
                            <span className="badge-accent text-[10px]">Featured</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          {project.category && (
                            <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: project.category.color }}>
                              {project.category.name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent-primary transition-colors flex items-center gap-1.5">
                          {project.title}
                          <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </h3>
                        <p className="text-sm text-text-secondary line-clamp-2 mb-4">{project.excerpt || project.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(project.technologies || []).slice(0, 4).map((tech) => (
                            <span key={tech.id} className="badge text-[10px] !py-0.5">{tech.name}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
