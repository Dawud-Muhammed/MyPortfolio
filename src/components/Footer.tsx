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
    <footer className="relative mt-32 border-t border-foreground/5 bg-background">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand + bio */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{(settings?.site_name || 'Dawud')[0]}</span>
              </div>
              <span className="font-bold text-xl text-foreground">{settings?.site_name || 'Dawud Muhammed'}</span>
            </Link>
            <p className="text-foreground/50 text-sm leading-relaxed max-w-md mb-6">
              {settings?.footer_bio || 'Full-stack software engineer crafting digital products with precision and care.'}
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
                    className="h-10 w-10 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-all hover:scale-110"
                    aria-label={s.platform}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              {footerNav.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.target}
                    className="text-foreground/50 hover:text-foreground text-sm transition-colors inline-flex items-center gap-1 group"
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
              <h4 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">Stay in Touch</h4>
              {subscribed ? (
                <p className="text-success-400 text-sm">Thanks for subscribing!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground !placeholder-foreground-muted/50"
                  />
                  {subError && <p className="text-error-400 text-xs">{subError}</p>}
                  <button type="submit" className="btn-primary w-full !text-xs">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground/30 text-xs">
            {currentYear} {settings?.footer_copyright || 'Dawud Muhammed'}. All rights reserved.
          </p>
          <p className="text-foreground/30 text-xs flex items-center gap-1.5">
            {settings?.footer_tagline || 'Built with care and way too much coffee'}
            <Heart size={12} className="text-error-500" fill="currentColor" />
          </p>
        </div>
      </div>
    </footer>
  );
}
