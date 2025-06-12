-- Add NPR article about ICE detention capacity
INSERT INTO public.immigration_news (
  title,
  content,
  summary,
  category,
  source_url,
  status,
  is_urgent,
  manually_created,
  tags,
  published_at
) VALUES (
  'Private Prisons and Local Jails Ramp Up as ICE Detention Exceeds Capacity',
  'As Immigration and Customs Enforcement (ICE) detention facilities reach capacity limits, private prison companies and local jails are expanding operations to accommodate the overflow. This development raises concerns about detention conditions and the privatization of immigration enforcement infrastructure.',
  'ICE detention facilities are reaching capacity, leading to increased reliance on private prisons and local jails to house immigration detainees.',
  'enforcement',
  'https://www.npr.org/2025/06/04/nx-s1-5417980/private-prisons-and-local-jails-are-ramping-up-as-ice-detention-exceeds-capacity',
  'published',
  false,
  true,
  ARRAY['ICE', 'detention', 'private prisons', 'enforcement', 'capacity'],
  now()
);