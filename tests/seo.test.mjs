import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { PUBLIC_ROUTES, publicSingleton, renderResponse, siteOrigin } from '../server/render-page.js';
const utilities = ts.transpileModule(readFileSync(new URL('../src/lib/utils.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { articleContent, readingMinutes, safeUrl } = await import(`data:text/javascript;base64,${Buffer.from(utilities).toString('base64')}`);

const template = '<!doctype html><html lang="en"><head><title>Generic title</title><meta name="description" content="Generic"><meta property="og:image" content="old"><link rel="canonical" href="https://old.example"></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>';
function fixture() {
  return {
    profile: [{ id: 'owner', name: 'Dawud Muhammed', title: 'Backend developer', bio: 'Builds useful systems.', email: 'test@example.test', is_published: true }],
    seo_settings: [{ id: 'seo', site_title_template: '%s | Dawud', is_published: true }],
    navigation_items: [], hero_content: [{ id: 'hero', subheadline: 'Clear architecture. Useful software.', is_published: true }],
    projects: [{ id: 'public', title: 'Public project', slug: 'public-project', excerpt: 'A published system.', description: 'The implementation.', status: 'Prototype', is_featured: true, publication_status: 'published' }, { id: 'private', title: 'TOP SECRET PROJECT', slug: 'draft', publication_status: 'draft' }],
    blog_posts: [{ id: 'article', title: 'Public article', slug: 'public-article', excerpt: 'A published note.', content: '# Public article\n\nA useful idea.', status: 'Published', published_at: '2026-11-05' }, { id: 'draft', title: 'TOP SECRET ARTICLE', slug: 'draft', status: 'Draft' }],
    services: [], experience: [], education: [], skills: [], certifications: [], achievements: [], gallery_items: [],
  };
}
function database(tables) {
  return { from(table) {
    const filters = [];
    const ordering = [];
    const query = {
      select() { return query; },
      eq(key, value) { filters.push([key, value]); return query; },
      order(key, { ascending, nullsFirst }) { ordering.push([key, ascending, nullsFirst]); return query; },
      async limit(count) {
        const rows = (tables[table] || []).filter(row => filters.every(([key, value]) => row[key] === value));
        rows.sort((left, right) => {
          for (const [key, ascending, nullsFirst] of ordering) {
            if (left[key] === right[key]) continue;
            if (nullsFirst !== undefined && (left[key] == null || right[key] == null)) return left[key] == null ? (nullsFirst ? -1 : 1) : (nullsFirst ? 1 : -1);
            const comparison = left[key] == null ? 1 : right[key] == null ? -1 : left[key] < right[key] ? -1 : 1;
            return ascending ? comparison : -comparison;
          }
          return 0;
        });
        return { data: rows.slice(0, count), error: null };
      },
    };
    return query;
  } };
}
function render(path, tables = fixture()) { return renderResponse({ path, db: database(tables), template, origin: 'https://portfolio.example' }); }

test('blog initial HTML features the latest cover once and keeps remaining notes newest first', async () => {
  const tables = fixture();
  tables.blog_posts = [
    { id: 'undated', title: 'Undated legacy note', slug: 'legacy', excerpt: 'Unknown historical date.', status: 'Published', published_at: null, created_at: '2026-11-06' },
    { id: 'old', title: 'Oldest dated note', slug: 'old', excerpt: 'Old note.', status: 'Published', published_at: '2024-01-01' },
    { id: 'new', title: 'Newest published note', slug: 'new', excerpt: 'Latest note.', status: 'Published', published_at: '2026-11-05', cover_image_url: 'https://fixtures.example/latest.webp' },
    { id: 'middle', title: 'Middle dated note', slug: 'middle', excerpt: 'Middle note.', status: 'Published', published_at: '2025-01-01' },
    { id: 'private', title: 'PRIVATE BLOG DRAFT', slug: 'private', status: 'Draft', published_at: '2026-11-06' },
  ];
  const original = structuredClone(tables);
  const { body, status } = await render('/blog', tables);
  assert.equal(status, 200);
  assert.equal((body.match(/class="blog-feature"/g) || []).length, 1);
  assert.equal((body.match(/src="https:\/\/fixtures.example\/latest.webp"/g) || []).length, 1);
  assert.match(body, /width="1600" height="900" loading="eager" fetchpriority="high"/);
  assert.equal((body.match(/Newest published note/g) || []).length, 1);
  const titles = ['Newest published note', 'Middle dated note', 'Oldest dated note', 'Undated legacy note'];
  for (let i = 1; i < titles.length; i++) assert(body.indexOf(titles[i - 1]) < body.indexOf(titles[i]));
  assert.match(body, /Publication date not recorded/);
  assert.doesNotMatch(body, /PRIVATE BLOG DRAFT/);
  assert.deepEqual(tables, original);
});

test('all-undated blogs feature the latest created record without a fabricated publication date or unsafe cover', async () => {
  const tables = fixture();
  tables.blog_posts = [
    { id: 'old', title: 'Old imported note', slug: 'old-import', excerpt: 'Old.', status: 'Published', published_at: null, created_at: '2025-01-01' },
    { id: 'new', title: 'New imported note', slug: 'new-import', excerpt: 'New.', status: 'Published', published_at: null, created_at: '2026-01-01', cover_image_url: 'javascript:alert(1)' },
  ];
  const { body } = await render('/blog', tables);
  assert(body.indexOf('New imported note') < body.indexOf('Old imported note'));
  assert.match(body, /Featured note/);
  assert.doesNotMatch(body, /javascript:|<time datetime="202[56]-01-01/);
});

test('public singleton selection matches newest published creation date and descending ID ties', async () => {
  const tables = fixture();
  const versions = [
    { id: 'z-old', created_at: '2026-11-01T00:00:00Z', is_published: true, label: 'Old' },
    { id: 'b-tie', created_at: '2026-11-03T00:00:00Z', is_published: true, label: 'Lower ID' },
    { id: 'c-tie', created_at: '2026-11-03T00:00:00Z', is_published: true, label: 'Selected' },
    { id: 'z-private', created_at: '2026-11-05T00:00:00Z', is_published: false, label: 'Private' },
  ];
  tables.profile = versions.map(row => ({ ...row, name: `${row.label} profile` }));
  tables.seo_settings = versions.map(row => ({ ...row, site_title_template: `%s | ${row.label} SEO` }));
  tables.hero_content = versions.map(row => ({ ...row, subheadline: `${row.label} hero`, availability_status: true, availability_label: `${row.label} availability` }));
  const original = structuredClone(tables);
  for (const table of ['profile', 'seo_settings', 'hero_content']) {
    assert.equal((await publicSingleton(database(tables), table, '*')).id, 'c-tie');
  }
  const result = await render('/', tables);
  assert.equal(result.status, 200);
  assert.match(result.body, /<title>Selected profile \| Selected SEO<\/title>/);
  assert.match(result.body, /Selected hero/);
  assert.match(result.body, /Selected availability/);
  assert.doesNotMatch(result.body, /Old profile|Lower ID|Private/);
  assert.deepEqual(tables, original, 'Reads must preserve every record and ID.');
  tables.hero_content[2].is_published = false;
  assert.equal((await publicSingleton(database(tables), 'hero_content', '*')).id, 'b-tie');
});

test('all retained public routes have meaningful initial HTML and specific metadata', async () => {
  for (const path of [...PUBLIC_ROUTES, '/projects/public-project', '/blog/public-article']) {
    const result = await render(path);
    assert.equal(result.status, 200, path);
    assert.equal((result.body.match(/<title>/g) || []).length, 1, path);
    assert.match(result.body, /<main id="main-content"/);
    assert.match(result.body, /<h1>[^<]+<\/h1>/);
    assert.match(result.body, /\/assets\/app\.js/);
    assert.ok(result.body.includes(`href="https://portfolio.example${path}"`));
    assert.doesNotMatch(result.body, /Generic title|TOP SECRET/);
  }
});
test('unknown and unpublished detail routes return 404 with noindex', async () => {
  for (const path of ['/no-such-page', '/projects/draft', '/blog/draft', '/admin']) {
    const result = await render(path);
    assert.equal(result.status, 404);
    assert.match(result.body, /noindex,nofollow/);
    assert.doesNotMatch(result.body, /TOP SECRET/);
  }
});
test('CMS edits and unpublish affect the next response without a stale cache', async () => {
  const tables = fixture();
  assert.match((await render('/projects/public-project', tables)).body, /Public project/);
  tables.projects[0].title = 'Edited title';
  assert.match((await render('/projects/public-project', tables)).body, /Edited title/);
  tables.projects[0].publication_status = 'draft';
  assert.equal((await render('/projects/public-project', tables)).status, 404);
  assert.doesNotMatch((await render('/sitemap.xml', tables)).body, /public-project/);
});
test('CMS content cannot inject HTML, metadata, JSON-LD scripts, or executable links', async () => {
  const tables = fixture();
  tables.projects[0].title = '</h1><script>alert(1)</script>';
  tables.projects[0].excerpt = '"><img src=x onerror=alert(2)>';
  tables.projects[0].demo_url = 'javascript:alert(3)';
  tables.projects[0].description = '<iframe src="evil"></iframe>';
  const result = await render('/projects/public-project', tables);
  assert.doesNotMatch(result.body, /<script>alert|<img src=x|href="javascript:|<iframe src="evil"/);
  assert.match(result.body, /&lt;script&gt;/);
  assert.match(result.body, /\\u003c/);
});
test('sitemap includes published slugs and excludes administrative and draft URLs', async () => {
  const result = await render('/sitemap.xml');
  assert.equal(result.status, 200);
  assert.equal(result.type, 'application/xml; charset=utf-8');
  assert.match(result.body, /projects\/public-project/);
  assert.match(result.body, /blog\/public-article/);
  assert.doesNotMatch(result.body, /draft|admin|api\//);
});
test('unavailable CMS yields retryable 503 HTML, never stale or private content', async () => {
  const result = await renderResponse({ path: '/projects', db: null, template });
  assert.equal(result.status, 503);
  assert.match(result.body, /temporarily unavailable/);
  assert.match(result.body, /noindex,nofollow/);
  const sitemap = await renderResponse({ path: '/sitemap.xml', db: null });
  assert.equal(sitemap.status, 503);
});
test('robots excludes admin and API independently of database availability', async () => {
  const result = await renderResponse({ path: '/robots.txt', db: null, origin: 'https://portfolio.example' });
  assert.equal(result.status, 200);
  assert.match(result.body, /Disallow: \/admin/);
  assert.match(result.body, /Disallow: \/api\//);
  assert.match(result.body, /https:\/\/portfolio\.example\/sitemap.xml/);
});
test('canonical origin cannot use an executable protocol', () => {
  assert.equal(siteOrigin('javascript:alert(1)'), 'https://dawud-muhammed.vercel.app');
  assert.equal(siteOrigin('https://portfolio.example/a'), 'https://portfolio.example');
});
test('Google site verification follows the published CMS value and safely escapes attributes', async () => {
  const tables = fixture();
  tables.seo_settings[0].gsc_verification = '  verified-token\"/><script>alert(1)</script>  ';
  const result = await render('/', tables);
  assert.match(result.body, /name="google-site-verification" content="verified-token&quot;\/&gt;&lt;script&gt;/);
  assert.doesNotMatch(result.body, /<script>alert\(1\)<\/script>/);
  tables.seo_settings[0].gsc_verification = '';
  assert.doesNotMatch((await render('/', tables)).body, /google-site-verification/);
  tables.seo_settings[0].gsc_verification = 'private-token';
  tables.seo_settings[0].is_published = false;
  assert.doesNotMatch((await render('/', tables)).body, /private-token|google-site-verification/);
});
test('missing article publication dates are disclosed without inventing dates', async () => {
  const tables = fixture();
  tables.blog_posts[0].published_at = null;
  for (const path of ['/blog', '/blog/public-article']) {
    const result = await render(path, tables);
    assert.match(result.body, /Publication date not recorded/);
    assert.doesNotMatch(result.body, /<time/);
  }
});
test('article cleanup removes only duplicate title and citation artifacts outside code', () => {
  const content = '# A title\n\nA fact. [cite: 1]\n\n```text\n[cite: 1]\n```';
  assert.equal(articleContent(content, 'A title'), 'A fact. \n\n```text\n[cite: 1]\n```');
  assert.match(articleContent('# A different heading\n\nText.', 'A title'), /^# A different/);
});
test('reading-time calculation uses the cleaned body and rounds consistently', () => {
  assert.equal(readingMinutes('# Title\n\n' + 'word '.repeat(201), 'Title'), 2);
  assert.equal(readingMinutes(''), 1);
  assert.equal(readingMinutes('word '.repeat(200)), 1);
});
test('public link guard rejects executable and protocol-relative CMS URLs', () => {
  assert.equal(safeUrl('javascript:alert(1)'), undefined);
  assert.equal(safeUrl('//evil.example'), undefined);
  assert.equal(safeUrl('/\\evil.example'), undefined);
  assert.equal(safeUrl('/projects/example'), '/projects/example');
  assert.equal(safeUrl('https://example.com/project'), 'https://example.com/project');
});
