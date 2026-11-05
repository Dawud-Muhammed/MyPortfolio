import test from 'node:test';
import assert from 'node:assert/strict';
import { sortBlogPosts } from '../src/lib/blog-order.mjs';

test('published notes sort newest first while legacy unknown dates stay at the end', () => {
  const posts = [
    { id: 'legacy', published_at: null, created_at: '2026-11-05' },
    { id: 'old', published_at: '2020-01-01', created_at: '2026-11-04' },
    { id: 'latest', published_at: '2026-11-05', created_at: '2026-11-05' },
    { id: 'middle', published_at: '2025-01-01' },
    { id: 'invalid', published_at: 'not-a-date', created_at: '2025-01-01' },
  ];
  const original = structuredClone(posts);
  assert.deepEqual(sortBlogPosts(posts).map(post => post.id), ['latest', 'middle', 'old', 'legacy', 'invalid']);
  assert.deepEqual(posts, original);
});

test('equal publication dates and all-undated imports use creation date then stable ID without inventing dates', () => {
  const posts = [
    { id: 'a', published_at: null, created_at: '2026-01-01' },
    { id: 'b', published_at: null, created_at: '2026-11-01' },
    { id: 'c', published_at: null, created_at: '2026-11-01' },
  ];
  assert.deepEqual(sortBlogPosts(posts).map(post => post.id), ['c', 'b', 'a']);
  assert(sortBlogPosts(posts).every(post => post.published_at === null));
  assert.deepEqual(sortBlogPosts(posts.map(post => ({ ...post, published_at: '2026-11-01' }))).map(post => post.id), ['c', 'b', 'a']);
});

test('recency compares timestamps rather than date strings and accepts empty/single-post lists', () => {
  const posts = [
    { id: 'earlier', published_at: '2026-11-05T09:00:00+03:00' },
    { id: 'later', published_at: '2026-11-05T07:00:00Z' },
  ];
  assert.deepEqual(sortBlogPosts(posts).map(post => post.id), ['later', 'earlier']);
  assert.deepEqual(sortBlogPosts([]), []);
  assert.deepEqual(sortBlogPosts([posts[0]]), [posts[0]]);
});
