import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Quote, Sparkles, Code2, Zap, CheckCircle2 } from 'lucide-react';
import { useHeroContent, useProjects, useSkills, useTestimonials, useServices, useSeoSettings, useExperience, useProfile } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';
import { ScrollRevealSection, ScrollRevealItem } from '../components/ScrollRevealSection';
import { SpotlightCard } from '../components/SpotlightCard';
import { AnimatedButton } from '../components/AnimatedButton';

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
  const navigate = useNavigate();
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
            {/* Availability status pill: Pulsing green indicator + dynamic location */}
            {hero?.availability_status && (
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-status-emerald/10 border border-status-emerald/30 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-emerald opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-status-emerald" />
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-status-emerald">
                  • {hero.availability_label || 'OPEN TO OPPORTUNITIES'}
                </span>
              </div>
            )}

            {/* Monumental stacked display title with hollow/outlined effect */}
            <h1 className="text-display-xl font-bold uppercase mt-6 mb-4 leading-[1.1]" style={{
              WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.85)',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}>
              {profile?.name || 'DAWUD'}
            </h1>

            {/* Sub-headline: Bold engineering value prop */}
            <h2 className="text-display-md font-bold text-text-primary mb-6 leading-[1.2]">
              {hero?.subheadline || 'Full-Stack Software Engineer Building Reliable Web Systems'}
            </h2>

            {/* Bio paragraph: Dynamic from CMS */}
            <p className="text-base text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
              {profile?.bio || hero?.headline || 'I build scalable, maintainable web systems with modern technologies and engineering best practices.'}
            </p>

            {/* Dual CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              {/* Primary button: Solid background */}
              <AnimatedButton
                variant="primary"
                onClick={() => navigate(hero?.cta_primary_url || '/projects')}
              >
                {hero?.cta_primary_label || 'CONTACT ME'}
              </AnimatedButton>
              
              {/* Secondary button: Bordered */}
              {hero?.cta_secondary_label && (
                <AnimatedButton
                  variant="secondary"
                  onClick={() => navigate(hero?.cta_secondary_url || '/projects')}
                >
                  {hero.cta_secondary_label}
                </AnimatedButton>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-text-primary">{stat.value}</div>
                  <div className="text-xs text-text-tertiary mt-1 font-mono uppercase tracking-[0.12em]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 rounded-full border-2 border-text-tertiary flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-text-tertiary/60" />
          </div>
        </div>
      </section>

      {/* About / What I Offer Section */}
      <section className="py-section relative">
        <div className="section-container">
          {/* Section header: Uppercase monospace kicker */}
          <ScrollRevealSection type="combined" duration={0.6}>
            <div className="mb-16" data-scroll-reveal>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
                ABOUT • FULL-STACK • LARAVEL • REACT
              </p>
              <h2 className="text-display-md font-bold text-text-primary">What I Offer</h2>
            </div>
          </ScrollRevealSection>

          {/* Editorial split: Bio left, skill pillars right */}
          <div className="grid lg:grid-cols-2 gap-gutter items-start">
            {/* Left column: Dynamic bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <p className="text-base text-text-secondary leading-relaxed">
                {profile?.bio || 'I specialize in building full-stack web applications with modern technologies. My approach combines solid engineering fundamentals with a focus on maintainability, scalability, and reliability.'}
              </p>
            </motion.div>

            {/* Right column: Skill pillars (4-6 cards) */}
            <div className="space-y-4">
              {skillsByCategory && Object.entries(skillsByCategory).slice(0, 6).map(([category, items], idx) => (
                <SpotlightCard
                  key={category}
                  className="border border-border-subtle bg-surface-base/50 backdrop-filter backdrop-blur-sm rounded-lg p-6 hover:border-border-hover transition-all duration-300"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      delay: idx * 0.05,
                    }}
                  >
                    <h3 className="text-display-md font-bold text-text-primary mb-1">{category}</h3>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-mono">
                      {(items as any[]).map((s) => s.name).slice(0, 3).join(' • ')}
                    </p>
                  </motion.div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Technologies Matrix */}
      <section className="py-section relative">
        <div className="section-container">
          {/* Section header */}
          <ScrollRevealSection type="combined" duration={0.6}>
            <div className="mb-16" data-scroll-reveal>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
                TECHNICAL EXPERTISE • SYSTEMS & ARCHITECTURE
              </p>
              <h2 className="text-display-md font-bold text-text-primary">Skills & Technologies</h2>
            </div>
          </ScrollRevealSection>

          {/* Categorized grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillsByCategory && Object.entries(skillsByCategory).map(([category, items], catIdx) => (
              <SpotlightCard
                key={category}
                className="border border-border-subtle bg-surface-base/50 backdrop-filter backdrop-blur-sm rounded-lg p-5 hover:border-border-hover transition-all duration-300 group hover:shadow-glow-cyan"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    delay: catIdx * 0.05,
                  }}
                >
                  {/* Header */}
                  <h3 className="text-display-md font-bold text-text-primary mb-2">{category}</h3>
                  
                  {/* Monospace subtext */}
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-mono mb-4">
                    {category.replace(/\s+/g, '_').toUpperCase()}
                  </p>

                  {/* Tech badges */}
                  <div className="flex flex-wrap gap-2">
                    {(items as any[]).slice(0, 5).map((skill, idx) => (
                      <motion.span
                        key={skill.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: (catIdx * 0.05) + (idx * 0.03),
                        }}
                        className="inline-flex px-3 py-2 border border-border-subtle rounded text-xs uppercase tracking-[0.12em] text-text-secondary hover:border-border-hover hover:text-text-primary transition-all duration-300 cursor-default"
                      >
                        {skill.name}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-section relative">
        <div className="section-container">
          {/* Section header */}
          <ScrollRevealSection type="combined" duration={0.6}>
            <div className="mb-16" data-scroll-reveal>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
                    FEATURED WORK • ARCHITECTURE & DESIGN
                  </p>
                  <h2 className="text-display-md font-bold text-text-primary">Selected Projects</h2>
                </div>
                <Link to="/projects" className="hidden md:inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm font-medium group">
                  View all
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </ScrollRevealSection>

          {projectsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl shimmer" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured flagship card */}
              {displayProjects.length > 0 && (
                <SpotlightCard
                  className="group block overflow-hidden rounded-lg border border-border-subtle bg-surface-base/50 hover:border-border-hover transition-all duration-300"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <Link
                      to={`/projects/${displayProjects[0].slug}`}
                      className="group block"
                    >
                      <div className="aspect-video overflow-hidden bg-surface-elevated relative">
                        {displayProjects[0].cover_image_url && (
                          <img
                            src={displayProjects[0].cover_image_url}
                            alt={displayProjects[0].title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
                          />
                        )}
                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-transparent to-transparent" />
                        
                        {/* Metadata and title overlay */}
                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                          <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-3">
                            {displayProjects[0].category?.name || 'PROJECT'} • {new Date(displayProjects[0].created_at).getFullYear()}
                          </p>
                          <h3 className="text-display-md font-bold text-text-primary mb-2">{displayProjects[0].title}</h3>
                          <p className="text-text-secondary text-sm line-clamp-2">{displayProjects[0].excerpt || displayProjects[0].description}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </SpotlightCard>
              )}

              {/* Secondary grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayProjects.slice(1).map((project, i) => (
                  <SpotlightCard
                    key={project.id}
                    className="group block border border-border-subtle bg-surface-base/50 rounded-lg overflow-hidden hover:border-border-hover hover:shadow-glow-cyan transition-all duration-300"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        delay: (i + 1) * 0.05,
                      }}
                    >
                      <Link
                        to={`/projects/${project.slug}`}
                        className="group block"
                      >
                        {/* Image */}
                        <div className="aspect-[4/3] overflow-hidden bg-surface-elevated relative">
                          {project.cover_image_url && (
                            <img
                              src={project.cover_image_url}
                              alt={project.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          {/* Metadata */}
                          <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-mono mb-3">
                            {project.category?.name || 'PROJECT'} • {new Date(project.created_at).getFullYear()} • {(project.technologies || []).map((t) => t.name).join(', ').substring(0, 20)}
                          </p>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                            {project.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                            {project.excerpt || project.description}
                          </p>

                          {/* Tech stack badges */}
                          <div className="flex flex-wrap gap-1.5">
                            {(project.technologies || []).slice(0, 3).map((tech) => (
                              <span key={tech.id} className="inline-flex px-2 py-1 border border-border-subtle rounded text-xs uppercase tracking-[0.12em] text-text-secondary hover:border-border-hover transition-all">
                                {tech.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 md:hidden">
            <Link to="/projects" className="inline-flex items-center gap-1 text-foreground/60 hover:text-foreground text-sm font-medium">
              View all <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      {(services || []).length > 0 && (
        <section className="py-section relative">
          <div className="section-container">
            {/* Section header */}
            <ScrollRevealSection type="combined" duration={0.6}>
              <div className="mb-16" data-scroll-reveal>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
                  END-TO-END DELIVERY • ENGINEERING MINDSET
                </p>
                <h2 className="text-display-md font-bold text-text-primary">Services</h2>
              </div>
            </ScrollRevealSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(services || []).map((service, i) => {
                const Icon = serviceIcons[service.icon] || Code2;
                return (
                  <SpotlightCard
                    key={service.id}
                    className="border border-border-subtle bg-surface-base/50 backdrop-filter backdrop-blur-sm rounded-lg p-6 hover:border-border-hover hover:shadow-glow-cyan transition-all duration-300 group"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        delay: i * 0.05,
                      }}
                    >
                      <div className="h-12 w-12 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-4">
                        <Icon size={24} className="text-accent-primary" />
                      </div>
                      <h3 className="text-text-primary font-bold mb-2">{service.title}</h3>
                      <p className="text-sm text-text-secondary mb-4">{service.description}</p>
                      {(service.included_items || []).length > 0 && (
                        <ul className="space-y-1.5">
                          {(service.included_items || []).slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-xs text-text-tertiary flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-status-emerald shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  </SpotlightCard>
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
