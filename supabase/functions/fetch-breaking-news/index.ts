
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsSource {
  name: string;
  rssUrl: string;
  category: string;
}

const NEWS_SOURCES: NewsSource[] = [
  {
    name: "CNN",
    rssUrl: "http://rss.cnn.com/rss/edition.rss",
    category: "breaking-news"
  },
  {
    name: "FOX News",
    rssUrl: "http://feeds.foxnews.com/foxnews/latest",
    category: "breaking-news"
  },
  {
    name: "NPR",
    rssUrl: "https://feeds.npr.org/1001/rss.xml",
    category: "breaking-news"
  },
  {
    name: "Reuters",
    rssUrl: "https://feeds.reuters.com/Reuters/domesticNews",
    category: "breaking-news"
  },
  {
    name: "Associated Press",
    rssUrl: "https://feeds.apnews.com/rss/apf-topnews",
    category: "breaking-news"
  }
];

const IMMIGRATION_KEYWORDS = [
  'immigration', 'visa', 'green card', 'deportation', 'asylum', 'refugee',
  'border', 'citizenship', 'naturalization', 'ICE', 'CBP', 'USCIS',
  'H1B', 'F1', 'student visa', 'work permit', 'DACA', 'TPS',
  'family reunification', 'chain migration', 'merit-based'
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting breaking news fetch from major outlets...");

    let totalArticlesAdded = 0;
    let urgentNewsFound = 0;

    for (const source of NEWS_SOURCES) {
      try {
        console.log(`Fetching from ${source.name}...`);
        
        const response = await fetch(source.rssUrl, {
          headers: {
            'User-Agent': 'Immigro News Fetcher/1.0'
          }
        });

        if (!response.ok) {
          console.log(`Failed to fetch from ${source.name}: ${response.status}`);
          continue;
        }

        const rssText = await response.text();
        const articles = parseRSSFeed(rssText, source);
        
        console.log(`Found ${articles.length} articles from ${source.name}`);

        for (const article of articles) {
          // Check if article is immigration-related
          const isImmigrationRelated = IMMIGRATION_KEYWORDS.some(keyword =>
            article.title.toLowerCase().includes(keyword.toLowerCase()) ||
            article.content.toLowerCase().includes(keyword.toLowerCase())
          );

          if (!isImmigrationRelated) {
            continue;
          }

          // Check if article already exists
          const { data: existingArticle } = await supabase
            .from('immigration_news')
            .select('id')
            .eq('title', article.title)
            .eq('source_url', article.source_url)
            .single();

          if (existingArticle) {
            continue;
          }

          // Determine if this is urgent breaking news
          const isUrgent = article.title.toLowerCase().includes('breaking') ||
                          article.title.toLowerCase().includes('urgent') ||
                          article.content.toLowerCase().includes('breaking news');

          // Insert the article
          const { data: insertedArticle, error } = await supabase
            .from('immigration_news')
            .insert({
              title: article.title,
              content: article.content,
              summary: article.summary,
              category: 'breaking-news',
              source_url: article.source_url,
              published_at: article.published_at,
              is_urgent: isUrgent,
              tags: ['breaking-news', source.name.toLowerCase(), ...article.tags],
              status: 'published'
            })
            .select()
            .single();

          if (error) {
            console.error(`Error inserting article from ${source.name}:`, error);
            continue;
          }

          totalArticlesAdded++;
          console.log(`Added: ${article.title}`);

          // If urgent, trigger urgent alert system
          if (isUrgent && insertedArticle) {
            urgentNewsFound++;
            try {
              await supabase.functions.invoke('urgent-news-alert', {
                body: { newsId: insertedArticle.id }
              });
              console.log(`Triggered urgent alert for: ${article.title}`);
            } catch (alertError) {
              console.error('Error triggering urgent alert:', alertError);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing ${source.name}:`, error);
      }
    }

    console.log(`Breaking news fetch completed: ${totalArticlesAdded} articles added, ${urgentNewsFound} urgent alerts sent`);

    return new Response(JSON.stringify({
      success: true,
      articlesAdded: totalArticlesAdded,
      urgentNewsFound: urgentNewsFound,
      message: `Successfully processed breaking news from major outlets. Added ${totalArticlesAdded} immigration-related articles.`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in fetch-breaking-news function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function parseRSSFeed(rssText: string, source: NewsSource) {
  const articles: any[] = [];
  
  try {
    // Simple RSS parsing - extract items between <item> tags
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const items = rssText.match(itemRegex) || [];

    for (const item of items.slice(0, 10)) { // Limit to 10 most recent
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
      const descriptionMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i);
      const linkMatch = item.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>|<link>(.*?)<\/link>/i);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/i);

      const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
      const description = (descriptionMatch?.[1] || descriptionMatch?.[2] || '').trim();
      const link = (linkMatch?.[1] || linkMatch?.[2] || '').trim();
      const pubDate = pubDateMatch?.[1]?.trim();

      if (title && description && link) {
        // Clean up HTML tags from description
        const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
        
        articles.push({
          title: title,
          content: cleanDescription,
          summary: cleanDescription.length > 200 ? cleanDescription.substring(0, 200) + '...' : cleanDescription,
          source_url: link,
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          tags: [source.name.toLowerCase(), 'breaking-news']
        });
      }
    }
  } catch (error) {
    console.error(`Error parsing RSS from ${source.name}:`, error);
  }

  return articles;
}

serve(handler);
