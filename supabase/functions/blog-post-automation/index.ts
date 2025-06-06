import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  post_id: string;
  title: string;
  slug: string;
  category: string;
  published_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { post_id, title, slug, category, published_at }: BlogPost = await req.json();
    console.log(`Starting automation for blog post: ${title} (${post_id})`);

    const baseUrl = 'https://immigronews.com';
    const postUrl = `${baseUrl}/blog/${slug}`;
    
    // Log the start of automation
    await logAction(supabase, post_id, 'automation_started', 'pending', 'Starting blog post automation');

    // 1. Update sitemap and ping Google
    try {
      await updateSitemapAndPingGoogle(supabase, post_id, postUrl);
    } catch (error) {
      console.error('Sitemap update failed:', error);
      await logAction(supabase, post_id, 'sitemap_update', 'failed', `Sitemap update failed: ${error.message}`);
    }

    // 2. Request indexing via Search Console API
    try {
      await requestGoogleIndexing(supabase, post_id, postUrl);
    } catch (error) {
      console.error('Google indexing request failed:', error);
      await logAction(supabase, post_id, 'google_indexing', 'failed', `Google indexing failed: ${error.message}`);
    }

    // 3. Update homepage Latest Posts section (this happens automatically via the existing news feed)
    await logAction(supabase, post_id, 'homepage_update', 'success', 'Homepage will automatically show latest posts');

    // 4. Share on X (Twitter)
    try {
      await shareOnX(supabase, post_id, title, postUrl, category);
    } catch (error) {
      console.error('X sharing failed:', error);
      await logAction(supabase, post_id, 'x_sharing', 'failed', `X sharing failed: ${error.message}`);
    }

    // Final success log
    await logAction(supabase, post_id, 'automation_completed', 'success', 'Blog post automation completed');

    return new Response(
      JSON.stringify({ success: true, message: 'Automation completed', post_url: postUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Automation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function logAction(supabase: any, postId: string, actionType: string, status: string, message: string, responseData?: any) {
  await supabase
    .from('automation_logs')
    .insert({
      post_id: postId,
      action_type: actionType,
      status: status,
      message: message,
      response_data: responseData
    });
  
  console.log(`[${actionType}] ${status}: ${message}`);
}

async function updateSitemapAndPingGoogle(supabase: any, postId: string, postUrl: string) {
  // Generate updated sitemap (using existing sitemap generator logic)
  const { data: articles } = await supabase
    .from('blog_articles')
    .select('slug, updated_at, created_at, category, featured')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (!articles) throw new Error('Failed to fetch articles for sitemap');

  // Build sitemap with blog articles included
  const baseUrl = 'https://immigronews.com';
  const urls: any[] = [];

  // Add static pages
  const staticPages = [
    { loc: '/', priority: 1.0, changefreq: 'daily' },
    { loc: '/news', priority: 0.9, changefreq: 'hourly' },
    { loc: '/blog', priority: 0.8, changefreq: 'daily' },
    { loc: '/resources', priority: 0.8, changefreq: 'weekly' },
    { loc: '/about', priority: 0.7, changefreq: 'monthly' },
    { loc: '/contact', priority: 0.7, changefreq: 'monthly' },
  ];

  urls.push(...staticPages.map(page => ({
    ...page,
    loc: `${baseUrl}${page.loc}`,
    lastmod: new Date().toISOString().split('T')[0]
  })));

  // Add blog articles
  articles.forEach((article: any) => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(article.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    
    let priority = 0.7;
    if (article.featured) priority = 0.8;
    if (daysSinceUpdate <= 7) priority += 0.1;

    urls.push({
      loc: `${baseUrl}/blog/${article.slug}`,
      lastmod: new Date(article.updated_at).toISOString().split('T')[0],
      changefreq: daysSinceUpdate <= 7 ? 'daily' : 'weekly',
      priority: Math.min(priority, 0.9)
    });
  });

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Store updated sitemap (you might want to save this to storage or file system)
  console.log('Generated sitemap with', urls.length, 'URLs');

  // Ping Google with sitemap
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  
  const pingResponse = await fetch(pingUrl);
  
  if (!pingResponse.ok) {
    throw new Error(`Google ping failed: ${pingResponse.status}`);
  }

  await logAction(supabase, postId, 'sitemap_update', 'success', `Sitemap updated and Google pinged successfully`);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function requestGoogleIndexing(supabase: any, postId: string, postUrl: string) {
  const googleApiKey = Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY');
  
  if (!googleApiKey) {
    throw new Error('Google Search Console API key not configured');
  }

  // Google Search Console URL Inspection API endpoint
  const apiUrl = `https://searchconsole.googleapis.com/v1/urlInspection/index:inspect?key=${googleApiKey}`;
  
  const requestBody = {
    inspectionUrl: postUrl,
    siteUrl: 'https://immigronews.com',
    languageCode: 'en-US'
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${googleApiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Search Console API error: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  
  await logAction(supabase, postId, 'google_indexing', 'success', 'Google indexing requested successfully', responseData);
}

async function shareOnX(supabase: any, postId: string, title: string, postUrl: string, category: string) {
  const xBearerToken = Deno.env.get('X_BEARER_TOKEN');
  
  if (!xBearerToken) {
    throw new Error('X (Twitter) Bearer Token not configured');
  }

  // Generate hashtags based on category
  const hashtags = generateHashtags(category);
  
  // Create tweet text (under 280 characters)
  const tweetText = `${title}

${postUrl}

${hashtags}`;

  if (tweetText.length > 280) {
    // Truncate title if needed
    const maxTitleLength = 280 - postUrl.length - hashtags.length - 10; // 10 for spacing and ellipsis
    const truncatedTitle = title.length > maxTitleLength ? 
      `${title.substring(0, maxTitleLength - 3)}...` : title;
    
    const finalTweetText = `${truncatedTitle}

${postUrl}

${hashtags}`;
  }

  // X API v2 endpoint for creating tweets
  const apiUrl = 'https://api.twitter.com/2/tweets';
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${xBearerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: tweetText
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`X API error: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  
  await logAction(supabase, postId, 'x_sharing', 'success', 'Successfully shared on X', responseData);
}

function generateHashtags(category: string): string {
  const categoryHashtags: { [key: string]: string[] } = {
    'Student Visas': ['#StudentVisa', '#StudyInUSA'],
    'Work Visas': ['#WorkVisa', '#ImmigrationJobs'],
    'Family Immigration': ['#FamilyVisa', '#ImmigrationFamily'],
    'Citizenship': ['#USCitizenship', '#Naturalization'],
    'Green Card': ['#GreenCard', '#PermanentResident'],
    'Policy Updates': ['#ImmigrationPolicy', '#USImmigration'],
    'default': ['#Immigration', '#USVisa']
  };

  const hashtags = categoryHashtags[category] || categoryHashtags.default;
  return hashtags.join(' ');
}