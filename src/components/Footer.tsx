import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ArrowUpRight, Heart } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
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
      {/* Gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />

      <div className="section-container py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand + bio */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 border border-accent-primary/30 flex items-center justify-center transition-all group-hover:border-accent-primary/60 group-hover:shadow-glow-cyan">
                <span className="text-text-primary font-bold text-xs tracking-[0.2em]">D</span>
              </div>
              <span className="font-bold text-base text-text-primary tracking-tight">
                {settings?.site_name || 'Dawud'}
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md mb-8">
              {settings?.footer_bio || 'Full-stack software engineer building reliable and maintainable digital systems.'}
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
                    className="h-10 w-10 rounded-xl border border-border-subtle hover:border-accent-primary/50 bg-surface-base/50 hover:bg-accent-primary/5 flex items-center justify-center text-text-tertiary hover:text-accent-primary transition-all duration-300"
                    aria-label={s.platform}
                    title={s.platform}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={16} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary mb-6">
              Navigation
            </h4>
            <ul className="space-y-3">
              {footerNav.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.target}
                    className="text-text-secondary hover:text-text-primary text-sm transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span className="relative">
                      {item.label}
                      <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-accent-primary transition-all duration-300 group-hover:w-full" />
                    </span>
                    <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          {settings?.newsletter_enabled && (
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary mb-6">
                Stay Updated
              </h4>
              {subscribed ? (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-status-emerald text-sm font-medium"
                >
                  Thanks for subscribing! ✓
                </motion.p>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-surface-base/50 border border-border-subtle focus:border-accent-primary/40 rounded-lg px-4 py-3 text-text-primary placeholder-text-tertiary focus:outline-none text-xs font-mono transition-all duration-300 focus:shadow-[0_0_20px_rgba(56,189,248,0.08)]"
                    />
                  </div>
                  {subError && <p className="text-danger-400 text-xs">{subError}</p>}
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 border border-border-subtle bg-surface-elevated/40 text-text-primary hover:bg-accent-primary/5 hover:border-accent-primary/30 rounded-lg font-mono uppercase text-[11px] tracking-[0.15em] transition-all duration-300"
                  >
                    Subscribe →
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-text-mono tracking-wide">
            © {currentYear} {settings?.footer_copyright || 'Dawud'}. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-text-mono flex items-center gap-2">
            {settings?.footer_tagline || 'Crafted with precision'}
            <Heart size={10} className="text-status-emerald" fill="currentColor" />
          </p>
        </div>
      </div>
    </footer>
  );
}
