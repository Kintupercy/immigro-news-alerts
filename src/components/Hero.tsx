
import { useState, useEffect } from "react";
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toast } = useToast();

  // Preload hero background image
  useEffect(() => {
    const img = new Image();
    img.src = '/lovable-uploads/hero-background.png';
    img.onload = () => setImageLoaded(true);
  }, []);

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
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {/* Placeholder background while image loads */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream-50 via-cream-100 to-stone-100" />
        
        {/* Actual background image with fade-in */}
        <div
          role="img"
          aria-label="Scenic background representing the American immigration journey"
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: 'url(/lovable-uploads/hero-background.png)' }}
        />
        
        {/* Semi-transparent overlay for text readability */}
        <div className="absolute inset-0 bg-cream-50/80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-medium text-navy-900 mb-8 leading-tight">
            <span className="font-bold">Latest US Immigration News</span>
            <br />
            <span className="text-navy-800 font-bold">& Law Updates, Daily</span>
          </h1>

          <p className="text-lg md:text-xl text-navy-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Immigration updates today from official sources including USCIS, DHS, the White House, and the Federal Register, plus visa policy changes, urgent alerts, and free legal aid matching.
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
