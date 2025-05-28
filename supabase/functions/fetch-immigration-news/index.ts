
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
  const prompt = `Provide the latest news and legal developments in U.S. immigration law related to ${categoryName}. Summarize each headline in 2–3 sentences, include a link to the original source, and add an image if available. Focus on actionable updates and policy changes from the past 24 hours.`;

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
          content: 'You are an immigration law news aggregator. Provide structured, factual news summaries with source links. Format each news item clearly with title, summary, source URL, and indicate if urgent.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 2000,
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
  // Simple parsing logic - in production, you might want more sophisticated parsing
  const articles = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentArticle: any = null;
  
  for (const line of lines) {
    // Look for titles (lines that might be headlines)
    if (line.includes('**') || line.includes('##') || (line.length > 20 && line.length < 200 && !line.startsWith('http'))) {
      if (currentArticle) {
        articles.push(currentArticle);
      }
      currentArticle = {
        title: line.replace(/[*#]/g, '').trim(),
        content: '',
        summary: '',
        category: categorySlug,
        source_url: null,
        is_urgent: line.toLowerCase().includes('urgent') || line.toLowerCase().includes('breaking'),
        tags: [categorySlug],
        status: 'published'
      };
    } else if (currentArticle && line.startsWith('http')) {
      currentArticle.source_url = line.trim();
    } else if (currentArticle && line.trim()) {
      currentArticle.content += line + ' ';
      if (!currentArticle.summary && line.length > 50) {
        currentArticle.summary = line.trim();
      }
    }
  }
  
  if (currentArticle) {
    articles.push(currentArticle);
  }
  
  return articles.filter(article => article.title && article.title.length > 10);
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

    console.log(`Fetching news for ${categoriesToFetch.length} categories`);

    const allArticles = [];

    for (const cat of categoriesToFetch) {
      try {
        console.log(`Fetching news for category: ${cat.name}`);
        const newsContent = await fetchNewsFromPerplexity(cat.name);
        const parsedArticles = parseNewsContent(newsContent, cat.slug);
        
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
          }
        }

        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error fetching news for category ${cat.slug}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        articlesAdded: allArticles.length,
        articles: allArticles 
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
