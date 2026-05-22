-- Run this in Supabase Dashboard → SQL Editor AFTER seed-treatments.sql
-- Expected: treatment_count = 18, face_count = 12, body_count = 6

SELECT count(*) AS treatment_count FROM treatments;

SELECT category, count(*) AS n
FROM treatments
WHERE status = 'published'
GROUP BY category
ORDER BY category;

SELECT slug, title, category, status
FROM treatments
ORDER BY sort_order
LIMIT 5;
