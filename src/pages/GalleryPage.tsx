import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGalleryItems, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';

export function GalleryPage() {
  const { data: items, loading } = useGalleryItems();
  const { data: seoSettings } = useSeoSettings();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const allTags = Array.from(new Set((items || []).flatMap((g) => g.tags || [])));
  const filtered = filter === 'all' ? (items || []) : (items || []).filter((g) => (g.tags || []).includes(filter));

  const openLightbox = (idx: number) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);
  const next = useCallback(() => setLightbox((prev) => prev === null ? null : (prev + 1) % filtered.length), [filtered.length]);
  const prev = useCallback(() => setLightbox((prev) => prev === null ? null : (prev - 1 + filtered.length) % filtered.length), [filtered.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, next, prev]);

  return (
    <PageTransition>
      <SeoHead title="Gallery" description="A visual gallery of my work, projects, and moments." seoSettings={seoSettings} />

      <div className="pt-32 pb-24">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="label-mono-accent mb-3">Visual</p>
            <h1 className="heading-display text-text-primary mb-4">Gallery</h1>
            <p className="text-body-lg text-text-secondary max-w-2xl">
              A collection of screenshots, designs, and moments from my journey as a developer.
            </p>
          </motion.div>

          {/* Tag filters */}
          {allTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center gap-2 mb-10"
            >
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-[0.12em] transition-all duration-300 ${
                  filter === 'all'
                    ? 'bg-accent-primary text-void-950'
                    : 'border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-hover'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilter(tag)}
                  className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-[0.12em] transition-all duration-300 ${
                    filter === tag
                      ? 'bg-accent-primary text-void-950'
                      : 'border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-hover'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square rounded-xl skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    onClick={() => openLightbox(i)}
                    className="aspect-square rounded-xl overflow-hidden border border-border-subtle cursor-pointer group relative"
                  >
                    <img
                      src={item.image_url}
                      alt={item.caption || ''}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      {item.caption && (
                        <p className="text-text-primary text-sm font-medium">{item.caption}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            className="fixed inset-0 z-[100] bg-void-950/95 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button
              className="absolute top-6 right-6 text-text-tertiary hover:text-text-primary p-2 z-10 transition-colors"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>
            <button
              className="absolute left-4 md:left-8 text-text-tertiary hover:text-text-primary p-2 z-10 transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>

            <motion.img
              key={lightbox}
              src={filtered[lightbox].image_url}
              alt={filtered[lightbox].caption || ''}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className="absolute right-4 md:right-8 text-text-tertiary hover:text-text-primary p-2 z-10 transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>

            {filtered[lightbox].caption && (
              <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-secondary text-sm font-medium">
                {filtered[lightbox].caption}
              </p>
            )}

            {/* Counter */}
            <p className="absolute bottom-8 right-8 font-mono text-[11px] text-text-mono">
              {lightbox + 1} / {filtered.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
