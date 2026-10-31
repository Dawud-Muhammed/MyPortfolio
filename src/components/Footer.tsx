import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ArrowUpRight, Heart } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSocialLinks, useWebsiteSettings, useNavigationItems } from '../lib/queries';

const platformIcons: Record<string, typeof Github> = {
  GitHub: Github,
  Twitter: Twitter,
  LinkedIn: Linkedin,
  Email: Mail,
  gmail: Mail,
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
};

export function Footer() {
  const { data: socials } = useSocialLinks();
  const { data: settings } = useWebsiteSettings();
  const { data: navItems } = useNavigationItems();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');

  const visibleSocials = (socials || []).filter((s) => s.is_visible);
  const footerNav = (navItems || []).filter((n) => n.location === 'footer' && n.is_visible);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubError('');
    if (!email || !email.includes('@')) {
      setSubError('Please enter a valid email.');
      return;
    }
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, source_page: 'footer' });
    if (error) {
      if (error.code === '23505') {
        setSubError('You are already subscribed!');
      } else {
        setSubError('Something went wrong. Please try again.');
      }
      return;
    }
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="relative border-t border-border-subtle bg-void-950">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand + bio */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-md bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center">
                <span className="text-text-primary font-bold text-xs tracking-[0.2em]">D</span>
              </div>
              <span className="font-bold text-base text-text-primary tracking-tight">
                {settings?.site_name || 'Dawud'}
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md mb-6">
              {settings?.footer_bio || 'Full-stack software engineer building reliable and maintainable digital systems.'}
            </p>
            <div className="flex gap-3">
              {visibleSocials.map((s) => {
                const Icon = platformIcons[s.platform.toLowerCase()] || Mail;
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-lg border border-border-subtle hover:border-accent-primary hover:bg-accent-primary/10 flex items-center justify-center text-text-tertiary hover:text-accent-primary transition-all hover:scale-110"
                    aria-label={s.platform}
                    title={s.platform}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-6 block">Navigation</h4>
            <ul className="space-y-2.5">
              {footerNav.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.target}
                    className="text-text-tertiary hover:text-text-primary text-sm transition-colors inline-flex items-center gap-1 group font-medium"
                  >
                    {item.label}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          {settings?.newsletter_enabled && (
            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-6 block">
                Stay in Touch
              </h4>
              {subscribed ? (
                <p className="text-status-emerald text-sm font-medium">Thanks for subscribing!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-transparent border-b border-border-subtle focus:border-border-hover text-text-primary placeholder-text-tertiary focus:outline-none pb-2 text-xs transition-colors"
                  />
                  {subError && <p className="text-danger-400 text-xs">{subError}</p>}
                  <button
                    type="submit"
                    className="w-full px-4 py-2 border border-border-subtle bg-transparent text-text-primary hover:bg-surface-elevated/40 hover:border-border-hover rounded-lg font-semibold uppercase text-xs tracking-[0.12em] transition-all"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer divider and copyright */}
        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-text-mono">
            © {currentYear} {settings?.footer_copyright || 'Dawud'}. All rights reserved.
          </p>
          <p className="font-mono text-xs text-text-mono flex items-center gap-1.5">
            {settings?.footer_tagline || 'Built with care and precision'}
            <Heart size={12} className="text-status-emerald" fill="currentColor" />
          </p>
        </div>
      </div>
    </footer>
  );
}
