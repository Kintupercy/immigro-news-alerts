
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy-800 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              These Terms of Service ("Terms") govern your use of the Immigro website and mobile application 
              (collectively, the "Service") operated by Immigro ("we," "us," or "our").
            </p>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with 
              any part of these terms, then you may not access the Service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Immigro provides personalized immigration news and information aggregation services. 
              Our Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Curated immigration news from verified sources</li>
              <li>Personalized content based on your interests and immigration status</li>
              <li>Email and SMS notifications for important updates</li>
              <li>Search and filtering capabilities</li>
              <li>User account management and preferences</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              To access certain features of our Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your account information to keep it accurate</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p>
              We reserve the right to refuse service, terminate accounts, or cancel subscriptions 
              at our sole discretion.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit harmful, threatening, abusive, or defamatory content</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Distribute spam or unsolicited communications</li>
              <li>Collect user information without consent</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Content and Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-navy-700 mb-2">Our Content</h3>
              <p>
                The Service and its original content, features, and functionality are owned by Immigro 
                and are protected by international copyright, trademark, patent, trade secret, and other 
                intellectual property laws.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-700 mb-2">Third-Party Content</h3>
              <p>
                Our Service aggregates news and information from third-party sources. We respect the 
                intellectual property rights of others and provide proper attribution to original sources.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-700 mb-2">User Content</h3>
              <p>
                Any content you submit through our Service remains your property. However, by submitting 
                content, you grant us a non-exclusive, worldwide, royalty-free license to use, modify, 
                and display such content in connection with our Service.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Disclaimers and Legal Advice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Legal Disclaimer</h3>
              <p className="text-yellow-700">
                <strong>Immigro is NOT a law firm and does NOT provide legal advice.</strong> The information 
                provided through our Service is for informational purposes only and should not be construed 
                as legal advice. Immigration law is complex and constantly changing. You should consult with 
                a qualified immigration attorney for advice specific to your situation.
              </p>
            </div>
            <p>
              We make no warranties or representations about the accuracy, completeness, or timeliness 
              of the information provided. Immigration policies and procedures can change rapidly, and 
              information may become outdated.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and 
              protect your information when you use our Service. By using our Service, you agree to 
              the collection and use of information in accordance with our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Subscription and Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Some features of our Service may require a paid subscription. If you choose to purchase 
              a subscription:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You agree to pay all charges associated with your subscription</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You may cancel your subscription at any time</li>
              <li>Refunds are provided in accordance with our refund policy</li>
              <li>We reserve the right to change subscription prices with notice</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, IMMIGRO SHALL NOT BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS 
              OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>
            <p>
              Our total liability to you for all damages, losses, and causes of action shall not 
              exceed the amount you have paid to us in the twelve (12) months preceding the claim.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Indemnification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              You agree to defend, indemnify, and hold harmless Immigro and its officers, directors, 
              employees, and agents from and against any claims, damages, obligations, losses, 
              liabilities, costs, or debt arising from your use of the Service or violation of these Terms.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              We may terminate or suspend your account and access to the Service immediately, 
              without prior notice or liability, for any reason, including breach of these Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will cease immediately. 
              All provisions of these Terms that should survive termination shall survive, 
              including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is 
              material, we will provide at least 30 days' notice prior to any new terms taking effect.
            </p>
            <p>
              Your continued use of the Service after any such changes constitutes your acceptance 
              of the new Terms.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              These Terms shall be governed and construed in accordance with the laws of [Your State/Country], 
              without regard to its conflict of law provisions. Any disputes arising under these Terms 
              shall be resolved in the courts of [Your Jurisdiction].
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-navy-800">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <ul className="list-none space-y-1">
              <li><strong>Email:</strong> legal@immigro.com</li>
              <li><strong>Address:</strong> [Your Business Address]</li>
              <li><strong>Phone:</strong> [Your Phone Number]</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
