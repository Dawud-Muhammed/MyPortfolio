import { CrudModule, type CrudConfig } from '../../components/admin/CrudModule';

const config: CrudConfig = {
  table: 'projects',
  label: 'Projects',
  displayField: 'title',
  subtitleField: 'excerpt',
  imageField: 'cover_image_url',
  statusField: 'status',
  orderField: 'order_index',
  fields: [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Project name' },
    { name: 'slug', label: 'Slug', type: 'text', placeholder: 'project-slug' },
    { name: 'cover_image_url', label: 'Cover Image', type: 'image', placeholder: 'https://...', full: true },
    { name: 'gallery', label: 'Gallery (JSON array of URLs)', type: 'json', full: true },
    { name: 'demo_url', label: 'Demo URL', type: 'text', placeholder: 'https://...' },
    { name: 'github_url', label: 'GitHub URL', type: 'text', placeholder: 'https://github.com/...' },
    { name: 'video_demo_url', label: 'Video Demo URL', type: 'text', placeholder: 'https://...' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Live', label: 'Live' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Archived', label: 'Archived' },
    ] },
    { name: 'is_featured', label: 'Featured', type: 'boolean' },
    { name: 'order_index', label: 'Order', type: 'number' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', full: true, placeholder: 'Short summary...' },
    { name: 'description', label: 'Description', type: 'textarea', full: true, placeholder: 'Full description...' },
    { name: 'seo_title', label: 'SEO Title', type: 'text', full: true },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea', full: true },
  ],
};

export function AdminProjects() {
  return <CrudModule config={config} />;
}
