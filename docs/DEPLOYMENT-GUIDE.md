# Publish Dawud’s Systems Studio

Yes: this release needs **the new Supabase SQL migration**, the **Vercel environment variables**, and a **GitHub push**. Start with a preview branch, keep paid AI off, and publish to the live domain after the preview works. This guide describes the steps; it has not pushed code, changed your cloud settings, or run production SQL.

The existing repository is [Dawud-Muhammed/MyPortfolio](https://github.com/Dawud-Muhammed/MyPortfolio). Its local branch was `main` when these instructions were prepared. Your live domain is `https://dawud-muhammed.vercel.app`.

The local review at port 5175 uses a frozen public-content snapshot. A normal production build reads the real Supabase project from Vercel environment variables; it never imports that snapshot. For the exact CMS fields to fill, publication rules, fixed interface labels and missing-content cases, follow [CMS-GO-LIVE.md](CMS-GO-LIVE.md). Content edits need Save/Publish and refresh, while code or environment changes need deployment.

## 1. Save the changes on a preview branch

Open PowerShell in `D:\Projects\MyPortfolio`. Before pushing, check the connected Vercel project's configured **Production Branch**. Pushing to that branch, commonly `main`, can automatically replace your live deployment. A different branch normally creates a preview. [Vercel environments](https://vercel.com/docs/environment-variables)

```powershell
git status --short
git switch -c codex/systems-studio-release
```

If that branch already exists, use `git switch codex/systems-studio-release` instead. Keep this branch out of `main` until the release steps below are complete.

Run the project checks:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Review the changed file names before staging. Keep real environment files and private snapshots out of Git; only `.env.example` belongs in the commit. The repository ignores `.env`, `.env.*` (except `.env.example`), `.vercel/`, `*.local`, and `*.local.json`. Then:

```powershell
git add -A
git diff --cached --name-only
git commit -m "Build Dawud Systems Studio portfolio and secure CMS guide"
git push -u origin codex/systems-studio-release
```

If the staged list contains a file that should stay local, remove it from the staged changes with `git restore --staged -- path-to-file` before committing. GitHub sign-in may be requested by your Git credential manager; no password or token should be added to source files.

On GitHub, open a pull request from `codex/systems-studio-release` into `main`, but leave it unmerged for now. If the existing Vercel project is connected to this GitHub repository, find the branch's preview in **Vercel → your portfolio project → Deployments**. A first build can be redeployed after the following configuration is ready.

## 2. Prepare Supabase without replacing your content

For testing, use a separate Supabase test project with a copy of the existing schema and selected representative records. A “staging project” simply means this isolated test copy. Point Vercel **Preview** variables at that project. Keep production for read-only checks until you are ready to release; do not test CMS writes, unpublishing, or contact submissions against live data.

For your **existing portfolio database**, the required release SQL file is:

```text
supabase/migrations/20261105090000_systems_studio.sql
```

Do not rerun the original create-schema migrations on the existing database. Do not import `supabase-export.sql`: it contains old template content. Do not run `supabase db reset` on the hosted project.

After taking a database backup, open the intended Supabase project and choose **SQL Editor → New query**. Supabase supports running SQL directly from this editor. [Supabase database tools](https://supabase.com/docs/guides/database/overview)

First, this read-only query helps identify whether the release objects already exist:

```sql
select
  to_regclass('public.admin_users') as admin_users,
  to_regclass('public.assistant_settings') as assistant_settings,
  to_regclass('public.content_revision') as content_revision;
```

If all three are absent, and this is the existing portfolio schema before the refactor, copy the **entire contents** of `20261105090000_systems_studio.sql` into a new SQL Editor query and run it once. It includes its own transaction. If those objects already exist, do not blindly rerun the file: some policies, tables, and triggers are intentionally created once. Confirm whether the migration already completed. If it errors or only some objects exist, review the error before continuing; do not remove live tables to make it run.

This migration adds publication fields, project case-study fields, assistant settings, usage controls, and stricter permissions. It retains record IDs and project slugs. Existing public content keeps its visibility; newly created content starts as a draft. It does **not** add the OpenAI key to the database.

## 3. Grant your existing owner account CMS access

The revised CMS requires an explicit owner entry. Being signed in to Supabase Auth alone no longer makes someone an administrator.

In Supabase, go to **Authentication → Users**, open the existing account you use for the portfolio admin, and copy its **User UID**. Use that Auth user UUID, not the profile row ID, project ID, or API key. [Supabase Auth users](https://supabase.com/docs/guides/auth/users)

After the migration succeeds, run this in the same project's SQL Editor, replacing the placeholder with your actual existing Auth UUID:

```sql
insert into public.admin_users (user_id)
values ('REPLACE-WITH-YOUR-EXISTING-AUTH-USER-UUID')
on conflict (user_id) do nothing;
```

You can confirm that account's membership with:

```sql
select user_id
from public.admin_users
where user_id = 'REPLACE-WITH-YOUR-EXISTING-AUTH-USER-UUID';
```

Then sign in to `/admin/login` with that account's normal email and password. If the UUID does not exist in `auth.users`, the insert fails rather than creating a new identity. Do not promote every user or restore the old broad write policies.

## 4. Add the exact environment variables in Vercel

Open **Vercel → your portfolio project → Settings → Environment Variables**. Add each name and its value; select **Preview** first, using staging credentials. Vercel supports adding variables individually or importing several at once. Changes take effect only in a **new deployment**, so redeploy after saving. [Vercel environment setup](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables)

Use `.env.example` as the list of names. Do not copy real secrets into that tracked example. The placeholders below are not working credentials.

These three values are allowed in the browser:

```dotenv
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-SUPABASE-PUBLIC-ANON-OR-PUBLISHABLE-KEY
VITE_SITE_URL=https://dawud-muhammed.vercel.app
```

These values belong to Vercel's server configuration:

```dotenv
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SUPABASE-SERVER-SECRET-OR-SERVICE-ROLE-KEY
SITE_URL=https://dawud-muhammed.vercel.app
ASSISTANT_SESSION_SECRET=YOUR-OWN-RANDOM-SECRET-AT-LEAST-32-CHARACTERS
OPENAI_API_KEY=YOUR-OPENAI-PROJECT-API-KEY
ASSISTANT_ENABLED=false
ASSISTANT_MODEL=gpt-6-luna
ASSISTANT_DAILY_USD=0.50
ASSISTANT_MONTHLY_USD=5
ASSISTANT_TOTAL_USD=10
```

Leave `ASSISTANT_PRICING_VERIFIED` **unset** for the first deployment. The paid guide remains disabled. You may omit `OPENAI_API_KEY` until you are ready to configure AI; the portfolio and cached introduction do not require it.

For Preview, use the preview/test site's intended URL for `SITE_URL` and `VITE_SITE_URL` if you have a stable preview domain. Use the live URL above for Production. Include `https://` and omit a trailing slash. The handler also accepts Vercel's own deployment origin through the automatically supplied `VERCEL_URL`, so you do not need to create that system variable yourself.

Both Supabase URL variables must refer to the same intended project, and both keys must belong to it. Find the keys in the project's **Settings → API Keys**. A public publishable/legacy `anon` key goes in `VITE_SUPABASE_ANON_KEY`; a backend secret/legacy `service_role` key goes only in `SUPABASE_SERVICE_ROLE_KEY`. The environment variable names are fixed by this project's code even if the dashboard uses newer key terminology. Secret keys have elevated database access and must never be placed in browser variables or committed to Git. [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)

Generate `ASSISTANT_SESSION_SECRET` with a password manager as a long random value, save it directly in Vercel, and keep it stable. It is also required by the contact endpoint, even when AI is disabled. Mark `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ASSISTANT_SESSION_SECRET` as Secret/Sensitive where Vercel offers that control. Never create `VITE_OPENAI_API_KEY` or a `VITE_` service-role variable.

Do not paste the whole OpenAI configuration from another project. This implementation reads `OPENAI_API_KEY` and the `ASSISTANT_*` variables above; the model selected in your coding editor does not configure the website.

## 5. Redeploy and check the preview

In Vercel, redeploy the preview branch after saving its variables. Keep the existing root directory and the repository's `vercel.json`; it declares `npm run build`, `dist`, server functions, and public-route rewrites. The Node runtime must satisfy `package.json` (`>=22.12.0`).

Check the preview homepage, all public routes, both themes, project detail links, and `/admin/login`. In the staging CMS, edit an isolated record, publish it, and unpublish it; verify the public page follows the change. Verify ordinary non-owner users cannot edit content. Test the contact form only in staging: success means the message was saved in **Admin → Messages**, not that an email was sent. No email delivery service was added.

Opening `/api/assistant` in the preview should return configuration with `enabled:false` at this stage. The portrait launcher and fixed introduction should still work; paid answers are intentionally paused. If the site reports unavailable content, first confirm the matching Supabase URLs/keys and the migration, then inspect the Vercel build/function error without logging secret values.

## 6. Enable paid answers only after verification

The first deployment can remain fully usable with AI disabled. To enable text answers later:

1. In the CMS, mark only reviewed, published profile/project/service/experience/FAQ records as eligible for assistant knowledge.
2. Confirm that your actual OpenAI project can access `gpt-6-luna` and that the reviewed pricing in `server/assistant-core.mjs` still matches the intended Standard tier. No live account-access verification or paid request is performed by this guide. The release's pricing research and accounting assumptions are documented in [BACKEND.md](./BACKEND.md).
3. The current implementation recognizes the reviewed contract marker `ASSISTANT_PRICING_VERIFIED=2026-11-05`. Set it only after completing that check. Do not substitute today's date: this marker is matched exactly by the code. If the model or pricing has changed, update and retest the server pricing contract before enabling it.
4. For isolated live staging evaluation, set `ASSISTANT_TOTAL_USD=1` or lower so the implementation verification allocation cannot exceed $1. Keep a separate staging database/ledger. The normal release defaults remain $0.50/day, $5/month, and $10 lifetime application allocation.
5. Set Vercel `ASSISTANT_ENABLED=true`, redeploy, and turn on **Admin → AI Guide → Enabled**. Both switches are required. Missing keys, pricing review, or metering keep paid requests disabled.

These are estimated application limits, not your provider's current credit balance. Never delete the usage ledger to reset the lifetime limit. For a quick stop, turn off the CMS guide switch; also set the server switch back to `false` and redeploy.

## 7. Release to the live domain

When you accept the preview, back up production, apply the **same new migration once** to the existing production Supabase project, and immediately provision your existing production owner UUID. Do not copy staging fixture rows into production. Avoid using the old CMS during this database/deployment transition.

Add the Production-scoped Vercel variables with the production Supabase project and live domain; keep `ASSISTANT_ENABLED=false` for the initial production release. Then merge the reviewed GitHub pull request into the configured Production Branch, commonly `main`. That merge normally triggers Vercel's production deployment. If automatic Git deployments are disabled, deploy the reviewed commit from the existing Vercel project instead.

Once Vercel reports success, check the live public pages and owner sign-in without writing test content or sending contact messages. Enable paid AI separately after its verification steps. A Vercel environment-variable update does not change an already-built deployment; redeploy to apply it. [Vercel deployment environment behavior](https://vercel.com/docs/environment-variables)

The optional spelling correction is separate from the required migration:

```text
supabase/maintenance/correct-verified-education-spelling.sql
supabase/maintenance/rollback-verified-education-spelling.sql
```

Run the correction only if you choose to fix the verified education spelling in the stored content. It does not change dates or credentials and is **not applied automatically**. The paired script can restore the original values if they have not subsequently been edited. Detailed migration, rollback, knowledge and budget operations are in [BACKEND.md](./BACKEND.md) and [RELEASE.md](./RELEASE.md).

## Troubleshooting

- **Push succeeded, but the live site is unchanged:** check the deployment's commit, branch, environment, and status. A preview branch does not update the production domain. The configured production branch is under **Settings → Environments → Production → Branch Tracking**. [Vercel Git deployments](https://vercel.com/docs/git)
- **Environment changes appear ignored:** confirm the variables apply to the deployment's Preview/Production environment, then use **Deployments → selected deployment → … → Redeploy**. `VITE_*` values are embedded during build; editing settings or refreshing the browser cannot change an old bundle. Open the new deployment URL. If stale build output is suspected, redeploy without the existing build cache. [Vercel redeployment](https://vercel.com/docs/deployments/managing-deployments#redeploy-a-project), [Vite environment replacement](https://vite.dev/guide/env-and-mode)
- **Server HTML and browser content disagree:** match `SUPABASE_URL` with `VITE_SUPABASE_URL` and use keys from that same project. If an older optional `SUPABASE_ANON_KEY` exists in Vercel, align or remove it: the HTML function uses it ahead of `VITE_SUPABASE_ANON_KEY`. Never substitute a service-role key for either public key. See [environment setup](#4-add-the-exact-environment-variables-in-vercel).
- **Missing columns/functions or HTTP 503:** confirm the release migration completed in the project the deployment actually uses. Fields such as `is_published`, `publication_status`, and hero availability are required. Do not rerun the historical schema/seed or remove tables to resolve an error. See [migration steps](#2-prepare-supabase-without-replacing-your-content).
- **CMS access denied, permission error `42501`, or zero rows changed:** check the signed-in account and its existing Auth UUID in `admin_users`, then sign in again if its session expired. A successful login alone does not grant editing rights. Running `is_admin()` in SQL Editor without a user JWT is not a signed-in CMS test. Check grants and policies without disabling RLS. [Owner setup](#3-grant-your-existing-owner-account-cms-access), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- **A saved item is absent publicly:** new records start as drafts. Publish the item; project lifecycle status such as Live is separate from publication. Articles need the CMS `Published` status and a non-null publication date that has arrived. Public queries deliberately use anonymous access even while the owner is signed in. CMS content changes do not require deployment: reload/refocus the public tab or allow its visible-page refresh interval of up to 30 seconds.
- **Contact/AI returns 403:** `SITE_URL` must exactly match the intended origin, including `https://` and excluding a trailing slash. A custom preview alias needs that matching value; the automatic `VERCEL_URL` covers the deployment's own origin. **Contact fails with AI off:** it still needs server Supabase credentials, the migration, and `ASSISTANT_SESSION_SECRET`. A successful submission is stored in the private CMS inbox, not delivered by email.
- **AI remains paused:** check both enable switches, the server-only key, exact pricing-review marker, eligible published knowledge, and durable budget controls. Do not delete reservations to clear an exhausted allowance. See [AI enablement](#6-enable-paid-answers-only-after-verification).
- **Local `dist` works but APIs/SEO do not:** `npm run preview` serves the frontend; it does not emulate Vercel functions. `npm run dev:api` serves only assistant/contact locally. On Vercel, keep the current `vercel.json`: public routes use `api/page.js`, `dist/index.html` is included with that function, and `/api/*`, assets, and audio are excluded from the catchall. Verify deployed deep links and initial HTML on the actual preview.
- **An unpublished image URL still opens:** public Storage objects remain accessible through their URLs; unpublishing a database row does not revoke a public file. Use private storage and signed URLs for private files. Database backups do not include the actual Storage objects. [Storage access model](https://supabase.com/docs/guides/storage/buckets/fundamentals), [database backup scope](https://supabase.com/docs/guides/database/overview)
- **Rolling back the Vercel deployment:** this does not revert SQL or environment values baked into the older build. The old CMS may be incompatible with the tightened policies. Preserve explicit owner permissions and ledger history; do not restore broad authenticated writes. Follow the reviewed [rollback procedure](./BACKEND.md#apply-to-localstaging-then-prepare-production).
