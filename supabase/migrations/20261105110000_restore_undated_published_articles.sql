-- Preserve explicitly published legacy articles whose historical date is unknown.
-- Drafts and future-dated articles remain private. No content/date is rewritten.
BEGIN;

ALTER POLICY studio_public ON public.blog_posts
  USING (lower(status) = 'published' AND (published_at IS NULL OR published_at <= now()));

ALTER POLICY studio_public ON public.blog_post_tags
  USING (
    EXISTS (SELECT 1 FROM public.blog_posts WHERE id = post_id
      AND lower(status) = 'published' AND (published_at IS NULL OR published_at <= now()))
    AND EXISTS (SELECT 1 FROM public.blog_tags WHERE id = tag_id AND is_published)
  );

CREATE OR REPLACE VIEW public.published_blog_comments WITH (security_barrier = true) AS
  SELECT c.id, c.post_id, c.name, c.comment, c.status, c.created_at
  FROM public.blog_comments c
  JOIN public.blog_posts b ON b.id = c.post_id
  WHERE c.status = 'approved' AND lower(b.status) = 'published'
    AND (b.published_at IS NULL OR b.published_at <= now());

COMMIT;
