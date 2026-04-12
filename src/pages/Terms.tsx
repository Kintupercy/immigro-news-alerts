
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Scale, FileText, Shield, AlertTriangle, Users, Gavel, Globe } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Terms of Service - ImmigroNews User Agreement"
        description="ImmigroNews Terms of Service. Read our user agreement, legal disclaimers, and terms governing the use of our immigration news platform. Not a substitute for legal advice."
        keywords={['terms of service', 'user agreement', 'legal terms', 'terms and conditions', 'service agreement']}
        url="https://immigronews.com/terms"
        canonicalUrl="https://immigronews.com/terms"
        type="website"
      />
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Scale className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Please read these terms carefully before using our immigration news service.
            </p>
            <p className="text-lg text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString()} | Effective Date: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Agreement to Terms */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Agreement to Terms</h2>
            </div>
            <div className="prose prose-lg text-gray-700">
              <p className="mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and 
                Immigro ("Company," "we," "us," or "our") governing your use of the Immigro website and 
                mobile application (collectively, the "Service").
              </p>
              <p className="mb-4">
                By accessing, browsing, or using our Service, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms and our Privacy Policy. If you do not agree with any 
                part of these terms, you must discontinue use of the Service immediately.
              </p>
              <p>
                <strong>Age Requirement:</strong> You must be at least 18 years old to use our Service. 
                By using the Service, you represent and warrant that you are 18 years of age or older.
              </p>
            </div>
          </div>

          {/* Description of Service */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Users className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Description of Service</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                Immigro provides a comprehensive immigration news and information aggregation platform designed 
                to keep users informed about immigration policies, procedures, and developments. Our Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Curated immigration news from verified and authoritative sources</li>
                <li>Personalized content filtering based on immigration status and interests</li>
                <li>Real-time alerts for urgent immigration policy changes</li>
                <li>Email notification services</li>
                <li>Multi-language content translation (Pro feature)</li>
                <li>Advanced search and filtering capabilities</li>
                <li>User account management and preference settings</li>
                <li>Bookmark and save functionality for important articles</li>
              </ul>
            </div>
          </div>

          {/* Critical Legal Disclaimer */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-3xl font-bold text-red-800">Critical Legal Disclaimer</h2>
            </div>
            <div className="text-red-700 space-y-4">
              <p className="text-xl font-bold">
                IMMIGRO IS NOT A LAW FIRM AND DOES NOT PROVIDE LEGAL ADVICE OR LEGAL SERVICES
              </p>
              <div className="bg-white p-4 rounded border-l-4 border-red-500">
                <h3 className="font-semibold mb-2">Important Disclaimers:</h3>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>No attorney-client relationship is created through use of our Service</li>
                  <li>Information provided is for educational and informational purposes only</li>
                  <li>Immigration law is complex and varies by individual circumstances</li>
                  <li>News and information may become outdated or contain inaccuracies</li>
                  <li>Always consult qualified immigration attorneys for legal advice</li>
                  <li>We are not responsible for decisions made based on our content</li>
                </ul>
              </div>
              <p className="font-semibold">
                IMMIGRATION DECISIONS CAN HAVE SERIOUS CONSEQUENCES. Always seek professional legal counsel 
                from licensed immigration attorneys before making any immigration-related decisions or taking any action.
              </p>
            </div>
          </div>

          {/* Immigration-Specific Terms */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Globe className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Immigration-Specific Terms</h2>
            </div>
            <div className="text-gray-700 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Information Accuracy and Updates</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Immigration laws and policies change frequently and without notice</li>
                  <li>We strive for accuracy but cannot guarantee all information is current or complete</li>
                  <li>Users should verify information through official government sources</li>
                  <li>We are not liable for actions taken based on outdated or incorrect information</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Immigration Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may choose to provide immigration status information for personalization</li>
                  <li>This information is used solely to curate relevant content</li>
                  <li>We do not share immigration status with government agencies except when legally required</li>
                  <li>You can update or delete this information at any time</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Government Source Attribution</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We aggregate news from various sources including government agencies</li>
                  <li>Official policy interpretations should be verified with relevant authorities</li>
                  <li>We do not endorse any particular interpretation of immigration law</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Emergency Situations</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Our Service is not for emergency immigration situations</li>
                  <li>For urgent matters, contact immigration attorneys or relevant authorities directly</li>
                  <li>We are not responsible for delays in information delivery</li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Accounts and Responsibilities */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">User Accounts and Responsibilities</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>To access certain features of our Service, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security and confidentiality of your login credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use or security breach</li>
                <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
                <li>Not impersonate others or provide false identity information</li>
                <li>Not attempt to gain unauthorized access to our systems or other users' accounts</li>
              </ul>
            </div>
          </div>

          {/* Prohibited Uses */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Prohibited Uses</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>You may not use our Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Engage in any illegal activity or promote illegal activities</li>
                <li>Violate any local, state, national, or international law or regulation</li>
                <li>Transmit or post any content that is harmful, offensive, or inappropriate</li>
                <li>Attempt to circumvent security measures or gain unauthorized access</li>
                <li>Use automated systems to scrape or harvest data from our Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Share false or misleading immigration information</li>
                <li>Use the Service to provide unauthorized legal advice</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </div>
          </div>

          {/* Subscription and Billing */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Subscription and Billing</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Free and Paid Services</h3>
                <p>We offer both free and paid subscription tiers with different features and limitations.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Billing Terms</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions are billed in advance on a recurring basis</li>
                  <li>All fees are non-refundable except as expressly stated</li>
                  <li>We reserve the right to change pricing with 30 days notice</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Cancellation</h3>
                <p>You may cancel your subscription at any time. Cancellation will be effective at the end of your current billing period.</p>
              </div>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Intellectual Property Rights</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                The Service and its original content, features, and functionality are owned by Immigro and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may not copy, modify, distribute, or create derivative works</li>
                <li>News content is aggregated from third-party sources and subject to their copyrights</li>
                <li>You retain rights to any content you submit to us</li>
                <li>By submitting content, you grant us a license to use it for Service operations</li>
              </ul>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Gavel className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Limitation of Liability</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">
                TO THE FULLEST EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>OUR LIABILITY IS LIMITED TO THE AMOUNT YOU PAID FOR THE SERVICE IN THE PAST 12 MONTHS</li>
                <li>WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES</li>
                <li>WE ARE NOT LIABLE FOR IMMIGRATION DECISIONS OR OUTCOMES BASED ON OUR CONTENT</li>
                <li>WE ARE NOT LIABLE FOR THIRD-PARTY CONTENT OR SERVICES</li>
                <li>WE ARE NOT LIABLE FOR SERVICE INTERRUPTIONS OR DATA LOSS</li>
              </ul>
              <p className="text-sm bg-yellow-50 border border-yellow-200 p-4 rounded">
                <strong>Immigration-Specific Limitation:</strong> We are not responsible for any immigration 
                applications, denials, delays, or other immigration consequences that may result from 
                information obtained through our Service.
              </p>
            </div>
          </div>

          {/* Indemnification */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Indemnification</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                You agree to defend, indemnify, and hold harmless Immigro and its officers, directors, employees, 
                and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt, 
                and expenses (including attorney's fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use of and access to the Service</li>
                <li>Your violation of any term of these Terms</li>
                <li>Your violation of any third-party right</li>
                <li>Any content you submit to the Service</li>
                <li>Your immigration decisions or actions</li>
              </ul>
            </div>
          </div>

          {/* Governing Law and Disputes */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Gavel className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Governing Law and Dispute Resolution</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Governing Law</h3>
                <p>These Terms are governed by and construed in accordance with the laws of [Your State/Country], without regard to conflict of law principles.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Dispute Resolution</h3>
                <p>Any disputes arising from these Terms or the Service will be resolved through:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Good faith negotiation between the parties</li>
                  <li>Binding arbitration if negotiation fails</li>
                  <li>Jurisdiction in the courts of [Your Jurisdiction] for non-arbitrable matters</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Changes to Terms</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of material changes through:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email notification to registered users</li>
                <li>Prominent notice on our website</li>
                <li>In-app notifications</li>
              </ul>
              <p>
                Continued use of the Service after changes constitutes acceptance of the new Terms. 
                If you disagree with changes, you must discontinue use of the Service.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;
