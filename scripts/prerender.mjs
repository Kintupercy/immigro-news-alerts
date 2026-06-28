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
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { execSync } from 'node:child_process';
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

// Static routes mirror App.tsx exactly.
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
  '/signup',
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

// spaShell is set in main() before the server starts so it never mutates.
let spaShell = '';

function startStaticServer() {
  // Serve JS/CSS/image assets from dist/, but ALWAYS serve the original SPA
  // shell HTML for every route (never a prerendered file). This prevents the
  // homepage snapshot from being fed to subsequent routes and causing React
  // error #299 (rendering on top of pre-filled content).
  const serve = sirv(DIST, { dev: false, etag: true, single: false });
  const server = createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
    const path = url.pathname;
    // Serve real static assets (JS, CSS, images, fonts, manifest…).
    if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|eot|map|json|xml|txt)$/)) {
      serve(req, res, () => {
        res.statusCode = 404;
        res.end('Not found');
      });
    } else {
      // All HTML routes get the original SPA shell so React always mounts clean.
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(spaShell);
    }
  });
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
    // domcontentloaded is enough to get React booting; networkidle can hang
    // on long-lived connections (analytics keep-alives, websockets).
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait up to 15s for #root to gain any content (React mounted).
    // Pages that never paint (broken routes) just fall through to the
    // fixed settle below and still emit *some* HTML — better than nothing.
    try {
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          return root && root.innerHTML.trim().length > 0;
        },
        { timeout: 15000 }
      );
    } catch {
      console.warn(`[prerender] WARN ${route} — #root still empty after 15s; snapshotting anyway.`);
    }

    // Settle: lets helmet apply per-page <title>/JSON-LD and async
    // data (blog content, news) finish painting before we snapshot.
    await new Promise((r) => setTimeout(r, 3000));

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

  // Save the original SPA shell BEFORE any snapshotting. After route '/' is
  // snapshotted it overwrites dist/index.html; subsequent routes must still
  // receive the original shell so React mounts from a clean state.
  spaShell = await readFile(join(DIST, 'index.html'), 'utf8');

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

  // --single-process / --no-zygote help Chrome in Linux CI containers but
  // crash it on Windows (even when VERCEL=1 is injected by `vercel build`).
  const isLinuxCI =
    process.platform === 'linux' &&
    !!(process.env.CI || process.env.VERCEL || process.env.CF_PAGES);
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    ...(isLinuxCI ? ['--single-process', '--no-zygote'] : []),
  ];

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args });
  } catch (firstErr) {
    // Chrome not found — try installing it (happens on first Vercel/CI build
    // when the node_modules cache doesn't yet contain the Chrome binary).
    console.warn(`[prerender] Chrome launch failed (${firstErr?.message?.split('\n')[0]})`);
    console.log('[prerender] Attempting Chrome install via puppeteer browsers install...');
    try {
      execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
      browser = await puppeteer.launch({ headless: true, args });
      console.log('[prerender] Chrome installed and launched successfully.');
    } catch (installErr) {
      console.warn(`[prerender] Chrome install/launch failed: ${installErr?.message || installErr}`);
      console.warn('[prerender] Skipping prerender — site will still build and serve correctly.');
      server.close();
      process.exit(0);
    }
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
