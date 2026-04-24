import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UrgentAlertRequest {
  to: string;
  newsTitle: string;
  newsContent: string;
  newsSummary?: string;
  newsCategory: string;
  sourceUrl?: string;
  firstName?: string;
  urgencyContext?: string;
}

// Constant-time string comparison to avoid leaking the service role key via timing.
const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

// Allow only http(s) URLs so we never render javascript: or data: links in emails.
const isSafeHttpUrl = (u: string | undefined): boolean => {
  if (!u) return false;
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

// Minimal HTML entity escaping for values interpolated into email templates.
const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authHeader = req.headers.get("authorization") ?? "";
  const presented = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!serviceKey || !presented || !safeEqual(presented, serviceKey)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const {
      to,
      newsTitle,
      newsContent,
      newsSummary,
      newsCategory,
      sourceUrl,
      firstName,
      urgencyContext,
    }: UrgentAlertRequest = await req.json();

    // Validate recipient and strip anything that could enable header injection.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!to || typeof to !== "string" || to.length > 254 || !emailRegex.test(to) || /[\r\n]/.test(to)) {
      return new Response(JSON.stringify({ error: "Invalid recipient" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Strip CR/LF from the subject portion to block email header injection.
    const safeTitleForSubject = (newsTitle ?? "").replace(/[\r\n]+/g, " ").slice(0, 200);

    // Escape all interpolated values to prevent HTML/link injection in email clients.
    const eTitle = escapeHtml((newsTitle ?? "").slice(0, 300));
    const eCategory = escapeHtml((newsCategory ?? "").replace("-", " "));
    const eSummary = newsSummary ? escapeHtml(newsSummary.slice(0, 2000)) : "";
    const eFirstName = firstName ? escapeHtml(firstName.slice(0, 50)) : "";
    const eUrgencyContext = urgencyContext ? escapeHtml(urgencyContext.slice(0, 1000)) : "";
    const safeSourceUrl = isSafeHttpUrl(sourceUrl) ? sourceUrl : undefined;
    const eSafeSourceUrl = safeSourceUrl ? escapeHtml(safeSourceUrl) : "";
    const paragraphsHtml = (newsContent ?? "")
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");

    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <!-- Urgent Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 25px; text-align: center;">
          <div style="font-size: 14px; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px;">🚨 URGENT IMMIGRATION ALERT</div>
          <h1 style="margin: 0; font-size: 24px;">Breaking Immigration News</h1>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          ${eFirstName ? `<p style="font-size: 16px; margin-bottom: 20px;">Hello ${eFirstName},</p>` : ''}

          <!-- Urgency Context -->
          ${eUrgencyContext ? `
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 25px;">
            <h3 style="color: #dc2626; margin-top: 0; font-size: 16px;">Why This Is Urgent:</h3>
            <p style="color: #7f1d1d; margin-bottom: 0;">${eUrgencyContext}</p>
          </div>
          ` : ''}

          <!-- News Content -->
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <div style="background: #f3f4f6; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
              <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">
                ${eCategory}
              </span>
            </div>

            <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">${eTitle}</h2>

            ${eSummary ? `
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <h4 style="color: #374151; margin-top: 0; font-size: 14px; font-weight: bold;">Summary:</h4>
              <p style="color: #4b5563; margin-bottom: 0;">${eSummary}</p>
            </div>
            ` : ''}

            <div style="color: #374151; font-size: 15px;">
              ${paragraphsHtml}
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin-bottom: 25px;">
            ${eSafeSourceUrl ? `
            <a href="${eSafeSourceUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Read Original Source
            </a>
            ` : ''}
            <a href="https://immigronews.com/news" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View All News
            </a>
          </div>
          
          <!-- Disclaimer -->
          <div style="background: #fffbeb; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <h4 style="color: #92400e; margin-top: 0; font-size: 14px;">⚠️ Important:</h4>
            <p style="color: #78350f; margin-bottom: 0; font-size: 13px;">
              This is breaking news and situations can change rapidly. Please consult with a qualified immigration attorney for advice specific to your situation. ImmigroNews provides information for educational purposes only.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p style="margin-bottom: 10px;">You're receiving this urgent alert because you have urgent immigration notifications enabled.</p>
          <p style="margin-bottom: 0;">© 2025 ImmigroNews. All rights reserved.</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "ImmigroNews Alerts <alerts@immigronews.com>",
      to: [to],
      subject: `🚨 URGENT: ${safeTitleForSubject}`,
      html: htmlContent,
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
      JSON.stringify({ error: "Failed to send urgent alert." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);