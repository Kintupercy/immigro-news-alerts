import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Shield, Eye, Lock, Users, Globe, FileText, AlertTriangle, Cookie } from "lucide-react";

const LAST_UPDATED = "June 28, 2026";

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
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Privacy Policy",
          "description": "ImmigroNews privacy policy. How we collect, use, and protect your personal data in compliance with GDPR and CCPA.",
          "url": "https://immigronews.com/privacy"
        })}
      </script>
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="text-center mb-16">
            <Shield className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we protect it.
            </p>
            <p className="text-lg text-gray-500 mt-4">
              Last updated: {LAST_UPDATED}
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
                ImmigroNews ("we," "our," or "us") operates immigronews.com, an immigration news aggregation
                platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you visit our website and use our services.
              </p>
              <p className="mb-4">
                <strong>Data Controller:</strong> ImmigroNews is the data controller for personal information
                collected through this website.
              </p>
              <p>
                By using our Service, you agree to the collection and use of information as described here.
                If you do not agree, please discontinue use of our Service.
              </p>
            </div>
          </div>

          {/* Legal Basis (GDPR) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-blue-800">Legal Basis for Processing (GDPR)</h2>
            </div>
            <div className="text-blue-700 space-y-4">
              <p>Under the GDPR, we process your personal data on the following legal bases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consent:</strong> When you subscribe to email alerts or newsletters</li>
                <li><strong>Contract Performance:</strong> To deliver the news service and manage your account</li>
                <li><strong>Legitimate Interest:</strong> To improve the Service, ensure security, and prevent abuse</li>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address when you create an account or subscribe to alerts</li>
                  <li>Immigration categories of interest (e.g., work visas, green card, citizenship)</li>
                  <li>Notification and content preferences</li>
                  <li>Messages or inquiries you send to us</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Usage data: pages viewed, articles read, search queries, time on site</li>
                  <li>Device and browser information: browser type, operating system</li>
                  <li>IP address and approximate geographic location (country/region level)</li>
                  <li>Cookies and session data (see Cookies section below)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Sensitive Information</h3>
                <p className="text-sm bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <strong>Immigration interests:</strong> If you select immigration categories to personalize
                  your feed, we treat this as sensitive information. It is stored securely, used only to
                  deliver relevant content, and never shared with government agencies or sold to third parties.
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
                <li><strong>Service Delivery:</strong> Provide personalized immigration news and alerts</li>
                <li><strong>Email Notifications:</strong> Send breaking news alerts and weekly newsletters you opted into</li>
                <li><strong>Personalization:</strong> Curate content based on your selected immigration interests</li>
                <li><strong>Analytics:</strong> Understand how the Service is used so we can improve it</li>
                <li><strong>Security:</strong> Detect and prevent abuse, fraud, and security incidents</li>
                <li><strong>Legal Compliance:</strong> Meet applicable legal obligations</li>
              </ul>
            </div>
          </div>

          {/* AI-Assisted Content */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-600 mr-3" />
              <h2 className="text-3xl font-bold text-amber-800">AI-Assisted Content Curation</h2>
            </div>
            <div className="text-amber-700 space-y-4">
              <p>
                ImmigroNews uses AI services (including the Perplexity API) to help identify, summarize, and
                categorize immigration news from public sources. Your personal identifying information is not
                sent to AI providers — only public news content is processed by these systems.
              </p>
              <p>
                AI-generated summaries are editorial aids, not legal interpretations. Always verify
                information through official government sources and consult a qualified immigration attorney
                for advice specific to your situation.
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Cookie className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Cookies and Tracking</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>We use a minimal set of cookies:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Essential Cookies</h4>
                  <p className="text-sm">
                    Authentication session tokens (via Supabase) required to keep you signed in and
                    maintain your preferences. These cannot be disabled without breaking core functionality.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Analytics Cookies</h4>
                  <p className="text-sm">
                    We use Google Analytics to understand aggregate usage patterns. Data is anonymized
                    and does not identify individual users. You can opt out via your browser settings or
                    a browser extension such as the Google Analytics Opt-out Add-on.
                  </p>
                </div>
              </div>
              <p className="text-sm bg-gray-50 p-4 rounded">
                We do not use advertising, retargeting, or marketing cookies. We do not sell data to
                ad networks or data brokers.
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
              <p><strong>We do not sell your personal information.</strong> We share data only in these limited cases:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Infrastructure Providers:</strong> Supabase (database and authentication),
                  Cloudflare (CDN and hosting), and our transactional email provider — all bound by
                  data processing agreements
                </li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or lawful government request</li>
                <li><strong>Safety:</strong> To protect the rights, safety, or security of users or the Service</li>
                <li><strong>Business Transfers:</strong> If ImmigroNews is acquired or merged, your data may transfer to the successor entity with notice provided</li>
              </ul>
              <p className="text-sm bg-red-50 border border-red-200 p-4 rounded">
                <strong>Immigration Data:</strong> We never proactively share immigration interest data with
                government agencies. If we receive a lawful legal demand for user data, we will notify
                affected users to the extent permitted by law before complying.
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
              <p>We implement reasonable technical measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption in transit:</strong> All traffic served over HTTPS (TLS 1.2+)</li>
                <li><strong>Encryption at rest:</strong> Data stored in Supabase is encrypted at rest by default</li>
                <li><strong>Access controls:</strong> Row-level security policies ensure users can only access their own data</li>
                <li><strong>Data minimization:</strong> We collect only what is necessary to provide the Service</li>
              </ul>
              <p className="text-sm bg-gray-50 p-4 rounded">
                No online system is perfectly secure. If you believe your account has been compromised,
                contact us immediately at support@immigronews.com.
              </p>
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
                  <h4 className="font-semibold text-blue-800 mb-2">GDPR Rights (EU / UK Residents)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Access your data</li>
                    <li>• Correct inaccurate data</li>
                    <li>• Request erasure ("right to be forgotten")</li>
                    <li>• Restrict or object to processing</li>
                    <li>• Data portability</li>
                    <li>• Withdraw consent at any time</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">CCPA Rights (California Residents)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Know what data is collected</li>
                    <li>• Delete your personal information</li>
                    <li>• Opt out of sale (we don't sell data)</li>
                    <li>• Non-discrimination for exercising rights</li>
                    <li>• Correct inaccurate data</li>
                    <li>• Limit use of sensitive data</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4">
                <strong>To exercise any right:</strong> Email support@immigronews.com with your request.
                We will respond within 30 days (GDPR) or 45 days (CCPA).
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
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account data:</strong> Retained while your account is active and for 90 days after deletion</li>
                <li><strong>Email subscription data:</strong> Retained until you unsubscribe</li>
                <li><strong>Analytics data:</strong> Anonymized and retained per Google Analytics default (up to 26 months)</li>
                <li><strong>Support communications:</strong> Retained for 3 years</li>
              </ul>
              <p className="text-sm bg-gray-50 p-4 rounded">
                You may request deletion of your account and personal data at any time by emailing
                support@immigronews.com. We will complete requests within 30 days.
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
              <p>
                Our infrastructure is primarily based in the United States. If you access our Service from
                outside the US, your data may be transferred to and processed in the US.
              </p>
              <p>
                For transfers from the EU/EEA, we rely on Standard Contractual Clauses (SCCs) with our
                infrastructure providers where required.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">Contact Us</h2>
            <p className="text-emerald-700">
              For privacy questions, data access requests, or concerns about this policy, contact us at{" "}
              <strong>support@immigronews.com</strong>. We aim to respond within 5 business days.
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
