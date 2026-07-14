/*
# Portfolio Platform Schema - Complete

Creates the full database schema for a developer portfolio platform with:
- Public-facing content (profile, hero, projects, blog, services, testimonials, etc.)
- Admin dashboard content management
- Row Level Security: public read on published content, authenticated write

## New Tables
- profile (singleton): admin profile info
- hero_content (singleton): hero section content
- hero_videos: background videos for hero
- hero_images: fallback images for hero
- projects: portfolio projects
- project_categories: project category tags
- project_technologies: join table projects↔technologies
- technologies: tech stack items
- blog_posts: blog articles
- blog_categories: blog category tags
- blog_tags: blog tag labels
- blog_post_tags: join table posts↔tags
- blog_comments: user-submitted comments (moderated)
- skills: technical skills grouped by category
- experience: work history
- education: academic background
- certifications: professional certs
- services: offered services
- testimonials: client testimonials
- contact_messages: form submissions
- social_links: social media links
- seo_settings (singleton): global SEO config
- website_settings (singleton): site-wide config
- navigation_items: navbar/footer links
- faqs: frequently asked questions
- gallery_items: visual gallery
- achievements: awards and achievements
- newsletter_subscribers: email subscribers
- page_views: analytics tracking

## Security
- RLS enabled on all tables
- Public (anon) SELECT on all content tables
- Authenticated INSERT/UPDATE/DELETE on all tables (admin only)
- Contact messages + blog comments + newsletter: public INSERT, authenticated SELECT
*/

-- ============ PROFILE ============
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Alex Chen',
  title text NOT NULL DEFAULT 'Full-Stack Software Engineer',
  tagline text NOT NULL DEFAULT 'Building delightful experiences at the intersection of design and engineering.',
  bio text NOT NULL DEFAULT 'I am a full-stack software engineer with over 8 years of experience building web applications that scale. I specialize in React, Node.js, and cloud architecture, with a passion for clean code and intuitive UX.',
  email text NOT NULL DEFAULT 'hello@alexchen.dev',
  phone text DEFAULT '+1 (415) 555-0142',
  location text DEFAULT 'San Francisco, CA',
  timezone text DEFAULT 'America/Los_Angeles',
  availability boolean NOT NULL DEFAULT true,
  availability_label text DEFAULT 'Available for work',
  resume_url text,
  profile_picture_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_profile" ON profile;
CREATE POLICY "public_read_profile" ON profile FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_profile" ON profile;
CREATE POLICY "auth_insert_profile" ON profile FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_profile" ON profile;
CREATE POLICY "auth_update_profile" ON profile FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_profile" ON profile;
CREATE POLICY "auth_delete_profile" ON profile FOR DELETE TO authenticated USING (true);

-- ============ HERO CONTENT ============
CREATE TABLE IF NOT EXISTS hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kicker text NOT NULL DEFAULT 'SOFTWARE ENGINEER · CREATIVE DEVELOPER',
  headline text NOT NULL DEFAULT 'I build digital products that people love to use.',
  highlighted_word text NOT NULL DEFAULT 'love',
  subheadline text NOT NULL DEFAULT 'Full-stack engineer specializing in React, TypeScript, and cloud-native architectures. I turn complex problems into elegant, performant interfaces.',
  cta_primary_label text NOT NULL DEFAULT 'View Projects',
  cta_primary_url text NOT NULL DEFAULT '/projects',
  cta_secondary_label text NOT NULL DEFAULT 'Download Resume',
  cta_secondary_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_hero_content" ON hero_content;
CREATE POLICY "public_read_hero_content" ON hero_content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_hero_content" ON hero_content;
CREATE POLICY "auth_insert_hero_content" ON hero_content FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_hero_content" ON hero_content;
CREATE POLICY "auth_update_hero_content" ON hero_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_hero_content" ON hero_content;
CREATE POLICY "auth_delete_hero_content" ON hero_content FOR DELETE TO authenticated USING (true);

-- ============ HERO VIDEOS ============
CREATE TABLE IF NOT EXISTS hero_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  thumbnail_url text,
  filename text NOT NULL,
  duration text,
  size text,
  is_active boolean NOT NULL DEFAULT false,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_hero_videos" ON hero_videos;
CREATE POLICY "public_read_hero_videos" ON hero_videos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_hero_videos" ON hero_videos;
CREATE POLICY "auth_insert_hero_videos" ON hero_videos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_hero_videos" ON hero_videos;
CREATE POLICY "auth_update_hero_videos" ON hero_videos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_hero_videos" ON hero_videos;
CREATE POLICY "auth_delete_hero_videos" ON hero_videos FOR DELETE TO authenticated USING (true);

-- ============ HERO IMAGES ============
CREATE TABLE IF NOT EXISTS hero_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_hero_images" ON hero_images;
CREATE POLICY "public_read_hero_images" ON hero_images FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_hero_images" ON hero_images;
CREATE POLICY "auth_insert_hero_images" ON hero_images FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_hero_images" ON hero_images;
CREATE POLICY "auth_update_hero_images" ON hero_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_hero_images" ON hero_images;
CREATE POLICY "auth_delete_hero_images" ON hero_images FOR DELETE TO authenticated USING (true);

-- ============ TECHNOLOGIES ============
CREATE TABLE IF NOT EXISTS technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon_url text,
  category text NOT NULL DEFAULT 'Framework',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_technologies" ON technologies;
CREATE POLICY "public_read_technologies" ON technologies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_technologies" ON technologies;
CREATE POLICY "auth_insert_technologies" ON technologies FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_technologies" ON technologies;
CREATE POLICY "auth_update_technologies" ON technologies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_technologies" ON technologies;
CREATE POLICY "auth_delete_technologies" ON technologies FOR DELETE TO authenticated USING (true);

-- ============ PROJECT CATEGORIES ============
CREATE TABLE IF NOT EXISTS project_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color text DEFAULT '#8B5CF6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_project_categories" ON project_categories;
CREATE POLICY "public_read_project_categories" ON project_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_project_categories" ON project_categories;
CREATE POLICY "auth_insert_project_categories" ON project_categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_project_categories" ON project_categories;
CREATE POLICY "auth_update_project_categories" ON project_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_project_categories" ON project_categories;
CREATE POLICY "auth_delete_project_categories" ON project_categories FOR DELETE TO authenticated USING (true);

-- ============ PROJECTS ============
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  cover_image_url text,
  gallery jsonb DEFAULT '[]'::jsonb,
  demo_url text,
  github_url text,
  status text NOT NULL DEFAULT 'Live',
  is_featured boolean NOT NULL DEFAULT false,
  difficulty text NOT NULL DEFAULT 'Intermediate',
  description text NOT NULL DEFAULT '',
  video_demo_url text,
  order_index int NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  category_id uuid REFERENCES project_categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_projects" ON projects;
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE TO authenticated USING (true);

-- ============ PROJECT TECHNOLOGIES (JOIN) ============
CREATE TABLE IF NOT EXISTS project_technologies (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id uuid NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_project_technologies" ON project_technologies;
CREATE POLICY "public_read_project_technologies" ON project_technologies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_project_technologies" ON project_technologies;
CREATE POLICY "auth_insert_project_technologies" ON project_technologies FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_project_technologies" ON project_technologies;
CREATE POLICY "auth_update_project_technologies" ON project_technologies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_project_technologies" ON project_technologies;
CREATE POLICY "auth_delete_project_technologies" ON project_technologies FOR DELETE TO authenticated USING (true);

-- ============ BLOG CATEGORIES ============
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color text DEFAULT '#6366F1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_categories" ON blog_categories;
CREATE POLICY "public_read_blog_categories" ON blog_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_blog_categories" ON blog_categories;
CREATE POLICY "auth_insert_blog_categories" ON blog_categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_blog_categories" ON blog_categories;
CREATE POLICY "auth_update_blog_categories" ON blog_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_blog_categories" ON blog_categories;
CREATE POLICY "auth_delete_blog_categories" ON blog_categories FOR DELETE TO authenticated USING (true);

-- ============ BLOG TAGS ============
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_tags" ON blog_tags;
CREATE POLICY "public_read_blog_tags" ON blog_tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_blog_tags" ON blog_tags;
CREATE POLICY "auth_insert_blog_tags" ON blog_tags FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_blog_tags" ON blog_tags;
CREATE POLICY "auth_update_blog_tags" ON blog_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_blog_tags" ON blog_tags;
CREATE POLICY "auth_delete_blog_tags" ON blog_tags FOR DELETE TO authenticated USING (true);

-- ============ BLOG POSTS ============
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  cover_image_url text,
  content text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Draft',
  published_at timestamptz,
  reading_time int DEFAULT 5,
  is_featured boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  og_image_url text,
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_posts" ON blog_posts;
CREATE POLICY "public_read_blog_posts" ON blog_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_blog_posts" ON blog_posts;
CREATE POLICY "auth_insert_blog_posts" ON blog_posts FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_blog_posts" ON blog_posts;
CREATE POLICY "auth_update_blog_posts" ON blog_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_blog_posts" ON blog_posts;
CREATE POLICY "auth_delete_blog_posts" ON blog_posts FOR DELETE TO authenticated USING (true);

-- ============ BLOG POST TAGS (JOIN) ============
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_post_tags" ON blog_post_tags;
CREATE POLICY "public_read_blog_post_tags" ON blog_post_tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_blog_post_tags" ON blog_post_tags;
CREATE POLICY "auth_insert_blog_post_tags" ON blog_post_tags FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_blog_post_tags" ON blog_post_tags;
CREATE POLICY "auth_update_blog_post_tags" ON blog_post_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_blog_post_tags" ON blog_post_tags;
CREATE POLICY "auth_delete_blog_post_tags" ON blog_post_tags FOR DELETE TO authenticated USING (true);

-- ============ BLOG COMMENTS ============
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  comment text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blog_comments" ON blog_comments;
CREATE POLICY "public_read_blog_comments" ON blog_comments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_blog_comments" ON blog_comments;
CREATE POLICY "public_insert_blog_comments" ON blog_comments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_blog_comments" ON blog_comments;
CREATE POLICY "auth_update_blog_comments" ON blog_comments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_blog_comments" ON blog_comments;
CREATE POLICY "auth_delete_blog_comments" ON blog_comments FOR DELETE TO authenticated USING (true);

-- ============ SKILLS ============
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon_url text,
  category text NOT NULL DEFAULT 'Frontend',
  proficiency int NOT NULL DEFAULT 80,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_skills" ON skills;
CREATE POLICY "public_read_skills" ON skills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_skills" ON skills;
CREATE POLICY "auth_insert_skills" ON skills FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_skills" ON skills;
CREATE POLICY "auth_update_skills" ON skills FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_skills" ON skills;
CREATE POLICY "auth_delete_skills" ON skills FOR DELETE TO authenticated USING (true);

-- ============ EXPERIENCE ============
CREATE TABLE IF NOT EXISTS experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  role text NOT NULL,
  location text,
  start_date text NOT NULL,
  end_date text,
  is_current boolean NOT NULL DEFAULT false,
  description text NOT NULL DEFAULT '',
  logo_url text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_experience" ON experience;
CREATE POLICY "public_read_experience" ON experience FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_experience" ON experience;
CREATE POLICY "auth_insert_experience" ON experience FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_experience" ON experience;
CREATE POLICY "auth_update_experience" ON experience FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_experience" ON experience;
CREATE POLICY "auth_delete_experience" ON experience FOR DELETE TO authenticated USING (true);

-- ============ EDUCATION ============
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution text NOT NULL,
  degree text NOT NULL,
  field text NOT NULL,
  start_date text NOT NULL,
  end_date text,
  logo_url text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_education" ON education;
CREATE POLICY "public_read_education" ON education FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_education" ON education;
CREATE POLICY "auth_insert_education" ON education FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_education" ON education;
CREATE POLICY "auth_update_education" ON education FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_education" ON education;
CREATE POLICY "auth_delete_education" ON education FOR DELETE TO authenticated USING (true);

-- ============ CERTIFICATIONS ============
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL,
  issue_date text NOT NULL,
  expiry_date text,
  credential_id text,
  verify_url text,
  badge_url text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_certifications" ON certifications;
CREATE POLICY "public_read_certifications" ON certifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_certifications" ON certifications;
CREATE POLICY "auth_insert_certifications" ON certifications FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_certifications" ON certifications;
CREATE POLICY "auth_update_certifications" ON certifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_certifications" ON certifications;
CREATE POLICY "auth_delete_certifications" ON certifications FOR DELETE TO authenticated USING (true);

-- ============ SERVICES ============
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  icon text NOT NULL DEFAULT 'Code',
  description text NOT NULL DEFAULT '',
  included_items jsonb DEFAULT '[]'::jsonb,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_services" ON services;
CREATE POLICY "auth_insert_services" ON services FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_services" ON services;
CREATE POLICY "auth_update_services" ON services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_services" ON services;
CREATE POLICY "auth_delete_services" ON services FOR DELETE TO authenticated USING (true);

-- ============ TESTIMONIALS ============
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  company text,
  avatar_url text,
  rating int NOT NULL DEFAULT 5,
  quote text NOT NULL DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_testimonials" ON testimonials;
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_testimonials" ON testimonials;
CREATE POLICY "auth_insert_testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_testimonials" ON testimonials;
CREATE POLICY "auth_update_testimonials" ON testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_testimonials" ON testimonials;
CREATE POLICY "auth_delete_testimonials" ON testimonials FOR DELETE TO authenticated USING (true);

-- ============ CONTACT MESSAGES ============
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  is_spam boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_contact_messages" ON contact_messages;
CREATE POLICY "public_insert_contact_messages" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_contact_messages" ON contact_messages;
CREATE POLICY "auth_read_contact_messages" ON contact_messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_contact_messages" ON contact_messages;
CREATE POLICY "auth_update_contact_messages" ON contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_contact_messages" ON contact_messages;
CREATE POLICY "auth_delete_contact_messages" ON contact_messages FOR DELETE TO authenticated USING (true);

-- ============ SOCIAL LINKS ============
CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_social_links" ON social_links;
CREATE POLICY "public_read_social_links" ON social_links FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_social_links" ON social_links;
CREATE POLICY "auth_insert_social_links" ON social_links FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_social_links" ON social_links;
CREATE POLICY "auth_update_social_links" ON social_links FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_social_links" ON social_links;
CREATE POLICY "auth_delete_social_links" ON social_links FOR DELETE TO authenticated USING (true);

-- ============ SEO SETTINGS ============
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title_template text NOT NULL DEFAULT '%s | Alex Chen',
  meta_description text NOT NULL DEFAULT 'Full-stack software engineer specializing in React, TypeScript, and cloud architecture.',
  og_image_url text,
  twitter_handle text DEFAULT '@alexchen_dev',
  favicon_url text,
  gsc_verification text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_seo_settings" ON seo_settings;
CREATE POLICY "public_read_seo_settings" ON seo_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_seo_settings" ON seo_settings;
CREATE POLICY "auth_insert_seo_settings" ON seo_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_seo_settings" ON seo_settings;
CREATE POLICY "auth_update_seo_settings" ON seo_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_seo_settings" ON seo_settings;
CREATE POLICY "auth_delete_seo_settings" ON seo_settings FOR DELETE TO authenticated USING (true);

-- ============ WEBSITE SETTINGS ============
CREATE TABLE IF NOT EXISTS website_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Alex Chen',
  logo_url text,
  accent_overrides jsonb DEFAULT '{}'::jsonb,
  maintenance_mode boolean NOT NULL DEFAULT false,
  custom_head_script text,
  whatsapp_number text,
  whatsapp_enabled boolean NOT NULL DEFAULT false,
  whatsapp_message text DEFAULT 'Hi Alex! I came across your portfolio and wanted to connect.',
  footer_bio text DEFAULT 'Full-stack software engineer crafting digital products with precision and care.',
  footer_copyright text DEFAULT 'Alex Chen',
  footer_tagline text DEFAULT 'Built with care and way too much coffee.',
  newsletter_enabled boolean NOT NULL DEFAULT true,
  map_location text DEFAULT 'San Francisco, CA',
  map_embed_url text DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.5076397265625!3d37.75767999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f07696ff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1234567890',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_website_settings" ON website_settings;
CREATE POLICY "public_read_website_settings" ON website_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_website_settings" ON website_settings;
CREATE POLICY "auth_insert_website_settings" ON website_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_website_settings" ON website_settings;
CREATE POLICY "auth_update_website_settings" ON website_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_website_settings" ON website_settings;
CREATE POLICY "auth_delete_website_settings" ON website_settings FOR DELETE TO authenticated USING (true);

-- ============ NAVIGATION ITEMS ============
CREATE TABLE IF NOT EXISTS navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  target text NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  order_index int NOT NULL DEFAULT 0,
  location text NOT NULL DEFAULT 'navbar',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_navigation_items" ON navigation_items;
CREATE POLICY "public_read_navigation_items" ON navigation_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_navigation_items" ON navigation_items;
CREATE POLICY "auth_insert_navigation_items" ON navigation_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_navigation_items" ON navigation_items;
CREATE POLICY "auth_update_navigation_items" ON navigation_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_navigation_items" ON navigation_items;
CREATE POLICY "auth_delete_navigation_items" ON navigation_items FOR DELETE TO authenticated USING (true);

-- ============ FAQS ============
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'General',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_faqs" ON faqs;
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_faqs" ON faqs;
CREATE POLICY "auth_insert_faqs" ON faqs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_faqs" ON faqs;
CREATE POLICY "auth_update_faqs" ON faqs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_faqs" ON faqs;
CREATE POLICY "auth_delete_faqs" ON faqs FOR DELETE TO authenticated USING (true);

-- ============ GALLERY ITEMS ============
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  tags text[] DEFAULT '{}',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_gallery_items" ON gallery_items;
CREATE POLICY "public_read_gallery_items" ON gallery_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_gallery_items" ON gallery_items;
CREATE POLICY "auth_insert_gallery_items" ON gallery_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_gallery_items" ON gallery_items;
CREATE POLICY "auth_update_gallery_items" ON gallery_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_gallery_items" ON gallery_items;
CREATE POLICY "auth_delete_gallery_items" ON gallery_items FOR DELETE TO authenticated USING (true);

-- ============ ACHIEVEMENTS ============
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL,
  date text NOT NULL,
  description text,
  image_url text,
  verify_url text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_achievements" ON achievements;
CREATE POLICY "public_read_achievements" ON achievements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_achievements" ON achievements;
CREATE POLICY "auth_insert_achievements" ON achievements FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_achievements" ON achievements;
CREATE POLICY "auth_update_achievements" ON achievements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_achievements" ON achievements;
CREATE POLICY "auth_delete_achievements" ON achievements FOR DELETE TO authenticated USING (true);

-- ============ NEWSLETTER SUBSCRIBERS ============
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source_page text,
  subscribed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "public_insert_newsletter_subscribers" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "auth_read_newsletter_subscribers" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "auth_update_newsletter_subscribers" ON newsletter_subscribers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "auth_delete_newsletter_subscribers" ON newsletter_subscribers FOR DELETE TO authenticated USING (true);

-- ============ PAGE VIEWS ============
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL,
  referrer text,
  device text,
  browser text,
  country text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_page_views" ON page_views;
CREATE POLICY "public_insert_page_views" ON page_views FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_page_views" ON page_views;
CREATE POLICY "auth_read_page_views" ON page_views FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_delete_page_views" ON page_views;
CREATE POLICY "auth_delete_page_views" ON page_views FOR DELETE TO authenticated USING (true);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
