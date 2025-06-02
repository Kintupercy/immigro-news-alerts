
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
    console.log('Starting scheduled news fetch function');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check which time slot this is (morning: 8am, afternoon: 2pm, evening: 6pm Central)
    const now = new Date();
    const centralTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
    const hour = centralTime.getHours();
    
    let timeSlot = 'unknown';
    if (hour >= 7 && hour <= 9) {
      timeSlot = 'morning';
    } else if (hour >= 13 && hour <= 15) {
      timeSlot = 'afternoon';
    } else if (hour >= 17 && hour <= 19) {
      timeSlot = 'evening';
    }

    console.log(`Scheduled news fetch triggered at ${centralTime.toLocaleString()} Central (${timeSlot} slot)`);

    // Call the optimized news scheduler function
    const { data: newsData, error: newsError } = await supabaseClient.functions.invoke('optimized-news-scheduler', {
      body: { 
        scheduledRun: true,
        timeSlot: timeSlot,
        centralTime: centralTime.toISOString()
      }
    });

    if (newsError) {
      console.error('Error calling optimized news scheduler:', newsError);
      throw newsError;
    }

    console.log('Optimized news scheduler response:', newsData);

    // Call breaking news fetch
    const { data: breakingData, error: breakingError } = await supabaseClient.functions.invoke('fetch-breaking-news', {
      body: { 
        scheduledRun: true,
        timeSlot: timeSlot
      }
    });

    if (breakingError) {
      console.error('Error calling breaking news fetch:', breakingError);
      // Don't throw here, just log the error
    }

    console.log('Breaking news fetch response:', breakingData);

    // Optionally send notifications for urgent news (only during business hours)
    if (timeSlot === 'morning' || timeSlot === 'afternoon' || timeSlot === 'evening') {
      try {
        const { data: notificationData, error: notificationError } = await supabaseClient.functions.invoke('send-notifications', {
          body: { 
            type: 'scheduled_update',
            timeSlot: timeSlot
          }
        });

        if (notificationError) {
          console.error('Error sending notifications:', notificationError);
        } else {
          console.log('Notifications sent:', notificationData);
        }
      } catch (notificationError) {
        console.error('Failed to send notifications:', notificationError);
      }
    }

    const totalArticles = (newsData?.articlesAdded || 0) + (breakingData?.articlesAdded || 0);
    const urgentCount = breakingData?.urgentNewsFound || 0;

    return new Response(
      JSON.stringify({ 
        success: true,
        timeSlot: timeSlot,
        centralTime: centralTime.toISOString(),
        articlesAdded: totalArticles,
        regularNews: newsData?.articlesAdded || 0,
        breakingNews: breakingData?.articlesAdded || 0,
        urgentNews: urgentCount,
        message: `Scheduled news fetch completed for ${timeSlot} slot: ${totalArticles} total articles added${urgentCount > 0 ? ` (${urgentCount} urgent)` : ''}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in scheduled news fetch:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
