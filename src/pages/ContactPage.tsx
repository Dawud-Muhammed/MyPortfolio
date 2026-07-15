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
            className="text-center mb-16"
          >
            <p className="text-accent-400 font-mono text-sm tracking-widest mb-2 uppercase">Get in Touch</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Let's Talk</h1>
            <p className="text-foreground/50 max-w-2xl mx-auto">
              Have a project in mind, a question, or just want to say hello? I'd love to hear from you. Fill out the form below or reach me directly.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-4"
            >
              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="glass rounded-2xl p-6 flex items-start gap-4 card-hover block">
                  <div className="h-12 w-12 rounded-xl bg-accent-500/10 flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-accent-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold mb-1">Email</h3>
                    <p className="text-foreground/50 text-sm">{profile.email}</p>
                  </div>
                </a>
              )}

              {profile?.phone && (
                <a href={`tel:${profile.phone}`} className="glass rounded-2xl p-6 flex items-start gap-4 card-hover block">
                  <div className="h-12 w-12 rounded-xl bg-accent-500/10 flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-accent-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold mb-1">Phone</h3>
    <p className="text-foreground/50 text-sm">{profile.phone}</p>
                  </div>
                </a>
              )}

              {profile?.location && (
                <div className="glass rounded-2xl p-6 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-accent-500/10 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-accent-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold mb-1">Location</h3>
                    <p className="text-foreground/50 text-sm">{profile.location}</p>
                  </div>
                </div>
              )}

              {/* Social links */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-foreground font-semibold mb-4">Follow Me</h3>
                <div className="flex gap-3">
                  {visibleSocials.map((s) => {
                    const Icon = platformIcons[s.platform.toLowerCase()] || Mail;
                    return (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-all hover:scale-110"
                        aria-label={s.platform}
                      >
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Map */}
              {settings?.map_embed_url && (
                <div className="glass rounded-2xl p-2 overflow-hidden">
                  <iframe
                    src={settings.map_embed_url}
                    width="100%"
                    height="200"
                    style={{ border: 0, borderRadius: '1rem' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location map"
                  />
                </div>
              )}
            </motion.div>

            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="glass rounded-3xl p-8">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} className="text-success-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
                    <p className="text-foreground/50 mb-6">Thanks for reaching out. I'll get back to you as soon as possible.</p>
                    <button onClick={() => setSent(false)} className="btn-ghost !text-foreground !border-foreground/20 hover:!bg-foreground/10">
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-foreground/70 text-sm font-medium mb-2 block">Name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Your name"
                          className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground !placeholder-foreground-muted/50"
                        />
                      </div>
                      <div>
                        <label className="text-foreground/70 text-sm font-medium mb-2 block">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="your@email.com"
                          className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground !placeholder-foreground-muted/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-foreground/70 text-sm font-medium mb-2 block">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="What's this about?"
                        className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground !placeholder-foreground-muted/50"
                      />
                    </div>
                    <div>
                      <label className="text-foreground/70 text-sm font-medium mb-2 block">Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell me about your project..."
                        rows={6}
                        className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground !placeholder-foreground-muted/50 resize-none"
                      />
                    </div>
                    {error && <p className="text-error-400 text-sm">{error}</p>}
                    <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
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
            <div className="mt-20 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground text-center mb-10">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {(faqs || []).map((faq, i) => (
                  <motion.details
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-2xl p-5 group"
                  >
                    <summary className="text-foreground font-medium cursor-pointer flex items-center justify-between list-none">
                      {faq.question}
                      <span className="text-foreground/40 group-open:rotate-45 transition-transform text-xl">+</span>
                    </summary>
                    <p className="text-foreground/50 text-sm mt-3 leading-relaxed">{faq.answer}</p>
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
