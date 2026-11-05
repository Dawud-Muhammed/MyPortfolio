# GitHub activity on the homepage

The calendar represents **Dawud-Muhammed’s published GitHub contribution counts**, with a year selector and a direct [GitHub profile link](https://github.com/Dawud-Muhammed). Counts are contributions, not a claim about hours worked, repository quality, or paid experience.

The implementation uses a small React/CSS grid and the public contributions API; no GitHub token, new backend, Supabase migration, OpenAI call, or extra calendar package is needed. The upstream `react-github-calendar` version inspected was 5.0.9, with React peers `^18.0.0 || ^19.0.0`, compatible with this repository’s React 18.3.1. Its underlying `react-activity-calendar` also supports React 18. The custom grid keeps styling, keyboard interaction, and data validation within this application. [Calendar package contract](https://raw.githubusercontent.com/grubersjoe/react-github-calendar/main/package.json)

## Data contract

The browser makes one public request to:

```text
https://github-contributions-api.jogruber.de/v4/Dawud-Muhammed?y=all
```

The service scrapes the public GitHub profile. It returns `total`, keyed by year, plus `contributions` containing `{date, count, level}`: ISO calendar dates, contribution counts, and intensity levels 0–4. The API also supports `?y=2026`, repeated `?y=2025&y=2026`, and rolling-year `?y=last`; the latter uses a different total key. This site fetches all years once and switches years locally. [Upstream API documentation](https://github.com/grubersjoe/github-contributions-api)

Validate unique real dates, nonnegative safe integer counts, levels 0–4, year keys, and agreement between yearly totals and daily sums before rendering. Sort by date: the observed response contained descending year blocks, not one globally ascending array. Select the current UTC year when available, otherwise the latest returned year. Keep missing days blank and mark future dates as future; never manufacture activity or turn a request failure into a zero-contribution result.

## Refresh and failure behavior

Application caching uses a 15-minute lifetime for public data, deduplicates simultaneous requests, and checks for expiry on focus/visibility or once a minute while the page is visible. Failed automatic refreshes are throttled for one minute. A dropped transport connection gets at most one delayed retry using the same abort signal; HTTP and malformed-data errors do not trigger that retry. The upstream service caches for **one hour**, so checking again does not guarantee newer GitHub counts. Its uncached request limit is 10 per 10 seconds per IP. Do not bypass that cache routinely. Show when the browser fetched the data and retain an honest cached/error state plus the profile link when retrieval fails. [Upstream cache and limits](https://github.com/grubersjoe/github-contributions-api#caching)

This is a third-party public service, not an official GitHub API. Direct browser requests disclose normal request metadata, including the visitor’s IP, to that service; no application credentials or visitor conversations are sent. A service outage or GitHub markup change can interrupt the calendar without affecting the portfolio’s ordinary navigation.

## Visibility and verification

GitHub can include anonymized private-repository contribution counts if the owner enables **Profile → Contribution settings → Private contributions**. Repository names, code, and private activity details remain unavailable to this calendar. Its data follows what the public profile exposes; changing that setting may take the upstream cache interval to appear. [GitHub contribution visibility](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/manage-visibility-settings-for-private-contributions-and-achievements)

On 5 November 2026, the live endpoint returned HTTP 200, `Access-Control-Allow-Origin: *`, `Age: 0`, and `X-Cache: MISS`; no `Cache-Control` response header was present. The 30,720-byte response contained 730 days: 2025 total **3**, and 2026 total **327**, both equal to their daily sums. The 2026 range included all 365 dates through 31 December, including 56 future zero entries after 5 November; the latest nonzero entry was 4 November, count 5. These are dated verification observations, not values to hardcode.

The actual public response is saved only for local QA in ignored `docs/github-contributions.local.json`. It contains no token or private repository records, is not a production fallback, and must not be presented as permanently current. No account settings were changed.
