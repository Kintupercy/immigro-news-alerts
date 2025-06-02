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
  
  // Maximum categories for free users
  const FREE_USER_CATEGORY_LIMIT = 3;

  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categorySlug);
      
      if (isSelected) {
        // Remove if already selected
        return prev.filter(cat => cat !== categorySlug);
      } else {
        // Check if we're at the limit for free users
        if (!isProMember && prev.length >= FREE_USER_CATEGORY_LIMIT) {
          toast({
            title: "Category limit reached",
            description: `Free users can select up to ${FREE_USER_CATEGORY_LIMIT} categories. Upgrade to Pro to unlock all categories.`,
            variant: "default"
          });
          setUpgradeModalOpen(true);
          return prev;
        }
        // Add if not selected
        return [...prev, categorySlug];
      }
    });
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
      console.log('User email:', user.email);
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

      // Use a more robust approach - first try to upsert the profile
      const { data: upsertResult, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          email_verified: user.email_confirmed_at ? true : false,
          email_verified_at: user.email_confirmed_at || null,
          ...updateData
        }, {
          onConflict: 'user_id'
        })
        .select();

      console.log('Upsert result:', upsertResult);
      console.log('Upsert error:', upsertError);

      if (upsertError) {
        console.error('Upsert error details:', upsertError);
        throw upsertError;
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
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      let errorMessage = "Please try again.";
      if (error?.message) {
        if (error.message.includes('infinite recursion')) {
          errorMessage = "Database configuration issue detected. Please contact support.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
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

  const handleUpgradeClick = () => {
    setUpgradeModalOpen(true);
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
                    {!isProMember ? (
                      <>Select up to {FREE_USER_CATEGORY_LIMIT} categories that apply to you. <span className="font-medium text-emerald-600">Upgrade to Pro to unlock all categories.</span></>
                    ) : (
                      "Select all categories that apply to you. We'll send you relevant news and updates."
                    )}
                  </p>
                  {!isProMember && (
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                        Free Plan: {selectedCategories.length}/{FREE_USER_CATEGORY_LIMIT} selected
                      </Badge>
                      <Button 
                        onClick={handleUpgradeClick}
                        variant="outline"
                        size="sm"
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {immigrationCategories.map((category) => {
                    const isSelected = selectedCategories.includes(category.slug);
                    const isDisabled = !isProMember && !isSelected && selectedCategories.length >= FREE_USER_CATEGORY_LIMIT;
                    
                    return (
                      <div
                        key={category.slug}
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-navy-500 bg-navy-50' 
                            : isDisabled
                            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => !isDisabled && toggleCategory(category.slug)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && toggleCategory(category.slug)}
                        />
                        <Label className={`cursor-pointer font-medium ${isDisabled ? 'text-gray-400' : ''}`}>
                          {category.name}
                        </Label>
                        {isDisabled && (
                          <Crown className="w-4 h-4 text-yellow-500 ml-auto" />
                        )}
                      </div>
                    );
                  })}
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

                  {/* Pro Features Section */}
                  {!isProMember && (
                    <div className="p-4 border-2 border-emerald-200 rounded-lg bg-emerald-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-emerald-800">Unlock Pro Features</span>
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">$4.99/month</Badge>
                        </div>
                        <Button 
                          onClick={handleUpgradeClick}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          size="sm"
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          Upgrade to Pro
                        </Button>
                      </div>
                      <p className="text-sm text-emerald-700 mb-2">
                        Get SMS notifications, urgent news filtering, and more premium features!
                      </p>
                    </div>
                  )}

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
