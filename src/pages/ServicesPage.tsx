import { Code2, Zap, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServices, useTestimonials, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';

const serviceIcons: Record<string, typeof Code2> = { Code: Code2, Zap, Sparkles };

export function ServicesPage() {
  const { data: services } = useServices();
  const { data: testimonials } = useTestimonials();
  const { data: seoSettings } = useSeoSettings();

  return (
    <>
      <SeoHead title="Services" description="Web development, consulting, and design services tailored to your needs." seoSettings={seoSettings} />

      <div className="pt-32 pb-20">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-accent-400 font-mono text-sm tracking-widest mb-2 uppercase">What I Offer</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Services</h1>
            <p className="text-foreground/50 max-w-2xl mx-auto">
              From full-stack web development to technical consulting, I help teams and individuals bring their ideas to life with clean, performant code.
            </p>
          </motion.div>

          {/* Services grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-20">
            {(services || []).map((service, i) => {
              const Icon = serviceIcons[service.icon] || Code2;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-3xl p-8 card-hover"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-accent-500/10 flex items-center justify-center shrink-0">
                      <Icon size={28} className="text-accent-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
                      <p className="text-foreground/50 text-sm leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                  {(service.included_items || []).length > 0 && (
                    <ul className="space-y-2 pt-4 border-t border-foreground/10">
                      {(service.included_items || []).map((item, idx) => (
                        <li key={idx} className="text-sm text-foreground/60 flex items-start gap-2">
                          <CheckCircle2 size={16} className="text-accent-400 shrink-0 mt-0.5" />
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
            <section className="mb-20">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">What Clients Say</h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {(testimonials || []).map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <span key={idx} className="text-warning-400 text-lg">★</span>
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
            </section>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to start your project?</h2>
            <p className="text-foreground/60 text-lg mb-8">Let's discuss how I can help you build something great.</p>
            <Link to="/contact" className="btn-primary group inline-flex">
              Get in Touch
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
