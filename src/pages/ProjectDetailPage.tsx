import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Play } from 'lucide-react';
import { useProjectBySlug, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, loading } = useProjectBySlug(slug || '');
  const { data: seoSettings } = useSeoSettings();

  if (loading) {
    return (
      <div className="pt-32 pb-20">
        <div className="section-container">
          <div className="aspect-video rounded-3xl shimmer mb-8" />
          <div className="h-10 w-2/3 shimmer rounded-lg mb-4" />
          <div className="h-6 w-full shimmer rounded-lg mb-2" />
          <div className="h-6 w-3/4 shimmer rounded-lg" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-32 pb-20 text-center">
        <div className="section-container">
          <h1 className="text-3xl font-bold text-foreground mb-4">Project not found</h1>
          <Link to="/projects" className="btn-primary">
            <ArrowLeft size={16} /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={project.seo_title || project.title}
        description={project.seo_description || project.excerpt || project.description}
        image={project.cover_image_url || undefined}
        seoSettings={seoSettings}
      />

      <div className="pt-28 pb-20">
        <div className="section-container">
          {/* Back link */}
          <Link to="/projects" className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground text-sm mb-8 group">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {project.category && (
                <span className="badge" style={{ color: project.category.color, borderColor: project.category.color + '40' }}>
                  {project.category.name}
                </span>
              )}
              <span className={`badge ${project.status === 'Live' ? '!bg-success-500/20 !text-success-400 !border-success-500/30' : '!bg-warning-500/20 !text-warning-400 !border-warning-500/30'}`}>
                {project.status}
              </span>
              <span className="badge">{project.difficulty}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{project.title}</h1>
            <p className="text-lg text-foreground/60 max-w-3xl">{project.excerpt || project.description}</p>
          </motion.div>

          {/* Cover image */}
          {project.cover_image_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-video rounded-3xl overflow-hidden mb-8 glass"
            >
              <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover" />
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-12">
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn-primary group">
                <ExternalLink size={16} />
                Live Demo
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-ghost !text-foreground !border-foreground/20 hover:!bg-foreground/10">
                <Github size={16} />
                Source Code
              </a>
            )}
            {project.video_demo_url && (
              <a href={project.video_demo_url} target="_blank" rel="noopener noreferrer" className="btn-ghost !text-foreground !border-foreground/20 hover:!bg-foreground/10">
                <Play size={16} />
                Video Demo
              </a>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Description */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-foreground mb-4">About this project</h2>
              <div className="prose-content text-foreground/70">
                {project.description.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {project.gallery.map((img, i) => (
                      <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden glass">
                        <img src={img} alt={`${project.title} screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="glass rounded-2xl p-6 sticky top-24">
                <h3 className="text-foreground font-semibold mb-4">Technologies</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {(project.technologies || []).map((tech) => (
                    <span key={tech.id} className="badge">
                      {tech.name}
                    </span>
                  ))}
                </div>

                <h3 className="text-foreground font-semibold mb-4">Project Info</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-foreground/40">Status</dt>
                    <dd className="text-foreground/80">{project.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-foreground/40">Difficulty</dt>
                    <dd className="text-foreground/80">{project.difficulty}</dd>
                  </div>
                  {project.category && (
                    <div className="flex justify-between">
                      <dt className="text-foreground/40">Category</dt>
                      <dd className="text-foreground/80">{project.category.name}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
