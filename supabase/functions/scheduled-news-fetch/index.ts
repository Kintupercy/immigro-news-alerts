
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

// Approved sources - strictly no YouTube or video content
const approvedDomains = [
  "uscis.gov", "dhs.gov", "state.gov", "ice.gov", "cbp.gov", 
  "reuters.com", "apnews.com", "cnn.com", "bbc.com", 
  "nytimes.com", "washingtonpost.com", "npr.org", 
  "abcnews.go.com", "nbcnews.com", "cbsnews.com",
  "politico.com", "axios.com", "bloomberg.com"
];

function isValidSource(url: string): boolean {
  if (!url) return false;
  
  // Explicitly reject video content
  if (url.includes('youtube.com') || url.includes('youtu.be') || 
      url.includes('vimeo.com') || url.includes('tiktok.com') ||
      url.includes('instagram.com') || url.includes('facebook.com')) {
    return false;
  }
  
  // Only allow approved domains
  return approvedDomains.some(domain => url.toLowerCase().includes(domain));
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
      console.log(`Fetching verified news for category: ${category.name}`);

      const prompt = `Provide ONLY the latest verified news and legal developments in U.S. immigration law related to ${category.name} from the past 24-48 hours. 

STRICT SOURCE REQUIREMENTS:
- Official sources: USCIS.gov, DHS.gov, State.gov, ICE.gov, CBP.gov
- Verified news: Reuters, AP News, CNN, BBC, NPR, New York Times, Washington Post, NBC, ABC, CBS, Politico, Axios, Bloomberg
- NO YouTube, social media, or video content
- Every article MUST include a valid source URL

Requirements:
- Focus on factual, verified information only
- Provide 2-4 distinct news items with source URLs
- Include: headline, detailed summary, source URL
- Mark as urgent only for immediate policy changes or breaking developments
- Include relevant tags

Format as JSON array:
{
  "title": "News headline",
  "content": "Detailed content (3-4 paragraphs)",
  "summary": "Brief summary (2-3 sentences)",
  "source_url": "URL to original verified source",
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
                content: 'You are an expert immigration law researcher. Provide accurate, up-to-date information from verified sources only. Never include YouTube, video content, or social media. Always return valid JSON format with source URLs from approved domains.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 4000,
            temperature: 0.1,
            top_p: 0.9,
            return_citations: true,
            search_domain_filter: approvedDomains
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

        // Parse JSON from response
        let newsItems: NewsItem[] = [];
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            newsItems = JSON.parse(jsonMatch[0]);
          } else {
            newsItems = JSON.parse(content);
          }
        } catch (parseError) {
          console.error(`Failed to parse JSON for ${category.name}:`, parseError);
          continue;
        }

        // Insert verified news items
        for (const item of newsItems) {
          try {
            // Validate source URL
            if (!item.source_url || !isValidSource(item.source_url)) {
              console.log(`Skipping article with invalid source: ${item.source_url || 'no source'}`);
              continue;
            }

            // Check for duplicates
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
                source_url: item.source_url,
                is_urgent: item.is_urgent || false,
                tags: item.tags || [],
                status: 'published',
                published_at: new Date().toISOString()
              });

            if (insertError) {
              console.error(`Error inserting article: ${insertError.message}`);
            } else {
              totalArticlesAdded++;
              console.log(`Added verified article: ${item.title}`);
            }
          } catch (insertError) {
            console.error(`Error processing article ${item.title}:`, insertError);
          }
        }

        // Delay between API calls
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (apiError) {
        console.error(`Error fetching news for ${category.name}:`, apiError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        articlesAdded: totalArticlesAdded,
        categoriesProcessed: categories.length,
        message: `Added ${totalArticlesAdded} verified articles from approved sources only`
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
