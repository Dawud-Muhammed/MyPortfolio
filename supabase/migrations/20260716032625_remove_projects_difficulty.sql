/*
# Remove difficulty column from projects

1. Changes
- Drops `difficulty` column from `projects` table (no longer used in frontend or admin).
*/
ALTER TABLE projects DROP COLUMN IF EXISTS difficulty;
