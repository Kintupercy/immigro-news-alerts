
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UrgentAlertEmailRequest {
  to: string;
  newsTitle: string;
  newsContent: string;
  newsSummary: string;
  newsCategory: string;
  sourceUrl?: string;
  firstName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, newsTitle, newsContent, newsSummary, newsCategory, sourceUrl, firstName }: UrgentAlertEmailRequest = await req.json();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>🚨 URGENT Immigration News Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .urgent-banner { background: #fef2f2; border: 2px solid #fecaca; color: #dc2626; padding: 15px; text-align: center; font-weight: bold; margin-bottom: 20px; border-radius: 6px; }
            .content { background: #f8fafc; padding: 30px 20px; border-radius: 0 0 8px 8px; }
            .category-badge { background: #dc2626; color: white; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 20px; display: inline-block; }
            .news-title { font-size: 24px; font-weight: bold; margin: 20px 0; color: #dc2626; }
            .news-summary { font-size: 18px; line-height: 1.6; margin: 20px 0; padding: 15px; background: #fef9c3; border-left: 4px solid #eab308; }
            .news-content { font-size: 16px; line-height: 1.8; margin: 20px 0; }
            .source-link { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            .cta-button { background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🚨 URGENT IMMIGRATION ALERT</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Critical immigration law update</p>
          </div>
          
          <div class="urgent-banner">
            ⚠️ URGENT UPDATE: This news may significantly impact your immigration status or applications
          </div>
          
          <div class="content">
            ${firstName ? `<p>Hi ${firstName},</p>` : '<p>Hello,</p>'}
            
            <span class="category-badge">${newsCategory.toUpperCase()}</span>
            
            <h2 class="news-title">${newsTitle}</h2>
            
            <div class="news-summary">
              <strong>Summary:</strong> ${newsSummary}
            </div>
            
            <div class="news-content">${newsContent}</div>
            
            ${sourceUrl ? `<a href="${sourceUrl}" class="source-link">📰 Read Full Article</a>` : ''}
            
            <a href="https://xybpgorbkiaitimxiqej.supabase.co/news" class="cta-button">View All Immigration News</a>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <p style="margin: 0; color: #dc2626; font-weight: bold;">⚡ Action Required:</p>
              <p style="margin: 5px 0 0 0; color: #991b1b;">We recommend consulting with an immigration attorney if this update affects your situation.</p>
            </div>
            
            <div class="footer">
              <p>You're receiving this urgent alert because you subscribed to Immigro immigration news alerts and selected email notifications during onboarding.</p>
              <p>Want to change your notification preferences? <a href="https://xybpgorbkiaitimxiqej.supabase.co/profile">Update your settings</a></p>
              <p>© 2024 Immigro. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Immigro Urgent Alerts <urgent@immigro.co>",
      to: [to],
      subject: `🚨 URGENT: ${newsTitle}`,
      html: emailHtml,
    });

    console.log("Urgent alert email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-urgent-alert-email function:", error);
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
