import { CrudModule, type CrudConfig } from '../../components/admin/CrudModule';

const config: CrudConfig = {
  table: 'skills',
  label: 'Skills',
  displayField: 'name',
  subtitleField: 'category',
  orderField: 'order_index',
  fields: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'React' },
    { name: 'icon_url', label: 'Icon URL', type: 'text', placeholder: 'https://...' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'Frontend' },
    { name: 'proficiency', label: 'Proficiency (%)', type: 'number' },
    { name: 'order_index', label: 'Order', type: 'number' },
  ],
};

export function AdminSkills() {
  return <CrudModule config={config} />;
}
