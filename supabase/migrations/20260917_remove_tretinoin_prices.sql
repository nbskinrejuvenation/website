-- Remove all Tretinoin references from treatment pages.
-- Affects: medi-aesthetic-peels (Tretinoin as a peel type)
--          micro-needling (Tretinoin as an add-on)

UPDATE treatments
SET
  body_html = regexp_replace(
    body_html,
    E'\\s*<tr><td>[^<]*Tretinoin[^<]*</td></tr>',
    '',
    'g'
  ),
  updated_at = NOW()
WHERE slug IN ('medi-aesthetic-peels', 'micro-needling');

-- Verify
SELECT slug, body_html
FROM treatments
WHERE slug IN ('medi-aesthetic-peels', 'micro-needling');
