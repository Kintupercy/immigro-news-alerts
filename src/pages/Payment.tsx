
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Globe, Shield, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const proFeatures = [
    {
      icon: <Zap className="w-5 h-5 text-emerald-600" />,
      title: "Real-time Alerts",
      description: "Get instant notifications for breaking immigration news"
    },
    {
      icon: <Globe className="w-5 h-5 text-emerald-600" />,
      title: "Spanish Translation",
      description: "Read all content in your preferred language"
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-600" />,
      title: "All 13+ Categories",
      description: "Access every immigration topic and specialty area"
    }
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      console.log('Creating checkout session...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/lovable-uploads/5cb46a58-9c2c-4d5a-87d5-f03985e8aa30.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Fade overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
      
      {/* Content */}
      <Card className="w-full max-w-lg relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="w-12 h-12 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Upgrade to Pro
          </CardTitle>
          <p className="text-gray-600">
            Unlock premium features and get the most comprehensive immigration news experience
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                {feature.icon}
                <div>
                  <h4 className="font-medium text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">$4.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                30% off annual plan
              </Badge>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? "Creating checkout..." : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Start Pro Trial
                  </>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                Maybe later
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Cancel anytime. No questions asked.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
