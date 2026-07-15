import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AdminSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [hero, setHero] = useState<any>(null);
  const [website, setWebsite] = useState<any>(null);
  const [seo, setSeo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    (async () => {
      const [p, h, w, s] = await Promise.all([
        supabase.from('profile').select('*').maybeSingle(),
        supabase.from('hero_content').select('*').maybeSingle(),
        supabase.from('website_settings').select('*').maybeSingle(),
        supabase.from('seo_settings').select('*').maybeSingle(),
      ]);
      setProfile(p.data);
      setHero(h.data);
      setWebsite(w.data);
      setSeo(s.data);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    const tasks: Promise<any>[] = [];

    if (profile) {
      tasks.push(supabase.from('profile').upsert(profile, { onConflict: 'id' }));
    }
    if (hero) {
      tasks.push(supabase.from('hero_content').upsert(hero, { onConflict: 'id' }));
    }
    if (website) {
      tasks.push(supabase.from('website_settings').upsert(website, { onConflict: 'id' }));
    }
    if (seo) {
      tasks.push(supabase.from('seo_settings').upsert(seo, { onConflict: 'id' }));
    }

    const results = await Promise.all(tasks);
    const hasError = results.some((r) => r.error);

    setSaving(false);
    if (hasError) {
      setSaveError('Some settings failed to save. Please try again.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="text-accent-400 animate-spin" />
      </div>
    );
  }

  const update = (setter: any, key: string, value: any) => {
    setter((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-foreground/40 text-sm mt-1">Manage your profile, hero content, and site settings</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {saveError && (
        <div className="glass rounded-xl p-4 mb-6 flex items-center gap-2 text-error-400 animate-fade-in">
          <CheckCircle2 size={18} />
          {saveError}
        </div>
      )}
      {saved && (
        <div className="glass rounded-xl p-4 mb-6 flex items-center gap-2 text-success-400 animate-fade-in">
          <CheckCircle2 size={18} />
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Profile */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Profile</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Name</label>
              <input value={profile?.name || ''} onChange={(e) => update(setProfile, 'name', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Title</label>
              <input value={profile?.title || ''} onChange={(e) => update(setProfile, 'title', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Email</label>
              <input value={profile?.email || ''} onChange={(e) => update(setProfile, 'email', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Phone</label>
              <input value={profile?.phone || ''} onChange={(e) => update(setProfile, 'phone', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Location</label>
              <input value={profile?.location || ''} onChange={(e) => update(setProfile, 'location', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Profile Picture URL</label>
              <input value={profile?.profile_picture_url || ''} onChange={(e) => update(setProfile, 'profile_picture_url', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Tagline</label>
              <input value={profile?.tagline || ''} onChange={(e) => update(setProfile, 'tagline', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Bio</label>
              <textarea value={profile?.bio || ''} onChange={(e) => update(setProfile, 'bio', e.target.value)} rows={4} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground resize-none" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Available for Work</label>
              <button
                onClick={() => update(setProfile, 'availability', !profile?.availability)}
                className={`relative w-12 h-6 rounded-full transition-colors ${profile?.availability ? 'bg-accent-500' : 'bg-foreground/10'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${profile?.availability ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Hero Content */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Hero Section</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Kicker</label>
              <input value={hero?.kicker || ''} onChange={(e) => update(setHero, 'kicker', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Headline</label>
              <input value={hero?.headline || ''} onChange={(e) => update(setHero, 'headline', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Highlighted Word</label>
              <input value={hero?.highlighted_word || ''} onChange={(e) => update(setHero, 'highlighted_word', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Subheadline</label>
              <textarea value={hero?.subheadline || ''} onChange={(e) => update(setHero, 'subheadline', e.target.value)} rows={3} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground resize-none" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Primary CTA Label</label>
              <input value={hero?.cta_primary_label || ''} onChange={(e) => update(setHero, 'cta_primary_label', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Primary CTA URL</label>
              <input value={hero?.cta_primary_url || ''} onChange={(e) => update(setHero, 'cta_primary_url', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Secondary CTA Label</label>
              <input value={hero?.cta_secondary_label || ''} onChange={(e) => update(setHero, 'cta_secondary_label', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Secondary CTA URL</label>
              <input value={hero?.cta_secondary_url || ''} onChange={(e) => update(setHero, 'cta_secondary_url', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
          </div>
        </section>

        {/* Website Settings */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Website Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Site Name</label>
              <input value={website?.site_name || ''} onChange={(e) => update(setWebsite, 'site_name', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">WhatsApp Number</label>
              <input value={website?.whatsapp_number || ''} onChange={(e) => update(setWebsite, 'whatsapp_number', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Footer Bio</label>
              <textarea value={website?.footer_bio || ''} onChange={(e) => update(setWebsite, 'footer_bio', e.target.value)} rows={2} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground resize-none" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Footer Copyright</label>
              <input value={website?.footer_copyright || ''} onChange={(e) => update(setWebsite, 'footer_copyright', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Footer Tagline</label>
              <input value={website?.footer_tagline || ''} onChange={(e) => update(setWebsite, 'footer_tagline', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Map Location</label>
              <input value={website?.map_location || ''} onChange={(e) => update(setWebsite, 'map_location', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Map Embed URL</label>
              <input value={website?.map_embed_url || ''} onChange={(e) => update(setWebsite, 'map_embed_url', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">WhatsApp Enabled</label>
              <button onClick={() => update(setWebsite, 'whatsapp_enabled', !website?.whatsapp_enabled)} className={`relative w-12 h-6 rounded-full transition-colors ${website?.whatsapp_enabled ? 'bg-accent-500' : 'bg-foreground/10'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${website?.whatsapp_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Newsletter Enabled</label>
              <button onClick={() => update(setWebsite, 'newsletter_enabled', !website?.newsletter_enabled)} className={`relative w-12 h-6 rounded-full transition-colors ${website?.newsletter_enabled ? 'bg-accent-500' : 'bg-foreground/10'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${website?.newsletter_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Maintenance Mode</label>
              <button onClick={() => update(setWebsite, 'maintenance_mode', !website?.maintenance_mode)} className={`relative w-12 h-6 rounded-full transition-colors ${website?.maintenance_mode ? 'bg-error-500' : 'bg-foreground/10'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${website?.maintenance_mode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* SEO Settings */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">SEO Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Site Title Template</label>
              <input value={seo?.site_title_template || ''} onChange={(e) => update(setSeo, 'site_title_template', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" placeholder="%s | Site Name" />
            </div>
            <div className="md:col-span-2">
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Meta Description</label>
              <textarea value={seo?.meta_description || ''} onChange={(e) => update(setSeo, 'meta_description', e.target.value)} rows={2} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground resize-none" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">Twitter Handle</label>
              <input value={seo?.twitter_handle || ''} onChange={(e) => update(setSeo, 'twitter_handle', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
            <div>
              <label className="text-foreground/70 text-sm font-medium mb-2 block">OG Image URL</label>
              <input value={seo?.og_image_url || ''} onChange={(e) => update(setSeo, 'og_image_url', e.target.value)} className="input-field !bg-foreground/5 !border-foreground/10 !text-foreground" />
            </div>
          </div>
        </section>
      </div>

      {/* Bottom save button */}
      <div className="mt-8 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save All Changes
        </button>
      </div>
    </div>
  );
}
