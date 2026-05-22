-- Allow the Next.js app (anon key) to read published content.
-- Run via: Supabase Dashboard → SQL Editor, or `supabase db push`

alter table treatments enable row level security;

drop policy if exists "public read published treatments" on treatments;
create policy "public read published treatments"
  on treatments for select
  to anon, authenticated
  using (status = 'published');

alter table pages enable row level security;
drop policy if exists "public read published pages" on pages;
create policy "public read published pages"
  on pages for select
  to anon, authenticated
  using (status = 'published');

alter table specials enable row level security;
drop policy if exists "public read published specials" on specials;
create policy "public read published specials"
  on specials for select
  to anon, authenticated
  using (status = 'published');

alter table testimonials enable row level security;
drop policy if exists "public read published testimonials" on testimonials;
create policy "public read published testimonials"
  on testimonials for select
  to anon, authenticated
  using (status = 'published');

alter table site_settings enable row level security;
drop policy if exists "public read site_settings" on site_settings;
create policy "public read site_settings"
  on site_settings for select
  to anon, authenticated
  using (true);
