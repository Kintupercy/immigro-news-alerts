
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

    // Get all email subscribers
    const { data: emailSubscribers, error: subscribersError } = await supabase
      .from('email_subscriptions')
      .select('email');

    if (subscribersError) {
      throw new Error('Error fetching email subscribers: ' + subscribersError.message);
    }

    if (!emailSubscribers || emailSubscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'No email subscribers found' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${emailSubscribers.length} email subscribers`);

    // Send urgent alert emails to all subscribers
    const emailPromises = emailSubscribers.map(async (subscriber) => {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-urgent-alert-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            to: subscriber.email,
            newsTitle: urgentNews.title,
            newsContent: urgentNews.content,
            newsSummary: urgentNews.summary,
            newsCategory: urgentNews.category,
            sourceUrl: urgentNews.source_url,
          }),
        });

        if (response.ok) {
          console.log(`Urgent alert sent to: ${subscriber.email}`);
          return { email: subscriber.email, status: 'sent' };
        } else {
          console.error(`Failed to send urgent alert to: ${subscriber.email}`);
          return { email: subscriber.email, status: 'failed' };
        }
      } catch (error) {
        console.error(`Error sending urgent alert to ${subscriber.email}:`, error);
        return { email: subscriber.email, status: 'error' };
      }
    });

    const results = await Promise.all(emailPromises);
    const sentCount = results.filter(r => r.status === 'sent').length;

    console.log(`Urgent news alerts processed: ${sentCount}/${results.length} sent successfully`);

    return new Response(JSON.stringify({ 
      message: `Urgent news alerts sent to ${sentCount} subscribers`,
      totalSubscribers: results.length,
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
