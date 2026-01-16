
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SecureForm } from "@/components/SecureForm";
import { HoneypotField } from "@/components/HoneypotField";
import { enhancedRateLimiter } from "@/utils/enhancedRateLimiter";
import { securityMonitor, generateClientFingerprint } from "@/utils/securityMonitoring";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [honeypotValue, setHoneypotValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (_data: Record<string, unknown>, _csrfToken: string) => {
    const clientId = generateClientFingerprint();
    
    // Check honeypot field
    if (honeypotValue.trim() !== '') {
      securityMonitor.logSecurityEvent({
        type: 'honeypot_triggered',
        clientId,
        details: { form: 'hero_subscription' }
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
          form: 'hero_subscription',
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
          form: 'hero_subscription',
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
            source: 'hero_subscription',
            subscribed_from: 'home_page_hero',
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
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Extended Full-Screen Background with cream gradient and enhanced faded effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50">
        {/* Enhanced curved overlay effects spanning full screen */}
        <div className="absolute inset-0">
          <svg
            className="absolute top-0 w-full h-96"
            viewBox="0 0 1200 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0L50 20C100 40 200 80 300 100C400 120 500 120 600 110C700 100 800 80 900 70C1000 60 1100 60 1150 60L1200 60V0H1150C1100 0 1000 0 900 0C800 0 700 0 600 0C500 0 400 0 300 0C200 0 100 0 50 0H0Z"
              fill="rgba(120, 113, 108, 0.12)"
            />
          </svg>
          <svg
            className="absolute bottom-0 w-full h-96"
            viewBox="0 0 1200 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 300L50 280C100 260 200 220 300 200C400 180 500 180 600 190C700 200 800 220 900 230C1000 240 1100 240 1150 240L1200 240V300H1150C1100 300 1000 300 900 300C800 300 700 300 600 300C500 300 400 300 300 300C200 300 100 300 50 300H0Z"
              fill="rgba(120, 113, 108, 0.12)"
            />
          </svg>
        </div>
        
        {/* Extended flowing wave effects covering full screen */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 300C300 150 600 450 1200 300V800H0V300Z"
              fill="rgba(120, 113, 108, 0.08)"
            />
          </svg>
        </div>
        
        <div className="absolute top-1/4 left-0 w-full h-full">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 200C400 100 800 350 1200 200V600H0V200Z"
              fill="rgba(168, 162, 158, 0.06)"
            />
          </svg>
        </div>
        
        <div className="absolute top-1/2 left-0 w-full h-full">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 150C350 50 750 250 1200 150V400H0V150Z"
              fill="rgba(168, 162, 158, 0.04)"
            />
          </svg>
        </div>
        
        {/* Additional full-screen wave layers for more coverage */}
        <div className="absolute top-3/4 left-0 w-full h-full">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 100C250 25 550 175 1200 100V200H0V100Z"
              fill="rgba(120, 113, 108, 0.05)"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-medium text-navy-900 mb-8 leading-tight">
            <span className="font-bold">Stay Informed on all</span>
            <br />
            <span className="text-navy-800 font-bold">US Immigration Law</span>
          </h1>
          
          <p className="text-lg md:text-xl text-navy-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Get instant email alerts for urgent and breaking US Immigration policy and law changes
          </p>

          <div className="flex flex-col items-center gap-6">
            {/* Email subscription form */}
            <SecureForm onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
              <HoneypotField value={honeypotValue} onChange={setHoneypotValue} />
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-navy-400 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="Enter your email for alerts"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-12 py-3 text-base bg-white border-navy-300 text-navy-800 placeholder-navy-400 focus:border-navy-700 focus:ring-navy-700 rounded-full"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !email.trim()}
                className="px-8 py-3 text-base bg-navy-800 text-cream-50 hover:bg-navy-700 font-medium transition-all duration-200 rounded-full disabled:opacity-50"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </SecureForm>

            {/* Get Started button */}
            <Button asChild size="lg" className="px-8 py-3 text-base bg-navy-800 text-cream-50 hover:bg-navy-700 font-medium transition-all duration-200 rounded-full">
              <Link to="/news" className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Browse News
              </Link>
            </Button>
          </div>

          <p className="text-sm text-navy-500 mt-6">
            Join 3,000+ getting urgent immigration law alerts in their inbox
          </p>
        </div>
      </div>

    </section>
  );
};

export default Hero;
