import { Mail, Phone, MapPin, Download } from 'lucide-react';
import { useProfile, useSkills, useExperience, useEducation, useCertifications, useAchievements, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';

export function AboutPage() {
  const { data: profile } = useProfile();
  const { data: skills } = useSkills();
  const { data: experience } = useExperience();
  const { data: education } = useEducation();
  const { data: certifications } = useCertifications();
  const { data: achievements } = useAchievements();
  const { data: seoSettings } = useSeoSettings();

  const skillsByCategory = (skills || []).reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <SeoHead title="About" description={profile?.bio?.slice(0, 160) || 'About Dawud Muhammed'} seoSettings={seoSettings} />

      <div className="pt-32 pb-20">
        <div className="section-container">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-gutter items-start mb-section"
          >
            {/* Left: Profile picture */}
            {profile?.profile_picture_url && (
              <div className="aspect-square rounded-lg overflow-hidden border border-border-subtle bg-surface-elevated">
                <img src={profile.profile_picture_url} alt={profile.name} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Right: Bio and info */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">ABOUT ME</p>
                <h1 className="text-display-md font-bold text-text-primary mb-4">{profile?.name || 'Dawud Muhammed'}</h1>
                <p className="text-lg text-accent-primary font-medium mb-6">{profile?.title || 'Full-Stack Software Engineer'}</p>
                <p className="text-base text-text-secondary leading-relaxed">{profile?.bio}</p>
              </motion.div>

              {/* Contact info grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3 mb-8"
              >
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors">
                    <Mail size={16} className="text-accent-primary" />
                    {profile.email}
                  </a>
                )}
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors">
                    <Phone size={16} className="text-accent-primary" />
                    {profile.phone}
                  </a>
                )}
                {profile?.location && (
                  <div className="inline-flex items-center gap-2 text-text-secondary text-sm">
                    <MapPin size={16} className="text-accent-primary" />
                    {profile.location}
                  </div>
                )}
              </motion.div>

              {/* Availability indicator */}
              {profile?.availability && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-status-emerald/10 border border-status-emerald/30 mb-8"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-emerald opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-status-emerald" />
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-status-emerald">Available for work</span>
                </motion.div>
              )}

              {/* Resume button */}
              {profile?.resume_url && (
                <motion.a
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  href={profile.resume_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border-subtle bg-text-primary text-void-950 rounded-lg font-semibold uppercase text-xs tracking-[0.12em] hover:bg-text-primary/90 transition-all"
                >
                  <Download size={16} />
                  Download Resume
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* Experience Section */}
          {(experience || []).length > 0 && (
            <section className="mb-section">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
                  CAREER & EDUCATION • PROFESSIONAL TIMELINE
                </p>
                <h2 className="text-display-md font-bold text-text-primary">Work Experience</h2>
              </motion.div>

              <div className="max-w-3xl">
                {(experience || []).map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeInOut',
                      delay: i * 0.05,
                    }}
                    className="relative pl-8 pb-12 last:pb-0 group"
                  >
                    {i < (experience || []).length - 1 && (
                      <div className="absolute left-2.5 top-6 bottom-0 w-px bg-border-subtle group-hover:bg-border-hover transition-colors" />
                    )}
                    <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-surface-elevated border-2 border-accent-primary flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
                    </div>

                    <div className="border border-border-subtle bg-surface-base/50 backdrop-filter backdrop-blur-sm rounded-lg p-6 hover:border-border-hover transition-all">
                      {/* Metadata bar */}
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-mono mb-2">
                        {exp.role} • {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date} • {exp.company}
                      </p>

                      {/* Title */}
                      <h3 className="text-text-primary font-bold text-lg mb-1">{exp.role}</h3>
                      <p className="text-accent-primary text-sm font-medium mb-4">{exp.company}</p>

                      {/* Description */}
                      <p className="text-sm text-text-secondary leading-relaxed">{exp.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Education Section */}
          {(education || []).length > 0 && (
            <section className="mb-section">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
                  ACADEMIC BACKGROUND • CONTINUOUS LEARNING
                </p>
                <h2 className="text-display-md font-bold text-text-primary">Education</h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
                {(education || []).map((edu, i) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeInOut',
                      delay: i * 0.05,
                    }}
                    className="border border-border-subtle bg-surface-base/50 backdrop-filter backdrop-blur-sm rounded-lg p-6 hover:border-border-hover transition-all"
                  >
                    <h3 className="text-text-primary font-bold mb-1">{edu.institution}</h3>
                    <p className="text-accent-primary text-sm font-medium mb-2">{edu.degree}</p>
                    <p className="text-text-secondary text-sm mb-3">{edu.field}</p>
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-text-mono">
                      {edu.start_date} — {edu.end_date || 'Present'}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Skills Matrix */}
          {Object.keys(skillsByCategory).length > 0 && (
            <section className="mb-section">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
                  TECHNICAL EXPERTISE • SYSTEMS & ARCHITECTURE
                </p>
                <h2 className="text-display-md font-bold text-text-primary">Skills & Technologies</h2>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(skillsByCategory).map(([category, items], catIdx) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeInOut',
                      delay: catIdx * 0.05,
                    }}
                    className="border border-border-subtle bg-surface-base/50 backdrop-filter backdrop-blur-sm rounded-lg p-5 hover:border-border-hover hover:shadow-glow-cyan transition-all"
                  >
                    <h3 className="text-text-primary font-bold mb-2">{category}</h3>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-mono mb-4">
                      {category.replace(/\s+/g, '_').toUpperCase()}
                    </p>
                    <div className="space-y-2">
                      {(items as any[]).slice(0, 6).map((skill) => (
                        <div key={skill.id} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-status-emerald" />
                          <span className="text-xs text-text-secondary">{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {(certifications || []).length > 0 && (
            <section className="mb-section">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
                  CREDENTIALS • PROFESSIONAL CERTIFICATIONS
                </p>
                <h2 className="text-display-md font-bold text-text-primary">Certifications</h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {(certifications || []).map((cert, i) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeInOut',
                      delay: i * 0.05,
                    }}
                    className="border border-border-subtle bg-surface-base/50 backdrop-filter backdrop-blur-sm rounded-lg p-6 hover:border-border-hover transition-all"
                  >
                    <h3 className="text-text-primary font-bold mb-1">{cert.title}</h3>
                    <p className="text-accent-primary text-sm font-medium mb-2">{cert.issuer}</p>
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-text-mono mb-3">
                      {cert.issue_date}{cert.expiry_date ? ` — ${cert.expiry_date}` : ''}
                    </p>
                    {cert.verify_url && (
                      <a href={cert.verify_url} target="_blank" rel="noopener noreferrer" className="text-accent-primary text-xs font-medium hover:underline">
                        Verify credential →
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Achievements */}
          {(achievements || []).length > 0 && (
            <section>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-16"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-secondary mb-2">
                  RECOGNITION • ACHIEVEMENTS & AWARDS
                </p>
                <h2 className="text-display-md font-bold text-text-primary">Achievements & Awards</h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {(achievements || []).map((ach, i) => (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeInOut',
                      delay: i * 0.05,
                    }}
                    className="border border-border-subtle bg-surface-base/50 backdrop-filter backdrop-blur-sm rounded-lg p-6 hover:border-border-hover transition-all"
                  >
                    {ach.image_url && (
                      <img src={ach.image_url} alt={ach.title} className="h-12 w-12 rounded-lg object-cover mb-4" />
                    )}
                    <h3 className="text-text-primary font-bold mb-1">{ach.title}</h3>
                    <p className="text-accent-primary text-sm font-medium mb-2">{ach.issuer}</p>
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-text-mono mb-3">{ach.date}</p>
                    {ach.description && <p className="text-text-secondary text-sm leading-relaxed">{ach.description}</p>}
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
