import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Mail, Send } from 'lucide-react';
import { useProfile, useSocialLinks, useSeoSettings, useFaqs, useWebsiteSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { PageHeading } from '../components/PublicContent';
import { safeUrl } from '../lib/utils';

export function ContactPage() {
  const { data: profile } = useProfile();
  const { data: socials } = useSocialLinks();
  const { data: seoSettings } = useSeoSettings();
  const { data: faqs } = useFaqs();
  const { data: settings } = useWebsiteSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const startedAt = useRef(Date.now());
  const controller = useRef<AbortController | null>(null);
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    if (!navigator.onLine) { setError('You appear to be offline. Reconnect or use the direct contact details.'); return; }
    if ([form.name, form.email, form.subject, form.message].some(value => !value.trim())) { setError('Please complete all fields.'); return; }
    setSubmitting(true);
    controller.current = new AbortController();
    const timeout = window.setTimeout(() => controller.current?.abort(), 20000);
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, startedAt: startedAt.current }), signal: controller.current.signal });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw new Error(result?.message || 'The contact service is unavailable. Please use a direct contact option.');
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
    } catch (cause) {
      setError(cause instanceof Error && cause.name === 'AbortError' ? 'The request timed out. Delivery is unconfirmed; please use a direct contact option before resending.' : cause instanceof Error ? cause.message : 'Your message could not be submitted. Please try again.');
    } finally { window.clearTimeout(timeout); setSubmitting(false); window.setTimeout(() => feedback.current?.focus(), 0); }
  };
  const whatsapp = settings?.whatsapp_enabled && settings.whatsapp_number?.replace(/\D/g, '');
  const contactFaqs = faqs.filter(faq => /contact|service|general/i.test(faq.category)).slice(0, 6);
  const fieldClass = 'w-full min-h-12 rounded-lg border border-border-subtle bg-surface-base text-text-primary px-4 py-3';
  return <div className="section-container pt-32 pb-24">
    <SeoHead title="Contact" description="Contact Dawud Muhammed about backend development, full-stack projects, and collaboration." seoSettings={seoSettings} />
    <PageHeading eyebrow="Start a conversation" title="Let’s build something useful.">Tell me about your project, the problem you’re solving, and where you could use a hand.</PageHeading>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-12 lg:gap-24">
      <aside className="min-w-0"><h2 className="text-xl text-text-primary font-medium mb-6">Reach me directly</h2>
        {profile?.email && <a href={`mailto:${profile.email}`} className="flex items-start gap-3 text-accent-primary py-4 min-h-11 break-all"><Mail size={20} className="shrink-0 mt-0.5" />{profile.email}</a>}
        {profile?.phone && <a href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`} className="block text-text-primary min-h-11 py-3">{profile.phone}</a>}
        {whatsapp && <a href={`https://wa.me/${whatsapp}${settings?.whatsapp_message?.trim() ? `?text=${encodeURIComponent(settings.whatsapp_message)}` : ''}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-11 text-accent-primary">Message on WhatsApp <ArrowUpRight size={16} /></a>}
        {profile?.location && <p className="text-text-secondary py-4">{profile.location}{profile.timezone && <span className="block text-sm mt-2">{profile.timezone}</span>}</p>}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">{socials.filter(item => item.is_visible && safeUrl(item.url)).map(item => <a key={item.id} href={safeUrl(item.url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 min-h-11 text-text-secondary hover:text-accent-primary">{item.platform}<ArrowUpRight size={14} /></a>)}</div>
      </aside>
      <div className="min-w-0">
        {sent ? <div ref={feedback} tabIndex={-1} role="status" className="border border-border-subtle rounded-xl p-8"><h2 className="text-2xl text-text-primary mb-4">Message received.</h2><p className="text-text-secondary leading-relaxed">Your message has been saved in my portfolio inbox. Thanks for getting in touch.</p><button className="mt-6 text-accent-primary underline min-h-11" onClick={() => { setSent(false); startedAt.current = Date.now(); }}>Write another message</button></div> : <form onSubmit={handleSubmit} className="surface-card rounded-2xl border border-border-subtle bg-surface-base p-6 md:p-8 space-y-5" aria-describedby="contact-privacy">
          <div className="grid sm:grid-cols-2 gap-5"><div><label htmlFor="contact-name" className="block text-sm text-text-primary mb-2">Your name</label><input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className={fieldClass} /></div><div><label htmlFor="contact-email" className="block text-sm text-text-primary mb-2">Email address</label><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className={fieldClass} /></div></div>
          <div><label htmlFor="contact-subject" className="block text-sm text-text-primary mb-2">What is it about?</label><input id="contact-subject" name="subject" required minLength={3} maxLength={160} value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} className={fieldClass} /></div>
          <div><label htmlFor="contact-message" className="block text-sm text-text-primary mb-2">Your message</label><textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={6} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} className={fieldClass + ' resize-y'} /><p className="mt-2 text-xs text-text-secondary text-right">{form.message.length} / 5,000 characters</p></div>
          <div hidden aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={event => setForm({ ...form, website: event.target.value })} /></div>
          <p id="contact-privacy" className="text-sm text-text-secondary leading-relaxed">Your details are used to respond to this enquiry and stored in my private portfolio inbox. Please don’t include passwords or other sensitive information.</p>
          {error && <div ref={feedback} role="alert" tabIndex={-1} className="text-danger rounded-lg border border-danger/40 p-4">{error}</div>}
          <button type="submit" disabled={submitting} className="studio-button primary inline-flex min-h-12 items-center justify-center gap-3 px-6 disabled:opacity-50"><Send size={17} />{submitting ? 'Sending…' : 'Send message'}</button>
        </form>}
      </div>
    </div>
    {!!contactFaqs.length && <section className="mt-20 border-t border-border-subtle pt-10 max-w-3xl"><h2 className="text-2xl font-medium text-text-primary mb-6">A few useful details</h2>{contactFaqs.map(faq => <details key={faq.id} className="border-b border-border-subtle py-5"><summary className="min-h-11 cursor-pointer text-text-primary">{faq.question}</summary><p className="text-text-secondary leading-relaxed whitespace-pre-line mt-3">{faq.answer}</p></details>)}</section>}
  </div>;
}
