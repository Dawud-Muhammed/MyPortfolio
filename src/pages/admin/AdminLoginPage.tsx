import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';

export function AdminLoginPage() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
if (err) {
  console.error('Supabase login error:', err);
  setError(err.message);
  return;
}
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-aurora flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-white/50 text-sm mt-2">Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 space-y-5">
          <div>
            <label className="text-white/70 text-sm font-medium mb-2 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="input-field !bg-white/5 !border-white/10 !text-white !placeholder-white/30 pl-10"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium mb-2 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field !bg-white/5 !border-white/10 !text-white !placeholder-white/30 pl-10"
                required
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-error-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 group">
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
