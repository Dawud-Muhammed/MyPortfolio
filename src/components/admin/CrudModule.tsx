import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, X, Save, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
      const { id, created_at, ...updateData } = formData;
      const { error } = await supabase.from(config.table).update(updateData).eq('id', editing.id);
      if (error) { console.error(error); alert('Failed to save: ' + error.message); }
    } else {
      const { error } = await supabase.from(config.table).insert(formData);
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{config.label}</h1>
          <p className="text-white/40 text-sm mt-1">{items.length} items total</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary"
        >
          <Plus size={16} />
          Add New
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${config.label.toLowerCase()}...`}
          className="input-field !bg-white/5 !border-white/10 !text-white !placeholder-white/30 pl-10"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-accent-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/30">No items found.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-4 group">
              {config.imageField && item[config.imageField] && (
                <img src={item[config.imageField]} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{item[config.displayField]}</p>
                {config.subtitleField && item[config.subtitleField] && (
                  <p className="text-white/40 text-sm truncate">{item[config.subtitleField]}</p>
                )}
              </div>
              {config.statusField && item[config.statusField] && (
                <span className={`badge !text-xs ${
                  item[config.statusField] === 'Live' || item[config.statusField] === 'Published' || item[config.statusField] === 'approved'
                    ? '!bg-success-500/20 !text-success-400 !border-success-500/30'
                    : item[config.statusField] === 'In Progress' || item[config.statusField] === 'Draft' || item[config.statusField] === 'pending'
                    ? '!bg-warning-500/20 !text-warning-400 !border-warning-500/30'
                    : ''
                }`}>
                  {item[config.statusField]}
                </span>
              )}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditing(item); setShowForm(true); }}
                  className="p-2 rounded-lg text-white/50 hover:text-accent-400 hover:bg-white/10 transition-all"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg text-white/50 hover:text-error-400 hover:bg-error-500/10 transition-all"
                >
                  <Trash2 size={16} />
                </button>
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

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-strong rounded-3xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">{editing ? 'Edit' : 'Add'} {config.label}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            {config.fields.map((field) => (
              <div key={field.name} className={field.full ? 'md:col-span-2' : ''}>
                <label className="text-white/70 text-sm font-medium mb-2 block">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    rows={4}
                    className="input-field !bg-white/5 !border-white/10 !text-white !placeholder-white/30 resize-none"
                  />
                ) : field.type === 'boolean' ? (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, [field.name]: !formData[field.name] })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData[field.name] ? 'bg-accent-500' : 'bg-white/10'
                    }`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      formData[field.name] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="input-field !bg-white/5 !border-white/10 !text-white"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0d1018]">{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'json' ? (
                  <textarea
                    value={typeof formData[field.name] === 'string' ? formData[field.name] : JSON.stringify(formData[field.name] || [], null, 2)}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder || '["item1", "item2"]'}
                    rows={4}
                    className="input-field !bg-white/5 !border-white/10 !text-white !placeholder-white/30 resize-none font-mono text-xs"
                  />
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={formData[field.name] ?? ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    className="input-field !bg-white/5 !border-white/10 !text-white !placeholder-white/30"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              <Save size={16} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost !text-white !border-white/20 hover:!bg-white/10">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
