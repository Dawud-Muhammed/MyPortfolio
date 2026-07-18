import { CrudModule, type CrudConfig } from '../../components/admin/CrudModule';

const config: CrudConfig = {
  table: 'blog_posts',
  label: 'Blog Posts',
  displayField: 'title',
  subtitleField: 'excerpt',
  imageField: 'cover_image_url',
  statusField: 'status',
  fields: [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Article title' },
    { name: 'slug', label: 'Slug', type: 'text', placeholder: 'article-slug' },
    { name: 'cover_image_url', label: 'Cover Image', type: 'image', placeholder: 'https://...', full: true },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'Published', label: 'Published' },
      { value: 'Draft', label: 'Draft' },
    ] },
    { name: 'reading_time', label: 'Reading Time (min)', type: 'number' },
    { name: 'is_featured', label: 'Featured', type: 'boolean' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', full: true, placeholder: 'Short summary...' },
    { name: 'content', label: 'Content (Markdown)', type: 'textarea', full: true, placeholder: '# Heading\n\nContent...' },
    { name: 'seo_title', label: 'SEO Title', type: 'text', full: true },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea', full: true },
  ],
};

export function AdminBlog() {
  return <CrudModule config={config} />;
}
