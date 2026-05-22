import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BASE_URL = "https://immigronews.com";

type Changefreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: Changefreq;
  priority?: number;
}

const staticPages: Array<{ loc: string; priority: number; changefreq: Changefreq }> = [
  { loc: "/", priority: 1.0, changefreq: "daily" },
  { loc: "/news", priority: 0.9, changefreq: "hourly" },
  { loc: "/blog", priority: 0.85, changefreq: "daily" },
  { loc: "/resources", priority: 0.8, changefreq: "weekly" },
  { loc: "/faq", priority: 0.7, changefreq: "monthly" },
  { loc: "/about", priority: 0.7, changefreq: "monthly" },
  { loc: "/contact", priority: 0.7, changefreq: "monthly" },
  { loc: "/signup", priority: 0.6, changefreq: "monthly" },
  { loc: "/disclaimer", priority: 0.4, changefreq: "yearly" },
  { loc: "/privacy", priority: 0.4, changefreq: "yearly" },
  { loc: "/terms", priority: 0.4, changefreq: "yearly" },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function dayDiff(from: string): number {
  return Math.floor((Date.now() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));
}

function recencyPriority(days: number, base: number): number {
  if (days <= 1) return Math.max(base, 0.9);
  if (days <= 7) return Math.max(base, 0.8);
  if (days <= 30) return Math.max(base - 0.05, 0.7);
  return Math.max(base - 0.1, 0.6);
}

function recencyChangefreq(days: number): Changefreq {
  if (days <= 7) return "daily";
  if (days <= 30) return "weekly";
  return "monthly";
}

function buildXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((url) => {
      const parts = [`    <loc>${escapeXml(url.loc)}</loc>`];
      if (url.lastmod) parts.push(`    <lastmod>${url.lastmod}</lastmod>`);
      if (url.changefreq) parts.push(`    <changefreq>${url.changefreq}</changefreq>`);
      if (typeof url.priority === "number")
        parts.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${body}
</urlset>`;
}

serve(async (_req) => {
  try {
    const urls: SitemapUrl[] = [];
    const today = new Date().toISOString().split("T")[0];

    for (const page of staticPages) {
      urls.push({
        loc: `${BASE_URL}${page.loc}`,
        lastmod: today,
        changefreq: page.changefreq,
        priority: page.priority,
      });
    }

    // Blog articles (published only, limit 500)
    const { data: blogArticles, error: blogErr } = await supabase
      .from("blog_articles")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(500);

    if (blogErr) {
      console.error("blog_articles fetch error:", blogErr);
    } else if (blogArticles) {
      for (const article of blogArticles) {
        if (!article.slug) continue;
        const lastmodSource = article.updated_at || article.published_at;
        const days = lastmodSource ? dayDiff(lastmodSource) : 365;
        urls.push({
          loc: `${BASE_URL}/blog/${article.slug}`,
          lastmod: lastmodSource
            ? new Date(lastmodSource).toISOString().split("T")[0]
            : today,
          changefreq: recencyChangefreq(days),
          priority: recencyPriority(days, 0.75),
        });
      }
    }

    // News articles (published only, limit 1000)
    const { data: newsArticles, error: newsErr } = await supabase
      .from("immigration_news")
      .select("id, updated_at, published_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (newsErr) {
      console.error("immigration_news fetch error:", newsErr);
    } else if (newsArticles) {
      for (const article of newsArticles) {
        if (!article.id) continue;
        const lastmodSource = article.updated_at || article.published_at;
        const days = lastmodSource ? dayDiff(lastmodSource) : 365;
        urls.push({
          loc: `${BASE_URL}/news/${article.id}`,
          lastmod: lastmodSource
            ? new Date(lastmodSource).toISOString().split("T")[0]
            : today,
          changefreq: recencyChangefreq(days),
          priority: recencyPriority(days, 0.8),
        });
      }
    }

    const xml = buildXml(urls);

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control":
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("sitemap-xml error:", error);
    const fallback = buildXml(
      staticPages.map((p) => ({
        loc: `${BASE_URL}${p.loc}`,
        changefreq: p.changefreq,
        priority: p.priority,
      })),
    );
    return new Response(fallback, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
});
