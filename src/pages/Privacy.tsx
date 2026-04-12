
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Shield, Eye, Lock, Users, Globe, FileText, AlertTriangle, Cookie } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Privacy Policy - ImmigroNews Data Protection"
        description="ImmigroNews privacy policy. Learn how we collect, use, and protect your personal information in compliance with GDPR and CCPA. Your immigration data is secure and private."
        keywords={['privacy policy', 'data protection', 'GDPR', 'CCPA', 'data security', 'privacy rights']}
        url="https://immigronews.com/privacy"
        canonicalUrl="https://immigronews.com/privacy"
        type="website"
      />
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Shield className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your personal information in compliance with GDPR and CCPA.
            </p>
            <p className="text-lg text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString()} | Effective Date: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Eye className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Introduction</h2>
            </div>
            <div className="prose prose-lg text-gray-700">
              <p className="mb-4">
                At Immigro ("we," "our," or "us"), we are committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
                our immigration news service ("Service") and applies to all users worldwide.
              </p>
              <p className="mb-4">
                <strong>Data Controller:</strong> Immigro acts as the data controller for personal information collected through our Service.
              </p>
              <p>
                By using our Service, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, do not use our Service.
              </p>
            </div>
          </div>

          {/* Legal Basis for Processing */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-blue-800">Legal Basis for Processing (GDPR)</h2>
            </div>
            <div className="text-blue-700 space-y-4">
              <p>Under the General Data Protection Regulation (GDPR), we process your personal data on the following legal bases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consent:</strong> When you opt-in to receive newsletters or marketing communications</li>
                <li><strong>Contract Performance:</strong> To provide our immigration news service and manage your account</li>
                <li><strong>Legitimate Interest:</strong> To improve our Service, ensure security, and provide personalized content</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address when you create an account</li>
                  <li>Phone number (optional)</li>
                  <li>Immigration status and categories of interest</li>
                  <li>Country of origin and destination preferences</li>
                  <li>Account settings and notification preferences</li>
                  <li>Communication records when you contact us</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Usage data: Articles viewed, time spent, search queries</li>
                  <li>Device information: Browser type, operating system, device identifiers</li>
                  <li>Technical data: IP address, cookies, session data</li>
                  <li>Location data: General geographic location (country/region level)</li>
                  <li>Performance data: Page load times, error reports</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Sensitive Personal Information</h3>
                <p className="text-sm bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <strong>Immigration Status:</strong> We understand that immigration status may be considered sensitive. 
                  This information is used solely to provide relevant news and is stored securely with enhanced protections.
                </p>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Users className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <div className="text-gray-700">
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Service Provision:</strong> Deliver personalized immigration news and updates</li>
                <li><strong>Communication:</strong> Send relevant notifications, alerts, and service updates</li>
                <li><strong>Personalization:</strong> Customize content based on your immigration interests and status</li>
                <li><strong>Analytics:</strong> Analyze usage patterns to improve our Service quality</li>
                <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
                <li><strong>Legal Compliance:</strong> Comply with applicable laws and legal processes</li>
                <li><strong>Business Operations:</strong> Manage accounts, billing, and customer support</li>
              </ul>
            </div>
          </div>

          {/* Cookies and Tracking */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Cookie className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Cookies and Tracking Technologies</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>We use cookies and similar tracking technologies to enhance your experience:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Essential Cookies</h4>
                  <p className="text-sm">Required for basic site functionality, authentication, and security.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Analytics Cookies</h4>
                  <p className="text-sm">Help us understand how you use our Service to improve performance.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Preference Cookies</h4>
                  <p className="text-sm">Remember your settings and preferences for a personalized experience.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Marketing Cookies</h4>
                  <p className="text-sm">Used to deliver relevant content and measure campaign effectiveness.</p>
                </div>
              </div>
              <p className="text-sm bg-gray-50 p-4 rounded">
                You can manage cookie preferences through our cookie consent banner or your browser settings.
              </p>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Globe className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Data Sharing and Disclosure</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p><strong>We do not sell your personal information.</strong> We may share information in these limited circumstances:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Service Providers:</strong> Trusted third parties who assist in service delivery (hosting, analytics, email delivery)</li>
                <li><strong>Legal Requirements:</strong> When required by law, legal process, or government request</li>
                <li><strong>Safety and Security:</strong> To protect rights, safety, and security of users and our Service</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                <li><strong>Consent:</strong> When you explicitly consent to sharing with specific third parties</li>
              </ul>
              <p className="text-sm bg-red-50 border border-red-200 p-4 rounded">
                <strong>Immigration Data Protection:</strong> We never share immigration status information with government agencies 
                unless legally required, and we will notify you when legally permitted.
              </p>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Lock className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Data Security</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                We implement comprehensive security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> Data encrypted in transit (TLS 1.2+) and at rest (AES-256)</li>
                <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
                <li><strong>Data Minimization:</strong> We collect and retain only necessary information</li>
                <li><strong>Incident Response:</strong> Procedures for detecting and responding to breaches</li>
                <li><strong>Staff Training:</strong> Regular privacy and security training for all personnel</li>
              </ul>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Your Privacy Rights</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>Depending on your location, you may have the following rights:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">GDPR Rights (EU Residents)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Right to access your data</li>
                    <li>• Right to rectification</li>
                    <li>• Right to erasure ("right to be forgotten")</li>
                    <li>• Right to restrict processing</li>
                    <li>• Right to data portability</li>
                    <li>• Right to object to processing</li>
                    <li>• Rights related to automated decision-making</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">CCPA Rights (California Residents)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Right to know what data is collected</li>
                    <li>• Right to delete personal information</li>
                    <li>• Right to opt-out of sale (we don't sell data)</li>
                    <li>• Right to non-discrimination</li>
                    <li>• Right to correct inaccurate data</li>
                    <li>• Right to limit use of sensitive data</li>
                  </ul>
                </div>
              </div>
              
              <p className="mt-4">
                <strong>To exercise your rights:</strong> Contact us at privacy@immigro.com with your request. 
                We will respond within the legally required timeframe (typically 30 days for GDPR, 45 days for CCPA).
              </p>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Data Retention</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>We retain your information for as long as necessary to provide our Service and comply with legal obligations:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active and for 2 years after closure</li>
                <li><strong>Usage Data:</strong> Aggregated data retained for 3 years for analytics purposes</li>
                <li><strong>Communication Records:</strong> Retained for 6 years for legal and customer service purposes</li>
                <li><strong>Marketing Data:</strong> Retained until you opt-out or for 3 years of inactivity</li>
              </ul>
              <p className="text-sm bg-gray-50 p-4 rounded">
                You can request deletion of your data at any time, subject to legal retention requirements.
              </p>
            </div>
          </div>

          {/* International Transfers */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Globe className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">International Data Transfers</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>Your information may be transferred to and processed in countries other than your own, including the United States.</p>
              <p>We ensure adequate protection through:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>European Commission adequacy decisions</li>
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Binding Corporate Rules where applicable</li>
                <li>Your explicit consent when required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
