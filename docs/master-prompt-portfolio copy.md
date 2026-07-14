You are an elite full-stack software engineer, product architect, and UI/UX designer operating as a one-person award-winning digital agency. You are building a complete, production-ready, full-stack developer portfolio platform. This is not a template — it is a bespoke, cinematic, premium web application that must feel like it was designed by a top-tier studio (the caliber of Apple, Stripe, Linear, Framer, or Vercel) and shipped by a senior engineering team. Every pixel, every transition, every millisecond of loading time matters. Do not cut corners, do not use generic Bootstrap-style components, and do not leave any placeholder "Lorem Ipsum" content — use realistic, developer-relevant sample content everywhere so the site looks fully alive on first load.

Build this as a single cohesive application containing (1) a public-facing marketing/portfolio site and (2) a fully authenticated admin dashboard that controls 100% of the public site's content — nothing on the public site should ever be hardcoded. If content can be seen by a visitor, it must be editable by the admin.

====================================================================
1. TECH STACK & ARCHITECTURE
====================================================================

- Framework: Next.js 14+ (App Router, Server Components, Server Actions, TypeScript strict mode).
- Styling: Tailwind CSS with a fully custom design token theme (see Design System below) + shadcn/ui components restyled to match the custom theme (do not ship default shadcn styling — reskin every primitive).
- Animation: Framer Motion for component/page transitions and scroll-triggered reveals, plus GSAP for complex timeline-based hero animations where finer control is needed. Use Lenis (or an equivalent) for buttery smooth inertial scrolling site-wide.
- Icons: lucide-react exclusively — consistent stroke width across the app.
- Database & Backend: Supabase (PostgreSQL + Row Level Security + Auth + Storage). Use Supabase Auth for the admin login (email/password, single admin role — no public sign-up flow). Use Supabase Storage buckets for all media (hero videos, hero images, profile picture, project galleries, blog cover images, resume PDF, testimonial avatars, gallery/achievement images).
- Forms & Validation: react-hook-form + zod schemas shared between client and server for every form, public and admin.
- Rich Text: Tiptap editor for the blog admin, exporting clean HTML/Markdown, with a code block extension that supports syntax highlighting language selection.
- Drag & Drop: dnd-kit for reordering projects, gallery images, timeline entries, skills, and navigation menu items in the admin.
- Email: Resend (or Nodemailer as fallback) to deliver contact form submissions to the admin's inbox and to send an auto-reply confirmation to the visitor.
- Charts (Admin Analytics): Recharts, restyled to match the dark theme.
- Deployment target: Vercel. The project must build and deploy with zero manual configuration beyond pasting environment variables (Supabase URL/keys, Resend API key, site URL). Include a `.env.example` file listing every required variable with comments.
- Code quality: TypeScript everywhere, ESLint + Prettier configured, componentized architecture (no 1000-line files), shared `lib/` utilities, typed Supabase client with generated types, and a clean `/app`, `/components`, `/lib`, `/types`, `/hooks` folder structure.

====================================================================
2. GLOBAL DESIGN SYSTEM
====================================================================

The entire site is DARK MODE BY DEFAULT. Do not build a light/dark toggle unless it can be executed at the same premium quality bar — if included, it must be a secondary priority, off by default.

Color Tokens (define as CSS variables / Tailwind theme extension):
- `--bg-base`: #05050A (near-black with a cold blue-violet undertone, never pure #000)
- `--bg-surface`: #0B0B14 (cards, panels)
- `--bg-elevated`: #12121D (modals, dropdowns)
- `--border-subtle`: rgba(255,255,255,0.08)
- `--border-hover`: rgba(255,255,255,0.16)
- `--text-primary`: #F5F5F7
- `--text-secondary`: #A1A1AA
- `--text-muted`: #6B6B78
- `--accent-start`: #6366F1 (indigo)
- `--accent-mid`: #8B5CF6 (violet)
- `--accent-end`: #EC4899 (pink) — combine into a signature 135deg gradient used sparingly and consistently for CTAs, active states, key headlines, and the aurora background
- `--success`: #34D399, `--warning`: #FBBF24, `--danger`: #F87171 (used only in the admin dashboard for statuses/toasts)

Typography:
- Display/headline font: "Clash Display" (or "Cabinet Grotesk" as an alternative) loaded via Fontshare — bold, geometric, used for H1/H2 only, tight letter-spacing (-0.02em), large sizes (clamp(2.5rem, 6vw, 6rem) for hero H1).
- Body/UI font: "Geist" (or "Inter" as fallback) for all body text, nav, buttons, forms — variable font, weights 400/500/600.
- Monospace font: "JetBrains Mono" or "Geist Mono" for code snippets, terminal-style UI accents, and small tag/label chips (e.g., tech stack pills) to reinforce the "developer" identity.
- Establish a strict type scale (12/14/16/18/20/24/32/48/64/96px) and use it consistently — no arbitrary font sizes.

Spacing & Layout:
- 8px base spacing unit, generous whitespace. Section vertical padding: 128px desktop / 80px tablet / 56px mobile.
- Max content width 1280px, centered, with 24px horizontal gutter on mobile.
- Use a 12-column CSS grid for layout composition, asymmetric grids for project/blog cards (avoid perfectly uniform 3-column grids everywhere — introduce visual rhythm with occasional 2-column or featured full-width cards).

Signature Visual Effects (apply consistently, not randomly):
- Glassmorphism: `background: rgba(255,255,255,0.04)`, `backdrop-filter: blur(20px)`, `border: 1px solid var(--border-subtle)` on navbar, cards, modals, and admin panels.
- Aurora background: a fixed, full-viewport canvas/CSS layer behind the hero (and subtly behind other sections) with 2–3 large soft-edged blurred gradient blobs (indigo/violet/pink) that slowly drift and morph using CSS keyframes or a lightweight WebGL shader (e.g., via `ogl` or a custom `<canvas>` noise shader) — must run at 60fps and pause when the tab is not visible (Page Visibility API) for performance.
- Grain/noise overlay at 3–4% opacity over the entire site for a premium film-like texture.
- Mouse-follow glow: a soft radial gradient light that subtly follows the cursor within hero and CTA sections (desktop only, disabled on touch devices).
- Custom cursor: a small dot that scales up and inverts/blends when hovering over interactive elements (links, buttons, project cards) — implemented with `mix-blend-mode: difference`. Must gracefully degrade to the native cursor on touch devices.
- Card hover: subtle 3D tilt (react-parallax-tilt or Framer Motion `useMotionValue`/`useTransform` on mouse position), soft glow border on hover, and a slight scale (1.02) with a spring transition (stiffness ~300, damping ~30).
- Buttons: primary buttons use the signature gradient with a "magnetic" pull effect (button subtly moves toward the cursor within a threshold radius) and an animated gradient-border micro-shimmer on hover. Secondary buttons are glass/outline style.
- Scroll-triggered reveals: every major section and card fades in + translates up 24px + slight blur-to-focus (`filter: blur(6px)` → `blur(0)`) as it enters viewport via Framer Motion `whileInView`, staggered by 60–100ms per child. Respect `prefers-reduced-motion` — disable transforms and blur, keep simple opacity fades, everywhere in the app.
- Page/route transitions: smooth cross-fade + slight vertical slide (200–300ms) between route changes using Framer Motion's `AnimatePresence` at the layout level.
- Section dividers: thin animated gradient lines, not hard borders.

====================================================================
3. GLOBAL COMPONENTS
====================================================================

Premium Loading Screen:
- On first load only (session-based, not on every route change), show a full-screen loader: the site logo/initials animate in with a stroke-draw SVG animation, a thin gradient progress line fills 0→100%, then the loader wipes away (clip-path reveal or vertical slide) to reveal the hero beneath. Total duration ~1.2–1.8s, skippable/instant on repeat visits within the session.

Navbar:
- Fixed/sticky, transparent over the hero, transitions to a glassmorphic blurred background once the user scrolls past the hero (animate background-opacity and backdrop-blur, not a hard jump-cut).
- Left: logo/initials mark (editable in admin). Center or right: nav links pulled dynamically from the admin-managed Navigation Menu module (Home, About, Projects, Blog, Services, Contact by default, but fully editable/reorderable). Right: theme accent CTA button ("Let's Talk" / "Resume") plus a hamburger for mobile.
- Mobile menu: full-screen glass overlay with large staggered-in nav links and social icons at the bottom.
- Include a thin scroll-progress bar pinned to the very top of the viewport reflecting page scroll percentage.

Footer:
- Glassmorphic, generous padding, content driven by the admin Footer module: brief bio blurb, quick nav links, social icons (from Social Links module), newsletter signup input (writes to Newsletter Subscribers table), copyright line with dynamic year, and a small "Built with ♥ and too much coffee" style personality line (editable).

Toasts, Modals, Empty States, Skeletons:
- Every async action (public form submits, admin CRUD) shows a toast (success/error) styled to the theme. Every list view has a skeleton-loading state matching final layout dimensions (no layout shift). Every empty admin list has a friendly illustrated empty state with a clear "Add your first ___" CTA.

====================================================================
4. PUBLIC SITE — PAGES & SECTIONS
====================================================================

4.1 HOME / HERO
- Full-viewport hero with a FULL-SCREEN VIDEO BACKGROUND. The video source is NEVER hardcoded — it is fetched from the admin-managed "Hero Videos" table, rendering whichever video is currently flagged `is_active = true`. Video attributes: `autoplay`, `muted`, `loop`, `playsInline`, `preload="metadata"`, object-fit cover, lazy-initialized after the loading screen completes. Apply a layered dark gradient overlay (linear-gradient from rgba(5,5,10,0.85) at top/bottom to rgba(5,5,10,0.5) center) so headline text is always legible regardless of the underlying footage.
- Fallback behavior: if no active video exists, is disabled by the admin, or fails to load/buffer within a timeout, render the admin-managed fallback hero IMAGE instead (same overlay treatment) — this must be a graceful, invisible-to-the-user fallback, not a broken video icon.
- If the admin disables background media entirely, fall back to the animated aurora gradient background alone.
- Hero content (all admin-editable via "Hero Content" module): eyebrow/kicker text (e.g., "SOFTWARE ENGINEER · CREATIVE DEVELOPER"), a large multi-line headline with one phrase highlighted in the signature gradient text-fill, a supporting subheadline paragraph, two CTA buttons (primary: "View Projects", secondary: "Download Resume" — both editable, target editable), and the admin-managed profile picture as a small floating glass-framed avatar with an animated "available for work" status pill (editable on/off + label).
- Headline entrance animation: staggered word-by-word (or line-by-line) fade + rise + blur-to-focus, timed to finish just as the loading screen wipes away.
- Scroll-down indicator: an animated mouse/chevron icon gently bobbing, linking to the next section.

4.2 ABOUT PREVIEW / FULL ABOUT PAGE
- Split layout: profile image with a subtle parallax float and a decorative gradient blob behind it, paired with a bio (admin-editable rich text), a row of quick stats (years of experience, projects shipped, happy clients — numbers animate counting up on scroll into view), and a downloadable resume button (pulls the current PDF from the admin Resume/CV module).
- Full About page additionally includes: a "Skills" section rendering the admin-managed Skills list as elegant categorized pill/badge groups with proficiency indicated by a subtle animated bar or dot-rating (not garish progress bars), and a vertical animated Timeline combining Experience + Education + Certifications (chronological, alternating left/right on desktop, single column on mobile, each node revealing on scroll with a connecting animated gradient line drawn via SVG `stroke-dashoffset`).

4.3 PROJECTS — LISTING PAGE
- Filter/sort bar: filter by Category and Technology (multi-select chips), sort by Newest/Featured/Difficulty, and a live search input — all client-side reactive with smooth layout animations (Framer Motion `layout` prop) as the grid re-filters.
- Asymmetric bento-style grid: Featured projects render as larger cards (spanning 2 columns), standard projects as single cards. Each card: cover image with a subtle zoom-on-hover, gradient overlay, project title, one-line description, tech stack pills (monospace font), status badge (e.g., "Live", "In Progress", "Archived"), and quick-action icons (GitHub, Live Demo) that appear on hover.

4.4 PROJECT DETAIL PAGE
- Hero area with cover image/video demo, title, category, and difficulty badge.
- Full rich-text description, an image gallery (lightbox with keyboard navigation and swipe support on mobile), embedded video demo player if provided, a "Tech Stack" section with icon pills, prominent "View Live Demo" and "View on GitHub" buttons, and a "Related Projects" carousel at the bottom (same category, excluding current).

4.5 BLOG — LISTING PAGE
- Featured post in a large hero card at the top, followed by a responsive grid of post cards (cover image, category tag, title, excerpt, author avatar + name, publish date, computed reading time). Category filter chips and a search bar. Pagination or "Load More" with smooth append animation.

4.6 BLOG POST DETAIL PAGE
- Large cover image, title, meta row (date, reading time, category, tags), and a sticky-on-scroll social share bar (desktop) that fades in past the hero.
- Rendered rich content supporting headings, images, blockquotes, and fenced code blocks with syntax highlighting (Shiki or Prism) including a copy-to-clipboard button on each code block.
- Auto-generated Table of Contents (sticky sidebar on desktop, collapsible accordion on mobile) built from the post's headings, with scroll-spy active-section highlighting.
- Comments section (name/email/comment, admin-moderated before appearing publicly — see Admin: Blog Comments Moderation).
- "Related Posts" section (shared tags/category) and a newsletter CTA block.

4.7 SERVICES PAGE
- Grid of service cards (icon, title, short description, "what's included" bullet list) sourced from the admin Services module, each with a subtle hover-lift and gradient icon background.

4.8 TESTIMONIALS
- A dedicated section (on Home and/or its own page) rendering an auto-playing, pausable-on-hover horizontal carousel of glass testimonial cards: avatar, name, role/company, star rating, and quote — sourced from the admin Testimonials module.

4.9 GALLERY / ACHIEVEMENTS / AWARDS
- A masonry-style gallery page for miscellaneous visual content (hackathon photos, conference talks, workshop snapshots) with lightbox viewing, and a distinct "Achievements & Awards" section presented as elegant badge/trophy cards with issuing organization, date, and optional verification link.

4.10 FAQ SECTION
- Accordion-style, smooth height-animated expand/collapse, sourced from the admin FAQs module, placed on the Home page above the footer and/or its own section on the Contact page.

4.11 CONTACT PAGE
- Two-column layout: a contact form on one side (Name, Email, Subject, Message, honeypot spam-trap field, client + server zod validation, animated inline error states, loading spinner + success confetti/checkmark micro-animation on submit) and, on the other side, a glass info card with the admin-managed email, phone, location, an embedded Google Map (location editable in admin), social icons, and a floating WhatsApp button (bottom-right, site-wide, only rendered if the admin has enabled/configured a WhatsApp number) that deep-links to `wa.me` with a pre-filled greeting message.
- Contact submissions are stored in the database AND emailed to the admin via Resend; the visitor receives an automated confirmation email.
- Include basic abuse protection: honeypot field + submission rate-limiting by IP (e.g., 1 submission per 60 seconds) implemented via a Server Action check against recent submissions.

4.12 404 / ERROR PAGES
- On-brand animated 404 (floating glitch-style "404" with the aurora background and a "Take me home" CTA) and a distinct friendly 500/error boundary page.

====================================================================
5. ADMIN DASHBOARD
====================================================================

5.1 AUTHENTICATION
- `/admin/login`: minimal, elegant, glass card centered on the aurora background, email + password fields, Supabase Auth email/password sign-in, error states for invalid credentials, and full brute-force protection (rate limit login attempts). No public registration route exists — the single admin account is provisioned directly in Supabase.
- All `/admin/*` routes are protected via middleware that checks the Supabase session server-side and redirects unauthenticated requests to `/admin/login`. Session persists via secure httpOnly cookies with a "Remember me" option and a manual "Log out" action.

5.2 DASHBOARD SHELL
- Persistent glass sidebar (collapsible on smaller screens) grouping modules into logical sections: Content (Hero, About, Skills, Experience, Education, Certifications, Services, Timeline), Work (Projects, Categories, Tags, Technologies), Blog (Posts, Categories, Tags, Comments), Engagement (Testimonials, FAQs, Contact Messages, Newsletter Subscribers), Media (Gallery, Achievements, Resume/CV, Profile Picture), Site (Navigation, Footer, Social Links, SEO, Website Settings), and Analytics.
- Top bar: global search across content, quick "View Live Site" link (opens public site in new tab), notification bell for new contact messages/comments, and an admin profile dropdown (edit profile, log out).
- Overview/Analytics landing page (`/admin`): stat cards (total projects, published posts, unread messages, newsletter subscribers, this week's visitors) with small trend sparklines, a visitor traffic line chart (last 30 days), a top-pages bar chart, a traffic-sources donut chart, and a recent-activity feed (latest contact messages, latest comments awaiting moderation).

5.3 CRUD MODULE PATTERN
Every module below follows the same professional CRUD pattern: a data table (sortable columns, search/filter, pagination) → "Add New" opens a slide-over drawer or dedicated form page → form uses react-hook-form + zod with inline validation → image/file fields use a drag-and-drop uploader with live preview, crop tool where relevant (profile picture, cover images), and progress indicator → Save triggers optimistic UI update + toast → row actions include Edit, Duplicate (where relevant), Delete (with a confirmation dialog), and, for orderable lists, drag-handle reordering (dnd-kit) that persists an `order_index` field. Destructive actions always require confirmation.

Module-specific notes:

- Hero Content: single-record settings form (kicker, headline with an inline gradient-highlight-word picker, subheadline, CTA button labels/links, availability status toggle + label).
- Hero Videos: table of uploaded videos (thumbnail preview, filename, duration, file size, upload date, active toggle) with drag-and-drop upload to Supabase Storage, video compression guidance note, and a radio-style "Set Active" control (only one active at a time — enforced in the UI and at the database level). Includes Delete with confirmation and storage cleanup.
- Hero Images (Fallback): same pattern as videos but for the fallback/poster image, plus an image cropper enforcing the correct aspect ratio.
- Profile Picture: single-image uploader with circular crop preview, used across Hero, About, and Footer.
- Projects: full CRUD with fields — title, slug (auto-generated, editable), cover image, gallery (multi-image uploader, reorderable), demo URL, GitHub URL, technologies (multi-select from Technologies module, creatable inline), status (Live/In Progress/Archived — colored badge), featured toggle, categories (multi-select from Categories module), difficulty (Beginner/Intermediate/Advanced), rich-text description, screenshots, optional video demo upload/embed URL, and order index for manual featured ordering.
- Blog Posts: full CRUD with Tiptap rich-text/Markdown editor (with a live word count and auto-computed reading time), cover image, categories, tags (creatable inline chips), featured toggle, SEO fields (meta title, meta description, OG image override), status (Draft/Published/Scheduled with a publish date-time picker), and a live preview pane.
- Blog Comments Moderation: table of submitted comments with Approve/Reject/Delete actions; only approved comments render publicly.
- Categories & Tags (shared pattern, separate namespaces for Projects and Blog): simple name/slug/color CRUD with usage-count column.
- Skills: name, icon (searchable icon picker or custom SVG/image upload), category grouping (e.g., Frontend/Backend/DevOps/Tools), proficiency level, reorderable within category.
- Experience: company, role, location, start/end date (or "Present" toggle), rich-text responsibilities, company logo upload, reorderable.
- Education: institution, degree, field of study, start/end date, logo upload, reorderable.
- Certifications: title, issuing organization, issue date, expiry date (optional), credential ID, verification URL, badge image upload, reorderable.
- Services: title, icon, short description, "included" bullet list (dynamic add/remove rows), reorderable.
- Resume/CV: single PDF uploader with a live thumbnail preview and version history (keep last 5 uploads with rollback).
- Profile Information: name, title/role, tagline, bio (rich text), email, phone, location, timezone, availability toggle.
- Contact Messages: inbox-style table (name, email, subject, snippet, received date, read/unread state), detail view with full message, Reply-via-email action (opens a mailto: pre-filled or triggers a Resend reply), Archive and Delete actions, spam flagging.
- Testimonials: name, role/company, avatar upload, star rating, quote (rich text), featured toggle, reorderable.
- Technologies: name, icon/logo upload or icon picker, category (Language/Framework/Database/Tool/Cloud), used as the shared source for Project tech-stack multi-selects.
- Social Links: platform (dropdown with auto icon mapping: GitHub, LinkedIn, Twitter/X, Instagram, YouTube, Dribbble, dev.to, etc.), URL, visibility toggle, reorderable.
- SEO: global defaults (site title template, meta description, OG default image, Twitter handle, favicon upload, Google Search Console verification tag) plus the ability to override on individual Projects/Blog Posts (already covered above). Auto-generates `sitemap.xml` and `robots.txt`; includes JSON-LD structured data (Person, WebSite, BlogPosting, and CreativeWork/Project schemas) rendered on the relevant pages.
- Analytics Dashboard: as described in 5.2, plus a dedicated deeper view — top referrers, device/browser breakdown, geographic map, most-viewed projects/posts, and a date-range picker.
- Website Settings: site name, logo upload (+ favicon), primary accent gradient override (advanced — lets the admin nudge the theme's accent colors within guardrails), maintenance mode toggle (shows a "back soon" page to visitors while the admin still has full access), and global custom `<head>` script injection field (for analytics tags, guarded/sandboxed).
- Navigation Menus: manage the navbar link list (label, target route or anchor, visibility, reorderable) and similarly for footer quick-links.
- Footer: bio blurb, copyright line, personality tagline, newsletter section toggle.
- FAQs: question/answer pairs, category grouping, reorderable.
- Timeline: if kept as a distinct module from Experience/Education (e.g., for a general "journey" narrative), same CRUD pattern with date, title, description, icon.
- Gallery: multi-image uploader with captions, tags/categories, reorderable, lightbox preview in-admin.
- Achievements/Awards: title, issuing body, date, description, image/badge upload, optional verification link, reorderable.
- Visitor Statistics: lightweight first-party analytics — log page views (route, referrer, rough device/browser via user-agent parsing, country via IP geolocation, timestamp) without invasive personal tracking or third-party cookies; surfaced in the Analytics module; include a data-retention/clear-logs admin action.
- Newsletter Subscribers: table of emails with subscribe date and source page, export-to-CSV action, and unsubscribe handling (public unsubscribe link in emails).

5.4 ADMIN UX POLISH
- Keyboard shortcuts for power use (e.g., `cmd+k` command palette to jump to any module or action).
- Autosave drafts for long-form content (blog posts) with a "last saved" indicator.
- Full audit-safe confirmation dialogs on every delete.
- Responsive admin: fully usable on tablet; core moderation tasks (approve comment, read message) usable on mobile.

====================================================================
6. DATABASE SCHEMA (entities & key relationships)
====================================================================

Design normalized PostgreSQL tables in Supabase with UUID primary keys, `created_at`/`updated_at` timestamps, and RLS policies (public read-only on published content, authenticated-admin-only write). Core entities:

- `profile` (singleton): name, title, tagline, bio, email, phone, location, timezone, availability, resume_url, profile_picture_url
- `hero_content` (singleton): kicker, headline, highlighted_word, subheadline, cta_primary_label/url, cta_secondary_label/url
- `hero_videos`: url, thumbnail_url, filename, duration, size, is_active, order_index
- `hero_images`: url, is_active
- `projects`: title, slug, cover_image_url, gallery (jsonb array), demo_url, github_url, status, is_featured, difficulty, description, video_demo_url, order_index, seo_title, seo_description
- `project_categories`, `project_technologies` (join table: `project_id`, `technology_id`)
- `technologies`: name, icon_url, category
- `blog_posts`: title, slug, cover_image_url, content (rich text/markdown), excerpt, status, published_at, reading_time, is_featured, seo_title, seo_description, og_image_url
- `blog_categories`, `blog_tags`, `blog_post_tags` (join)
- `blog_comments`: post_id, name, email, comment, status (pending/approved/rejected), created_at
- `skills`: name, icon_url, category, proficiency, order_index
- `experience`: company, role, location, start_date, end_date, is_current, description, logo_url, order_index
- `education`: institution, degree, field, start_date, end_date, logo_url, order_index
- `certifications`: title, issuer, issue_date, expiry_date, credential_id, verify_url, badge_url, order_index
- `services`: title, icon, description, included_items (jsonb array), order_index
- `testimonials`: name, role, company, avatar_url, rating, quote, is_featured, order_index
- `contact_messages`: name, email, subject, message, is_read, is_archived, created_at
- `social_links`: platform, url, is_visible, order_index
- `seo_settings` (singleton): site_title_template, meta_description, og_image_url, twitter_handle, favicon_url, gsc_verification
- `website_settings` (singleton): site_name, logo_url, accent_overrides (jsonb), maintenance_mode, custom_head_script
- `navigation_items`: label, target, is_visible, order_index, location (navbar/footer)
- `faqs`: question, answer, category, order_index
- `gallery_items`: image_url, caption, tags, order_index
- `achievements`: title, issuer, date, description, image_url, verify_url, order_index
- `newsletter_subscribers`: email, source_page, subscribed_at
- `page_views`: route, referrer, device, browser, country, created_at
- `admin_users`: managed by Supabase Auth directly (single admin)

====================================================================
7. MEDIA HANDLING & PERFORMANCE
====================================================================

- All images served through `next/image` with proper `sizes`, blur-up placeholders (generated at upload time), and modern format negotiation (AVIF/WebP with fallback).
- Videos: encourage compressed MP4 (H.264) uploads under a sane size guardrail (warn in the admin UI above ~15MB), lazy-load hero video after critical content paints, and include a `poster` frame (auto-derived from the fallback image or first video frame).
- Code-split every route; only load Tiptap, chart libraries, and lightbox/gallery code on the pages that need them (dynamic `import()` with `ssr: false` where appropriate).
- Target Core Web Vitals: LCP < 2.5s, CLS near 0 (reserve aspect-ratio boxes for all media before load), INP < 200ms.
- Cache public content aggressively (ISR/ `revalidate` on content tables, or on-demand revalidation triggered from admin Save actions) so visitors always see fresh content without full rebuilds.

====================================================================
8. SEO & ACCESSIBILITY
====================================================================

- Server-rendered metadata per page via Next.js `generateMetadata`, dynamic OG image generation for blog posts/projects where a custom image isn't set (using `@vercel/og`).
- Auto-generated `sitemap.xml`, `robots.txt`, canonical URLs, and JSON-LD structured data as described above.
- Full semantic HTML, correct heading hierarchy, visible focus states styled to match the theme (not browser default), sufficient color contrast even within the dark glassmorphic surfaces, alt text fields required on every image upload in the admin, full keyboard navigability (including the lightbox, command palette, and mobile menu), and respect for `prefers-reduced-motion` across every animated component as noted in Section 2.

====================================================================
9. RESPONSIVENESS
====================================================================

Design mobile-first, then enhance. Every section explicitly specified above must be re-validated at 375px, 768px, 1024px, and 1440px+ breakpoints: grids collapse to single/double columns, the custom cursor and mouse-follow glow disable on touch devices, hover-only interactions get tap-equivalent affordances, and the admin sidebar collapses into a bottom sheet or drawer on small screens.

====================================================================
10. SECURITY
====================================================================

- Row Level Security enforced in Supabase: public roles can only `SELECT` published/visible content; all `INSERT`/`UPDATE`/`DELETE` require the authenticated admin session.
- Server Actions validate every admin write server-side (never trust client-side validation alone).
- Contact form: honeypot field + IP-based rate limiting + server-side zod validation.
- File uploads: validate MIME type and size limits server-side before writing to Storage, not just in the UI.
- Environment variables for all secrets (Supabase service role key, Resend API key) — never exposed to the client.

====================================================================
11. DEPLOYMENT
====================================================================

Ship a `README.md` with: Supabase project setup steps (SQL migration script to create every table + RLS policy in one runnable file), required environment variables (with a matching `.env.example`), how to seed initial realistic sample content (a seed script), and one-click deploy instructions for Vercel. The project must run with `npm install && npm run dev` locally with zero additional manual steps beyond filling in `.env`.

====================================================================
12. CONTENT SEEDING (so the site never looks empty on first load)
====================================================================

Seed the database with realistic, polished placeholder content reflecting an accomplished full-stack software developer: 4–6 varied projects (web apps, an open-source tool, a mobile app, a small SaaS) with real-sounding names/descriptions/tech stacks; 3–4 blog posts on genuinely useful developer topics with proper formatting and code blocks; a full skills list across frontend/backend/devops; 2–3 experience entries and one education entry; 3 certifications; 3 services; 3 testimonials; 5–6 FAQs; and a coherent bio/hero copy — all written in a confident, modern, slightly technical voice. No "Lorem ipsum," no "Company Name," no gray placeholder boxes anywhere in the delivered build.

====================================================================
FINAL QUALITY BAR
====================================================================

Before considering this complete, verify: every piece of visible content is sourced from the database and editable in the admin (nothing hardcoded); every animation has purpose, is smooth, GPU-accelerated where possible, and respects reduced-motion preferences; the site feels cohesive — one consistent design language, not a patchwork of effects; the admin dashboard is as polished as the public site, not an afterthought; and the overall impression, on first visit, is: "This developer is different."
