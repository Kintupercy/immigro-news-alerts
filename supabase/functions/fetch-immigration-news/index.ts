
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
  const prompt = `Find 2-3 recent U.S. immigration news articles about ${categoryName} from the past 24-48 hours.

ONLY search these verified sources:
- Government: uscis.gov, dhs.gov, state.gov, ice.gov, cbp.gov
- News: reuters.com, apnews.com, cnn.com, bbc.com, nytimes.com, washingtonpost.com, npr.org, nbcnews.com, cbsnews.com, politico.com

For each article, provide:
TITLE: [Article headline]
SUMMARY: [2-3 sentences about the news]
CONTENT: [Brief description of what happened]
SOURCE: [Complete URL from approved source]
URGENT: [true only for immediate deadlines/breaking news, otherwise false]

Requirements:
- Must include valid source URLs from approved domains
- NO YouTube, social media, or video content
- Focus on policy changes, official announcements, court decisions`;

  console.log(`Making Perplexity API request for: ${categoryName}`);

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
          content: 'You are an immigration law news researcher. Only search official government sources and major trusted news outlets. Never include YouTube or video content. Always provide source URLs from approved domains.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Perplexity API error for ${categoryName}: ${response.status} - ${errorText}`);
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  console.log(`Perplexity response for ${categoryName}:`, content?.substring(0, 300));
  return content;
}

function parseNewsContent(content: string, categorySlug: string) {
  const articles = [];
  const sections = content.split(/(?=TITLE:|Title:)/i).filter(section => section.trim());
  
  for (const section of sections) {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    
    let article: any = {
      category: categorySlug,
      tags: [categorySlug],
      is_urgent: false,
      status: 'published'
    };
    
    for (const line of lines) {
      if (line.toLowerCase().startsWith('title:') || line.toLowerCase().startsWith('title ')) {
        article.title = line.replace(/^title:?\s*/i, '').replace(/[*#]/g, '').trim();
      } else if (line.toLowerCase().startsWith('summary:')) {
        article.summary = line.replace(/^summary:\s*/i, '').trim();
      } else if (line.toLowerCase().startsWith('content:')) {
        article.content = line.replace(/^content:\s*/i, '').trim();
      } else if (line.toLowerCase().startsWith('source:') || line.startsWith('http')) {
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch && isValidSource(urlMatch[1])) {
          article.source_url = urlMatch[1];
        }
      } else if (line.toLowerCase().startsWith('urgent:')) {
        article.is_urgent = line.toLowerCase().includes('true');
      }
    }
    
    // Set content as summary if content is missing
    if (!article.content && article.summary) {
      article.content = article.summary;
    }
    
    // Only add articles with required fields and valid sources
    if (article.title && article.title.length > 10 && 
        article.source_url && isValidSource(article.source_url) &&
        (article.summary || article.content)) {
      articles.push(article);
    }
  }
  
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
    
    // Check if we have recent news (within last 12 hours) unless forcing refresh
    if (!forceRefresh) {
      const { data: recentNews } = await supabase
        .from('immigration_news')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (recentNews && recentNews.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            articlesAdded: 0,
            message: 'Recent news already exists, skipping fetch. Use refresh to force update.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
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

        // Add delay between requests to avoid rate limiting
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
