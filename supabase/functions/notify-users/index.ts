
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotifyUsersRequest {
  newsId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsId }: NotifyUsersRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the news article
    const { data: news, error: newsError } = await supabase
      .from('immigration_news')
      .select('*')
      .eq('id', newsId)
      .single();

    if (newsError || !news) {
      throw new Error('News article not found');
    }

    console.log('Processing notifications for news:', news.title);

    // Generate proper article link
    const articleUrl = `https://immigronews.com/news?article=${news.id}`;

    // Get users who want notifications for this category
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, preferred_categories, notification_preferences')
      .contains('preferred_categories', [news.category]);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      throw new Error('Error fetching user profiles');
    }

    console.log(`Found ${profiles?.length || 0} users interested in category: ${news.category}`);

    // Get user emails from auth.users
    const userIds = profiles?.map(p => p.user_id) || [];
    if (userIds.length === 0) {
      return new Response(JSON.stringify({ message: 'No users to notify' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const notifications = [];
    let emailCount = 0;

    for (const profile of profiles || []) {
      const preferences = profile.notification_preferences;
      
      // Skip if user only wants urgent notifications and this isn't urgent
      if (preferences.urgent_only && !news.is_urgent) {
        console.log(`Skipping user ${profile.user_id} - urgent only preference`);
        continue;
      }

      // Get user email
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(profile.user_id);
      if (userError || !user) {
        console.error(`Error getting user ${profile.user_id}:`, userError);
        continue;
      }

      console.log(`Processing notifications for user: ${user.user.email}`);

      // Send email notification
      if (preferences.email) {
        try {
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              to: user.user.email,
              subject: news.title,
              title: news.title,
              content: news.content,
              category: news.category,
              isUrgent: news.is_urgent,
              firstName: profile.first_name,
              articleUrl: articleUrl,
              sourceUrl: news.source_url
            }),
          });

          if (emailResponse.ok) {
            emailCount++;
            notifications.push({ type: 'email', user: user.user.email, status: 'sent' });
            console.log(`Email sent successfully to: ${user.user.email}`);
          } else {
            console.error(`Email failed for ${user.user.email}:`, await emailResponse.text());
            notifications.push({ type: 'email', user: user.user.email, status: 'failed' });
          }
        } catch (error) {
          console.error('Email notification error:', error);
          notifications.push({ type: 'email', user: user.user.email, status: 'failed' });
        }
      }
    }

    console.log(`Notification summary: ${emailCount} emails sent`);

    return new Response(JSON.stringify({ 
      message: 'Notifications processed',
      notifications,
      totalUsers: profiles?.length || 0,
      emailsSent: emailCount
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in notify-users function:", error);
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
