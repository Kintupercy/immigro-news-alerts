
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SecureForm } from "@/components/SecureForm";
import { HoneypotField } from "@/components/HoneypotField";
import { enhancedRateLimiter } from "@/utils/enhancedRateLimiter";
import { securityMonitor, generateClientFingerprint } from "@/utils/securityMonitoring";

const NewsletterSubscription = () => {
  const [email, setEmail] = useState("");
  const [honeypotValue, setHoneypotValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (data: any, csrfToken: string) => {
    const clientId = generateClientFingerprint();
    
    // Check honeypot field
    if (honeypotValue.trim() !== '') {
      securityMonitor.logSecurityEvent({
        type: 'honeypot_triggered',
        clientId,
        details: { form: 'newsletter_subscription' }
      });
      toast({
        title: "Error",
        description: "Invalid submission detected.",
        variant: "destructive",
      });
      return;
    }
    
    // Rate limiting check
    const rateLimitCheck = enhancedRateLimiter.checkLimit(clientId, 'api');
    if (!rateLimitCheck.allowed) {
      securityMonitor.logSecurityEvent({
        type: 'rate_limit_exceeded',
        clientId,
        details: { 
          form: 'newsletter_subscription',
          remainingAttempts: rateLimitCheck.remainingAttempts 
        }
      });
      toast({
        title: "Too many requests",
        description: `Please wait ${Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000)} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = email.trim().toLowerCase();
    
    if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 254) {
      securityMonitor.logSecurityEvent({
        type: 'suspicious_input',
        clientId,
        details: { 
          form: 'newsletter_subscription',
          issue: 'invalid_email_format',
          emailLength: email.length 
        }
      });
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .insert([{ 
          email: sanitizedEmail,
          preferences: {
            source: 'newsletter_subscription',
            subscribed_from: 'home_page',
            client_fingerprint: clientId,
            subscription_timestamp: Date.now()
          }
        }]);

      if (error) {
        console.error('Subscription error details:', error);
        if (error.code === '23505') {
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our alerts.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        // Send welcome email
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: { 
              email: sanitizedEmail,
              firstName: null
            }
          });
        } catch (welcomeError) {
          console.error('Welcome email failed:', welcomeError);
          // Don't fail the subscription if welcome email fails
        }

        toast({
          title: "Successfully subscribed!",
          description: "You'll receive updates on US immigration law changes.",
        });
        setEmail("");
        setHoneypotValue("");
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later. If the problem persists, contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-navy-800 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-playfair text-3xl md:text-4xl font-bold text-cream-50 mb-4">
          Stay Updated with Immigration News
        </h2>
        
        <p className="text-lg text-cream-200 mb-8 max-w-2xl mx-auto">
          Get the latest US immigration law changes and policy updates delivered straight to your inbox
        </p>

        {/* Email subscription form */}
        <SecureForm onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <HoneypotField value={honeypotValue} onChange={setHoneypotValue} />
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400 h-5 w-5" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="pl-12 py-3 text-base bg-cream-50 border-navy-300 text-navy-800 placeholder-navy-400 focus:border-navy-700 focus:ring-navy-700 rounded-full"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !email.trim()}
            className="px-8 py-3 text-base bg-cream-50 text-navy-800 hover:bg-cream-100 font-medium transition-all duration-200 rounded-full disabled:opacity-50"
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </SecureForm>

        <p className="text-sm text-cream-300 mt-6">
          No spam, unsubscribe at any time
        </p>
      </div>
    </section>
  );
};

export default NewsletterSubscription;
