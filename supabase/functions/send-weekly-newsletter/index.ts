import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting weekly newsletter generation...");

    // Get articles from the past week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: articles, error: articlesError } = await supabase
      .from('immigration_news')
      .select('*')
      .gte('published_at', oneWeekAgo)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (articlesError) {
      throw new Error('Error fetching articles: ' + articlesError.message);
    }

    if (!articles || articles.length === 0) {
      console.log("No articles found for the past week");
      return new Response(JSON.stringify({ message: 'No articles found for newsletter' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${articles.length} articles from the past week`);

    // Group articles by category for better organization
    const articlesByCategory = articles.reduce((acc, article) => {
      const category = article.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(article);
      return acc;
    }, {} as Record<string, any[]>);

    // Create content for AI summary
    const articlesContent = articles.map(article => 
      `Title: ${article.title}\nCategory: ${article.category}\nSummary: ${article.summary || article.content.substring(0, 200)}\nUrgent: ${article.is_urgent ? 'Yes' : 'No'}\n---`
    ).join('\n');

    // Use Perplexity to create newsletter content
    const perplexityPrompt = `Create a professional weekly immigration news newsletter based on these articles from the past week. 

Articles:
${articlesContent}

Please create:
1. A compelling subject line
2. An executive summary (2-3 sentences)
3. Key highlights organized by category
4. Most important developments section
5. Looking ahead section

Format the response as JSON with these fields:
- subject_line
- executive_summary
- category_highlights (object with category names as keys)
- important_developments (array of strings)
- looking_ahead

Keep it professional, informative, and engaging for immigration professionals and those seeking immigration services.`;

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
            content: 'You are an expert immigration law newsletter writer. Create professional, informative content.'
          },
          {
            role: 'user',
            content: perplexityPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const perplexityData = await perplexityResponse.json();
    let newsletterContent;
    
    try {
      const aiResponse = perplexityData.choices[0].message.content;
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        newsletterContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response, using fallback structure");
      // Fallback structure
      newsletterContent = {
        subject_line: "ImmigroNews Weekly Roundup",
        executive_summary: "This week's immigration news roundup featuring the latest updates and developments.",
        category_highlights: articlesByCategory,
        important_developments: articles.filter(a => a.is_urgent).map(a => a.title),
        looking_ahead: "Stay tuned for more immigration updates next week."
      };
    }

    // Get active email subscriptions
    const { data: emailSubscriptions, error: subscriptionsError } = await supabase
      .from('email_subscriptions')
      .select('email, preferences')
      .eq('is_active', true);

    if (subscriptionsError) {
      throw new Error('Error fetching email subscriptions: ' + subscriptionsError.message);
    }

    console.log(`Found ${emailSubscriptions?.length || 0} active email subscriptions`);

    if (!emailSubscriptions || emailSubscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No active email subscriptions found' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send newsletter emails
    let emailsSent = 0;
    const emailPromises = emailSubscriptions.map(async (subscription) => {
      try {
        // Send newsletter email
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            to: subscription.email,
            subject: newsletterContent.subject_line,
            type: 'newsletter',
            content: {
              firstName: subscription.preferences?.firstName || '',
              executiveSummary: newsletterContent.executive_summary,
              categoryHighlights: newsletterContent.category_highlights,
              importantDevelopments: newsletterContent.important_developments,
              lookingAhead: newsletterContent.looking_ahead,
              weeklyStats: {
                totalArticles: articles.length,
                urgentNews: articles.filter(a => a.is_urgent).length,
                categories: Object.keys(articlesByCategory).length
              }
            }
          }),
        });

        if (emailResponse.ok) {
          console.log(`Newsletter sent to: ${subscription.email}`);
          emailsSent++;
          return { email: subscription.email, status: 'sent' };
        } else {
          console.error(`Failed to send newsletter to: ${subscription.email}`);
          return { email: subscription.email, status: 'failed' };
        }
      } catch (error) {
        console.error(`Error sending newsletter to ${subscription.email}:`, error);
        return { email: subscription.email, status: 'error' };
      }
    });

    await Promise.all(emailPromises);

    console.log(`Weekly newsletter sent to ${emailsSent} subscribers`);

    return new Response(JSON.stringify({ 
      message: `Weekly newsletter sent successfully`,
      totalSubscribers: emailSubscriptions.length,
      emailsSent,
      articlesIncluded: articles.length,
      weekPeriod: oneWeekAgo
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-weekly-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);