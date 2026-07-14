import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { detectDevice, detectBrowser } from '../lib/utils';

export function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    supabase.from('page_views').insert({
      route: location.pathname,
      referrer: document.referrer || null,
      device: detectDevice(),
      browser: detectBrowser(),
    }).then(() => {});
  }, [location.pathname]);

  return null;
}
