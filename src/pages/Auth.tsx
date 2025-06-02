
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Successfully subscribed!",
          description: "You'll receive the latest immigration news updates.",
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-navy-800">
            ImmigrowNews
          </CardTitle>
          <p className="text-muted-foreground">
            Your trusted source for immigration news and legal assistance
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="newsletter" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="newsletter">Newsletter Signup</TabsTrigger>
              <TabsTrigger value="legal">Legal Services</TabsTrigger>
            </TabsList>
            
            <TabsContent value="newsletter" className="space-y-4">
              <div className="text-center space-y-2">
                <Mail className="h-12 w-12 mx-auto text-navy-600" />
                <h3 className="text-xl font-semibold">Stay Informed</h3>
                <p className="text-muted-foreground">
                  Get breaking immigration news and policy updates delivered to your inbox
                </p>
              </div>
              
              <form onSubmit={handleNewsletterSignup} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Subscribing..." : "Subscribe to Newsletter"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Free newsletter • No spam • Unsubscribe anytime
                </p>
              </form>
            </TabsContent>

            <TabsContent value="legal" className="space-y-4">
              <div className="text-center space-y-2">
                <MessageSquare className="h-12 w-12 mx-auto text-navy-600" />
                <h3 className="text-xl font-semibold">Need Legal Help?</h3>
                <p className="text-muted-foreground">
                  Connect with trusted immigration lawyers for personalized assistance
                </p>
              </div>
              
              <div className="space-y-3">
                <Link to="/contact">
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Immigration Lawyers
                  </Button>
                </Link>
                
                <Link to="/resources">
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    View Legal Resources
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-navy-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
