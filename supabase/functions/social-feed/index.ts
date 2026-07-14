// Public read-only JSON feed of recent immigration news, built for social
// automation agents (X/Instagram posting). Returns only already-public data.
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const hours = Math.min(Math.max(parseInt(url.searchParams.get('hours') ?? '24', 10) || 24, 1), 168);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '10', 10) || 10, 1), 25);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('immigration_news')
      .select('id, title, summary, category, is_urgent, published_at, source_url, tags')
      .eq('status', 'published')
      .gte('published_at', since)
      .order('is_urgent', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const articles = (data ?? []).map(a => ({
      title: a.title,
      summary: a.summary,
      category: a.category,
      is_urgent: a.is_urgent,
      published_at: a.published_at,
      // Link to OUR article page (with tracking), not the original source —
      // the goal of social posts is to bring readers to immigronews.com.
      url: `https://immigronews.com/news?article=${a.id}&utm_source=social&utm_medium=hermes`,
      original_source: a.source_url ?? null,
      is_official_source: (a.tags ?? []).some((t: string) => ['uscis', 'dhs-enforcement', 'white-house', 'federal-register'].includes(t)),
    }));

    return new Response(JSON.stringify({
      generated_at: new Date().toISOString(),
      window_hours: hours,
      count: articles.length,
      posting_guidance: 'Post urgent items immediately as standalone posts. Pick the 2-4 most significant non-urgent items for a daily digest. Always link the immigronews.com url, not original_source.',
      articles,
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
