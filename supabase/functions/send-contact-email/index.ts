
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, subject, message }: ContactFormRequest = await req.json();

    // Send email to the company
    const companyEmailResponse = await resend.emails.send({
      from: "Contact Form <contact@immigro.co>",
      to: ["support@immigro.com"],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #1e3a8a; }
              .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #1e3a8a; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📧 New Contact Form Submission</h1>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="label">From:</div>
                <div class="value">${firstName} ${lastName}</div>
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
              </div>
              
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
              </div>
              
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message}</div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "Immigro Support <support@immigro.co>",
      to: [email],
      subject: "We received your message - Immigro Support",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Message Received</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px 20px; border-radius: 0 0 8px 8px; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
              .cta-button { background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✅ Message Received</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for contacting Immigro</p>
            </div>
            
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>Thank you for reaching out to us! We have successfully received your message regarding: <strong>"${subject}"</strong></p>
              
              <p>Our team will review your inquiry and get back to you within 24 hours during business days (Monday - Friday, 9 AM - 6 PM EST).</p>
              
              <p>In the meantime, feel free to explore our latest immigration news and resources on our website.</p>
              
              <a href="https://xybpgorbkiaitimxiqej.supabase.co" class="cta-button">Visit Immigro</a>
              
              <div class="footer">
                <p>If you have any urgent concerns, please call us at +1 (555) 123-4567</p>
                <p>Best regards,<br>The Immigro Support Team</p>
                <p>© 2024 Immigro. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Contact emails sent successfully:", { companyEmailResponse, userEmailResponse });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Your message has been sent successfully. We'll get back to you within 24 hours." 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send message. Please try again or contact us directly." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
