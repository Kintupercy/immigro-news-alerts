
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface NewsItem {
  title: string;
  content: string;
  summary: string;
  source_url?: string;
  is_urgent: boolean;
  tags: string[];
}

// Rate limiting in-memory store (for serverless functions)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Prioritizing NBC, FOX, NPR for immigration news coverage
const approvedDomains = [
  "uscis.gov", "dhs.gov", "state.gov", "ice.gov", "cbp.gov", 
  "nbcnews.com", "foxnews.com", "npr.org",
  "cnn.com", "nytimes.com", "cnbc.com",
  "reuters.com", "apnews.com", "bbc.com", "washingtonpost.com", 
  "abcnews.go.com", "cbsnews.com",
  "politico.com", "axios.com", "bloomberg.com", "wsj.com",
  "immigration.com", "nolo.com", "ilrc.org"
];

function isValidSource(url: string): boolean {
  if (!url) return false;
  
  // Reject video and social media content
  if (url.includes('youtube.com') || url.includes('youtu.be') || 
      url.includes('vimeo.com') || url.includes('tiktok.com') ||
      url.includes('instagram.com') || url.includes('facebook.com')) {
    return false;
  }
  
  return approvedDomains.some(domain => url.toLowerCase().includes(domain));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(clientIP, 10, 60000)) { // 10 requests per minute
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      );
    }

    console.log('Starting optimized immigration news fetch function');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not found');
    }

    // Get categories with caching check
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('immigration_categories')
      .select('*')
      .order('name');

    if (categoriesError) throw categoriesError;

    let totalArticlesAdded = 0;
    const batchSize = 2; // Process categories in smaller batches
    
    // Process categories in batches to avoid overwhelming the API
    for (let i = 0; i < categories.length; i += batchSize) {
      const batch = categories.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (category: Category) => {
        try {
          console.log(`Processing immigration category: ${category.name}`);

          // Check if we have recent articles for this category (within 2 hours)
          const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
          const { data: recentArticles } = await supabaseClient
            .from('immigration_news')
            .select('id')
            .eq('category', category.slug)
            .gte('created_at', twoHoursAgo)
            .limit(1);

          if (recentArticles && recentArticles.length > 0) {
            console.log(`Recent immigration articles found for ${category.name}, skipping...`);
            return;
          }

          const prompt = `Find the latest verified U.S. IMMIGRATION news specifically for ${category.name} from the past 12-24 hours. Focus ONLY on immigration law changes, visa updates, policy decisions, deportation news, asylum cases, and citizenship matters.

PRIORITIZE THESE MAJOR SOURCES:
- NBCNews.com (NBC News immigration section)
- FoxNews.com (Fox News immigration coverage)  
- NPR.org (NPR immigration reporting)

ADDITIONAL SOURCES:
Government: USCIS.gov, DHS.gov, State.gov, ICE.gov, CBP.gov
News: CNN, NYTimes, CNBC, Reuters, AP, BBC, Washington Post
Legal: Immigration.com, Nolo.com, ILRC.org

Requirements:
- Provide 2-3 distinct IMMIGRATION-SPECIFIC recent news items
- Include factual, verified information about immigration law/policy only
- Format: Title, Summary (2-3 sentences), Content (3-4 paragraphs), Source URL
- Mark urgent only for immediate immigration policy changes
- Include relevant immigration tags
- NO general politics unless directly about immigration law
- NO video, social media, or unverified sources

Format:
Title: [immigration-focused headline]
Summary: [brief immigration impact summary]
Content: [detailed immigration content]
Source: [verified NBC/FOX/NPR or other approved URL]
Urgent: [true/false]
Tags: [immigration, comma-separated tags]`;

          const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${perplexityApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.1-sonar-large-128k-online',
              messages: [
                {
                  role: 'system',
                  content: 'Expert U.S. immigration news researcher. Provide verified immigration-specific info from NBC News, Fox News, NPR, and other approved sources only. Focus exclusively on immigration law, visas, green cards, citizenship, deportation, asylum, border policy. Never include general political news unless directly related to immigration law changes.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: 3000,
              temperature: 0.1,
              top_p: 0.9,
              return_citations: true
            }),
          });

          if (!response.ok) {
            console.error(`API error for immigration category ${category.name}: ${response.status}`);
            return;
          }

          const data = await response.json();
          const content = data.choices[0]?.message?.content;

          if (!content) {
            console.error(`No immigration content for ${category.name}`);
            return;
          }

          const newsItems = parseNewsContent(content, category.slug);

          // Insert valid immigration news items
          for (const item of newsItems) {
            try {
              if (!item.source_url || !isValidSource(item.source_url)) {
                console.log(`Invalid immigration source: ${item.source_url}`);
                continue;
              }

              // Check for duplicates
              const { data: existing } = await supabaseClient
                .from('immigration_news')
                .select('id')
                .eq('title', item.title)
                .limit(1);

              if (existing && existing.length > 0) {
                console.log(`Duplicate immigration article: ${item.title}`);
                continue;
              }

              const { error: insertError } = await supabaseClient
                .from('immigration_news')
                .insert({
                  title: item.title,
                  content: item.content,
                  summary: item.summary,
                  category: category.slug,
                  source_url: item.source_url,
                  is_urgent: item.is_urgent || false,
                  tags: [...(item.tags || []), 'immigration'],
                  status: 'published',
                  published_at: new Date().toISOString()
                });

              if (!insertError) {
                totalArticlesAdded++;
                console.log(`Added immigration article: ${item.title}`);
              }
            } catch (error) {
              console.error(`Error inserting immigration article:`, error);
            }
          }

        } catch (error) {
          console.error(`Error processing immigration category ${category.name}:`, error);
        }
      }));

      // Rate limiting delay between batches
      if (i + batchSize < categories.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        articlesAdded: totalArticlesAdded,
        categoriesProcessed: categories.length,
        message: `Optimized immigration news fetch: Added ${totalArticlesAdded} verified immigration articles from NBC, Fox News, NPR and other trusted sources`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in optimized immigration news fetch:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function parseNewsContent(content: string, categorySlug: string): NewsItem[] {
  const articles: NewsItem[] = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentArticle: Partial<NewsItem> = {};
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.match(/^[-=*]+$/)) continue;
    
    if (trimmedLine.toLowerCase().startsWith('title:') || 
        (trimmedLine.includes('**') && trimmedLine.length < 200)) {
      
      // Save previous article
      if (currentArticle.title && currentArticle.source_url && isValidSource(currentArticle.source_url)) {
        articles.push({
          title: currentArticle.title,
          content: currentArticle.content || currentArticle.summary || '',
          summary: currentArticle.summary || '',
          source_url: currentArticle.source_url,
          is_urgent: currentArticle.is_urgent || false,
          tags: [...(currentArticle.tags || []), categorySlug, 'immigration']
        });
      }
      
      // Start new article
      currentArticle = {
        title: trimmedLine.replace(/^title:\s*/i, '').replace(/[*#]/g, '').trim(),
        tags: [categorySlug, 'immigration']
      };
    } 
    else if (currentArticle.title) {
      if (trimmedLine.toLowerCase().startsWith('summary:')) {
        currentArticle.summary = trimmedLine.replace(/^summary:\s*/i, '').trim();
      }
      else if (trimmedLine.toLowerCase().startsWith('content:')) {
        currentArticle.content = trimmedLine.replace(/^content:\s*/i, '').trim();
      }
      else if (trimmedLine.toLowerCase().startsWith('source:') || trimmedLine.startsWith('http')) {
        const urlMatch = trimmedLine.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch && isValidSource(urlMatch[1])) {
          currentArticle.source_url = urlMatch[1];
        }
      }
      else if (trimmedLine.toLowerCase().startsWith('urgent:')) {
        currentArticle.is_urgent = trimmedLine.toLowerCase().includes('true');
      }
      else if (trimmedLine.toLowerCase().startsWith('tags:')) {
        const tagsText = trimmedLine.replace(/^tags:\s*/i, '').trim();
        currentArticle.tags = [...tagsText.split(',').map(tag => tag.trim()).filter(tag => tag), categorySlug, 'immigration'];
      }
      else if (trimmedLine.length > 30 && !trimmedLine.includes(':')) {
        if (!currentArticle.content) {
          currentArticle.content = trimmedLine;
        } else {
          currentArticle.content += ' ' + trimmedLine;
        }
        if (!currentArticle.summary) {
          currentArticle.summary = trimmedLine;
        }
      }
    }
  }
  
  // Save last article
  if (currentArticle.title && currentArticle.source_url && isValidSource(currentArticle.source_url)) {
    articles.push({
      title: currentArticle.title,
      content: currentArticle.content || currentArticle.summary || '',
      summary: currentArticle.summary || '',
      source_url: currentArticle.source_url,
      is_urgent: currentArticle.is_urgent || false,
      tags: [...(currentArticle.tags || []), categorySlug, 'immigration']
    });
  }
  
  return articles;
}
