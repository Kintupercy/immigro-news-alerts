import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UrgentNewsRequest {
  newsId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsId }: UrgentNewsRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the urgent news article
    const { data: urgentNews, error: newsError } = await supabase
      .from('immigration_news')
      .select('*')
      .eq('id', newsId)
      .eq('is_urgent', true)
      .single();

    if (newsError || !urgentNews) {
      console.log('News not found or not urgent:', newsError);
      return new Response(JSON.stringify({ message: 'News not urgent or not found' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Processing urgent news alert for: ${urgentNews.title}`);

    // Use Perplexity to generate context about why this news is urgent
    const urgencyPrompt = `Analyze this urgent immigration news and explain why it's urgent and what actions people should consider:

Title: ${urgentNews.title}
Content: ${urgentNews.content}
Category: ${urgentNews.category}

Provide a brief explanation (2-3 sentences) about:
1. Why this news is urgent
2. Who it affects most
3. Any immediate actions people should consider

Keep it professional and actionable.`;

    let urgencyContext = "This is important breaking immigration news that requires immediate attention.";
    
    try {
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
              content: 'You are an immigration expert. Provide concise, actionable analysis.'
            },
            {
              role: 'user',
              content: urgencyPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 300,
        }),
      });

      const perplexityData = await perplexityResponse.json();
      if (perplexityData.choices && perplexityData.choices[0]) {
        urgencyContext = perplexityData.choices[0].message.content;
      }
    } catch (aiError) {
      console.error("Error getting AI urgency context:", aiError);
      // Continue with default message
    }

    // Get users who have urgent notifications enabled
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, notification_preferences, preferred_categories')
      .eq('onboarding_completed', true);

    if (profilesError) {
      throw new Error('Error fetching user profiles: ' + profilesError.message);
    }

    if (!userProfiles || userProfiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No users found' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Filter users who have urgent notifications enabled AND are interested in this category
    const urgentNotificationUsers = userProfiles.filter(profile => {
      const preferences = profile.notification_preferences;
      const hasUrgentNotifications = preferences && preferences.email === true && 
                                    (preferences.urgent_only === true || !preferences.urgent_only);
      
      // Check if user is interested in this category (or if they haven't set preferences)
      const isInterestedInCategory = !profile.preferred_categories || 
                                   profile.preferred_categories.length === 0 ||
                                   profile.preferred_categories.includes(urgentNews.category);
      
      return hasUrgentNotifications && isInterestedInCategory;
    });

    if (urgentNotificationUsers.length === 0) {
      return new Response(JSON.stringify({ message: 'No users with urgent notifications enabled for this category' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${urgentNotificationUsers.length} users for urgent notifications`);

    // Send urgent notification emails
    let emailsSent = 0;
    const emailPromises = urgentNotificationUsers.map(async (profile) => {
      try {
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(profile.user_id);
        
        if (userError || !user) {
          console.error(`Error fetching user ${profile.user_id}:`, userError);
          return null;
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/send-urgent-alert-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            to: user.user.email,
            newsTitle: urgentNews.title,
            newsContent: urgentNews.content,
            newsSummary: urgentNews.summary,
            newsCategory: urgentNews.category,
            sourceUrl: urgentNews.source_url,
            firstName: profile.first_name,
            urgencyContext: urgencyContext,
          }),
        });

        if (response.ok) {
          console.log(`Urgent alert sent to: ${user.user.email}`);
          emailsSent++;
          return { email: user.user.email, status: 'sent' };
        } else {
          console.error(`Failed to send urgent alert to: ${user.user.email}`);
          return { email: user.user.email, status: 'failed' };
        }
      } catch (error) {
        console.error(`Error sending urgent alert to user ${profile.user_id}:`, error);
        return { email: 'unknown', status: 'error' };
      }
    });

    await Promise.all(emailPromises);

    console.log(`Urgent news alerts processed: ${emailsSent} sent successfully`);

    return new Response(JSON.stringify({ 
      message: `Urgent news alerts sent to ${emailsSent} users`,
      totalEligibleUsers: urgentNotificationUsers.length,
      emailsSent,
      newsTitle: urgentNews.title,
      newsCategory: urgentNews.category
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-urgent-notifications function:", error);
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