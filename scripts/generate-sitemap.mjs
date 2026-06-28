#!/usr/bin/env node
// generate-sitemap.mjs — Writes public/sitemap.xml before `vite build` so it
// ends up in dist/ and is served as a static file (bypassing any edge-function
// proxy in _redirects). Run automatically via the `build` npm script.

import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');
const BASE_URL = 'https://immigronews.com';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://xybpgorbkiaitimxiqej.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_Wn6QDYJFnIMuhOSHsRjUlA_WpFVy3-v';

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const STATIC_PAGES = [
  { loc: '/',           priority: '1.0', changefreq: 'daily'   },
  { loc: '/news',       priority: '0.9', changefreq: 'hourly'  },
  { loc: '/blog',       priority: '0.8', changefreq: 'daily'   },
  { loc: '/faq',        priority: '0.7', changefreq: 'monthly' },
  { loc: '/signup',     priority: '0.6', changefreq: 'monthly' },
  { loc: '/resources',  priority: '0.5', changefreq: 'monthly' },
  { loc: '/about',      priority: '0.5', changefreq: 'monthly' },
  { loc: '/contact',    priority: '0.4', changefreq: 'monthly' },
  { loc: '/privacy',    priority: '0.3', changefreq: 'yearly'  },
  { loc: '/terms',      priority: '0.3', changefreq: 'yearly'  },
  { loc: '/disclaimer', priority: '0.3', changefreq: 'yearly'  },
];

async function fetchBlogPosts() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase
      .from('blog_articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(500);
    if (error) {
      console.warn(`[sitemap] Could not fetch blog_articles: ${error.message}`);
      return [];
    }
    const posts = (data || []).filter(r => typeof r?.slug === 'string' && r.slug.length > 0);
    console.log(`[sitemap] Found ${posts.length} published blog post(s).`);
    return posts;
  } catch (err) {
    console.warn(`[sitemap] Supabase fetch error: ${err?.message || err}`);
    return [];
  }
}

async function main() {
  const today = new Date().toISOString().split('T')[0];

  const blogPosts = await fetchBlogPosts();

  const urlEntries = [
    ...STATIC_PAGES.map(p => `  <url>
    <loc>${esc(`${BASE_URL}${p.loc}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...blogPosts.map(r => {
      const lastmod = (r.updated_at || r.published_at || today).split('T')[0];
      return `  <url>
    <loc>${esc(`${BASE_URL}/blog/${r.slug}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries.join('\n')}
</urlset>
`;

  await writeFile(join(PUBLIC, 'sitemap.xml'), xml, 'utf8');
  console.log(
    `[sitemap] Written public/sitemap.xml — ${STATIC_PAGES.length} static + ${blogPosts.length} blog routes.`
  );
}

main().catch(err => {
  console.error('[sitemap] Fatal error:', err?.message || err);
  process.exit(1);
});
