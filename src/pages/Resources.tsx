
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Users, Clock, Star, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Resources = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleWaitlistSignup = async (e: React.FormEvent) => {
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
        .insert([{ 
          email,
          preferences: {
            waitlist: 'legal-resources',
            subscribedAt: new Date().toISOString()
          }
        }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already subscribed",
            description: "This email is already on our waitlist.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Successfully joined the waitlist!",
          description: "We'll notify you when our legal resources become available.",
        });
        setEmail("");
      }
    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "Signup failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Clock className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Legal Resources Coming Soon
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We're building partnerships with trusted immigration lawyers to provide you with the best legal guidance.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              What to Expect
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Users className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Vetted Lawyers
                </h3>
                <p className="text-gray-600">
                  Carefully selected immigration attorneys with proven track records
                </p>
              </div>
              
              <div className="text-center">
                <Star className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Specialized Expertise
                </h3>
                <p className="text-gray-600">
                  Lawyers specializing in different immigration categories and situations
                </p>
              </div>
              
              <div className="text-center">
                <Clock className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quick Matching
                </h3>
                <p className="text-gray-600">
                  Fast connections to the right lawyer for your specific needs
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get Notified When We Launch
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to know when our legal resources become available.
            </p>
            
            <form onSubmit={handleWaitlistSignup} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-12 py-3 text-base bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 text-base bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-colors rounded-lg disabled:opacity-50"
              >
                {isLoading ? "Joining..." : "Join the Waitlist"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Resources;
