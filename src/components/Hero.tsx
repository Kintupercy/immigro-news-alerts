
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .insert([{ email }]);

      if (error) {
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
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const universities = [
    { name: "Harvard University", logo: "/lovable-uploads/e45200f2-c4b5-48f4-88d4-4ce3b18bd012.png" },
    { name: "Cornell University", logo: "/lovable-uploads/cf72dc3c-7e9d-4a5c-9d01-477501a41c2e.png" },
    { name: "University of Illinois", logo: "/lovable-uploads/3859436f-d29a-443e-991f-fe3ae3961d36.png" },
    { name: "UC Davis", logo: "/lovable-uploads/1f23da35-19d2-47d0-a4e0-1644b8e94fc4.png" },
    { name: "Loyola University Chicago", logo: "/lovable-uploads/02db7caf-1095-48fc-abc7-6c31981610ae.png" },
    { name: "Washington University", logo: "/lovable-uploads/204eaa9f-fc04-428b-b92c-a47c379fa80a.png" },
    { name: "NYU", logo: "/lovable-uploads/9d48cc04-99c8-4171-92ad-a2328340a76b.png" }
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Extended Background with cream gradient and enhanced faded effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50">
        {/* Enhanced curved overlay effects */}
        <div className="absolute inset-0">
          <svg
            className="absolute top-0 w-full h-80"
            viewBox="0 0 1200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0L50 15C100 30 200 60 300 75C400 90 500 90 600 82.5C700 75 800 60 900 52.5C1000 45 1100 45 1150 45L1200 45V0H1150C1100 0 1000 0 900 0C800 0 700 0 600 0C500 0 400 0 300 0C200 0 100 0 50 0H0Z"
              fill="rgba(120, 113, 108, 0.08)"
            />
          </svg>
          <svg
            className="absolute bottom-0 w-full h-80"
            viewBox="0 0 1200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 200L50 185C100 170 200 140 300 125C400 110 500 110 600 117.5C700 125 800 140 900 147.5C1000 155 1100 155 1150 155L1200 155V200H1150C1100 200 1000 200 900 200C800 200 700 200 600 200C500 200 400 200 300 200C200 200 100 200 50 200H0Z"
              fill="rgba(120, 113, 108, 0.08)"
            />
          </svg>
        </div>
        {/* Enhanced flowing wave effects */}
        <div className="absolute top-1/4 left-0 w-full h-96">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 200C300 100 600 300 1200 200V400H0V200Z"
              fill="rgba(120, 113, 108, 0.06)"
            />
          </svg>
        </div>
        <div className="absolute top-1/2 left-0 w-full h-96">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 150C400 50 800 250 1200 150V400H0V150Z"
              fill="rgba(168, 162, 158, 0.04)"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-medium text-slate-800 mb-6 leading-tight">
            Stay Informed on all
            <br />
            <span className="text-slate-700 font-bold">US Immigration Law</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Get 24/7 alerts and news on all US Immigration policy and law changes
          </p>

          {/* Email subscription form */}
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12 py-3 text-base bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-slate-700 focus:ring-slate-700 rounded-full"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="px-8 py-3 text-base bg-slate-800 text-white hover:bg-slate-700 font-medium transition-all duration-200 rounded-full disabled:opacity-50"
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>

          <p className="text-sm text-slate-500 mt-6">
            Join 10,000+ staying updated on US immigration law changes
          </p>
        </div>
      </div>

      {/* University Trust Ticker */}
      <div className="relative z-10 bg-slate-800/90 backdrop-blur-sm py-6 border-t border-slate-700/20">
        <div className="text-center mb-4">
          <p className="text-amber-100 text-sm font-medium">
            Trusted by students at these institutions
          </p>
        </div>
        
        <div className="overflow-hidden whitespace-nowrap">
          <div className="inline-flex animate-[scroll_30s_linear_infinite]">
            {/* First set of universities */}
            {universities.map((university, index) => (
              <div
                key={`first-${index}`}
                className="inline-flex items-center mx-8 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 p-1">
                  <img 
                    src={university.logo} 
                    alt={university.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-white/90 text-sm font-medium whitespace-nowrap">
                  {university.name}
                </span>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {universities.map((university, index) => (
              <div
                key={`second-${index}`}
                className="inline-flex items-center mx-8 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 p-1">
                  <img 
                    src={university.logo} 
                    alt={university.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-white/90 text-sm font-medium whitespace-nowrap">
                  {university.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
