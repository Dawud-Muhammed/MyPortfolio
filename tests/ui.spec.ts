import { test, expect, type Page } from '@playwright/test';

const assistantName = "Dawud's AI Assistant";
const contributionApi = 'https://github-contributions-api.jogruber.de/v4/Dawud-Muhammed*';
const contributionYear = new Date().getUTCFullYear();
// Complete deterministic annual fixtures: these numbers are not Dawud's activity.
function contributionFixture(year: number, empty = false) {
  const contributions: { date: string; count: number; level: number }[] = [];
  const cursor = new Date(Date.UTC(year, 0, 1));
  while (cursor.getUTCFullYear() === year) {
    const date = cursor.toISOString().slice(0, 10);
    const day = date.slice(5);
    const count = empty ? 0 : day === '01-07' ? (year === contributionYear ? 3 : 4) : day === '01-08' && year === contributionYear ? 6 : 0;
    contributions.push({ date, count, level: count > 4 ? 4 : count > 0 ? 2 : 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { total: { [year]: contributions.reduce((sum, day) => sum + day.count, 0) }, contributions };
}
async function githubFixtures(page: Page, options: { empty?: boolean } = {}) {
  await page.route(contributionApi, async route => {
    const requestedYear = new URL(route.request().url()).searchParams.get('y');
    const result = requestedYear === 'all'
      ? { total: { [contributionYear]: options.empty ? 0 : 9, [contributionYear - 1]: options.empty ? 0 : 4 }, contributions: [...contributionFixture(contributionYear - 1, options.empty).contributions, ...contributionFixture(contributionYear, options.empty).contributions] }
      : contributionFixture(Number(requestedYear) || contributionYear, options.empty);
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(result) });
  });
}

const browserDiagnostics = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  await githubFixtures(page);
  test.info().annotations.push({ type: 'fixture', description: 'All GitHub contribution API data in this suite is synthetic browser-routed data, not portfolio evidence.' });
  const diagnostics: string[] = [];
  browserDiagnostics.set(page, diagnostics);
  page.on('pageerror', error => diagnostics.push(`PAGE ERROR: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') diagnostics.push(`CONSOLE: ${message.text()}`); });
  page.on('requestfailed', request => diagnostics.push(`REQUEST FAILED: ${request.method()} ${request.url()} ${request.failure()?.errorText}`));
  page.on('response', response => { if (response.status() >= 400) diagnostics.push(`HTTP ${response.status()}: ${response.url()}`); });
});
test.afterEach(async ({ page }, testInfo) => {
  const diagnostics = browserDiagnostics.get(page) || [];
  if (diagnostics.length) await testInfo.attach('browser-diagnostics', { body: diagnostics.join('\n'), contentType: 'text/plain' });
});

// Every fixture is isolated in browser routing: no production database/provider
// writes or contact delivery. No-CMS screenshots still use synthetic GitHub data.
const imageUrl = 'https://fixtures.example/preview.svg';
const picture = '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600"><rect width="960" height="600" fill="#173b43"/><text x="50" y="300" fill="#d6eff1" font-size="32">TEST FIXTURE — not portfolio evidence</text></svg>';
const guide = { enabled: true, greeting: 'Test portfolio guide greeting.', portrait_url: null, greeting_audio_url: null as string | null, audio_is_synthetic: true, faqs: [{ id: 'faq', question: 'Test FAQ', answer: 'An isolated test answer.' }], suggested_questions: ['Tell me about the test project.'], revision: '1' };
function content() {
  return {
    profile: [{ id: 'profile', name: 'Dawud Muhammed', title: 'TEST FIXTURE profile', bio: 'Synthetic biography used only for browser verification.', email: 'fixture@example.test', location: 'Test location', is_published: true, profile_picture_url: imageUrl }],
    hero_content: [{ id: 'hero', kicker: 'TEST FIXTURE CONTENT', headline: 'Thoughtfully built.', highlighted_word: 'From the inside out.', subheadline: 'Synthetic project content used only for local verification.', availability_status: true, availability_label: 'TEST FIXTURE availability', is_published: true }],
    projects: [
      { id: 'p1', title: 'TEST FIXTURE — Backend System', slug: 'test-backend', excerpt: 'A synthetic backend project for browser verification.', description: 'Test implementation overview.', status: 'Prototype', is_featured: true, publication_status: 'published', cover_image_url: imageUrl, gallery: [imageUrl, imageUrl + '?second'], gallery_captions: ['Test dashboard view', 'Test configuration view'], technologies: [{ technology: { id: 't1', name: 'PostgreSQL' } }], category_id: 'cat', category: { id: 'cat', name: 'Backend' }, problem: 'A synthetic test problem.', role: 'Test contributor', team_contribution: 'Synthetic collaboration description.', evidence: 'Local test evidence only.', outcomes: 'No real-world outcome is claimed.', order_index: 1 },
      { id: 'p2', title: 'TEST FIXTURE — Interface', slug: 'test-interface', excerpt: 'Another isolated project.', description: 'Test description.', status: 'Prototype', is_featured: true, publication_status: 'published', technologies: [], gallery: [], order_index: 2 },
      { id: 'draft', title: 'PRIVATE DRAFT MUST NEVER APPEAR', slug: 'draft', publication_status: 'draft', technologies: [], order_index: 3 },
    ],
    project_categories: [{ id: 'cat', name: 'Backend', is_published: true, order_index: 1 }, { id: 'empty', name: 'Empty category', is_published: true, order_index: 2 }],
    blog_posts: [{ id: 'post', title: 'TEST FIXTURE — Article', slug: 'test-article', excerpt: 'A synthetic article.', content: '# TEST FIXTURE — Article\n\nA fact [cite: 1].\n\n```js\nconst answer = 42;\n```\n\n' + 'word '.repeat(210), status: 'Published', published_at: '2026-11-05T00:00:00Z', tags: [] }, { id: 'draft', title: 'PRIVATE BLOG DRAFT', slug: 'draft', status: 'Draft' }],
    gallery_items: [{ id: 'photo', image_url: imageUrl, caption: 'TEST FIXTURE gallery caption', alt_text: 'Synthetic test image', tags: ['Test'], is_published: true }],
    navigation_items: [], social_links: [], seo_settings: [], website_settings: [], blog_categories: [], published_blog_comments: [], services: [], experience: [], education: [], skills: [], certifications: [], achievements: [], faqs: [],
  };
}
async function fixtures(page: Page, tables = content()) {
  await page.route('**/src/lib/supabase.ts*', async route => {
    const response = await route.fetch();
    let source = await response.text();
    source = source.replace(/const supabaseUrl = [^\n]+;/, 'const supabaseUrl = "https://fixtures.supabase.test";').replace(/const supabaseAnonKey = [^\n]+;/, 'const supabaseAnonKey = "isolated-public-fixture";');
    await route.fulfill({ response, body: source });
  });
  await page.route('https://fixtures.supabase.test/rest/v1/**', async route => {
    const address = new URL(route.request().url());
    const table = address.pathname.split('/').pop()! as keyof typeof tables;
    const rows = (tables[table] || []).filter(row => [...address.searchParams].every(([key, value]) => !value.startsWith('eq.') || String((row as unknown as Record<string, unknown>)[key]) === value.slice(3)));
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(rows) });
  });
  await page.route('https://fixtures.example/**', route => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: picture }));
  await page.route('**/api/assistant', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(guide) }));
  return tables;
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
}

test('no-CMS portfolio with synthetic GitHub data: responsive themes and ordinary navigation', async ({ page }) => {
  // Five cold navigations and ten full-page captures need their own cumulative budget.
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Selected Work' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact Me', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: assistantName, exact: true })).toBeVisible();
    for (const theme of ['light', 'dark']) {
      await page.getByLabel('Color theme').selectOption(theme);
      await noOverflow(page);
      if ([390, 1440].includes(width)) await page.screenshot({ path: `artifacts/screenshots/no-cms-synthetic-github-${theme}-${width}.png`, fullPage: true });
    }
  }
});

test('mobile navigation restores focus, Escape closes dialogs, and theme persists across routes/reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto('/');
  await page.getByLabel('Color theme').selectOption('light');
  const menu = page.getByRole('button', { name: 'Open menu' });
  await menu.click();
  await expect(page.getByRole('dialog', { name: 'Main navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await menu.click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dawud Muhammed');
  await expect(page.getByLabel('Color theme')).toHaveValue('light');
  await page.reload();
  await expect(page.getByLabel('Color theme')).toHaveValue('light');
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/about$/);
});

test('isolated CMS: project search, populated categories, case study details, lightbox keyboard/focus, and unpublish refresh', async ({ page }) => {
  const tables = await fixtures(page);
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: 'TEST FIXTURE — Backend System' })).toBeVisible();
  await expect(page.getByText('PRIVATE DRAFT MUST NEVER APPEAR')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Empty category' })).toHaveCount(0);
  await page.getByLabel('Search projects').fill('PostgreSQL');
  await expect(page.getByRole('heading', { name: 'TEST FIXTURE — Interface' })).toHaveCount(0);
  await page.getByRole('heading', { name: 'TEST FIXTURE — Backend System' }).click();
  await expect(page.getByRole('heading', { name: 'My role', exact: true })).toBeVisible();
  await expect(page.getByText('Test contributor', { exact: true })).toBeVisible();
  const thumbnail = page.getByRole('button', { name: 'Enlarge Test dashboard view' });
  await thumbnail.click();
  await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('dialog').getByText('Image 2 of 2')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(thumbnail).toBeFocused();
  tables.projects[0].publication_status = 'draft';
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: 'Project not found', exact: true })).toBeVisible();
});

test('isolated CMS: article date/reading-time/clean content and accessible gallery', async ({ page }) => {
  await fixtures(page);
  await page.goto('/blog');
  await expect(page.getByText('2 min read')).toBeVisible();
  await expect(page.getByText('Nov 5, 2026')).toBeVisible();
  await expect(page.getByText('PRIVATE BLOG DRAFT')).toHaveCount(0);
  await page.getByRole('heading', { name: 'TEST FIXTURE — Article' }).click();
  await expect(page.getByRole('heading', { name: 'TEST FIXTURE — Article' })).toHaveCount(1);
  await expect(page.getByText('2 min read')).toBeVisible();
  await expect(page.getByText('[cite: 1]', { exact: false })).toHaveCount(0);
  await expect(page.locator('pre')).toContainText('const answer = 42');
  await page.goto('/gallery');
  const thumbnail = page.getByRole('button', { name: 'Enlarge Synthetic test image' });
  await thumbnail.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(thumbnail).toBeFocused();
});

test('blog features the newest cover once and keeps remaining notes chronological across themes and categories', async ({ page }) => {
  test.setTimeout(90000);
  const tables = await fixtures(page);
  const base = tables.blog_posts[0];
  const posts = [
    { ...base, id: 'legacy', slug: 'legacy', title: 'TEST FIXTURE — Undated note', published_at: null, created_at: '2026-11-05', cover_image_url: null, category_id: 'backend' },
    { ...base, id: 'old', slug: 'old', title: 'TEST FIXTURE — Old note', published_at: '2020-01-01', cover_image_url: imageUrl, category_id: 'backend' },
    { ...base, id: 'new', slug: 'new', title: 'TEST FIXTURE — Newest note', published_at: '2026-11-05', cover_image_url: imageUrl, category_id: 'backend' },
    { ...base, id: 'middle', slug: 'middle', title: 'TEST FIXTURE — Middle note', published_at: '2025-01-01', cover_image_url: imageUrl, category_id: 'writing' },
  ];
  await page.route('https://fixtures.supabase.test/rest/v1/blog_posts*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(posts) }));
  await page.route('https://fixtures.supabase.test/rest/v1/blog_categories*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'backend', name: 'Backend' }, { id: 'writing', name: 'Writing' }]) }));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/blog');
  const feature = page.getByRole('article', { name: 'Featured article', exact: true });
  await expect(feature.getByRole('heading', { name: 'TEST FIXTURE — Newest note' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'TEST FIXTURE — Newest note' })).toHaveCount(1);
  await expect(feature.locator('img')).toHaveAttribute('src', imageUrl);
  await expect(feature.locator('img')).toHaveAttribute('loading', 'eager');
  await expect(page.locator('.blog-feed article h3')).toHaveText(['TEST FIXTURE — Middle note', 'TEST FIXTURE — Old note', 'TEST FIXTURE — Undated note']);
  await expect(page.getByText('Publication date not recorded')).toBeVisible();
  const coverWidth = (await feature.locator('img').boundingBox())!.width;
  const thumbnailWidth = (await page.locator('.blog-list-card img').first().boundingBox())!.width;
  expect(coverWidth).toBeGreaterThan(thumbnailWidth * 2);
  await feature.getByRole('link').focus();
  await expect(feature.getByRole('link')).toBeFocused();
  for (const theme of ['light', 'dark']) {
    await page.getByLabel('Color theme').selectOption(theme);
    await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); window.scrollTo(0, 0); });
    await noOverflow(page);
    await page.screenshot({ path: `artifacts/screenshots/blog-feature-${theme}-1440.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await noOverflow(page);
  await page.screenshot({ path: 'artifacts/screenshots/blog-feature-dark-390.png', fullPage: true });
  await page.getByRole('button', { name: 'Writing', exact: true }).click();
  await expect(feature.getByRole('heading', { name: 'TEST FIXTURE — Middle note' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'More notes', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'All notes', exact: true }).click();
  posts[2].cover_image_url = '';
  await page.reload();
  await expect(feature.getByRole('heading', { name: 'TEST FIXTURE — Newest note' })).toBeVisible();
  await expect(feature.locator('img')).toHaveCount(0);
  await expect(feature.getByRole('link')).toHaveAttribute('href', '/blog/new');
  await noOverflow(page);
});

test('contact validates labelled fields and shows inbox receipt using a mocked endpoint only', async ({ page }) => {
  await fixtures(page);
  let submissions = 0;
  await page.route('**/api/contact', async route => {
    submissions++;
    expect(route.request().postDataJSON()).toMatchObject({ name: 'Test Visitor', email: 'visitor@example.test', website: '' });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, message: 'Test receipt' }) });
  });
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  expect(submissions).toBe(0);
  await expect(page.getByLabel('Your name')).toBeFocused();
  await page.getByLabel('Your name').fill('Test Visitor');
  await page.getByLabel('Email address').fill('visitor@example.test');
  await page.getByLabel('What is it about?').fill('Isolated browser test');
  await page.getByLabel('Your message').fill('This submission is intercepted locally and is not delivered.');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Message received.' })).toBeVisible();
  expect(submissions).toBe(1);
});

test('assistant identity and right-side placement remain consistent on phone and desktop', async ({ page }) => {
  await fixtures(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const launcher = page.getByRole('button', { name: assistantName, exact: true });
    await expect(launcher).toBeVisible();
    await expect(launcher).toContainText(assistantName);
    const launcherBox = await launcher.boundingBox();
    expect(launcherBox).not.toBeNull();
    expect(width - launcherBox!.x - launcherBox!.width).toBeGreaterThanOrEqual(0);
    expect(width - launcherBox!.x - launcherBox!.width).toBeLessThanOrEqual(32);
    await launcher.click();
    const panel = page.getByRole('dialog', { name: assistantName, exact: true });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('heading', { name: assistantName, exact: true })).toBeVisible();
    const panelBox = await panel.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(width - panelBox!.x - panelBox!.width).toBeGreaterThanOrEqual(0);
    expect(width - panelBox!.x - panelBox!.width).toBeLessThanOrEqual(32);
    if (width === 1440) expect(panelBox!.x).toBeGreaterThan(width / 2);
    await page.keyboard.press('Escape');
    await expect(launcher).toBeFocused();
  }
});

test('guide supports no-key state and offline feedback without a paid request', async ({ page, context }) => {
  let posts = 0;
  await page.route('**/api/assistant', route => { if (route.request().method() === 'POST') posts++; return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...guide, enabled: false }) }); });
  await page.goto('/');
  const launcher = page.getByRole('button', { name: assistantName, exact: true });
  await launcher.click();
  await expect(page.getByRole('dialog').getByText('Live answers are paused.', { exact: false })).toBeVisible();
  await page.getByLabel('Ask about Dawud’s work').fill('What can you build?');
  await page.getByRole('button', { name: 'Send question' }).click();
  expect(posts).toBe(0);
  await context.setOffline(true);
  await page.getByLabel('Ask about Dawud’s work').fill('An offline question');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.getByText('You’re offline.', { exact: false })).toBeVisible();
  await context.setOffline(false);
  await page.keyboard.press('Escape');
  await expect(launcher).toBeFocused();
});

test('guide: approved sources, route persistence, budget/provider errors, cancellation, retry, clear and session isolation', async ({ page, browser }) => {
  await fixtures(page);
  let mode: 'success' | 'budget' | 'provider' | 'slow' = 'success';
  await page.route('**/api/assistant', async route => {
    if (route.request().method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(guide) });
    if (mode === 'slow') { await new Promise(resolve => setTimeout(resolve, 3000)); await route.abort().catch(() => {}); return; }
    if (mode !== 'success') return route.fulfill({ status: mode === 'budget' ? 429 : 503, contentType: 'application/json', body: JSON.stringify({ code: mode, message: mode === 'budget' ? 'The application budget is exhausted.' : 'The provider is temporarily unavailable.' }) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'An isolated grounded answer.', revision: '1', sources: [{ id: 'project', title: 'Test project source', url: '/projects/test-backend' }, { id: 'bad', title: 'Unsafe destination', url: 'https://evil.example' }] }) });
  });
  await page.goto('/');
  await page.getByRole('button', { name: assistantName, exact: true }).click();
  const ask = async (question: string) => { await page.getByLabel('Ask about Dawud’s work').fill(question); await page.getByRole('button', { name: 'Send question' }).click(); };
  await ask('A test question');
  await expect(page.getByText('An isolated grounded answer.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Unsafe destination' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Test project source' }).click();
  await expect(page).toHaveURL(/test-backend$/);
  await page.getByRole('button', { name: assistantName, exact: true }).click();
  await expect(page.getByText('An isolated grounded answer.', { exact: false })).toBeVisible();
  mode = 'budget'; await ask('Budget test');
  await expect(page.getByText('The application budget is exhausted.')).toBeVisible();
  mode = 'provider'; await page.getByRole('button', { name: 'Retry question' }).click();
  await expect(page.getByText('The provider is temporarily unavailable.')).toBeVisible();
  mode = 'slow'; await ask('Cancellation test');
  await page.getByRole('button', { name: 'Cancel answer' }).click();
  await expect(page.getByText('Answer cancelled.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear conversation' }).click();
  await expect(page.getByText('An isolated grounded answer.', { exact: false })).toHaveCount(0);
  const isolated = await browser.newContext();
  const other = await isolated.newPage();
  await other.goto(page.url());
  await other.getByRole('button', { name: assistantName, exact: true }).click();
  await expect(other.getByText('A test question')).toHaveCount(0);
  await isolated.close();
});

test('backend configuration failure is shown as unavailable rather than intentionally paused', async ({page}) => {
  await page.route('**/api/assistant',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({...guide,enabled:false,availability:'unavailable',reason:'server_configuration',revision:null})}));
  await page.goto('/');await page.getByRole('button',{name:assistantName,exact:true}).click();
  await expect(page.getByText('Chat is temporarily unavailable.',{exact:false})).toBeVisible();
  await expect(page.getByText('Live answers are paused.',{exact:false})).toHaveCount(0);
  await expect(page.getByLabel('Ask about Dawud’s work')).toBeVisible();
});

test('text-only chat ignores legacy greeting and audio configuration', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('guide-sound','on');
    (window as unknown as {audioAttempts:number}).audioAttempts=0;
    HTMLMediaElement.prototype.play=function(){(window as unknown as {audioAttempts:number}).audioAttempts++;return Promise.resolve();};
  });
  await page.route('**/api/assistant',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({...guide,greeting:'LEGACY INTRO MUST NOT DISPLAY',greeting_audio_url:'https://fixtures.example/intro.mp3'})}));
  await page.goto('/');await page.getByRole('button',{name:assistantName,exact:true}).click();
  await expect(page.getByText('LEGACY INTRO MUST NOT DISPLAY')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Play introduction'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Enable sound'})).toHaveCount(0);
  await expect(page.getByLabel('Ask about Dawud’s work')).toBeVisible();
  expect(await page.evaluate(()=>(window as unknown as {audioAttempts:number}).audioAttempts)).toBe(0);
});

test('GitHub calendar shows public-profile link, yearly totals, hover details and keyboard alternatives from synthetic data', async ({ page }) => {
  let requests = 0;
  page.on('request', request => { if (request.url().startsWith('https://github-contributions-api.jogruber.de/v4/')) requests++; });
  await page.goto('/');
  const panel = page.locator('.github-activity');
  const calendar = page.getByRole('region', { name: 'GitHub contribution calendar', exact: true });
  const year = page.getByLabel('Contribution year', { exact: true });
  await expect(calendar).toBeVisible();
  await expect(year).toHaveValue(String(contributionYear));
  await expect(panel.getByText(/9 contributions/).first()).toBeVisible();
  await expect(panel.getByRole('link', { name: /Explore GitHub/i })).toHaveAttribute('href', 'https://github.com/Dawud-Muhammed');
  const day = calendar.getByRole('button', { name: /^3 contributions on / });
  await year.focus();
  await day.hover();
  await expect(page.getByRole('tooltip')).toContainText('3 contributions');
  await expect(year).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.getByRole('heading', { level: 1 }).hover();
  await day.focus();
  await expect(page.getByRole('tooltip')).toContainText('3 contributions');
  await page.keyboard.press('ArrowRight');
  await expect(day).not.toBeFocused();
  expect(await calendar.evaluate(element => element.contains(document.activeElement))).toBeTruthy();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  const beforeSelection = requests;
  await year.selectOption(String(contributionYear - 1));
  await expect(panel.getByText(/4 contributions/).first()).toBeVisible();
  await expect(calendar.getByRole('button', { name: /^4 contributions on / })).toBeAttached();
  expect(requests).toBe(beforeSelection);
});

test('GitHub contribution cells expose their details on touch', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  try {
    await githubFixtures(page);
    await page.goto('/');
    const calendar = page.getByRole('region', { name: 'GitHub contribution calendar', exact: true });
    const day = calendar.getByRole('button', { name: /^3 contributions on / });
    await day.tap();
    const target = await day.boundingBox();
    expect(target).not.toBeNull();
    expect(target!.width).toBeGreaterThanOrEqual(23.5);
    expect(target!.height).toBeGreaterThanOrEqual(23.5);
    await expect(page.getByRole('tooltip')).toContainText('3 contributions');
    await noOverflow(page);
  } finally { await context.close(); }
});

test('GitHub loading state keeps ordinary navigation available, then resolves to the calendar', async ({ page }) => {
  let release!: () => void;
  const responseGate = new Promise<void>(resolve => { release = resolve; });
  await page.route(contributionApi, async route => {
    await responseGate;
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(contributionFixture(contributionYear)) });
  });
  await page.goto('/');
  const panel = page.locator('.github-activity');
  try {
    await expect(panel.getByRole('status')).toContainText(/loading/i);
    await expect(page.getByRole('link', { name: 'View Selected Work' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact Me', exact: true })).toBeVisible();
  } finally { release(); }
  await expect(page.getByRole('region', { name: 'GitHub contribution calendar', exact: true })).toBeVisible();
});

test('GitHub failure offers a working retry without invented counts', async ({ page }) => {
  let attempts = 0;
  await page.route(contributionApi, async route => {
    attempts++;
    await route.fulfill({ status: attempts === 1 ? 503 : 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(attempts === 1 ? { message: 'Synthetic upstream outage' } : contributionFixture(contributionYear)) });
  });
  await page.goto('/');
  const panel = page.locator('.github-activity');
  await expect(panel.getByRole('button', { name: 'Retry GitHub activity', exact: true })).toBeVisible();
  await expect(panel.getByText(/9 contributions/)).toHaveCount(0);
  await panel.getByRole('button', { name: 'Retry GitHub activity', exact: true }).click();
  await expect(panel.getByText(/9 contributions/).first()).toBeVisible();
  expect(attempts).toBe(2);
});

test('a verified empty GitHub year renders zero activity without an error', async ({ page }) => {
  await githubFixtures(page, { empty: true });
  await page.goto('/');
  const panel = page.locator('.github-activity');
  await expect(panel.getByText(/0 contributions/).first()).toBeVisible();
  await expect(page.getByRole('region', { name: 'GitHub contribution calendar', exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Retry GitHub activity', exact: true })).toHaveCount(0);
  await page.getByLabel('Contribution year', { exact: true }).selectOption(String(contributionYear - 1));
  await expect(panel.getByText(/0 contributions/).first()).toBeVisible();
});

test('GitHub calendar stays usable in both themes with reduced motion at supported widths', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'GitHub contribution calendar', exact: true })).toBeVisible();
    for (const theme of ['light', 'dark']) {
      await page.getByLabel('Color theme').selectOption(theme);
      await noOverflow(page);
      await expect(page.getByLabel('Contribution year', { exact: true })).toBeVisible();
    }
  }
});

test('small-height guide and 200% CSS zoom remain usable', async ({ page }) => {
  await fixtures(page);
  await page.goto('/');
  await page.setViewportSize({ width: 360, height: 420 });
  await page.getByRole('button', { name: assistantName, exact: true }).click();
  await expect(page.getByLabel('Ask about Dawud’s work')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close guide' })).toBeVisible();
  await noOverflow(page);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/contact');
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  await expect(page.getByLabel('Your name')).toBeVisible();
  await noOverflow(page);
});

test('published CMS homepage copy, availability and WhatsApp settings reach public pages', async ({ page }) => {
  const tables = await fixtures(page);
  tables.hero_content[0].headline = 'CMS PUBLISHED HEADLINE';
  tables.hero_content[0].subheadline = 'CMS published supporting description.';
  (tables.website_settings as Array<Record<string, unknown>>).push({ id: 'settings', is_published: true, whatsapp_enabled: true, whatsapp_number: '+1 202 555 0123', whatsapp_message: 'Hi Dawud & team?' });
  await page.goto('/');
  await expect(page.getByText('CMS PUBLISHED HEADLINE', { exact: true })).toBeVisible();
  await expect(page.getByText('CMS published supporting description.', { exact: true })).toBeVisible();
  await expect(page.getByText('TEST FIXTURE availability', { exact: true })).toBeVisible();
  tables.hero_content[0].availability_status = false;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByText('TEST FIXTURE availability', { exact: true })).toHaveCount(0);
  await expect(page.getByText('CMS PUBLISHED HEADLINE', { exact: true })).toBeVisible();
  await page.goto('/contact');
  const href = await page.getByRole('link', { name: 'Message on WhatsApp' }).getAttribute('href');
  const destination = new URL(href!);
  expect(destination.origin).toBe('https://wa.me');
  expect(destination.pathname).toBe('/12025550123');
  expect(destination.searchParams.get('text')).toBe('Hi Dawud & team?');
});

test('long project titles, failed CMS loads, and empty collections remain understandable', async ({ page }) => {
  const tables = await fixtures(page);
  tables.projects[0].title = 'TEST FIXTURE ' + 'ExtraordinarilyLongProjectTitle'.repeat(8);
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: tables.projects[0].title })).toBeVisible();
  await noOverflow(page);
  await page.goto('/services');
  await expect(page.getByText('No services to show yet.')).toBeVisible();
  await page.route('https://fixtures.supabase.test/rest/v1/projects*', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Isolated failure' }) }));
  await page.goto('/projects');
  await expect(page.getByText('Projects couldn’t be loaded.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('CMS automatically shares published portfolio knowledge without separate AI approval fields', async ({ page }) => {
  test.setTimeout(90000);
  await fixtures(page);
  // This is an isolated editor session; real Auth, production data and paid requests are not used.
  await page.route('**/src/lib/useAuth.ts*', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: `export function useAuth() { return { session: { user: { email: 'cms-fixture@example.test' } }, loading: false, isAdmin: true, error: '', signOut: async () => {} }; }` }));
  const tables: Record<string, unknown[]> = {
    ...content(),
    profile: [{ ...content().profile[0], assistant_eligible: false, availability: true }],
    services: [{ id: 'service', title: 'TEST FIXTURE service', description: 'Synthetic service.', included_items: [], evidence_project_ids: [], is_published: true, assistant_eligible: false }],
    experience: [{ id: 'experience', role: 'TEST FIXTURE engineer', company: 'Test company', is_published: true, assistant_eligible: false }],
    faqs: [{ id: 'faq', question: 'TEST FIXTURE question?', answer: 'Synthetic answer.', is_published: true, assistant_eligible: false }],
    assistant_settings: [{ id: true, enabled: true, portrait_url: null, suggested_questions: [] }],
  };
  const writes: { table: string; payload: Record<string, unknown> }[] = [];
  await page.route('https://fixtures.supabase.test/rest/v1/**', async route => {
    const request = route.request();
    const address = new URL(request.url());
    const table = address.pathname.split('/').pop()!;
    let body: unknown = tables[table] || [];
    if (request.method() === 'PATCH') {
      const payload = request.postDataJSON() as Record<string, unknown>;
      writes.push({ table, payload });
      body = address.searchParams.has('select') ? { id: (tables[table]?.[0] as { id: unknown })?.id } : null;
    } else if (table === 'assistant_usage_summary') body = { day_usd: 0, month_usd: 0, total_usd: 0, pending_requests: 0 };
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
  });

  await page.goto('/admin/settings');
  await expect(page.getByRole('heading', { name: 'Studio settings' })).toBeVisible();
  await expect(page.getByLabel('Publish this profile and its public contact information')).toBeChecked();
  await expect(page.getByLabel('Available for work', { exact: true })).toBeChecked();
  await expect(page.getByText('Your published profile and public contact details are available to the AI guide automatically.', { exact: false })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /approve.*AI/i })).toHaveCount(0);
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByText(/Profile saved/)).toBeVisible();
  expect(writes.find(write => write.table === 'profile')?.payload).not.toHaveProperty('assistant_eligible');

  for (const path of ['projects', 'blog', 'services', 'experience', 'faqs']) {
    await page.goto(`/admin/${path}`);
    await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
    const editor = page.getByRole('dialog');
    await expect(editor.getByText(/Published public portfolio content is available to the AI guide automatically/)).toBeVisible();
    await expect(editor.getByRole('checkbox', { name: /approved for AI/i })).toHaveCount(0);
    if (path === 'projects') {
      await expect(editor.getByLabel('Publication', { exact: true })).toHaveValue('published');
      await expect(editor.getByLabel('Featured', { exact: true })).toBeChecked();
    } else if (path === 'blog') await expect(editor.getByLabel('Status', { exact: true })).toHaveValue('Published');
    else await expect(editor.getByLabel('Published on public site', { exact: true })).toBeChecked();
    if (path === 'services') {
      await editor.getByLabel('Published on public site', { exact: true }).uncheck();
      await editor.getByRole('button', { name: 'Save changes', exact: true }).click();
      await expect(editor).toHaveCount(0);
      const serviceWrite = writes.find(write => write.table === 'services')?.payload;
      expect(serviceWrite).toMatchObject({ is_published: false });
      expect(serviceWrite).not.toHaveProperty('assistant_eligible');
    }
  }

  await page.goto('/admin/assistant');
  await expect(page.getByText(/The assistant automatically uses your published public portfolio content/)).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Enable paid text answers (server configuration must also be ready)' })).toBeChecked();
  await expect(page.getByRole('link', { name: 'Edit public FAQs', exact: true })).toBeVisible();
});

