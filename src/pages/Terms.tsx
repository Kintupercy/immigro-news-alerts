
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Scale, FileText, Shield, AlertTriangle, Users, Gavel } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
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
              Last updated: {new Date().toLocaleDateString()}
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
                These Terms of Service ("Terms") govern your use of the Immigro website and mobile application 
                (collectively, the "Service") operated by Immigro ("we," "us," or "our").
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with 
                any part of these terms, then you may not access the Service.
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
                Immigro provides personalized immigration news and information aggregation services. 
                Our Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Curated immigration news from verified sources</li>
                <li>Personalized content based on your interests and immigration status</li>
                <li>Email and SMS notifications for important updates</li>
                <li>Search and filtering capabilities</li>
                <li>User account management and preferences</li>
              </ul>
            </div>
          </div>

          {/* Important Legal Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
              <h2 className="text-3xl font-bold text-yellow-800">Important Legal Disclaimer</h2>
            </div>
            <div className="text-yellow-700 space-y-4">
              <p className="text-lg font-semibold">
                <strong>Immigro is NOT a law firm and does NOT provide legal advice.</strong>
              </p>
              <p>
                The information provided through our Service is for informational purposes only and should not be construed 
                as legal advice. Immigration law is complex and constantly changing. You should consult with 
                a qualified immigration attorney for advice specific to your situation.
              </p>
              <p>
                We make no warranties or representations about the accuracy, completeness, or timeliness 
                of the information provided. Immigration policies and procedures can change rapidly, and 
                information may become outdated.
              </p>
            </div>
          </div>

          {/* User Accounts */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">User Accounts</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>To access certain features of our Service, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information to keep it accurate</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
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
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, IMMIGRO SHALL NOT BE LIABLE FOR ANY 
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS 
                OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
              </p>
              <p>
                Our total liability to you for all damages, losses, and causes of action shall not 
                exceed the amount you have paid to us in the twelve (12) months preceding the claim.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-emerald-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-4">If you have any questions about these Terms of Service, please contact us:</p>
            <div className="text-gray-700">
              <p><strong>Email:</strong> legal@immigro.com</p>
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

export default Terms;
