import { CrudModule, type CrudConfig } from '../../components/admin/CrudModule';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const config: CrudConfig = {
  table: 'projects',
  label: 'Projects',
  displayField: 'title',
  subtitleField: 'excerpt',
  imageField: 'cover_image_url',
  statusField: 'publication_status',
  orderField: 'order_index',
  fields: [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Project name' },
    { name: 'slug', label: 'Slug', type: 'text', placeholder: 'project-slug' },
    { name: 'cover_image_url', label: 'Cover Image', type: 'image', placeholder: 'https://...', full: true },
    { name: 'gallery', label: 'Gallery (JSON array of URLs)', type: 'json', full: true },
    { name: 'gallery_captions', label: 'Screenshot captions (JSON array, same order as gallery)', type: 'json', full: true },
    { name: 'publication_status', label: 'Publication', type: 'select', defaultValue: 'draft', options: [{ value: 'draft', label: 'Draft — private' }, { value: 'published', label: 'Published' }] },
    { name: 'demo_url', label: 'Demo URL', type: 'text', placeholder: 'https://...' },
    { name: 'github_url', label: 'GitHub URL', type: 'text', placeholder: 'https://github.com/...' },
    { name: 'video_demo_url', label: 'Video Demo URL', type: 'text', placeholder: 'https://...' },
    { name: 'status', label: 'Product status (separate from evidence and publication)', type: 'select', defaultValue: 'In Progress', options: [
      { value: 'Live', label: 'Live' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Archived', label: 'Archived' },
    ] },
    { name: 'is_featured', label: 'Featured', type: 'boolean' },
    { name: 'order_index', label: 'Order', type: 'number' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', full: true, placeholder: 'Short summary...' },
    { name: 'description', label: 'Description', type: 'textarea', full: true, placeholder: 'Full description...' },
    { name: 'problem', label: 'Problem', type: 'textarea', full: true },
    { name: 'intended_users', label: 'Intended users', type: 'textarea', full: true },
    { name: 'role', label: 'Your role', type: 'textarea', full: true },
    { name: 'team_contribution', label: 'Your contribution and team responsibilities', type: 'textarea', full: true },
    { name: 'decisions', label: 'Engineering decisions', type: 'textarea', full: true },
    { name: 'implementation', label: 'Implementation', type: 'textarea', full: true },
    { name: 'challenges', label: 'Challenges', type: 'textarea', full: true },
    { name: 'evidence', label: 'Evidence notes', type: 'textarea', full: true },
    { name: 'outcomes', label: 'Verified outcomes (leave empty if unknown)', type: 'textarea', full: true },
    { name: 'seo_title', label: 'SEO Title', type: 'text', full: true },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea', full: true },
  ],
};

export function AdminProjects() {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => { void supabase.from('project_categories').select('id,name').order('order_index').then(({ data }) => setCategories((data || []).map(row => ({ value: row.id, label: row.name })))); }, []);
  return <CrudModule config={{ ...config, fields: [...config.fields, { name: 'category_id', label: 'Project category', type: 'select', options: categories }] }} />;
}
