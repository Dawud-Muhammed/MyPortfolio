/*
# Create site_stats table for admin-editable homepage stats

1. New Tables
- `site_stats`
  - `id` (uuid, primary key)
  - `label` (text, not null) — e.g. "Years Experience"
  - `value` (text, not null) — e.g. "8+"
  - `icon` (text) — optional lucide icon name
  - `order_index` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on `site_stats`.
- Allow anon + authenticated CRUD (single-tenant, admin-managed public data).

3. Seed Data
- Inserts 3 default stat rows: Years Experience (8+), Projects Shipped (50+), Skills (15+).
*/

CREATE TABLE IF NOT EXISTS site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  icon text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_site_stats" ON site_stats;
CREATE POLICY "anon_select_site_stats" ON site_stats FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_site_stats" ON site_stats;
CREATE POLICY "anon_insert_site_stats" ON site_stats FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_site_stats" ON site_stats;
CREATE POLICY "anon_update_site_stats" ON site_stats FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_site_stats" ON site_stats;
CREATE POLICY "anon_delete_site_stats" ON site_stats FOR DELETE
  TO anon, authenticated USING (true);

-- Seed default stats
INSERT INTO site_stats (label, value, icon, order_index) VALUES
  ('Years Experience', '8+', 'Briefcase', 0),
  ('Projects Shipped', '50+', 'Rocket', 1),
  ('Skills', '15+', 'Code', 2)
ON CONFLICT DO NOTHING;
