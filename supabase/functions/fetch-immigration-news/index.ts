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
  { slug: 'green-card', name: 'Green Card / Permanent Residency' },
  { slug: 'citizenship', name: 'Citizenship & Naturalization' },
  { slug: 'international-students', name: 'International Students (F-1, J-1, M-1)' },
  { slug: 'family-based', name: 'Family-Based Immigration' },
  { slug: 'employment-based', name: 'Work Visas & Employment-Based (H-1B, L-1, TN, O-1)' },
  { slug: 'refugees-asylees', name: 'Humanitarian & Refugee/Asylee (DACA, TPS)' },
  { slug: 'temporary-visitors', name: 'Temporary Visitors & Tourists (B-1, B-2)' },
  { slug: 'exchange-visitors', name: 'Exchange Visitors & Cultural Programs' },
  { slug: 'investors', name: 'Investor & Entrepreneur Visas (EB-5, E-1, E-2)' },
  { slug: 'religious-workers', name: 'Religious Worker Visas (R-1)' },
  { slug: 'specialty-occupations', name: 'Specialty Occupations & NAFTA/USMCA' },
  { slug: 'undocumented', name: 'Undocumented & Mixed-Status Families' },
];

// Prioritizing NBC, FOX, NPR, CNN plus other trusted sources for immigration news
const approvedDomains = [
  "uscis.gov", "dhs.gov", "state.gov", "ice.gov", "cbp.gov", "whitehouse.gov",
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
        model: 'sonar-pro',
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
            // Check if this is an opinion piece and override urgency
            const isOpinion = isOpinionPiece(article.title, article.content || article.summary || '', article.source_url);
            
            // Determine news classification using improved logic
            const newsClassification = classifyNewsUrgency(article.title, article.content || article.summary || '', article.source_url);
            
            // Override AI urgency with our improved classification
            const isUrgent = newsClassification.isUrgent && !isOpinion;
            const isBreaking = newsClassification.isBreaking && !isOpinion && !isUrgent; // Breaking only if not urgent
            
            // Set appropriate tags based on classification
            let tags = Array.isArray(article.tags) ? [...article.tags, categorySlug, 'immigration'] : [categorySlug, 'immigration'];
            if (isBreaking) tags.push('breaking-news');
            
            articles.push({
              title: article.title,
              content: article.content || article.summary || '',
              summary: article.summary || article.title,
              source_url: article.source_url,
              category: categorySlug,
              tags: tags,
              is_urgent: isUrgent,
              status: 'published'
            });
            
            if (isOpinion) {
              console.log(`Opinion piece detected, marking as regular: ${article.title}`);
            } else if (isUrgent) {
              console.log(`URGENT immigration article: ${article.title}`);
            } else if (isBreaking) {
              console.log(`BREAKING immigration article: ${article.title}`);
            } else {
              console.log(`Regular immigration article: ${article.title}`);
            }
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

function classifyNewsUrgency(title: string, content: string, sourceUrl: string): { isUrgent: boolean; isBreaking: boolean } {
  const text = `${title} ${content}`.toLowerCase();
  
  // URGENT: Immediate impact, immediate implementation, can't miss news
  const urgentIndicators = [
    // Immediate bans and restrictions
    'travel ban', 'entry ban', 'suspended entry', 'immediate suspension', 'effective immediately',
    'executive order', 'presidential proclamation', 'emergency order',
    // Immediate policy changes
    'takes effect immediately', 'effective today', 'starting today', 'begins immediately',
    // Court injunctions and immediate legal changes
    'court blocks', 'injunction issued', 'temporary restraining order', 'immediate halt',
    // Emergency deportation actions
    'mass deportation', 'immediate deportation', 'emergency enforcement',
    // Program terminations with immediate effect
    'program terminated', 'immediately suspended', 'ends immediately'
  ];
  
  // BREAKING: Important news that just happened but may have delayed implementation
  const breakingIndicators = [
    'breaking:', 'just announced', 'announces', 'unveils', 'reveals',
    'court ruling', 'supreme court', 'federal judge', 'appeals court',
    'ice raids', 'enforcement action', 'arrest', 'detention',
    'new policy', 'policy change', 'rule change', 'regulation update',
    'bill passed', 'legislation', 'congress', 'senate votes',
    'dhs announces', 'uscis updates', 'state department'
  ];
  
  const hasUrgentIndicator = urgentIndicators.some(indicator => text.includes(indicator));
  const hasBreakingIndicator = breakingIndicators.some(indicator => text.includes(indicator));
  
  // Check if it's time-sensitive (happening now vs announced for future)
  const immediateTiming = text.includes('today') || text.includes('immediately') || 
                         text.includes('now') || text.includes('effective') ||
                         text.includes('starts') || text.includes('begins');
  
  // Urgent takes precedence - must have urgent indicators AND immediate timing
  const isUrgent = hasUrgentIndicator && immediateTiming;
  
  // Breaking is important news that just happened, but not necessarily immediate impact
  const isBreaking = !isUrgent && hasBreakingIndicator;
  
  return { isUrgent, isBreaking };
}

function isOpinionPiece(title: string, content: string, sourceUrl: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  const url = sourceUrl.toLowerCase();
  
  // Check URL for opinion indicators
  const opinionUrlPatterns = [
    'opinion', 'editorial', 'commentary', 'op-ed', 'analysis', 'perspective',
    'blog', 'columnist', 'pundit', '/opinion/', '/editorial/', '/commentary/'
  ];
  
  const hasOpinionUrl = opinionUrlPatterns.some(pattern => url.includes(pattern));
  
  // Check content for opinion indicators
  const opinionPhrases = [
    'i think', 'i believe', 'in my opinion', 'i feel', 'my view',
    'personally', 'it seems to me', 'i would argue', 'i suspect',
    'afraid to travel', 'likens it to', 'described feeling', 'recounted',
    'fears', 'anxiety about', 'concerns about', 'worries about'
  ];
  
  const hasOpinionLanguage = opinionPhrases.some(phrase => text.includes(phrase));
  
  // Check for first-person narrative or subjective experiences
  const subjectiveIndicators = [
    'described heightened anxiety', 'she recounted', 'feeling anxious',
    'personal experience', 'shared her concerns', 'expressed worry'
  ];
  
  const hasSubjectiveContent = subjectiveIndicators.some(indicator => text.includes(indicator));
  
  return hasOpinionUrl || hasOpinionLanguage || hasSubjectiveContent;
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
        
        // Skip if no valid articles found for this category
        if (parsedArticles.length === 0) {
          console.log(`No valid immigration articles found for category: ${cat.name}`);
          continue;
        }
        
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
        message: `Successfully fetched ${allArticles.length} verified immigration articles from NBC News, Fox News, NPR, CNN and other trusted sources`
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
