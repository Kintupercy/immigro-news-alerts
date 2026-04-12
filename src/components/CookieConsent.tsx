
import { useState, useEffect } from "react";
import { safeGetItem, safeSetItem } from "@/utils/safeStorage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cookie, Settings, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = safeGetItem('immigro-cookie-consent');
    if (!cookieConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(cookieConsent);
        setPreferences(savedPreferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    savePreferences(allAccepted);
  };

  const acceptEssential = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    savePreferences(essentialOnly);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
    setShowPreferences(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    safeSetItem('immigro-cookie-consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    
    // Here you would typically initialize tracking scripts based on preferences
    if (prefs.analytics) {
      // Initialize Google Analytics or other analytics
      console.log('Analytics cookies enabled');
    }
    if (prefs.marketing) {
      // Initialize marketing pixels
      console.log('Marketing cookies enabled');
    }
    if (prefs.preferences) {
      // Initialize preference cookies
      console.log('Preference cookies enabled');
    }
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Cookie className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  We use cookies to enhance your experience
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  We use cookies and similar technologies to personalize content, provide social media 
                  features, analyze our traffic, and improve your experience on Immigro. By clicking 
                  "Accept All", you consent to our use of cookies.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button onClick={acceptAll} className="bg-emerald-600 hover:bg-emerald-700">
                    <Check className="w-4 h-4 mr-2" />
                    Accept All
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={acceptEssential}
                    className="border-gray-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Essential Only
                  </Button>
                  
                  <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700">
                        <Settings className="w-4 h-4 mr-2" />
                        Customize
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Cookie className="w-5 h-5 text-emerald-600" />
                          Cookie Preferences
                        </DialogTitle>
                        <DialogDescription>
                          Choose which cookies you'd like to accept. You can change these settings at any time.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Essential Cookies */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">Essential Cookies</h4>
                              <Badge variant="secondary">Required</Badge>
                            </div>
                            <Switch checked={true} disabled />
                          </div>
                          <p className="text-sm text-gray-600">
                            These cookies are necessary for the website to function and cannot be switched off. 
                            They are usually only set in response to actions made by you which amount to a request for services.
                          </p>
                        </div>
                        
                        <Separator />
                        
                        {/* Analytics Cookies */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Analytics Cookies</h4>
                            <Switch 
                              checked={preferences.analytics}
                              onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            These cookies help us understand how visitors interact with our website by collecting 
                            and reporting information anonymously. This helps us improve our service.
                          </p>
                        </div>
                        
                        <Separator />
                        
                        {/* Marketing Cookies */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Marketing Cookies</h4>
                            <Switch 
                              checked={preferences.marketing}
                              onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            These cookies are used to deliver advertisements more relevant to you and your interests. 
                            They may also be used to limit the number of times you see an advertisement.
                          </p>
                        </div>
                        
                        <Separator />
                        
                        {/* Preference Cookies */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Preference Cookies</h4>
                            <Switch 
                              checked={preferences.preferences}
                              onCheckedChange={(checked) => handlePreferenceChange('preferences', checked)}
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            These cookies enable the website to remember choices you make and provide enhanced, 
                            more personal features such as language preferences and personalized content.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button onClick={saveCustomPreferences} className="flex-1">
                          Save Preferences
                        </Button>
                        <Button variant="outline" onClick={acceptAll} className="flex-1">
                          Accept All
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  Read our{" "}
                  <a href="/privacy" className="text-emerald-600 hover:underline">
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a href="/terms" className="text-emerald-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  for more information.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
