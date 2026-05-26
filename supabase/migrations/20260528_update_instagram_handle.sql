-- Update Instagram handle to @nb_skin_rejuv
UPDATE site_settings
SET
  instagram_url = 'https://www.instagram.com/nb_skin_rejuv/',
  updated_at = NOW()
WHERE instagram_url IS NULL
   OR instagram_url ILIKE '%naturally_beautiful_skin_rejuv%';
