import { CrudModule, type CrudConfig } from '../../components/admin/CrudModule';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const config: CrudConfig = {
  table: 'blog_posts',
  label: 'Blog Posts',
  displayField: 'title',
  subtitleField: 'excerpt',
  imageField: 'cover_image_url',
  statusField: 'status',
  orderField: 'published_at',
  ascending: false,
  fields: [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Article title' },
    { name: 'slug', label: 'Slug', type: 'text', placeholder: 'article-slug' },
    { name: 'cover_image_url', label: 'Cover Image', type: 'image', placeholder: 'https://...', full: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'Draft', options: [
      { value: 'Published', label: 'Published' },
      { value: 'Draft', label: 'Draft' },
    ] },
    { name: 'published_at', label: 'Publication date', type: 'date' },
    { name: 'assistant_eligible', label: 'Approved for AI guide knowledge', type: 'boolean' },
    { name: 'is_featured', label: 'Featured', type: 'boolean' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', full: true, placeholder: 'Short summary...' },
    { name: 'content', label: 'Content (Markdown)', type: 'textarea', full: true, placeholder: '# Heading\n\nContent...' },
    { name: 'seo_title', label: 'SEO Title', type: 'text', full: true },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea', full: true },
  ],
};

export function AdminBlog() {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => { void supabase.from('blog_categories').select('id,name').order('name').then(({ data }) => setCategories((data || []).map(row => ({ value: row.id, label: row.name })))); }, []);
  return <CrudModule config={{ ...config, fields: [...config.fields, { name: 'category_id', label: 'Article category', type: 'select', options: categories }] }} />;
}
