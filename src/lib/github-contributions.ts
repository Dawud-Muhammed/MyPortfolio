export const GITHUB_USERNAME = "Dawud-Muhammed";
export const GITHUB_ACTIVITY_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=all`;
export const GITHUB_CACHE_MS = 15 * 60 * 1000;

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}
export interface ContributionData {
  total: Record<string, number>;
  contributions: ContributionDay[];
  fetchedAt: number;
}

/** Public data is validated before any counts or calendar cells are displayed. */
export function parseContributions(value: unknown): ContributionData {
  if (!value || typeof value !== "object")
    throw new Error("Invalid activity response");
  const input = value as Record<string, unknown>;
  if (
    !input.total ||
    typeof input.total !== "object" ||
    Array.isArray(input.total) ||
    !Array.isArray(input.contributions) ||
    input.contributions.length > 20000
  )
    throw new Error("Invalid activity response");
  const total: Record<string, number> = {};
  for (const [year, count] of Object.entries(input.total)) {
    if (
      !/^\d{4}$/.test(year) ||
      Number(year) < 2008 ||
      Number(year) > new Date().getUTCFullYear() ||
      !Number.isSafeInteger(count) ||
      Number(count) < 0
    )
      throw new Error("Invalid activity total");
    total[year] = Number(count);
  }
  if (!Object.keys(total).length) throw new Error("No activity years returned");
  const seen = new Set<string>();
  const sums: Record<string, number> = {};
  const contributions = input.contributions.map(
    (item: unknown): ContributionDay => {
      if (!item || typeof item !== "object")
        throw new Error("Invalid activity day");
      const day = item as Record<string, unknown>;
      if (
        typeof day.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
        !Number.isSafeInteger(day.count) ||
        Number(day.count) < 0 ||
        !Number.isInteger(day.level) ||
        Number(day.level) < 0 ||
        Number(day.level) > 4
      )
        throw new Error("Invalid activity day");
      const date = new Date(`${day.date}T00:00:00Z`);
      if (
        !Number.isFinite(date.getTime()) ||
        date.toISOString().slice(0, 10) !== day.date ||
        seen.has(day.date) ||
        !(day.date.slice(0, 4) in total)
      )
        throw new Error("Invalid activity date");
      seen.add(day.date);
      const year = day.date.slice(0, 4);
      sums[year] = (sums[year] || 0) + Number(day.count);
      if (!Number.isSafeInteger(sums[year]))
        throw new Error("Invalid activity total");
      return {
        date: day.date,
        count: Number(day.count),
        level: Number(day.level),
      };
    },
  );
  if (
    Object.entries(total).some(
      ([year, count]) =>
        count !== (sums[year] || 0) ||
        !contributions.some((day) => day.date.startsWith(year)),
    )
  )
    throw new Error("Incomplete activity response");
  return {
    total,
    contributions: contributions.sort((a, b) => a.date.localeCompare(b.date)),
    fetchedAt: Date.now(),
  };
}

let cached: ContributionData | undefined;
let pending: Promise<ContributionData> | undefined;
export const getCachedContributions = () => cached;

export function loadContributions(force = false): Promise<ContributionData> {
  if (!force && cached && Date.now() - cached.fetchedAt < GITHUB_CACHE_MS)
    return Promise.resolve(cached);
  if (pending) return pending;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const options: RequestInit = {
    credentials: "omit",
    referrerPolicy: "no-referrer",
    signal: controller.signal,
  };
  const request = async () => {
    try {
      return await fetch(GITHUB_ACTIVITY_URL, options);
    } catch (error) {
      if (controller.signal.aborted) throw error;
      // One bounded retry for a dropped connection; never bypass upstream caching.
      await new Promise((resolve) => setTimeout(resolve, 750));
      if (controller.signal.aborted) throw error;
      return fetch(GITHUB_ACTIVITY_URL, options);
    }
  };
  pending = request()
    .then(async (response) => {
      if (!response.ok) throw new Error("GitHub activity is unavailable");
      cached = parseContributions(await response.json());
      return cached;
    })
    .finally(() => {
      clearTimeout(timeout);
      pending = undefined;
    });
  return pending;
}

export function calendarForYear(data: ContributionData, year: number) {
  const start = Date.UTC(year, 0, 1);
  const offset = new Date(start).getUTCDay();
  const length = (Date.UTC(year + 1, 0, 1) - start) / 86400000;
  const dayMap = new Map(
    data.contributions
      .filter((day) => day.date.startsWith(`${year}-`))
      .map((day) => [day.date, day]),
  );
  const cells: (ContributionDay | null)[] = Array.from(
    { length: Math.ceil((length + offset) / 7) * 7 },
    (_, i) => {
      const day = i - offset;
      return day < 0 || day >= length
        ? null
        : dayMap.get(
            new Date(start + day * 86400000).toISOString().slice(0, 10),
          ) || null;
    },
  );
  const months = Array.from({ length: 12 }, (_, month) => ({
    label: new Date(Date.UTC(year, month, 1)).toLocaleDateString("en", {
      month: "short",
      timeZone: "UTC",
    }),
    column:
      Math.floor(((Date.UTC(year, month, 1) - start) / 86400000 + offset) / 7) +
      1,
  }));
  return { cells, months, weeks: cells.length / 7 };
}
