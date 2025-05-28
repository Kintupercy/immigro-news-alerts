
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

    // Get users who want notifications for this category
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, phone_number, preferred_categories, notification_preferences')
      .contains('preferred_categories', [news.category]);

    if (profilesError) {
      throw new Error('Error fetching user profiles');
    }

    // Get user emails from auth.users
    const userIds = profiles?.map(p => p.user_id) || [];
    if (userIds.length === 0) {
      return new Response(JSON.stringify({ message: 'No users to notify' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const notifications = [];

    for (const profile of profiles || []) {
      const preferences = profile.notification_preferences;
      
      // Skip if user only wants urgent notifications and this isn't urgent
      if (preferences.urgent_only && !news.is_urgent) {
        continue;
      }

      // Get user email
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(profile.user_id);
      if (userError || !user) continue;

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
            }),
          });

          if (emailResponse.ok) {
            notifications.push({ type: 'email', user: user.user.email, status: 'sent' });
          }
        } catch (error) {
          console.error('Email notification error:', error);
          notifications.push({ type: 'email', user: user.user.email, status: 'failed' });
        }
      }

      // Send SMS notification
      if (preferences.sms && profile.phone_number) {
        try {
          const smsResponse = await fetch(`${supabaseUrl}/functions/v1/send-sms-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              to: profile.phone_number,
              title: news.title,
              category: news.category,
              isUrgent: news.is_urgent,
            }),
          });

          if (smsResponse.ok) {
            notifications.push({ type: 'sms', user: profile.phone_number, status: 'sent' });
          }
        } catch (error) {
          console.error('SMS notification error:', error);
          notifications.push({ type: 'sms', user: profile.phone_number, status: 'failed' });
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Notifications processed',
      notifications,
      totalUsers: profiles?.length || 0
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
