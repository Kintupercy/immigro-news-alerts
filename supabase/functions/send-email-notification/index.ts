import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'newsletter' | 'urgent' | 'general';
  content: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, content }: EmailRequest = await req.json();

    let htmlContent = '';

    if (type === 'newsletter') {
      // Newsletter template
      const categoryHighlightsHtml = Object.entries(content.categoryHighlights || {})
        .map(([category, articles]: [string, any]) => `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 10px; text-transform: capitalize;">${category.replace('-', ' ')}</h3>
            <ul style="margin: 0; padding-left: 20px;">
              ${Array.isArray(articles) ? articles.slice(0, 3).map((article: any) => `
                <li style="margin-bottom: 8px;">
                  <strong>${article.title}</strong>
                  ${article.summary ? `<br><span style="color: #6b7280; font-size: 14px;">${article.summary}</span>` : ''}
                </li>
              `).join('') : ''}
            </ul>
          </div>
        `).join('');

      htmlContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">ImmigroNews Weekly Roundup</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your trusted source for immigration updates</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            ${content.firstName ? `<p style="font-size: 16px; margin-bottom: 20px;">Hello ${content.firstName},</p>` : ''}
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #1f2937; margin-top: 0;">Executive Summary</h2>
              <p style="margin-bottom: 0; color: #374151;">${content.executiveSummary}</p>
            </div>

            ${content.weeklyStats ? `
            <div style="display: flex; justify-content: space-around; margin-bottom: 25px; text-align: center;">
              <div style="padding: 15px;">
                <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${content.weeklyStats.totalArticles}</div>
                <div style="color: #6b7280; font-size: 14px;">Total Articles</div>
              </div>
              <div style="padding: 15px;">
                <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${content.weeklyStats.urgentNews}</div>
                <div style="color: #6b7280; font-size: 14px;">Urgent Updates</div>
              </div>
              <div style="padding: 15px;">
                <div style="font-size: 24px; font-weight: bold; color: #059669;">${content.weeklyStats.categories}</div>
                <div style="color: #6b7280; font-size: 14px;">Categories</div>
              </div>
            </div>
            ` : ''}

            <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Category Highlights</h2>
            ${categoryHighlightsHtml}

            ${content.importantDevelopments && content.importantDevelopments.length > 0 ? `
            <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Most Important Developments</h2>
            <ul style="color: #374151;">
              ${content.importantDevelopments.map((item: string) => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
            </ul>
            ` : ''}

            ${content.lookingAhead ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 25px;">
              <h2 style="color: #92400e; margin-top: 0;">Looking Ahead</h2>
              <p style="margin-bottom: 0; color: #78350f;">${content.lookingAhead}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <a href="https://immigronews.com/news" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Visit ImmigroNews</a>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>You're receiving this because you subscribed to ImmigroNews weekly updates.</p>
            <p>© 2025 ImmigroNews. All rights reserved.</p>
          </div>
        </div>
      `;
    } else {
      // Simple template for other types
      htmlContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="padding: 20px;">
            ${content.firstName ? `<p>Hello ${content.firstName},</p>` : ''}
            <div>${content.message || content}</div>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "ImmigroNews <news@immigronews.com>",
      to: [to],
      subject: subject,
      html: htmlContent,
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