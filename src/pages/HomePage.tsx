import { Link } from 'react-router-dom';
import { Star, Quote, ArrowUpRight } from 'lucide-react';
import { useHeroContent, useTestimonials, useSeoSettings, useExperience, useProfile } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';

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
  const { data: experience } = useExperience();
  const { data: testimonials } = useTestimonials();
  const { data: seoSettings } = useSeoSettings();

  const stats = [
    { label: 'Years Experience', value: String(computeYearsExperience(experience || [])) },
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
