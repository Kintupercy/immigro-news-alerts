
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const IMMIGRATION_KEYWORDS = [
  'immigration', 'visa', 'green card', 'deportation', 'asylum', 'refugee',
  'border', 'citizenship', 'naturalization', 'ICE', 'CBP', 'USCIS',
  'H1B', 'H-1B', 'F1', 'F-1', 'student visa', 'work permit', 'DACA', 'TPS',
  'family reunification', 'chain migration', 'merit-based', 'undocumented',
  'immigration policy', 'immigration law', 'immigration court', 'immigration judge',
  'removal proceedings', 'adjustment of status', 'consular processing',
  'priority date', 'visa bulletin', 'employment authorization', 'travel document',
  'travel ban', 'muslim ban', 'country ban', 'proclamation', 'executive order',
  'entry restriction', 'entry prohibition', 'suspended entry', 'banned countries',
  'presidential directive', 'homeland security', 'national security', 'foreign nationals',
  'immigration enforcement', 'border security', 'visa suspension', 'immigration restriction'
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting immigration-specific breaking news fetch...");

    // Use Perplexity API to fetch immigration-specific breaking news  
    const prompt = `Find BREAKING U.S. IMMIGRATION NEWS from the past 48 hours. PRIORITIZE URGENT policy announcements and presidential actions. Search for terms like "BREAKING:", "URGENT:", "Trump announces", "Biden announces", "White House announces".

PRIMARY SOURCES (REQUIRED - search these FIRST):
- CNN.com (CNN Politics Immigration, CNN Breaking News)
- NBCNews.com (NBC News Immigration, NBC Breaking News) 
- FoxNews.com (Fox News Politics Immigration, Fox Breaking News)
- NPR.org (NPR Immigration coverage, NPR News)

SECONDARY SOURCES (only if primary unavailable):
- Reuters.com, AP News, NYTimes.com, WashingtonPost.com
- USCIS.gov, DHS.gov, State.gov, WhiteHouse.gov (official announcements)

URGENT IMMIGRATION TOPICS (PRIORITIZE):
- BREAKING: Travel bans, country restrictions, entry prohibitions
- URGENT: Immigration executive orders, proclamations, presidential directives  
- NEW: Visa policy changes, processing suspensions, program terminations
- IMMEDIATE: Deportation raids, ICE enforcement actions, removal proceedings
- COURT: Immigration court decisions, asylum policy updates
- ENFORCEMENT: Border security, USCIS/CBP announcements, detention policies
- PROGRAMS: Green card processing changes, DACA/TPS updates
- REFORM: Immigration reform, policy reversals, legislative changes

SEARCH INSTRUCTIONS:
- Look for headlines with "BREAKING", "URGENT", "Trump announces", "Biden announces" 
- Search for SAME-DAY presidential announcements and White House statements
- Include articles published within last 48 hours with immigration policy impact
- Focus on immediate implementation or announcement of new policies

STRICT REQUIREMENTS:
- MUST link directly to CNN.com, NBCNews.com, FoxNews.com, or NPR.org articles
- NO law firm blogs, opinion pieces, or secondary analysis
- Each article MUST be BREAKING immigration-specific news
- Mark urgent=true for travel bans, executive orders, immediate policy changes
- Include original source URL for verification
- HIGHEST PRIORITY: Presidential proclamations, travel restrictions, country bans, executive orders

JSON format required:
{
  "articles": [
    {
      "title": "Immigration breaking news from CNN/NBC/Fox/NPR",
      "summary": "Immigration impact summary in 2-3 sentences",
      "content": "Detailed immigration policy/enforcement content", 
      "source_url": "https://cnn.com/or-nbcnews.com/or-foxnews.com/or-npr.org/article",
      "is_urgent": false,
      "tags": ["immigration", "breaking-news", "specific-tag"]
    }
  ]
}`;

    console.log("Making Perplexity API request for immigration breaking news...");

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
            content: 'You are an expert U.S. immigration news researcher. ONLY return immigration-related breaking news. Reject any general news, crime stories, or non-immigration content. Focus exclusively on visa updates, deportation, asylum, border policy, USCIS changes, and immigration enforcement. Always return valid JSON with verified URLs from trusted news sources.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
        return_citations: true,
        search_recency_filter: 'week'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error: ${response.status} - ${errorText}`);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    console.log("Perplexity immigration breaking news response:", content);

    let totalArticlesAdded = 0;
    let urgentNewsFound = 0;

    // Parse the response
    const articles = parseImmigrationBreakingNews(content);
    console.log(`Found ${articles.length} immigration breaking news articles`);

    // Skip if no valid breaking news articles found
    if (articles.length === 0) {
      console.log('No valid immigration breaking news articles found');
      return new Response(JSON.stringify({
        success: true,
        articlesAdded: 0,
        urgentNewsFound: 0,
        message: 'No new immigration breaking news found from major outlets'
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    for (const article of articles) {
      // Double-check immigration relevance
      if (!isImmigrationRelated(article.title, article.content)) {
        console.log(`Skipping non-immigration article: ${article.title}`);
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
        console.log(`Duplicate found: ${article.title}`);
        continue;
      }

      // Insert the article
      const { data: insertedArticle, error } = await supabase
        .from('immigration_news')
        .insert({
          title: article.title,
          content: article.content,
          summary: article.summary,
          category: 'breaking-news',
          source_url: article.source_url,
          published_at: new Date().toISOString(),
          is_urgent: article.is_urgent,
          tags: ['breaking-news', 'immigration', ...article.tags],
          status: 'published'
        })
        .select()
        .single();

      if (error) {
        console.error(`Error inserting immigration breaking news:`, error);
        continue;
      }

      totalArticlesAdded++;
      console.log(`Added immigration breaking news: ${article.title}`);

      // If urgent, trigger urgent alert system
      if (article.is_urgent && insertedArticle) {
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

    console.log(`Immigration breaking news fetch completed: ${totalArticlesAdded} articles added, ${urgentNewsFound} urgent alerts sent`);

    return new Response(JSON.stringify({
      success: true,
      articlesAdded: totalArticlesAdded,
      urgentNewsFound: urgentNewsFound,
      message: `Successfully processed immigration-specific breaking news. Added ${totalArticlesAdded} immigration-related articles.`
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

function parseImmigrationBreakingNews(content: string) {
  const articles: any[] = [];
  
  try {
    // Try to parse as JSON first
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.articles && Array.isArray(parsed.articles)) {
        console.log(`Found ${parsed.articles.length} articles in JSON format`);
        
        for (const article of parsed.articles) {
          if (article.title && article.source_url && isValidSource(article.source_url)) {
            // Check if this is an opinion piece and override urgency
            const isOpinion = isOpinionPiece(article.title, article.content || article.summary || '', article.source_url);
            const shouldBeUrgent = (article.is_urgent || false) && !isOpinion;
            
            articles.push({
              title: article.title,
              content: article.content || article.summary || '',
              summary: article.summary || article.title,
              source_url: article.source_url,
              tags: Array.isArray(article.tags) ? article.tags : ['immigration', 'breaking-news'],
              is_urgent: shouldBeUrgent
            });
            
            if (isOpinion) {
              console.log(`Opinion piece detected, marking as non-urgent: ${article.title}`);
            } else {
              console.log(`Valid immigration breaking news: ${article.title}`);
            }
          } else {
            console.log(`Skipping invalid article - missing required fields or invalid source`);
          }
        }
      }
    }
  } catch (error) {
    console.log('JSON parsing failed for breaking news:', error);
  }
  
  return articles;
}

function isValidSource(url: string): boolean {
  if (!url) return false;
  
  // Reject video/social content
  if (url.includes('youtube.com') || url.includes('youtu.be') || 
      url.includes('vimeo.com') || url.includes('tiktok.com') ||
      url.includes('instagram.com') || url.includes('facebook.com')) {
    return false;
  }
  
  // Only allow trusted news domains
  const trustedDomains = [
    "uscis.gov", "dhs.gov", "state.gov", "ice.gov", "cbp.gov", "whitehouse.gov",
    "nbcnews.com", "foxnews.com", "npr.org", "cnn.com",
    "nytimes.com", "cnbc.com", "reuters.com", "apnews.com", 
    "bbc.com", "washingtonpost.com", "abcnews.go.com", "cbsnews.com",
    "politico.com", "axios.com", "bloomberg.com", "wsj.com"
  ];
  
  return trustedDomains.some(domain => url.toLowerCase().includes(domain));
}

function isImmigrationRelated(title: string, content: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  
  // Must contain at least one immigration keyword
  const hasImmigrationKeyword = IMMIGRATION_KEYWORDS.some(keyword => 
    text.includes(keyword.toLowerCase())
  );
  
  // Exclude non-immigration topics even if they mention keywords
  const excludedTopics = [
    'police chief', 'arkansas prison', 'escape', 'reward', 'capture',
    'criminal investigation', 'fugitive', 'manhunt', 'robbery', 'theft',
    'drug trafficking', 'gang violence', 'domestic violence', 'murder',
    'assault', 'fraud scheme', 'embezzlement', 'tax evasion'
  ];
  
  const hasExcludedTopic = excludedTopics.some(topic => text.includes(topic));
  
  return hasImmigrationKeyword && !hasExcludedTopic;
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

serve(handler);
