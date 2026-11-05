-- OPT-IN rollback. Retains the audit record; refuses to overwrite subsequent owner edits.
BEGIN;
DO $$ DECLARE changed integer; BEGIN
 UPDATE public.education e SET institution=a.before_institution,field=a.before_field
 FROM public.studio_content_corrections a
 WHERE a.correction_key='education-spelling-20261105' AND a.rolled_back_at IS NULL AND e.id=a.row_id
  AND e.institution='Bahirdar Institute of Technology' AND e.field='Information Technology';
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed=1 THEN
  UPDATE public.studio_content_corrections SET rolled_back_at=now() WHERE correction_key='education-spelling-20261105';
 ELSE RAISE NOTICE 'No unchanged correction to roll back. Review the record manually.';
 END IF;
END $$;
COMMIT;
