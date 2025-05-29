
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Eye, Lock, Users, Globe, FileText } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
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
              Your privacy is important to us. Learn how we collect, use, and protect your personal information.
            </p>
            <p className="text-lg text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString()}
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
                our immigration news service ("Service").
              </p>
              <p>
                By using our Service, you agree to the collection and use of information in accordance with this policy.
              </p>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address when you create an account</li>
                  <li>Phone number (optional) for SMS notifications</li>
                  <li>Immigration categories and news preferences</li>
                  <li>Account settings and notification preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Articles you read and time spent reading</li>
                  <li>Search queries and filter preferences</li>
                  <li>Device information and browser type</li>
                  <li>IP address and general location data</li>
                </ul>
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
                <li>Provide personalized immigration news based on your interests</li>
                <li>Send email and SMS notifications about relevant news updates</li>
                <li>Improve our Service and develop new features</li>
                <li>Communicate with you about your account and our Service</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Analyze usage patterns to improve content curation</li>
              </ul>
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
                We implement appropriate technical and organizational security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure hosting infrastructure</li>
              </ul>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Globe className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
              </ul>
              <p className="mt-4">To exercise these rights, please contact us at privacy@immigro.com</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-emerald-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="text-gray-700">
              <p><strong>Email:</strong> privacy@immigro.com</p>
              <p><strong>Address:</strong> [Your Business Address]</p>
              <p><strong>Phone:</strong> [Your Phone Number]</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;
