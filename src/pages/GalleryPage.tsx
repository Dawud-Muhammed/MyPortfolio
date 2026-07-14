import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGalleryItems, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';

export function GalleryPage() {
  const { data: items, loading } = useGalleryItems();
  const { data: seoSettings } = useSeoSettings();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const allTags = Array.from(new Set((items || []).flatMap((g) => g.tags || [])));
  const filtered = filter === 'all' ? (items || []) : (items || []).filter((g) => (g.tags || []).includes(filter));

  const openLightbox = (idx: number) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);
  const next = () => setLightbox((prev) => prev === null ? null : (prev + 1) % filtered.length);
  const prev = () => setLightbox((prev) => prev === null ? null : (prev - 1 + filtered.length) % filtered.length);

  return (
    <>
      <SeoHead title="Gallery" description="A visual gallery of my work, projects, and moments." seoSettings={seoSettings} />

      <div className="pt-32 pb-20">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="text-accent-400 font-mono text-sm tracking-widest mb-2 uppercase">Visual</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Gallery</h1>
            <p className="text-white/50 max-w-2xl mx-auto">
              A collection of screenshots, designs, and moments from my journey as a developer.
            </p>
          </motion.div>

          {/* Tag filters */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all' ? 'bg-accent-500 text-white' : 'glass text-white/60 hover:text-white'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilter(tag)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === tag ? 'bg-accent-500 text-white' : 'glass text-white/60 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square rounded-2xl shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => openLightbox(i)}
                  className="aspect-square rounded-2xl overflow-hidden glass cursor-pointer group relative"
                >
                  <img src={item.image_url} alt={item.caption || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {item.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">{item.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white p-2" onClick={closeLightbox}>
            <X size={24} />
          </button>
          <button className="absolute left-4 text-white/60 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); prev(); }}>
            <ChevronLeft size={32} />
          </button>
          <img
            src={filtered[lightbox].image_url}
            alt={filtered[lightbox].caption || ''}
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="absolute right-4 text-white/60 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); next(); }}>
            <ChevronRight size={32} />
          </button>
          {filtered[lightbox].caption && (
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm">{filtered[lightbox].caption}</p>
          )}
        </div>
      )}
    </>
  );
}
