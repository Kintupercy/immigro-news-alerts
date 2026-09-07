# Request-time news HTML on Cloudflare Pages

`/news/:id` is served by `functions/news/[id].js`. Published rows are read from
Supabase for each GET/HEAD; no article-ID list or rebuild is needed for new rows
or edits. Only the existing public/RLS-restricted key is used. Draft/deleted IDs
return noindex 404; database/template failures return noindex 503 with Retry-After.
Responses are no-store so corrections and publication are not hidden by stale HTML.

The production build saves `dist/news-shell.html` immediately after Vite and
before Puppeteer overwrites the homepage. The Function reads the pretty asset path
`/news-shell`, preserves its compiled CSS/JS/security headers, and inserts escaped
article metadata, readable content and NewsArticle JSON-LD. React then mounts as
before. `data-rh` allows Helmet to replace metadata during client navigation.

`public/_routes.json` invokes Functions only for `/news/*`; static assets, blog
pages, homepage and listings retain Pages' static serving. News detail snapshots
are deliberately removed from the build inventory. Static/blog snapshots, RSS
and sitemaps are still build-time artifacts (discovery freshness is separate from
request-time article correctness).

## Verify / deploy

- `npm test` — regression tests, including publication after an earlier missing-ID
  request, status filtering, XSS, metadata, canonical, errors and HTTP methods.
- `npm run build` — full Vite/feed/sitemap build and static/blog prerender. Set
  `PRERENDER_PORT` to a free port if 4173 is already in use locally.
- `npx wrangler pages functions build --outdir /tmp/immigro-functions-build`
- `npx wrangler pages dev dist --port 8788` (local verification only).
- `node tests/verify-news-browser.mjs http://127.0.0.1:8788` — real Chromium
  mount, unique Helmet metadata/schema, navigation to listing and back, page errors.
- Deploy only by git push to `kintupercy/immigro-news-alerts` main; Cloudflare Pages
  builds it. **Never locally deploy dist with Wrangler.**
- Repeat browser verification against `https://immigronews.com`, and fetch HTML
  without JavaScript. Expect `X-Immigronews-Render: runtime-news-v1`, HTTP 200,
  article title, unique canonical/OG/Twitter metadata, H1/body and NewsArticle.

## Operational tradeoffs

News requests now depend on Supabase and consume Pages Functions invocations.
Monitor upstream availability and Functions usage/quota. Do not enable automatic
fallthrough on exceptions: a generic 200 hides failures from crawlers. On a free
Workers plan, review Cloudflare's quota fail-open/fail-closed setting; this code
does not change account billing or settings. Social platforms may retain an older
card until they re-fetch it; Google re-indexing is not immediate.
