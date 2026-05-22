-- Featured testimonials for homepage and about page
-- Run in Supabase Dashboard → SQL Editor (safe to re-run)

DELETE FROM testimonials
WHERE client_name IN ('Glaucia Huxley', 'Natalie Violandi');

INSERT INTO testimonials (
  client_name,
  body,
  treatment_ref,
  is_featured,
  sort_order,
  status
) VALUES
(
  'Glaucia Huxley',
  'I''m very happy with the results and highly recommend the treatments I did. I have been receiving lots of complements about how beautiful my skin looks. I had tried many other clinics before, but never had the results I''m seeing now. I''m so glad I found Naturally Beautiful just around the corner from my place in Dee Why, simply the best skin clinic on the Northern Beaches.',
  'Micro needling & Fractional RF',
  true,
  1,
  'published'
),
(
  'Natalie Violandi',
  'Before seeing Lilian, my self-esteem was low and my face was covered in acne and acne scars. After my first microneedling session I already noticed a huge difference on my skin. The acne scars were not as noticeable as before and my skin looked healthier and glowing. My skin keeps improving every time I go for a new session. Not to mention Lilian is a lovely person, very knowledgeable and passionate about her work. Everything in her clinic is spotless.',
  'Micro needling',
  true,
  2,
  'published'
);
