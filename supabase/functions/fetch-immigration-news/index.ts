
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const immigrationCategories = [
  { slug: 'international-students', name: 'International Students (F-1, J-1, M-1)' },
  { slug: 'employment-based', name: 'Employment-based immigrants (H-1B, L-1, TN, etc.)' },
  { slug: 'family-based', name: 'Family-based immigrants' },
  { slug: 'green-card', name: 'Green card applicants/holders' },
  { slug: 'citizenship', name: 'Citizenship applicants' },
  { slug: 'refugees-asylees', name: 'Refugees/asylees/DACA/TPS holders' },
];

// Prioritizing NBC, FOX, NPR, CNN plus other trusted sources for immigration news
const approvedDomains = [
  "uscis.gov", "dhs.gov", "state.gov", "ice.gov", "cbp.gov", 
  "nbcnews.com", "foxnews.com", "npr.org", "cnn.com",
  "nytimes.com", "cnbc.com",
  "reuters.com", "apnews.com", "bbc.com", "washingtonpost.com", 
  "abcnews.go.com", "cbsnews.com",
  "politico.com", "axios.com", "bloomberg.com", "wsj.com"
];

function isValidSource(url: string): boolean {
  if (!url) return false;
  
  // Reject video/social content
  if (url.includes('youtube.com') || url.includes('youtu.be') || 
      url.includes('vimeo.com') || url.includes('tiktok.com') ||
      url.includes('instagram.com') || url.includes('facebook.com')) {
    return false;
  }
  
  // Only allow approved domains
  return approvedDomains.some(domain => url.toLowerCase().includes(domain));
}

async function fetchNewsFromPerplexity(categoryName: string) {
  const prompt = `Find recent U.S. IMMIGRATION news specifically about ${categoryName} from the past 48 hours. Focus ONLY on immigration law, policy changes, visa updates, deportation news, asylum cases, and citizenship matters.

REQUIRED SOURCES - Prioritize these major outlets:
- NBCNews.com (NBC News immigration coverage)
- FoxNews.com (Fox News immigration section) 
- NPR.org (NPR immigration reporting)
- CNN.com (CNN immigration news)

ADDITIONAL TRUSTED SOURCES:
- NYTimes.com, CNBC.com, Reuters.com, AP News
- Washington Post, ABC News, CBS News, Politico, Bloomberg
- USCIS.gov, DHS.gov, State.gov, ICE.gov, CBP.gov

Return exactly 4-5 IMMIGRATION-SPECIFIC news articles in this JSON format:
{
  "articles": [
    {
      "title": "Immigration-focused headline here",
      "summary": "Brief 2-3 sentence summary about immigration impact",
      "content": "Detailed content about immigration policy/law changes with context",
      "source_url": "https://full-url-to-immigration-article.com",
      "is_urgent": false,
      "tags": ["immigration", "relevant", "tags"]
    }
  ]
}

Requirements:
- MUST be about U.S. immigration law, visas, green cards, citizenship, deportation, asylum, or border policy
- Include valid URLs from NBC News, Fox News, NPR, CNN, or other specified sources
- Focus on policy changes, court decisions, enforcement updates, application changes
- Mark urgent only for breaking immigration policy news or immediate deadlines
- NO general politics unless directly related to immigration law
- NO YouTube, social media, or video content
- Each article MUST have immigration relevance`;

  console.log(`Making Perplexity API request for immigration news: ${categoryName}`);

  try {
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
            content: 'You are an expert U.S. immigration news researcher. Focus ONLY on immigration law, visa updates, policy changes, court decisions, and enforcement actions. Always return valid JSON with verified source URLs from NBC News, Fox News, NPR, CNN, or other approved immigration news sources. Never include general political news unless directly related to immigration law.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3000,
        return_citations: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error for ${categoryName}: ${response.status} - ${errorText}`);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    console.log(`Perplexity immigration news response for ${categoryName}:`, content);
    return content;
  } catch (error) {
    console.error(`Error fetching immigration news from Perplexity for ${categoryName}:`, error);
    throw error;
  }
}

function parseNewsContent(content: string, categorySlug: string) {
  console.log(`Parsing immigration content for ${categorySlug}:`, content.substring(0, 200));
  
  const articles = [];
  
  try {
    // Try to parse as JSON first
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.articles && Array.isArray(parsed.articles)) {
        console.log(`Found ${parsed.articles.length} immigration articles in JSON format`);
        
        for (const article of parsed.articles) {
          if (article.title && article.source_url && isValidSource(article.source_url)) {
            articles.push({
              title: article.title,
              content: article.content || article.summary || '',
              summary: article.summary || article.title,
              source_url: article.source_url,
              category: categorySlug,
              tags: Array.isArray(article.tags) ? [...article.tags, categorySlug, 'immigration'] : [categorySlug, 'immigration'],
              is_urgent: article.is_urgent || false,
              status: 'published'
            });
            console.log(`Valid immigration article: ${article.title}`);
          } else {
            console.log(`Skipping invalid immigration article - missing required fields or invalid source`);
          }
        }
      }
    }
  } catch (error) {
    console.log('JSON parsing failed, trying text parsing:', error);
  }
  
  // Fallback: text parsing if JSON failed
  if (articles.length === 0) {
    console.log('Attempting text-based parsing for immigration content...');
    
    const lines = content.split('\n').filter(line => line.trim());
    let currentArticle: any = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for URLs
      const urlMatch = trimmed.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch && isValidSource(urlMatch[1])) {
        if (currentArticle.title) {
          currentArticle.source_url = urlMatch[1];
          
          // Complete the article
          if (currentArticle.title && currentArticle.source_url) {
            articles.push({
              title: currentArticle.title,
              content: currentArticle.content || currentArticle.summary || currentArticle.title,
              summary: currentArticle.summary || currentArticle.title,
              source_url: currentArticle.source_url,
              category: categorySlug,
              tags: [categorySlug, 'immigration'],
              is_urgent: false,
              status: 'published'
            });
            console.log(`Text-parsed immigration article: ${currentArticle.title}`);
          }
        }
        currentArticle = {};
      }
      
      // Look for titles (usually first substantial text or marked with indicators)
      if (trimmed.length > 20 && trimmed.length < 200 && 
          !trimmed.includes('http') && 
          !trimmed.toLowerCase().includes('summary:') &&
          !trimmed.toLowerCase().includes('content:')) {
        currentArticle.title = trimmed.replace(/[*#\-]/g, '').trim();
      }
    }
  }
  
  console.log(`Total immigration articles parsed for ${categorySlug}: ${articles.length}`);
  return articles;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting fetch-immigration-news function');
    
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not found in environment variables');
    }

    const { category, forceRefresh } = await req.json();
    
    // Check for recent news unless forcing refresh
    if (!forceRefresh) {
      const { data: recentNews } = await supabase
        .from('immigration_news')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()) // 4 hours
        .limit(1);

      if (recentNews && recentNews.length > 0) {
        console.log('Recent immigration news exists, skipping fetch');
        return new Response(
          JSON.stringify({ 
            success: true, 
            articlesAdded: 0,
            message: 'Recent immigration news already exists. Use refresh to force update.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Process all categories for comprehensive coverage
    let categoriesToFetch = immigrationCategories;
    if (category && category !== 'all') {
      categoriesToFetch = immigrationCategories.filter(cat => cat.slug === category);
    }

    console.log(`Fetching immigration news for ${categoriesToFetch.length} categories`);

    const allArticles = [];

    for (const cat of categoriesToFetch) {
      try {
        console.log(`Processing immigration category: ${cat.name}`);
        const newsContent = await fetchNewsFromPerplexity(cat.name);
        const parsedArticles = parseNewsContent(newsContent, cat.slug);
        
        console.log(`Found ${parsedArticles.length} immigration articles for ${cat.name}`);
        
        for (const article of parsedArticles) {
          // Check for duplicates
          const { data: existing } = await supabase
            .from('immigration_news')
            .select('id')
            .eq('title', article.title)
            .limit(1);

          if (existing && existing.length > 0) {
            console.log(`Duplicate found: ${article.title}`);
            continue;
          }

          // Insert into database
          const { data, error } = await supabase
            .from('immigration_news')
            .insert({
              ...article,
              published_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) {
            console.error(`Error inserting immigration article:`, error);
          } else {
            allArticles.push(data);
            console.log(`Successfully inserted immigration article: ${article.title}`);
          }
        }

        // Delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`Error processing immigration category ${cat.slug}:`, error);
        // Continue with other categories
      }
    }

    console.log(`Immigration news function completed. Total articles added: ${allArticles.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        articlesAdded: allArticles.length,
        articles: allArticles,
        message: `Successfully fetched ${allArticles.length} verified immigration articles from NBC News, Fox News, NPR and other trusted sources`
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-immigration-news function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
