import { Mail, Phone, MapPin, Download } from 'lucide-react';
import { useProfile, useSkills, useExperience, useEducation, useCertifications, useAchievements, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/PageTransition';
import { MagneticButton } from '../components/MagneticButton';

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
    <PageTransition>
      <SeoHead title="About" description={profile?.bio?.slice(0, 160) || 'About Dawud Muhammed'} seoSettings={seoSettings} />

      <div className="pt-32 pb-24">
        <div className="section-container">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-full mb-section"
          >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-8 w-full"
              >
                <p className="label-mono-accent mb-3">About Me</p>
                <h1 className="text-display-md font-bold text-text-primary mb-4">{profile?.name || 'Dawud Muhammed'}</h1>
                <p className="text-lg text-accent-primary font-medium mb-6">{profile?.title || 'Full-Stack Software Engineer'}</p>
                <p className="text-body-base sm:text-body-lg text-text-secondary leading-relaxed w-full max-w-none whitespace-pre-line">{profile?.bio}</p>
              </motion.div>

              {/* Contact info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8"
              >
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-text-secondary hover:text-text-primary text-sm transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-accent-primary/5 border border-accent-primary/15 flex items-center justify-center group-hover:border-accent-primary/30 transition-colors">
                      <Mail size={14} className="text-accent-primary" />
                    </div>
                    {profile.email}
                  </a>
                )}
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-text-secondary hover:text-text-primary text-sm transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-accent-primary/5 border border-accent-primary/15 flex items-center justify-center group-hover:border-accent-primary/30 transition-colors">
                      <Phone size={14} className="text-accent-primary" />
                    </div>
                    {profile.phone}
                  </a>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-3 text-text-secondary text-sm">
                    <div className="h-8 w-8 rounded-lg bg-accent-primary/5 border border-accent-primary/15 flex items-center justify-center">
                      <MapPin size={14} className="text-accent-primary" />
                    </div>
                    {profile.location}
                  </div>
                )}
              </motion.div>

              {/* Availability & Resume Actions */}
              <div className="flex flex-wrap items-center gap-4">
                {profile?.availability && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-status-emerald/8 border border-status-emerald/20"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-emerald opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-status-emerald" />
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-status-emerald">Available for work</span>
                  </motion.div>
                )}

                {profile?.resume_url && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <MagneticButton href={profile.resume_url} variant="primary">
                      <Download size={14} /> Download Resume
                    </MagneticButton>
                  </motion.div>
                )}
              </div>
          </motion.div>

          {/* Experience */}
          {(experience || []).length > 0 && (
            <section className="mb-section">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <p className="label-mono-accent mb-3">Career Timeline</p>
                <h2 className="heading-section text-text-primary">Work Experience</h2>
              </motion.div>

              <div className="max-w-3xl">
                {(experience || []).map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="relative pl-8 pb-12 last:pb-0 group"
                  >
                    {i < (experience || []).length - 1 && (
                      <div className="absolute left-[9px] top-6 bottom-0 w-px bg-border-subtle group-hover:bg-accent-primary/20 transition-colors duration-500" />
                    )}
                    <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-surface-elevated border-2 border-accent-primary/60 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
                    </div>

                    <div className="surface-card rounded-xl p-6 hover:shadow-glow-cyan/5 transition-all duration-500">
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono mb-3">
                        {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                      </p>
                      <h3 className="text-text-primary font-bold text-lg mb-1">{exp.role}</h3>
                      <p className="text-accent-primary text-sm font-medium mb-4">{exp.company}</p>
                      <p className="text-sm text-text-secondary leading-relaxed">{exp.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {(education || []).length > 0 && (
            <section className="mb-section">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <p className="label-mono-accent mb-3">Academic Background</p>
                <h2 className="heading-section text-text-primary">Education</h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
                {(education || []).map((edu, i) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="surface-card rounded-xl p-6"
                  >
                    <h3 className="text-text-primary font-bold mb-1">{edu.institution}</h3>
                    <p className="text-accent-primary text-sm font-medium mb-2">{edu.degree}</p>
                    <p className="text-text-secondary text-sm mb-3">{edu.field}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono">
                      {edu.start_date} — {edu.end_date || 'Present'}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {Object.keys(skillsByCategory).length > 0 && (
            <section className="mb-section">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <p className="label-mono-accent mb-3">Technical Expertise</p>
                <h2 className="heading-section text-text-primary">Skills & Technologies</h2>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(skillsByCategory).map(([category, items], catIdx) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIdx * 0.05, duration: 0.5 }}
                    className="surface-card rounded-xl p-5"
                  >
                    <h3 className="text-text-primary font-bold mb-1 text-sm">{category}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono mb-4">
                      {category.replace(/\s+/g, '_').toUpperCase()}
                    </p>
                    <div className="space-y-2.5">
                      {(items as any[]).slice(0, 6).map((skill) => (
                        <div key={skill.id} className="flex items-center gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-status-emerald flex-shrink-0" />
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
                className="mb-12"
              >
                <p className="label-mono-accent mb-3">Credentials</p>
                <h2 className="heading-section text-text-primary">Certifications</h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {(certifications || []).map((cert, i) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="surface-card rounded-xl p-6"
                  >
                    <h3 className="text-text-primary font-bold mb-1">{cert.title}</h3>
                    <p className="text-accent-primary text-sm font-medium mb-2">{cert.issuer}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono mb-3">
                      {cert.issue_date}{cert.expiry_date ? ` — ${cert.expiry_date}` : ''}
                    </p>
                    {cert.verify_url && (
                      <a href={cert.verify_url} target="_blank" rel="noopener noreferrer" className="text-accent-primary text-xs font-medium hover:underline inline-flex items-center gap-1">
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
                className="mb-12"
              >
                <p className="label-mono-accent mb-3">Recognition</p>
                <h2 className="heading-section text-text-primary">Achievements & Awards</h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {(achievements || []).map((ach, i) => (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="surface-card rounded-xl p-6"
                  >
                    {ach.image_url && (
                      <img src={ach.image_url} alt={ach.title} className="h-12 w-12 rounded-lg object-cover mb-4" loading="lazy" />
                    )}
                    <h3 className="text-text-primary font-bold mb-1">{ach.title}</h3>
                    <p className="text-accent-primary text-sm font-medium mb-2">{ach.issuer}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-mono mb-3">{ach.date}</p>
                    {ach.description && <p className="text-text-secondary text-sm leading-relaxed">{ach.description}</p>}
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
