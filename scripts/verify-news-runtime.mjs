import assert from 'node:assert/strict';
import { writeFile, readdir } from 'node:fs/promises';
import puppeteer from 'puppeteer';

const base = process.argv[2] || 'http://127.0.0.1:8788';
const example = 'cfdcf323-b634-4e59-8ba4-811e9ec5fc14';
const api = 'https://xybpgorbkiaitimxiqej.supabase.co/rest/v1/immigration_news';
const headers = { apikey: 'sb_publishable_Wn6QDYJFnIMuhOSHsRjUlA_WpFVy3-v' };
const source = await fetch(`${api}?select=id,title,summary,content&status=eq.published&order=published_at.desc&limit=3`, { headers });
assert.equal(source.status, 200);
const rows = await source.json();
if (!rows.some((r) => r.id === example)) {
  const r = await fetch(`${api}?select=id,title,summary,content&id=eq.${example}&status=eq.published`, { headers });
  rows.push(...await r.json());
}
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const results = [];
try {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (compatible; ImmigroNewsQA/1.0)');
  await page.setJavaScriptEnabled(false);
  for (const row of rows) {
    console.log(`Checking no-JS ${row.id}`);
    const response = await page.goto(`${base}/news/${row.id}`, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    assert.equal(response.headers()['x-immigronews-render'], 'runtime-news-v1');
    assert.equal(response.headers()['cache-control'], 'no-store');
    const dom = await page.evaluate(() => ({
      title: document.title, h1: document.querySelector('h1')?.textContent,
      description: document.querySelector('meta[name="description"]')?.content,
      canonical: [...document.querySelectorAll('link[rel="canonical"]')].map((e) => e.href),
      og: [...document.querySelectorAll('meta[property="og:title"]')].map((e) => e.content),
      twitter: document.querySelector('meta[name="twitter:title"]')?.content,
      text: document.querySelector('article')?.textContent,
      schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map((e) => JSON.parse(e.textContent)).filter((s) => s['@type'] === 'NewsArticle'),
    }));
    const title = row.title.includes('ImmigroNews') ? row.title : `${row.title} | ImmigroNews`;
    assert.equal(dom.title, title); assert.equal(dom.h1, row.title);
    assert.deepEqual(dom.canonical, [`https://immigronews.com/news/${row.id}`]);
    assert.deepEqual(dom.og, [title]); assert.equal(dom.twitter, title);
    assert.equal(dom.description, (row.summary || row.content).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 155));
    assert.equal(dom.schema.length, 1); assert.equal(dom.schema[0].headline, row.title);
    assert.ok(dom.text.length > row.title.length + (row.summary || '').length);
    results.push({ url: `${base}/news/${row.id}`, status: response.status(), title: dom.title, checks: 'no-JS title/H1/description/canonical/OG/Twitter/body/NewsArticle/cache PASS' });
  }
  for (const id of ['not-a-uuid', '00000000-0000-4000-8000-000000000000']) {
    const r = await page.goto(`${base}/news/${id}`); assert.equal(r.status(), 404); assert.equal(r.headers()['x-robots-tag'], 'noindex');
  }
  // Hydrated React/navigation assertions live in tests/verify-news-browser.mjs.
  // Keep this check JS-free so client polling cannot stall an HTTP HTML audit.
  const response = await fetch(`${base}/sitemap.xml`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  assert.equal(response.status, 200); const xml = await response.text(); assert.ok(xml.includes(`/news/${example}`));
  console.log(JSON.stringify({ base, rows: results, missingRoutes: '2/2 noindex 404 PASS', javascript: 'disabled throughout HTML audit', sitemap: 'example present PASS' }, null, 2));
  await writeFile('/tmp/immigro-runtime-readback.json', JSON.stringify(results, null, 2));
  if (base.includes('127.0.0.1')) {
    const snapshots = await readdir(new URL('../dist/news', import.meta.url)).catch(() => []);
    assert.equal(snapshots.length, 0, 'Runtime verification must not depend on news snapshots');
    console.log('No build-time news snapshots: PASS');
  }
} finally { await browser.close(); }
