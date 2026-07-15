-- Remove proficiency column from skills table
ALTER TABLE skills DROP COLUMN IF EXISTS proficiency;
