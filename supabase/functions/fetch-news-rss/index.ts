
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// All 10 feeds verified returning HTTP 200 (tested 2026-06-27)
const RSS_FEEDS = [
  // Google News RSS — keyword-targeted, always fresh, works great
  { url: "https://news.google.com/rss/search?q=US+immigration+visa+USCIS+policy&hl=en-US&gl=US&ceid=US:en", name: "Google News Immigration" },
  { url: "https://news.google.com/rss/search?q=immigration+deportation+border+ICE+enforcement&hl=en-US&gl=US&ceid=US:en", name: "Google News Enforcement" },
  { url: "https://news.google.com/rss/search?q=green+card+H1B+asylum+refugee+DACA+visa&hl=en-US&gl=US&ceid=US:en", name: "Google News Visas" },
  // Major news outlets — general politics, filtered by immigration keywords
  { url: "https://feeds.npr.org/1014/rss.xml", name: "NPR Politics" },
  { url: "https://moxie.foxnews.com/google-publisher/politics.xml", name: "Fox News" },
  { url: "https://rss.politico.com/politics-news.xml", name: "Politico" },
  { url: "https://abcnews.go.com/abcnews/politicsnewsheadlines", name: "ABC News" },
  { url: "https://www.cbsnews.com/latest/rss/politics", name: "CBS News" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml", name: "NYT US" },
  { url: "https://feeds.nbcnews.com/nbcnews/public/news", name: "NBC News" },
];

const IMMIGRATION_KEYWORDS = [
  'immigration', 'immigrant', 'visa', 'green card', 'deportation', 'asylum', 'refugee',
  'border', 'citizenship', 'naturalization', ' ice ', 'cbp', 'uscis', ' dhs ',
  'h-1b', 'h1b', 'f-1 ', 'f1 visa', 'student visa', 'work permit', 'daca', ' tps ',
  'family reunification', 'undocumented', 'unauthorized immigrant',
  'immigration policy', 'immigration law', 'immigration court', 'immigration judge',
  'removal order', 'adjustment of status', 'travel ban', 'entry ban',
  'visa bulletin', 'employment authorization', 'immigration enforcement',
  'border security', 'permanent resident', 'asylum seeker', 'migrant',
  'title 42', 'remain in mexico', 'expedited removal', 'consular processing',
  'priority date', 'immigration reform', 'merit-based',
  'ice raid', 'ice arrests', 'ice enforcement',
  'sanctuary city', 'sanctuary state',
];

const CATEGORY_RULES: Array<{ slug: string; keywords: string[] }> = [
  { slug: 'employment-based', keywords: ['h-1b', 'h1b', 'l-1 ', 'l1 visa', 'o-1 ', 'o1 visa', 'tn visa', 'work visa', 'work permit', 'employment authorization', 'employment-based', 'specialty occupation', 'labor certification'] },
  { slug: 'green-card', keywords: ['green card', 'permanent resident', 'permanent residence', 'eb-1', 'eb-2', 'eb-3', 'adjustment of status', 'lawful permanent', 'priority date', 'visa bulletin', 'immigrant visa', 'diversity visa', 'dv lottery'] },
  { slug: 'international-students', keywords: ['f-1 ', 'f1 visa', 'student visa', 'international student', 'sevis', 'opt program', 'j-1 student', 'm-1 visa'] },
  { slug: 'refugees-asylees', keywords: ['asylum', 'refugee', 'daca', ' tps ', 'asylee', 'humanitarian', 'dreamer', 'deferred action', 'temporary protected', 'withholding of removal'] },
  { slug: 'family-based', keywords: ['family-based', 'family reunification', 'spouse visa', 'k-1 ', 'k1 visa', 'fiancé', 'i-130', 'immediate relative', 'family petition', 'chain migration'] },
  { slug: 'citizenship', keywords: ['citizenship', 'naturalization', 'naturalize', 'oath ceremony', 'n-400', 'become a citizen', 'birthright citizenship'] },
  { slug: 'investors', keywords: ['eb-5', 'e-1 visa', 'e-2 visa', 'investor visa', 'entrepreneur visa', 'investment immigration', 'regional center'] },
  { slug: 'exchange-visitors', keywords: ['j-1 ', 'j1 visa', 'exchange visitor', 'au pair', 'cultural exchange program'] },
  { slug: 'temporary-visitors', keywords: ['b-1', 'b-2', 'b1/b2', 'tourist visa', 'visitor visa', 'esta ', 'visa waiver program'] },
  { slug: 'undocumented', keywords: ['undocumented', 'unauthorized immigrant', 'illegal alien', 'mixed-status', 'ice raid', 'ice arrests', 'ice enforcement'] },
];

const URGENT_INDICATORS = [
  'travel ban', 'entry ban', 'suspended entry', 'effective immediately',
  'takes effect immediately', 'executive order', 'presidential proclamation',
  'emergency order', 'mass deportation', 'immediate deportation',
  'emergency enforcement', 'court blocks', 'injunction issued',
  'temporary restraining order', 'immediate halt', 'program terminated',
  'immediately suspended', 'ends immediately',
];

interface RssItem { title: string; summary: string; url: string; publishedAt: Date; source: string; }

// ── Regex-based RSS/Atom parser (works reliably in Deno Deploy) ──────────────

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  ndash: '–', mdash: '—', hellip: '…', copy: '©',
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

function stripHtml(s: string): string {
  // 1. Unwrap CDATA
  let t = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  // 2. Decode HTML entities FIRST so escaped tags become real tags.
  //    Run twice: feeds often double-encode (&amp;apos; -> &apos; -> ')
  t = decodeEntities(decodeEntities(t));
  // 3. Strip all HTML tags (now catches both real and previously-escaped ones)
  t = t.replace(/<[^>]+>/g, ' ');
  // 4. Collapse whitespace
  return t.replace(/\s+/g, ' ').trim().substring(0, 500);
}

function clean(s: string): string { return stripHtml(s); }

function extractTag(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? m[1] : '';
}

function extractLinkRss(block: string): string {
  // <link>URL</link>
  const m1 = block.match(/<link(?:\s[^>]*)?>([^<\s]+)<\/link>/i);
  if (m1 && m1[1].startsWith('http')) return m1[1].trim();
  // <link href="URL"/> (RSS with href attribute)
  const m2 = block.match(/<link[^>]+href=["']([^"']+)["']/i);
  if (m2) return m2[1].trim();
  return '';
}

function extractLinkAtom(block: string): string {
  // <link rel="alternate" href="URL"/> or <link href="URL"/>
  const m1 = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  if (m1) return m1[1].trim();
  return '';
}

function parseFeed(xml: string, sourceName: string): RssItem[] {
  const items: RssItem[] = [];

  // Try RSS 2.0 <item> elements
  const rssMatches = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)];
  if (rssMatches.length > 0) {
    for (const m of rssMatches) {
      const block = m[1];
      const title = clean(extractTag(block, 'title'));
      const url = extractLinkRss(block);
      const rawSummary = clean(extractTag(block, 'description'));
      // Google News descriptions are just "<a href=...>title</a>, Source" — after stripping they
      // collapse to "title, Source" which duplicates the title. Use title as fallback when short.
      const summary = rawSummary.length > title.length + 10 ? rawSummary : '';
      const pubDateRaw = extractTag(block, 'pubDate') || extractTag(block, 'dc:date') || extractTag(block, 'pubdate');
      if (title && url) {
        items.push({ title, summary, url, publishedAt: pubDateRaw ? new Date(pubDateRaw) : new Date(), source: sourceName });
      }
    }
    console.log(`  [${sourceName}] RSS 2.0: ${items.length} items`);
    return items;
  }

  // Try Atom <entry> elements
  const atomMatches = [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)];
  for (const m of atomMatches) {
    const block = m[1];
    const title = clean(extractTag(block, 'title'));
    const url = extractLinkAtom(block);
    const summary = clean(extractTag(block, 'summary') || extractTag(block, 'content'));
    const dateRaw = extractTag(block, 'published') || extractTag(block, 'updated');
    if (title && url) {
      items.push({ title, summary, url, publishedAt: dateRaw ? new Date(dateRaw) : new Date(), source: sourceName });
    }
  }
  if (atomMatches.length > 0) console.log(`  [${sourceName}] Atom: ${items.length} items`);
  else console.log(`  [${sourceName}] No <item> or <entry> found in XML`);
  return items;
}

// ── Filters ─────────────────────────────────────────────────────────────────

function isImmigrationRelated(title: string, summary: string): boolean {
  const text = ` ${title} ${summary} `.toLowerCase();
  return IMMIGRATION_KEYWORDS.some(kw => text.includes(kw));
}

function isOpinion(url: string, title: string): boolean {
  const u = url.toLowerCase();
  const t = title.toLowerCase();
  const paths = ['/opinion/', '/editorial/', '/commentary/', '/op-ed/', '/analysis/'];
  const prefixes = ['opinion:', 'editorial:', 'commentary:', 'perspective:'];
  return paths.some(p => u.includes(p)) || prefixes.some(p => t.startsWith(p));
}

function classifyCategory(title: string, summary: string): string {
  const text = ` ${title} ${summary} `.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) return rule.slug;
  }
  return 'refugees-asylees';
}

function classifyUrgency(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  const hasUrgent = URGENT_INDICATORS.some(i => text.includes(i));
  const hasImmediate = ['immediately', 'effective today', 'starts today', 'begins today', 'effective now'].some(s => text.includes(s));
  return hasUrgent && hasImmediate;
}

// ── Handler ──────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { maxAgeHours = 24 } = await req.json().catch(() => ({}));
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    console.log(`RSS fetch — window: ${maxAgeHours}h, cutoff: ${cutoff.toISOString()}`);

    // Fetch all feeds in parallel
    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        try {
          const res = await fetch(feed.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ImmigronewsBot/1.0)' },
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const xml = await res.text();
          return parseFeed(xml, feed.name);
        } finally {
          clearTimeout(timer);
        }
      })
    );

    let feedsOk = 0;
    const allItems: RssItem[] = [];
    RSS_FEEDS.forEach((feed, i) => {
      const r = feedResults[i];
      if (r.status === 'fulfilled') { feedsOk++; allItems.push(...r.value); }
      else console.log(`  ✗ ${feed.name}: ${r.reason}`);
    });
    console.log(`Feeds OK: ${feedsOk}/${RSS_FEEDS.length} — raw items: ${allItems.length}`);

    // Filter
    const relevant = allItems.filter(item => {
      const pub = item.publishedAt;
      if (isNaN(pub.getTime())) return false;
      if (pub < cutoff) return false;
      if (!isImmigrationRelated(item.title, item.summary)) return false;
      if (isOpinion(item.url, item.title)) return false;
      return true;
    });
    console.log(`After filter: ${relevant.length} immigration articles within ${maxAgeHours}h`);

    // In-batch URL dedup
    const seenUrls = new Set<string>();
    const unique = relevant.filter(item => {
      if (seenUrls.has(item.url)) return false;
      seenUrls.add(item.url);
      return true;
    });

    let articlesAdded = 0;
    let urgentCount = 0;

    for (const item of unique) {
      const { data: byUrl } = await supabase.from('immigration_news').select('id').eq('source_url', item.url).limit(1);
      if (byUrl && byUrl.length > 0) continue;

      const { data: byTitle } = await supabase.from('immigration_news').select('id').eq('title', item.title).limit(1);
      if (byTitle && byTitle.length > 0) continue;

      const category = classifyCategory(item.title, item.summary);
      const isUrgent = classifyUrgency(item.title, item.summary);
      const tags = ['immigration', category, item.source.toLowerCase().replace(/\s+/g, '-')];

      const { data: inserted, error } = await supabase
        .from('immigration_news')
        .insert({
          title: item.title,
          summary: item.summary || item.title,
          content: item.summary || item.title,
          source_url: item.url,
          category,
          tags,
          is_urgent: isUrgent,
          status: 'published',
          published_at: item.publishedAt.toISOString(),
        })
        .select().single();

      if (error) { console.error('Insert error:', error.message); continue; }

      articlesAdded++;
      console.log(`[${category}] ${item.title}`);

      if (isUrgent && inserted) {
        urgentCount++;
        try { await supabase.functions.invoke('urgent-news-alert', { body: { newsId: inserted.id } }); } catch (_) { /* non-fatal */ }
      }
    }

    console.log(`Done: +${articlesAdded} articles (${urgentCount} urgent)`);

    return new Response(JSON.stringify({
      success: true, articlesAdded, urgentCount,
      feedsOk, feedsTotal: RSS_FEEDS.length,
      rawItems: allItems.length, afterFilter: relevant.length,
      message: `RSS fetch: ${articlesAdded} new articles from ${feedsOk}/${RSS_FEEDS.length} feeds`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('fetch-news-rss error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
