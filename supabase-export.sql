-- ============================================================
-- Portfolio Platform - Complete Database Export
-- Schema + RLS Policies + Indexes + Seed Data
-- ============================================================

-- ============================================================
-- SECTION 1: TABLES
-- ============================================================

-- Table: profile
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Alex Rivera',
  title text NOT NULL DEFAULT 'Full-Stack Software Engineer',
  tagline text DEFAULT 'Building delightful digital experiences',
  bio text DEFAULT '',
  email text DEFAULT 'alex@alexrivera.dev',
  phone text DEFAULT '+1 (415) 555-0142',
  location text DEFAULT 'San Francisco, CA',
  timezone text DEFAULT 'America/Los_Angeles',
  availability boolean DEFAULT true,
  resume_url text,
  profile_picture_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: hero_content
CREATE TABLE IF NOT EXISTS hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kicker text NOT NULL DEFAULT 'SOFTWARE ENGINEER · CREATIVE DEVELOPER',
  headline text NOT NULL DEFAULT 'I build things for the web',
  highlighted_word text NOT NULL DEFAULT 'the web',
  subheadline text NOT NULL DEFAULT 'Full-stack engineer crafting performant, accessible, and beautiful digital products from concept to deployment.',
  cta_primary_label text NOT NULL DEFAULT 'View Projects',
  cta_primary_url text NOT NULL DEFAULT '/projects',
  cta_secondary_label text NOT NULL DEFAULT 'Download Resume',
  cta_secondary_url text DEFAULT '',
  availability_status boolean DEFAULT true,
  availability_label text DEFAULT 'Available for work',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: hero_videos
CREATE TABLE IF NOT EXISTS hero_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL DEFAULT '',
  thumbnail_url text DEFAULT '',
  filename text NOT NULL DEFAULT '',
  duration text DEFAULT '',
  size text DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: hero_images
CREATE TABLE IF NOT EXISTS hero_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: technologies
CREATE TABLE IF NOT EXISTS technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  icon_url text DEFAULT '',
  category text NOT NULL DEFAULT 'Framework',
  created_at timestamptz DEFAULT now()
);

-- Table: project_categories
CREATE TABLE IF NOT EXISTS project_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE DEFAULT '',
  color text DEFAULT '#6366F1',
  created_at timestamptz DEFAULT now()
);

-- Table: projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE DEFAULT '',
  cover_image_url text DEFAULT '',
  gallery jsonb DEFAULT '[]'::jsonb,
  demo_url text DEFAULT '',
  github_url text DEFAULT '',
  status text NOT NULL DEFAULT 'Live',
  is_featured boolean NOT NULL DEFAULT false,
  difficulty text NOT NULL DEFAULT 'Intermediate',
  description text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  video_demo_url text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  category_id uuid REFERENCES project_categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: project_technologies
CREATE TABLE IF NOT EXISTS project_technologies (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id uuid NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

-- Table: blog_categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE DEFAULT '',
  color text DEFAULT '#8B5CF6',
  created_at timestamptz DEFAULT now()
);

-- Table: blog_tags
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Table: blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE DEFAULT '',
  cover_image_url text DEFAULT '',
  content text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Published',
  published_at timestamptz DEFAULT now(),
  reading_time integer DEFAULT 5,
  is_featured boolean NOT NULL DEFAULT false,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  og_image_url text DEFAULT '',
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: blog_post_tags
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Table: blog_comments
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  comment text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Table: skills
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  icon_url text DEFAULT '',
  category text NOT NULL DEFAULT 'Frontend',
  proficiency integer NOT NULL DEFAULT 80,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: experience
CREATE TABLE IF NOT EXISTS experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  location text DEFAULT '',
  start_date text NOT NULL DEFAULT '',
  end_date text DEFAULT '',
  is_current boolean NOT NULL DEFAULT false,
  description text NOT NULL DEFAULT '',
  logo_url text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: education
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution text NOT NULL DEFAULT '',
  degree text NOT NULL DEFAULT '',
  field text NOT NULL DEFAULT '',
  start_date text NOT NULL DEFAULT '',
  end_date text DEFAULT '',
  logo_url text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: certifications
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  issuer text NOT NULL DEFAULT '',
  issue_date text NOT NULL DEFAULT '',
  expiry_date text DEFAULT '',
  credential_id text DEFAULT '',
  verify_url text DEFAULT '',
  badge_url text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: services
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Code',
  description text NOT NULL DEFAULT '',
  included_items jsonb DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  role text DEFAULT '',
  company text DEFAULT '',
  avatar_url text DEFAULT '',
  rating integer NOT NULL DEFAULT 5,
  quote text NOT NULL DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  is_spam boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table: social_links
CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  is_visible boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: seo_settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title_template text NOT NULL DEFAULT '%s | Alex Rivera',
  meta_description text NOT NULL DEFAULT 'Full-stack software engineer building delightful digital experiences.',
  og_image_url text DEFAULT '',
  twitter_handle text DEFAULT '@alexrivera',
  favicon_url text DEFAULT '',
  gsc_verification text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: website_settings
CREATE TABLE IF NOT EXISTS website_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Alex Rivera',
  logo_url text DEFAULT '',
  accent_overrides jsonb DEFAULT '{}'::jsonb,
  maintenance_mode boolean NOT NULL DEFAULT false,
  custom_head_script text DEFAULT '',
  whatsapp_number text DEFAULT '',
  whatsapp_enabled boolean NOT NULL DEFAULT false,
  map_location text DEFAULT 'San Francisco, CA',
  map_embed_url text DEFAULT '',
  footer_bio text DEFAULT 'Full-stack software engineer specializing in performant web applications, design systems, and developer experience.',
  footer_copyright text DEFAULT 'Designed & built by Alex Rivera',
  footer_tagline text DEFAULT 'Built with care and way too much coffee',
  newsletter_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: navigation_items
CREATE TABLE IF NOT EXISTS navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT '',
  target text NOT NULL DEFAULT '',
  is_visible boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  location text NOT NULL DEFAULT 'navbar',
  created_at timestamptz DEFAULT now()
);

-- Table: faqs
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL DEFAULT '',
  answer text NOT NULL DEFAULT '',
  category text DEFAULT 'General',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: gallery_items
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL DEFAULT '',
  caption text DEFAULT '',
  tags text[] DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  issuer text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '',
  description text DEFAULT '',
  image_url text DEFAULT '',
  verify_url text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table: newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE DEFAULT '',
  source_page text DEFAULT 'footer',
  subscribed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: page_views
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL DEFAULT '',
  referrer text DEFAULT '',
  device text DEFAULT '',
  browser text DEFAULT '',
  country text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Table: resume_versions
CREATE TABLE IF NOT EXISTS resume_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL DEFAULT '',
  filename text NOT NULL DEFAULT '',
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- SECTION 2: ROW LEVEL SECURITY
-- ============================================================

-- RLS for: profile
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_profile" ON profile;
CREATE POLICY "public_read_profile" ON profile FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_profile" ON profile;
CREATE POLICY "auth_insert_profile" ON profile FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_profile" ON profile;
CREATE POLICY "auth_update_profile" ON profile FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_profile" ON profile;
CREATE POLICY "auth_delete_profile" ON profile FOR DELETE TO authenticated USING (true);

-- RLS for: hero_content
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_hero_content" ON hero_content;
CREATE POLICY "public_read_hero_content" ON hero_content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_hero_content" ON hero_content;
CREATE POLICY "auth_insert_hero_content" ON hero_content FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_hero_content" ON hero_content;
CREATE POLICY "auth_update_hero_content" ON hero_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_hero_content" ON hero_content;
CREATE POLICY "auth_delete_hero_content" ON hero_content FOR DELETE TO authenticated USING (true);

-- RLS for: hero_videos
ALTER TABLE hero_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_hero_videos" ON hero_videos;
CREATE POLICY "public_read_hero_videos" ON hero_videos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_hero_videos" ON hero_videos;
CREATE POLICY "auth_insert_hero_videos" ON hero_videos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_hero_videos" ON hero_videos;
CREATE POLICY "auth_update_hero_videos" ON hero_videos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_hero_videos" ON hero_videos;
CREATE POLICY "auth_delete_hero_videos" ON hero_videos FOR DELETE TO authenticated USING (true);

-- RLS for: hero_images
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_hero_images" ON hero_images;
CREATE POLICY "public_read_hero_images" ON hero_images FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_hero_images" ON hero_images;
CREATE POLICY "auth_insert_hero_images" ON hero_images FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_hero_images" ON hero_images;
CREATE POLICY "auth_update_hero_images" ON hero_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_hero_images" ON hero_images;
CREATE POLICY "auth_delete_hero_images" ON hero_images FOR DELETE TO authenticated USING (true);

-- RLS for: technologies
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_technologies" ON technologies;
CREATE POLICY "public_read_technologies" ON technologies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_technologies" ON technologies;
CREATE POLICY "auth_insert_technologies" ON technologies FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_technologies" ON technologies;
CREATE POLICY "auth_update_technologies" ON technologies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_technologies" ON technologies;
CREATE POLICY "auth_delete_technologies" ON technologies FOR DELETE TO authenticated USING (true);

-- RLS for: project_categories
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_project_categories" ON project_categories;
CREATE POLICY "public_read_project_categories" ON project_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_project_categories" ON project_categories;
CREATE POLICY "auth_insert_project_categories" ON project_categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_project_categories" ON project_categories;
CREATE POLICY "auth_update_project_categories" ON project_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_project_categories" ON project_categories;
CREATE POLICY "auth_delete_project_categories" ON project_categories FOR DELETE TO authenticated USING (true);

-- RLS for: projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_projects" ON projects;
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE TO authenticated USING (true);

-- RLS for: project_technologies
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_project_technologies" ON project_technologies;
CREATE POLICY "public_read_project_technologies" ON project_technologies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_project_technologies" ON project_technologies;
CREATE POLICY "auth_insert_project_technologies" ON project_technologies FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_project_technologies" ON project_technologies;
CREATE POLICY "auth_update_project_technologies" ON project_technologies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_project_technologies" ON project_technologies;
CREATE POLICY "auth_delete_project_technologies" ON project_technologies FOR DELETE TO authenticated USING (true);

-- RLS for: blog_categories
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_categories" ON blog_categories;
CREATE POLICY "public_read_blog_categories" ON blog_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_blog_categories" ON blog_categories;
CREATE POLICY "auth_insert_blog_categories" ON blog_categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_blog_categories" ON blog_categories;
CREATE POLICY "auth_update_blog_categories" ON blog_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_blog_categories" ON blog_categories;
CREATE POLICY "auth_delete_blog_categories" ON blog_categories FOR DELETE TO authenticated USING (true);

-- RLS for: blog_tags
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_tags" ON blog_tags;
CREATE POLICY "public_read_blog_tags" ON blog_tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_blog_tags" ON blog_tags;
CREATE POLICY "auth_insert_blog_tags" ON blog_tags FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_blog_tags" ON blog_tags;
CREATE POLICY "auth_update_blog_tags" ON blog_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_blog_tags" ON blog_tags;
CREATE POLICY "auth_delete_blog_tags" ON blog_tags FOR DELETE TO authenticated USING (true);

-- RLS for: blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_posts" ON blog_posts;
CREATE POLICY "public_read_blog_posts" ON blog_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_blog_posts" ON blog_posts;
CREATE POLICY "auth_insert_blog_posts" ON blog_posts FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_blog_posts" ON blog_posts;
CREATE POLICY "auth_update_blog_posts" ON blog_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_blog_posts" ON blog_posts;
CREATE POLICY "auth_delete_blog_posts" ON blog_posts FOR DELETE TO authenticated USING (true);

-- RLS for: blog_post_tags
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_post_tags" ON blog_post_tags;
CREATE POLICY "public_read_blog_post_tags" ON blog_post_tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_blog_post_tags" ON blog_post_tags;
CREATE POLICY "auth_insert_blog_post_tags" ON blog_post_tags FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_blog_post_tags" ON blog_post_tags;
CREATE POLICY "auth_update_blog_post_tags" ON blog_post_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_blog_post_tags" ON blog_post_tags;
CREATE POLICY "auth_delete_blog_post_tags" ON blog_post_tags FOR DELETE TO authenticated USING (true);

-- RLS for: blog_comments
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_comments" ON blog_comments;
CREATE POLICY "public_read_blog_comments" ON blog_comments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_blog_comments" ON blog_comments;
CREATE POLICY "public_insert_blog_comments" ON blog_comments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_blog_comments" ON blog_comments;
CREATE POLICY "auth_update_blog_comments" ON blog_comments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_blog_comments" ON blog_comments;
CREATE POLICY "auth_delete_blog_comments" ON blog_comments FOR DELETE TO authenticated USING (true);

-- RLS for: skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_skills" ON skills;
CREATE POLICY "public_read_skills" ON skills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_skills" ON skills;
CREATE POLICY "auth_insert_skills" ON skills FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_skills" ON skills;
CREATE POLICY "auth_update_skills" ON skills FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_skills" ON skills;
CREATE POLICY "auth_delete_skills" ON skills FOR DELETE TO authenticated USING (true);

-- RLS for: experience
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_experience" ON experience;
CREATE POLICY "public_read_experience" ON experience FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_experience" ON experience;
CREATE POLICY "auth_insert_experience" ON experience FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_experience" ON experience;
CREATE POLICY "auth_update_experience" ON experience FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_experience" ON experience;
CREATE POLICY "auth_delete_experience" ON experience FOR DELETE TO authenticated USING (true);

-- RLS for: education
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_education" ON education;
CREATE POLICY "public_read_education" ON education FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_education" ON education;
CREATE POLICY "auth_insert_education" ON education FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_education" ON education;
CREATE POLICY "auth_update_education" ON education FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_education" ON education;
CREATE POLICY "auth_delete_education" ON education FOR DELETE TO authenticated USING (true);

-- RLS for: certifications
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_certifications" ON certifications;
CREATE POLICY "public_read_certifications" ON certifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_certifications" ON certifications;
CREATE POLICY "auth_insert_certifications" ON certifications FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_certifications" ON certifications;
CREATE POLICY "auth_update_certifications" ON certifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_certifications" ON certifications;
CREATE POLICY "auth_delete_certifications" ON certifications FOR DELETE TO authenticated USING (true);

-- RLS for: services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_services" ON services;
CREATE POLICY "auth_insert_services" ON services FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_services" ON services;
CREATE POLICY "auth_update_services" ON services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_services" ON services;
CREATE POLICY "auth_delete_services" ON services FOR DELETE TO authenticated USING (true);

-- RLS for: testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_testimonials" ON testimonials;
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_testimonials" ON testimonials;
CREATE POLICY "auth_insert_testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_testimonials" ON testimonials;
CREATE POLICY "auth_update_testimonials" ON testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_testimonials" ON testimonials;
CREATE POLICY "auth_delete_testimonials" ON testimonials FOR DELETE TO authenticated USING (true);

-- RLS for: contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_contact_messages" ON contact_messages;
CREATE POLICY "public_insert_contact_messages" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_contact_messages" ON contact_messages;
CREATE POLICY "auth_read_contact_messages" ON contact_messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_contact_messages" ON contact_messages;
CREATE POLICY "auth_update_contact_messages" ON contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_contact_messages" ON contact_messages;
CREATE POLICY "auth_delete_contact_messages" ON contact_messages FOR DELETE TO authenticated USING (true);

-- RLS for: social_links
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_social_links" ON social_links;
CREATE POLICY "public_read_social_links" ON social_links FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_social_links" ON social_links;
CREATE POLICY "auth_insert_social_links" ON social_links FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_social_links" ON social_links;
CREATE POLICY "auth_update_social_links" ON social_links FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_social_links" ON social_links;
CREATE POLICY "auth_delete_social_links" ON social_links FOR DELETE TO authenticated USING (true);

-- RLS for: seo_settings
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_seo_settings" ON seo_settings;
CREATE POLICY "public_read_seo_settings" ON seo_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_seo_settings" ON seo_settings;
CREATE POLICY "auth_insert_seo_settings" ON seo_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_seo_settings" ON seo_settings;
CREATE POLICY "auth_update_seo_settings" ON seo_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_seo_settings" ON seo_settings;
CREATE POLICY "auth_delete_seo_settings" ON seo_settings FOR DELETE TO authenticated USING (true);

-- RLS for: website_settings
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_website_settings" ON website_settings;
CREATE POLICY "public_read_website_settings" ON website_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_website_settings" ON website_settings;
CREATE POLICY "auth_insert_website_settings" ON website_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_website_settings" ON website_settings;
CREATE POLICY "auth_update_website_settings" ON website_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_website_settings" ON website_settings;
CREATE POLICY "auth_delete_website_settings" ON website_settings FOR DELETE TO authenticated USING (true);

-- RLS for: navigation_items
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_navigation_items" ON navigation_items;
CREATE POLICY "public_read_navigation_items" ON navigation_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_navigation_items" ON navigation_items;
CREATE POLICY "auth_insert_navigation_items" ON navigation_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_navigation_items" ON navigation_items;
CREATE POLICY "auth_update_navigation_items" ON navigation_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_navigation_items" ON navigation_items;
CREATE POLICY "auth_delete_navigation_items" ON navigation_items FOR DELETE TO authenticated USING (true);

-- RLS for: faqs
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_faqs" ON faqs;
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_faqs" ON faqs;
CREATE POLICY "auth_insert_faqs" ON faqs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_faqs" ON faqs;
CREATE POLICY "auth_update_faqs" ON faqs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_faqs" ON faqs;
CREATE POLICY "auth_delete_faqs" ON faqs FOR DELETE TO authenticated USING (true);

-- RLS for: gallery_items
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_gallery_items" ON gallery_items;
CREATE POLICY "public_read_gallery_items" ON gallery_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_gallery_items" ON gallery_items;
CREATE POLICY "auth_insert_gallery_items" ON gallery_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_gallery_items" ON gallery_items;
CREATE POLICY "auth_update_gallery_items" ON gallery_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_gallery_items" ON gallery_items;
CREATE POLICY "auth_delete_gallery_items" ON gallery_items FOR DELETE TO authenticated USING (true);

-- RLS for: achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_achievements" ON achievements;
CREATE POLICY "public_read_achievements" ON achievements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_achievements" ON achievements;
CREATE POLICY "auth_insert_achievements" ON achievements FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_achievements" ON achievements;
CREATE POLICY "auth_update_achievements" ON achievements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_achievements" ON achievements;
CREATE POLICY "auth_delete_achievements" ON achievements FOR DELETE TO authenticated USING (true);

-- RLS for: newsletter_subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "public_insert_newsletter_subscribers" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "auth_read_newsletter_subscribers" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "auth_update_newsletter_subscribers" ON newsletter_subscribers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "auth_delete_newsletter_subscribers" ON newsletter_subscribers FOR DELETE TO authenticated USING (true);

-- RLS for: page_views
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_page_views" ON page_views;
CREATE POLICY "public_insert_page_views" ON page_views FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_page_views" ON page_views;
CREATE POLICY "auth_read_page_views" ON page_views FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_delete_page_views" ON page_views;
CREATE POLICY "auth_delete_page_views" ON page_views FOR DELETE TO authenticated USING (true);

-- RLS for: resume_versions
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_resume_versions" ON resume_versions;
CREATE POLICY "public_read_resume_versions" ON resume_versions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_resume_versions" ON resume_versions;
CREATE POLICY "auth_insert_resume_versions" ON resume_versions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_resume_versions" ON resume_versions;
CREATE POLICY "auth_update_resume_versions" ON resume_versions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_resume_versions" ON resume_versions;
CREATE POLICY "auth_delete_resume_versions" ON resume_versions FOR DELETE TO authenticated USING (true);

-- ============================================================
-- SECTION 3: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects (is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts (published_at);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages (created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views (created_at);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills (category);
CREATE INDEX IF NOT EXISTS idx_technologies_category ON technologies (category);

-- ============================================================
-- SECTION 4: SEED DATA
-- ============================================================

-- Data for: profile
INSERT INTO profile (id, name, title, tagline, bio, email, phone, location, timezone, availability, resume_url, profile_picture_url, created_at, updated_at) VALUES ('a0000000-0000-0000-0000-000000000001', 'Alex Rivera', 'Full-Stack Software Engineer', 'Building delightful digital experiences', 'I''m a full-stack software engineer with 8+ years of experience building performant web applications, design systems, and developer tools. I specialize in React, TypeScript, Node.js, and cloud-native architecture. I care deeply about accessibility, performance budgets, and shipping software that feels effortless to use. When I''m not coding, you''ll find me contributing to open source, mentoring junior developers, or chasing the perfect cup of pour-over coffee.', 'alex@alexrivera.dev', '+1 (415) 555-0142', 'San Francisco, CA', 'America/Los_Angeles', true, NULL, 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400', '2026-07-14T09:31:41.622407+00:00', '2026-07-14T09:31:41.622407+00:00') ON CONFLICT DO NOTHING;

-- Data for: hero_content
INSERT INTO hero_content (id, kicker, headline, highlighted_word, subheadline, cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url, availability_status, availability_label, created_at, updated_at) VALUES ('a0000000-0000-0000-0000-000000000002', 'SOFTWARE ENGINEER · CREATIVE DEVELOPER', 'I build things for the web', 'the web', 'Full-stack engineer crafting performant, accessible, and beautiful digital products from concept to deployment. Currently building tools that make developers'' lives better.', 'View Projects', '/projects', 'Download Resume', '', true, 'Available for work', '2026-07-14T09:31:41.622407+00:00', '2026-07-14T09:31:41.622407+00:00') ON CONFLICT DO NOTHING;

-- Data for: hero_images
INSERT INTO hero_images (id, url, is_active, order_index, created_at) VALUES ('7c78508f-d0ad-47ac-ae9a-fccc10837708', 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1920', true, 0, '2026-07-14T09:31:41.622407+00:00') ON CONFLICT DO NOTHING;

-- Data for: project_categories
INSERT INTO project_categories (id, name, slug, color, created_at) VALUES ('c1439c88-dc10-4613-8a64-9704f2d2f407', 'Web Application', 'web-application', '#6366F1', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO project_categories (id, name, slug, color, created_at) VALUES ('5adc1963-3404-4909-ae2d-19285545975b', 'Open Source', 'open-source', '#8B5CF6', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO project_categories (id, name, slug, color, created_at) VALUES ('bc7f2dff-7c97-4224-b396-32ce473e3f2b', 'Mobile App', 'mobile-app', '#EC4899', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO project_categories (id, name, slug, color, created_at) VALUES ('38e8c4c3-18f7-4405-b2ae-6e9e133aeb7b', 'SaaS', 'saas', '#34D399', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO project_categories (id, name, slug, color, created_at) VALUES ('e0ffab10-ba28-42fb-9d07-3c5ff1c6d13a', 'Developer Tool', 'developer-tool', '#FBBF24', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;

-- Data for: technologies
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('2f147a9b-af28-420d-be7b-812dd2496291', 'React', NULL, 'Framework', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('de409f73-5c69-4721-8128-dfa5187e4069', 'TypeScript', NULL, 'Language', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('8e7359a1-cb22-4117-b6a9-e5c21c562c16', 'Next.js', NULL, 'Framework', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('c7737f6e-cacc-4c94-9fa0-b1cfa927c84c', 'Node.js', NULL, 'Framework', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('b3c5d1af-ccff-48e0-a074-eeaa9caae26e', 'PostgreSQL', NULL, 'Database', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('c52f3a38-6073-4858-8032-d2aef651ef30', 'Tailwind CSS', NULL, 'Framework', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('9d10a269-0d83-408f-ba1a-9e7d4562e70d', 'Framer Motion', NULL, 'Library', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('8c270af2-3fd0-43f1-b10f-84aee28c240c', 'Supabase', NULL, 'Backend', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('9efdf6f0-25d7-4b11-81f1-fccaa0534dfa', 'GraphQL', NULL, 'Framework', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('af53dc98-786a-4857-b76d-22730b678d62', 'Docker', NULL, 'DevOps', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('1b664f00-0adb-4c6d-b706-c076419c3f0e', 'AWS', NULL, 'Cloud', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('22a82db8-fb15-4c71-b4b7-7136f8bb7a26', 'Vercel', NULL, 'Cloud', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('fa2095e8-85b4-43c7-8226-252cc9d25e46', 'Python', NULL, 'Language', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('60c4969e-d9ed-47b4-b56a-6f9a85a01eb5', 'Go', NULL, 'Language', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('2f5fcdd3-42bb-4b2a-a036-059a56c8306f', 'Redis', NULL, 'Database', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('6b8a8d1f-d609-4a65-9e9a-900a798b878f', 'Prisma', NULL, 'Library', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('83916cd4-24f2-40b0-b278-7a3af2528502', 'Vite', NULL, 'Tool', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('880cea47-db7b-49f1-ab24-7645c90e1966', 'Jest', NULL, 'Tool', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('bb1f8ca7-5e90-4d35-b2ec-8405bf5cc3c0', 'Playwright', NULL, 'Tool', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO technologies (id, name, icon_url, category, created_at) VALUES ('143f09fb-7a4c-4087-9b03-a689c8a5f61b', 'Stripe', NULL, 'Library', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;

-- Data for: projects
INSERT INTO projects (id, title, slug, cover_image_url, gallery, demo_url, github_url, status, is_featured, difficulty, description, excerpt, video_demo_url, order_index, seo_title, seo_description, category_id, created_at, updated_at) VALUES ('a1dcc040-9c9f-4c3b-b407-fb5798838bc6', 'Nebula UI', 'nebula-ui', 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1200', '{}'::text[], 'https://nebula-ui.dev', 'https://github.com/alexrivera/nebula-ui', 'Live', true, 'Advanced', 'Nebula UI is a headless React component library built for design systems at scale. It provides fully accessible, themeable primitives — buttons, modals, data tables, comboboxes — with a token-based theming engine that supports light/dark modes out of the box. Every component ships with WAI-ARIA compliance, keyboard navigation, and a composable API that stays under 3KB gzipped per primitive. Used in production by 200+ teams.', 'A headless React component library for design systems at scale — accessible, themeable, and under 3KB per primitive.', '', 0, NULL, NULL, '5adc1963-3404-4909-ae2d-19285545975b', '2026-07-14T09:32:01.24191+00:00', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO projects (id, title, slug, cover_image_url, gallery, demo_url, github_url, status, is_featured, difficulty, description, excerpt, video_demo_url, order_index, seo_title, seo_description, category_id, created_at, updated_at) VALUES ('569a7536-3a30-4c37-a9b0-53947e7543aa', 'DevFlow CI', 'devflow-ci', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200', '{}'::text[], 'https://devflow-ci.com', 'https://github.com/alexrivera/devflow', 'Live', true, 'Advanced', 'DevFlow CI is a continuous integration platform built for monorepos. It features intelligent build caching, parallel test execution across isolated containers, and a real-time pipeline visualization dashboard. Built on a Go-based runner with a React/TypeScript dashboard, it reduces average CI times by 60% through dependency graph analysis and incremental build strategies.', 'A CI platform built for monorepos with intelligent caching and parallel test execution.', '', 1, NULL, NULL, 'e0ffab10-ba28-42fb-9d07-3c5ff1c6d13a', '2026-07-14T09:32:01.24191+00:00', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO projects (id, title, slug, cover_image_url, gallery, demo_url, github_url, status, is_featured, difficulty, description, excerpt, video_demo_url, order_index, seo_title, seo_description, category_id, created_at, updated_at) VALUES ('3bb87a3f-8c3e-4c8d-aca2-7697219f22fc', 'TaskZen', 'taskzen', 'https://images.pexels.com/photos/3754144/pexels-photo-3754144.jpeg?auto=compress&cs=tinysrgb&w=1200', '{}'::text[], 'https://taskzen.app', '', 'Live', false, 'Intermediate', 'TaskZen is a calm, focused task manager for individuals and small teams. It features natural language task entry ("remind me to call Sarah next Tuesday"), smart priority sorting, a weekly review flow, and a beautiful keyboard-first interface. Built with React Native for cross-platform support, with offline-first sync powered by a CRDT-based conflict resolution engine.', 'A calm, keyboard-first task manager with natural language entry and offline-first sync.', '', 2, NULL, NULL, 'c1439c88-dc10-4613-8a64-9704f2d2f407', '2026-07-14T09:32:01.24191+00:00', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO projects (id, title, slug, cover_image_url, gallery, demo_url, github_url, status, is_featured, difficulty, description, excerpt, video_demo_url, order_index, seo_title, seo_description, category_id, created_at, updated_at) VALUES ('4e860ef6-f45c-4b19-80ab-c0448631c73b', 'Pulse Analytics', 'pulse-analytics', 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1200', '{}'::text[], 'https://pulse-analytics.io', '', 'Live', false, 'Advanced', 'Pulse Analytics is a privacy-first, cookieless web analytics platform. It captures page views, referrers, and device metadata without invasive tracking or third-party cookies. Features a real-time visitor map, customizable dashboards, and a lightweight (<1KB) tracking script. Built with Go for the ingestion pipeline (handling 10k events/sec) and React/Recharts for the dashboard.', 'Privacy-first, cookieless web analytics with a real-time visitor map and <1KB tracking script.', '', 3, NULL, NULL, '38e8c4c3-18f7-4405-b2ae-6e9e133aeb7b', '2026-07-14T09:32:01.24191+00:00', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO projects (id, title, slug, cover_image_url, gallery, demo_url, github_url, status, is_featured, difficulty, description, excerpt, video_demo_url, order_index, seo_title, seo_description, category_id, created_at, updated_at) VALUES ('3414ea75-e42a-42cc-9ae7-3f28c9638c88', 'SnippetBox', 'snippetbox', 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1200', '{}'::text[], '', 'https://github.com/alexrivera/snippetbox', 'Live', false, 'Beginner', 'SnippetBox is a VS Code extension for syncing and sharing code snippets across machines and teams. It supports 40+ languages with syntax highlighting, snippet templates with tab stops, and a community-driven public snippet registry. 12k+ installs on the VS Code marketplace.', 'A VS Code extension for syncing and sharing code snippets with 40+ language support.', '', 4, NULL, NULL, '5adc1963-3404-4909-ae2d-19285545975b', '2026-07-14T09:32:01.24191+00:00', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;
INSERT INTO projects (id, title, slug, cover_image_url, gallery, demo_url, github_url, status, is_featured, difficulty, description, excerpt, video_demo_url, order_index, seo_title, seo_description, category_id, created_at, updated_at) VALUES ('6fb41409-3085-46a0-8986-429a051f7bf0', 'Orbit Chat', 'orbit-chat', 'https://images.pexels.com/photos/4146289/pexels-photo-4146289.jpeg?auto=compress&cs=tinysrgb&w=1200', '{}'::text[], '', '', 'In Progress', false, 'Advanced', 'Orbit Chat is an end-to-end encrypted team messaging app with self-hosting support. Features threaded conversations, rich markdown support, file sharing with automatic virus scanning, and a plugin system for custom integrations. Built with React, Elixir/Phoenix channels for real-time, and Postgres for message persistence.', 'End-to-end encrypted team messaging with self-hosting and a plugin system.', '', 5, NULL, NULL, 'c1439c88-dc10-4613-8a64-9704f2d2f407', '2026-07-14T09:32:01.24191+00:00', '2026-07-14T09:32:01.24191+00:00') ON CONFLICT DO NOTHING;

-- Data for: project_technologies
INSERT INTO project_technologies (project_id, technology_id) VALUES ('a1dcc040-9c9f-4c3b-b407-fb5798838bc6', '2f147a9b-af28-420d-be7b-812dd2496291') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('a1dcc040-9c9f-4c3b-b407-fb5798838bc6', 'de409f73-5c69-4721-8128-dfa5187e4069') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('a1dcc040-9c9f-4c3b-b407-fb5798838bc6', 'c52f3a38-6073-4858-8032-d2aef651ef30') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('a1dcc040-9c9f-4c3b-b407-fb5798838bc6', '83916cd4-24f2-40b0-b278-7a3af2528502') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('569a7536-3a30-4c37-a9b0-53947e7543aa', '60c4969e-d9ed-47b4-b56a-6f9a85a01eb5') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('569a7536-3a30-4c37-a9b0-53947e7543aa', '2f147a9b-af28-420d-be7b-812dd2496291') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('569a7536-3a30-4c37-a9b0-53947e7543aa', 'de409f73-5c69-4721-8128-dfa5187e4069') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('569a7536-3a30-4c37-a9b0-53947e7543aa', 'af53dc98-786a-4857-b76d-22730b678d62') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('3bb87a3f-8c3e-4c8d-aca2-7697219f22fc', '2f147a9b-af28-420d-be7b-812dd2496291') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('3bb87a3f-8c3e-4c8d-aca2-7697219f22fc', 'de409f73-5c69-4721-8128-dfa5187e4069') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('3bb87a3f-8c3e-4c8d-aca2-7697219f22fc', 'b3c5d1af-ccff-48e0-a074-eeaa9caae26e') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('3bb87a3f-8c3e-4c8d-aca2-7697219f22fc', '2f5fcdd3-42bb-4b2a-a036-059a56c8306f') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('4e860ef6-f45c-4b19-80ab-c0448631c73b', '60c4969e-d9ed-47b4-b56a-6f9a85a01eb5') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('4e860ef6-f45c-4b19-80ab-c0448631c73b', '2f147a9b-af28-420d-be7b-812dd2496291') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('4e860ef6-f45c-4b19-80ab-c0448631c73b', 'b3c5d1af-ccff-48e0-a074-eeaa9caae26e') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('4e860ef6-f45c-4b19-80ab-c0448631c73b', '1b664f00-0adb-4c6d-b706-c076419c3f0e') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('3414ea75-e42a-42cc-9ae7-3f28c9638c88', 'de409f73-5c69-4721-8128-dfa5187e4069') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('6fb41409-3085-46a0-8986-429a051f7bf0', '2f147a9b-af28-420d-be7b-812dd2496291') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('6fb41409-3085-46a0-8986-429a051f7bf0', 'b3c5d1af-ccff-48e0-a074-eeaa9caae26e') ON CONFLICT DO NOTHING;
INSERT INTO project_technologies (project_id, technology_id) VALUES ('6fb41409-3085-46a0-8986-429a051f7bf0', 'af53dc98-786a-4857-b76d-22730b678d62') ON CONFLICT DO NOTHING;

-- Data for: blog_categories
INSERT INTO blog_categories (id, name, slug, color, created_at) VALUES ('5fb1295e-bac0-4c6d-bdd3-4c7f31fdef3a', 'Engineering', 'engineering', '#6366F1', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_categories (id, name, slug, color, created_at) VALUES ('b398738a-0f4c-4feb-8963-578f660468b4', 'Career', 'career', '#34D399', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_categories (id, name, slug, color, created_at) VALUES ('dc3a0d3e-e624-43fa-bf21-303e67a27565', 'Tutorials', 'tutorials', '#FBBF24', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_categories (id, name, slug, color, created_at) VALUES ('aa37bb26-c021-446b-8a71-f69fe5a59e5b', 'Thoughts', 'thoughts', '#EC4899', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;

-- Data for: blog_tags
INSERT INTO blog_tags (id, name, slug, created_at) VALUES ('e0cb2726-2b98-4415-8fa5-4b101fba820d', 'React', 'react', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_tags (id, name, slug, created_at) VALUES ('78586c1c-8fa2-4efe-8275-46e87fda8ceb', 'TypeScript', 'typescript', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_tags (id, name, slug, created_at) VALUES ('4209e162-df0e-46fc-8944-89bfa5a84527', 'Performance', 'performance', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_tags (id, name, slug, created_at) VALUES ('09a85bb3-dff9-481f-9e30-7af69815c2f1', 'Accessibility', 'accessibility', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_tags (id, name, slug, created_at) VALUES ('41547b73-eb6a-40bb-b254-2ceae108a020', 'Architecture', 'architecture', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_tags (id, name, slug, created_at) VALUES ('05753646-b210-4031-9422-031273188858', 'Testing', 'testing', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_tags (id, name, slug, created_at) VALUES ('2752b6ee-5cca-4fc7-8b7a-43abe40ba131', 'Career', 'career', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_tags (id, name, slug, created_at) VALUES ('bc452b14-01af-476b-ac9a-a34e9fae1a35', 'DX', 'dx', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;

-- Data for: blog_posts
INSERT INTO blog_posts (id, title, slug, cover_image_url, content, excerpt, status, published_at, reading_time, is_featured, seo_title, seo_description, og_image_url, category_id, created_at, updated_at) VALUES ('e26bb602-2c43-4cd4-b883-3042bad2abfd', 'Building a Token-Based Design System That Scales', 'token-based-design-system', 'https://images.pexels.com/photos/325111/pexels-photo-325111.jpeg?auto=compress&cs=tinysrgb&w=1200', '# Building a Token-Based Design System That Scales

When I started building Nebula UI, I thought design tokens were just CSS variables with a fancy name. Two years and 200+ teams later, I''ve learned that a well-architected token pipeline is the difference between a design system that scales and one that collapses under its own weight.

## What Are Design Tokens?

Design tokens are the atomic units of a design system — colors, spacing, typography, shadows, radii — stored in a platform-agnostic format (usually JSON) and transformed into platform-specific outputs (CSS, Swift, Kotlin, Figma).

## The Three-Layer Token Architecture

The key insight is separating tokens into three layers:

1. **Global tokens** — the raw values (`blue-500: #3B82F6`)
2. **Semantic tokens** — the meaning (`button-primary-bg: $blue-500`)
3. **Component tokens** — the component-level mapping (`Button.background: $button-primary-bg`)

This separation means you can rebrand an entire application by changing semantic tokens without touching a single component.

## The Pipeline

```
tokens.json → Style Dictionary → CSS variables + Tailwind config + TypeScript types
```

Every time a designer updates a token in Figma, the pipeline runs in CI, generates the outputs, and opens a PR. The PR includes a visual diff from Chromatic so reviewers can see exactly what changed.

## Lessons Learned

- **Start with semantic tokens on day one.** Retrofitting them later is painful.
- **Version your tokens.** Breaking changes to tokens should follow semver.
- **Document the naming convention.** `category-property-scale` works well.
- **Automate everything.** Manual token sync is where design systems go to die.', 'How a three-layer token architecture and an automated CI pipeline keep a design system healthy at scale.', 'Published', '2024-01-15T00:00:00+00:00', 7, true, NULL, NULL, NULL, '5fb1295e-bac0-4c6d-bdd3-4c7f31fdef3a', '2026-07-14T09:33:00.018568+00:00', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_posts (id, title, slug, cover_image_url, content, excerpt, status, published_at, reading_time, is_featured, seo_title, seo_description, og_image_url, category_id, created_at, updated_at) VALUES ('30235931-14cf-487d-a64b-8858758b4bba', 'Why I Stopped Using Redux (And What I Use Instead)', 'goodbye-redux', 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200', '# Why I Stopped Using Redux (And What I Use Instead)

I used Redux for five years. I wrote the boilerplate, the reducers, the action creators, the thunks, the sagas. I taught it to junior developers and watched their eyes glaze over.

Then I tried React Query (now TanStack Query) and I''m not going back.

## The Problem with Redux

Redux isn''t bad — it''s just solving a problem most apps don''t have: complex client-side state synchronization. Most apps need to fetch data from a server, display it, and occasionally update it. Redux makes this harder than it needs to be.

## The React Query Approach

React Query handles server state — caching, invalidation, refetching, optimistic updates — out of the box. You write a `useQuery` hook and get:

- Automatic caching with stale-while-revalidate
- Background refetching on window focus
- Optimistic updates with rollback on error
- Request deduplication

## What About Client State?

For the small amount of true client state (UI state, form state, theme), React Context + `useState` is usually enough. If you need more, Zustand is a 1KB alternative that doesn''t require a PhD in boilerplate.

## The Result

When I migrated the Airbnb host dashboard from Redux to React Query, the bundle dropped by 60KB and the code became significantly easier to reason about. New engineers could trace a data flow in minutes instead of hours.', 'Server state vs. client state, and why separating them changed how I build React apps.', 'Published', '2024-02-20T00:00:00+00:00', 6, false, NULL, NULL, NULL, '5fb1295e-bac0-4c6d-bdd3-4c7f31fdef3a', '2026-07-14T09:33:00.018568+00:00', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_posts (id, title, slug, cover_image_url, content, excerpt, status, published_at, reading_time, is_featured, seo_title, seo_description, og_image_url, category_id, created_at, updated_at) VALUES ('256b66fa-f848-41d7-bfb2-8b6c530b1e4f', 'The Senior Engineer''s Guide to Code Reviews', 'senior-engineer-code-reviews', 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1200', '# The Senior Engineer''s Guide to Code Reviews

Code reviews are the highest-bandwidth communication tool in a software team. A good code review teaches, catches bugs, and aligns the team. A bad one breeds resentment and slows everything down.

## The Three Gates

Every review should pass through three gates:

1. **Correctness** — Does the code do what it claims?
2. **Clarity** — Will someone understand this in six months?
3. **Consequences** — What happens when this breaks?

## What to Comment On

- Logic errors and edge cases
- Missing tests for critical paths
- Naming that doesn''t reveal intent
- Security vulnerabilities
- Performance regressions

## What NOT to Comment On

- Style preferences (that''s what linters are for)
- Personal opinions on syntax
- Things that "could" be done differently without a concrete reason

## The Kindness Rule

Every code review comment should pass the "would I say this in person" test. If not, rewrite it. Tone matters more than you think — a dismissive comment can make a junior developer afraid to open a PR for weeks.

## The 24-Hour Rule

If a review thread goes back and forth more than three times, stop. Schedule a 15-minute call. Text is low-bandwidth communication for high-bandwidth problems.', 'Practical, opinionated advice on making code reviews teach, catch bugs, and build team trust.', 'Published', '2024-03-10T00:00:00+00:00', 5, true, NULL, NULL, NULL, 'b398738a-0f4c-4feb-8963-578f660468b4', '2026-07-14T09:33:00.018568+00:00', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_posts (id, title, slug, cover_image_url, content, excerpt, status, published_at, reading_time, is_featured, seo_title, seo_description, og_image_url, category_id, created_at, updated_at) VALUES ('de33ab3b-48cc-43a7-8f5e-7e502f026847', 'Accessible by Default: A Practical Guide to WCAG 2.1', 'accessible-by-default', 'https://images.pexels.com/photos/1181371/pexels-photo-1181371.jpeg?auto=compress&cs=tinysrgb&w=1200', '# Accessible by Default: A Practical Guide to WCAG 2.1

Accessibility is not a feature. It''s not a "phase 2" task. It''s the baseline.

## The Business Case

- 15% of the world''s population has a disability
- Accessible sites rank higher in search results
- Accessibility overlaps with performance and usability for everyone

## The Five Things Every Page Needs

1. **Semantic HTML** — Use `<button>` for buttons, not `<div onClick>`. Screen readers rely on semantics.
2. **Keyboard navigation** — Every interactive element must be reachable with Tab and operable with Enter/Space.
3. **Color contrast** — 4.5:1 for normal text, 3:1 for large text. Use a contrast checker.
4. **Alt text** — Every `<img>` needs descriptive alt text. Decorative images get `alt=""`.
5. **ARIA labels** — Use them when semantic HTML isn''t enough. Don''t overuse them.

## Testing Your Accessibility

- Run axe DevTools in your browser
- Navigate your site with only a keyboard
- Test with a screen reader (VoiceOver on Mac, NVDA on Windows)
- Use `@testing-library/jest-dom` for assertion-level accessibility checks

## The Component Checklist

Every component in my library passes this checklist before it ships:

- [ ] Keyboard accessible
- [ ] Screen reader announces purpose
- [ ] Focus visible
- [ ] Color contrast meets WCAG AA
- [ ] No motion without `prefers-reduced-motion` fallback', 'Five things every page needs, a testing checklist, and a component-level accessibility checklist.', 'Published', '2024-04-05T00:00:00+00:00', 6, false, NULL, NULL, NULL, 'dc3a0d3e-e624-43fa-bf21-303e67a27565', '2026-07-14T09:33:00.018568+00:00', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO blog_posts (id, title, slug, cover_image_url, content, excerpt, status, published_at, reading_time, is_featured, seo_title, seo_description, og_image_url, category_id, created_at, updated_at) VALUES ('1b5c86b9-dba0-45e9-9a48-6df7a7860867', 'From Junior to Senior: What Actually Matters', 'junior-to-senior', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200', '# From Junior to Senior: What Actually Matters

The gap between junior and senior engineer isn''t about years or syntax. It''s about three things: scope, judgment, and leverage.

## Scope

Junior engineers solve well-defined problems. Senior engineers define the problem.

When you become senior, your job shifts from "implement this feature" to "figure out what feature to implement and why." This means talking to users, reading metrics, and saying no to ideas that sound good but solve the wrong problem.

## Judgment

Junior engineers optimize for the code. Senior engineers optimize for the system.

This means choosing boring technology when it''s the right call. It means not rewriting the codebase in the hot new framework. It means leaving things alone when they''re working, even if they''re ugly.

## Leverage

Junior engineers write code. Senior engineers make other engineers better.

The highest-leverage thing a senior engineer can do is not write code — it''s to improve the system around the code. That means better tooling, clearer documentation, and mentoring that compounds across the team.

## The Timeline

There''s no fixed timeline. I''ve seen engineers reach senior in three years and others take ten. The variable isn''t time — it''s whether you''re actively practicing scope, judgment, and leverage, or just writing code and hoping seniority arrives by default.', 'The gap isn''t years or syntax — it''s scope, judgment, and leverage.', 'Published', '2024-05-12T00:00:00+00:00', 5, false, NULL, NULL, NULL, 'b398738a-0f4c-4feb-8963-578f660468b4', '2026-07-14T09:33:00.018568+00:00', '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;

-- Data for: blog_post_tags
INSERT INTO blog_post_tags (post_id, tag_id) VALUES ('e26bb602-2c43-4cd4-b883-3042bad2abfd', '41547b73-eb6a-40bb-b254-2ceae108a020') ON CONFLICT DO NOTHING;
INSERT INTO blog_post_tags (post_id, tag_id) VALUES ('e26bb602-2c43-4cd4-b883-3042bad2abfd', 'bc452b14-01af-476b-ac9a-a34e9fae1a35') ON CONFLICT DO NOTHING;
INSERT INTO blog_post_tags (post_id, tag_id) VALUES ('30235931-14cf-487d-a64b-8858758b4bba', 'e0cb2726-2b98-4415-8fa5-4b101fba820d') ON CONFLICT DO NOTHING;
INSERT INTO blog_post_tags (post_id, tag_id) VALUES ('30235931-14cf-487d-a64b-8858758b4bba', '4209e162-df0e-46fc-8944-89bfa5a84527') ON CONFLICT DO NOTHING;
INSERT INTO blog_post_tags (post_id, tag_id) VALUES ('256b66fa-f848-41d7-bfb2-8b6c530b1e4f', '2752b6ee-5cca-4fc7-8b7a-43abe40ba131') ON CONFLICT DO NOTHING;
INSERT INTO blog_post_tags (post_id, tag_id) VALUES ('256b66fa-f848-41d7-bfb2-8b6c530b1e4f', 'bc452b14-01af-476b-ac9a-a34e9fae1a35') ON CONFLICT DO NOTHING;
INSERT INTO blog_post_tags (post_id, tag_id) VALUES ('de33ab3b-48cc-43a7-8f5e-7e502f026847', '09a85bb3-dff9-481f-9e30-7af69815c2f1') ON CONFLICT DO NOTHING;
INSERT INTO blog_post_tags (post_id, tag_id) VALUES ('de33ab3b-48cc-43a7-8f5e-7e502f026847', '05753646-b210-4031-9422-031273188858') ON CONFLICT DO NOTHING;
INSERT INTO blog_post_tags (post_id, tag_id) VALUES ('1b5c86b9-dba0-45e9-9a48-6df7a7860867', '2752b6ee-5cca-4fc7-8b7a-43abe40ba131') ON CONFLICT DO NOTHING;
INSERT INTO blog_post_tags (post_id, tag_id) VALUES ('1b5c86b9-dba0-45e9-9a48-6df7a7860867', '41547b73-eb6a-40bb-b254-2ceae108a020') ON CONFLICT DO NOTHING;

-- Data for: skills
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('042e5f9d-c3fa-46ab-8839-47f013f18686', 'React', NULL, 'Frontend', 95, 0, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('711866cc-cae9-4f6b-a85f-c1357b6f6b38', 'TypeScript', NULL, 'Frontend', 92, 1, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('66a3a340-cea3-48a1-b0db-bcb379f85c6e', 'Next.js', NULL, 'Frontend', 90, 2, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('e3a3adf9-d85b-410f-bb0f-276dc5196d8c', 'Tailwind CSS', NULL, 'Frontend', 88, 3, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('94dbe8df-a627-4bb7-91a7-d9216675f782', 'Framer Motion', NULL, 'Frontend', 82, 4, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('b40c69ca-7836-4c94-8186-edcbe5ef9673', 'Node.js', NULL, 'Backend', 90, 5, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('670892bb-42fa-4ee0-86ee-526265d28223', 'Go', NULL, 'Backend', 78, 6, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('ddb2dafc-37d0-4d20-aa65-4f576616d617', 'Python', NULL, 'Backend', 80, 7, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('d3c09d23-4b23-4180-85dd-47cc36c92581', 'PostgreSQL', NULL, 'Database', 88, 8, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('7d1cd481-6594-4b8d-8f74-f2d3d3b0815d', 'Redis', NULL, 'Database', 75, 9, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('eec76cd2-f29f-4acf-b7cd-59a9aeeaf5e4', 'GraphQL', NULL, 'Backend', 82, 10, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('8b6b45f3-9efb-46e1-a5f4-ad80a4222cb3', 'Docker', NULL, 'DevOps', 80, 11, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('26831569-3e3f-4c68-bf86-034bec1265e4', 'AWS', NULL, 'DevOps', 78, 12, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('3ab6b681-ace1-4326-9141-ee420c297c11', 'Vercel', NULL, 'DevOps', 85, 13, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('3616eafb-c7fa-4fcb-bc1f-20a99c6aa226', 'Git', NULL, 'Tools', 92, 14, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('778094de-54bf-48ea-8e72-8378f5433cc7', 'Jest', NULL, 'Tools', 85, 15, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO skills (id, name, icon_url, category, proficiency, order_index, created_at) VALUES ('1f29d8fc-348b-4b13-9eb0-972a6ccc7b2b', 'Playwright', NULL, 'Tools', 80, 16, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;

-- Data for: experience
INSERT INTO experience (id, company, role, location, start_date, end_date, is_current, description, logo_url, order_index, created_at) VALUES ('a27f7881-4905-4e96-8b07-b5d4a8e008cd', 'Stripe', 'Senior Software Engineer', 'San Francisco, CA', '2022', '', true, 'Leading the design systems team building Stripe''s internal component library used across 50+ product surfaces. Drove a 40% reduction in UI bug reports by introducing visual regression testing and a token-based theming pipeline. Mentor 4 engineers.', NULL, 0, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO experience (id, company, role, location, start_date, end_date, is_current, description, logo_url, order_index, created_at) VALUES ('4c89fd10-1ae6-4599-978c-fea7c4195683', 'Vercel', 'Software Engineer', 'Remote', '2020', '2022', false, 'Built core features for the Vercel dashboard including deployment analytics, log streaming, and project settings. Migrated the dashboard from Pages Router to App Router, improving LCP by 1.2s. Contributed to Next.js documentation.', NULL, 1, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO experience (id, company, role, location, start_date, end_date, is_current, description, logo_url, order_index, created_at) VALUES ('dd2b2024-c7ae-46a8-81e1-5f6138f11596', 'Airbnb', 'Frontend Engineer', 'San Francisco, CA', '2018', '2020', false, 'Worked on the host dashboard team, building data visualization components for earnings and booking metrics. Introduced React Query for server state management, replacing a custom Redux-based solution and cutting bundle size by 60KB.', NULL, 2, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO experience (id, company, role, location, start_date, end_date, is_current, description, logo_url, order_index, created_at) VALUES ('52349ce8-1f67-4dd2-9682-5cbb244b5aec', 'StartupLab', 'Junior Developer', 'Austin, TX', '2016', '2018', false, 'Full-stack development on client projects spanning e-commerce, healthcare, and education. Shipped 15+ production features. Learned the importance of CI/CD, code reviews, and writing tests that survive refactoring.', NULL, 3, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;

-- Data for: education
INSERT INTO education (id, institution, degree, field, start_date, end_date, logo_url, order_index, created_at) VALUES ('4c17b628-f7bd-4a7e-bc32-f6e49c21639c', 'UC Berkeley', 'B.S. Computer Science', 'Computer Science', '2012', '2016', NULL, 0, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;

-- Data for: certifications
INSERT INTO certifications (id, title, issuer, issue_date, expiry_date, credential_id, verify_url, badge_url, order_index, created_at) VALUES ('e4d699cc-f3ea-40de-95f0-0c516371c320', 'AWS Solutions Architect - Associate', 'Amazon Web Services', '2023', NULL, 'AWS-SAA-2023-9182', 'https://www.credly.com/badges/aws-saa', NULL, 0, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO certifications (id, title, issuer, issue_date, expiry_date, credential_id, verify_url, badge_url, order_index, created_at) VALUES ('5b9bc4b1-1351-402e-876e-dc0d064d1932', 'Google Cloud Professional Developer', 'Google Cloud', '2022', NULL, 'GCP-DEV-2022-4471', 'https://www.credential.net/gcp-dev', NULL, 1, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO certifications (id, title, issuer, issue_date, expiry_date, credential_id, verify_url, badge_url, order_index, created_at) VALUES ('5d7867e2-36fb-4101-97c6-73a6fe78724e', 'Certified Kubernetes Application Developer', 'CNCF', '2021', NULL, 'CKAD-2021-3390', 'https://training.linuxfoundation.org/ckad', NULL, 2, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;

-- Data for: services
INSERT INTO services (id, title, icon, description, included_items, order_index, created_at) VALUES ('71e83a9c-d00e-48ed-9f3e-1f125e75e76b', 'Web Application Development', 'Code', 'End-to-end web application development from concept to deployment. I handle architecture, frontend, backend, and DevOps.', ARRAY['Architecture & technical design', 'Responsive UI with React/Next.js', 'REST/GraphQL API development', 'Database design & optimization', 'CI/CD pipeline setup', 'Performance auditing'], 0, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO services (id, title, icon, description, included_items, order_index, created_at) VALUES ('749c7316-d51b-40e0-8a34-596acf92a77c', 'Design System Engineering', 'Palette', 'Build a scalable, accessible design system tailored to your brand. Component libraries, token pipelines, and documentation.', ARRAY['Component library (50+ components)', 'Design token pipeline', 'Storybook documentation', 'Accessibility (WCAG 2.1 AA) audit', 'Dark mode implementation', 'Figma-to-code workflow'], 1, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO services (id, title, icon, description, included_items, order_index, created_at) VALUES ('00991939-69db-465a-b663-fa8699323fa1', 'Technical Consulting', 'Lightbulb', 'Strategic technical guidance for teams scaling their products. Architecture reviews, performance optimization, and team process improvement.', ARRAY['Architecture review & recommendations', 'Performance bottleneck analysis', 'Team workflow & CI/CD optimization', 'Technology stack evaluation', 'Hiring & interview process design', 'Monthly progress check-ins'], 2, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO services (id, title, icon, description, included_items, order_index, created_at) VALUES ('1a51a51e-96b1-4927-93f4-dbc69a9cd54b', 'Developer Tooling', 'Wrench', 'Custom developer tools, CLIs, VS Code extensions, and automation scripts to make your team more productive.', ARRAY['Custom CLI tools', 'VS Code extensions', 'Build automation scripts', 'Developer onboarding docs', 'Internal tooling dashboards', 'Code generation templates'], 3, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;

-- Data for: testimonials
INSERT INTO testimonials (id, name, role, company, avatar_url, rating, quote, is_featured, order_index, created_at) VALUES ('c85b8c62-59f4-4692-a0a2-4e7ee7cf116f', 'Sarah Chen', 'VP of Engineering', 'Stripe', 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=200', 5, 'Alex is the kind of engineer who makes the whole team better. The design system he built became the backbone of our product UI, and his attention to accessibility set a new standard for the entire org.', true, 0, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO testimonials (id, name, role, company, avatar_url, rating, quote, is_featured, order_index, created_at) VALUES ('3a60aaa5-fb32-4b7f-b4a9-c5d6d00a0b56', 'Marcus Johnson', 'CTO', 'Vercel', 'https://images.pexels.com/photos/3760613/pexels-photo-3760613.jpeg?auto=compress&cs=tinysrgb&w=200', 5, 'One of the most pragmatic engineers I''ve worked with. Alex shipped the deployment analytics feature in half the estimated time, and it became one of our most-used dashboard features overnight.', true, 1, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO testimonials (id, name, role, company, avatar_url, rating, quote, is_featured, order_index, created_at) VALUES ('afffa8cf-0cdf-4170-9508-b7f0e12294fd', 'Priya Patel', 'Product Manager', 'Airbnb', 'https://images.pexels.com/photos/3760254/pexels-photo-3760254.jpeg?auto=compress&cs=tinysrgb&w=200', 5, 'Alex has a rare ability to translate fuzzy product requirements into clean, well-tested code. The earnings visualizations he built are still used by hundreds of thousands of hosts every day.', false, 2, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO testimonials (id, name, role, company, avatar_url, rating, quote, is_featured, order_index, created_at) VALUES ('9c2529ec-aad3-45de-8dc7-e9679f052f0f', 'David Kim', 'Founder', 'TaskZen', 'https://images.pexels.com/photos/3760615/pexels-photo-3760615.jpeg?auto=compress&cs=tinysrgb&w=200', 5, 'Working with Alex was like adding a senior team member who already understood our vision. He built our entire offline sync engine in two weeks and it just worked.', true, 3, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;

-- Data for: social_links
INSERT INTO social_links (id, platform, url, is_visible, order_index, created_at) VALUES ('17f03255-ed93-471b-9b58-0b4e8f497dfc', 'GitHub', 'https://github.com/alexrivera', true, 0, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO social_links (id, platform, url, is_visible, order_index, created_at) VALUES ('0276ac92-94b5-4887-8dbc-b700b07f6507', 'LinkedIn', 'https://linkedin.com/in/alexrivera', true, 1, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO social_links (id, platform, url, is_visible, order_index, created_at) VALUES ('4f570d69-5132-45ec-bcb9-00be4d639991', 'Twitter', 'https://twitter.com/alexrivera', true, 2, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO social_links (id, platform, url, is_visible, order_index, created_at) VALUES ('f917f200-1416-4661-a13b-4b4e8442acee', 'Dev.to', 'https://dev.to/alexrivera', true, 3, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO social_links (id, platform, url, is_visible, order_index, created_at) VALUES ('8a2463f3-621e-4c25-b9de-f7dd021a7e52', 'Email', 'mailto:alex@alexrivera.dev', true, 4, '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;

-- Data for: seo_settings
INSERT INTO seo_settings (id, site_title_template, meta_description, og_image_url, twitter_handle, favicon_url, gsc_verification, created_at, updated_at) VALUES ('a0000000-0000-0000-0000-000000000004', '%s | Alex Rivera', 'Alex Rivera — Full-stack software engineer building performant, accessible, and beautiful digital products.', NULL, '@alexrivera', NULL, NULL, '2026-07-14T09:31:41.622407+00:00', '2026-07-14T09:31:41.622407+00:00') ON CONFLICT DO NOTHING;

-- Data for: website_settings
INSERT INTO website_settings (id, site_name, logo_url, accent_overrides, maintenance_mode, custom_head_script, whatsapp_number, whatsapp_enabled, map_location, map_embed_url, footer_bio, footer_copyright, footer_tagline, newsletter_enabled, created_at, updated_at) VALUES ('a0000000-0000-0000-0000-000000000003', 'Alex Rivera', NULL, '{}'::jsonb, false, NULL, '14155550142', true, 'San Francisco, CA', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.50763972968586!3d37.75767999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076aadff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000', 'Full-stack software engineer specializing in performant web applications, design systems, and developer experience.', 'Designed & built by Alex Rivera', 'Built with care and way too much coffee', true, '2026-07-14T09:31:41.622407+00:00', '2026-07-14T09:31:41.622407+00:00') ON CONFLICT DO NOTHING;

-- Data for: navigation_items
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('b29b4dd8-4f8c-41c4-9452-629d6cc6df70', 'Home', '/', true, 0, 'navbar', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('22c90dfb-be3a-47b5-9fac-41f27f9db0b6', 'About', '/about', true, 1, 'navbar', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('82d0ba6b-ff21-47fc-bcd7-af3194a58c6d', 'Projects', '/projects', true, 2, 'navbar', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('70dd9c1d-0ae2-44cb-929f-a653810943b6', 'Blog', '/blog', true, 3, 'navbar', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('efd47f14-b2ec-4440-9b96-38591391179d', 'Services', '/services', true, 4, 'navbar', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('f6e6bdf9-bc53-4dfe-833a-35bbe583e165', 'Contact', '/contact', true, 5, 'navbar', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('f06e8afd-8aa6-4b22-a424-f17e6117c69a', 'About', '/about', true, 0, 'footer', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('ae348889-51c5-432f-831d-2fc625d24aef', 'Projects', '/projects', true, 1, 'footer', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('ac46a089-e8cb-4143-98e7-0dcfe38c51a3', 'Blog', '/blog', true, 2, 'footer', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('81629864-03d3-4274-bfff-97505447dee2', 'Services', '/services', true, 3, 'footer', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;
INSERT INTO navigation_items (id, label, target, is_visible, order_index, location, created_at) VALUES ('5f5b8230-9e72-4dc5-b2a4-3fb80a9b6fc7', 'Contact', '/contact', true, 4, 'footer', '2026-07-14T09:32:22.136529+00:00') ON CONFLICT DO NOTHING;

-- Data for: faqs
INSERT INTO faqs (id, question, answer, category, order_index, created_at) VALUES ('78cb3fb0-f01c-4fcd-9511-39f4fc24679d', 'What''s your typical project timeline?', 'Most projects run 4-12 weeks depending on scope. A landing page takes 1-2 weeks, a full web application takes 6-12 weeks, and a design system takes 4-8 weeks. I provide a detailed timeline after our initial scoping call.', 'Services', 0, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO faqs (id, question, answer, category, order_index, created_at) VALUES ('7ccb8dc2-05cd-4508-a61f-99315925ffb0', 'Do you work with startups?', 'Absolutely. About 60% of my work is with early-stage startups. I''m comfortable with ambiguity, rapid iteration, and the constraints of a tight budget. I can also help with technical architecture decisions that set you up for scale.', 'Services', 1, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO faqs (id, question, answer, category, order_index, created_at) VALUES ('04a0a154-aafb-4574-8636-c027588b874e', 'What''s your tech stack preference?', 'I''m pragmatic about tools, but my default stack is React/Next.js + TypeScript + Tailwind + Supabase/PostgreSQL + Vercel. I choose boring technology that I know will work, not the flavor of the month.', 'Technical', 2, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO faqs (id, question, answer, category, order_index, created_at) VALUES ('1e4d40e2-b2ec-4727-8cbd-f9d43fe3839e', 'Do you offer ongoing maintenance?', 'Yes. I offer monthly retainer arrangements for ongoing maintenance, feature work, and performance monitoring. This is separate from the initial project engagement.', 'Services', 3, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO faqs (id, question, answer, category, order_index, created_at) VALUES ('6788677f-e5c4-414a-9506-748ab3fc2702', 'Can you work with my existing team?', 'Of course. I''ve integrated with teams of all sizes. I''m comfortable working in existing codebases, following established patterns, and mentoring team members during the engagement.', 'Services', 4, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO faqs (id, question, answer, category, order_index, created_at) VALUES ('64f6f667-49d6-4c98-858c-68d96435e663', 'What about accessibility?', 'Accessibility is non-negotiable in my work. Everything I build meets WCAG 2.1 AA standards, includes keyboard navigation, screen reader support, and respects prefers-reduced-motion. I can also audit your existing site for accessibility issues.', 'Technical', 5, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;

-- Data for: gallery_items
INSERT INTO gallery_items (id, image_url, caption, tags, order_index, created_at) VALUES ('74cef4e1-7532-45ff-92f7-4dbfea7f171d', 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800', 'Workspace setup', ARRAY['desk', 'setup'], 0, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO gallery_items (id, image_url, caption, tags, order_index, created_at) VALUES ('56a6afa4-deb8-4966-ba42-fd936329b4bc', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800', 'Late night coding', ARRAY['code', 'night'], 1, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO gallery_items (id, image_url, caption, tags, order_index, created_at) VALUES ('335e6b71-4957-4111-8ce0-df6c3a82cd9c', 'https://images.pexels.com/photos/3754144/pexels-photo-3754144.jpeg?auto=compress&cs=tinysrgb&w=800', 'Team whiteboarding', ARRAY['team', 'planning'], 2, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO gallery_items (id, image_url, caption, tags, order_index, created_at) VALUES ('d48b35bc-1278-4165-85bd-bb380946d0b3', 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800', 'Component library', ARRAY['design', 'ui'], 3, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO gallery_items (id, image_url, caption, tags, order_index, created_at) VALUES ('4e233edc-fbb3-4820-a3aa-ef76be42440b', 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800', 'Analytics dashboard', ARRAY['data', 'dashboard'], 4, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO gallery_items (id, image_url, caption, tags, order_index, created_at) VALUES ('db2a9795-cdf4-453f-a040-10bce01904f1', 'https://images.pexels.com/photos/4146289/pexels-photo-4146289.jpeg?auto=compress&cs=tinysrgb&w=800', 'Real-time chat', ARRAY['chat', 'realtime'], 5, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;

-- Data for: achievements
INSERT INTO achievements (id, title, issuer, date, description, image_url, verify_url, order_index, created_at) VALUES ('38515f6f-b0f4-4f52-a2cf-8521c01ab1e7', 'Top 1% GitHub Contributor', 'GitHub', '2023', 'Ranked in the top 1% of open source contributors by stars received across public repositories.', NULL, NULL, 0, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO achievements (id, title, issuer, date, description, image_url, verify_url, order_index, created_at) VALUES ('e8235494-52f6-4972-a98d-ebe9d744b40d', 'Speaker at React Summit', 'React Summit', '2023', 'Gave a talk on "Building Accessible Design Systems at Scale" to 2000+ attendees.', NULL, NULL, 1, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;
INSERT INTO achievements (id, title, issuer, date, description, image_url, verify_url, order_index, created_at) VALUES ('6c57ce96-9cc4-4014-a10f-2fedf597cd0d', 'Open Source Maintainer Grant', 'GitHub Sponsors', '2022', 'Received a grant for maintaining open source developer tooling used by 50k+ developers.', NULL, NULL, 2, '2026-07-14T09:33:00.018568+00:00') ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 5: ADMIN USER
-- ============================================================

-- Create admin user in auth.users
-- Email: admin@alexrivera.dev
-- Password: Admin123!
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, email_change_confirm_status
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@alexrivera.dev',
  crypt('Admin123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"role":"admin"}'::jsonb,
  false, 0
) ON CONFLICT DO NOTHING;
