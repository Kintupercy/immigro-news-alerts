#!/usr/bin/env node
// generate-feeds.mjs — Writes public/rss.xml and public/sitemap-news.xml before
// `vite build` so they land in dist/ as static files. Run via the `build` script.
// Mirrors generate-sitemap.mjs (same Supabase credential fallbacks).

import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');
const BASE_URL = 'https://immigronews.com';
const SITE_TITLE = 'ImmigroNews';
const SITE_DESC =
  'Real-time U.S. immigration news, USCIS updates, and visa policy changes';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://xybpgorbkiaitimxiqej.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_Wn6QDYJFnIMuhOSHsRjUlA_WpFVy3-v';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// RFC 822 for RSS <pubDate>
function toRfc822(iso) {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

// W3C datetime for Google News <news:publication_date>
function toW3c(iso) {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function stripHtml(s) {
  return String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchNews() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from('immigration_news')
    .select('id, title, summary, content, category, source_url, published_at, updated_at, is_urgent, source_verified')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(100);
  if (error) {
    console.warn(`[feeds] Could not fetch immigration_news: ${error.message}`);
    return [];
  }
  console.log(`[feeds] Found ${(data || []).length} published news item(s).`);
  return data || [];
}

async function main() {
  const news = await fetchNews();

  // ---------- RSS 2.0 ----------
  const items = news.map((a) => {
    const description = esc(stripHtml(a.summary || a.content || a.title).slice(0, 500));
    return `    <item>
      <title>${esc(a.title)}</title>
      <link>${esc(`${BASE_URL}/news/${a.id}`)}</link>
      <guid isPermaLink="false">${esc(a.id)}</guid>
      <pubDate>${toRfc822(a.published_at)}</pubDate>
      <category>${esc(a.category || 'immigration')}</category>
      <description>${description}</description>
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_TITLE)}</title>
    <link>${esc(BASE_URL)}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${esc(`${BASE_URL}/rss.xml`)}" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>
`;

  // ---------- Google News sitemap ----------
  // Google News sitemaps may contain up to 1,000 URLs but only articles from the last 2 days.
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
  const newsUrls = news
    .filter((a) => {
      const t = a.published_at ? new Date(a.published_at).getTime() : 0;
      return !Number.isNaN(t) && t >= twoDaysAgo;
    })
    .map((a) => `  <url>
    <loc>${esc(`${BASE_URL}/news/${a.id}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${esc(SITE_TITLE)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${toW3c(a.published_at)}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
    </news:news>
  </url>`);

  const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsUrls.join('\n')}
</urlset>
`;

  await writeFile(join(PUBLIC, 'rss.xml'), rss, 'utf8');
  await writeFile(join(PUBLIC, 'sitemap-news.xml'), newsSitemap, 'utf8');
  console.log(
    `[feeds] Written public/rss.xml (${items.length} items) and public/sitemap-news.xml (${newsUrls.length} recent items).`
  );
}

main().catch((err) => {
  console.error('[feeds] Fatal error:', err?.message || err);
  process.exit(1);
});
