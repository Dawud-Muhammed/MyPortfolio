import { Star, Quote, ArrowUpRight } from 'lucide-react';
import { useHeroContent, useTestimonials, useSeoSettings, useExperience, useProfile, useProjects } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { CountUp } from '../components/CountUp';
import { MagneticButton } from '../components/MagneticButton';

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

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export function HomePage() {
  const { data: hero } = useHeroContent();
  const { data: profile } = useProfile();
  const { data: experience } = useExperience();
  const { data: projects } = useProjects();
  const { data: testimonials } = useTestimonials();
  const { data: seoSettings } = useSeoSettings();

  const yearsExp = computeYearsExperience(experience || []);
  const projectCount = (projects || []).length;

  return (
    <PageTransition>
      <SeoHead seoSettings={seoSettings} />

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Geometric background accent */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] border border-border-subtle/30 rounded-full opacity-20" />
          <div className="absolute top-1/3 right-12 w-[350px] h-[350px] border border-accent-primary/10 rounded-full opacity-30" />
          <div className="absolute bottom-1/4 left-0 w-[200px] h-[200px] border border-border-subtle/20 rounded-full opacity-20" />
        </div>

        <div className="section-container w-full relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto"
          >
            {/* Availability pill */}
            {hero?.availability_status && (
              <motion.div variants={fadeUp} className="flex justify-center lg:justify-start mb-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-status-emerald/8 border border-status-emerald/20 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-emerald opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-status-emerald" />
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-status-emerald">
                    {hero.availability_label || 'Open to Opportunities'}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Name - monumental */}
            <motion.h1
              variants={fadeUp}
              className="text-center lg:text-left text-display-xl font-bold uppercase leading-[0.95] mb-6"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.7)',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {profile?.name || 'DAWUD'}
            </motion.h1>

            {/* Role/subheadline */}
            <motion.h2
              variants={fadeUp}
              className="text-center lg:text-left text-display-md font-bold text-text-primary mb-10 max-w-3xl"
            >
              {hero?.subheadline || 'Full-Stack Software Engineer Building Reliable Web Systems'}
            </motion.h2>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-16">
              <MagneticButton
                href={hero?.cta_primary_url || '/contact'}
                variant="primary"
              >
                {hero?.cta_primary_label || 'Get in Touch'}
                <ArrowUpRight size={16} />
              </MagneticButton>
              <MagneticButton
                href={hero?.cta_secondary_url || '/projects'}
                variant="secondary"
              >
                {hero?.cta_secondary_label || 'View Projects'}
              </MagneticButton>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-10 lg:gap-16"
            >
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-text-primary">
                  <CountUp end={yearsExp} suffix="+" />
                </div>
                <div className="text-[11px] text-text-tertiary mt-1 font-mono uppercase tracking-[0.15em]">
                  Years Experience
                </div>
              </div>
              {projectCount > 0 && (
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold text-text-primary">
                    <CountUp end={projectCount} suffix="+" />
                  </div>
                  <div className="text-[11px] text-text-tertiary mt-1 font-mono uppercase tracking-[0.15em]">
                    Projects Built
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <motion.div
            className="w-5 h-8 rounded-full border border-text-tertiary/40 flex items-start justify-center p-1.5"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-0.5 h-1.5 rounded-full bg-text-tertiary/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Testimonials ─── */}
      {(testimonials || []).length > 0 && (
        <section className="py-section relative">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p className="label-mono-accent mb-3">Kind Words</p>
              <h2 className="heading-section text-text-primary">What People Say</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {(testimonials || []).slice(0, 4).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="surface-card rounded-xl p-6 relative"
                >
                  <Quote size={28} className="text-accent-primary/10 absolute top-5 right-5" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} size={13} className="text-warning-400" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-5">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 border border-accent-primary/20 flex items-center justify-center text-text-primary font-bold text-xs">
                        {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="text-text-primary font-medium text-sm">{t.name}</p>
                      <p className="text-text-tertiary text-xs">{t.role}{t.company ? `, ${t.company}` : ''}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="py-section relative">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl p-12 md:p-16 text-center max-w-3xl mx-auto overflow-hidden"
          >
            {/* Glass bg */}
            <div className="absolute inset-0 bg-surface-elevated/40 backdrop-blur-xl border border-border-subtle rounded-2xl" />
            {/* Gradient accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />

            <div className="relative z-10">
              <h2 className="text-display-md font-bold text-text-primary mb-4">
                Let's build something great
              </h2>
              <p className="text-text-secondary text-base mb-10 max-w-xl mx-auto">
                I'm currently available for new projects. Whether you have a question, a project idea, or just want to connect.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton href="/contact" variant="primary">
                  Get in Touch
                  <ArrowUpRight size={16} />
                </MagneticButton>
                <MagneticButton href="/projects" variant="secondary">
                  View My Work
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
