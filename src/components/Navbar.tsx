import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigationItems, useProfile, useHeroContent } from '../lib/queries';
import { AnimatedButton } from './AnimatedButton';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: navItems } = useNavigationItems();
  const { data: profile } = useProfile();
  const { data: hero } = useHeroContent();

  useEffect(() => {
    // Close mobile menu on route change
    setMobileOpen(false);
  }, [location]);

  const navbarItems = (navItems || []).filter((n) => n.location === 'navbar' && n.is_visible);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

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

          {/* Mobile Menu Toggle: 48x48px minimum touch target */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-3 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-elevated/50 transition-all min-h-12 min-w-12 flex items-center justify-center"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu: Full-screen drawer with staggered entry animations */}
      {mobileOpen && (
        <motion.div
          className="fixed inset-0 z-40 md:hidden pt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop: Touch-friendly dismiss */}
          <motion.div
            className="absolute inset-0 bg-void-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Menu panel with staggered animations */}
          <motion.div
            className="absolute top-16 left-0 right-0 bg-surface-base/95 backdrop-blur-xl border-t border-border-subtle"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <motion.div
              className="section-container py-6 space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {navbarItems.map((item) => {
                const isActive = location.pathname === item.target ||
                  (item.target !== '/' && location.pathname.startsWith(item.target));
                return (
                  <motion.div key={item.id} variants={itemVariants}>
                    <Link
                      to={item.target}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3.5 rounded-lg font-mono text-xs uppercase tracking-[0.18em] transition-all min-h-12 flex items-center ${
                        isActive
                          ? 'bg-status-emerald/10 border border-status-emerald/30 text-status-emerald'
                          : 'text-text-secondary hover:bg-surface-elevated/50 hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div variants={itemVariants} className="pt-2">
                <button
                  onClick={() => {
                    navigate(hero?.cta_primary_url || '/contact');
                    setMobileOpen(false);
                  }}
                  className="w-full font-mono text-xs uppercase tracking-[0.18em] px-6 py-3.5 border border-border-subtle rounded-lg text-text-primary bg-surface-elevated/40 hover:bg-surface-elevated/60 hover:border-border-hover transition-all duration-300 min-h-12"
                >
                  {hero?.cta_primary_label || 'GET IN TOUCH'}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
