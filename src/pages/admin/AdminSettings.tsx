import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { invalidatePublicContent } from '../../lib/queries';
import { safeUrl } from '../../lib/utils';
import { FileUploader } from '../../components/admin/FileUploader';

type Field = { name: string; label: string; type?: 'textarea' | 'checkbox' | 'image' | 'document' };
type Row = Record<string, unknown>;
const sections: { table: string; title: string; fields: Field[] }[] = [
  { table: 'profile', title: 'Profile', fields: [
    { name: 'is_published', label: 'Publish this profile and its public contact information', type: 'checkbox' },
    { name: 'name', label: 'Name' }, { name: 'title', label: 'Professional focus' }, { name: 'tagline', label: 'Short value statement' }, { name: 'bio', label: 'Biography', type: 'textarea' },
    { name: 'email', label: 'Public email' }, { name: 'phone', label: 'Public phone' }, { name: 'location', label: 'Location' }, { name: 'timezone', label: 'Timezone' },
    { name: 'availability', label: 'Available for work', type: 'checkbox' },
    { name: 'profile_picture_url', label: 'Real portrait', type: 'image' }, { name: 'resume_url', label: 'Public résumé PDF', type: 'document' },
  ] },
  { table: 'hero_content', title: 'Homepage composition', fields: [
    { name: 'is_published', label: 'Publish this homepage copy', type: 'checkbox' },
    { name: 'kicker', label: 'Small introductory line' }, { name: 'headline', label: 'Headline' }, { name: 'highlighted_word', label: 'Highlighted word' }, { name: 'subheadline', label: 'Short supporting copy', type: 'textarea' },
    { name: 'availability_status', label: 'Show availability line', type: 'checkbox' }, { name: 'availability_label', label: 'Truthful availability or proof line' },
  ] },
  { table: 'website_settings', title: 'Website and contact settings', fields: [
    { name: 'is_published', label: 'Publish these website and contact settings', type: 'checkbox' },
    { name: 'site_name', label: 'Site name' }, { name: 'logo_url', label: 'Logo', type: 'image' }, { name: 'footer_tagline', label: 'Footer tagline' },
    { name: 'whatsapp_enabled', label: 'Show WhatsApp on Contact', type: 'checkbox' }, { name: 'whatsapp_number', label: 'WhatsApp number (international digits)' }, { name: 'whatsapp_message', label: 'Suggested WhatsApp message' },
  ] },
  { table: 'seo_settings', title: 'Default search metadata', fields: [
    { name: 'is_published', label: 'Publish this default search metadata', type: 'checkbox' },
    { name: 'site_title_template', label: 'Site title template' }, { name: 'meta_description', label: 'Default description', type: 'textarea' }, { name: 'og_image_url', label: 'Social preview image', type: 'image' }, { name: 'twitter_handle', label: 'Social handle' }, { name: 'gsc_verification', label: 'Search Console verification value' },
  ] },
];

export function AdminSettings() {
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => { let active = true; void (async () => {
    const results = await Promise.all(sections.map(section => supabase.from(section.table).select('*').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(1).maybeSingle()));
    if (!active) return;
    const next: Record<string, Row> = {};
    results.forEach((result, index) => { if (result.data) next[sections[index].table] = result.data; });
    setRows(next); setError(results.find(result => result.error)?.error?.message || ''); setLoading(false);
  })(); return () => { active = false; }; }, []);
  function update(table: string, name: string, value: unknown) { setRows(previous => ({ ...previous, [table]: { ...previous[table], [name]: value } })); }
  async function save(event: React.FormEvent, section: typeof sections[number]) {
    event.preventDefault(); setError(''); setStatus('');
    const row = rows[section.table];
    if (!row?.id) { setError(`No ${section.table} singleton exists. Create the initial record through the staging database setup first.`); return; }
    const values: Row = {};
    for (const field of section.fields) {
      const value = row[field.name];
      if (row.is_published && field.name.endsWith('_url') && value && !safeUrl(String(value))) { setError(`${field.label} must use a safe HTTP(S) URL or internal path.`); return; }
      values[field.name] = field.type === 'checkbox' ? Boolean(value) : typeof value === 'string' ? value.trim() : value ?? null;
    }
    if (values.is_published && section.table === 'profile' && (!values.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email)))) { setError('Enter a name and valid public contact email before publishing.'); return; }
    setSaving(section.table);
    const { error } = await supabase.from(section.table).update(values).eq('id', row.id);
    setSaving(null);
    if (error) setError(error.message); else { invalidatePublicContent(); setStatus(`${section.title} saved. Public pages refresh within 30 seconds and guide knowledge refreshes on the next question.`); }
  }
  if (loading) return <p role="status">Loading settings…</p>;
  return <div className="max-w-5xl"><h1 className="text-2xl font-bold">Studio settings</h1><p className="text-foreground/70 mt-2 mb-6">Keep homepage copy concise. Select featured projects and their priority in <Link to="/admin/projects" className="underline">Projects</Link>. Edit career entries in their own collections.</p>
    {error && <p role="alert" className="border border-error-500 rounded-xl p-4 mb-6">{error}</p>}{status && <p role="status" className="border border-success-500 rounded-xl p-4 mb-6">{status}</p>}
    <div className="space-y-6">{sections.map(section => <form key={section.table} onSubmit={event => void save(event, section)} className="glass rounded-2xl p-5 md:p-7"><h2 className="text-xl font-semibold mb-5">{section.title}</h2>
      {section.table === 'profile' && <p className="text-sm text-foreground/70 mb-5">Your published profile and public contact details are available to the AI guide automatically. Save edits here to update its knowledge on the next question.</p>}
      {section.table === 'hero_content' && <p className="text-sm text-foreground/70 mb-5">The homepage always provides View Selected Work → /projects and Contact Me → /contact. These primary paths are fixed for clear navigation.</p>}
      {section.table === 'website_settings' && <p className="text-sm text-foreground/70 mb-5">Copyright uses the current year and published profile name once. Only the optional footer tagline is editable.</p>}
      {!rows[section.table] && <p className="mb-4 text-error-400">The CMS has no record for this section.</p>}
      <div className="grid md:grid-cols-2 gap-5">{section.fields.map(field => <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
        {field.type === 'image' || field.type === 'document' ? <FileUploader bucket={field.type === 'document' ? 'Portfolio-documents' : 'portfolio-images'} folder={section.table} type={field.type} accept={field.type === 'document' ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/avif'} label={field.label} value={String(rows[section.table]?.[field.name] || '')} onChange={value => update(section.table,field.name,value)} /> : <label className={field.type === 'checkbox' ? 'flex items-start gap-3 text-sm' : 'block text-sm font-medium'}>
          {field.type === 'checkbox' ? <><input type="checkbox" className="w-5 h-5" checked={Boolean(rows[section.table]?.[field.name])} onChange={event => update(section.table,field.name,event.target.checked)} />{field.label}</> : <>{field.label}{field.type === 'textarea' ? <textarea rows={4} className="input-field mt-2" value={String(rows[section.table]?.[field.name] || '')} onChange={event => update(section.table,field.name,event.target.value)} /> : <input className="input-field mt-2" value={String(rows[section.table]?.[field.name] || '')} onChange={event => update(section.table,field.name,event.target.value)} />}</>}
        </label>}
      </div>)}</div><button className="btn-primary mt-6" disabled={Boolean(saving) || !rows[section.table]}>{saving === section.table ? 'Saving…' : `Save ${section.title.toLowerCase()}`}</button>
    </form>)}</div>
  </div>;
}
