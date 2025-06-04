
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const body = await req.json();
    const { type, newsId, articleId, isUrgent, timeSlot } = body;

    // Handle different notification types
    if (type === 'urgent_news' && newsId) {
      // Call the dedicated urgent notifications function
      const response = await fetch(`${supabaseUrl}/functions/v1/send-urgent-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ newsId }),
      });

      const result = await response.json();
      return new Response(JSON.stringify(result), {
        status: response.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Handle legacy format (for backward compatibility)
    const targetArticleId = newsId || articleId;

    if (!targetArticleId) {
      return new Response(JSON.stringify({ message: 'No specific article notifications to send' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the article details
    const { data: article, error: articleError } = await supabaseClient
      .from('immigration_news')
      .select('*')
      .eq('id', targetArticleId)
      .single();

    if (articleError || !article) {
      throw new Error('Article not found');
    }

    // Get users who should receive notifications for this category
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('user_profiles')
      .select(`
        user_id,
        first_name,
        notification_preferences,
        preferred_categories,
        auth.users!inner(email)
      `)
      .contains('preferred_categories', [article.category]);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      throw profilesError;
    }

    let notificationsSent = 0;

    for (const profile of profiles || []) {
      const notificationPrefs = profile.notification_preferences;
      
      // Skip if user only wants urgent notifications and this isn't urgent
      if (notificationPrefs.urgent_only && !isUrgent) {
        continue;
      }

      // Send email notification if enabled
      if (notificationPrefs.email) {
        try {
          // In a real implementation, you would integrate with an email service
          // For now, we'll just log the notification
          console.log(`Would send email to ${profile.auth.users.email} about: ${article.title}`);
          
          // Log the notification attempt
          await supabaseClient
            .from('notification_logs')
            .insert({
              user_id: profile.user_id,
              article_id: articleId,
              notification_type: 'email',
              status: 'sent'
            });

          notificationsSent++;
        } catch (emailError) {
          console.error(`Failed to send email to ${profile.auth.users.email}:`, emailError);
          
          await supabaseClient
            .from('notification_logs')
            .insert({
              user_id: profile.user_id,
              article_id: articleId,
              notification_type: 'email',
              status: 'failed',
              error_message: emailError.message
            });
        }
      }

      // Add SMS notifications here if needed
      // Add push notifications here if needed
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent,
        article: article.title 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
