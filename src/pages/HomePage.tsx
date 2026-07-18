import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Star, Quote, Sparkles, Code2, Zap, CheckCircle2, Download } from 'lucide-react';
import { useHeroContent, useProjects, useSkills, useTestimonials, useServices, useSeoSettings, useExperience, useProfile } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';

const serviceIcons: Record<string, typeof Code2> = {
  Code: Code2,
  Zap: Zap,
  Sparkles: Sparkles,
};

function computeYearsExperience(experience: { start_date: string; end_date: string | null; is_current: boolean }[]): number {
  if (!experience || experience.length === 0) return 0;
  const earliest = experience.reduce((min, exp) => {
    const start = new Date(exp.start_date).getTime();
    return start < min ? start : min;
  }, Infinity);
  if (earliest === Infinity) return 0;
  const latest = experience.reduce((max, exp) => {
    const end = exp.is_current ? Date.now() : (exp.end_date ? new Date(exp.end_date).getTime() : Date.now());
    return end > max ? end : max;
  }, 0);
  const diffMs = latest - earliest;
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(years));
}

export function HomePage() {
  const { data: hero } = useHeroContent();
  const { data: profile } = useProfile(); 
  const { data: projects, loading: projectsLoading } = useProjects();
  const { data: skills } = useSkills();
  const { data: experience } = useExperience();
  const { data: testimonials } = useTestimonials();
  const { data: services } = useServices();
  const { data: seoSettings } = useSeoSettings();

  const featuredProjects = (projects || []).filter((p) => p.is_featured).slice(0, 3);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : (projects || []).slice(0, 3);
  const skillsByCategory = (skills || []).reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, typeof skills>);

  const stats = [
    { label: 'Years Experience', value: String(computeYearsExperience(experience || [])) },
    { label: 'Projects Shipped', value: String((projects || []).length) },
    { label: 'Skills', value: String((skills || []).length) },
  ];

  const headline = hero?.headline || 'I build things for the web';
  const highlightedWord = hero?.highlighted_word || 'the web';
  const headlineParts = headline.split(highlightedWord);

  return (
    <>
      <SeoHead seoSettings={seoSettings} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="section-container w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Availability badge */}
            {hero?.availability_status && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
                </span>
                <span className="text-foreground/80 text-sm font-medium">{hero.availability_label || 'Available for work'}</span>
              </div>
            )}

            {/* Kicker */}
            {hero?.kicker && (
              <p className="text-accent-400 font-mono text-sm tracking-widest mb-6 uppercase">
                {hero.kicker}
              </p>
            )}

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight text-balance">
              {headlineParts[0]}
              <span className="text-gradient">{highlightedWord}</span>
              {headlineParts[1]}
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed text-balance">
              {hero?.subheadline || 'Full-stack engineer crafting performant, accessible, and beautiful digital products.'}
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={hero?.cta_primary_url || '/projects'} className="btn-primary group">
                {hero?.cta_primary_label || 'View Projects'}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              
              {/* Secondary CTA: Now acts as the CV Downloader */}
              {profile?.resume_url ? (
                <a
                  href={profile.resume_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost !text-foreground !border-foreground/20 hover:!bg-foreground/10 flex items-center gap-2"
                >
                  <Download size={16} />
                  {hero?.cta_secondary_label || 'Download CV'}
                </a>
              ) : (
                <button disabled className="btn-ghost !text-foreground !border-foreground/20 opacity-50 cursor-not-allowed flex items-center gap-2" title="No resume uploaded yet">
                  <Download size={16} />
                  {hero?.cta_secondary_label || 'Download CV'}
                </button>
              )}
            </div>
            {/* Quick stats */}
            <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-foreground/40 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 rounded-full border-2 border-foreground/20 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-foreground/40" />
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 relative">
        <div className="section-container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-accent-400 font-mono text-sm tracking-widest mb-2 uppercase">Featured Work</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Selected Projects</h2>
            </div>
            <Link to="/projects" className="hidden md:inline-flex items-center gap-1 text-foreground/60 hover:text-foreground text-sm font-medium group">
              View all
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {projectsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
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
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {project.category && (
                          <span className="text-xs font-medium" style={{ color: project.category.color }}>
                            {project.category.name}
                          </span>
                        )}
                        <span className="text-foreground/20">·</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent-400 transition-colors">
                        {project.title}
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

          <div className="mt-8 md:hidden">
            <Link to="/projects" className="inline-flex items-center gap-1 text-foreground/60 hover:text-foreground text-sm font-medium">
              View all <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-24 relative">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="text-accent-400 font-mono text-sm tracking-widest mb-2 uppercase">Tech Stack</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Skills & Expertise</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(skillsByCategory).map(([category, items], catIdx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIdx * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent-400" />
                  {category}
                </h3>
                <div className="space-y-3">
                  {(items as any[]).map((skill) => (
                    <div key={skill.id} className="flex items-center gap-3">
                      {skill.icon_url ? (
                        <img src={skill.icon_url} alt={skill.name} className="h-6 w-6 rounded object-contain shrink-0" />
                      ) : (
                        <span className="h-6 w-6 rounded bg-accent-500/15 text-accent-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {skill.name.trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="text-sm text-foreground/70">{skill.name.trim()}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      {(services || []).length > 0 && (
        <section className="py-24 relative">
          <div className="section-container">
            <div className="text-center mb-12">
              <p className="text-accent-400 font-mono text-sm tracking-widest mb-2 uppercase">What I Do</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Services</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(services || []).map((service, i) => {
                const Icon = serviceIcons[service.icon] || Code2;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-2xl p-6 card-hover"
                  >
                    <div className="h-12 w-12 rounded-xl bg-accent-500/10 flex items-center justify-center mb-4">
                      <Icon size={24} className="text-accent-400" />
                    </div>
                    <h3 className="text-foreground font-bold mb-2">{service.title}</h3>
                    <p className="text-sm text-foreground/50 mb-4">{service.description}</p>
                    {(service.included_items || []).length > 0 && (
                      <ul className="space-y-1.5">
                        {(service.included_items || []).map((item, idx) => (
                          <li key={idx} className="text-xs text-foreground/60 flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-accent-400 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {(testimonials || []).length > 0 && (
        <section className="py-24 relative">
          <div className="section-container">
            <div className="text-center mb-12">
              <p className="text-accent-400 font-mono text-sm tracking-widest mb-2 uppercase">Kind Words</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Testimonials</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {(testimonials || []).slice(0, 4).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6 card-hover relative"
                >
                  <Quote size={32} className="text-accent-400/20 absolute top-4 right-4" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} size={14} className="text-warning-400" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-foreground/70 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-foreground font-bold text-sm">
                        {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="text-foreground font-medium text-sm">{t.name}</p>
                      <p className="text-foreground/40 text-xs">{t.role}{t.company ? `, ${t.company}` : ''}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 relative">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Let's build something great together</h2>
            <p className="text-foreground/60 text-lg mb-8 max-w-xl mx-auto">
              I'm currently available for new projects. Whether you have a question, a project idea, or just want to say hi, my inbox is always open.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-primary group">
                Get in Touch
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              <Link to="/projects" className="btn-ghost !text-foreground !border-foreground/20 hover:!bg-foreground/10">
                View My Work
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
