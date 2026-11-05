# Dawud’s Systems Studio

A CMS-backed portfolio with a GitHub contribution graph, complete light/dark/system themes, readable project case studies, and a grounded AI guide. React 18, TypeScript, Vite, Supabase PostgreSQL/Auth/Storage and Vercel Node functions.

The hero's cyan contribution graph replaces the earlier 3D sculpture while preserving the introduction and selected-work section. It loads a public source in the client and supports both themes. Public contribution data may be cached or delayed; it is not a real-time activity feed. This change requires no GitHub token, new application API endpoint, or SQL migration.

## Run locally

Use Node 22.12+ (verified on Node 24). Install with `npm ci`, then run `npm run dev`. The public shell works without credentials; missing CMS configuration produces explicit unavailable states, never template biography/projects.

For the review copy using the real public projects and portrait collected during this session, run `npm run dev:public` and open `http://127.0.0.1:5175`. This development-only mode reads the ignored `docs/live-public-snapshot.local.json`, blocks writes, and disables paid AI. It is not a live CMS connection and is never installed in production builds. To refresh that public snapshot, run `node scripts/inspect-public-site.mjs` (network required; only the public anonymous credential is used in memory).

Copy `.env.example` to `.env.local` and fill in a **test** Supabase project to exercise content. The historical `supabase-export.sql` contains another person's template data; do not import it into production. Apply the new migration only after following [the migration and rollback instructions](docs/BACKEND.md).

For local API endpoints, run `npm run dev:api` in a second terminal. Vite proxies `/api` to port 3001. Only anonymous Supabase configuration belongs in `VITE_*`. OpenAI and Supabase service credentials belong only in server environment variables.

## Verify

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
npm run test:ui
```

UI verification uses an installed Microsoft Edge via Playwright, an isolated local preview, and mocked assistant requests. It never sends contact messages to real recipients. See [validation and screenshots](docs/VALIDATION.md) for performed checks and limitations.

Before `npm run test:ui`, start `npm run dev -- --host 127.0.0.1 --port 5174 --strictPort` in another terminal. The fixture tests intercept development requests; use port 4173's production preview only for the separately documented performance/screenshot commands.

## Operate and release

- [Text-only chat release and diagnostics](docs/TEXT-CHAT-RELEASE.md): deploy the first chat version and resolve server readiness failures.
- [Live CMS go-live handbook](docs/CMS-GO-LIVE.md): replace fallback copy with published content, understand the read-only preview, and handle CMS edge cases.
- [GitHub activity source and refresh](docs/GITHUB-ACTIVITY.md): public-data validation, cache timing, privacy and failure behavior; no additional key or SQL is needed for the graph.
- [Step-by-step GitHub, Vercel and Supabase setup](docs/DEPLOYMENT-GUIDE.md): the exact commands, environment names, migration file and owner-access SQL for this release.
- [Release procedure](docs/RELEASE.md): preview, staged migration, configuration and production boundary.
- [Backend and AI controls](docs/BACKEND.md): model access, pricing, finite budgets, data eligibility, admin provisioning, cached audio and rollback.
- [HTML rendering](docs/RENDERING.md): crawlable routes, metadata and freshness.
- [Factual content review](docs/CONTENT-REVIEW.md): owner-confirmed claims still needed.
- [Implementation checklist](docs/IMPLEMENTATION-PLAN.md): scope and progress.

No live release is performed by this implementation. Paid answers default off. Contact delivery means storage in the private CMS inbox; email forwarding is not implied.
