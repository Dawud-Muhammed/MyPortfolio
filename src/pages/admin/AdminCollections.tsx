import { useState } from 'react';
import { CrudModule, type CrudConfig } from '../../components/admin/CrudModule';
const collections: CrudConfig[] = [
  { table: 'technologies', label: 'Technologies', displayField: 'name', orderField: 'name', fields: [{ name: 'name', label: 'Technology name', type: 'text' }, { name: 'category', label: 'Category', type: 'text' }, { name: 'icon_url', label: 'Icon image', type: 'image' }] },
  { table: 'project_categories', label: 'Project categories', displayField: 'name', orderField: 'order_index', fields: [{ name: 'name', label: 'Name', type: 'text' }, { name: 'slug', label: 'Slug', type: 'text' }, { name: 'color', label: 'Color', type: 'text' }, { name: 'order_index', label: 'Order', type: 'number' }] },
  { table: 'blog_categories', label: 'Article categories', displayField: 'name', orderField: 'name', fields: [{ name: 'name', label: 'Name', type: 'text' }, { name: 'slug', label: 'Slug', type: 'text' }, { name: 'color', label: 'Color', type: 'text' }] },
  { table: 'blog_tags', label: 'Article tags', displayField: 'name', orderField: 'name', fields: [{ name: 'name', label: 'Name', type: 'text' }, { name: 'slug', label: 'Slug', type: 'text' }] },
  { table: 'blog_comments', label: 'Comment moderation', displayField: 'name', subtitleField: 'comment', statusField: 'status', fields: [{ name: 'name', label: 'Reader name', type: 'text' }, { name: 'email', label: 'Private email', type: 'text' }, { name: 'post_id', label: 'Article ID', type: 'text', required: true }, { name: 'comment', label: 'Comment', type: 'textarea', full: true }, { name: 'status', label: 'Moderation', type: 'select', defaultValue: 'pending', options: [{ value: 'pending', label: 'Pending — private' }, { value: 'approved', label: 'Approved — public (email stays private)' }, { value: 'rejected', label: 'Rejected — private' }] }] },
];
export function AdminCollections() {
  const [selected, setSelected] = useState(collections[0].table);
  return <div><label className="block mb-6 max-w-sm">Collection<select className="input-field mt-2" value={selected} onChange={event => setSelected(event.target.value)}>{collections.map(config => <option key={config.table} value={config.table}>{config.label}</option>)}</select></label><CrudModule key={selected} config={collections.find(config => config.table === selected)!} /></div>;
}
