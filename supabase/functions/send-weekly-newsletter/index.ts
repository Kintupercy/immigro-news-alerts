
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
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
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;
    
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

    // Official government source detection — same definition as the site's
    // Breaking tab (gov ingest feed tags or .gov domains).
    const GOV_TAGS = ['uscis', 'dhs-enforcement', 'white-house', 'federal-register'];
    const GOV_DOMAINS = ['uscis.gov', 'dhs.gov', 'ice.gov', 'cbp.gov', 'state.gov', 'justice.gov', 'whitehouse.gov', 'federalregister.gov'];
    const isOfficial = (a: any) =>
      (a.tags ?? []).some((t: string) => GOV_TAGS.includes(t)) ||
      (a.source_url && GOV_DOMAINS.some((d: string) => a.source_url.includes(d)));

    // Create content for AI summary with proper article links.
    // Priority order: urgent policy changes first, then official gov
    // announcements, then everything else by recency.
    const articlesWithLinks = articles
      .map(article => ({
        ...article,
        articleUrl: `https://immigronews.com/news?article=${article.id}`,
        sourceUrl: article.source_url,
        isOfficialSource: isOfficial(article),
      }))
      .sort((a, b) =>
        (Number(b.is_urgent) - Number(a.is_urgent)) ||
        (Number(b.isOfficialSource) - Number(a.isOfficialSource)) ||
        (new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      );

    const articlesContent = articlesWithLinks.map(article =>
      `Title: ${article.title}\nCategory: ${article.category}\nSummary: ${article.summary || article.content.substring(0, 200)}\nUrgent: ${article.is_urgent ? 'Yes' : 'No'}\nOfficial Government Source: ${article.isOfficialSource ? 'Yes' : 'No'}\nArticle Link: ${article.articleUrl}\nSource: ${article.sourceUrl || 'N/A'}\n---`
    ).join('\n');

    // Use Gemini Flash 2.0 to create newsletter content
    const newsletterPrompt = `Create a professional weekly immigration news newsletter based on these articles from the past week.

Articles:
${articlesContent}

Please create:
1. A compelling subject line
2. An executive summary (2-3 sentences)
3. Most important developments section (include article links for readers to read full articles)
4. Looking ahead section

Prioritization rules: lead with urgent policy changes, then official government announcements (marked "Official Government Source: Yes" — USCIS, DHS/ICE, White House, Federal Register), then notable coverage from major outlets. Official announcements are the most authoritative items — never omit them from the important developments section.

Format the response as JSON with these fields:
- subject_line
- executive_summary
- important_developments (array of objects with title, summary, and link fields)
- looking_ahead

Keep it professional, informative, and engaging for immigration professionals and those seeking immigration services. Make sure to include the article links so readers can access the full articles. Return only valid JSON, no markdown code fences.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You are an expert immigration law newsletter writer. Create professional, informative content with proper links. Always return valid JSON only.' }]
          },
          contents: [{ parts: [{ text: newsletterPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    const geminiData = await geminiResponse.json();
    let newsletterContent;

    try {
      if (!geminiData.candidates || geminiData.candidates.length === 0) {
        throw new Error("No candidates in Gemini response");
      }

      const aiResponse = geminiData.candidates[0].content.parts[0].text;
      // Strip any accidental markdown code fences before parsing
      const cleaned = aiResponse.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        newsletterContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in Gemini response");
      }
    } catch (parseError) {
      console.error("Error parsing AI response, using fallback structure");
      // Fallback structure with proper links
      newsletterContent = {
        subject_line: "ImmigroNews Weekly Roundup",
        executive_summary: "This week's immigration news roundup featuring the latest updates and developments.",
        important_developments: articlesWithLinks
          .filter(a => a.is_urgent)
          .slice(0, 5)
          .map(a => ({
            title: a.title,
            summary: a.summary || a.content.substring(0, 150) + '...',
            link: a.articleUrl
          })),
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
              importantDevelopments: newsletterContent.important_developments,
              lookingAhead: newsletterContent.looking_ahead,
              weeklyStats: {
                totalArticles: articles.length,
                urgentNews: articles.filter(a => a.is_urgent).length,
                categories: Object.keys(articlesByCategory).length
              },
              // Include featured articles with proper links for the main content
              featuredArticles: articlesWithLinks.slice(0, 5).map(article => ({
                title: article.title,
                summary: article.summary || article.content.substring(0, 150) + '...',
                link: article.articleUrl,
                category: article.category,
                isUrgent: article.is_urgent
              }))
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
