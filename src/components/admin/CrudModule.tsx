import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, X, Save, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FileUploader } from './FileUploader';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'json' | 'image';
  options?: { value: string; label: string }[];
  placeholder?: string;
  full?: boolean;
}

export interface CrudConfig {
  table: string;
  label: string;
  fields: FieldDef[];
  displayField: string;
  subtitleField?: string;
  imageField?: string;
  statusField?: string;
  orderField?: string;
  extraSelect?: string;
  extraSelectMapping?: (row: any) => any;
}

export function CrudModule({ config }: { config: CrudConfig }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let query = supabase.from(config.table).select('*');
    if (config.orderField) query = query.order(config.orderField, { ascending: true });
    else query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) console.error(error);
    setItems(data || []);
    setLoading(false);
  }, [config.table, config.orderField]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSave = async (formData: Record<string, any>) => {
    setSaving(true);
    if (editing?.id) {
      const { id, created_at, updated_at, ...updateData } = formData;
      const { error } = await supabase.from(config.table).update(updateData).eq('id', editing.id);
      if (error) { console.error(error); alert('Failed to save: ' + error.message); }
    } else {
      const { created_at, updated_at, ...insertData } = formData;
      const { error } = await supabase.from(config.table).insert(insertData);
      if (error) { console.error(error); alert('Failed to create: ' + error.message); }
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from(config.table).delete().eq('id', id);
    if (error) { console.error(error); alert('Failed to delete: ' + error.message); return; }
    fetchItems();
  };

  const filtered = items.filter((item) => {
    const val = String(item[config.displayField] || '').toLowerCase();
    return val.includes(search.toLowerCase());
  });

  return (
    <div className="min-w-0">
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{config.label}</h1>
          <p className="text-foreground/40 text-sm mt-1">{items.length} items total</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add New</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${config.label.toLowerCase()}...`}
          className="input-field pl-10"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-accent-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-foreground/30">No items found.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 group hover:border-foreground/20 transition-all w-full min-w-0 overflow-hidden"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {config.imageField && item[config.imageField] && (
                  <img
                    src={item[config.imageField]}
                    alt=""
                    className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg object-cover shrink-0 border border-foreground/10 bg-foreground/5"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <p className="text-foreground font-semibold truncate text-sm sm:text-base leading-snug">
                      {item[config.displayField]}
                    </p>
                    {item.is_featured && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-accent-500/15 text-accent-400 border border-accent-500/30 shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                  {config.subtitleField && item[config.subtitleField] && (
                    <p className="text-foreground/50 text-xs sm:text-sm truncate mt-0.5 line-clamp-1">
                      {item[config.subtitleField]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2.5 md:pt-0 border-t border-foreground/5 md:border-t-0">
                {config.statusField && item[config.statusField] && (
                  <span className={`badge !text-xs shrink-0 ${
                    item[config.statusField] === 'Live' || item[config.statusField] === 'Published' || item[config.statusField] === 'approved'
                      ? '!bg-success-500/20 !text-success-400 !border-success-500/30'
                      : item[config.statusField] === 'In Progress' || item[config.statusField] === 'Draft' || item[config.statusField] === 'pending'
                      ? '!bg-warning-500/20 !text-warning-400 !border-warning-500/30'
                      : ''
                  }`}>
                    {item[config.statusField]}
                  </span>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setEditing(item); setShowForm(true); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-accent-400 bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/30 transition-all hover:scale-105 active:scale-95"
                    aria-label="Edit"
                    title="Edit item"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-error-400 bg-error-500/10 hover:bg-error-500/20 border border-error-500/30 transition-all hover:scale-105 active:scale-95"
                    aria-label="Delete"
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <CrudForm
          config={config}
          editing={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
          saving={saving}
        />
      )}
    </div>
  );
}

function CrudForm({ config, editing, onSave, onClose, saving }: {
  config: CrudConfig;
  editing: any | null;
  onSave: (data: Record<string, any>) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (editing) {
      setFormData({ ...editing });
    } else {
      const defaults: Record<string, any> = {};
      config.fields.forEach((f) => {
        if (f.type === 'boolean') defaults[f.name] = false;
        else if (f.type === 'number') defaults[f.name] = 0;
        else if (f.type === 'json') defaults[f.name] = [];
        else defaults[f.name] = '';
      });
      if (config.orderField) defaults[config.orderField] = 0;
      setFormData(defaults);
    }
  }, [editing, config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean: Record<string, any> = {};
    config.fields.forEach((f) => {
      let val = formData[f.name];
      if (f.type === 'number') val = Number(val) || 0;
      else if (f.type === 'boolean') val = Boolean(val);
      else if (f.type === 'json') {
        if (typeof val === 'string') {
          try { val = JSON.parse(val); } catch { val = []; }
        }
      }
      clean[f.name] = val;
    });
    onSave(clean);
  };

  const update = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-foreground/10 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {editing ? 'Edit' : 'Add'} {config.label}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" data-lenis-prevent>
          <form onSubmit={handleSubmit} id="crud-form" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.fields.map((field) => (
                <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                  <label className="text-foreground/70 text-sm font-medium mb-2 block">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => update(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="input-field resize-none"
                    />
                  ) : field.type === 'boolean' ? (
                    <button
                      type="button"
                      onClick={() => update(field.name, !formData[field.name])}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        formData[field.name] ? 'bg-accent-500' : 'bg-foreground/15'
                      }`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        formData[field.name] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => update(field.name, e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'image' ? (
                    <FileUploader
                      bucket="portfolio-images"
                      folder={config.table}
                      value={formData[field.name] || ''}
                      onChange={(url) => update(field.name, url)}
                      type="image"
                      label=""
                    />
                  ) : field.type === 'json' ? (
                    <textarea
                      value={typeof formData[field.name] === 'string' ? formData[field.name] : JSON.stringify(formData[field.name] || [], null, 2)}
                      onChange={(e) => update(field.name, e.target.value)}
                      placeholder={field.placeholder || '["item1", "item2"]'}
                      rows={4}
                      className="input-field resize-none font-mono text-xs"
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formData[field.name] ?? ''}
                      onChange={(e) => update(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="input-field"
                    />
                  )}
                </div>


              ))}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 sm:p-6 border-t border-foreground/10 shrink-0">
          <button type="submit" form="crud-form" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
