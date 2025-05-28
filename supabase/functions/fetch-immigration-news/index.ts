
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
  { slug: 'investors', name: 'Investors/entrepreneurs' },
  { slug: 'religious-workers', name: 'Religious workers' },
  { slug: 'undocumented', name: 'Undocumented & mixed-status families' },
  { slug: 'temporary-visitors', name: 'Temporary visitors' },
];

// Approved sources - no YouTube allowed
const approvedDomains = [
  "uscis.gov", "dhs.gov", "state.gov", "ice.gov", "cbp.gov", 
  "reuters.com", "apnews.com", "cnn.com", "bbc.com", 
  "nytimes.com", "washingtonpost.com", "npr.org", 
  "abcnews.go.com", "nbcnews.com", "cbsnews.com",
  "politico.com", "axios.com", "bloomberg.com"
];

function isValidSource(url: string): boolean {
  if (!url) return false;
  
  // Explicitly reject YouTube and video content
  if (url.includes('youtube.com') || url.includes('youtu.be') || 
      url.includes('vimeo.com') || url.includes('tiktok.com')) {
    return false;
  }
  
  // Check if URL contains any approved domain
  return approvedDomains.some(domain => url.toLowerCase().includes(domain));
}

async function fetchNewsFromPerplexity(categoryName: string) {
  const prompt = `Search ONLY official government sources and major reputable news outlets for the latest immigration law news related to ${categoryName} from the past 48 hours. 

REQUIRED SOURCES ONLY:
- Official: USCIS.gov, DHS.gov, State.gov, ICE.gov, CBP.gov
- News: Reuters, AP News, CNN, BBC, NPR, New York Times, Washington Post, NBC, ABC, CBS, Politico, Axios, Bloomberg

STRICT REQUIREMENTS:
1. Every article MUST include a valid source URL from approved sources
2. NO YouTube, video content, or social media links
3. Focus on policy changes, official announcements, court decisions
4. Provide headline, 2-3 sentence summary, and source URL for each item
5. Mark as urgent only if it involves immediate deadlines or breaking policy changes

Format each news item clearly with:
- Title: [Clear headline]
- Summary: [2-3 sentences]
- Source: [Full URL to original article]
- Urgency: [true/false based on immediacy]`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an immigration law news aggregator. Search ONLY official government sources and major trusted news outlets. Every article must have a valid source URL. Never include YouTube, video content, or unverified sources. Focus on factual reporting from approved domains only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: 3000,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'day',
      search_domain_filter: approvedDomains,
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function parseNewsContent(content: string, categorySlug: string) {
  const articles = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentArticle: any = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.match(/^[-=*]+$/)) continue;
    
    // Look for titles
    if (trimmedLine.toLowerCase().startsWith('title:') || 
        (trimmedLine.includes('**') && trimmedLine.length < 200)) {
      
      if (currentArticle && currentArticle.title && currentArticle.source_url && isValidSource(currentArticle.source_url)) {
        articles.push(currentArticle);
      }
      
      currentArticle = {
        title: trimmedLine.replace(/^title:\s*/i, '').replace(/[*#]/g, '').trim(),
        content: '',
        summary: '',
        category: categorySlug,
        source_url: null,
        is_urgent: false,
        tags: [categorySlug],
        status: 'published'
      };
    } 
    else if (currentArticle) {
      // Look for summary
      if (trimmedLine.toLowerCase().startsWith('summary:')) {
        currentArticle.summary = trimmedLine.replace(/^summary:\s*/i, '').trim();
        currentArticle.content = currentArticle.summary;
      }
      // Look for source URLs
      else if (trimmedLine.toLowerCase().startsWith('source:') || trimmedLine.startsWith('http')) {
        const urlMatch = trimmedLine.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch && isValidSource(urlMatch[1])) {
          currentArticle.source_url = urlMatch[1];
        }
      }
      // Look for urgency
      else if (trimmedLine.toLowerCase().startsWith('urgency:')) {
        currentArticle.is_urgent = trimmedLine.toLowerCase().includes('true');
      }
      // Add to content if it's substantial
      else if (trimmedLine.length > 30 && !currentArticle.summary) {
        currentArticle.content += trimmedLine + ' ';
        if (!currentArticle.summary) {
          currentArticle.summary = trimmedLine;
        }
      }
    }
  }
  
  // Don't forget the last article
  if (currentArticle && currentArticle.title && currentArticle.source_url && isValidSource(currentArticle.source_url)) {
    articles.push(currentArticle);
  }
  
  // Filter out articles without valid sources
  return articles.filter(article => 
    article.title && 
    article.title.length > 10 && 
    article.source_url &&
    isValidSource(article.source_url) &&
    (article.summary || article.content)
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category } = await req.json();
    
    let categoriesToFetch = immigrationCategories;
    if (category && category !== 'all') {
      categoriesToFetch = immigrationCategories.filter(cat => cat.slug === category);
    }

    console.log(`Fetching news for ${categoriesToFetch.length} categories from approved sources only`);

    const allArticles = [];

    for (const cat of categoriesToFetch) {
      try {
        console.log(`Fetching verified news for category: ${cat.name}`);
        const newsContent = await fetchNewsFromPerplexity(cat.name);
        const parsedArticles = parseNewsContent(newsContent, cat.slug);
        
        console.log(`Parsed ${parsedArticles.length} verified articles for ${cat.name}`);
        
        for (const article of parsedArticles) {
          // Double-check source validity before inserting
          if (!isValidSource(article.source_url)) {
            console.log(`Skipping article with invalid source: ${article.source_url}`);
            continue;
          }

          // Check for duplicates
          const { data: existing } = await supabase
            .from('immigration_news')
            .select('id')
            .eq('title', article.title)
            .eq('category', article.category)
            .limit(1);

          if (existing && existing.length > 0) {
            console.log(`Duplicate article found: ${article.title}`);
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
            console.error(`Error inserting article for ${cat.slug}:`, error);
          } else {
            allArticles.push(data);
            console.log(`Successfully inserted verified article: ${article.title}`);
          }
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error fetching news for category ${cat.slug}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        articlesAdded: allArticles.length,
        articles: allArticles,
        message: `Successfully fetched ${allArticles.length} verified articles from approved sources only`
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-immigration-news function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
