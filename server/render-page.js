// Request-time, anonymous rendering keeps social previews and no-JS visitors in
// step with publication. No CDN/content cache and no service-role credentials.
import { sortBlogPosts } from '../src/lib/blog-order.mjs';
export const PUBLIC_ROUTES = ['/', '/about', '/projects', '/services', '/blog', '/gallery', '/contact'];
const labels = ['Home', 'About', 'Projects', 'Services', 'Blog', 'Gallery', 'Contact'];
const fallbackOrigin = 'https://dawud-muhammed.vercel.app';
export function escapeHtml(value = '') { return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
export function siteOrigin(value) { try { const url = new URL(value); return url.protocol === 'https:' || url.hostname === 'localhost' ? url.origin : fallbackOrigin; } catch { return fallbackOrigin; } }
function url(value) { if (!value) return ''; const text = String(value).trim(); if (/^\/(?!\/)/.test(text) && !text.includes('\\')) return text; try { const parsed = new URL(text); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : ''; } catch { return ''; } }
function link(href, label) { const safe = url(href); return safe ? `<a href="${escapeHtml(safe)}">${escapeHtml(label)}</a>` : ''; }
function text(value) { return String(value || '').replace(/\[cite:\s*[\d,\s]+\]/gi, '').replace(/^#{1,6}\s+/gm, '').trim(); }
function paragraphs(value) { return text(value).split(/\n\s*\n/).filter(Boolean).map(part => `<p>${escapeHtml(part)}</p>`).join(''); }
function image(src, alt) { return url(src) ? `<img src="${escapeHtml(url(src))}" alt="${escapeHtml(alt)}" width="960" height="600" loading="lazy" style="max-width:100%;height:auto"/>` : ''; }
function date(value) { if (!value) return ''; const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? escapeHtml(value) : `<time datetime="${escapeHtml(value)}">${escapeHtml(parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }))}</time>`; }
function projectCards(rows) { return rows.map(project => `<article>${image(project.cover_image_url, project.title)}<h2>${link(`/projects/${encodeURIComponent(project.slug)}`, project.title)}</h2>${paragraphs(project.excerpt)}<p>Status: ${escapeHtml(project.status)}</p></article>`).join('') || '<p>No published projects yet.</p>'; }
function publicationDate(value) { return value ? date(value) : '<span>Publication date not recorded</span>'; }
function articleCards(rows) {
  const [latest, ...others] = sortBlogPosts(rows);
  if (!latest) return '<p>No published articles yet.</p>';
  const path = `/blog/${encodeURIComponent(latest.slug)}`;
  const cover = url(latest.cover_image_url);
  const feature = `<article class="blog-feature">${cover ? `<a href="${escapeHtml(path)}" tabindex="-1" aria-hidden="true"><img src="${escapeHtml(cover)}" alt="" width="1600" height="900" loading="eager" fetchpriority="high" style="display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover"/></a>` : ''}<p>${latest.published_at ? 'Latest note' : 'Featured note'}</p><h2>${link(path, latest.title)}</h2>${publicationDate(latest.published_at)}${paragraphs(latest.excerpt)}${link(path, 'Read article')}</article>`;
  return feature + others.map(post => `<article><h2>${link(`/blog/${encodeURIComponent(post.slug)}`, post.title)}</h2>${publicationDate(post.published_at)}${paragraphs(post.excerpt)}</article>`).join('');
}

export async function publicRows(db, table, columns, filters = {}, order = 'order_index', ascending = true) {
  if (!db) throw new Error('Public content is not configured.');
  let query = db.from(table).select(columns);
  const publication = table === 'projects' ? ['publication_status', 'published'] : table === 'blog_posts' ? ['status', 'Published'] : ['is_published', true];
  query = query.eq(...publication);
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  query = query.order(order, { ascending, ...(table === 'blog_posts' && order === 'published_at' ? { nullsFirst: false } : {}) });
  if (table === 'blog_posts' && order === 'published_at') query = query.order('created_at', { ascending: false, nullsFirst: false }).order('id', { ascending: false });
  const { data, error } = await query.limit(500);
  if (error) throw new Error('Published content could not be loaded.');
  return data || [];
}

// Match the browser/CMS singleton contract without changing collection ordering.
export async function publicSingleton(db, table, columns) {
  if (!db) throw new Error('Public content is not configured.');
  const { data, error } = await db.from(table).select(columns)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1);
  if (error) throw new Error('Published content could not be loaded.');
  return data?.[0] || null;
}

export async function renderResponse({ path = '/', db, template, origin: configuredOrigin }) {
  const origin = siteOrigin(configuredOrigin);
  path = String(path).split('?')[0].replace(/\/+$/, '') || '/';
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) path = '/invalid';
  if (path === '/robots.txt') return { status: 200, type: 'text/plain; charset=utf-8', body: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n` };
  if (path === '/sitemap.xml') {
    try {
      const [projects, posts] = await Promise.all([publicRows(db, 'projects', 'slug,updated_at'), publicRows(db, 'blog_posts', 'slug,updated_at', {}, 'published_at', false)]);
      const paths = [...PUBLIC_ROUTES, ...projects.map(row => `/projects/${encodeURIComponent(row.slug)}`), ...posts.map(row => `/blog/${encodeURIComponent(row.slug)}`)];
      return { status: 200, type: 'application/xml; charset=utf-8', body: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(item => `<url><loc>${escapeHtml(origin + item)}</loc></url>`).join('')}</urlset>` };
    } catch { return { status: 503, type: 'text/plain; charset=utf-8', body: 'Published sitemap is temporarily unavailable.' }; }
  }
  const projectSlug = /^\/projects\/([^/]+)$/.exec(path)?.[1];
  const articleSlug = /^\/blog\/([^/]+)$/.exec(path)?.[1];
  let title = 'Page not found', description = 'This page could not be found.', body = '<p>This page may have moved or is no longer published.</p>', status = 404, imageUrl = '', seo = {}, profile = {}, navigation = [];
  if (PUBLIC_ROUTES.includes(path) || projectSlug || articleSlug) {
    try {
      const [publishedProfile, publishedSeo, nav] = await Promise.all([
        publicSingleton(db, 'profile', 'name,title,tagline,bio,email,phone,location,resume_url,profile_picture_url'),
        publicSingleton(db, 'seo_settings', 'site_title_template,meta_description,og_image_url,gsc_verification'),
        publicRows(db, 'navigation_items', 'label,target,location,is_visible,order_index', { is_visible: true }),
      ]);
      profile = publishedProfile || {}; seo = publishedSeo || {}; navigation = nav.filter(item => item.location === 'navbar');
      imageUrl = seo.og_image_url || ''; status = 200;
      if (path === '/') {
        const [hero, projects] = await Promise.all([publicSingleton(db, 'hero_content', 'subheadline,availability_status,availability_label'), publicRows(db, 'projects', 'title,slug,excerpt,status,cover_image_url', { is_featured: true })]);
        title = profile.name || 'Dawud Muhammed'; description = hero?.subheadline || profile.tagline || 'Ethiopian developer with a backend focus and full-stack experience.';
        body = `<p>${escapeHtml(profile.title || 'Backend focus. Full-stack perspective.')}</p>${paragraphs(description)}<p>${link('/projects', 'View Selected Work')} · ${link('/contact', 'Contact Me')}</p>${hero?.availability_status ? paragraphs(hero.availability_label) : ''}${projects.length ? `<section><h2>Selected work</h2>${projectCards(projects.slice(0, 3))}</section>` : ''}`;
      } else if (path === '/about') {
        title = 'About'; description = text(profile.bio).slice(0, 160) || 'About Dawud Muhammed.';
        const collections = await Promise.all([
          publicRows(db, 'experience', 'role,company,start_date,end_date,is_current,description', {}, 'start_date', false),
          publicRows(db, 'education', 'institution,degree,field,start_date,end_date', {}, 'start_date', false),
          publicRows(db, 'skills', 'name,category'),
          publicRows(db, 'certifications', 'title,issuer,verify_url,issue_date', {}, 'issue_date', false),
          publicRows(db, 'achievements', 'title,issuer,description,verify_url,date', {}, 'date', false),
        ]);
        body = `${image(profile.profile_picture_url, `Portrait of ${profile.name || 'Dawud Muhammed'}`)}${paragraphs(profile.bio)}${link(profile.resume_url, 'View résumé')}`;
        const [experience, education, skills, certifications, achievements] = collections;
        if (experience.length) body += `<section><h2>Experience</h2>${experience.map(row => `<article><h3>${escapeHtml(row.role)} · ${escapeHtml(row.company)}</h3><p>${escapeHtml(row.start_date)} — ${escapeHtml(row.is_current ? 'Present' : row.end_date)}</p>${paragraphs(row.description)}</article>`).join('')}</section>`;
        if (education.length) body += `<section><h2>Education</h2>${education.map(row => `<article><h3>${escapeHtml(row.institution)}</h3><p>${escapeHtml(row.degree)} · ${escapeHtml(row.field)}</p><p>${escapeHtml(row.start_date)} — ${escapeHtml(row.end_date)}</p></article>`).join('')}</section>`;
        if (skills.length) body += `<section><h2>Tools & technologies</h2><ul>${skills.map(row => `<li>${escapeHtml(row.name)}</li>`).join('')}</ul></section>`;
        if (certifications.length) body += `<section><h2>Certifications</h2>${certifications.map(row => `<article><h3>${escapeHtml(row.title)}</h3><p>${escapeHtml(row.issuer)} · ${date(row.issue_date)}</p>${link(row.verify_url, 'Verify credential')}</article>`).join('')}</section>`;
        if (achievements.length) body += `<section><h2>Achievements</h2>${achievements.map(row => `<article><h3>${escapeHtml(row.title)}</h3><p>${escapeHtml(row.issuer)} · ${date(row.date)}</p>${paragraphs(row.description)}${link(row.verify_url, 'View recognition')}</article>`).join('')}</section>`;
      } else if (path === '/projects') {
        title = 'Projects'; description = 'Selected engineering work by Dawud Muhammed.'; body = projectCards(await publicRows(db, 'projects', 'title,slug,excerpt,status,cover_image_url'));
      } else if (projectSlug) {
        const rows = await publicRows(db, 'projects', 'title,slug,excerpt,description,status,cover_image_url,demo_url,github_url,video_demo_url,problem,intended_users,role,team_contribution,decisions,implementation,challenges,evidence,outcomes,seo_title,seo_description', { slug: decodeURIComponent(projectSlug) });
        const project = rows[0];
        if (!project) { status = 404; title = 'Project not found'; description = 'This project is not currently published.'; body = '<p>This project may be unpublished or the address may have changed.</p>'; }
        else {
          title = project.seo_title || project.title; description = project.seo_description || project.excerpt || text(project.description).slice(0, 160); imageUrl = project.cover_image_url || imageUrl;
          body = `${paragraphs(project.excerpt)}<p>Status: ${escapeHtml(project.status)}</p><p>${link(project.demo_url, 'Visit demo')} ${link(project.github_url, 'Source code')} ${link(project.video_demo_url, 'Video walkthrough')}</p>${image(project.cover_image_url, project.title)}<section><h2>Project overview</h2>${paragraphs(project.description)}</section>`;
          for (const [key, label] of Object.entries({ problem: 'The problem', intended_users: 'Who it is for', role: 'My role', team_contribution: 'Team contribution', decisions: 'Key decisions', implementation: 'Implementation', challenges: 'Challenges', evidence: 'Evidence', outcomes: 'Outcomes & next steps' })) if (project[key]) body += `<section><h2>${label}</h2>${paragraphs(project[key])}</section>`;
        }
      } else if (path === '/blog') {
        title = 'Blog'; description = 'Notes from Dawud Muhammed on building software and solving problems.'; body = articleCards(await publicRows(db, 'blog_posts', 'id,title,slug,excerpt,published_at,created_at,cover_image_url', {}, 'published_at', false));
      } else if (articleSlug) {
        const rows = await publicRows(db, 'blog_posts', 'title,slug,excerpt,content,published_at,seo_title,seo_description,cover_image_url,og_image_url', { slug: decodeURIComponent(articleSlug) }, 'published_at', false);
        const post = rows[0];
        if (!post) { status = 404; title = 'Article not found'; description = 'This article is not currently published.'; body = '<p>This article may be unpublished or the address may have changed.</p>'; }
        else { title = post.seo_title || post.title; description = post.seo_description || post.excerpt; imageUrl = post.og_image_url || post.cover_image_url || imageUrl; body = `${publicationDate(post.published_at)}${paragraphs(post.excerpt)}${image(post.cover_image_url, post.title)}${paragraphs(post.content.replace(/^#\s+[^\n]+\n/, ''))}`; }
      } else if (path === '/services') {
        title = 'Services'; description = 'Development services, deliverables, and project evidence from Dawud Muhammed.';
        const [services, projects] = await Promise.all([publicRows(db, 'services', 'title,description,included_items,evidence_project_ids'), publicRows(db, 'projects', 'id,title,slug')]);
        body = services.map(service => `<article><h2>${escapeHtml(service.title)}</h2>${paragraphs(service.description)}<ul>${(service.included_items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>${projects.filter(project => service.evidence_project_ids?.includes(project.id)).map(project => link(`/projects/${encodeURIComponent(project.slug)}`, project.title)).join(' ')}</article>`).join('') + link('/contact', 'Discuss your project');
      } else if (path === '/gallery') {
        title = 'Gallery'; description = 'A visual record of Dawud Muhammed’s projects, events, and moments.';
        body = (await publicRows(db, 'gallery_items', 'image_url,caption,alt_text,related_url')).map(item => `<figure>${image(item.image_url, item.alt_text || item.caption)}<figcaption>${escapeHtml(item.caption)} ${link(item.related_url, 'Related work')}</figcaption></figure>`).join('');
      } else if (path === '/contact') {
        title = 'Contact'; description = 'Contact Dawud Muhammed about development projects and collaboration.';
        body = '<p>Tell me about your project, the problem you’re solving, and where you could use a hand.</p>';
        if (profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) body += `<p><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a></p>`;
        if (profile.phone) body += `<p><a href="tel:${escapeHtml(profile.phone.replace(/[^+\d]/g, ''))}">${escapeHtml(profile.phone)}</a></p>`;
        body += paragraphs(profile.location);
      }
    } catch { status = 503; title = 'Content temporarily unavailable'; description = 'The portfolio content service is temporarily unavailable. Please try again shortly.'; body = `<p>${description}</p><p>${link('/contact', 'Contact Dawud')}</p>`; }
  }
  const fullTitle = seo.site_title_template?.includes('%s') ? seo.site_title_template.replace('%s', title) : `${title} | Dawud Muhammed`;
  const canonical = new URL(path, origin).href;
  const verification = typeof seo.gsc_verification === 'string' ? seo.gsc_verification.trim() : '';
  const structured = status === 200 ? { '@context': 'https://schema.org', '@type': path === '/' || path === '/about' ? 'ProfilePage' : articleSlug ? 'Article' : 'WebPage', name: title, description, url: canonical, ...(path === '/' || path === '/about' ? { mainEntity: { '@type': 'Person', name: profile.name || 'Dawud Muhammed', url: origin } } : {}) } : null;
  const meta = `<title>${escapeHtml(fullTitle)}</title><meta name="description" content="${escapeHtml(description)}"/><link rel="canonical" href="${escapeHtml(canonical)}"/><meta name="robots" content="${status === 200 ? 'index,follow' : 'noindex,nofollow'}"/><meta property="og:title" content="${escapeHtml(fullTitle)}"/><meta property="og:description" content="${escapeHtml(description)}"/><meta property="og:url" content="${escapeHtml(canonical)}"/><meta property="og:type" content="${articleSlug && status === 200 ? 'article' : 'website'}"/><meta name="twitter:card" content="${url(imageUrl) ? 'summary_large_image' : 'summary'}"/><meta name="twitter:title" content="${escapeHtml(fullTitle)}"/><meta name="twitter:description" content="${escapeHtml(description)}"/>${url(imageUrl) ? `<meta property="og:image" content="${escapeHtml(url(imageUrl))}"/><meta name="twitter:image" content="${escapeHtml(url(imageUrl))}"/>` : ''}${structured ? `<script type="application/ld+json">${JSON.stringify(structured).replace(/</g, '\\u003c')}</script>` : ''}`;
  const nav = PUBLIC_ROUTES.map((route, index) => { const configured = navigation.find(item => item.target === route); return link(route, configured?.label || labels[index]); }).join(' ');
  const content = `<div class="section-container" style="padding-top:2rem;padding-bottom:4rem"><nav aria-label="Main navigation" style="display:flex;flex-wrap:wrap;gap:1.25rem">${nav}</nav><main id="main-content" style="padding-top:4rem;max-width:70rem"><h1>${escapeHtml(title)}</h1>${body}</main></div>`;
  const shell = (template || '<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body><div id="root"></div></body></html>')
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*(?:name|property)=["'](?:description|robots|google-site-verification|og:[^"']*|twitter:[^"']*)["'][^>]*>/gi, '')
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, '')
    .replace('</head>', `${meta}${verification ? `<meta name="google-site-verification" content="${escapeHtml(verification)}"/>` : ''}</head>`)
    .replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${content}</div>`);
  return { status, type: 'text/html; charset=utf-8', body: shell };
}
