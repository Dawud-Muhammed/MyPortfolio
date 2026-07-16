export interface Profile {
  id: string;
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  timezone: string;
  availability: boolean;
  resume_url: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface HeroContent {
  id: string;
  kicker: string;
  headline: string;
  highlighted_word: string;
  subheadline: string;
  cta_primary_label: string;
  cta_primary_url: string;
  cta_secondary_label: string;
  cta_secondary_url: string;
  availability_status: boolean;
  availability_label: string;
  created_at: string;
  updated_at: string;
}

export interface HeroImage {
  id: string;
  url: string;
  is_active: boolean;
  order_index: number;
}

export interface HeroVideo {
  id: string;
  url: string;
  thumbnail_url: string | null;
  filename: string;
  duration: string | null;
  size: string | null;
  is_active: boolean;
  order_index: number;
}

export interface Technology {
  id: string;
  name: string;
  icon_url: string | null;
  category: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  gallery: string[];
  demo_url: string | null;
  github_url: string | null;
  status: string;
  is_featured: boolean;
  description: string;
  excerpt: string;
  video_demo_url: string | null;
  order_index: number;
  seo_title: string | null;
  seo_description: string | null;
  category_id: string | null;
  technologies?: Technology[];
  category?: ProjectCategory | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  content: string;
  excerpt: string;
  status: string;
  published_at: string | null;
  reading_time: number;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  category_id: string | null;
  tags?: BlogTag[];
  category?: BlogCategory | null;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  name: string;
  email: string;
  comment: string;
  status: string;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  icon_url: string | null;
  category: string;
  order_index: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  logo_url: string | null;
  order_index: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string | null;
  logo_url: string | null;
  order_index: number;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_id: string | null;
  verify_url: string | null;
  badge_url: string | null;
  order_index: number;
}

export interface Service {
  id: string;
  title: string;
  icon: string;
  description: string;
  included_items: string[];
  order_index: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar_url: string | null;
  rating: number;
  quote: string;
  is_featured: boolean;
  order_index: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  is_spam: boolean;
  created_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_visible: boolean;
  order_index: number;
}

export interface SeoSettings {
  id: string;
  site_title_template: string;
  meta_description: string;
  og_image_url: string | null;
  twitter_handle: string;
  favicon_url: string | null;
  gsc_verification: string | null;
}

export interface WebsiteSettings {
  id: string;
  site_name: string;
  logo_url: string | null;
  accent_overrides: Record<string, string>;
  maintenance_mode: boolean;
  custom_head_script: string | null;
  whatsapp_number: string;
  whatsapp_enabled: boolean;
  whatsapp_message: string;
  map_location: string;
  map_embed_url: string;
  footer_bio: string;
  footer_copyright: string;
  footer_tagline: string;
  newsletter_enabled: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  target: string;
  is_visible: boolean;
  order_index: number;
  location: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string;
  tags: string[];
  order_index: number;
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string | null;
  image_url: string | null;
  verify_url: string | null;
  order_index: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source_page: string;
  subscribed_at: string;
}

export interface PageView {
  id: string;
  route: string;
  referrer: string | null;
  device: string | null;
  browser: string | null;
  country: string | null;
  created_at: string;
}

