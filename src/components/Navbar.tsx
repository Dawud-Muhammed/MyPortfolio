import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, ArrowUpRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useNavigationItems, useProfile } from '../lib/queries';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { data: navItems } = useNavigationItems();
  const { data: profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navbarItems = (navItems || []).filter((n) => n.location === 'navbar' && n.is_visible);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
        }`}
      >
        <nav className="section-container flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              {profile?.name?.split(' ')[0] || 'Alex'}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navbarItems.map((item) => {
              const isActive = location.pathname === item.target ||
                (item.target !== '/' && location.pathname.startsWith(item.target));
              return (
                <Link
                  key={item.id}
                  to={item.target}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="hidden md:inline-flex btn-primary !py-2 !px-4 !text-xs"
            >
              Get in Touch
              <ArrowUpRight size={14} />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 glass-strong border-t border-white/10 p-4 animate-fade-down">
            <div className="flex flex-col gap-1">
              {navbarItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.target}
                  className="px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 font-medium transition-all"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => navigate('/contact')}
                className="btn-primary mt-2 w-full"
              >
                Get in Touch
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
