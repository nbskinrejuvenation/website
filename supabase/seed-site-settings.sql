-- Site settings for SEO (LocalBusiness schema) and footer
-- Run in Supabase Dashboard → SQL Editor (safe to re-run)

UPDATE site_settings
SET
  business_name = 'Naturally Beautiful Skin Rejuvenation',
  phone = '0404 203 800',
  address = 'Shop 9–10, 8–12 Pacific Parade',
  suburb = 'Dee Why',
  state = 'NSW',
  postcode = '2099',
  lat = -33.7509,
  lng = 151.2863,
  instagram_url = 'https://www.instagram.com/nb_skin_rejuv/',
  booking_url = '/book',
  updated_at = NOW()
WHERE id IS NOT NULL;

-- If no row exists yet, insert one (adjust id if your schema uses a fixed UUID)
INSERT INTO site_settings (
  business_name,
  phone,
  address,
  suburb,
  state,
  postcode,
  lat,
  lng,
  instagram_url,
  booking_url,
  updated_at
)
SELECT
  'Naturally Beautiful Skin Rejuvenation',
  '0404 203 800',
  'Shop 9–10, 8–12 Pacific Parade',
  'Dee Why',
  'NSW',
  '2099',
  -33.7509,
  151.2863,
  'https://www.instagram.com/nb_skin_rejuv/',
  '/book',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);
