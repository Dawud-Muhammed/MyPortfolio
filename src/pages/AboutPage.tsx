import { Mail, Phone, MapPin, Calendar, Download, Award, GraduationCap, Briefcase, Star } from 'lucide-react';
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
      <SeoHead title="About" description={profile?.bio?.slice(0, 160) || 'About Alex Rivera'} seoSettings={seoSettings} />

      <div className="pt-32 pb-20">
        <div className="section-container">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-12 items-start mb-20"
          >
            <div className="lg:col-span-1">
              {profile?.profile_picture_url && (
                <div className="aspect-square rounded-3xl overflow-hidden glass">
                  <img src={profile.profile_picture_url} alt={profile.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="lg:col-span-2">
              <p className="text-accent-400 font-mono text-sm tracking-widest mb-2 uppercase">About Me</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{profile?.name || 'Alex Rivera'}</h1>
              <p className="text-xl text-accent-400 font-medium mb-6">{profile?.title || 'Full-Stack Software Engineer'}</p>
              <p className="text-foreground/60 text-lg leading-relaxed mb-6">{profile?.bio}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground text-sm">
                    <Mail size={16} className="text-accent-400" />
                    {profile.email}
                  </a>
                )}
                {profile?.phone && (
                  <span className="inline-flex items-center gap-2 text-foreground/60 text-sm">
                    <Phone size={16} className="text-accent-400" />
                    {profile.phone}
                  </span>
                )}
                {profile?.location && (
                  <span className="inline-flex items-center gap-2 text-foreground/60 text-sm">
                    <MapPin size={16} className="text-accent-400" />
                    {profile.location}
                  </span>
                )}
              </div>

              {profile?.availability && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
                  </span>
                  <span className="text-foreground/80 text-sm font-medium">Available for work</span>
                </div>
              )}

              <div>
                <button className="btn-primary">
                  <Download size={16} />
                  Download Resume
                </button>
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Skills & Expertise</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(skillsByCategory).map(([category, items], catIdx) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIdx * 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent-400" />
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {items.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                        <span className="text-sm text-foreground/70">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
              <Briefcase size={28} className="text-accent-400" />
              Work Experience
            </h2>
            <div className="max-w-3xl mx-auto">
              {(experience || []).map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-8 pb-12 last:pb-0"
                >
                  {i < (experience || []).length - 1 && (
                    <div className="absolute left-2.5 top-2 bottom-0 w-px bg-foreground/10" />
                  )}
                  <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-accent-500/20 border-2 border-accent-400 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                  </div>
                  <div className="glass rounded-2xl p-5 card-hover">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-foreground font-bold text-lg">{exp.role}</h3>
                        <p className="text-accent-400 text-sm font-medium">{exp.company}</p>
                      </div>
                      <span className="text-xs text-foreground/40 flex items-center gap-1">
                        <Calendar size={12} />
                        {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/50 mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Education */}
          {(education || []).length > 0 && (
            <section className="mb-20">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
                <GraduationCap size={28} className="text-accent-400" />
                Education
              </h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {(education || []).map((edu, i) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-2xl p-6 card-hover"
                  >
                    <h3 className="text-foreground font-bold mb-1">{edu.institution}</h3>
                    <p className="text-accent-400 text-sm font-medium mb-2">{edu.degree}</p>
                    <p className="text-foreground/40 text-sm">{edu.field}</p>
                    <p className="text-foreground/30 text-xs mt-2">{edu.start_date} — {edu.end_date || 'Present'}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {(certifications || []).length > 0 && (
            <section className="mb-20">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
                <Award size={28} className="text-accent-400" />
                Certifications
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {(certifications || []).map((cert, i) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-2xl p-6 card-hover"
                  >
                    <h3 className="text-foreground font-bold mb-1">{cert.title}</h3>
                    <p className="text-accent-400 text-sm font-medium mb-2">{cert.issuer}</p>
                    <p className="text-foreground/40 text-xs">{cert.issue_date}{cert.expiry_date ? ` — ${cert.expiry_date}` : ''}</p>
                    {cert.verify_url && (
                      <a href={cert.verify_url} target="_blank" rel="noopener noreferrer" className="text-accent-400 text-xs mt-2 inline-block hover:underline">
                        Verify credential
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Achievements */}
          {(achievements || []).length > 0 && (
            <section className="mb-20">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
                <Star size={28} className="text-accent-400" />
                Achievements & Awards
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {(achievements || []).map((ach, i) => (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-2xl p-6 card-hover"
                  >
                    {ach.image_url && (
                      <img src={ach.image_url} alt={ach.title} className="h-12 w-12 rounded-xl object-cover mb-3" />
                    )}
                    <h3 className="text-foreground font-bold mb-1">{ach.title}</h3>
                    <p className="text-accent-400 text-sm font-medium mb-2">{ach.issuer}</p>
                    <p className="text-foreground/40 text-xs mb-2">{ach.date}</p>
                    {ach.description && <p className="text-foreground/50 text-sm leading-relaxed">{ach.description}</p>}
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
