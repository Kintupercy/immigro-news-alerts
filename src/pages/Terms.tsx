import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Scale, FileText, Shield, AlertTriangle, Users, Gavel, Globe } from "lucide-react";

const LAST_UPDATED = "June 28, 2026";

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
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Terms of Service",
          "description": "ImmigroNews Terms of Service. User agreement, legal disclaimers, and terms governing use of our immigration news platform.",
          "url": "https://immigronews.com/terms"
        })}
      </script>
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="text-center mb-16">
            <Scale className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Please read these terms carefully before using ImmigroNews.
            </p>
            <p className="text-lg text-gray-500 mt-4">
              Last updated: {LAST_UPDATED}
            </p>
          </div>

          {/* Agreement */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Agreement to Terms</h2>
            </div>
            <div className="prose prose-lg text-gray-700">
              <p className="mb-4">
                These Terms of Service ("Terms") are a legally binding agreement between you and ImmigroNews
                ("we," "us," or "our") governing your use of immigronews.com and any associated services
                (the "Service").
              </p>
              <p className="mb-4">
                By accessing or using our Service, you confirm that you have read, understood, and agree to
                be bound by these Terms and our Privacy Policy. If you do not agree, you must stop using the
                Service immediately.
              </p>
              <p>
                <strong>Age Requirement:</strong> You must be at least 18 years old to use our Service.
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
                ImmigroNews is a web-based immigration news aggregation platform that curates and
                summarizes publicly available immigration news from government sources, news organizations,
                and RSS feeds. The Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Aggregated immigration news curated from verified third-party sources</li>
                <li>AI-assisted summarization and categorization of news content</li>
                <li>Personalized news filtering based on immigration categories of interest</li>
                <li>Real-time alerts for breaking immigration policy changes</li>
                <li>Email newsletter and notification services</li>
                <li>Multi-language content (English and Spanish)</li>
                <li>Search and filtering tools</li>
                <li>User account and preference management</li>
              </ul>
              <p className="text-sm bg-gray-50 p-4 rounded mt-4">
                The Service is currently provided free of charge. We reserve the right to introduce
                paid features in the future, with advance notice to registered users.
              </p>
            </div>
          </div>

          {/* AI Content Disclosure */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-600 mr-3" />
              <h2 className="text-3xl font-bold text-amber-800">AI-Assisted Content</h2>
            </div>
            <div className="text-amber-700 space-y-4">
              <p>
                ImmigroNews uses artificial intelligence tools, including the Perplexity API, to assist
                with identifying, summarizing, and categorizing immigration news. By using the Service,
                you acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Some article summaries and category labels are AI-generated</li>
                <li>AI-generated content may contain errors, omissions, or outdated information</li>
                <li>AI summaries are not legal interpretations and do not reflect our legal opinion</li>
                <li>You should always read original source articles and verify information independently</li>
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
                IMMIGRONEWS IS NOT A LAW FIRM AND DOES NOT PROVIDE LEGAL ADVICE OR LEGAL SERVICES.
              </p>
              <div className="bg-white p-4 rounded border-l-4 border-red-500">
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>No attorney-client relationship is created through use of our Service</li>
                  <li>All content is for educational and informational purposes only</li>
                  <li>Immigration law is complex, changes frequently, and varies by individual circumstance</li>
                  <li>News summaries may contain inaccuracies or lag behind policy changes</li>
                  <li>Always consult a licensed immigration attorney before making immigration decisions</li>
                  <li>We are not responsible for any decisions made based on our content</li>
                </ul>
              </div>
              <p className="font-semibold">
                IMMIGRATION DECISIONS CAN HAVE LIFE-ALTERING CONSEQUENCES. Seek professional legal
                counsel from a licensed immigration attorney before taking any action.
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
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Information Accuracy</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Immigration laws and policies change frequently and without notice</li>
                  <li>We strive for accuracy but cannot guarantee all content is current or complete</li>
                  <li>Always verify information through official government sources (USCIS, DHS, State Department)</li>
                  <li>We are not liable for actions taken based on outdated or incorrect information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Immigration Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may optionally provide immigration categories of interest for content personalization</li>
                  <li>This information is used solely to curate your news feed</li>
                  <li>We do not share immigration interest data with government agencies except when legally required</li>
                  <li>You can update or remove this data at any time from your account settings</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Emergency Situations</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Our Service is not designed for emergency immigration situations</li>
                  <li>For urgent immigration matters, contact a licensed attorney or the relevant government agency directly</li>
                  <li>We are not responsible for delays in information delivery</li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Accounts */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">User Accounts and Responsibilities</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>To access certain features you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Keep your account credentials confidential</li>
                <li>Accept responsibility for all activity under your account</li>
                <li>Notify us immediately of unauthorized access or security breaches</li>
                <li>Use the Service only for lawful purposes in accordance with these Terms</li>
                <li>Not impersonate others or create false accounts</li>
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
                <li>Engage in or promote illegal activity</li>
                <li>Violate any local, national, or international law or regulation</li>
                <li>Use automated bots, scrapers, or crawlers to extract data from the Service</li>
                <li>Attempt to circumvent security measures or gain unauthorized access</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Distribute false or misleading immigration information</li>
                <li>Provide unauthorized legal advice to other users</li>
                <li>Reverse engineer or extract source code from the Service</li>
              </ul>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Intellectual Property</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                The Service and its original content, features, and functionality are owned by ImmigroNews
                and are protected by applicable intellectual property laws.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may not copy, modify, distribute, or create derivative works from our platform</li>
                <li>News content is aggregated from third-party sources and remains subject to those sources' copyrights</li>
                <li>We provide source attribution and links for all aggregated content</li>
                <li>AI-generated summaries produced by our platform are proprietary to ImmigroNews</li>
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
              <p className="font-semibold">TO THE FULLEST EXTENT PERMITTED BY LAW:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>OUR TOTAL LIABILITY IS LIMITED TO THE GREATER OF $50 OR THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS</li>
                <li>WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES</li>
                <li>WE ARE NOT LIABLE FOR IMMIGRATION APPLICATION OUTCOMES BASED ON OUR CONTENT</li>
                <li>WE ARE NOT LIABLE FOR THIRD-PARTY CONTENT, SERVICES, OR LINKED SITES</li>
                <li>WE ARE NOT LIABLE FOR SERVICE INTERRUPTIONS, DELAYS, OR DATA LOSS</li>
              </ul>
              <p className="text-sm bg-yellow-50 border border-yellow-200 p-4 rounded mt-4">
                <strong>Immigration-Specific:</strong> We are not responsible for any immigration
                application denials, approvals, delays, or other consequences arising from use of
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
                You agree to defend, indemnify, and hold harmless ImmigroNews and its officers, employees,
                and agents from any claims, losses, liabilities, or expenses (including attorneys' fees)
                arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party right</li>
                <li>Any content you submit through the Service</li>
              </ul>
            </div>
          </div>

          {/* Governing Law */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Gavel className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Governing Law and Dispute Resolution</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Governing Law</h3>
                <p>
                  These Terms are governed by and construed under the laws of the United States, without
                  regard to conflict of law principles.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Dispute Resolution</h3>
                <p>We prefer to resolve disputes informally. Please contact support@immigronews.com first.
                  If informal resolution fails, disputes will be resolved through binding arbitration
                  conducted in English under applicable arbitration rules.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Class Action Waiver</h3>
                <p>You agree to resolve disputes on an individual basis and waive any right to participate in
                  class-action lawsuits or class-wide arbitration.</p>
              </div>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Changes to These Terms</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                We may update these Terms from time to time. For material changes, we will notify
                registered users by email at least 14 days before the changes take effect. The updated
                date at the top of this page will always reflect the most recent revision.
              </p>
              <p>
                Continued use of the Service after changes constitutes acceptance of the updated Terms.
                If you disagree with any change, you must stop using the Service.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">Contact Us</h2>
            <p className="text-emerald-700">
              Questions about these Terms? Contact us at{" "}
              <strong>support@immigronews.com</strong>.
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
