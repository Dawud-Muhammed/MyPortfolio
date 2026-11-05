import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Synthetic fixtures only. Never contact GitHub or depend on a local QA snapshot.
const source = await readFile(new URL('../src/lib/github-contributions.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2020 },
}).outputText;
let moduleNumber = 0;
const freshModule = () => import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#test-${moduleNumber++}`);
const { parseContributions, calendarForYear } = await freshModule();

function fullYear(year) {
  const contributions = [];
  const start = Date.UTC(year, 0, 1);
  for (let time = start; time < Date.UTC(year + 1, 0, 1); time += 86400000) {
    const date = new Date(time).toISOString().slice(0, 10);
    const count = date.endsWith('-01-01') ? 2 : date.endsWith('-02-29') ? 3 : date.endsWith('-12-31') ? 4 : 0;
    contributions.push({ date, count, level: count === 0 ? 0 : count === 2 ? 1 : count === 3 ? 2 : 4 });
  }
  return { total: { [year]: contributions.reduce((sum, day) => sum + day.count, 0) }, contributions };
}
const oneDay = (overrides = {}) => ({ total: { 2024: 1 }, contributions: [{ date: '2024-01-01', count: 1, level: 1, ...overrides }] });

test('validates full-year public-shaped fixtures and preserves exact totals', () => {
  const fixture = fullYear(2024);
  const before = Date.now();
  const parsed = parseContributions(fixture);
  assert.equal(parsed.total['2024'], 9);
  assert.equal(parsed.contributions.length, 366);
  assert.equal(parsed.contributions.reduce((sum, day) => sum + day.count, 0), 9);
  assert(parsed.fetchedAt >= before && parsed.fetchedAt <= Date.now());
  assert.equal(parsed.contributions.find(day => day.date === '2024-02-29').count, 3);
});

test('sorts descending year blocks and unsorted days without mutating the input', () => {
  const older = fullYear(2024), newer = fullYear(2025);
  const fixture = { total: { ...newer.total, ...older.total }, contributions: [...newer.contributions].reverse().concat([...older.contributions].reverse()) };
  const firstInput = fixture.contributions[0].date;
  const parsed = parseContributions(fixture);
  assert.equal(parsed.contributions[0].date, '2024-01-01');
  assert.equal(parsed.contributions.at(-1).date, '2025-12-31');
  assert.equal(parsed.contributions.length, 731);
  assert.equal(fixture.contributions[0].date, firstInput);
  assert.equal(parsed.total['2025'], 6);
});

test('rejects malformed, empty and overlarge responses', () => {
  for (const value of [null, 1, 'data', [], {}, { total: [], contributions: [] }, { total: {}, contributions: [] },
    { total: { 2024: 0 }, contributions: [] }, { total: { 2024: 0 }, contributions: [null] },
    { total: { 2024: 0 }, contributions: Array(20001).fill({ date: '2024-01-01', count: 0, level: 0 }) }]) {
    assert.throws(() => parseContributions(value));
  }
});

test('rejects duplicate dates, invalid ISO dates and days outside declared years', () => {
  for (const date of ['2024-02-30', '2025-02-29', '2024-13-01', '2024-00-01', '2024-01-00', '2024-1-01', '2024-01-01T00:00:00Z', '2023-01-01']) {
    assert.throws(() => parseContributions(oneDay({ date })), date);
  }
  const duplicate = oneDay();
  duplicate.total['2024'] = 2;
  duplicate.contributions.push({ ...duplicate.contributions[0] });
  assert.throws(() => parseContributions(duplicate));
});

test('rejects negative, fractional, nonnumeric and unsafe counts or levels', () => {
  for (const count of [-1, 1.5, '1', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => parseContributions(oneDay({ count })));
  }
  for (const level of [-1, 5, 0.5, '1', NaN, Infinity]) {
    assert.throws(() => parseContributions(oneDay({ level })));
  }
});

test('rejects invalid years, totals mismatches and sums that overflow safe integers', () => {
  for (const total of [{ lastYear: 1 }, { 2007: 1 }, { [new Date().getUTCFullYear() + 1]: 1 }, { 2024: -1 }, { 2024: '1' }, { 2024: 2 }, { 2024: 1, 2025: 0 }]) {
    assert.throws(() => parseContributions({ ...oneDay(), total }));
  }
  assert.throws(() => parseContributions({ total: { 2024: Number.MAX_SAFE_INTEGER }, contributions: [
    { date: '2024-01-01', count: Number.MAX_SAFE_INTEGER, level: 4 }, { date: '2024-01-02', count: 1, level: 1 },
  ] }));
});

test('UTC weekday and month positions align through leap day and year boundaries', () => {
  const calendar = calendarForYear(parseContributions(fullYear(2024)), 2024);
  assert.equal(calendar.weeks, 53);
  assert.equal(calendar.cells.length, 371);
  assert.equal(calendar.cells[0], null); // 1 January 2024 was Monday; Sunday starts the column.
  assert.equal(calendar.cells[1].date, '2024-01-01');
  assert.equal(calendar.cells[60].date, '2024-02-29');
  assert.equal(60 % 7, 4); // Thursday.
  assert.equal(calendar.cells[366].date, '2024-12-31');
  assert(calendar.cells.slice(367).every(day => day === null));
  assert.deepEqual(calendar.months.filter(month => ['Jan', 'Feb', 'Mar', 'Dec'].includes(month.label)), [
    { label: 'Jan', column: 1 }, { label: 'Feb', column: 5 }, { label: 'Mar', column: 9 }, { label: 'Dec', column: 49 },
  ]);
  const ordinary = calendarForYear(parseContributions(fullYear(2025)), 2025);
  assert.equal(ordinary.cells.filter(Boolean).length, 365);
  assert(ordinary.cells.slice(0, 3).every(day => day === null));
  assert.equal(ordinary.cells[3].date, '2025-01-01'); // Wednesday.
});

test('missing dates remain null and are distinguishable from a returned zero-count date', () => {
  const sparse = parseContributions({ total: { 2024: 2 }, contributions: [
    { date: '2024-01-01', count: 0, level: 0 }, { date: '2024-04-02', count: 2, level: 1 },
  ] });
  const calendar = calendarForYear(sparse, 2024);
  assert.deepEqual(calendar.cells[1], { date: '2024-01-01', count: 0, level: 0 });
  assert.equal(calendar.cells[2], null);
  assert.equal(calendar.cells.filter(Boolean).length, 2);
  assert(calendarForYear(sparse, 2025).cells.every(day => day === null));
});

test('fetching deduplicates concurrent requests and reuses the cached validated response', async () => {
  const module = await freshModule();
  const originalFetch = globalThis.fetch;
  let calls = 0, release;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, module.GITHUB_ACTIVITY_URL);
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    assert(options.signal instanceof AbortSignal);
    await new Promise(resolve => { release = resolve; });
    return { ok: true, json: async () => fullYear(2024) };
  };
  try {
    const first = module.loadContributions(), second = module.loadContributions();
    assert.strictEqual(first, second);
    assert.equal(calls, 1);
    release();
    const result = await first;
    assert.strictEqual(await second, result);
    assert.strictEqual(await module.loadContributions(), result);
    assert.strictEqual(module.getCachedContributions(), result);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = originalFetch; }
});

test('expired cache refreshes and failed or malformed refreshes preserve the last good snapshot', async () => {
  const module = await freshModule();
  const originalFetch = globalThis.fetch, originalNow = Date.now;
  let calls = 0, mode = 'valid', now = originalNow();
  Date.now = () => now;
  globalThis.fetch = async () => {
    calls++;
    return { ok: mode !== 'http-error', json: async () => mode === 'malformed' ? { total: {}, contributions: [] } : fullYear(2024) };
  };
  try {
    const initial = await module.loadContributions();
    now += module.GITHUB_CACHE_MS - 1;
    assert.strictEqual(await module.loadContributions(), initial);
    assert.equal(calls, 1);
    now += 2;
    const refreshed = await module.loadContributions();
    assert.notStrictEqual(refreshed, initial);
    assert.equal(calls, 2);
    mode = 'http-error';
    await assert.rejects(module.loadContributions(true));
    assert.strictEqual(module.getCachedContributions(), refreshed);
    mode = 'malformed';
    await assert.rejects(module.loadContributions(true));
    assert.strictEqual(module.getCachedContributions(), refreshed);
    mode = 'valid';
    assert.equal((await module.loadContributions(true)).total['2024'], 9);
    assert.equal(calls, 5); // Pending promise was cleared after both failures.
  } finally { globalThis.fetch = originalFetch; Date.now = originalNow; }
});

test('a transient transport rejection retries once with the same abort budget and validates the result', async () => {
  const module = await freshModule();
  const originalFetch = globalThis.fetch;
  const attempts = [];
  globalThis.fetch = async (url, options) => {
    attempts.push({ url, options });
    if (attempts.length === 1) throw new TypeError('Synthetic dropped connection');
    return { ok: true, json: async () => fullYear(2024) };
  };
  try {
    const first = module.loadContributions(), concurrent = module.loadContributions();
    assert.strictEqual(first, concurrent);
    const result = await first;
    assert.equal(attempts.length, 2);
    assert.strictEqual(attempts[0].options.signal, attempts[1].options.signal);
    assert.equal(attempts[1].options.signal.aborted, false);
    assert.equal(attempts[1].options.cache, undefined);
    assert.equal(attempts[1].options.credentials, 'omit');
    assert.equal(result.total['2024'], 9);
    assert.strictEqual(module.getCachedContributions(), result);
    assert.strictEqual(await module.loadContributions(), result);
    assert.equal(attempts.length, 2);
  } finally { globalThis.fetch = originalFetch; }
});

test('repeated transport rejection stops after two attempts and retains the last good data', async () => {
  const module = await freshModule();
  const originalFetch = globalThis.fetch;
  let calls = 0, failing = false;
  globalThis.fetch = async () => {
    calls++;
    if (failing) throw new TypeError('Synthetic persistent transport failure');
    return { ok: true, json: async () => fullYear(2024) };
  };
  try {
    const previous = await module.loadContributions();
    assert.equal(calls, 1);
    failing = true;
    await assert.rejects(module.loadContributions(true), /Synthetic persistent transport failure/);
    assert.equal(calls, 3); // Initial successful request plus exactly two failed attempts.
    assert.strictEqual(module.getCachedContributions(), previous);
    assert.strictEqual(await module.loadContributions(), previous);
    assert.equal(calls, 3);
    failing = false;
    assert.equal((await module.loadContributions(true)).total['2024'], 9);
    assert.equal(calls, 4); // A later user retry is allowed; no failure promise remains stuck.
  } finally { globalThis.fetch = originalFetch; }
});
