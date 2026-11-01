import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useNavigationItems, useProfile, useHeroContent } from '../lib/queries';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: navItems } = useNavigationItems();
  const { data: profile } = useProfile();
  const { data: hero } = useHeroContent();
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Smart hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);

      if (currentY > lastScrollY.current && currentY > 200) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Logo hover animation
  useEffect(() => {
    if (!logoRef.current) return;
    const logo = logoRef.current;
    const handleEnter = () => {
      gsap.to(logo, { scale: 1.1, duration: 0.3, ease: 'back.out(1.7)' });
    };
    const handleLeave = () => {
      gsap.to(logo, { scale: 1, duration: 0.3, ease: 'power2.out' });
    };
    logo.addEventListener('mouseenter', handleEnter);
    logo.addEventListener('mouseleave', handleLeave);
    return () => {
      logo.removeEventListener('mouseenter', handleEnter);
      logo.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const navbarItems = (navItems || []).filter((n) => n.location === 'navbar' && n.is_visible);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.03, staggerDirection: -1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  const navLinkClass = (isActive: boolean) =>
    `font-mono text-[11px] uppercase tracking-[0.2em] transition-all duration-300 relative pb-1 group ${
      isActive
        ? 'text-text-primary'
        : 'text-text-tertiary hover:text-text-primary'
    }`;

  return (
    <>
      <motion.header
        ref={navRef}
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-void-950/80 backdrop-blur-2xl border-b border-border-subtle shadow-[0_1px_40px_rgba(0,0,0,0.5)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="section-container h-16 lg:h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
            aria-label="Home"
          >
            <span
              ref={logoRef}
              className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 border border-accent-primary/30 flex items-center justify-center transition-all duration-300 group-hover:border-accent-primary/60 group-hover:shadow-glow-cyan"
            >
              <span className="text-text-primary font-bold text-sm tracking-wider">
                {(profile?.name || 'D')[0].toUpperCase()}
              </span>
            </span>
            <span className="font-bold text-sm text-text-primary tracking-tight hidden sm:block">
              {(profile?.name || 'Dawud').split(' ')[0]}
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-10">
            {navbarItems.map((item) => {
              const isActive =
                location.pathname === item.target ||
                (item.target !== '/' && location.pathname.startsWith(item.target));
              return (
                <Link
                  key={item.id}
                  to={item.target}
                  className={navLinkClass(isActive)}
                >
                  {item.label}
                  {/* Animated underline */}
                  <span
                    className={`absolute left-0 bottom-0 h-[2px] bg-accent-primary transition-all duration-300 ease-out ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => navigate(hero?.cta_primary_url || '/contact')}
              className="relative font-mono text-[11px] uppercase tracking-[0.2em] px-6 py-2.5 rounded-full border border-border-subtle text-text-primary hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10">
                {hero?.cta_primary_label || 'Get in Touch'}
              </span>
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-3 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-elevated/50 transition-all min-h-12 min-w-12 flex items-center justify-center"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-void-950/90 backdrop-blur-xl"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Menu content */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {navbarItems.map((item) => {
                const isActive =
                  location.pathname === item.target ||
                  (item.target !== '/' && location.pathname.startsWith(item.target));
                return (
                  <motion.div key={item.id} variants={itemVariants}>
                    <Link
                      to={item.target}
                      onClick={() => setMobileOpen(false)}
                      className={`block py-4 font-mono text-2xl uppercase tracking-[0.15em] transition-all ${
                        isActive
                          ? 'text-accent-primary'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div variants={itemVariants} className="mt-8">
                <button
                  onClick={() => {
                    navigate(hero?.cta_primary_url || '/contact');
                    setMobileOpen(false);
                  }}
                  className="font-mono text-xs uppercase tracking-[0.2em] px-8 py-4 border border-accent-primary/40 rounded-full text-accent-primary hover:bg-accent-primary/10 transition-all duration-300"
                >
                  {hero?.cta_primary_label || 'Get in Touch'}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
