
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    // Get users who have email notifications enabled and are interested in this category
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, notification_preferences, preferred_categories')
      .contains('preferred_categories', [urgentNews.category])
      .eq('onboarding_completed', true);

    if (profilesError) {
      throw new Error('Error fetching user profiles: ' + profilesError.message);
    }

    if (!userProfiles || userProfiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No users found for this category' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Filter users who have email notifications enabled
    const emailEnabledUsers = userProfiles.filter(profile => {
      const preferences = profile.notification_preferences;
      return preferences && preferences.email === true;
    });

    if (emailEnabledUsers.length === 0) {
      return new Response(JSON.stringify({ message: 'No users with email notifications enabled' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${emailEnabledUsers.length} users with email notifications enabled`);

    // Get email addresses for these users
    const emailPromises = emailEnabledUsers.map(async (profile) => {
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
          }),
        });

        if (response.ok) {
          console.log(`Urgent alert sent to: ${user.user.email}`);
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

    const results = await Promise.all(emailPromises);
    const validResults = results.filter(result => result !== null);
    const sentCount = validResults.filter(r => r.status === 'sent').length;

    console.log(`Urgent news alerts processed: ${sentCount}/${validResults.length} sent successfully`);

    return new Response(JSON.stringify({ 
      message: `Urgent news alerts sent to ${sentCount} users with email notifications`,
      totalUsersInCategory: userProfiles.length,
      usersWithEmailEnabled: emailEnabledUsers.length,
      sentCount,
      newsTitle: urgentNews.title
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in urgent-news-alert function:", error);
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
