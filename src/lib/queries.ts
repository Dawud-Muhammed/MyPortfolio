import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type {
  Profile, HeroContent, HeroImage, Project, ProjectCategory,
  Technology, BlogPost, BlogCategory, BlogTag, Skill, Experience,
  Education, Certification, Service, Testimonial, SocialLink,
  SeoSettings, WebsiteSettings, NavigationItem, Faq, GalleryItem,
  Achievement, BlogComment, ContactMessage, SiteStat,
} from './types';

// Generic hook for fetching all data from a table
function useFetchAll<T>(table: string, orderCol?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from(table)
      .select('*')
      .order(orderCol || 'created_at', { ascending: false })
      .then(({ data: result, error: err }) => {
        if (!active) return;
        if (err) setError(err.message);
        else setData((result || []) as T[]);
        setLoading(false);
      });
    return () => { active = false; };
  }, [table, orderCol]);

  return { data, loading, error };
}

// Generic hook for fetching a single row
function useFetchOne<T>(table: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from(table)
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data: result, error: err }) => {
        if (!active) return;
        if (err) setError(err.message);
        else setData(result as T);
        setLoading(false);
      });
    return () => { active = false; };
  }, [table]);

  return { data, loading, error };
}

export const useProfile = () => useFetchOne<Profile>('profile');
export const useHeroContent = () => useFetchOne<HeroContent>('hero_content');
export const useHeroImages = () => useFetchAll<HeroImage>('hero_images', 'order_index');
export const useProjects = () => {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('projects')
      .select('*, category:project_categories(*), technologies:project_technologies(technology:technologies(*))')
      .order('order_index', { ascending: true })
      .then(({ data: result, error: err }) => {
        if (!active) return;
        if (err) { setError(err.message); setLoading(false); return; }
        const mapped = (result || []).map((p: any) => ({
          ...p,
          technologies: (p.technologies || []).map((pt: any) => pt.technology).filter(Boolean),
        }));
        setData(mapped);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { data, loading, error };
};

export const useProjectBySlug = (slug: string) => {
  const [data, setData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from('projects')
      .select('*, category:project_categories(*), technologies:project_technologies(technology:technologies(*))')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data: result, error: err }) => {
        if (!active) return;
        if (err) { setError(err.message); setLoading(false); return; }
        if (result) {
          const mapped = {
            ...result,
            technologies: (result.technologies || []).map((pt: any) => pt.technology).filter(Boolean),
          };
          setData(mapped);
        } else {
          setData(null);
        }
        setLoading(false);
      });
    return () => { active = false; };
  }, [slug]);

  return { data, loading, error };
};

export const useProjectCategories = () => useFetchAll<ProjectCategory>('project_categories', 'order_index');
export const useTechnologies = () => useFetchAll<Technology>('technologies');
export const useBlogPosts = () => {
  const [data, setData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('blog_posts')
      .select('*, category:blog_categories(*), tags:blog_post_tags(tag:blog_tags(*))')
      .order('published_at', { ascending: false })
      .then(({ data: result, error: err }) => {
        if (!active) return;
        if (err) { setError(err.message); setLoading(false); return; }
        const mapped = (result || []).map((p: any) => ({
          ...p,
          tags: (p.tags || []).map((pt: any) => pt.tag).filter(Boolean),
        }));
        setData(mapped);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { data, loading, error };
};

export const useBlogPostBySlug = (slug: string) => {
  const [data, setData] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from('blog_posts')
      .select('*, category:blog_categories(*), tags:blog_post_tags(tag:blog_tags(*))')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data: result, error: err }) => {
        if (!active) return;
        if (err) { setError(err.message); setLoading(false); return; }
        if (result) {
          const mapped = {
            ...result,
            tags: (result.tags || []).map((pt: any) => pt.tag).filter(Boolean),
          };
          setData(mapped);
        } else {
          setData(null);
        }
        setLoading(false);
      });
    return () => { active = false; };
  }, [slug]);

  return { data, loading, error };
};

export const useBlogCategories = () => useFetchAll<BlogCategory>('blog_categories');
export const useBlogTags = () => useFetchAll<BlogTag>('blog_tags');
export const useBlogComments = (postId: string) => {
  const [data, setData] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data: result }) => {
        if (!active) return;
        setData(result || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, [postId]);

  return { data, loading };
};

export const useSkills = () => useFetchAll<Skill>('skills', 'order_index');
export const useExperience = () => useFetchAll<Experience>('experience', 'order_index');
export const useEducation = () => useFetchAll<Education>('education', 'order_index');
export const useCertifications = () => useFetchAll<Certification>('certifications', 'order_index');
export const useServices = () => useFetchAll<Service>('services', 'order_index');
export const useTestimonials = () => useFetchAll<Testimonial>('testimonials', 'order_index');
export const useSocialLinks = () => useFetchAll<SocialLink>('social_links', 'order_index');
export const useSeoSettings = () => useFetchOne<SeoSettings>('seo_settings');
export const useWebsiteSettings = () => useFetchOne<WebsiteSettings>('website_settings');
export const useNavigationItems = () => useFetchAll<NavigationItem>('navigation_items', 'order_index');
export const useSiteStats = () => useFetchAll<SiteStat>('site_stats', 'order_index');
export const useFaqs = () => useFetchAll<Faq>('faqs', 'order_index');
export const useGalleryItems = () => useFetchAll<GalleryItem>('gallery_items', 'order_index');
export const useAchievements = () => useFetchAll<Achievement>('achievements', 'order_index');

export const useContactMessages = () => {
  const [data, setData] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data: result }) => {
        if (!active) return;
        setData(result || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { data, loading };
};
