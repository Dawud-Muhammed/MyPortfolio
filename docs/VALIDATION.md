# Validation — 5 November 2026

## Blog lead story and newest-first ordering

All **78 automated checks**, type checks, lint and production build pass. A shared nonmutating sort keeps known publication dates newest first, with undated/invalid dates last by creation date and stable ID. The public query explicitly requests NULLS LAST, and initial HTML uses the same ordering. The newest post is featured once with a large cover; remaining posts use smaller editorial cards. Category filters feature their newest matching post. Missing/failed covers retain a readable card and article link; missing dates are never fabricated.

Both focused browser scenarios passed in one clean run (19.3 seconds) after moving the preview outside the sandbox so the browser could reach it. They cover existing article/date/reading-time/detail/gallery behavior plus the new feature/order/category/single-post/missing-cover states, keyboard access, desktop light/dark and 390px phone overflow. A subsequent focused rerun passed (14.3 seconds) and refreshed the screenshot scroll position; captures use synthetic fixture images and text, not live portfolio evidence. Desktop light and phone dark captures were opened for visual review. No production writes/deployment, SQL or environment changes were made. Earlier assistant browser verification limitations below remain historical and are not claimed resolved by these blog checks.

## Automatic public CMS knowledge

All **73 automated checks** and the production build pass. The assistant now uses published public portfolio content without `assistant_eligible` approval gates, across 15 allowlisted collections. Real embedded PostgreSQL verification runs retrieval against the migrated schema, checks current publications and NULL-date legacy blogs, excludes drafts/scheduled posts/hidden socials/private fields, and confirms edits/unpublishing affect the next retrieval. The legacy columns remain ignored; this code patch needs no SQL update.

Unit/handler checks cover old false approval flags reaching a mocked answer, latest published singletons, unpublished relationship labels, public field allowlists, relevant late article passages, a bounded 16,000-character source context, and current questions taking priority over long previous questions. Natural greeting/follow-up instructions are implemented; actual model behavior/account access remain unverified. No paid requests or hosted database/configuration/deployment changes were performed.

A focused CMS browser scenario was added to check removal of approval fields, retained publication/featured/chat controls, and saves excluding the legacy field. The attempted new CMS and existing guide scenarios both failed before page load because Edge could not launch its sandbox profile. The rerun outside the sandbox was aborted during approval; no browser pass is claimed for this patch. Earlier browser results below belong to earlier revisions. Lint passes; application/node type checks also pass.

## Chat domain check follow-up

All **67 automated checks**, type checks, lint and production build pass. Configured SITE_URL/VITE_SITE_URL and Vercel aliases are checked independently. A browser-confirmed same-origin request whose Origin matches the actual HTTPS Host can use a custom domain despite stale canonical settings. Tests cover that request reaching a mocked answer, foreign requests being rejected before budget/provider work, missing metadata, forged forwarded hosts, scheme mismatch, and GET readiness reporting the same domain failure. Browser readiness now checks Origin/Referer; a direct header-free GET only checks server configuration. No paid requests, hosted SQL, environment edits or deployment were performed. The browser suite was not rerun for this server-focused patch.

## Text-only chat follow-up

Type checks, lint, production build and **63 automated checks pass**. All **19 browser scenarios pass in one run** (3.1 minutes), including ignored legacy audio preferences/configuration, no introduction/playback controls, unavailable-vs-paused behavior, chat replies using a mocked provider, cancellation, retries and source validation. The deployed public endpoint/CMS were checked read-only; owner enablement and the revision record exist, but its legacy server still returned the catch-all fallback. No real paid request or production configuration change was made. See TEXT-CHAT-RELEASE.md for required deployment verification.

## Blog visibility follow-up

The base release's publication-date requirement hid explicitly Published legacy articles whose date was NULL. `20261105110000_restore_undated_published_articles.sql` restores their public visibility, related public tags and approved email-free comments, without rewriting article data. Drafts and future-dated publications remain private. The isolated PostgreSQL test covers anonymous/non-owner reads, denied writes, unpublished removal, retained IDs and NULL dates. All **58 automated checks pass**; type checks and lint pass. The repeated paused notice was removed from the guide UI; server/CMS enablement and budget safeguards remain unchanged. No hosted SQL or paid requests were executed.

## CMS release-readiness follow-up

Application/node type checks, ESLint and production build pass. **57 automated checks pass**, and the complete **18-scenario browser suite passes in one run** (2.7 minutes). The new checks cover duplicate published settings selection and live CMS copy/availability/WhatsApp values reaching public pages using isolated test data. The latter does not send a WhatsApp or contact message.

The owner editor now selects the newest record by `created_at DESC, id DESC`; public browser/initial HTML/guide portrait reads consistently select the newest published record. The availability switch hides its line in both browser and HTML. WhatsApp links include the encoded saved draft message. The read-only preview understands compound sorting. No owner records were deleted or modified in production, and no additional migration is required for these code fixes.

For deployment and actual CMS operation, use `DEPLOYMENT-GUIDE.md` and `CMS-GO-LIVE.md`. A missing or unpublished CMS field can still show intended fallback UI copy; code-owned labels are identified in that handbook. Hosted migration/Auth/Storage/API verification still requires the external configuration described below.

## GitHub graph revision — verified locally

The current revision replaces the hero's 3D sculpture with a cyan GitHub contribution graph from a public client-side source, preserves the hero introduction and selected work, and removes the scene/Three.js dependency. The source may be cached or delayed; this is not a real-time activity claim. No GitHub token, new application API endpoint, or SQL change is introduced for the graph.

- Application/node type checks, ESLint and the production build pass. `npm test` reports **56 passing checks**, including 12 new calendar/data/cache/transport checks and the 44 retained backend/rendering checks.
- **17 browser scenarios passed across runs**. The full run passed 16; the project-navigation test failed before React mounted when 75 Lucide module requests encountered `ERR_NETWORK_CHANGED`. Its trace contained no CMS queries. Removing the Vite exclusion now prebundles the icon dependency. The failed project test plus the updated hover/Escape and 24px touch tests all passed in a focused three-test rerun (18.6 seconds). This is not a claim of one clean 17-test run.
- Calendar checks cover the five widths 360/390/768/1024/1440, both themes, reduced motion, hover/focus/Escape, arrow navigation, touch, year changes without new requests, loading with working navigation, empty activity, failed data/retry, and the retained public/CMS/guide flows. Automated calendar counts are explicitly synthetic fixtures, never portfolio evidence.
- Actual browser requests separately returned HTTP 200 with the genuine **2026 total 327** and available years 2026/2025 on 5 November 2026; the upstream response's 2025 total was 3. The desktop calendar measured 580px client/scroll width (fully visible); the phone calendar measured 312px client width and 720px scroll width (contained horizontal scrolling). An emulated touch phone separately verified **24×24px** cells and an actual date/count tooltip. Evidence: `artifacts/github-live-verification.json`. These are dated cached-source observations, not hardcoded values.
- Initial live captures also encountered transient connection failures. The application retries a transport failure once within the shared abort budget, retains last-good in-memory data after a failed refresh, and otherwise displays an honest error/retry state. Upstream availability is outside the application's control; the final live capture succeeded.
- Three.js, its type package, both 3D modules, their styles/tokens and controls are removed. Source/lockfile search and the production build contain no sculpture renderer or scene chunk. No runtime dependency was added. See `GITHUB-ACTIVITY.md` for the public source, validation, privacy and cache contract.
- Current build: approximately **134 KB gzip initial JavaScript** and **12.5 KB gzip CSS**, with no optional 142 KB scene download. Exact sizes are in `artifacts/bundle-sizes.json`. The earlier lab timings below were not repeated and do not certify this revision's Core Web Vitals.

No production writes/deployment or paid provider calls were performed for this revision. The earlier implementation history below is retained separately.

## Prior verified implementation — before the GitHub graph replacement

- Baseline at `b369a6d236fb9c4251dc38d1b49d3f6290708737`: clean `main`; build and application typecheck passed; lint reported 45 errors and one warning. Initial JavaScript was approximately 260.98 KB gzip.
- Refactored application: application and Vite/preview-adapter type checks, ESLint and Vite production build pass. React 18 retained; Vite updated to 7.3.7. No forced peer dependencies.
- `npm test`: **44 passing checks**, including 31 backend/PostgreSQL checks and 13 rendering/content checks. Covers additive migrations, retained IDs/relationships, ordinary-user denial, public/draft isolation, transactional joins, publication refresh, kill switch, reservations, reconciliation, throttling, lifetime allocations, real isolated contact inserts, storage policy gates, exact-match spelling correction/rollback, provider error/cancellation mocks, session signatures, source resolution, malicious HTML/URLs, SEO injection, sitemap and missing metadata.
- Prior browser suite: **12 scenarios passed across runs**. The complete run passed 11; the five-viewport/screenshot scenario exceeded its cumulative 45-second limit during concurrent capture/build work. With a 90-second allowance, that scenario passed in 18.1 seconds; the context-loss/zoom check also passed again in 18.3 seconds. This is not described as a single clean 12-test run. Those checks verified the assistant's right-side placement at 390/1440px and that the fallback poster is hidden while WebGL is active.
- Browser scenarios cover widths 360, 390, 768, 1024 and 1440, both themes, persistence, navigation/back, mobile menu focus/Escape, gallery arrows/focus restoration, project search/empty categories, article dates/reading-time/citation cleanup, public refresh after mocked unpublish, labeled contact validation and mocked receipt, guide disabled/offline/budget/provider/cancel/retry/clear/session behavior, audio rejection, reduced motion, WebGL initialization failure and synthetic context loss, 420px phone height, long titles, failed collections and 200% CSS zoom.
- Public CMS reads succeeded using only the anonymous configuration already shipped by the live site. No key is saved. The captured data includes Dawud's real portrait and nine project records; it is an ignored local snapshot, not seed data or a migration. A later expanded read attempt failed, so missing technology associations and the inaccessible Car Rental demo remain unresolved in the content review.
- Generated `public/audio/introduction.wav` once using installed Microsoft Zira Desktop English synthetic speech; approximately 440 KB. Playback is opt-in, disclosed, cached and does not invoke the provider. No microphone access is requested.
- API spend: **$0**. No production database writes, migration, deployment, messages or email deliveries were performed.
- Final read-only review smoke check passed: real public snapshot rendering, explicit preview notice, rejected contact writes (405), disabled paid guide, cached audio availability, and correct robots/JSON-LD refresh when navigating from a missing page to About.

## Historical bundle and lab measurements

After the earlier visual revision and before the GitHub graph change, initial non-3D JavaScript was approximately **132 KB gzip**, including React/router and the updated Supabase client. The then-active procedural scene was a separate approximately **142 KB gzip** module, with no downloaded models/textures. CSS was approximately **11.8 KB gzip**. Those measurements were below the original 250 KB initial-JS and 1.5 MB scene budgets. They do not describe the current graph build; `artifacts/bundle-sizes.json` now records the replacement build.

One cold mobile navigation per version was measured in local Microsoft Edge headless at 390×844, DPR 1, 4× CPU slowdown, 150 ms simulated network latency and 1.6 Mbps download. All non-read production requests, including automatic page-view writes, were blocked.

- Existing live page: observed LCP **11.140 s**, CLS **0.06727**.
- Earlier local production build without CMS credentials: observed LCP **2.200 s**, CLS **0.00072**.

These measurements predate both the stronger visual revision and the GitHub graph replacement; they have not been repeated for the current hero/layout. They are individual lab observations, **not an equivalent deployment comparison**: one site was remote with live CMS content, while the other was a loopback production build with the no-CMS state. Fonts, media, server rendering and actual hosted database latency can change the result. No Lighthouse score, field percentile, INP result or certified Core Web Vitals pass is claimed. Repeat on the configured Vercel preview with real content, representative interaction and multiple runs. Raw conditions/browser version/results are in `artifacts/performance.json`.

Updated core text/background tokens were numerically checked: light primary 14.47:1, secondary 5.70:1 and accent 4.71:1; dark primary 17.79:1, secondary 10.48:1 and accent 12.25:1. This is not a comprehensive WCAG audit; legacy admin muted text was moved to semantic secondary colors to avoid low-alpha text in light mode.

## Current screenshots

These refreshed captures combine the current GitHub hero with the read-only live CMS snapshot and actual GitHub network responses. The homepage fallback copy is proposed implementation copy because the snapshot's older hero table lacks the new fields. Paid AI is disabled; no facts were invented for missing project evidence.

- [Desktop, light](../artifacts/screenshots/public-snapshot-light-1440.png)
- [Desktop, dark](../artifacts/screenshots/public-snapshot-dark-1440.png)
- [Mobile, light](../artifacts/screenshots/public-snapshot-light-390.png)
- [Mobile, dark](../artifacts/screenshots/public-snapshot-dark-390.png)
- [Mobile guide](../artifacts/screenshots/public-snapshot-guide-mobile.png)
- [Desktop guide, anchored right](../artifacts/screenshots/public-snapshot-guide-desktop.png)
- [Projects and hover state](../artifacts/screenshots/public-snapshot-projects-dark-1440.png)
- [Touch phone, actual data and 24px cell tooltip](../artifacts/screenshots/github-touch-390.png)

The prior `actual-no-cms-*` screenshots are historical. Current automated screenshots named `no-cms-synthetic-github-*` use synthetic GitHub fixtures and are not evidence of actual counts. Representative current live-data captures were opened and visually inspected. The `dev:public` review mode labels its CMS snapshot explicitly and refuses writes; it is not included in production builds.

That earlier visual pass established the stronger dark/cyan identity, large outlined name, real portrait introduction, warmer light surfaces, surfaced cards, visible evidence actions, sticky navigation and short interaction transitions. Its framed 3D study and mouse-driven rotation/selection are now superseded by the GitHub graph. The launcher and desktop dialog sit on the right and use “Dawud's AI Assistant.” Prior public-content capture also verified that project-card hover responded and reduced motion removed its translation. These captures use a read-only snapshot and do not prove a live AI connection.

## Remaining verification boundaries

- PGlite is real PostgreSQL, but it serializes requests in one embedded instance. Its simultaneous-submission test is not a real multi-connection lock-contention benchmark. Hosted Supabase Auth, Storage, row-level policies and publish/unpublish require staging credentials and real-session checks.
- Provider responses were mocked. Real account access to `gpt-6-luna`, current pricing and answer grounding must be evaluated in staging with at most $1 total allowance. Transport tests do not prove a model always resists prompt injection or hallucinations.
- Actual device keyboards, native browser zoom and screen-reader combinations were not certified. Small-height layout, CSS zoom, keyboard navigation, touch emulation and synthetic failure paths were exercised. The current hero no longer uses WebGL.
- Seven moderate npm audit findings remain in the **development-only TypeScript ESLint/minimatch dependency chain**; no high or critical advisories remained after compatible updates. `npm audit fix` does not currently clear that chain. The report is saved as `docs/dependency-audit.json`; do not accept untrusted glob patterns for lint tooling. No forced transitive major override was introduced.
- Production Vercel rewrites/headers and region latency are implemented but require preview deployment verification. The current live site is unchanged. See RELEASE.md and BACKEND.md for the exact staged rollout and safe rollback steps.

