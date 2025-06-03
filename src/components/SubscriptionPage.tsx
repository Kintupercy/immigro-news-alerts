
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Check, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";

const SubscriptionPage = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [university, setUniversity] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const availableCategories = [
    { id: 'international-students', label: 'International Students (F-1, J-1, M-1)' },
    { id: 'employment-based', label: 'Employment-based Immigrants (H-1B, L-1, TN)' },
    { id: 'family-based', label: 'Family-based Immigrants' },
    { id: 'green-card', label: 'Green Card Applicants/Holders' },
    { id: 'citizenship', label: 'Citizenship Applicants' },
    { id: 'refugees-asylees', label: 'Refugees/Asylees/DACA/TPS Holders' },
    { id: 'investors', label: 'Investors/Entrepreneurs' },
    { id: 'temporary-visitors', label: 'Temporary Visitors' },
  ];

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setCategories(prev => [...prev, categoryId]);
    } else {
      setCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !firstName || !lastName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (categories.length === 0) {
      toast({
        title: "Select categories",
        description: "Please select at least one category to receive alerts.",
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
            firstName,
            lastName,
            university: university || null,
            categories,
            urgentOnly: false,
          }
        }]);

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
        setIsSubscribed(true);
        toast({
          title: "Successfully subscribed!",
          description: "You'll receive urgent immigration law alerts in your inbox.",
        });
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

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-navy-800">You're All Set!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-navy-600 mb-6">
                Thank you for subscribing! You'll receive urgent immigration law alerts directly in your inbox at <strong>{email}</strong>.
              </p>
              <p className="text-sm text-navy-500">
                Keep an eye out for important updates and breaking news about US immigration policy changes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50">
      <Header />
      
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
          <h1 className="font-playfair text-4xl font-bold text-navy-800 mb-4">
            Subscribe to Immigration Alerts
          </h1>
          <p className="text-lg text-navy-600">
            Get instant email notifications for urgent and breaking US Immigration law changes
          </p>
        </div>
      </div>

      <div className="pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Alert Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-navy-700 mb-2">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-navy-700 mb-2">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-navy-700 mb-2">
                    <GraduationCap className="w-4 h-4 inline mr-1" />
                    University/College (Optional)
                  </label>
                  <Input
                    id="university"
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Enter your university or college name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-4">
                    Select Categories (choose at least one) *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {availableCategories.map((category) => (
                      <div key={category.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={category.id}
                          checked={categories.includes(category.id)}
                          onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                        />
                        <label htmlFor={category.id} className="text-sm text-navy-700 cursor-pointer">
                          {category.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-navy-800 hover:bg-navy-700" 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Subscribing..." : "Subscribe to Alerts"}
                </Button>

                <p className="text-xs text-navy-500 text-center">
                  No spam, unsubscribe at any time. We only send urgent immigration law updates.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
