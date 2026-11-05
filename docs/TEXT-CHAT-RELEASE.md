# Text-only assistant release

The first version now supports typed questions and text replies only. The long introduction, all audio controls/playback code, audio settings in the editor, and bundled WAV are removed. Existing database columns/storage objects are retained for compatibility; no destructive SQL or voice migration is needed.

## Confirmed deployed state

Public read-only checks on 5 November 2026 found that the site's public Supabase connection works, `assistant_settings.enabled` is true, and `content_revision` exists. The deployed legacy `/api/assistant` nevertheless returned `enabled:false, revision:null`. In that version, this is its catch-all configuration fallback, not proof that the owner switch is off or that an OpenAI request failed. No paid request was made.

The screenshot follow-up showed masked integration values, including `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `VITE_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`; plain `SUPABASE_URL` was not visible. Masking does not establish an empty value. The deployed legacy API still lacked the current `reason`/`availability` fields. Deploy the latest code: its trusted client accepts those integration URL/key aliases without requiring duplicate secret variables. PostgreSQL connection strings are not used by that client. For the custom domain, configure `SITE_URL` and `VITE_SITE_URL` as `https://dawud.pro.et`.

## Release and diagnose

1. Push/deploy the current code to the existing Vercel project. Select the Production environment for its server variables, then redeploy after any variable change.
2. Verify `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` is the server key belonging to the same project as the public CMS. It is required for durable metering and approved retrieval. `VITE_SUPABASE_ANON_KEY` cannot replace it. The URL can come from `SUPABASE_URL`, `VITE_SUPABASE_URL`, or `NEXT_PUBLIC_SUPABASE_URL`, in that order. Blank aliases are skipped.
3. Keep `OPENAI_API_KEY`, a random `ASSISTANT_SESSION_SECRET` of at least 32 characters, the reviewed model/pricing marker, and positive spending limits configured. Never paste secret values into chat or Git. Leave owner/server switches enabled only when you intend paid chat to run.
4. Use `SITE_URL=https://dawud.pro.et` and `VITE_SITE_URL=https://dawud.pro.et` for the live custom domain. Both variables are checked independently, alongside Vercel's deployment/production URLs. Browser requests from a custom alias also pass when `Sec-Fetch-Site: same-origin` and Origin matches the actual request Host over HTTPS in production. Forwarded-host headers alone never establish trust. Foreign and missing origins remain denied. Trailing slash/outer whitespace normalize safely.
5. Open Admin → AI Guide → **Chat readiness**. Refresh its status after saving settings. This uses a free GET, not a paid answer. Approve at least one published profile/project/service/experience/FAQ for actual portfolio answers.
6. Ask a short question after readiness is ready. This last step needs valid account/model access and functional database metering; a configuration check alone cannot certify provider access.

The public endpoint returns a nonsecret reason code; the admin panel explains the corresponding action. It never returns keys, raw provider errors, or private records:

- `server_configuration`: missing/invalid trusted Supabase URL or server key.
- `settings_configuration`: server cannot read the correct `assistant_settings` row. Check project/key and base migration.
- `content_configuration`: revision lookup failed; verify the base migration and server connection.
- `model_or_limits_configuration`: unsupported model or invalid spending limits.
- `server_disabled` / `owner_disabled`: turn on the corresponding switch.
- `pricing_unverified`: this release expects the reviewed `2026-11-05` marker.
- `api_key_missing` / `session_secret_invalid`: correct the named server value and redeploy.
- `origin_mismatch`: the browser page's domain failed the same check used for sending a question. Correct the site URLs and deploy this release. Browser readiness checks now test the domain using Origin/Referer; a direct GET without either header can only certify server configuration.
- `ready`: configuration checks passed; no paid request was made by that check.

Run `node scripts/check-deployed-chat.mjs https://dawud.pro.et` for a public-only deployment check. Its anonymous client key is read from already-public JS, held in memory, and never logged/saved. Vercel logs now include safe configuration reason codes and provider HTTP status/error code, without prompts or credential values.

Chat retains source validation, cancellation, bounded output/input, revision checks, rate limits and atomic credit reservations. A 28-second client timeout prevents endless loading. Provider output uses the supported structured schema; the answer's character limit is enforced locally. Optional portrait/FAQ display failures no longer disable otherwise configured chat.

No production configuration, database content or deployment was changed by this local implementation. Real paid model responses have not been verified with the owner's server-only key.

Origin checks use browser-controlled Fetch Metadata as described in the [W3C specification](https://www.w3.org/TR/fetch-metadata/); automatic deployment/production host variables follow [Vercel's system environment documentation](https://vercel.com/docs/environment-variables/system-environment-variables). The same runtime check also protects the contact endpoint.
