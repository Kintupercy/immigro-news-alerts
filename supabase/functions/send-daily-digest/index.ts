import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get urgent and breaking news from the last 24 hours
    const { data: urgentNews, error: newsError } = await supabase
      .from('immigration_news')
      .select('title, content, category, published_at, source_url')
      .eq('status', 'published')
      .eq('is_urgent', true)
      .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false })
      .limit(10);

    if (newsError) {
      throw new Error(`Failed to fetch news: ${newsError.message}`);
    }

    // Get active email subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('email_subscriptions')
      .select('email, preferences')
      .eq('is_active', true);

    if (subError) {
      throw new Error(`Failed to fetch subscriptions: ${subError.message}`);
    }

    if (!urgentNews || urgentNews.length === 0) {
      console.log('No urgent news found for today');
      return new Response(JSON.stringify({ message: 'No urgent news to send' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let emailsSent = 0;

    // Send digest to each subscriber
    for (const subscription of subscriptions || []) {
      try {
        const preferences = subscription.preferences as any;
        const firstName = preferences?.firstName || '';

        const newsHtml = urgentNews.map(news => `
          <div style="margin-bottom: 24px; padding: 16px; border-left: 4px solid #1e3a8a;">
            <h3 style="color: #1e3a8a; margin: 0 0 8px 0;">${news.title}</h3>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">Category: ${news.category}</p>
            <p style="margin: 0 0 8px 0;">${news.content.substring(0, 200)}${news.content.length > 200 ? '...' : ''}</p>
            ${news.source_url ? `<a href="${news.source_url}" style="color: #1e3a8a; text-decoration: none;">Read more →</a>` : ''}
          </div>
        `).join('');

        await resend.emails.send({
          from: "ImmigrowNews <updates@immigronews.com>",
          to: [subscription.email],
          subject: `Daily Immigration News Digest - ${urgentNews.length} Important Update${urgentNews.length > 1 ? 's' : ''}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1e3a8a; margin-bottom: 24px;">Today's Immigration News</h1>
              
              ${firstName ? `<p>Hi ${firstName},</p>` : '<p>Hello!</p>'}
              
              <p>Here are today's most important immigration news updates:</p>
              
              ${newsHtml}
              
              <div style="margin: 32px 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  Stay informed with ImmigrowNews. Reply to unsubscribe at any time.
                </p>
              </div>
              
              <p>Best regards,<br>The ImmigrowNews Team</p>
            </div>
          `,
        });

        emailsSent++;
      } catch (error) {
        console.error(`Failed to send digest to ${subscription.email}:`, error);
      }
    }

    console.log(`Daily digest sent to ${emailsSent} subscribers`);

    return new Response(JSON.stringify({ 
      message: 'Daily digest sent successfully',
      emailsSent,
      newsCount: urgentNews.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error sending daily digest:", error);
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