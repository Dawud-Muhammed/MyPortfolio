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
    <footer className="relative mt-section border-t border-border-subtle bg-void-950">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand + bio */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-accent-cyan to-accent-cyan/60 flex items-center justify-center border border-accent-cyan/50">
                <span className="text-text-primary font-bold text-xs tracking-wider">D</span>
              </div>
              <span className="font-bold text-base text-text-primary tracking-tight">
                {settings?.site_name || 'Dawud Muhammed'}
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
                    className="h-10 w-10 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent-cyan hover:bg-accent-cyan/10 flex items-center justify-center text-text-secondary hover:text-accent-cyan transition-all hover:scale-110"
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
            <h4 className="label-mono-accent mb-6 block">Navigation</h4>
            <ul className="space-y-2.5">
              {footerNav.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.target}
                    className="text-text-secondary hover:text-accent-cyan text-sm transition-colors inline-flex items-center gap-1 group"
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
              <h4 className="label-mono-accent mb-6 block">Stay in Touch</h4>
              {subscribed ? (
                <p className="text-status-emerald text-sm font-medium">Thanks for subscribing!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field !text-xs"
                  />
                  {subError && <p className="text-danger-400 text-xs">{subError}</p>}
                  <button
                    type="submit"
                    className="btn-architectural-primary w-full !text-xs"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-mono text-xs">
            © {currentYear} {settings?.footer_copyright || 'Dawud Muhammed'}. All rights reserved.
          </p>
          <p className="text-text-mono text-xs flex items-center gap-1.5">
            {settings?.footer_tagline || 'Built with care and precision'}
            <Heart size={12} className="text-status-emerald" fill="currentColor" />
          </p>
        </div>
      </div>
    </footer>
  );
}
