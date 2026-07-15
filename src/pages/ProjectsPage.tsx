import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Filter } from 'lucide-react';
import { useProjects, useProjectCategories, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';

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
    <>
      <SeoHead title="Projects" description="Explore my portfolio of web applications, open source tools, and developer products." seoSettings={seoSettings} />

      <div className="pt-32 pb-20">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="text-accent-400 font-mono text-sm tracking-widest mb-2 uppercase">Portfolio</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Projects</h1>
            <p className="text-foreground/50 max-w-2xl mx-auto">
              A collection of things I've built — from open source libraries to full-scale SaaS products. Each project represents a problem I wanted to solve.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === 'all'
                    ? 'bg-accent-500 text-white'
                    : 'glass text-foreground/60 hover:text-foreground'
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
                      ? 'bg-accent-500 text-white'
                      : 'glass text-foreground/60 hover:text-foreground'
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
                placeholder="Search projects..."
                className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground !placeholder-foreground-muted/50 pl-10"
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-foreground/40">No projects found matching your filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/projects/${project.slug}`}
                    className="group block glass rounded-2xl overflow-hidden card-hover"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-foreground/5 relative">
                      {project.cover_image_url && (
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`badge ${project.status === 'Live' ? '!bg-success-500/20 !text-success-400 !border-success-500/30' : '!bg-warning-500/20 !text-warning-400 !border-warning-500/30'}`}>
                          {project.status}
                        </span>
                      </div>
                      {project.is_featured && (
                        <div className="absolute top-3 left-3">
                          <span className="badge !bg-accent-500/20 !text-accent-400 !border-accent-500/30">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {project.category && (
                          <span className="text-xs font-medium" style={{ color: project.category.color }}>
                            {project.category.name}
                          </span>
                        )}
                        <span className="text-foreground/20">·</span>
                        <span className="text-xs text-foreground/40">{project.difficulty}</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent-400 transition-colors flex items-center gap-1">
                        {project.title}
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-sm text-foreground/50 line-clamp-2">{project.excerpt || project.description}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {(project.technologies || []).slice(0, 4).map((tech) => (
                          <span key={tech.id} className="badge !text-xs !py-0.5">
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
