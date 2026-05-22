#!/usr/bin/env node
// prerender.mjs — Post-build static-snapshot step for the ImmigroNews SPA.
// Spins up a local sirv server on dist/, drives puppeteer through every public
// route (static + Supabase-sourced dynamic slugs), and writes per-route
// index.html files so LLM crawlers see real <title>/JSON-LD/content without JS.
// Skip with: SKIP_PRERENDER=1 npm run build
// Run standalone: node scripts/prerender.mjs

import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import sirv from 'sirv';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PORT = Number(process.env.PRERENDER_PORT || 4173);
const INITIAL_TITLE =
  'ImmigroNews - Latest Immigration News, Visa Updates & Legal Help';

if (process.env.SKIP_PRERENDER === '1') {
  console.log('[prerender] SKIP_PRERENDER=1 set — skipping prerender step.');
  process.exit(0);
}

// Static routes mirror App.tsx exactly. /signup is in src/pages but has no
// <Route> in App.tsx (would render NotFound), so it is intentionally omitted.
const STATIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/faq',
  '/news',
  '/resources',
  '/blog',
];

// Pull anon Supabase credentials with multiple fallbacks. The committed
// src/integrations/supabase/client.ts hard-codes a publishable key + URL, so we
// use those as a final fallback when env vars are absent (e.g. cold CI build).
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://xybpgorbkiaitimxiqej.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_Wn6QDYJFnIMuhOSHsRjUlA_WpFVy3-v';

async function fileExists(p) {
  try {
    await access(p, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function fetchBlogSlugs() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      '[prerender] Supabase credentials missing — skipping dynamic blog routes.'
    );
    return [];
  }
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase
      .from('blog_articles')
      .select('slug')
      .eq('status', 'published')
      .limit(1000);
    if (error) {
      console.warn(
        `[prerender] Could not fetch blog_articles slugs: ${error.message}`
      );
      return [];
    }
    return (data || [])
      .map((row) => row?.slug)
      .filter((s) => typeof s === 'string' && s.length > 0);
  } catch (err) {
    console.warn(
      `[prerender] Unexpected error fetching blog slugs: ${err?.message || err}`
    );
    return [];
  }
}

function startStaticServer() {
  const serve = sirv(DIST, {
    dev: false,
    etag: true,
    single: true, // SPA fallback so unknown routes still load index.html
  });
  const server = createServer((req, res) => serve(req, res, () => {
    res.statusCode = 404;
    res.end('Not found');
  }));
  return new Promise((resolvePromise, rejectPromise) => {
    server.once('error', rejectPromise);
    server.listen(PORT, '127.0.0.1', () => resolvePromise(server));
  });
}

async function snapshotRoute(browser, route) {
  const url = `http://127.0.0.1:${PORT}${route}`;
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });

    // Wait for React to mount and helmet to apply per-page metadata.
    // We accept either: title changed away from initial, an <h1> exists,
    // or the #root has actual content. Whichever happens first.
    await page.waitForFunction(
      (initialTitle) => {
        const root = document.getElementById('root');
        const hasContent = root && root.innerHTML.trim().length > 0;
        const titleChanged =
          document.title && document.title.trim() !== initialTitle;
        const hasH1 = !!document.querySelector('h1');
        return hasContent && (titleChanged || hasH1);
      },
      { timeout: 30000 },
      INITIAL_TITLE
    );

    // Small settle so any async-loaded JSON-LD/meta is flushed by helmet.
    await new Promise((r) => setTimeout(r, 500));

    const html = await page.evaluate(
      () => '<!doctype html>\n' + document.documentElement.outerHTML
    );
    return html;
  } finally {
    await page.close();
  }
}

function routeToOutputPath(route) {
  // '/'           -> dist/index.html (skip — already present, but rewrite to capture helmet output)
  // '/about'      -> dist/about/index.html
  // '/blog/foo'   -> dist/blog/foo/index.html
  const cleaned = route.replace(/^\/+/, '').replace(/\/+$/, '');
  if (cleaned === '') return join(DIST, 'index.html');
  return join(DIST, ...cleaned.split('/'), 'index.html');
}

async function writeSnapshot(route, html) {
  const outPath = routeToOutputPath(route);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, 'utf8');
  return outPath;
}

async function main() {
  if (!(await fileExists(DIST))) {
    console.error(
      `[prerender] dist/ not found at ${DIST}. Run \`vite build\` first.`
    );
    process.exit(1);
  }
  if (!(await fileExists(join(DIST, 'index.html')))) {
    console.error('[prerender] dist/index.html missing — aborting.');
    process.exit(1);
  }

  console.log('[prerender] Starting local static server on port', PORT);
  let server;
  try {
    server = await startStaticServer();
  } catch (err) {
    console.error(
      `[prerender] Failed to start local server: ${err?.message || err}`
    );
    process.exit(1);
  }

  console.log('[prerender] Fetching dynamic blog slugs from Supabase...');
  const blogSlugs = await fetchBlogSlugs();
  console.log(`[prerender] Found ${blogSlugs.length} published blog slug(s).`);

  const blogRoutes = blogSlugs.map((slug) => `/blog/${slug}`);
  const allRoutes = [...STATIC_ROUTES, ...blogRoutes];
  console.log(`[prerender] Total routes to prerender: ${allRoutes.length}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  } catch (err) {
    console.error(
      `[prerender] Puppeteer launch failed: ${err?.message || err}`
    );
    server.close();
    process.exit(1);
  }

  // We intentionally LET the '/' snapshot overwrite dist/index.html. The
  // snapshot still contains the <script type="module" src="..."> bootstrap
  // (puppeteer captures the full document including script tags), so the SPA
  // hydrates normally and unknown routes (the /* /index.html 200 fallback)
  // briefly show the home shell before client-side React re-routes — same as
  // before prerendering, but now with real meta/JSON-LD visible to crawlers.

  let okCount = 0;
  const failed = [];
  for (const route of allRoutes) {
    try {
      const html = await snapshotRoute(browser, route);
      const outPath = await writeSnapshot(route, html);
      okCount += 1;
      console.log(
        `[prerender] OK ${route.padEnd(40)} -> ${outPath.replace(ROOT + '\\', '').replace(ROOT + '/', '')}`
      );
    } catch (err) {
      failed.push({ route, error: err?.message || String(err) });
      console.warn(`[prerender] FAIL ${route} :: ${err?.message || err}`);
    }
  }

  await browser.close();
  server.close();

  console.log(
    `[prerender] Done. ${okCount}/${allRoutes.length} routes snapshotted.`
  );
  if (failed.length > 0) {
    console.warn(`[prerender] ${failed.length} route(s) failed:`);
    for (const f of failed) console.warn(`  - ${f.route}: ${f.error}`);
    // Don't fail the build on individual route errors — partial prerender
    // still improves SEO and the SPA fallback covers the rest.
  }
}

main().catch((err) => {
  console.error('[prerender] Fatal error:', err);
  process.exit(1);
});
