
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

// Prioritizing NBC, FOX, NPR, CNN for immigration news coverage
const approvedDomains = [
  "uscis.gov", "dhs.gov", "state.gov", "ice.gov", "cbp.gov", "whitehouse.gov",
  "nbcnews.com", "foxnews.com", "npr.org", "cnn.com",
  "nytimes.com", "cnbc.com",
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

          // Get category-specific search terms to avoid overlap
          const categorySearchTerms = getCategorySearchTerms(category.slug);

          const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const prompt = `Find ONLY the most recent VERIFIED U.S. IMMIGRATION news about ${categorySearchTerms} published within the last 24 hours (on or after ${today}). STRICTLY EXCLUDE any articles older than 24 hours. Focus on CURRENT Trump administration policies and announcements. EXCLUDE outdated Biden administration articles. MUST use DIRECT links from these PRIMARY sources:

PRIMARY SOURCES (HIGHEST PRIORITY):
- CNN.com/politics/immigration or CNN.com (CNN breaking immigration news)
- NBCNews.com (NBC immigration coverage)  
- FoxNews.com/politics/immigration (Fox News immigration)
- NPR.org (NPR immigration reporting)

SECONDARY SOURCES (if primary unavailable):
- Reuters.com, AP News, NYTimes.com, WashingtonPost.com
- USCIS.gov, DHS.gov, State.gov (official announcements)

CRITICAL REQUIREMENTS:
- MUST link directly to CNN, NBC, Fox News, or NPR articles
- NO secondary sources, blogs, or law firm summaries
- Verify each article is specifically about U.S. immigration law/policy
- Include 2-3 distinct immigration stories about ${categorySearchTerms}
- Mark urgent only for immediate policy changes or deadlines

Return this exact format:
Title: [Immigration headline from primary source]
Summary: [2-3 sentence immigration impact summary]  
Content: [Detailed immigration policy/law information]
Source: [Direct URL to CNN/NBC/Fox/NPR article]
Urgent: [true/false for immediate policy changes]
Tags: [immigration, relevant, tags]`;

          const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${perplexityApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'sonar-pro',
              messages: [
                {
                  role: 'system',
                  content: `Expert immigration news researcher. ONLY use direct articles from CNN.com, NBCNews.com, FoxNews.com, or NPR.org for immigration news about ${categorySearchTerms}. Reject any secondary sources, blogs, or law firm websites. Focus exclusively on verified immigration policy, visa changes, and enforcement updates. Include original source URLs.`
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

          // Skip if no valid news items found
          if (newsItems.length === 0) {
            console.log(`No valid news items found for category: ${category.name}`);
            return;
          }

          // Insert valid immigration news items
          for (const item of newsItems) {
            try {
              if (!item.source_url || !isValidSource(item.source_url)) {
                console.log(`Invalid immigration source: ${item.source_url}`);
                continue;
              }

              // Validate source URL before proceeding
              let urlValid = false;
              if (item.source_url) {
                try {
                  const urlResponse = await fetch(item.source_url, { 
                    method: 'HEAD',
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
                  });
                  urlValid = urlResponse.ok;
                  console.log(`URL validation for ${item.source_url}: ${urlValid ? 'VALID' : 'INVALID'}`);
                } catch (error) {
                  console.log(`URL validation error for ${item.source_url}: ${error.message}`);
                  urlValid = false;
                }
              }
              
              // Skip articles with invalid URLs
              if (!urlValid) {
                console.log(`Skipping article with invalid URL: ${item.title}`);
                continue;
              }

              // Enhanced duplicate checking
              const { data: existingByTitle } = await supabaseClient
                .from('immigration_news')
                .select('id, title, source_url')
                .eq('title', item.title)
                .limit(1);

              if (existingByTitle && existingByTitle.length > 0) {
                console.log(`Duplicate found by title: ${item.title}`);
                continue;
              }

              // Check for duplicates by source URL if available
              if (item.source_url) {
                const { data: existingByUrl } = await supabaseClient
                  .from('immigration_news')
                  .select('id, title')
                  .eq('source_url', item.source_url)
                  .limit(1);

                if (existingByUrl && existingByUrl.length > 0) {
                  console.log(`Duplicate found by URL: ${item.title} (existing: ${existingByUrl[0].title})`);
                  continue;
                }
              }

              // Check for similar titles (to catch slight variations)
              const { data: similarTitles } = await supabaseClient
                .from('immigration_news')
                .select('id, title')
                .ilike('title', `%${item.title.split(' ').slice(0, 5).join(' ')}%`)
                .limit(3);

              if (similarTitles && similarTitles.length > 0) {
                const exactMatch = similarTitles.find(existing => 
                  existing.title.toLowerCase().trim() === item.title.toLowerCase().trim()
                );
                if (exactMatch) {
                  console.log(`Similar title found, skipping: ${item.title}`);
                  continue;
                }
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
        message: `Optimized immigration news fetch: Added ${totalArticlesAdded} verified immigration articles using consolidated categories`
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

function getCategorySearchTerms(categorySlug: string): string {
  const searchTermsMap: Record<string, string> = {
    'work-visas-employment': 'H-1B visas, L-1 visas, employment-based visas, work permits, specialty occupation visas',
    'green-card': 'green card applications, permanent residence, green card lottery, employment-based green cards',
    'citizenship': 'citizenship applications, naturalization, citizenship test, oath ceremonies',
    'student-visas': 'F-1 student visas, J-1 exchange programs, student visa policies, international students',
    'family-based-immigration': 'family reunification, spouse visas, family-based green cards, K-1 fiancé visas',
    'investor-entrepreneur-visas': 'EB-5 investor visas, E-1 E-2 visas, entrepreneur programs, investment immigration',
    'asylum-refugee': 'asylum applications, refugee programs, humanitarian protection, asylum seekers',
    'deportation-removal': 'deportation proceedings, removal orders, ICE enforcement, detention centers',
    'daca-dreamer': 'DACA renewals, Dreamers, childhood arrivals, DACA policy changes',
    'border-enforcement': 'border security, border wall, CBP enforcement, border crossings',
    'breaking-news': 'breaking immigration news, urgent immigration updates, immediate policy changes',
    'policy-updates': 'immigration policy changes, new regulations, executive orders, immigration reform'
  };
  
  return searchTermsMap[categorySlug] || categorySlug;
}

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
