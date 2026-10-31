import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigationItems, useProfile, useHeroContent } from '../lib/queries';
import { AnimatedButton } from './AnimatedButton';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: navItems } = useNavigationItems();
  const { data: profile } = useProfile();
  const { data: hero } = useHeroContent();

  const navbarItems = (navItems || []).filter((n) => n.location === 'navbar' && n.is_visible);

  return (
    <>
      {/* Fixed/sticky translucent navbar with backdrop blur */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-base/70 backdrop-blur-xl border-b border-border-subtle transition-all duration-300">
        <div className="section-container h-16 flex items-center justify-between">
          {/* Left: Minimalist monogram logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-80"
            aria-label="Dawud - Home"
          >
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-primary font-bold">
              {(profile?.name || 'Dawud')[0].toUpperCase()}
            </span>
          </Link>

          {/* Center: Navigation links (uppercase, monospace, emerald underline on active) */}
          <div className="hidden md:flex items-center gap-8">
            {navbarItems.map((item) => {
              const isActive = location.pathname === item.target ||
                (item.target !== '/' && location.pathname.startsWith(item.target));
              return (
                <Link
                  key={item.id}
                  to={item.target}
                  className={`font-mono text-xs uppercase tracking-[0.18em] transition-colors relative pb-1 ${
                    isActive
                      ? 'text-text-primary border-b-2 border-status-emerald'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right: CTA Button (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <AnimatedButton
              variant="secondary"
              onClick={() => navigate(hero?.cta_primary_url || '/contact')}
              title="Get in touch"
              ariaLabel="Get in touch"
            >
              {hero?.cta_primary_label || 'GET IN TOUCH'}
            </AnimatedButton>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-elevated/50 transition-all"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu: Full-screen drawer with staggered entry animations */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-16">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-void-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Menu panel with staggered animations */}
          <div className="absolute top-16 left-0 right-0 bg-surface-base/95 backdrop-blur-xl border-t border-border-subtle">
            <div className="section-container py-6 space-y-2">
              {navbarItems.map((item, idx) => {
                const isActive = location.pathname === item.target ||
                  (item.target !== '/' && location.pathname.startsWith(item.target));
                return (
                  <Link
                    key={item.id}
                    to={item.target}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-[0.18em] transition-all ${
                      isActive
                        ? 'bg-status-emerald/10 border border-status-emerald/30 text-status-emerald'
                        : 'text-text-secondary hover:bg-surface-elevated/50 hover:text-text-primary'
                    }`}
                    style={{
                      animation: `fadeDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s backwards`,
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  navigate(hero?.cta_primary_url || '/contact');
                  setMobileOpen(false);
                }}
                className="w-full mt-4 font-mono text-xs uppercase tracking-[0.18em] px-6 py-3 border border-border-subtle rounded-lg text-text-primary bg-surface-elevated/40 hover:bg-surface-elevated/60 hover:border-border-hover transition-all duration-300"
              >
                {hero?.cta_primary_label || 'GET IN TOUCH'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
