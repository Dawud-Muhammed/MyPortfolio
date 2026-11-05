import { useEffect, useState, useCallback } from 'react';
import { isSupabaseConfigured, supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let generation = 0;
    const applySession = async (current: Session | null) => {
      const version = ++generation;
      setSession(current);
      setIsAdmin(false);
      setError(null);
      if (current) {
        const { data, error: roleError } = await supabase.rpc('is_admin');
        if (!active || version !== generation) return;
        setIsAdmin(data === true && !roleError);
        if (roleError) setError('Administrator access could not be verified. Check the database migration and owner membership.');
      }
      if (active) setLoading(false);
    };
    if (!isSupabaseConfigured) { setLoading(false); setError('Supabase is not configured.'); return; }
    supabase.auth.getSession().then(({ data }) => { if (active) void applySession(data.session); });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Run outside the auth callback lock before making another Supabase request.
      setTimeout(() => { if (active) void applySession(newSession); }, 0);
    });

    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    return supabase.auth.signOut();
  }, []);

  return { session, loading, isAdmin, error, signIn, signOut };
}
