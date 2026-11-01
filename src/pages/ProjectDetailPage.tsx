import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Play } from 'lucide-react';
import { useProjectBySlug, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { MagneticButton } from '../components/MagneticButton';
import { useState } from 'react';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, loading } = useProjectBySlug(slug || '');
  const { data: seoSettings } = useSeoSettings();
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (loading) {
    return (
      <PageTransition>
        <div className="pt-32 pb-20">
          <div className="section-container">
            <div className="aspect-video rounded-2xl skeleton mb-8" />
            <div className="h-10 w-2/3 skeleton rounded-lg mb-4" />
            <div className="h-6 w-full skeleton rounded-lg mb-2" />
            <div className="h-6 w-3/4 skeleton rounded-lg" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition>
        <div className="pt-32 pb-20 text-center">
          <div className="section-container">
            <h1 className="text-3xl font-bold text-text-primary mb-4">Project not found</h1>
            <MagneticButton href="/projects" variant="primary">
              <ArrowLeft size={16} /> Back to Projects
            </MagneticButton>
          </div>
        </div>
      </PageTransition>
    );
  }

  const linkedTechs = (project.technologies || []).map((t) => t.name);
  let parsedTechs: string[] = [];
  if (linkedTechs.length === 0 && project.description) {
    const techMatch = project.description.match(/Technologies:\s*([\s\S]*?)(?:\n\n|$)/i);
    if (techMatch) {
      parsedTechs = techMatch[1].split(',').map((t) => t.trim()).filter(Boolean);
    }
  }
  const allTechs = linkedTechs.length > 0 ? linkedTechs : parsedTechs;

  return (
    <PageTransition>
      <SeoHead
        title={project.seo_title || project.title}
        description={project.seo_description || project.excerpt || project.description}
        image={project.cover_image_url || undefined}
        seoSettings={seoSettings}
      />

      <div className="pt-28 pb-24">
        <div className="section-container">
          {/* Back link */}
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-text-tertiary hover:text-text-primary text-sm mb-8 group transition-colors">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span className="font-mono text-xs uppercase tracking-[0.12em]">Back to Projects</span>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {project.category && (
                <span className="badge" style={{ color: project.category.color, borderColor: project.category.color + '30' }}>
                  {project.category.name}
                </span>
              )}
              <span className={`badge ${project.status === 'Live' ? '!bg-status-emerald/15 !text-status-emerald !border-status-emerald/25' : '!bg-warning-500/15 !text-warning-400 !border-warning-500/25'}`}>
                {project.status}
              </span>
            </div>
            <h1 className="text-display-md font-bold text-text-primary mb-4">{project.title}</h1>
            <p className="text-body-lg text-text-secondary max-w-3xl">{project.excerpt || project.description}</p>
          </motion.div>

          {/* Cover image */}
          {project.cover_image_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="aspect-video rounded-2xl overflow-hidden mb-8 border border-border-subtle"
            >
              <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-3 mb-12"
          >
            {project.demo_url && (
              <MagneticButton href={project.demo_url} variant="primary">
                <ExternalLink size={14} /> Live Demo
              </MagneticButton>
            )}
            {project.github_url && (
              <MagneticButton href={project.github_url} variant="secondary">
                <Github size={14} /> Source Code
              </MagneticButton>
            )}
            {project.video_demo_url && (
              <MagneticButton href={project.video_demo_url} variant="ghost">
                <Play size={14} /> Video Demo
              </MagneticButton>
            )}
          </motion.div>

          {/* Content grid */}
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Description */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-text-primary mb-4">About this project</h2>
              <div className="prose-content">
                {project.description.split('\n').filter((p) => p.trim() && !p.trim().startsWith('Technologies:')).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Video embed */}
              {project.video_demo_url && (
                <div className="mt-12">
                  <h2 className="text-xl font-bold text-text-primary mb-4">Video Demo</h2>
                  <div className="aspect-video rounded-xl overflow-hidden border border-border-subtle bg-surface-base">
                    {project.video_demo_url.includes('youtube') || project.video_demo_url.includes('youtu.be') ? (
                      <iframe
                        src={project.video_demo_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        title={`${project.title} demo`}
                      />
                    ) : (
                      <video
                        src={project.video_demo_url}
                        controls
                        preload="metadata"
                        className="w-full h-full object-cover"
                      >
                        <track kind="captions" />
                      </video>
                    )}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-bold text-text-primary mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {project.gallery.map((img, i) => (
                      <motion.div
                        key={i}
                        className="aspect-[4/3] rounded-xl overflow-hidden border border-border-subtle cursor-pointer group"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setLightboxImg(img)}
                      >
                        <img src={img} alt={`${project.title} screenshot ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="surface-card rounded-xl p-6 sticky top-24">
                <h3 className="text-text-primary font-semibold mb-4 text-sm">Technologies</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {allTechs.length > 0 ? (
                    allTechs.map((techName, i) => (
                      <span key={i} className="badge">{techName}</span>
                    ))
                  ) : (
                    <span className="text-text-tertiary text-sm">No technologies listed</span>
                  )}
                </div>

                <h3 className="text-text-primary font-semibold mb-4 text-sm">Project Info</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-tertiary">Status</dt>
                    <dd className="text-text-secondary">{project.status}</dd>
                  </div>
                  {project.category && (
                    <div className="flex justify-between">
                      <dt className="text-text-tertiary">Category</dt>
                      <dd className="text-text-secondary">{project.category.name}</dd>
                    </div>
                  )}
                  {project.demo_url && (
                    <div className="flex justify-between items-center">
                      <dt className="text-text-tertiary">Demo</dt>
                      <dd className="text-accent-primary text-xs truncate ml-4 max-w-[150px]">
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{new URL(project.demo_url).hostname}</a>
                      </dd>
                    </div>
                  )}
                  {project.github_url && (
                    <div className="flex justify-between items-center">
                      <dt className="text-text-tertiary">Source</dt>
                      <dd className="text-accent-primary text-xs truncate ml-4 max-w-[150px]">
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <motion.div
          className="fixed inset-0 z-[100] bg-void-950/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightboxImg(null)}
        >
          <motion.img
            src={lightboxImg}
            alt="Gallery preview"
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </PageTransition>
  );
}
