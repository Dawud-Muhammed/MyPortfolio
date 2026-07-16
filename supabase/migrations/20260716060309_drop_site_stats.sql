/*
# Drop site_stats table

Stats are now computed dynamically from actual database records
(skills count, projects count, years of experience from experience table).
The site_stats table is no longer needed.
*/
DROP TABLE IF EXISTS site_stats CASCADE;
