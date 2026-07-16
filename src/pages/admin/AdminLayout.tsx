import { Navigate, NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, FileText, Mail, Settings,
  LogOut, Code2, Briefcase, GraduationCap, Award, Wrench,
  Star, Image, HelpCircle, Trophy, Link2, Eye, Menu, X, BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../lib/useAuth';
import { useContactMessages } from '../../lib/queries';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/blog', label: 'Blog Posts', icon: FileText },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/skills', label: 'Skills', icon: Code2 },
  { to: '/admin/experience', label: 'Experience', icon: Briefcase },
  { to: '/admin/education', label: 'Education', icon: GraduationCap },
  { to: '/admin/certifications', label: 'Certifications', icon: Award },
  { to: '/admin/services', label: 'Services', icon: Wrench },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { to: '/admin/gallery', label: 'Gallery', icon: Image },
  { to: '/admin/achievements', label: 'Achievements', icon: Trophy },
  { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { to: '/admin/social', label: 'Social Links', icon: Link2 },
  { to: '/admin/site-stats', label: 'Site Stats', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: messages } = useContactMessages();
  const unreadCount = (messages || []).filter((m) => !m.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-background-secondary border-r border-foreground/5 z-50 transition-transform duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-foreground/5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-foreground font-bold text-sm">Admin Panel</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-foreground/40">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent-500/15 text-accent-400'
                    : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.to === '/admin/messages' && unreadCount > 0 && (
                <span className="ml-auto bg-error-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 p-3 border-t border-foreground/5 space-y-1">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all"
          >
            <Eye size={18} />
            View Site
          </a>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error-400 hover:bg-error-500/10 transition-all w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-foreground/5 sticky top-0 bg-background z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground/60">
            <Menu size={24} />
          </button>
          <span className="text-foreground font-bold text-sm">Admin</span>
          <button onClick={handleSignOut} className="text-error-400">
            <LogOut size={20} />
          </button>
        </div>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
