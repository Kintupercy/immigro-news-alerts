
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not found');
    }

    // Get all categories
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('immigration_categories')
      .select('*');

    if (categoriesError) throw categoriesError;

    let totalArticlesAdded = 0;

    // Process each category
    for (const category of categories as Category[]) {
      console.log(`Fetching news for category: ${category.name}`);

      const prompt = `Provide the latest news and legal developments in U.S. immigration law related to ${category.name}. 

Requirements:
- Focus on news from the past 24-48 hours
- Include only factual, verified information from authoritative sources
- Provide 3-5 distinct news items
- For each item, include: headline, detailed summary (2-3 sentences), source URL if available
- Mark items as urgent if they involve immediate policy changes, deadlines, or breaking developments
- Include relevant tags for categorization

Format the response as a JSON array with objects containing:
{
  "title": "News headline",
  "content": "Detailed content (3-4 paragraphs)",
  "summary": "Brief summary (2-3 sentences)",
  "source_url": "URL to original source (if available)",
  "is_urgent": boolean,
  "tags": ["tag1", "tag2", "tag3"]
}`;

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
                content: 'You are an expert immigration law researcher. Provide accurate, up-to-date information about U.S. immigration developments. Always return valid JSON format.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 4000,
            temperature: 0.2,
            top_p: 0.9,
            return_citations: true,
            search_domain_filter: ["uscis.gov", "dhs.gov", "state.gov", "ice.gov", "cbp.gov", "reuters.com", "apnews.com", "cnn.com", "bbc.com", "nytimes.com", "washingtonpost.com"]
          }),
        });

        if (!response.ok) {
          console.error(`Perplexity API error for ${category.name}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          console.error(`No content received for category: ${category.name}`);
          continue;
        }

        // Try to parse JSON from the response
        let newsItems: NewsItem[] = [];
        try {
          // Extract JSON from the response (in case it's wrapped in text)
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            newsItems = JSON.parse(jsonMatch[0]);
          } else {
            // If no JSON array found, try to parse the entire content
            newsItems = JSON.parse(content);
          }
        } catch (parseError) {
          console.error(`Failed to parse JSON for ${category.name}:`, parseError);
          console.log('Raw content:', content);
          continue;
        }

        // Insert news items into database
        for (const item of newsItems) {
          try {
            // Check for duplicates based on title and category
            const { data: existing } = await supabaseClient
              .from('immigration_news')
              .select('id')
              .eq('title', item.title)
              .eq('category', category.slug)
              .limit(1);

            if (existing && existing.length > 0) {
              console.log(`Duplicate article found: ${item.title}`);
              continue;
            }

            const { error: insertError } = await supabaseClient
              .from('immigration_news')
              .insert({
                title: item.title,
                content: item.content,
                summary: item.summary,
                category: category.slug,
                source_url: item.source_url || null,
                is_urgent: item.is_urgent || false,
                tags: item.tags || [],
                status: 'published',
                published_at: new Date().toISOString()
              });

            if (insertError) {
              console.error(`Error inserting article: ${insertError.message}`);
            } else {
              totalArticlesAdded++;
              console.log(`Added article: ${item.title}`);
            }
          } catch (insertError) {
            console.error(`Error processing article ${item.title}:`, insertError);
          }
        }

        // Add a small delay between API calls to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (apiError) {
        console.error(`Error fetching news for ${category.name}:`, apiError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        articlesAdded: totalArticlesAdded,
        categoriesProcessed: categories.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in scheduled-news-fetch function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
