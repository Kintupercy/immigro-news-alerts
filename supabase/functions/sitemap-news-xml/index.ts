import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BASE_URL = "https://immigronews.com";
const PUBLICATION_NAME = "ImmigroNews";
const PUBLICATION_LANG = "en";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emptySitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;
}

serve(async (_req) => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: recentArticles, error } = await supabase
      .from("immigration_news")
      .select("id, title, category, published_at, updated_at, created_at")
      .eq("status", "published")
      .gte("published_at", twoDaysAgo.toISOString())
      .order("published_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("immigration_news recency fetch error:", error);
      return new Response(emptySitemap(), {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=60",
        },
      });
    }

    if (!recentArticles || recentArticles.length === 0) {
      return new Response(emptySitemap(), {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control":
            "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    const items = recentArticles
      .map((article) => {
        if (!article.id || !article.title) return null;
        const pubDate = article.published_at || article.created_at;
        if (!pubDate) return null;
        const isoDate = new Date(pubDate).toISOString();
        const keywords = ["immigration", "visa", article.category || "news"]
          .filter(Boolean)
          .join(", ");
        return `  <url>
    <loc>${escapeXml(`${BASE_URL}/news/${article.id}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${PUBLICATION_NAME}</news:name>
        <news:language>${PUBLICATION_LANG}</news:language>
      </news:publication>
      <news:publication_date>${isoDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
      <news:keywords>${escapeXml(keywords)}</news:keywords>
    </news:news>
  </url>`;
      })
      .filter((s): s is string => s !== null)
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control":
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("sitemap-news-xml error:", error);
    return new Response(emptySitemap(), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
});
