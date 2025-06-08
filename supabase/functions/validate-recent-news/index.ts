import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting news validation for last 2 days');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get articles from the last 2 days
    const { data: articles, error: fetchError } = await supabaseClient
      .from('immigration_news')
      .select('id, title, source_url, created_at, category')
      .gte('created_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
      .not('source_url', 'is', null)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    console.log(`Found ${articles?.length || 0} articles to validate`);

    let validCount = 0;
    let invalidCount = 0;
    let removedArticles: string[] = [];

    if (articles) {
      for (const article of articles) {
        try {
          console.log(`Validating: ${article.title}`);
          
          // Validate the URL
          const urlResponse = await fetch(article.source_url, { 
            method: 'HEAD',
            headers: { 
              'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            redirect: 'follow'
          });

          if (urlResponse.ok) {
            console.log(`✅ VALID: ${article.source_url}`);
            validCount++;
          } else {
            console.log(`❌ INVALID (${urlResponse.status}): ${article.source_url}`);
            invalidCount++;
            
            // Remove article with broken link
            const { error: deleteError } = await supabaseClient
              .from('immigration_news')
              .delete()
              .eq('id', article.id);

            if (!deleteError) {
              removedArticles.push(article.title);
              console.log(`Removed article: ${article.title}`);
            } else {
              console.error(`Failed to remove article ${article.title}:`, deleteError);
            }
          }
        } catch (error) {
          console.log(`❌ ERROR validating ${article.source_url}: ${error.message}`);
          invalidCount++;
          
          // Remove article that can't be validated
          const { error: deleteError } = await supabaseClient
            .from('immigration_news')
            .delete()
            .eq('id', article.id);

          if (!deleteError) {
            removedArticles.push(article.title);
            console.log(`Removed article due to validation error: ${article.title}`);
          }
        }

        // Small delay to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const result = {
      success: true,
      articlesChecked: articles?.length || 0,
      validArticles: validCount,
      invalidArticles: invalidCount,
      removedArticles: removedArticles,
      message: `Validation complete: ${validCount} valid, ${invalidCount} invalid (removed)`
    };

    console.log('Validation result:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in news validation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});