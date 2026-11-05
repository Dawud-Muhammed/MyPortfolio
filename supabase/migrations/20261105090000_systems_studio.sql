-- Additive Systems Studio release. Apply to STAGING first; retain a database backup.
-- Existing record IDs, slugs, media and relationships are untouched.
-- Provision the owner's auth UUID in admin_users via a trusted SQL connection before CMS login.
BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM anon, authenticated;
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()) $$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS publication_status text NOT NULL DEFAULT 'published'
  CHECK (publication_status IN ('draft','published'));
ALTER TABLE public.projects ALTER COLUMN publication_status SET DEFAULT 'draft';
UPDATE public.projects SET publication_status='draft' WHERE lower(status) IN ('draft','private');
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS assistant_eligible boolean NOT NULL DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS problem text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS intended_users text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_contribution text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS decisions text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS implementation text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS challenges text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS evidence text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS outcomes text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS gallery_captions text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS evidence_project_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS alt_text text NOT NULL DEFAULT '';
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS related_url text;
ALTER TABLE public.hero_content ADD COLUMN IF NOT EXISTS availability_status boolean NOT NULL DEFAULT true;
ALTER TABLE public.hero_content ADD COLUMN IF NOT EXISTS availability_label text NOT NULL DEFAULT '';
ALTER TABLE public.project_categories ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0;

DO $$ DECLARE tab text; pol record; BEGIN
  FOREACH tab IN ARRAY ARRAY['profile','hero_content','hero_images','hero_videos','technologies',
    'project_categories','blog_categories','blog_tags','skills','experience','education','certifications',
    'services','testimonials','social_links','seo_settings','website_settings','navigation_items','faqs',
    'gallery_items','achievements'] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true', tab);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN is_published SET DEFAULT false', tab);
  END LOOP;
  FOREACH tab IN ARRAY ARRAY['profile','experience','services','faqs','blog_posts'] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS assistant_eligible boolean NOT NULL DEFAULT false', tab);
  END LOOP;
  -- Replace the known portfolio tables' permissive policies. Do not touch unrelated schemas/tables.
  FOREACH tab IN ARRAY ARRAY['profile','hero_content','hero_images','hero_videos','technologies',
    'project_categories','projects','project_technologies','blog_categories','blog_tags','blog_posts',
    'blog_post_tags','blog_comments','skills','experience','education','certifications','services',
    'testimonials','contact_messages','social_links','seo_settings','website_settings','navigation_items',
    'faqs','gallery_items','achievements','newsletter_subscribers','page_views'] LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=tab LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, tab);
    END LOOP;
    EXECUTE format('CREATE POLICY studio_admin ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', tab);
    IF tab NOT IN ('projects','project_technologies','blog_posts','blog_post_tags','blog_comments',
      'contact_messages','newsletter_subscribers','page_views') THEN
      EXECUTE format('CREATE POLICY studio_public ON public.%I FOR SELECT TO anon, authenticated USING (is_published)', tab);
    END IF;
  END LOOP;
END $$;
CREATE POLICY studio_public ON public.projects FOR SELECT TO anon, authenticated USING (publication_status='published');
CREATE POLICY studio_public ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (lower(status)='published' AND published_at IS NOT NULL AND published_at<=now());
CREATE POLICY studio_public ON public.project_technologies FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.projects WHERE id=project_id AND publication_status='published')
    AND EXISTS (SELECT 1 FROM public.technologies WHERE id=technology_id AND is_published));
CREATE POLICY studio_public ON public.blog_post_tags FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.blog_posts WHERE id=post_id AND lower(status)='published' AND published_at<=now())
    AND EXISTS (SELECT 1 FROM public.blog_tags WHERE id=tag_id AND is_published));
-- Comments and submissions are now private. Public comments need a view that excludes email.
CREATE VIEW public.published_blog_comments WITH (security_barrier=true) AS
  SELECT c.id,c.post_id,c.name,c.comment,c.status,c.created_at FROM public.blog_comments c
  JOIN public.blog_posts b ON b.id=c.post_id
  WHERE c.status='approved' AND lower(b.status)='published' AND b.published_at<=now();
GRANT SELECT ON public.published_blog_comments TO anon, authenticated;
-- Existing optional résumé collection stays admin managed and only active versions public.
DO $$ DECLARE pol record; BEGIN
 IF to_regclass('public.resume_versions') IS NOT NULL THEN
   ALTER TABLE public.resume_versions ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
   ALTER TABLE public.resume_versions ALTER COLUMN is_published SET DEFAULT false;
   FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='resume_versions' LOOP
     EXECUTE format('DROP POLICY %I ON public.resume_versions',pol.policyname);
   END LOOP;
   CREATE POLICY studio_admin ON public.resume_versions FOR ALL TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin());
   CREATE POLICY studio_public ON public.resume_versions FOR SELECT TO anon,authenticated USING(is_published);
 END IF;
END $$;

CREATE TABLE public.assistant_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK(id), enabled boolean NOT NULL DEFAULT false,
  portrait_url text,
  greeting text NOT NULL DEFAULT 'Hey, I’m Dawud Muhammed’s AI portfolio guide. What would you like to know about his projects, experience, or how he could help with your project?',
  greeting_audio_url text DEFAULT '/audio/introduction.wav', audio_is_synthetic boolean NOT NULL DEFAULT true,
  suggested_questions text[] NOT NULL DEFAULT ARRAY[
    'Which project best shows Dawud’s backend skills?', 'What did Dawud contribute to Alyah CRM?',
    'Can he improve an existing Laravel application?', 'Show me a relevant project.', 'How can I contact him?'],
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.assistant_settings(id) VALUES(true);
ALTER TABLE public.assistant_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY studio_admin ON public.assistant_settings FOR ALL TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin());
CREATE POLICY studio_public ON public.assistant_settings FOR SELECT TO anon,authenticated USING(true);
GRANT SELECT ON public.assistant_settings TO anon,authenticated;
GRANT ALL ON public.assistant_settings TO service_role;
GRANT INSERT,UPDATE,DELETE ON public.assistant_settings TO authenticated;

-- A monotonically increasing revision invalidates public/assistant snapshots on every CMS write.
CREATE TABLE public.content_revision(id boolean PRIMARY KEY DEFAULT true CHECK(id), revision bigint NOT NULL DEFAULT 1);
INSERT INTO public.content_revision(id) VALUES(true);
ALTER TABLE public.content_revision ENABLE ROW LEVEL SECURITY;
CREATE POLICY studio_public ON public.content_revision FOR SELECT TO anon,authenticated USING(true);
GRANT SELECT ON public.content_revision TO anon,authenticated;
GRANT ALL ON public.content_revision TO service_role;
CREATE OR REPLACE FUNCTION public.bump_content_revision() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 UPDATE public.content_revision SET revision=revision+1 WHERE id=true; RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.bump_content_revision() FROM PUBLIC;
DO $$ DECLARE tab text; BEGIN
 FOREACH tab IN ARRAY ARRAY['profile','projects','project_technologies','technologies','blog_posts','blog_post_tags',
  'experience','education','skills','certifications','services','faqs','assistant_settings','hero_content',
  'navigation_items','gallery_items','website_settings','seo_settings','social_links','testimonials','achievements'] LOOP
   EXECUTE format('CREATE TRIGGER studio_revision AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION public.bump_content_revision()',tab);
 END LOOP;
END $$;

-- Durable monetary ledger, amounts are integer micro-US dollars. Pending/unknown usage stays charged.
CREATE TABLE public.assistant_reservations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(),
 session_hash text NOT NULL, reserved_microusd bigint NOT NULL CHECK(reserved_microusd>0),
 charged_microusd bigint NOT NULL CHECK(charged_microusd>=0),
 status text NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','completed','uncertain')),
 input_tokens integer, output_tokens integer, request_id text
);
CREATE INDEX assistant_reservations_created ON public.assistant_reservations(created_at);
CREATE TABLE public.request_buckets (
 key text NOT NULL, window_start timestamptz NOT NULL, requests integer NOT NULL DEFAULT 1,
 PRIMARY KEY(key,window_start)
);
ALTER TABLE public.assistant_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.assistant_reservations,public.request_buckets FROM anon,authenticated;
GRANT ALL ON public.assistant_reservations,public.request_buckets TO service_role;

CREATE OR REPLACE FUNCTION public.studio_throttle(p_key text,p_limit integer,p_seconds integer) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE n integer; bucket timestamptz; BEGIN
 IF p_limit<1 OR p_limit>1000 OR p_seconds<1 OR p_seconds>86400 OR length(p_key)>160 THEN RETURN false; END IF;
 bucket := to_timestamp(floor(extract(epoch from clock_timestamp())/p_seconds)*p_seconds);
 INSERT INTO public.request_buckets(key,window_start) VALUES(p_key,bucket)
 ON CONFLICT(key,window_start) DO UPDATE SET requests=public.request_buckets.requests+1 RETURNING requests INTO n;
 RETURN n<=p_limit;
END $$;

CREATE OR REPLACE FUNCTION public.reserve_assistant_budget(p_session text,p_client text,p_cost bigint,
 p_daily bigint,p_monthly bigint,p_total bigint) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE day_total bigint; month_total bigint; all_total bigint; reservation uuid; BEGIN
 -- Serializes EVERY reservation and reconciliation across all serverless instances.
 PERFORM pg_advisory_xact_lock(731105001);
 IF NOT EXISTS(SELECT 1 FROM public.assistant_settings WHERE enabled AND id=true) THEN
   RETURN jsonb_build_object('ok',false,'code','disabled'); END IF;
 IF p_cost<=0 OR p_daily<=0 OR p_monthly<=0 OR p_total<=0 THEN
   RETURN jsonb_build_object('ok',false,'code','configuration_error'); END IF;
 IF NOT public.studio_throttle('ai-session:'||p_session,6,60)
   OR NOT public.studio_throttle('ai-client:'||p_client,60,60)
   OR NOT public.studio_throttle('ai-day:'||p_session,30,86400) THEN
   RETURN jsonb_build_object('ok',false,'code','rate_limited'); END IF;
 SELECT coalesce(sum(charged_microusd) FILTER(WHERE created_at>=date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'),0),
   coalesce(sum(charged_microusd) FILTER(WHERE created_at>=date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'),0),
   coalesce(sum(charged_microusd),0) INTO day_total,month_total,all_total FROM public.assistant_reservations;
 IF day_total+p_cost>p_daily OR month_total+p_cost>p_monthly OR all_total+p_cost>p_total THEN
   RETURN jsonb_build_object('ok',false,'code','budget_exhausted'); END IF;
 INSERT INTO public.assistant_reservations(session_hash,reserved_microusd,charged_microusd)
   VALUES(p_session,p_cost,p_cost) RETURNING id INTO reservation;
 RETURN jsonb_build_object('ok',true,'id',reservation);
END $$;

CREATE OR REPLACE FUNCTION public.reconcile_assistant_budget(p_id uuid,p_actual bigint,p_input integer,p_output integer,p_request text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 PERFORM pg_advisory_xact_lock(731105001);
 UPDATE public.assistant_reservations SET charged_microusd=CASE WHEN p_actual IS NULL THEN reserved_microusd ELSE greatest(0,p_actual) END,
 status=CASE WHEN p_actual IS NULL THEN 'uncertain' ELSE 'completed' END,input_tokens=p_input,output_tokens=p_output,request_id=left(p_request,150)
 WHERE id=p_id AND status='reserved';
END $$;

CREATE OR REPLACE FUNCTION public.assistant_usage_summary() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Admin required' USING ERRCODE='42501'; END IF;
 RETURN (SELECT jsonb_build_object(
 'day_usd',coalesce(sum(charged_microusd) FILTER(WHERE created_at>=date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'),0)/1000000.0,
 'month_usd',coalesce(sum(charged_microusd) FILTER(WHERE created_at>=date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'),0)/1000000.0,
 'total_usd',coalesce(sum(charged_microusd),0)/1000000.0,'pending_requests',count(*) FILTER(WHERE status IN ('reserved','uncertain')))
 FROM public.assistant_reservations);
END $$;
REVOKE ALL ON FUNCTION public.studio_throttle(text,integer,integer),
 public.reserve_assistant_budget(text,text,bigint,bigint,bigint,bigint),
 public.reconcile_assistant_budget(uuid,bigint,integer,integer,text), public.assistant_usage_summary() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.studio_throttle(text,integer,integer),
 public.reserve_assistant_budget(text,text,bigint,bigint,bigint,bigint),
 public.reconcile_assistant_budget(uuid,bigint,integer,integer,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.assistant_usage_summary() TO authenticated;
CREATE INDEX studio_public_projects ON public.projects(order_index,id) WHERE publication_status='published';
CREATE INDEX studio_public_blog ON public.blog_posts(published_at DESC) WHERE lower(status)='published';

CREATE OR REPLACE FUNCTION public.save_project_technologies(p_project_id uuid,p_technology_ids uuid[]) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Admin required' USING ERRCODE='42501'; END IF;
 PERFORM 1 FROM public.projects WHERE id=p_project_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Project not found'; END IF;
 IF cardinality(p_technology_ids)>50 THEN RAISE EXCEPTION 'Too many technologies'; END IF;
 DELETE FROM public.project_technologies WHERE project_id=p_project_id;
 INSERT INTO public.project_technologies(project_id,technology_id)
 SELECT p_project_id,t FROM (SELECT DISTINCT unnest(p_technology_ids) AS t) ids;
END $$;
REVOKE ALL ON FUNCTION public.save_project_technologies(uuid,uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_project_technologies(uuid,uuid[]) TO authenticated;

-- Add restrictive gates to the existing portfolio storage buckets without replacing unrelated policies.
-- Public buckets are for published assets only. Draft/private assets must use private buckets/signed URLs.
DO $$ BEGIN
 IF to_regclass('storage.objects') IS NOT NULL THEN
   CREATE POLICY studio_storage_insert_gate ON storage.objects AS RESTRICTIVE FOR INSERT TO anon,authenticated
    WITH CHECK(bucket_id NOT IN ('portfolio-images','Portfolio-documents','portfolio-audio','portfolio-vidios') OR public.is_admin());
   CREATE POLICY studio_storage_update_gate ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon,authenticated
    USING(bucket_id NOT IN ('portfolio-images','Portfolio-documents','portfolio-audio','portfolio-vidios') OR public.is_admin())
    WITH CHECK(bucket_id NOT IN ('portfolio-images','Portfolio-documents','portfolio-audio','portfolio-vidios') OR public.is_admin());
   CREATE POLICY studio_storage_delete_gate ON storage.objects AS RESTRICTIVE FOR DELETE TO anon,authenticated
    USING(bucket_id NOT IN ('portfolio-images','Portfolio-documents','portfolio-audio','portfolio-vidios') OR public.is_admin());
   UPDATE storage.buckets SET file_size_limit=5242880,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','image/avif','image/gif'] WHERE id='portfolio-images';
   UPDATE storage.buckets SET file_size_limit=10485760,allowed_mime_types=ARRAY['application/pdf'] WHERE id='Portfolio-documents';
   -- Preserve the historical spelling and all existing media URLs/read access.
   UPDATE storage.buckets SET file_size_limit=52428800,allowed_mime_types=ARRAY['video/mp4','video/webm','video/quicktime'] WHERE id='portfolio-vidios';
   INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
    VALUES('portfolio-audio','portfolio-audio',true,10485760,ARRAY['audio/mpeg','audio/wav','audio/ogg','audio/mp4']) ON CONFLICT(id) DO NOTHING;
   CREATE POLICY studio_audio_admin ON storage.objects FOR ALL TO authenticated
    USING(bucket_id='portfolio-audio' AND public.is_admin()) WITH CHECK(bucket_id='portfolio-audio' AND public.is_admin());
 END IF;
END $$;
COMMIT;
