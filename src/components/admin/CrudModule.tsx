import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit3, Trash2, X, Save, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { invalidatePublicContent } from '../../lib/queries';
import { readingMinutes } from '../../lib/utils';
import { FileUploader } from './FileUploader';

type Row = Record<string, unknown>;
export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'json' | 'image' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
  full?: boolean;
  required?: boolean;
  defaultValue?: unknown;
}
export interface CrudConfig {
  table: string; label: string; fields: FieldDef[]; displayField: string;
  subtitleField?: string; imageField?: string; statusField?: string; orderField?: string;
  ascending?: boolean;
  extraSelect?: string;
  extraSelectMapping?: (row: Row) => Row;
}
const publicationTables = new Set(['skills','experience','education','certifications','services','testimonials','social_links','navigation_items','faqs','gallery_items','achievements','technologies','project_categories','blog_categories','blog_tags']);
const knowledgeTables = new Set(['experience','services','faqs']);
function fieldsFor(config: CrudConfig): FieldDef[] {
  return [...config.fields,
    ...(publicationTables.has(config.table) ? [{ name: 'is_published', label: 'Published on public site', type: 'boolean' as const, defaultValue: false }] : []),
    ...(knowledgeTables.has(config.table) ? [{ name: 'assistant_eligible', label: 'Approved for AI guide knowledge', type: 'boolean' as const, defaultValue: false }] : []),
  ];
}

export function CrudModule({ config }: { config: CrudConfig }) {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(config.table).select('*').order(config.orderField || 'created_at', { ascending: config.ascending ?? Boolean(config.orderField) });
    setError(error?.message || ''); setItems(data || []); setLoading(false);
  }, [config.table, config.orderField, config.ascending]);
  useEffect(() => { void fetchItems(); }, [fetchItems]);

  async function save(formData: Row, technologyIds: string[]) {
    setSaving(true); setError('');
    let id = editing?.id as string | undefined;
    const operation = id ? supabase.from(config.table).update(formData).eq('id', id) : supabase.from(config.table).insert(formData);
    const { data, error: saveError } = await operation.select('id').single();
    if (saveError) { setError(saveError.message); setSaving(false); return; }
    id = data.id;
    if (config.table === 'projects') {
      const { error: relationError } = await supabase.rpc('save_project_technologies', { p_project_id: id, p_technology_ids: technologyIds });
      if (relationError) { setEditing({ ...formData, id }); setError(`Project saved, but technology links were not saved: ${relationError.message}. Retry Save to complete the update.`); setSaving(false); invalidatePublicContent(); return; }
    }
    invalidatePublicContent(); setSaving(false); setShowForm(false); setEditing(null); void fetchItems();
  }
  async function remove(id: string) {
    if (!confirm('Delete this record permanently? Unpublish it instead to preserve its history.')) return;
    const { error } = await supabase.from(config.table).delete().eq('id', id);
    if (error) { setError(error.message); return; }
    invalidatePublicContent(); void fetchItems();
  }
  const filtered = items.filter(item => String(item[config.displayField] || '').toLowerCase().includes(search.toLowerCase()));
  return <div className="min-w-0">
    <div className="flex justify-between gap-4 mb-6"><div><h1 className="text-2xl font-bold">{config.label}</h1><p className="text-foreground/60 mt-1">{items.length} records · {config.orderField || 'created_at'} · {(config.ascending ?? Boolean(config.orderField)) ? 'ascending' : 'descending'}</p></div><button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); setError(''); }}><Plus size={16} />Add new</button></div>
    {error && !showForm && <p role="alert" className="p-4 mb-4 border border-error-500 rounded-xl">{error} <button className="underline" onClick={() => void fetchItems()}>Retry</button></p>}
    <label className="flex items-center gap-3 max-w-sm mb-6"><Search size={18} /><span className="sr-only">Search {config.label}</span><input className="input-field" placeholder={`Search ${config.label.toLowerCase()}`} value={search} onChange={e => setSearch(e.target.value)} /></label>
    {loading ? <p role="status" className="py-12"><Loader2 className="animate-spin" />Loading…</p> : filtered.length === 0 ? <p className="py-12 text-foreground/60">No records found.</p> : <div className="grid gap-3">{filtered.map(item => <div key={String(item.id)} className="glass rounded-xl p-4 flex flex-wrap items-center gap-4">
      {config.imageField && Boolean(item[config.imageField]) && <img className="w-14 h-14 object-cover rounded-lg" src={String(item[config.imageField])} alt="" />}
      <div className="flex-1 min-w-0"><h2 className="font-semibold break-words">{String(item[config.displayField] || 'Untitled')}</h2>{config.subtitleField && <p className="text-sm text-foreground/60 line-clamp-2">{String(item[config.subtitleField] || '')}</p>}<p className="text-sm text-foreground/70">{String(item.publication_status || (item.is_published === false ? 'draft' : item[config.statusField || ''] || ''))}</p></div>
      <button className="btn-ghost" onClick={() => { setEditing(item); setShowForm(true); setError(''); }}><Edit3 size={16} />Edit</button><button className="btn-ghost" aria-label={`Delete ${item[config.displayField]}`} onClick={() => void remove(String(item.id))}><Trash2 size={16} /></button>
    </div>)}</div>}
    {showForm && <CrudForm key={String(editing?.id || 'new')} config={config} editing={editing} onSave={save} onClose={() => { if (!saving) { setShowForm(false); setEditing(null); setError(''); } }} saving={saving} saveError={error} />}
  </div>;
}

function CrudForm({ config, editing, onSave, onClose, saving, saveError }: { config: CrudConfig; editing: Row | null; onSave: (data: Row, technologyIds: string[]) => Promise<void>; onClose: () => void; saving: boolean; saveError: string }) {
  const fields = fieldsFor(config);
  const [data, setData] = useState<Row>(() => editing || Object.fromEntries(fields.map(f => [f.name, f.defaultValue ?? (f.type === 'boolean' ? false : f.type === 'number' ? 0 : f.type === 'json' ? [] : '')])));
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [technologies, setTechnologies] = useState<{ id: string; name: string }[]>([]);
  const [technologyIds, setTechnologyIds] = useState<string[]>([]);
  const [relationsReady, setRelationsReady] = useState(config.table !== 'projects');
  const dialog = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') {
        const elements = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, textarea, a[href], [tabindex="0"]');
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  useEffect(() => {
    if (config.table !== 'projects') return;
    let active = true;
    void (async () => {
      const [all, selected] = await Promise.all([supabase.from('technologies').select('id,name').order('name'), editing?.id ? supabase.from('project_technologies').select('technology_id').eq('project_id', editing.id) : Promise.resolve({ data: [], error: null })]);
      if (!active) return;
      if (all.error || selected.error) { setError('Technology relationships could not be loaded. Close and reopen this editor before saving.'); return; }
      setTechnologies(all.data || []); setTechnologyIds((selected.data || []).map(r => r.technology_id)); setRelationsReady(true);
    })(); return () => { active = false; };
  }, [config.table, editing?.id]);
  const update = (name: string, value: unknown) => setData(previous => ({ ...previous, [name]: value }));
  function submit(event: React.FormEvent) {
    event.preventDefault(); setError('');
    const clean: Row = {};
    try {
      for (const field of fields) {
        let value = data[field.name];
        if (field.type === 'number') { value = Number(value); if (!Number.isFinite(value)) throw new Error(`${field.label} must be a number.`); }
        else if (field.type === 'boolean') value = Boolean(value);
        else if (field.type === 'json') { if (typeof value === 'string') { try { value = JSON.parse(value); } catch { throw new Error(`${field.label} contains invalid JSON. Your changes have been preserved.`); } } if (!Array.isArray(value)) throw new Error(`${field.label} must be an array.`); }
        else if (typeof value === 'string') value = value.trim();
        if ((field.required || field.name === config.displayField || field.name === 'slug') && !value) throw new Error(`${field.label} is required.`);
        if (field.name === 'slug' && !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(String(value))) throw new Error('Slug must contain letters, numbers and single hyphens only.');
        if ((field.name.endsWith('_url') || field.name === 'url') && value && !/^https?:\/\//i.test(String(value))) throw new Error(`${field.label} must be an HTTP or HTTPS URL.`);
        if ((field.type === 'date' || field.name.endsWith('_id')) && value === '') value = null;
        clean[field.name] = value ?? null;
      }
      if (config.table === 'blog_posts' && clean.status === 'Published' && !clean.published_at) throw new Error('Set a publication date before publishing this article.');
      if (config.table === 'blog_posts') clean.reading_time = readingMinutes(String(clean.content || ''), String(clean.title || ''));
      if (config.table === 'navigation_items' && (!/^\/(?!\/)/.test(String(clean.target || '')) || String(clean.target).includes('\\'))) throw new Error('Navigation must use an internal path beginning with one slash.');
      if (config.table === 'gallery_items' && clean.is_published && (!clean.caption || !clean.alt_text)) throw new Error('Add a descriptive caption and alternative text before publishing.');
      if (clean.publication_status === 'published' && (!clean.excerpt || !clean.description)) throw new Error('Add a summary and description before publishing this project.');
      void onSave(clean, technologyIds);
    } catch (error) { setError(error instanceof Error ? error.message : 'Check the entered values.'); }
  }
  const warnings = config.table === 'projects' ? [!technologyIds.length && 'Add verified technologies to avoid an empty technology section.', !data.demo_url && !data.github_url && !data.video_demo_url && 'No public demo, source or video evidence is linked.', !data.role && 'Describe your personal role and team contribution.'].filter(Boolean) : [];
  return <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}><div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="crud-title" className="glass-strong rounded-t-2xl sm:rounded-2xl w-full max-w-3xl max-h-[90dvh] flex flex-col" onClick={e => e.stopPropagation()}>
    <header className="p-5 border-b border-foreground/10 flex items-center justify-between"><h2 id="crud-title" className="text-xl font-semibold">{editing ? 'Edit' : 'Add'} {config.label}</h2><button disabled={saving} aria-label="Close editor" className="btn-ghost" onClick={onClose}><X size={20} /></button></header>
    <div className="p-5 overflow-y-auto"><p className="text-sm text-foreground/60 mb-4">Published content refreshes open public pages within 30 seconds and the AI guide on its next request. Knowledge requires a separate approval switch.</p>
      {(error || saveError) && <p role="alert" className="border border-error-500 rounded-lg p-3 mb-4">{error || saveError}</p>}
      {warnings.length > 0 && <aside className="border border-warning-500 rounded-lg p-3 mb-4"><p className="font-semibold">Publishing review</p><ul className="list-disc pl-5 text-sm">{warnings.map(w => <li key={String(w)}>{w}</li>)}</ul></aside>}
      <button type="button" className="btn-ghost mb-4" onClick={() => setPreview(!preview)}>{preview ? 'Back to editor' : 'Preview current draft'}</button>
      {config.table === 'blog_posts' && <p className="text-sm mb-4">Calculated reading time: {readingMinutes(String(data.content || ''), String(data.title || ''))} min</p>}
      {preview ? <article className="prose max-w-none"><h3>{String(data[config.displayField] || 'Untitled')}</h3>{config.imageField && Boolean(data[config.imageField]) && <img src={String(data[config.imageField])} alt="Draft preview" />}{fields.filter(f => f.type === 'textarea').map(f => <section key={f.name}><h4>{f.label}</h4><p className="whitespace-pre-wrap">{String(data[f.name] || '')}</p></section>)}</article> : <form id="crud-form" onSubmit={submit} className="grid sm:grid-cols-2 gap-4">{fields.map(field => <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}><label htmlFor={`field-${field.name}`} className="block text-sm font-medium mb-2">{field.label}</label>
        {field.type === 'boolean' ? <input id={`field-${field.name}`} type="checkbox" checked={Boolean(data[field.name])} onChange={e => update(field.name, e.target.checked)} className="w-6 h-6 accent-accent-500" /> : field.type === 'select' ? <select id={`field-${field.name}`} value={String(data[field.name] || '')} onChange={e => update(field.name,e.target.value)} className="input-field"><option value="">Select…</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === 'image' ? <FileUploader bucket="portfolio-images" folder={config.table} value={String(data[field.name] || '')} onChange={url => update(field.name,url)} label={field.label} /> : field.type === 'textarea' || field.type === 'json' ? <textarea id={`field-${field.name}`} className="input-field" rows={field.name === 'content' ? 16 : 4} value={field.type === 'json' && typeof data[field.name] !== 'string' ? JSON.stringify(data[field.name] || [], null, 2) : String(data[field.name] || '')} placeholder={field.placeholder} onChange={e => update(field.name,e.target.value)} /> : <input id={`field-${field.name}`} className="input-field" type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} value={String(data[field.name] ?? '').slice(0, field.type === 'date' ? 10 : undefined)} placeholder={field.placeholder} onChange={e => update(field.name,e.target.value)} />}
      </div>)}{config.table === 'projects' && <fieldset className="sm:col-span-2 border border-foreground/20 rounded-xl p-4"><legend>Verified technologies</legend>{technologies.map(technology => <label key={technology.id} className="inline-flex items-center gap-2 mr-5 my-2"><input type="checkbox" checked={technologyIds.includes(technology.id)} onChange={e => setTechnologyIds(previous => e.target.checked ? [...previous, technology.id] : previous.filter(id => id !== technology.id))} />{technology.name}</label>)}</fieldset>}</form>}
    </div><footer className="p-5 border-t border-foreground/10 flex gap-3"><button form="crud-form" type="submit" disabled={saving || preview || !relationsReady} className="btn-primary disabled:opacity-50"><Save size={16} />{saving ? 'Saving…' : 'Save changes'}</button><button disabled={saving} className="btn-ghost" onClick={onClose}>Cancel</button></footer>
  </div></div>;
}
