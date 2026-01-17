
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
  csrf_token?: string;
  csrf_timestamp?: number;
}

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Enhanced CSRF token validation with timing-safe comparison
const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken || token.length !== expectedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  return result === 0;
};

// Rate limiting function
const checkRateLimit = (identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
};

// Get client identifier from request
const getClientIdentifier = (req: Request): string => {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         req.headers.get('cf-connecting-ip') ||
         'unknown';
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, subject, message, csrf_token, csrf_timestamp }: ContactFormRequest = await req.json();
    
    // Get client identifier for rate limiting
    const clientId = getClientIdentifier(req);
    
    // Rate limiting check
    if (!checkRateLimit(clientId)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Too many requests. Please wait before trying again." 
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Enhanced CSRF token validation
    if (!csrf_token || csrf_token.length !== 64) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid security token" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Check token expiration (1 hour limit)
    if (csrf_timestamp) {
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - csrf_timestamp > oneHour) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Security token expired. Please refresh the page." 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }
    
    // Input validation and sanitization
    if (!firstName || !lastName || !email || !subject || !message) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "All fields are required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Sanitize inputs
    const sanitizedData = {
      firstName: firstName.trim().slice(0, 50),
      lastName: lastName.trim().slice(0, 50),
      email: email.trim().toLowerCase().slice(0, 254),
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 5000)
    };
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid email address" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send email to the company
    const companyEmailResponse = await resend.emails.send({
      from: "Contact Form <contact@immigronews.com>",
      to: ["support@immigronews.com"],
      subject: `New Contact Form Submission: ${sanitizedData.subject}`,
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
                <div class="value">${sanitizedData.firstName} ${sanitizedData.lastName}</div>
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${sanitizedData.email}</div>
              </div>
              
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${sanitizedData.subject}</div>
              </div>
              
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${sanitizedData.message}</div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "ImmigrowNews Support <support@immigronews.com>",
      to: [sanitizedData.email],
      subject: "We received your message - ImmigrowNews Support",
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
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for contacting ImmigrowNews</p>
            </div>
            
            <div class="content">
              <p>Hi ${sanitizedData.firstName},</p>
              
              <p>Thank you for reaching out to us! We have successfully received your message regarding: <strong>"${sanitizedData.subject}"</strong></p>
              
              <p>Our team will review your inquiry and get back to you within 24 hours during business days (Monday - Friday, 9 AM - 6 PM EST).</p>
              
              <p>In the meantime, feel free to explore our latest immigration news and resources on our website.</p>
              
              <a href="https://immigronews.com" class="cta-button">Visit ImmigrowNews</a>
              
              <div class="footer">
                <p>If you have any urgent concerns, please call us at +1 (555) 123-4567</p>
                <p>Best regards,<br>The ImmigrowNews Support Team</p>
                <p>© 2024 ImmigrowNews. All rights reserved.</p>
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
