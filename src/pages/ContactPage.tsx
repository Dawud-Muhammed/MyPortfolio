import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useProfile, useSocialLinks, useWebsiteSettings, useSeoSettings, useFaqs } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin } from 'lucide-react';

const platformIcons: Record<string, typeof Github> = {
  GitHub: Github, Twitter, LinkedIn: Linkedin, Email: Mail, gmail: Mail, github: Github, twitter: Twitter, linkedin: Linkedin,
};

export function ContactPage() {
  const { data: profile } = useProfile();
  const { data: socials } = useSocialLinks();
  const { data: settings } = useWebsiteSettings();
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
    <>
      <SeoHead title="Contact" description="Get in touch for collaborations, freelance work, or just to say hi." seoSettings={seoSettings} />

      <div className="pt-32 pb-20">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
              GET IN TOUCH • LET'S COLLABORATE
            </p>
            <h1 className="text-display-md font-bold text-text-primary mb-4">Contact</h1>
            <p className="text-base text-text-secondary max-w-2xl">
              Have a project in mind, a question, or just want to say hello? I'd love to hear from you. Fill out the form below or reach out directly through any of the channels.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left column: Social links (terminal-inspired) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-3"
            >
              {/* Email */}
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="block border-b border-border-subtle hover:border-border-hover hover:bg-surface-elevated/30 px-4 py-4 text-text-secondary hover:text-text-primary transition-all group"
                >
                  <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-mono group-hover:text-accent-primary transition-colors">
                    EMAIL
                  </div>
                  <div className="text-sm mt-1">{profile.email}</div>
                </a>
              )}

              {/* Phone */}
              {profile?.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="block border-b border-border-subtle hover:border-border-hover hover:bg-surface-elevated/30 px-4 py-4 text-text-secondary hover:text-text-primary transition-all group"
                >
                  <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-mono group-hover:text-accent-primary transition-colors">
                    PHONE
                  </div>
                  <div className="text-sm mt-1">{profile.phone}</div>
                </a>
              )}

              {/* Location */}
              {profile?.location && (
                <div className="block border-b border-border-subtle px-4 py-4 text-text-secondary">
                  <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-mono">
                    LOCATION
                  </div>
                  <div className="text-sm mt-1">{profile.location}</div>
                </div>
              )}

              {/* Social links */}
              {visibleSocials.length > 0 && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-text-mono mb-4 px-4">
                    FOLLOW
                  </p>
                  <div className="flex gap-3 px-4">
                    {visibleSocials.map((s) => {
                      const Icon = platformIcons[s.platform.toLowerCase()] || Mail;
                      return (
                        <a
                          key={s.id}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 w-10 rounded-lg border border-border-subtle hover:border-border-hover hover:bg-surface-elevated/60 flex items-center justify-center text-text-secondary hover:text-accent-primary transition-all hover:scale-110"
                          aria-label={s.platform}
                          title={s.platform}
                        >
                          <Icon size={18} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right column: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="border border-border-subtle bg-surface-base/50 backdrop-filter backdrop-blur-sm rounded-lg p-8">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-status-emerald/10 border border-status-emerald/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} className="text-status-emerald" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Message Sent!</h3>
                    <p className="text-text-secondary text-sm mb-6">Thanks for reaching out. I'll get back to you as soon as possible.</p>
                    <button
                      onClick={() => setSent(false)}
                      className="inline-flex items-center gap-2 px-6 py-3 border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name & Email row */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-[0.12em] text-text-mono mb-3">
                          Name
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Your name"
                          className="w-full bg-transparent border-b border-border-subtle focus:border-border-hover text-text-primary placeholder-text-tertiary focus:outline-none pb-2 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-[0.12em] text-text-mono mb-3">
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="your@email.com"
                          className="w-full bg-transparent border-b border-border-subtle focus:border-border-hover text-text-primary placeholder-text-tertiary focus:outline-none pb-2 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-[0.12em] text-text-mono mb-3">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="What's this about?"
                        className="w-full bg-transparent border-b border-border-subtle focus:border-border-hover text-text-primary placeholder-text-tertiary focus:outline-none pb-2 transition-colors"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-[0.12em] text-text-mono mb-3">
                        Message
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell me about your project..."
                        rows={6}
                        className="w-full bg-transparent border-b border-border-subtle focus:border-border-hover text-text-primary placeholder-text-tertiary focus:outline-none pb-2 resize-none transition-colors"
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="text-danger-400 text-xs font-medium">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 border border-border-subtle bg-text-primary text-void-950 rounded-lg font-semibold uppercase text-xs tracking-[0.12em] hover:bg-text-primary/90 disabled:opacity-50 transition-all"
                    >
                      <Send size={16} />
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
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
                  FREQUENTLY ASKED QUESTIONS
                </p>
                <h2 className="text-display-md font-bold text-text-primary">FAQs</h2>
              </motion.div>

              <div className="space-y-3">
                {(faqs || []).map((faq, i) => (
                  <motion.details
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.4,
                    }}
                    className="border border-border-subtle bg-surface-base/50 backdrop-filter backdrop-blur-sm rounded-lg p-5 group hover:border-border-hover transition-all"
                  >
                    <summary className="text-text-primary font-semibold cursor-pointer flex items-center justify-between list-none">
                      {faq.question}
                      <span className="text-text-tertiary group-open:rotate-45 transition-transform text-lg">+</span>
                    </summary>
                    <p className="text-text-secondary text-sm mt-3 leading-relaxed">{faq.answer}</p>
                  </motion.details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
