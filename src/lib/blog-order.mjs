function timestamp(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Published dates determine recency; unknown dates stay behind dated articles.
 * Creation date and ID make legacy undated records and ties deterministic.
 * Never rewrite a missing publication date or mutate the CMS response. */
export function sortBlogPosts(posts) {
  return [...posts].sort((left, right) => {
    const leftPublished = timestamp(left.published_at);
    const rightPublished = timestamp(right.published_at);
    if (leftPublished !== null || rightPublished !== null) {
      if (leftPublished === null) return 1;
      if (rightPublished === null) return -1;
      if (leftPublished !== rightPublished) return rightPublished - leftPublished;
    }
    const leftCreated = timestamp(left.created_at);
    const rightCreated = timestamp(right.created_at);
    if (leftCreated !== null || rightCreated !== null) {
      if (leftCreated === null) return 1;
      if (rightCreated === null) return -1;
      if (leftCreated !== rightCreated) return rightCreated - leftCreated;
    }
    const leftId = String(left.id ?? '');
    const rightId = String(right.id ?? '');
    return leftId === rightId ? 0 : leftId < rightId ? 1 : -1;
  });
}
