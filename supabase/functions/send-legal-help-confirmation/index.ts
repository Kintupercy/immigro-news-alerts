
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  caseId: string;
  stayAnonymous: boolean;
  freeConsult: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, caseId, stayAnonymous, freeConsult }: ConfirmationEmailRequest = await req.json();

    // Only send email if user provided an email and didn't choose to stay anonymous
    if (!email || stayAnonymous) {
      return new Response(JSON.stringify({ message: "No email sent - anonymous request" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Request Confirmation - ImmigrowNews</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px 20px; border-radius: 0 0 8px 8px; }
            .case-id { background: white; border: 2px solid #10b981; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Thank you — we've received your request</h1>
          </div>
          
          <div class="content">
            <p><strong>We'll reach out to trusted immigration professionals on your behalf.</strong></p>
            
            <p>Since you provided your email, we'll follow up discreetly within 1–2 days.</p>
            
            <div class="case-id">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Case ID:</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #10b981;">${caseId}</p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">Save this ID to check your request status later</p>
            </div>
            
            ${freeConsult ? '<p><strong>Free Consultation:</strong> You requested a free 10-minute consultation. The lawyer will contact you via secure email to arrange this.</p>' : ''}
            
            <p><strong>What happens next:</strong></p>
            <ul style="color: #4b5563;">
              <li>We'll review your request within 24 hours</li>
              <li>You'll be matched with a vetted immigration lawyer in your area</li>
              <li>The lawyer will contact you discreetly via email with next steps</li>
            </ul>
            
            <div class="footer">
              <p>This is a secure, confidential communication from ImmigrowNews.</p>
              <p>© 2024 ImmigrowNews. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ImmigrowNews Legal Help <legal@immigrownews.co>",
      to: [email],
      subject: `Request Confirmed - Case ${caseId} | ImmigrowNews Legal Help`,
      html: emailHtml,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-legal-help-confirmation function:", error);
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
