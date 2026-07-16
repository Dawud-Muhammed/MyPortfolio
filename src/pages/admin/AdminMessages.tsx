import { useState, useEffect } from 'react';
import { Mail, Archive, Trash2, Inbox } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRelativeTime } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    fetchMessages();
  };

  const toggleArchive = async (id: string, current: boolean) => {
    await supabase.from('contact_messages').update({ is_archived: !current }).eq('id', id);
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    setSelected(null);
    fetchMessages();
  };

  const filtered = messages.filter((m) => {
    if (filter === 'unread') return !m.is_read && !m.is_archived;
    if (filter === 'archived') return m.is_archived;
    return !m.is_archived;
  });

  const selectedMsg = messages.find((m) => m.id === selected);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-foreground/40 text-sm mt-1">{messages.filter((m) => !m.is_read).length} unread</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'unread', 'archived'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-accent-500 text-white' : 'glass text-foreground/60 hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-accent-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Inbox size={48} className="text-foreground/20 mx-auto mb-4" />
          <p className="text-foreground/30">No messages found.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Message list */}
          <div className="lg:col-span-1 space-y-2">
            {filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => { setSelected(msg.id); if (!msg.is_read) markRead(msg.id); }}
                className={`w-full text-left glass rounded-xl p-4 transition-all ${
                  selected === msg.id ? 'ring-1 ring-accent-400' : ''
                } ${!msg.is_read ? 'border-l-2 border-l-accent-400' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm ${msg.is_read ? 'text-foreground/60' : 'text-foreground font-medium'}`}>
                    {msg.name}
                  </p>
                  <span className="text-foreground/30 text-xs">{formatRelativeTime(msg.created_at)}</span>
                </div>
                <p className="text-foreground/50 text-xs truncate">{msg.subject}</p>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-2">
            {selectedMsg ? (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-foreground">{selectedMsg.subject}</h2>
                    <p className="text-foreground/40 text-sm mt-1">
                      From <span className="text-accent-400">{selectedMsg.name}</span> ({selectedMsg.email})
                    </p>
                    <p className="text-foreground/30 text-xs mt-1">{formatRelativeTime(selectedMsg.created_at)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => toggleArchive(selectedMsg.id, selectedMsg.is_archived)}
                      className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-all"
                      title={selectedMsg.is_archived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMsg.id)}
                      className="p-2 rounded-lg text-foreground/50 hover:text-error-400 hover:bg-error-500/10 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-foreground/70 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.message}
                </div>
                <div className="mt-6 pt-6 border-t border-foreground/10">
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`}
                    className="btn-primary"
                  >
                    <Mail size={16} />
                    Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-12 text-center">
                <Mail size={48} className="text-foreground/20 mx-auto mb-4" />
                <p className="text-foreground/30">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
