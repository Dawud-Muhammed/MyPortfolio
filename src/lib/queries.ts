import { useEffect, useState, useSyncExternalStore } from 'react';
import { isSupabaseConfigured, publicSupabase, supabase } from './supabase';
import type { Profile, HeroContent, HeroImage, Project, ProjectCategory, Technology, BlogPost, BlogCategory, BlogTag, Skill, Experience, Education, Certification, Service, Testimonial, SocialLink, SeoSettings, WebsiteSettings, NavigationItem, Faq, GalleryItem, Achievement, BlogComment, ContactMessage, AssistantSettings } from './types';

type State<T> = { data: T; loading: boolean; error: string | null };
type Row = Record<string, unknown>;
type Entry = { state: State<unknown>; listeners: Set<() => void>; load: () => Promise<void>; pending: boolean; time: number };
const cache = new Map<string, Entry>();
const publishedTables = new Set(['profile','hero_content','hero_images','hero_videos','skills','experience','education','certifications','services','testimonials','social_links','seo_settings','website_settings','navigation_items','faqs','gallery_items','achievements','project_categories','technologies','blog_categories','blog_tags']);
const EMPTY: never[] = [];

// Public requests always run as anon, including while the owner is signed in.
// Active tabs refresh within 30 seconds; writes notify other tabs immediately.
export function invalidatePublicContent() {
  cache.forEach(entry => { entry.time = 0; if (entry.listeners.size) void entry.load(); });
  try { localStorage.setItem('portfolio-content-revision', String(Date.now())); } catch { /* Storage can be disabled. */ }
}
if (typeof window !== 'undefined') window.addEventListener('storage', e => { if (e.key === 'portfolio-content-revision') cache.forEach(entry => { if (entry.listeners.size) void entry.load(); }); });

function useQuery<T>(key: string, initial: T, fetcher: () => Promise<T>) {
  if (!cache.has(key)) {
    const entry: Entry = { state: { data: initial, loading: true, error: null }, listeners: new Set(), pending: false, time: 0, load: async () => {
      if (entry.pending) return;
      entry.pending = true;
      try {
        if (!isSupabaseConfigured) throw new Error('Content is unavailable until Supabase is configured.');
        const data = await fetcher();
        entry.state = { data, loading: false, error: null };
      } catch (error) {
        // Never retain potentially unpublished records after a failed refresh.
        entry.state = { data: initial, loading: false, error: error instanceof Error ? error.message : 'Unable to load content.' };
      } finally { entry.time = Date.now(); entry.pending = false; entry.listeners.forEach(listener => listener()); }
    } };
    cache.set(key, entry);
  }
  const entry = cache.get(key)!;
  const state = useSyncExternalStore(
    listener => { entry.listeners.add(listener); return () => { entry.listeners.delete(listener); }; },
    () => entry.state as State<T>,
    () => entry.state as State<T>,
  );
  useEffect(() => {
    if (Date.now() - entry.time > 10_000) void entry.load();
    const refresh = () => { if (document.visibilityState === 'visible') void entry.load(); };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [entry]);
  return state;
}

async function getRows<T>(table: string, order = 'created_at', ascending = false, select = '*', filters: Record<string, string | boolean> = {}): Promise<T[]> {
  let query = publicSupabase.from(table).select(select);
  if (publishedTables.has(table)) query = query.eq('is_published', true);
  for (const [column, value] of Object.entries(filters)) query = query.eq(column, value);
  const { data, error } = await query.order(order, { ascending });
  if (error) throw error;
  return (data || []) as unknown as T[];
}
function useAll<T>(table: string, order = 'created_at', ascending = false, filters: Record<string, string | boolean> = {}) {
  return useQuery<T[]>(`${table}:${JSON.stringify(filters)}:${order}:${ascending}`, EMPTY, () => getRows(table, order, ascending, '*', filters));
}
function useOne<T>(table: string) {
  return useQuery<T | null>(table, null, async () => {
    const { data, error } = await publicSupabase.from(table).select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(1).maybeSingle();
    if (error) throw error;
    return data as T | null;
  });
}
const projectSelect = '*, category:project_categories(*), technologies:project_technologies(technology:technologies(*))';
const blogSelect = '*, category:blog_categories(*), tags:blog_post_tags(tag:blog_tags(*))';
function mapProject(row: Row): Project { return { ...row, technologies: ((row.technologies || []) as { technology: Technology | null }[]).map(item => item.technology).filter(Boolean) } as Project; }
function mapPost(row: Row): BlogPost { return { ...row, tags: ((row.tags || []) as { tag: BlogTag | null }[]).map(item => item.tag).filter(Boolean) } as BlogPost; }
export const useProfile = () => useOne<Profile>('profile');
export const useHeroContent = () => useOne<HeroContent>('hero_content');
export const useHeroImages = () => useAll<HeroImage>('hero_images', 'order_index', true, { is_active: true });
export const useProjects = () => useQuery<Project[]>('projects:published', EMPTY, async () => (await getRows<Row>('projects', 'order_index', true, projectSelect, { publication_status: 'published' })).map(mapProject));
export const useProjectBySlug = (slug: string) => useQuery<Project | null>(`project:${slug}`, null, async () => { const rows = await getRows<Row>('projects', 'order_index', true, projectSelect, { slug, publication_status: 'published' }); return rows[0] ? mapProject(rows[0]) : null; });
export const useProjectCategories = () => useAll<ProjectCategory>('project_categories', 'order_index', true);
export const useTechnologies = () => useAll<Technology>('technologies', 'name', true);
export const useBlogPosts = () => useQuery<BlogPost[]>('blog:published', EMPTY, async () => (await getRows<Row>('blog_posts', 'published_at', false, blogSelect, { status: 'Published' })).map(mapPost));
export const useBlogPostBySlug = (slug: string) => useQuery<BlogPost | null>(`blog:${slug}`, null, async () => { const rows = await getRows<Row>('blog_posts', 'published_at', false, blogSelect, { slug, status: 'Published' }); return rows[0] ? mapPost(rows[0]) : null; });
export const useBlogCategories = () => useAll<BlogCategory>('blog_categories', 'name', true);
export const useBlogTags = () => useAll<BlogTag>('blog_tags', 'name', true);
export const useBlogComments = (postId: string) => useQuery<BlogComment[]>(`comments:${postId}`, EMPTY, () => getRows<BlogComment>('published_blog_comments','created_at',false,'id,post_id,name,comment,created_at',{ post_id: postId }));
export const useSkills = () => useAll<Skill>('skills', 'order_index', true);
export const useExperience = () => useAll<Experience>('experience', 'start_date', false);
export const useEducation = () => useAll<Education>('education', 'start_date', false);
export const useCertifications = () => useAll<Certification>('certifications', 'issue_date', false);
export const useServices = () => useAll<Service>('services', 'order_index', true);
export const useTestimonials = () => useAll<Testimonial>('testimonials', 'order_index', true);
export const useSocialLinks = () => useAll<SocialLink>('social_links', 'order_index', true, { is_visible: true });
export const useSeoSettings = () => useOne<SeoSettings>('seo_settings');
export const useWebsiteSettings = () => useOne<WebsiteSettings>('website_settings');
export const useNavigationItems = () => useAll<NavigationItem>('navigation_items', 'order_index', true, { is_visible: true });
export const useFaqs = () => useAll<Faq>('faqs', 'order_index', true);
export const useGalleryItems = () => useAll<GalleryItem>('gallery_items', 'order_index', true);
export const useAchievements = () => useAll<Achievement>('achievements', 'date', false);
export const useAssistantSettings = () => useQuery<AssistantSettings | null>('assistant_settings', null, async () => { const { data, error } = await publicSupabase.from('assistant_settings').select('*').eq('id', true).maybeSingle(); if (error) throw error; return data; });

// Owner data never enters the shared public cache.
export function useContactMessages() {
  const [state, setState] = useState<State<ContactMessage[]>>({ data: [], loading: true, error: null });
  useEffect(() => { let active = true; supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).then(({ data, error }) => { if (active) setState({ data: data || [], loading: false, error: error?.message || null }); }); return () => { active = false; }; }, []);
  return state;
}
