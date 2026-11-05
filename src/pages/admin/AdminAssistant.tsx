import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { invalidatePublicContent } from '../../lib/queries';
import { safeUrl } from '../../lib/utils';
import type { AssistantSettings } from '../../lib/types';
import { FileUploader } from '../../components/admin/FileUploader';

type Usage = { day_usd: number; month_usd: number; total_usd: number; pending_requests: number };
export function AdminAssistant() {
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [status, setStatus] = useState('Loading guide configuration…');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { let active = true; void (async () => {
    const [config, totals] = await Promise.all([supabase.from('assistant_settings').select('*').eq('id', true).single(), supabase.rpc('assistant_usage_summary')]);
    if (!active) return;
    setSettings(config.data); setUsage(totals.data); setError(config.error?.message || totals.error?.message || ''); setStatus('');
  })(); return () => { active = false; }; }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!settings) return;
    setError(''); setStatus('');
    if (!settings.greeting.trim() || settings.greeting.length > 1200) { setError('Use a greeting between 1 and 1200 characters.'); return; }
    if (settings.greeting_audio_url && !safeUrl(settings.greeting_audio_url)) { setError('Use a valid HTTPS URL for greeting audio.'); return; }
    if (settings.portrait_url && !safeUrl(settings.portrait_url)) { setError('Use a valid HTTP(S) URL for the portrait.'); return; }
    if (settings.suggested_questions.length > 8 || settings.suggested_questions.some(q => q.length > 180)) { setError('Use up to eight suggested questions, each under 180 characters.'); return; }
    setSaving(true);
    const { error } = await supabase.from('assistant_settings').update({ enabled: settings.enabled, portrait_url: settings.portrait_url || null, greeting: settings.greeting.trim(), greeting_audio_url: settings.greeting_audio_url || null, audio_is_synthetic: settings.audio_is_synthetic, suggested_questions: settings.suggested_questions }).eq('id', true);
    setSaving(false);
    if (error) setError(error.message); else { invalidatePublicContent(); setStatus('Guide settings saved.'); }
  }
  async function kill() {
    setSaving(true); const { error } = await supabase.from('assistant_settings').update({ enabled: false }).eq('id', true); setSaving(false);
    if (error) setError(error.message); else { setSettings(previous => previous ? { ...previous, enabled: false } : null); invalidatePublicContent(); setStatus('Paid requests are disabled. Published FAQ and contact paths remain available.'); }
  }
  return <main className="max-w-4xl"><h1 className="text-2xl font-bold mb-3">AI portfolio guide</h1><p className="text-foreground/70 mb-6">Approve knowledge explicitly in Projects, Services, Experience, FAQs and Profile settings. Drafts are excluded, even if eligible. No visitor conversations are stored in the CMS.</p>
    {error && <p role="alert" className="border border-error-500 p-4 rounded-xl mb-4">{error}</p>}{status && <p role="status" className="mb-4">{status}</p>}
    <section className="glass rounded-2xl p-5 mb-6"><div className="flex justify-between items-start gap-4"><div><h2 className="font-semibold text-lg">Usage estimates</h2><p className="text-sm text-foreground/70">Application estimates, not your provider balance. Pending requests remain reserved until safely reconciled.</p></div><button disabled={saving} className="btn-ghost text-error-400" onClick={() => void kill()}>Disable paid requests now</button></div>
      {usage ? <dl className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-5">{[['Today', usage.day_usd], ['This month',usage.month_usd], ['Total allocated use',usage.total_usd]].map(([label,value]) => <div key={String(label)}><dt className="text-sm text-foreground/70">{label}</dt><dd className="text-2xl mt-1">${Number(value).toFixed(4)}</dd></div>)}<div><dt className="text-sm text-foreground/70">Pending requests</dt><dd className="text-2xl mt-1">{usage.pending_requests}</dd></div></dl> : <p className="mt-4">Usage unavailable. Check migrations and administrator access.</p>}
      <p className="text-sm text-foreground/70 mt-5">Limits are enforced in server configuration: proposed defaults $0.50/day, $5/month, $10 total. Change environment limits and redeploy to adjust them; public CMS fields cannot override budget or model safeguards.</p>
    </section>
    {settings && <form onSubmit={save} className="glass rounded-2xl p-5 space-y-5"><label className="flex items-center gap-3"><input type="checkbox" className="w-6 h-6" checked={settings.enabled} onChange={e => setSettings({ ...settings, enabled: e.target.checked })} />Enable paid text answers (server configuration must also be ready)</label>
      <FileUploader bucket="portfolio-images" folder="assistant" value={settings.portrait_url || ''} onChange={portrait_url => setSettings({ ...settings, portrait_url })} label="Guide portrait (leave empty to use the profile portrait)" />
      <label className="block">Greeting shown as text<textarea className="input-field mt-2" rows={4} maxLength={1200} value={settings.greeting} onChange={e => setSettings({ ...settings, greeting: e.target.value })} /></label>
      <label className="block">Suggested questions (one per line)<textarea className="input-field mt-2" rows={6} value={settings.suggested_questions.join('\n')} onChange={e => setSettings({ ...settings, suggested_questions: e.target.value.split('\n') })} /></label>
      <FileUploader bucket="portfolio-audio" folder="introductions" value={settings.greeting_audio_url || ''} onChange={greeting_audio_url => setSettings({ ...settings, greeting_audio_url })} type="audio" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4" label="Cached English introduction" />
      <label className="flex gap-3"><input type="checkbox" checked={settings.audio_is_synthetic} onChange={e => setSettings({ ...settings, audio_is_synthetic: e.target.checked })} />Disclose this recording as synthetic speech</label>
      <p className="text-sm text-foreground/70">Audio must say the same greeting shown above. Upload a supported synthetic recording or your own recording. Playback occurs only after a visitor opens the guide and permits sound. No API request is made by opening the panel.</p>
      <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save guide settings'}</button><Link to="/admin/faqs" className="btn-ghost ml-3">Edit approved FAQs</Link>
    </form>}
  </main>;
}
