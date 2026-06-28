
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Mail, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SocialShareButton from "@/components/SocialShareButton";
import { SecureForm } from "@/components/SecureForm";
import { HoneypotField } from "@/components/HoneypotField";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [honeypotValue, setHoneypotValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (data: any, csrfToken: string) => {
    setIsSubmitting(true);

    // Check honeypot field - if filled, it's likely a bot
    if (honeypotValue.trim() !== '') {
      toast({
        title: "Error",
        description: "Invalid submission detected.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = {
        ...data,
        csrf_token: csrfToken
      };

      const { data: responseData, error } = await supabase.functions.invoke('send-contact-email', {
        body: submissionData
      });

      if (error) throw error;

      toast({
        title: "Message Sent Successfully!",
        description: responseData.message,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
      });
      setHoneypotValue("");
    } catch (error) {
      console.error('Error sending contact email:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowOnX = () => {
    window.open('https://twitter.com/ImmigroNews', '_blank', 'noopener,noreferrer');
  };

  const handleFollowOnInstagram = () => {
    window.open('https://instagram.com/ImmigroNews', '_blank', 'noopener,noreferrer');
  };

  const handleFollowOnTikTok = () => {
    window.open('https://tiktok.com/@ImmigroNews', '_blank', 'noopener,noreferrer');
  };

  // Custom TikTok icon component
  const TikTokIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Contact Us - ImmigroNews Immigration Support"
        description="Contact the ImmigroNews team for help with subscriptions, technical issues, and questions about immigration news, USCIS updates, and visa policy changes."
        keywords={['contact ImmigroNews', 'immigration news support', 'immigration help', 'customer service', 'immigration questions']}
        url="https://immigronews.com/contact"
        canonicalUrl="https://immigronews.com/contact"
        type="website"
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact ImmigroNews",
          "description": "Contact ImmigroNews support for questions about immigration news, subscriptions, USCIS updates, and visa policy changes.",
          "url": "https://immigronews.com/contact",
          "mainEntity": {
            "@type": "Organization",
            "name": "ImmigroNews",
            "url": "https://immigronews.com",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "support@immigronews.com",
              "availableLanguage": ["English", "Spanish"]
            }
          }
        })}
      </script>
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about immigration news or need assistance? We're here to help. 
              Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Information - Smaller column */}
            <div className="lg:col-span-2">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-xl">Get in Touch</CardTitle>
                  <CardDescription>
                    We're here to help with any questions you may have.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                      <p className="text-gray-600 mb-2">support@immigronews.com</p>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    {/* X (Twitter) */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Follow us on X</h3>
                      <Button 
                        onClick={handleFollowOnX}
                        variant="outline" 
                        className="w-full bg-black hover:bg-gray-800 text-white border-black flex items-center justify-center gap-2"
                      >
                        <Twitter className="w-4 h-4" />
                        <span>@ImmigroNews</span>
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">Get the latest updates on immigration news</p>
                    </div>
                    
                    {/* Instagram */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Follow us on Instagram</h3>
                      <Button 
                        onClick={handleFollowOnInstagram}
                        variant="outline" 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-purple-500 flex items-center justify-center gap-2"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>@ImmigroNews</span>
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">See behind-the-scenes immigration insights</p>
                    </div>
                    
                    {/* TikTok */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Follow us on TikTok</h3>
                      <Button 
                        onClick={handleFollowOnTikTok}
                        variant="outline" 
                        className="w-full bg-black hover:bg-gray-800 text-white border-black flex items-center justify-center gap-2"
                      >
                        <TikTokIcon />
                        <span>@ImmigroNews</span>
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">Quick immigration tips and updates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips Card */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900 mb-1">For faster support:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Include your account email</li>
                      <li>• Describe your issue clearly</li>
                      <li>• Mention any error messages</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form - Larger column */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you soon.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SecureForm onSubmit={handleSubmit} className="space-y-6">
                    <HoneypotField value={honeypotValue} onChange={setHoneypotValue} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full"
                          placeholder="Your first name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="What is this regarding?"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="Please describe how we can help you..."
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </SecureForm>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
