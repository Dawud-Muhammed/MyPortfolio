# Release and operating procedure

## Architecture

The existing React and Supabase stack is retained. The application renders navigation, identity and actions immediately, uses native scrolling, and splits admin/detail pages into lazy chunks. At the user's request, a client-rendered GitHub contribution graph replaces the earlier D-shaped 3D sculpture and its Three.js dependency. The original hero introduction and CMS-backed selected-work section remain. The graph uses a public source with cyan treatment in light and dark themes; its data may be cached or delayed and must not be presented as real-time activity. It requires no GitHub token, new application API endpoint, or SQL change. Plain CSS handles interface transitions; redundant GSAP, Lenis and Motion layers were removed.

Shared semantic tokens cover both themes. Explicit Light/Dark/System choice is applied before React mounts, stored locally, and preserved across navigation. Native dialogs provide focus containment for mobile navigation, the gallery and guide. The guide remains mounted across public route navigation; conversation state belongs to this tab and is never written to a public database or local storage.

The trusted boundary is Vercel Node functions using Supabase and the official OpenAI SDK. Paid responses are buffered until structured source IDs are resolved against current approved records. This deliberately prioritizes verified links over displaying unvalidated stream fragments. The implementation does not add a backend framework or require React peer-dependency overrides. SQL handles atomic reservations and durable throttling; model selection and spending limits remain server-only configuration.

Initial public HTML is generated at request time from anonymous published CMS reads. This avoids a rebuild webhook and stale generated content. It adds backend latency, which must be measured on the deployed region and actual data before declaring performance targets met. See RENDERING.md.

## CMS workflow

1. Sign in through `/admin/login` using the owner account provisioned in `admin_users` by a trusted database connection. Ordinary authenticated users cannot administer content.
2. Use **Settings** for profile, real portrait, résumé, homepage copy, availability, contact and SEO. Use **Navigation** for labels/order/visibility. The intended starting order is Home, About, Projects, Services, Blog, Gallery, Contact.
3. Use **Collections** for technologies, project/blog categories, tags and comment moderation. Projects maintain technology relationships through a transactional database function.
4. Keep unfinished projects as drafts. Add role, team contribution, problem, audience, decisions, implementation, challenges, evidence and outcomes only where supported. Feature up to three projects; lower priority values come first. Lifecycle status and publication are separate.
5. Set article publication dates. Reading time is calculated consistently from cleaned content. Review gallery captions and alt text before publication.
6. Approve specific published profile/project/service/experience/FAQ records for guide knowledge. **AI Guide** controls greeting, suggested questions, portrait override, audio, usage estimates and the kill switch. It does not expose secrets or bypass server budget caps.
7. CMS saves notify local tabs; visible public tabs refresh within 30 seconds and on focus. Server HTML and assistant retrieval are fresh per request. Revision changes clear the guide and reject in-flight stale answers.

The cached English introduction is `public/audio/introduction.wav`, generated once with the installed Microsoft Zira Desktop en-US synthetic voice. It uses the displayed greeting, is disclosed as synthetic, costs no model tokens and requires no live speech endpoint. Replace it with an owner recording or another approved fixed audio file in AI Guide, and keep the displayed text synchronized. Clear the audio URL to disable speech. Sound starts off unless the visitor previously enabled it. No photograph is used for voice synthesis.

## Stage before production

1. Create an isolated Supabase test project or local Supabase stack. Copy schema and only owner-approved representative records/media; do not use the generic historical seed as Dawud content.
2. Back up the existing database. Apply `20261105090000_systems_studio.sql` in staging after the earlier tracked migrations. It preserves IDs, slugs and joins. Provision the owner UUID. Validate ordinary user denial and draft privacy before deployment.
3. Create a Vercel preview from this working copy. Configure the environment placeholders in `.env.example` for the preview only. Set `SITE_URL` to the intended origin; `VERCEL_URL` also permits the deployment's own POST origin. Keep `ASSISTANT_ENABLED=false` until the controls and account access are verified.
4. Verify one CMS edit, publish and unpublish through page HTML, browser state and eligible guide knowledge. Exercise real Supabase Auth/Storage and multi-connection budget contention in staging; embedded PostgreSQL tests do not certify hosted infrastructure.
5. Supply the OpenAI project key server-side, confirm access to `gpt-6-luna` and current Standard pricing, then set the pricing review date. Use a separate test ledger with total allowance at most **$1** for live answer evaluations. Check grounded answers, malicious questions/content, missing evidence, cancellation and source correctness. Never use the editor's coding model selector as the API model ID.
6. Run the checks in README and inspect the screenshots and factual-review list. Verify custom domain/canonical URL, redirects, response status codes and social previews on the actual Vercel preview.
7. Obtain production release authorization for this concrete preview. Only then apply the reviewed migration to a backed-up production project, provision the owner, and deploy. Preserve record IDs and existing URLs. No production reset, sample-data import, contact test delivery or migration was performed here.

## Rollback

Disable the CMS guide switch and server assistant switch immediately to stop paid work. Roll back the frontend/function deployment independently. Retain the additive columns and reservation history; deleting the ledger would reset lifetime spending protection. Preserve restrictive RLS instead of reinstating the original broad authenticated write policies. Follow the detailed database rollback guidance in BACKEND.md and restore only a verified backup if recovery is necessary.

## Design references reviewed

[Kidus's exploratory portfolio](https://v2.kidus-yohannes.engineer/) and [plain-list view](https://v2.kidus-yohannes.engineer/list) informed the principle of keeping direct HTML navigation available alongside optional exploration. [Fuad's portfolio](https://www.fuadtesfaye.me/) informed clear grouping of work and services. No assets, copy, house geometry or branding were copied. The current hero graph follows the user's later direction. Other supplied references were attempted but their contents were not retrievable through the available web tool; no unsupported competition rules, deadlines or outcome claims were inferred.
