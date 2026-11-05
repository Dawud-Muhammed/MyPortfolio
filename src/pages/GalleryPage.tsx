import { useState } from 'react';
import { Expand } from 'lucide-react';
import { useGalleryItems, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { CollectionState, MediaLightbox, PageHeading } from '../components/PublicContent';
import { safeUrl } from '../lib/utils';

export function GalleryPage() {
  const { data: items, loading, error } = useGalleryItems();
  const { data: seoSettings } = useSeoSettings();
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const tags = Array.from(new Set(items.flatMap(item => item.tags || [])));
  const filtered = items.filter(item => safeUrl(item.image_url) && (filter === 'all' || item.tags?.includes(filter)));
  const media = filtered.map(item => ({ src: safeUrl(item.image_url)!, alt: item.alt_text || item.caption || 'Image from Dawud’s portfolio gallery', caption: item.caption, href: item.related_url }));
  return <div className="section-container pt-32 pb-24">
    <SeoHead title="Gallery" description="A visual record of Dawud Muhammed’s work, projects, and moments." seoSettings={seoSettings} />
    <PageHeading eyebrow="Visual journal" title="Beyond the code.">The projects, people, and moments around the work. Take a closer look.</PageHeading>
    {!!tags.length && <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Gallery filters">{['all', ...tags].map(tag => <button key={tag} onClick={() => { setFilter(tag); setLightbox(null); }} aria-pressed={filter === tag} className={`min-h-11 px-4 border rounded-lg ${filter === tag ? 'border-accent-primary text-accent-primary' : 'border-border-subtle text-text-secondary'}`}>{tag === 'all' ? 'All images' : tag}</button>)}</div>}
    <CollectionState loading={loading} error={error} empty={!filtered.length} name="gallery images" />
    {!loading && !error && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">{filtered.map((item, index) => <figure key={item.id}><button onClick={() => setLightbox(index)} className="gallery-tile group relative block w-full rounded-2xl overflow-hidden border border-border-subtle bg-surface-elevated" aria-label={`Enlarge ${media[index].alt}`}><img src={media[index].src} alt={media[index].alt} loading="lazy" width={800} height={600} className="w-full aspect-[4/3] object-cover" /><span className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-surface-base text-text-primary flex items-center justify-center border border-border-subtle" aria-hidden="true"><Expand size={18} /></span></button><figcaption className="text-text-secondary leading-relaxed mt-4">{item.caption || 'Caption to be added.'}{safeUrl(item.related_url) && <a href={safeUrl(item.related_url)} className="text-link inline-flex items-center mt-2 min-h-11">Related work ↗</a>}</figcaption></figure>)}</div>}
    {lightbox !== null && <MediaLightbox items={media} index={lightbox} onIndexChange={setLightbox} onClose={() => setLightbox(null)} />}
  </div>;
}
