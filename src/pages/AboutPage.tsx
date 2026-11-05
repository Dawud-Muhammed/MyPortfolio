import { Link } from 'react-router-dom';
import { ArrowUpRight, Download, MapPin } from 'lucide-react';
import { useProfile, useSkills, useExperience, useEducation, useCertifications, useAchievements, useSeoSettings } from '../lib/queries';
import { SeoHead } from '../components/SeoHead';
import { CollectionState, PageHeading, SafeMarkdown } from '../components/PublicContent';
import { formatDate, safeUrl } from '../lib/utils';
import type { Skill } from '../lib/types';

export function AboutPage() {
  const { data: profile, loading, error } = useProfile();
  const { data: skills } = useSkills();
  const { data: experience } = useExperience();
  const { data: education } = useEducation();
  const { data: certifications } = useCertifications();
  const { data: achievements } = useAchievements();
  const { data: seoSettings } = useSeoSettings();
  const grouped = skills.reduce<Record<string, Skill[]>>((groups, skill) => { (groups[skill.category || 'Technologies'] ||= []).push(skill); return groups; }, {});
  return <div className="section-container pt-32 pb-24">
    <SeoHead title="About" description={profile?.bio?.slice(0, 160) || 'About Dawud Muhammed, an Ethiopian developer focused on backend and full-stack engineering.'} seoSettings={seoSettings} />
    <div className="grid md:grid-cols-[minmax(0,1fr)_220px] gap-8 md:gap-16 mb-14">
      <div><PageHeading eyebrow="The person behind the systems" title={profile?.name || 'Dawud Muhammed'}>{profile?.title || 'Backend focus. Full-stack perspective.'}</PageHeading>
        <CollectionState loading={loading} error={error} empty={false} name="profile" />
        {profile?.bio && <div className="max-w-[65ch]"><SafeMarkdown>{profile.bio}</SafeMarkdown></div>}
        <div className="flex flex-wrap gap-5 mt-7">{safeUrl(profile?.resume_url) && <a href={safeUrl(profile?.resume_url)} target="_blank" rel="noopener noreferrer" className="studio-button primary inline-flex items-center gap-2 min-h-11 px-5"><Download size={17} /> View résumé</a>}<Link to="/contact" className="inline-flex min-h-11 items-center gap-2 text-accent-primary">Get in touch <ArrowUpRight size={17} /></Link></div>
        {profile?.location && <p className="flex gap-2 items-center text-sm text-text-secondary mt-6"><MapPin size={16} />{profile.location}</p>}
      </div>
      {safeUrl(profile?.profile_picture_url) && <img src={safeUrl(profile?.profile_picture_url)} alt={`Portrait of ${profile?.name || 'Dawud Muhammed'}`} width={440} height={550} className="w-40 md:w-full aspect-[4/5] object-cover rounded-2xl border border-border-subtle md:mt-12" />}
    </div>
    {!!experience.length && <section className="border-t border-border-subtle pt-9 mb-16"><h2 className="text-2xl text-text-primary font-medium mb-8">Experience</h2><div className="space-y-9 max-w-4xl">{experience.map(item => <article key={item.id} className="grid sm:grid-cols-[180px_minmax(0,1fr)] gap-3 sm:gap-8"><p className="text-sm text-text-secondary leading-relaxed">{item.start_date} — {item.is_current ? 'Present' : item.end_date || 'End date not recorded'}</p><div><h3 className="text-xl text-text-primary font-medium">{item.role}</h3><p className="text-accent-primary mt-1 mb-4">{item.company}{item.location ? ` · ${item.location}` : ''}</p><SafeMarkdown>{item.description}</SafeMarkdown></div></article>)}</div></section>}
    {!!education.length && <section className="border-t border-border-subtle pt-9 mb-16"><h2 className="text-2xl text-text-primary font-medium mb-8">Education</h2><div className="grid md:grid-cols-2 gap-8">{education.map(item => <article key={item.id}><p className="text-sm text-text-secondary mb-3">{item.start_date}{item.end_date ? ` — ${item.end_date}` : ''}</p><h3 className="text-xl text-text-primary font-medium mb-2">{item.institution}</h3><p className="text-text-secondary">{item.degree}</p>{item.field && item.field !== item.degree && <p className="text-text-secondary mt-1">{item.field}</p>}</article>)}</div></section>}
    {!!skills.length && <section className="border-t border-border-subtle pt-9 mb-16"><h2 className="text-2xl text-text-primary font-medium mb-8">Tools & technologies</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">{Object.entries(grouped).map(([category, items]) => <div key={category}><h3 className="text-sm text-text-secondary uppercase tracking-wide mb-4">{category}</h3><ul className="flex flex-wrap gap-2">{items.map(skill => <li key={skill.id} className="badge">{skill.name}</li>)}</ul></div>)}</div></section>}
    {!!certifications.length && <section className="border-t border-border-subtle pt-9 mb-16"><h2 className="text-2xl text-text-primary font-medium mb-8">Certifications</h2><div className="grid md:grid-cols-2 gap-8">{certifications.map(item => <article key={item.id}><h3 className="text-xl text-text-primary font-medium mb-2">{item.title}</h3><p className="text-text-secondary">{item.issuer}</p><p className="text-sm text-text-secondary mt-2">{formatDate(item.issue_date)}{item.expiry_date ? ` · Expires ${formatDate(item.expiry_date)}` : ''}</p>{safeUrl(item.verify_url) && <a href={safeUrl(item.verify_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-11 mt-2 text-accent-primary">Verify credential <ArrowUpRight size={15} /></a>}</article>)}</div></section>}
    {!!achievements.length && <section className="border-t border-border-subtle pt-9"><h2 className="text-2xl text-text-primary font-medium mb-8">Achievements</h2><div className="grid md:grid-cols-2 gap-8">{achievements.map(item => <article key={item.id}><h3 className="text-xl text-text-primary font-medium mb-2">{item.title}</h3><p className="text-sm text-text-secondary mb-3">{item.issuer} · {formatDate(item.date)}</p>{item.description && <p className="text-text-secondary leading-relaxed">{item.description}</p>}{safeUrl(item.verify_url) && <a href={safeUrl(item.verify_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-11 mt-2 text-accent-primary">View recognition <ArrowUpRight size={15} /></a>}</article>)}</div></section>}
  </div>;
}
