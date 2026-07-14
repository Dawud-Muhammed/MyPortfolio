import { useEffect } from 'react';
import type { SeoSettings } from '../lib/types';

export function SeoHead({ title, description, image, seoSettings }: {
  title?: string;
  description?: string;
  image?: string;
  seoSettings?: SeoSettings | null;
}) {
  useEffect(() => {
    const template = seoSettings?.site_title_template || '%s | Alex Rivera';
    const fullTitle = title ? template.replace('%s', title) : 'Alex Rivera — Full-Stack Software Engineer';
    const metaDesc = description || seoSettings?.meta_description || 'Full-stack software engineer building delightful digital experiences.';

    document.title = fullTitle;

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', metaDesc);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', metaDesc, 'property');
    setMeta('og:type', 'website', 'property');
    if (image || seoSettings?.og_image_url) {
      setMeta('og:image', image || seoSettings?.og_image_url || '', 'property');
    }
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', metaDesc);
    if (seoSettings?.twitter_handle) {
      setMeta('twitter:site', seoSettings.twitter_handle);
    }
  }, [title, description, image, seoSettings]);

  return null;
}
