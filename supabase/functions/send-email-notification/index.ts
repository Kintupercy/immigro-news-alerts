
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  to: string;
  subject: string;
  title: string;
  content: string;
  category: string;
  isUrgent?: boolean;
  firstName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, title, content, category, isUrgent, firstName }: EmailNotificationRequest = await req.json();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px 20px; border-radius: 0 0 8px 8px; }
            .urgent-badge { background: #ef4444; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 15px; display: inline-block; }
            .category-badge { background: #e5e7eb; color: #374151; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 15px; display: inline-block; }
            .news-title { font-size: 24px; font-weight: bold; margin: 20px 0; color: #1e3a8a; }
            .news-content { font-size: 16px; line-height: 1.8; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            .cta-button { background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">📰 Immigro News Alert</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your personalized immigration news update</p>
          </div>
          
          <div class="content">
            ${firstName ? `<p>Hi ${firstName},</p>` : '<p>Hello,</p>'}
            
            ${isUrgent ? '<span class="urgent-badge">🚨 URGENT</span>' : ''}
            <span class="category-badge">${category.toUpperCase()}</span>
            
            <h2 class="news-title">${title}</h2>
            
            <div class="news-content">${content}</div>
            
            <a href="https://xybpgorbkiaitimxiqej.supabase.co" class="cta-button">Read More on Immigro</a>
            
            <div class="footer">
              <p>You're receiving this because you subscribed to Immigro immigration news alerts.</p>
              <p>Want to change your preferences? <a href="https://xybpgorbkiaitimxiqej.supabase.co/profile">Update your settings</a></p>
              <p>© 2024 Immigro. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Immigro <news@immigro.co>",
      to: [to],
      subject: `${isUrgent ? '🚨 URGENT: ' : ''}${subject}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email-notification function:", error);
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
