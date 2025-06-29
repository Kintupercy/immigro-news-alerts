
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
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
      // Newsletter template - back to original format without category highlights
      htmlContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">This Week's Immigration News</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your trusted source for immigration updates</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            ${content.firstName ? `<p style="font-size: 16px; margin-bottom: 20px;">Hello${content.firstName ? ` ${content.firstName}` : ''}!</p>` : '<p style="font-size: 16px; margin-bottom: 20px;">Hello!</p>'}
            
            <p style="margin-bottom: 25px; color: #374151; font-size: 16px;">Here are this week's most important immigration news updates:</p>

            ${content.featuredArticles && content.featuredArticles.length > 0 ? 
              content.featuredArticles.map((article: any) => `
                <div style="border-left: 4px solid #1e40af; padding-left: 20px; margin-bottom: 25px;">
                  <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 18px; line-height: 1.3;">${article.title}</h3>
                  <p style="color: #6b7280; margin: 8px 0; font-size: 14px; text-transform: capitalize;">Category: ${article.category.replace('-', ' ')}</p>
                  <p style="color: #374151; margin: 8px 0 12px 0; line-height: 1.5;">${article.summary}</p>
                  <a href="${article.link}" style="color: #1e40af; text-decoration: none; font-weight: 500;">Read more →</a>
                </div>
              `).join('') 
              : ''}

            ${content.weeklyStats ? `
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
                <div style="padding: 10px; min-width: 120px;">
                  <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${content.weeklyStats.totalArticles}</div>
                  <div style="color: #6b7280; font-size: 14px;">Total Articles</div>
                </div>
                <div style="padding: 10px; min-width: 120px;">
                  <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${content.weeklyStats.urgentNews}</div>
                  <div style="color: #6b7280; font-size: 14px;">Urgent Updates</div>
                </div>
                <div style="padding: 10px; min-width: 120px;">
                  <div style="font-size: 24px; font-weight: bold; color: #059669;">${content.weeklyStats.categories}</div>
                  <div style="color: #6b7280; font-size: 14px;">Categories</div>
                </div>
              </div>
            </div>
            ` : ''}

            ${content.lookingAhead ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 25px;">
              <h2 style="color: #92400e; margin-top: 0; font-size: 18px;">Looking Ahead</h2>
              <p style="margin-bottom: 0; color: #78350f; line-height: 1.5;">${content.lookingAhead}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <a href="https://immigronews.com/news" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Visit ImmigroNews</a>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
              <p style="margin: 5px 0;">Stay informed with ImmigroNews. Reply to unsubscribe at any time.</p>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 5px 0;">Best regards,</p>
            <p style="margin: 5px 0;">The ImmigroNews Team</p>
            <p style="margin: 15px 0 5px 0;">© 2025 ImmigroNews. All rights reserved.</p>
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
