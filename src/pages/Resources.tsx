import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Users, Shield, Clock, Mail, MapPin, Globe, FileText, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Resources = () => {
  const [formData, setFormData] = useState({
    situation: "",
    visaType: "",
    countryOfOrigin: "",
    location: "",
    email: "",
    stayAnonymous: false,
    freeConsult: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [caseId, setCaseId] = useState("");
  const { toast } = useToast();

  const visaOptions = [
    "Student (F-1, J-1, etc.)",
    "Work Visa (H-1B, L-1, etc.)",
    "Asylum Seeker",
    "Undocumented",
    "TPS (Temporary Protected Status)",
    "DACA",
    "Family-based",
    "Green Card Holder",
    "Citizenship/Naturalization",
    "Other",
    "Not sure/None"
  ];

  const generateCaseId = () => {
    const prefix = "REQ";
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}#${suffix}`;
  };

  const sendConfirmationEmail = async (caseId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-legal-help-confirmation', {
        body: {
          email: formData.email,
          caseId: caseId,
          stayAnonymous: formData.stayAnonymous,
          freeConsult: formData.freeConsult
        }
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        // Don't fail the whole process if email fails
      } else {
        console.log('Confirmation email sent successfully:', data);
      }
    } catch (error) {
      console.error('Error calling confirmation email function:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.situation.trim()) {
      toast({
        title: "Please describe your situation",
        description: "We need to understand your immigration issue to help match you with the right lawyer.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newCaseId = generateCaseId();
      
      const { error } = await supabase
        .from('email_subscriptions')
        .insert([{ 
          email: formData.stayAnonymous ? `anonymous-${newCaseId.toLowerCase()}@immigro.app` : formData.email || `anonymous-${newCaseId.toLowerCase()}@immigro.app`,
          preferences: {
            type: 'legal-help-request',
            situation: formData.situation,
            visaType: formData.visaType,
            countryOfOrigin: formData.countryOfOrigin,
            location: formData.location,
            stayAnonymous: formData.stayAnonymous,
            freeConsult: formData.freeConsult,
            caseId: newCaseId,
            submittedAt: new Date().toISOString()
          }
        }]);

      if (error) {
        throw error;
      }

      // Send confirmation email if user provided email and didn't choose to stay anonymous
      if (formData.email && !formData.stayAnonymous) {
        await sendConfirmationEmail(newCaseId);
      }

      setCaseId(newCaseId);
      setSubmissionSuccess(true);
      
      toast({
        title: "Request submitted successfully!",
        description: `Your case ID is ${newCaseId}. ${formData.email && !formData.stayAnonymous ? "Check your email for confirmation details." : "We'll connect you with a vetted immigration lawyer soon."}`,
      });
      
      // Reset form
      setFormData({
        situation: "",
        visaType: "",
        countryOfOrigin: "",
        location: "",
        email: "",
        stayAnonymous: false,
        freeConsult: false
      });
    } catch (error) {
      console.error('Legal help request submission error:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="pt-16 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-0">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardHeader>
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-emerald-800">
                  Thank you — we've received your request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="text-sm text-gray-600 mb-2">Your Case ID:</p>
                  <p className="text-2xl font-bold text-emerald-700">{caseId}</p>
                  <p className="text-sm text-gray-600 mt-2">Save this ID to check your request status later</p>
                </div>
                
                <div className="text-left space-y-3 text-gray-700">
                  <p><strong>We'll reach out to trusted immigration professionals on your behalf.</strong></p>
                  <p>If you gave your email, we'll follow up discreetly within 1–2 days.</p>
                  
                  <p><strong>What happens next:</strong></p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">1.</span>
                      We'll review your request within 24 hours
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">2.</span>
                      You'll be matched with a vetted immigration lawyer in your area
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">3.</span>
                      {formData.freeConsult ? "You'll receive information about your free 10-minute consultation" : "You'll get contact information and next steps"}
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={() => {
                    setSubmissionSuccess(false);
                    setCaseId("");
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Submit Another Request
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Find Immigration Lawyers & Legal Help Near You"
        description="Get matched with vetted immigration lawyers in your area. Free consultations and anonymous requests for visa, green card, and citizenship legal help."
        keywords={['immigration lawyer', 'legal help', 'immigration attorney', 'free consultation', 'immigration legal services', 'find immigration lawyer', 'visa lawyer', 'green card attorney']}
        url="https://immigronews.com/resources"
        canonicalUrl="https://immigronews.com/resources"
        type="website"
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Immigration Attorney Matching & Legal Resources",
          "description": "Get matched with vetted immigration attorneys in your area. Free consultations, anonymous requests, and legal help for visa, green card, and citizenship cases.",
          "url": "https://immigronews.com/resources",
          "about": "Free immigration attorney matching service for U.S. immigrants",
          "provider": {
            "@type": "Organization",
            "name": "ImmigroNews",
            "url": "https://immigronews.com"
          }
        })}
      </script>
      <Header />
      
      <div className="pt-16 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Need Legal Help? You're Not Alone.
            </h1>
            <p className="text-lg text-gray-600">
              No account. No phone number. Just tell us what you're facing, and we'll connect you to someone who can help.
            </p>
          </div>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="w-6 h-6 mr-2 text-emerald-600" />
                Get Matched with a Lawyer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="situation" className="text-base font-medium text-gray-900">
                    What's your situation? <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="situation"
                    placeholder="Briefly describe your immigration issue..."
                    value={formData.situation}
                    onChange={(e) => setFormData({...formData, situation: e.target.value})}
                    required
                    className="mt-2 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="visaType" className="text-base font-medium text-gray-900">
                    Visa or Status Type
                  </Label>
                  <select
                    id="visaType"
                    value={formData.visaType}
                    onChange={(e) => setFormData({...formData, visaType: e.target.value})}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select if known</option>
                    {visaOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="countryOfOrigin" className="text-base font-medium text-gray-900">
                    Country of Origin
                  </Label>
                  <div className="relative mt-2">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="countryOfOrigin"
                      type="text"
                      placeholder="What country are you immigrating from?"
                      value={formData.countryOfOrigin}
                      onChange={(e) => setFormData({...formData, countryOfOrigin: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location" className="text-base font-medium text-gray-900">
                    City/State (optional)
                  </Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="This helps us find a local lawyer"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-medium text-gray-900">
                    Email (optional, for reply)
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Only if you want us to follow up"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10"
                      disabled={formData.stayAnonymous}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="anonymous"
                      checked={formData.stayAnonymous}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData, 
                          stayAnonymous: checked as boolean,
                          email: checked ? "" : formData.email
                        });
                      }}
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      I'd prefer to stay anonymous
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="freeConsult"
                      checked={formData.freeConsult}
                      onCheckedChange={(checked) => setFormData({...formData, freeConsult: checked as boolean})}
                    />
                    <Label htmlFor="freeConsult" className="text-sm">
                      I'd like to request a free 10-minute consultation (via secure email only)
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 text-base"
                >
                  {isSubmitting ? "Submitting..." : "Get Matched with a Lawyer"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  We'll only use your answers to help match you. No spam. Ever.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Privacy and Safety Information */}
          <div className="mt-8 space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Your Privacy & Safety Come First</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>We don't collect or share your personal information</li>
                      <li>You can stay completely anonymous and still get connected to helpful, vetted legal experts</li>
                      <li>All communications are secure and confidential</li>
                      <li>You can check your request status anytime with your case ID</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Vetted Lawyers</h4>
                <p className="text-sm text-gray-600">Carefully selected immigration attorneys with proven track records</p>
              </Card>
              
              <Card className="text-center p-4">
                <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Specialized Expertise</h4>
                <p className="text-sm text-gray-600">Lawyers specializing in different immigration categories and situations</p>
              </Card>
              
              <Card className="text-center p-4">
                <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Quick Matching</h4>
                <p className="text-sm text-gray-600">Fast connections to the right lawyer for your specific needs</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Resources;
