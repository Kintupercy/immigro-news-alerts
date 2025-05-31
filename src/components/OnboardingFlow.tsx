
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User } from "@supabase/supabase-js";
import { ChevronRight, Mail, MessageSquare, Check, Crown } from "lucide-react";
import { useProMembership } from "@/hooks/useProMembership";
import UpgradeModal from "@/components/UpgradeModal";

interface OnboardingFlowProps {
  user: User;
  onComplete: () => void;
}

const immigrationCategories = [
  { slug: "international-students", name: "International Students (F-1, J-1, M-1)" },
  { slug: "employment-based", name: "Employment-Based (H-1B, L-1, TN)" },
  { slug: "family-based", name: "Family-Based Immigration" },
  { slug: "green-card", name: "Green Card Applicants/Holders" },
  { slug: "citizenship", name: "Citizenship Applicants" },
  { slug: "refugees-asylees", name: "Refugees/Asylees/DACA/TPS" },
  { slug: "investors", name: "Investors/Entrepreneurs" },
  { slug: "religious-workers", name: "Religious Workers" },
  { slug: "undocumented", name: "Undocumented & Mixed-Status Families" },
  { slug: "temporary-visitors", name: "Temporary Visitors" }
];

const OnboardingFlow = ({ user, onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: false,
    push: true,
    urgent_only: false
  });
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { toast } = useToast();
  const { isProMember, loading: proLoading } = useProMembership(user);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories(prev => 
      prev.includes(categorySlug)
        ? prev.filter(cat => cat !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const handleSMSToggle = (checked: boolean) => {
    if (checked && !isProMember) {
      toast({
        title: "Pro Feature",
        description: "SMS notifications are available for Pro members only. Upgrade to Pro to receive text alerts.",
        variant: "default"
      });
      setUpgradeModalOpen(true);
      return;
    }
    setNotificationPreferences(prev => ({ ...prev, sms: checked }));
  };

  const handleUrgentOnlyToggle = (checked: boolean) => {
    if (checked && !isProMember) {
      toast({
        title: "Pro Feature", 
        description: "Urgent news only mode is available for Pro members. Upgrade to Pro for priority news filtering.",
        variant: "default"
      });
      setUpgradeModalOpen(true);
      return;
    }
    setNotificationPreferences(prev => ({ ...prev, urgent_only: checked }));
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedCategories.length === 0) {
      toast({
        title: "Please select categories",
        description: "Choose at least one immigration category you're interested in.",
        variant: "destructive"
      });
      return;
    }

    if (currentStep === 2 && notificationPreferences.sms && !phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number for SMS notifications.",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      console.log('Starting onboarding completion for user:', user.id);
      console.log('Selected categories:', selectedCategories);
      console.log('Phone number:', phoneNumber);
      console.log('Notification preferences:', notificationPreferences);

      // Clean phone number - remove formatting for storage
      const cleanPhoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      // Prepare the update data - ensure Pro features are disabled for non-Pro users
      const finalNotificationPrefs = {
        ...notificationPreferences,
        sms: isProMember ? notificationPreferences.sms : false,
        urgent_only: isProMember ? notificationPreferences.urgent_only : false
      };

      const updateData = {
        phone_number: (cleanPhoneNumber && isProMember) ? cleanPhoneNumber : null,
        preferred_categories: selectedCategories,
        notification_preferences: finalNotificationPrefs,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      };

      console.log('Update data:', updateData);

      // Check if profile exists first
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing profile:', fetchError);
        throw fetchError;
      }

      let result;
      if (existingProfile) {
        // Update existing profile
        console.log('Updating existing profile');
        result = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('user_id', user.id);
      } else {
        // Create new profile
        console.log('Creating new profile');
        result = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
            ...updateData
          });
      }

      console.log('Database operation result:', result);

      if (result.error) {
        console.error('Database error:', result.error);
        throw result.error;
      }

      console.log('Onboarding completed successfully');

      toast({
        title: "Welcome to Immigro!",
        description: "Your preferences have been saved. You'll start receiving personalized immigration news."
      });

      // Call onComplete after successful database update
      onComplete();
      
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      
      let errorMessage = "Please try again.";
      if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: "Error saving preferences",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Don't format if empty
    if (!cleaned) return '';
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <>
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
        <Card className="w-full max-w-2xl relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-navy-800">
              Welcome to Immigro!
            </CardTitle>
            <p className="text-muted-foreground">
              Let's personalize your immigration news experience
            </p>
            <Progress value={progress} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    What immigration topics interest you?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select all categories that apply to you. We'll send you relevant news and updates.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {immigrationCategories.map((category) => (
                    <div
                      key={category.slug}
                      className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedCategories.includes(category.slug) 
                          ? 'border-navy-500 bg-navy-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => toggleCategory(category.slug)}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.slug)}
                        onChange={() => toggleCategory(category.slug)}
                      />
                      <Label className="cursor-pointer font-medium">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {selectedCategories.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map(slug => {
                        const category = immigrationCategories.find(c => c.slug === slug);
                        return (
                          <Badge key={slug} variant="secondary">
                            {category?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    How would you like to receive notifications?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose your preferred notification methods for immigration news updates.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-navy-600" />
                      <div>
                        <Label className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates via email
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={notificationPreferences.email}
                      onCheckedChange={(checked) => 
                        setNotificationPreferences(prev => ({ ...prev, email: checked as boolean }))
                      }
                    />
                  </div>

                  <div className={`flex items-center justify-between p-4 border rounded-lg ${!isProMember ? 'opacity-50 bg-gray-50' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-navy-600" />
                      <div>
                        <Label className="font-medium flex items-center gap-2">
                          SMS Notifications
                          {isProMember ? (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Pro</Badge>
                          ) : (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive urgent updates via text message
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={notificationPreferences.sms && isProMember}
                      onCheckedChange={handleSMSToggle}
                      disabled={!isProMember}
                    />
                  </div>

                  {notificationPreferences.sms && isProMember && (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        maxLength={14}
                      />
                      <p className="text-xs text-muted-foreground">
                        Required for SMS notifications. We'll only use this for immigration news updates.
                      </p>
                    </div>
                  )}

                  <div className={`flex items-center justify-between p-4 border rounded-lg ${!isProMember ? 'opacity-50 bg-gray-50' : ''}`}>
                    <div>
                      <Label className="font-medium flex items-center gap-2">
                        Urgent News Only
                        {isProMember ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Pro</Badge>
                        ) : (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Only receive notifications for urgent immigration news
                      </p>
                    </div>
                    <Checkbox
                      checked={notificationPreferences.urgent_only && isProMember}
                      onCheckedChange={handleUrgentOnlyToggle}
                      disabled={!isProMember}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">You're all set!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your preferences have been configured. Here's what you'll receive:
                  </p>
                </div>

                <div className="text-left space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm">Categories:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCategories.map(slug => {
                        const category = immigrationCategories.find(c => c.slug === slug);
                        return (
                          <Badge key={slug} variant="outline" className="text-xs">
                            {category?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm">Notifications:</h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      {notificationPreferences.email && "✓ Email"}
                      {notificationPreferences.email && notificationPreferences.sms && isProMember && " • "}
                      {notificationPreferences.sms && isProMember && `✓ SMS (${phoneNumber})`}
                      {notificationPreferences.urgent_only && isProMember && " • Urgent only"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button onClick={handleNextStep} className="ml-auto" disabled={loading}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading} className="ml-auto">
                  {loading ? "Saving..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <UpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen}
      />
    </>
  );
};

export default OnboardingFlow;
