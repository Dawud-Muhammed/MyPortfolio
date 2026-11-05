-- OPT-IN only. NOT an automatically applied migration. Verify staging first.
-- Read-only public snapshot 2026-11-05 confirmed these two spelling errors.
-- Preserve the place-name spelling, all dates, degree, IDs, visibility and relationships.
-- Requires 20261105090000_systems_studio.sql and a trusted SQL operator.
BEGIN;
CREATE TABLE IF NOT EXISTS public.studio_content_corrections (
  correction_key text PRIMARY KEY, row_id uuid NOT NULL,
  before_institution text NOT NULL,before_field text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),rolled_back_at timestamptz
);
ALTER TABLE public.studio_content_corrections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.studio_content_corrections FROM anon,authenticated;
DO $$ DECLARE matches integer; BEGIN
 IF EXISTS(SELECT 1 FROM public.studio_content_corrections WHERE correction_key='education-spelling-20261105') THEN
  RAISE NOTICE 'Correction already recorded. No changes applied.'; RETURN;
 END IF;
 SELECT count(*) INTO matches FROM public.education
  WHERE institution='Bahirdar Institue of technology' AND field='nformation Technology';
 IF matches<>1 THEN RAISE EXCEPTION 'Expected exactly one verified spelling match, found %. Review manually.',matches; END IF;
 INSERT INTO public.studio_content_corrections(correction_key,row_id,before_institution,before_field)
  SELECT 'education-spelling-20261105',id,institution,field FROM public.education
   WHERE institution='Bahirdar Institue of technology' AND field='nformation Technology';
 UPDATE public.education SET institution='Bahirdar Institute of Technology',field='Information Technology'
  WHERE id=(SELECT row_id FROM public.studio_content_corrections WHERE correction_key='education-spelling-20261105');
END $$;
COMMIT;
