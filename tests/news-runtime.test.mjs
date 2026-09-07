import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// Before this route exists Pages serves the generic SPA fallback.
const route = new URL('../functions/news/[id].js', import.meta.url);
const onRequest = existsSync(route) ? (await import(route)).onRequest : (ctx) => ctx.next();
const id = 'cfdcf323-b634-4e59-8ba4-811e9ec5fc14';
const shell = '<!doctype html><html><head><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>';
const article = { id, title: 'Test article & "quotes"', summary: 'Source-specific summary.', content: 'First paragraph.\n\n## Details\n\n- First item\n- Second item', category: 'Policy', published_at: '2026-09-07T00:00:00Z', updated_at: '2026-09-07T01:00:00Z', tags: ['policy'], source_url: 'https://example.org/source', status: 'published' };
function context({ row = article, status = 200, method = 'GET', path = `/news/${id}`, asset = shell, throws = false } = {}) {
  const calls = [];
  return {
    request: new Request(`https://immigronews.com${path}`, { method }), params: { id: path.split('/')[2] },
    env: { ASSETS: { fetch: async (url) => { calls.push(String(url)); return new Response(asset); } } },
    next: async () => new Response('<title>Latest US Immigration News & Daily Updates | ImmigroNews</title>'),
    // External I/O only is substituted; rendering/routing/error handling are real.
    fetch: async (url, options) => {
      calls.push([String(url), options]);
      if (throws) throw new Error('network unavailable');
      return Response.json(row ? [row] : [], { status });
    }, calls,
  };
}
test('renders a published row not present in build assets with unique crawlable metadata and body', async () => {
  const ctx = context(); const response = await onRequest(ctx); const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<title[^>]*>Test article &amp; &quot;quotes&quot; \| ImmigroNews<\/title>/);
  for (const marker of ['og:title', 'twitter:title', 'Source-specific summary.', `https://immigronews.com/news/${id}`, '<h1', 'First paragraph.', 'NewsArticle', 'Read original source', '/assets/app.js']) assert.ok(html.includes(marker), marker);
  assert.equal(response.headers.get('x-immigronews-render'), 'runtime-news-v1');
  assert.match(response.headers.get('cache-control'), /no-store/);
  const [url, options] = ctx.calls.find(Array.isArray);
  const query = new URL(url).searchParams;
  assert.equal(query.get('id'), `eq.${id}`); assert.equal(query.get('status'), 'eq.published');
  assert.ok(options.signal); assert.ok(options.headers.apikey);
  assert.equal(ctx.calls.filter(c => typeof c === 'string').length, 1);
  assert.ok(ctx.calls.includes('https://immigronews.com/news-shell'));
});
test('reads new and updated rows after a previous request without requiring a rebuild', async () => {
  assert.equal((await onRequest(context({ row: null }))).status, 404);
  assert.match(await (await onRequest(context())).text(), /Test article/);
  assert.match(await (await onRequest(context({ row: { ...article, title: 'Updated after build' } }))).text(), /Updated after build/);
});
test('missing or unpublished articles are noindex 404, not generic 200', async () => {
  for (const row of [null, { ...article, status: 'draft' }]) {
    const r = await onRequest(context({ row })); assert.equal(r.status, 404); assert.equal(r.headers.get('x-robots-tag'), 'noindex');
  }
});
test('invalid IDs are rejected before database or asset access', async () => {
  const ctx = context({ path: '/news/not-a-uuid' }); assert.equal((await onRequest(ctx)).status, 404); assert.equal(ctx.calls.length, 0);
});
test('upstream errors and malformed rows return retryable noindex 503, not a false 404 or generic 200', async () => {
  for (const options of [{ status: 503 }, { throws: true }, { row: { ...article, title: null } }, { asset: '<html>wrong fallback</html>' }]) {
    const r = await onRequest(context(options)); assert.equal(r.status, 503); assert.equal(r.headers.get('x-robots-tag'), 'noindex'); assert.equal(r.headers.get('retry-after'), '60');
  }
});
test('escapes database text, JSON-LD script terminators and unsafe source URLs', async () => {
  const row = { ...article, title: '</script><script>alert(1)</script>', content: '<img src=x onerror=alert(1)>', source_url: 'javascript:alert(1)' };
  const html = await (await onRequest(context({ row }))).text();
  assert.ok(!html.includes('<script>alert')); assert.ok(!html.includes('<img src=x')); assert.ok(!html.includes('href="javascript:'));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)[1]); assert.equal(schema.headline, row.title);
});
test('HEAD matches GET headers without a body; POST is not allowed', async () => {
  const r = await onRequest(context({ method: 'HEAD' })); assert.equal(r.status, 200); assert.equal(await r.text(), '');
  const post = await onRequest(context({ method: 'POST' })); assert.equal(post.status, 405); assert.equal(post.headers.get('allow'), 'GET, HEAD');
});
test('normalizes www and trailing slash without dropping query parameters', async () => {
  const ctx = context({ path: `/news/${id}/?utm_source=test` }); ctx.request = new Request(`https://www.immigronews.com/news/${id}/?utm_source=test`);
  const r = await onRequest(ctx); assert.equal(r.status, 301); assert.equal(r.headers.get('location'), `https://immigronews.com/news/${id}?utm_source=test`);
});
test('literal replacement tokens in article text do not corrupt the shell', async () => {
  const html = await (await onRequest(context({ row: { ...article, title: 'Budget $& and $` tokens' } }))).text();
  assert.ok(html.includes('Budget $&amp; and $` tokens'));
  assert.equal((html.match(/id="root"/g) || []).length, 1);
});
test('build inventory does not snapshot runtime news detail routes', () => {
  const source = readFileSync(new URL('../scripts/prerender.mjs', import.meta.url), 'utf8');
  assert.ok(!source.includes('fetchNewsIds'), 'news IDs must not be frozen into build snapshots');
});
test('news publication is not enumerated by the build-time snapshot pipeline', () => {
  const script = readFileSync(new URL('../scripts/prerender.mjs', import.meta.url), 'utf8');
  assert.ok(!script.includes(".from('immigration_news')"), 'news routes must be request-time, not a finite build snapshot');
});
test('limits Functions invocations to news detail routes', () => {
  const file = new URL('../public/_routes.json', import.meta.url); assert.ok(existsSync(file), '_routes.json must exist');
  assert.deepEqual(JSON.parse(readFileSync(file)), { version: 1, include: ['/news/*'], exclude: [] });
});
