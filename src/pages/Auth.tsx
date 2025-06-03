
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MessageSquare, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [university, setUniversity] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !firstName || !lastName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .insert([{ 
          email,
          preferences: {
            firstName,
            lastName,
            university: university || null,
            urgentOnly: false,
          }
        }]);

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
        setFirstName("");
        setLastName("");
        setUniversity("");
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50">
      {/* Hero section with hands image */}
      <div className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="/lovable-uploads/a36972b3-15b7-449d-83ad-6973d47b689f.png" 
            alt="Diverse hands raised together" 
            className="w-full max-w-4xl h-auto opacity-20 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-stone-50 opacity-70"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <CardTitle className="text-3xl font-bold text-navy-800 mb-4">
            ImmigrowNews
          </CardTitle>
          <p className="text-muted-foreground">
            Your trusted source for immigration news and legal assistance
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-2xl">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
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

                  <div>
                    <Label htmlFor="university">
                      <GraduationCap className="w-4 h-4 inline mr-1" />
                      University/College (Optional)
                    </Label>
                    <Input
                      id="university"
                      type="text"
                      placeholder="Enter your university or college name"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      disabled={loading}
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
    </div>
  );
};

export default Auth;
