import { CrudModule, type CrudConfig } from '../../components/admin/CrudModule';

export function AdminExperience() {
  const config: CrudConfig = {
    table: 'experience',
    label: 'Experience',
    displayField: 'role',
    subtitleField: 'company',
    orderField: 'order_index',
    fields: [
      { name: 'role', label: 'Role', type: 'text', placeholder: 'Senior Engineer' },
      { name: 'company', label: 'Company', type: 'text', placeholder: 'Company name' },
      { name: 'location', label: 'Location', type: 'text', placeholder: 'San Francisco, CA' },
      { name: 'start_date', label: 'Start Date', type: 'text', placeholder: 'Jan 2022' },
      { name: 'end_date', label: 'End Date', type: 'text', placeholder: 'Dec 2023' },
      { name: 'is_current', label: 'Current Position', type: 'boolean' },
      { name: 'logo_url', label: 'Logo URL', type: 'text', placeholder: 'https://...' },
      { name: 'order_index', label: 'Order', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
    ],
  };
  return <CrudModule config={config} />;
}

export function AdminEducation() {
  const config: CrudConfig = {
    table: 'education',
    label: 'Education',
    displayField: 'institution',
    subtitleField: 'degree',
    orderField: 'order_index',
    fields: [
      { name: 'institution', label: 'Institution', type: 'text' },
      { name: 'degree', label: 'Degree', type: 'text' },
      { name: 'field', label: 'Field', type: 'text' },
      { name: 'start_date', label: 'Start Date', type: 'text' },
      { name: 'end_date', label: 'End Date', type: 'text' },
      { name: 'logo_url', label: 'Logo URL', type: 'text' },
      { name: 'order_index', label: 'Order', type: 'number' },
    ],
  };
  return <CrudModule config={config} />;
}

export function AdminCertifications() {
  const config: CrudConfig = {
    table: 'certifications',
    label: 'Certifications',
    displayField: 'title',
    subtitleField: 'issuer',
    orderField: 'order_index',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'issuer', label: 'Issuer', type: 'text' },
      { name: 'issue_date', label: 'Issue Date', type: 'text' },
      { name: 'expiry_date', label: 'Expiry Date', type: 'text' },
      { name: 'credential_id', label: 'Credential ID', type: 'text' },
      { name: 'verify_url', label: 'Verify URL', type: 'text', full: true },
      { name: 'badge_url', label: 'Badge URL', type: 'text', full: true },
      { name: 'order_index', label: 'Order', type: 'number' },
    ],
  };
  return <CrudModule config={config} />;
}

export function AdminServices() {
  const config: CrudConfig = {
    table: 'services',
    label: 'Services',
    displayField: 'title',
    orderField: 'order_index',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'icon', label: 'Icon', type: 'select', options: [
        { value: 'Code', label: 'Code' },
        { value: 'Zap', label: 'Zap' },
        { value: 'Sparkles', label: 'Sparkles' },
      ] },
      { name: 'order_index', label: 'Order', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'included_items', label: 'Included Items (JSON array)', type: 'json', full: true },
    ],
  };
  return <CrudModule config={config} />;
}

export function AdminTestimonials() {
  const config: CrudConfig = {
    table: 'testimonials',
    label: 'Testimonials',
    displayField: 'name',
    subtitleField: 'company',
    imageField: 'avatar_url',
    orderField: 'order_index',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'avatar_url', label: 'Avatar URL', type: 'text', full: true },
      { name: 'rating', label: 'Rating (1-5)', type: 'number' },
      { name: 'is_featured', label: 'Featured', type: 'boolean' },
      { name: 'order_index', label: 'Order', type: 'number' },
      { name: 'quote', label: 'Quote', type: 'textarea', full: true },
    ],
  };
  return <CrudModule config={config} />;
}

export function AdminGallery() {
  const config: CrudConfig = {
    table: 'gallery_items',
    label: 'Gallery',
    displayField: 'caption',
    imageField: 'image_url',
    orderField: 'order_index',
    fields: [
      { name: 'image_url', label: 'Image URL', type: 'text', full: true },
      { name: 'caption', label: 'Caption', type: 'text', full: true },
      { name: 'tags', label: 'Tags (JSON array)', type: 'json', full: true },
      { name: 'order_index', label: 'Order', type: 'number' },
    ],
  };
  return <CrudModule config={config} />;
}

export function AdminAchievements() {
  const config: CrudConfig = {
    table: 'achievements',
    label: 'Achievements',
    displayField: 'title',
    subtitleField: 'issuer',
    imageField: 'image_url',
    orderField: 'order_index',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'issuer', label: 'Issuer', type: 'text' },
      { name: 'date', label: 'Date', type: 'text' },
      { name: 'image_url', label: 'Image URL', type: 'text', full: true },
      { name: 'verify_url', label: 'Verify URL', type: 'text', full: true },
      { name: 'order_index', label: 'Order', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
    ],
  };
  return <CrudModule config={config} />;
}

export function AdminFaqs() {
  const config: CrudConfig = {
    table: 'faqs',
    label: 'FAQs',
    displayField: 'question',
    orderField: 'order_index',
    fields: [
      { name: 'question', label: 'Question', type: 'text', full: true },
      { name: 'answer', label: 'Answer', type: 'textarea', full: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'order_index', label: 'Order', type: 'number' },
    ],
  };
  return <CrudModule config={config} />;
}

export function AdminSocialLinks() {
  const config: CrudConfig = {
    table: 'social_links',
    label: 'Social Links',
    displayField: 'platform',
    orderField: 'order_index',
    fields: [
      { name: 'platform', label: 'Platform', type: 'text', placeholder: 'GitHub' },
      { name: 'url', label: 'URL', type: 'text', full: true, placeholder: 'https://github.com/...' },
      { name: 'is_visible', label: 'Visible', type: 'boolean' },
      { name: 'order_index', label: 'Order', type: 'number' },
    ],
  };
  return <CrudModule config={config} />;
}
