import { Code2, Zap, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useServices, useTestimonials, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { MagneticButton } from '../components/MagneticButton';

const serviceIcons: Record<string, typeof Code2> = { Code: Code2, Zap, Sparkles };

export function ServicesPage() {
  const { data: services } = useServices();
  const { data: testimonials } = useTestimonials();
  const { data: seoSettings } = useSeoSettings();

  return (
    <PageTransition>
      <SeoHead title="Services" description="Web development, consulting, and design services tailored to your needs." seoSettings={seoSettings} />

      <div className="pt-32 pb-24">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="label-mono-accent mb-3">What I Offer</p>
            <h1 className="heading-display text-text-primary mb-4">Services</h1>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              From full-stack web development to technical consulting, I help teams and individuals bring their ideas to life with clean, performant code.
            </p>
          </motion.div>

          {/* Services grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-section">
            {(services || []).map((service, i) => {
              const Icon = serviceIcons[service.icon] || Code2;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="surface-card rounded-2xl p-8 group hover:shadow-glow-cyan/5 transition-all duration-500"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-accent-primary/8 border border-accent-primary/15 flex items-center justify-center shrink-0 group-hover:border-accent-primary/30 transition-colors">
                      <Icon size={22} className="text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary mb-2">{service.title}</h3>
                      <p className="text-text-secondary text-sm leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                  {(service.included_items || []).length > 0 && (
                    <ul className="space-y-2.5 pt-5 border-t border-border-subtle">
                      {(service.included_items || []).map((item, idx) => (
                        <li key={idx} className="text-sm text-text-secondary flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-status-emerald shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Testimonials */}
          {(testimonials || []).length > 0 && (
            <section className="mb-section">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <p className="label-mono-accent mb-3">Testimonials</p>
                <h2 className="heading-section text-text-primary">What Clients Say</h2>
              </motion.div>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {(testimonials || []).map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="surface-card rounded-xl p-6"
                  >
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <span key={idx} className="text-warning-400 text-sm">★</span>
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
            </section>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl p-12 md:p-16 text-center max-w-3xl mx-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-surface-elevated/40 backdrop-blur-xl border border-border-subtle rounded-2xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-display-md font-bold text-text-primary mb-4">Ready to start your project?</h2>
              <p className="text-text-secondary text-base mb-10">Let's discuss how I can help you build something great.</p>
              <MagneticButton href="/contact" variant="primary">
                Get in Touch <ArrowRight size={14} />
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
