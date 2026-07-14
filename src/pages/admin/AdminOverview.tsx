import { FolderKanban, FileText, Mail, Star, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects, useBlogPosts, useContactMessages, useTestimonials } from '../../lib/queries';
import { useAuth } from '../../lib/useAuth';
import { formatRelativeTime } from '../../lib/utils';
export function AdminOverview() {
  const { session } = useAuth();
  const { data: projects } = useProjects();
  const { data: posts } = useBlogPosts();
  const { data: messages } = useContactMessages();
  const { data: testimonials } = useTestimonials();

  const publishedPosts = (posts || []).filter((p) => p.status === 'Published');
  const unreadMessages = (messages || []).filter((m) => !m.is_read);
  const featuredProjects = (projects || []).filter((p) => p.is_featured);

  const stats = [
    { label: 'Total Projects', value: (projects || []).length, icon: FolderKanban, color: 'text-accent-400', bg: 'bg-accent-500/10', link: '/admin/projects' },
    { label: 'Blog Posts', value: publishedPosts.length, icon: FileText, color: 'text-success-400', bg: 'bg-success-500/10', link: '/admin/blog' },
    { label: 'Unread Messages', value: unreadMessages.length, icon: Mail, color: 'text-warning-400', bg: 'bg-warning-500/10', link: '/admin/messages' },
    { label: 'Testimonials', value: (testimonials || []).length, icon: Star, color: 'text-error-400', bg: 'bg-error-500/10', link: '/admin/testimonials' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back{session?.user?.email ? `, ${session.user.email.split('@')[0]}` : ''}!</h1>
        <p className="text-white/40 text-sm mt-1">Here's what's happening with your portfolio.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="glass rounded-2xl p-5 card-hover"
          >
            <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-white/40 text-xs mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent messages */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Inbox size={18} className="text-accent-400" />
              Recent Messages
            </h2>
            <Link to="/admin/messages" className="text-accent-400 text-xs hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(messages || []).slice(0, 5).map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <div className={`h-2 w-2 rounded-full mt-1.5 ${msg.is_read ? 'bg-white/20' : 'bg-accent-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{msg.name}</p>
                  <p className="text-white/40 text-xs truncate">{msg.subject}</p>
                  <p className="text-white/30 text-xs mt-1">{formatRelativeTime(msg.created_at)}</p>
                </div>
              </div>
            ))}
            {(messages || []).length === 0 && (
              <p className="text-white/30 text-sm text-center py-4">No messages yet.</p>
            )}
          </div>
        </div>

        {/* Featured projects */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Star size={18} className="text-accent-400" />
              Featured Projects
            </h2>
            <Link to="/admin/projects" className="text-accent-400 text-xs hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {featuredProjects.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                {p.cover_image_url && (
                  <img src={p.cover_image_url} alt={p.title} className="h-10 w-10 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.title}</p>
                  <p className="text-white/40 text-xs truncate">{p.excerpt || p.description}</p>
                </div>
                <span className="badge !text-xs !py-0.5">{p.status}</span>
              </div>
            ))}
            {featuredProjects.length === 0 && (
              <p className="text-white/30 text-sm text-center py-4">No featured projects.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
