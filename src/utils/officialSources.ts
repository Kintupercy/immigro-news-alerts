// Single definition of "official government source" used by the Breaking tab,
// article badges, and the breaking-news banner. An article is official if it
// came in through one of the gov ingest feeds (tag) or links to a gov domain.

export const GOV_SOURCE_TAGS = ['uscis', 'dhs-enforcement', 'white-house', 'federal-register'];

export const GOV_DOMAINS = [
  'uscis.gov',
  'dhs.gov',
  'ice.gov',
  'cbp.gov',
  'state.gov',
  'justice.gov',
  'whitehouse.gov',
  'federalregister.gov',
];

export function isOfficialGovArticle(article: {
  tags?: string[] | null;
  source_url?: string | null;
}): boolean {
  if (article.tags?.some(tag => GOV_SOURCE_TAGS.includes(tag))) return true;
  if (article.source_url && GOV_DOMAINS.some(d => article.source_url!.includes(d))) return true;
  return false;
}
