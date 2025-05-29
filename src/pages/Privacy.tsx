
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy-800 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              At Immigro ("we," "our," or "us"), we are committed to protecting your privacy and personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
              our immigration news service ("Service").
            </p>
            <p>
              By using our Service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-navy-700 mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and email address when you create an account</li>
                <li>Phone number (optional) for SMS notifications</li>
                <li>Immigration categories and news preferences</li>
                <li>Account settings and notification preferences</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-700 mb-2">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Articles you read and time spent reading</li>
                <li>Search queries and filter preferences</li>
                <li>Device information and browser type</li>
                <li>IP address and general location data</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-700 mb-2">Cookies and Tracking</h3>
              <p>
                We use cookies and similar tracking technologies to enhance your experience, 
                remember your preferences, and analyze usage patterns.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide personalized immigration news based on your interests</li>
              <li>Send email and SMS notifications about relevant news updates</li>
              <li>Improve our Service and develop new features</li>
              <li>Communicate with you about your account and our Service</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns to improve content curation</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform (email services, analytics, hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Safety:</strong> To protect the safety and rights of our users and the public</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure hosting infrastructure</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
              <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
            </ul>
            <p>To exercise these rights, please contact us at privacy@immigro.com</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              We retain your personal information only as long as necessary to provide our Service and fulfill the purposes 
              outlined in this Privacy Policy. When you delete your account, we will delete your personal information 
              within 30 days, except where we are required to retain it for legal compliance.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">International Transfers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your information in accordance 
              with this Privacy Policy and applicable data protection laws.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Our Service is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you become aware that a child has provided 
              us with personal information, please contact us so we can delete such information.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date. 
              Significant changes will be communicated via email or prominent notice within our Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="list-none space-y-1">
              <li><strong>Email:</strong> privacy@immigro.com</li>
              <li><strong>Address:</strong> [Your Business Address]</li>
              <li><strong>Phone:</strong> [Your Phone Number]</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
