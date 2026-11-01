import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useProfile, useSocialLinks, useSeoSettings, useFaqs } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';

const platformIcons: Record<string, typeof Github> = {
  GitHub: Github, Twitter, LinkedIn: Linkedin, Email: Mail, gmail: Mail, github: Github, twitter: Twitter, linkedin: Linkedin,
};

export function ContactPage() {
  const { data: profile } = useProfile();
  const { data: socials } = useSocialLinks();
  const { data: seoSettings } = useSeoSettings();
  const { data: faqs } = useFaqs();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const visibleSocials = (socials || []).filter((s) => s.is_visible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('All fields are required.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
    });
    setSubmitting(false);
    if (err) {
      setError('Failed to send message. Please try again.');
      return;
    }
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <PageTransition>
      <SeoHead title="Contact" description="Get in touch for collaborations, freelance work, or just to say hi." seoSettings={seoSettings} />

      <div className="pt-32 pb-24">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <p className="label-mono-accent mb-3">Let's Connect</p>
            <h1 className="heading-display text-text-primary mb-4">Contact</h1>
            <p className="text-body-lg text-text-secondary max-w-2xl">
              Have a project in mind, a question, or just want to say hello? I'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-1"
            >
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="block border-b border-border-subtle hover:border-border-hover hover:bg-surface-elevated/20 px-4 py-5 transition-all group rounded-t-lg"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono group-hover:text-accent-primary transition-colors">
                    Email
                  </div>
                  <div className="text-sm text-text-secondary group-hover:text-text-primary mt-1 transition-colors">{profile.email}</div>
                </a>
              )}
              {profile?.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="block border-b border-border-subtle hover:border-border-hover hover:bg-surface-elevated/20 px-4 py-5 transition-all group"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono group-hover:text-accent-primary transition-colors">
                    Phone
                  </div>
                  <div className="text-sm text-text-secondary group-hover:text-text-primary mt-1 transition-colors">{profile.phone}</div>
                </a>
              )}
              {profile?.location && (
                <div className="block border-b border-border-subtle px-4 py-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono">
                    Location
                  </div>
                  <div className="text-sm text-text-secondary mt-1">{profile.location}</div>
                </div>
              )}

              {visibleSocials.length > 0 && (
                <div className="pt-6 px-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono mb-4">
                    Follow
                  </p>
                  <div className="flex gap-3">
                    {visibleSocials.map((s) => {
                      const Icon = platformIcons[s.platform.toLowerCase()] || Mail;
                      return (
                        <motion.a
                          key={s.id}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 w-10 rounded-xl border border-border-subtle hover:border-accent-primary/40 bg-surface-base/30 hover:bg-accent-primary/5 flex items-center justify-center text-text-tertiary hover:text-accent-primary transition-all duration-300"
                          aria-label={s.platform}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon size={16} />
                        </motion.a>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-3"
            >
              <div className="surface-card rounded-xl p-8">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="h-16 w-16 rounded-full bg-status-emerald/10 border border-status-emerald/25 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={28} className="text-status-emerald" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Message Sent!</h3>
                    <p className="text-text-secondary text-sm mb-6">Thanks for reaching out. I'll get back to you as soon as possible.</p>
                    <button
                      onClick={() => setSent(false)}
                      className="inline-flex items-center gap-2 px-6 py-3 border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-border-hover text-xs font-mono uppercase tracking-[0.12em] transition-all"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono mb-3">Name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Your name"
                          className="w-full bg-surface-base/50 border-b border-border-subtle focus:border-accent-primary/40 text-text-primary placeholder-text-tertiary focus:outline-none pb-3 text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono mb-3">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="your@email.com"
                          className="w-full bg-surface-base/50 border-b border-border-subtle focus:border-accent-primary/40 text-text-primary placeholder-text-tertiary focus:outline-none pb-3 text-sm transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono mb-3">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="What's this about?"
                        className="w-full bg-surface-base/50 border-b border-border-subtle focus:border-accent-primary/40 text-text-primary placeholder-text-tertiary focus:outline-none pb-3 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono mb-3">Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell me about your project..."
                        rows={5}
                        className="w-full bg-surface-base/50 border-b border-border-subtle focus:border-accent-primary/40 text-text-primary placeholder-text-tertiary focus:outline-none pb-3 resize-none text-sm transition-all"
                      />
                    </div>
                    {error && <p className="text-danger-400 text-xs font-medium">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-text-primary text-void-950 rounded-lg font-mono text-xs uppercase tracking-[0.12em] font-semibold hover:bg-text-primary/90 disabled:opacity-50 transition-all"
                    >
                      <Send size={14} />
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>

          {/* FAQs */}
          {(faqs || []).length > 0 && (
            <div className="mt-section max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <p className="label-mono-accent mb-3">Common Questions</p>
                <h2 className="heading-section text-text-primary">FAQs</h2>
              </motion.div>

              <div className="space-y-3">
                {(faqs || []).map((faq, i) => (
                  <motion.details
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="surface-card rounded-xl p-5 group"
                  >
                    <summary className="text-text-primary font-semibold cursor-pointer flex items-center justify-between list-none text-sm">
                      {faq.question}
                      <span className="text-text-tertiary group-open:rotate-45 transition-transform duration-300 text-lg ml-4 flex-shrink-0">+</span>
                    </summary>
                    <p className="text-text-secondary text-sm mt-4 leading-relaxed">{faq.answer}</p>
                  </motion.details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
