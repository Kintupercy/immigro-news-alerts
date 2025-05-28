
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

async function fetchNewsFromPerplexity(categoryName: string) {
  const prompt = `Search the latest updates from official sources like USCIS Newsroom, Department of State Visa Bulletin, AILA Daily Immigration News Clips, CBP Newsroom, NPR Immigration, and major U.S. news outlets. Summarize the most important immigration law news and policy changes from the past 24 hours related to ${categoryName}, including green card, citizenship, student visa, work visa, humanitarian, and enforcement updates. Provide a headline, summary, source link, and image if available for each item. Focus on actionable updates and policy changes.`;

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
          content: 'You are an immigration law news aggregator. Search official government sources and trusted news outlets. Format each news item clearly with title, summary, source URL, and indicate if urgent. Avoid RSS feeds and focus on original reporting from USCIS, Department of State, AILA, CBP, and major news outlets.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 2500,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'day',
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
  // Enhanced parsing logic to better handle structured responses
  const articles = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentArticle: any = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and common separators
    if (!trimmedLine || trimmedLine.match(/^[-=*]+$/)) continue;
    
    // Look for titles (lines that might be headlines)
    if (trimmedLine.includes('**') || trimmedLine.includes('##') || 
        (trimmedLine.length > 20 && trimmedLine.length < 200 && 
         !trimmedLine.startsWith('http') && !trimmedLine.startsWith('Source:'))) {
      
      // Save previous article if exists
      if (currentArticle && currentArticle.title) {
        articles.push(currentArticle);
      }
      
      currentArticle = {
        title: trimmedLine.replace(/[*#]/g, '').trim(),
        content: '',
        summary: '',
        category: categorySlug,
        source_url: null,
        is_urgent: trimmedLine.toLowerCase().includes('urgent') || 
                   trimmedLine.toLowerCase().includes('breaking') ||
                   trimmedLine.toLowerCase().includes('alert'),
        tags: [categorySlug],
        status: 'published'
      };
    } else if (currentArticle) {
      // Look for source URLs
      if (trimmedLine.startsWith('http') || trimmedLine.includes('Source:')) {
        const urlMatch = trimmedLine.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          currentArticle.source_url = urlMatch[1];
        }
      } else if (trimmedLine.length > 30) {
        // Add to content and use first substantial line as summary
        currentArticle.content += trimmedLine + ' ';
        if (!currentArticle.summary && trimmedLine.length > 50) {
          currentArticle.summary = trimmedLine;
        }
      }
    }
  }
  
  // Don't forget the last article
  if (currentArticle && currentArticle.title) {
    articles.push(currentArticle);
  }
  
  // Filter out articles that don't have minimum required information
  return articles.filter(article => 
    article.title && 
    article.title.length > 10 && 
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

    console.log(`Fetching news for ${categoriesToFetch.length} categories from official sources`);

    const allArticles = [];

    for (const cat of categoriesToFetch) {
      try {
        console.log(`Fetching official news for category: ${cat.name}`);
        const newsContent = await fetchNewsFromPerplexity(cat.name);
        const parsedArticles = parseNewsContent(newsContent, cat.slug);
        
        console.log(`Parsed ${parsedArticles.length} articles for ${cat.name}`);
        
        for (const article of parsedArticles) {
          // Insert into database
          const { data, error } = await supabase
            .from('immigration_news')
            .insert(article)
            .select()
            .single();

          if (error) {
            console.error(`Error inserting article for ${cat.slug}:`, error);
          } else {
            allArticles.push(data);
            console.log(`Successfully inserted article: ${article.title}`);
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
        message: `Successfully fetched ${allArticles.length} articles from official immigration sources`
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
