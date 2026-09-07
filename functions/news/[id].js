// Cloudflare Pages resolves this route at request time, including IDs published
// after the last build. Never fall through to a stale snapshot/homepage on error.
const SITE = 'https://immigronews.com';
const IMAGE = `${SITE}/lovable-uploads/eb1aea6b-9f1d-437a-867c-c5027cbaacd2.png`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clean = (value) => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const safeUrl = (value) => { try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : ''; } catch { return ''; } };

function inline(value) {
  // Escape all input first. Only HTTP(S) Markdown links become markup.
  return escape(value.replace(/\*\*/g, '')).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}
function bodyHtml(content) {
  return content.split(/\r?\n\s*\r?\n/).map((s) => s.trim()).filter(Boolean).map((block) => {
    if (/^##\s+/.test(block)) return `<h2>${inline(block.replace(/^##\s+/, ''))}</h2>`;
    const lines = block.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    for (const [pattern, tag] of [[/^[-*]\s+/, 'ul'], [/^\d+\.\s+/, 'ol']]) {
      if (lines.every((s) => pattern.test(s))) return `<${tag}>${lines.map((s) => `<li>${inline(s.replace(pattern, ''))}</li>`).join('')}</${tag}>`;
    }
    return `<p>${inline(block.replace(/\s+/g, ' '))}</p>`;
  }).join('\n');
}
function render(shell, article) {
  const url = `${SITE}/news/${article.id}`;
  const title = article.title.includes('ImmigroNews') ? article.title : `${article.title} | ImmigroNews`;
  const description = clean(article.summary || article.content).slice(0, 155);
  const modified = article.updated_at || article.published_at;
  const meta = (key, value, property = false) => `<meta data-rh="true" ${property ? 'property' : 'name'}="${key}" content="${escape(value)}">`;
  const head = `<title>${escape(title)}</title><link data-rh="true" rel="canonical" href="${url}">` + [
    meta('description', description), meta('robots', 'index, follow, max-image-preview:large'),
    meta('og:type', 'article', true), meta('og:title', title, true), meta('og:description', description, true), meta('og:url', url, true), meta('og:image', IMAGE, true), meta('og:site_name', 'ImmigroNews', true),
    meta('twitter:card', 'summary_large_image'), meta('twitter:site', '@ImmigroNews'), meta('twitter:title', title), meta('twitter:description', description), meta('twitter:image', IMAGE),
    meta('article:published_time', article.published_at, true), meta('article:modified_time', modified, true), meta('article:section', article.category, true),
  ].join('');
  const schema = {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title, description, url,
    datePublished: article.published_at, dateModified: modified,
    author: { '@type': 'Organization', name: 'ImmigroNews', url: SITE },
    publisher: { '@type': 'Organization', name: 'ImmigroNews', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }, articleSection: article.category,
    keywords: (article.tags || []).join(', '), isAccessibleForFree: true, inLanguage: 'en-US',
  };
  const source = safeUrl(article.source_url);
  const content = `<div class="min-h-screen bg-gray-50"><header class="border-b bg-white p-4"><a href="/" class="text-2xl font-bold text-blue-900">ImmigroNews</a></header><main class="container mx-auto max-w-3xl px-4 py-8 lg:py-12"><a href="/news" class="text-blue-700">All immigration news</a><article><p class="mt-5 text-sm text-gray-500">${escape(article.category)} · <time datetime="${escape(article.published_at)}">${escape(article.published_at.slice(0, 10))}</time></p><h1 class="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">${escape(article.title)}</h1>${article.summary ? `<p class="mt-5 text-xl leading-relaxed text-gray-600">${escape(clean(article.summary))}</p>` : ''}<div class="prose prose-lg mt-8 max-w-none text-gray-700">${bodyHtml(article.content)}</div>${source ? `<div class="mt-8 border-t pt-5"><p>Source: ImmigroNews aggregates and links to the original reporting.</p><a href="${escape(source)}" target="_blank" rel="noopener noreferrer">Read original source</a></div>` : ''}<p class="mt-8 border-t pt-5 text-sm text-gray-500">This is general immigration news, not legal advice. For advice about your situation, consult a licensed immigration attorney.</p></article><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script></main></div>`;
  // The immutable, pre-prerender Vite shell has no per-page metadata or root
  // content. data-rh lets Helmet replace server metadata on client navigation.
  return shell.replace('</head>', () => `${head}</head>`).replace('<div id="root"></div>', () => `<div id="root">${content}</div>`);
}
function errorResponse(request, status) {
  const message = status === 404 ? 'Article not found' : status === 405 ? 'Method not allowed' : 'Article temporarily unavailable';
  return new Response(request.method === 'HEAD' ? null : `<!doctype html><html lang="en"><head><title>${message} | ImmigroNews</title><meta name="robots" content="noindex"></head><body><h1>${message}</h1><a href="/news">All immigration news</a></body></html>`, {
    status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff', ...(status === 503 ? { 'Retry-After': '60' } : {}), ...(status === 405 ? { Allow: 'GET, HEAD' } : {}) },
  });
}
export async function onRequest(context) {
  const { request, params, env } = context;
  if (!['GET', 'HEAD'].includes(request.method)) return errorResponse(request, 405);
  if (typeof params.id !== 'string' || !UUID.test(params.id)) return errorResponse(request, 404);
  const incoming = new URL(request.url);
  if (incoming.hostname === 'www.immigronews.com' || incoming.pathname.endsWith('/')) {
    if (incoming.hostname === 'www.immigronews.com') incoming.hostname = 'immigronews.com';
    incoming.pathname = incoming.pathname.replace(/\/$/, '');
    return Response.redirect(incoming.href, 301);
  }
  try {
    // Same public, RLS-restricted credentials as the existing browser client.
    // No service-role key is needed or accepted by default.
    const base = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://xybpgorbkiaitimxiqej.supabase.co';
    const key = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || 'sb_publishable_Wn6QDYJFnIMuhOSHsRjUlA_WpFVy3-v';
    const query = new URL('/rest/v1/immigration_news', base);
    query.search = new URLSearchParams({ select: 'id,title,summary,content,category,source_url,published_at,updated_at,tags,status', id: `eq.${params.id}`, status: 'eq.published', limit: '1' }).toString();
    const result = await (context.fetch || fetch)(query, { headers: { apikey: key, Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!result.ok) return errorResponse(request, 503);
    const rows = await result.json();
    if (!Array.isArray(rows)) return errorResponse(request, 503);
    if (!rows.length || rows[0].status !== 'published') return errorResponse(request, 404);
    const article = rows[0];
    if (article.id !== params.id || typeof article.title !== 'string' || !article.title.trim() || typeof article.content !== 'string' || !article.published_at || !Number.isFinite(Date.parse(article.published_at))) return errorResponse(request, 503);
    const asset = await env.ASSETS.fetch(new URL('/news-shell', request.url));
    const shell = await asset.text();
    if (!asset.ok || !shell.includes('<div id="root"></div>') || !shell.includes('</head>')) return errorResponse(request, 503);
    const headers = new Headers(asset.headers);
    for (const header of ['etag', 'last-modified', 'content-length', 'content-encoding', 'x-robots-tag']) headers.delete(header);
    headers.set('Content-Type', 'text/html; charset=utf-8');
    // No negative/stale snapshot caching: edits and newly published IDs are
    // visible on the next request, without a publish hook or rebuild race.
    headers.set('Cache-Control', 'no-store');
    headers.set('X-Immigronews-Render', 'runtime-news-v1');
    return new Response(request.method === 'HEAD' ? null : render(shell, article), { status: 200, headers });
  } catch {
    return errorResponse(request, 503);
  }
}
