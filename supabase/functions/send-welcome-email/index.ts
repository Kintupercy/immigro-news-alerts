import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName?: string;
}

// Rate limiter storage
const rateLimits = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (identifier: string, maxAttempts: number, windowMs: number): boolean => {
  const now = Date.now();
  const record = rateLimits.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimits.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName }: WelcomeEmailRequest = await req.json();

    // Server-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 254) {
      console.warn('Invalid email format attempted');
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Prevent email header injection
    const sanitizedEmail = email.trim().toLowerCase();
    if (sanitizedEmail.includes('\n') || sanitizedEmail.includes('\r')) {
      console.warn('Email header injection attempted:', sanitizedEmail);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize firstName (remove HTML, limit length)
    const sanitizedFirstName = firstName 
      ? firstName.trim().slice(0, 50).replace(/<[^>]*>/g, '') 
      : undefined;

    // Rate limiting (5 requests per 15 minutes per IP)
    const clientId = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    if (!checkRateLimit(clientId, 5, 15 * 60 * 1000)) {
      console.warn('Rate limit exceeded for:', clientId);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "ImmigrowNews <updates@immigronews.com>",
      to: [sanitizedEmail],
      subject: "Welcome to ImmigrowNews - Your Immigration News Source",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e3a8a; margin-bottom: 24px;">Welcome to ImmigrowNews!</h1>
          
          ${sanitizedFirstName ? `<p>Hi ${sanitizedFirstName},</p>` : '<p>Hello!</p>'}
          
          <p>Thank you for subscribing to ImmigrowNews, your trusted source for US immigration news and updates.</p>
          
          <p>You'll now receive:</p>
          <ul>
            <li>Breaking immigration news as it happens</li>
            <li>Daily digest of important updates</li>
            <li>Policy changes that affect you</li>
            <li>Legal insights and resources</li>
          </ul>
          
          <p>Stay informed and never miss an important immigration update again.</p>
          
          <div style="margin: 32px 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              You can unsubscribe at any time by replying to any of our emails.
            </p>
          </div>
          
          <p>Best regards,<br>The ImmigrowNews Team</p>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    // Don't expose internal error details to client
    return new Response(
      JSON.stringify({ error: "Failed to send welcome email. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);