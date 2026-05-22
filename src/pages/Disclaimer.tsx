
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { AlertTriangle, Shield, Globe } from "lucide-react";

const Disclaimer = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Legal Disclaimer - ImmigroNews"
        description="Legal disclaimer for ImmigroNews regarding news aggregation, information accuracy, and legal advice limitations."
        keywords={['legal disclaimer', 'immigration news disclaimer', 'ImmigroNews disclaimer']}
        url="https://immigronews.com/disclaimer"
        canonicalUrl="https://immigronews.com/disclaimer"
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Legal Disclaimer",
          "description": "Legal disclaimer for ImmigroNews on news aggregation, content attribution, and the limits of educational immigration information.",
          "url": "https://immigronews.com/disclaimer"
        })}
      </script>
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-navy-600 mr-3" />
            <h1 className="text-3xl font-bold text-navy-800">Legal Disclaimer</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Important legal information regarding the use of ImmigrowNews and our content aggregation services.
          </p>
        </div>

        <div className="space-y-8">
          {/* General Disclaimer */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
              <h2 className="text-2xl font-semibold text-navy-800">General Disclaimer</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                The information provided on ImmigrowNews is for general informational purposes only. 
                While we strive to keep the information up to date and accurate, we make no representations 
                or warranties of any kind, express or implied, about the completeness, accuracy, reliability, 
                suitability, or availability of the information, products, services, or related graphics 
                contained on the website for any purpose.
              </p>
              <p className="text-gray-700">
                Any reliance you place on such information is therefore strictly at your own risk. 
                In no event will we be liable for any loss or damage including without limitation, 
                indirect or consequential loss or damage, or any loss or damage whatsoever arising 
                from loss of data or profits arising out of, or in connection with, the use of this website.
              </p>
            </div>
          </section>

          {/* Not Legal Advice */}
          <section className="bg-red-50 rounded-lg border border-red-200 p-6">
            <h2 className="text-2xl font-semibold text-red-800 mb-4">Not Legal Advice</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-red-700 mb-4 font-medium">
                <strong>IMPORTANT:</strong> ImmigrowNews is NOT a law firm and does NOT provide legal advice.
              </p>
              <ul className="text-red-700 space-y-2">
                <li>• The information provided is for educational and informational purposes only</li>
                <li>• Nothing on this website should be construed as legal advice</li>
                <li>• Immigration laws are complex and constantly changing</li>
                <li>• Individual circumstances vary greatly and require personalized legal guidance</li>
                <li>• Always consult with a qualified immigration attorney for legal advice specific to your situation</li>
              </ul>
            </div>
          </section>

          {/* Enhanced News Aggregation & Attribution */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Globe className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-2xl font-semibold text-navy-800">News Aggregation & Content Attribution</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Sources & Attribution</h3>
              <p className="text-gray-700 mb-4">
                ImmigrowNews aggregates immigration-related news from various publicly available sources under fair use principles. 
                All content is properly attributed to its original source, including:
              </p>
              <ul className="text-gray-700 space-y-1 mb-4">
                <li>• Government websites and official announcements (USCIS, DHS, State Department, etc.)</li>
                <li>• Reputable news organizations and media outlets</li>
                <li>• Legal publications and industry resources</li>
                <li>• Public statements from immigration authorities</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Attribution Standards</h3>
              <p className="text-gray-700 mb-4">
                We maintain strict attribution standards for all aggregated content:
              </p>
              <ul className="text-gray-700 space-y-1 mb-4">
                <li>• All articles clearly display the original source domain</li>
                <li>• Direct links to original articles are always provided</li>
                <li>• "Originally published by [Source]" attribution is included</li>
                <li>• Fair use statements accompany aggregated content</li>
                <li>• Copyright information is preserved and respected</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Copyright & Fair Use</h3>
              <p className="text-gray-700 mb-4">
                Our content aggregation operates under the fair use provisions of copyright law for:
              </p>
              <ul className="text-gray-700 space-y-1 mb-4">
                <li>• Educational and informational purposes</li>
                <li>• News reporting and commentary</li>
                <li>• Public interest immigration information</li>
                <li>• Non-commercial educational use</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Removal Requests</h3>
              <p className="text-gray-700">
                If you are a copyright holder and believe your content has been used inappropriately, 
                please contact us immediately at support@immigronews.com with:
              </p>
              <ul className="text-gray-700 space-y-1 mt-2">
                <li>• Identification of the copyrighted work</li>
                <li>• Location of the allegedly infringing material</li>
                <li>• Your contact information and copyright ownership proof</li>
                <li>• A statement of good faith belief that use is not authorized</li>
              </ul>
            </div>
          </section>

          {/* Third Party Links */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">Third-Party Links and Content</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                Our website contains links to third-party websites and resources. These links 
                are provided for convenience and informational purposes only. We have no control 
                over the content, privacy policies, or practices of third-party sites.
              </p>
              <p className="text-gray-700">
                The inclusion of any link does not imply endorsement by ImmigrowNews. We are not 
                responsible for the content, accuracy, or opinions expressed on linked websites.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">Limitation of Liability</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                In no event shall ImmigrowNews, its owners, employees, or affiliates be liable for:
              </p>
              <ul className="text-gray-700 space-y-1 mb-4">
                <li>• Any direct, indirect, incidental, special, or consequential damages</li>
                <li>• Loss of profits, data, or business opportunities</li>
                <li>• Immigration application denials or delays</li>
                <li>• Legal fees or costs incurred due to reliance on our information</li>
                <li>• Any damages arising from the use or inability to use our website</li>
              </ul>
              <p className="text-gray-700">
                This limitation applies even if we have been advised of the possibility of such damages.
              </p>
            </div>
          </section>

          {/* Changes to Information */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-navy-800 mb-4">Changes to Information</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700">
                Immigration laws, policies, and procedures are subject to frequent changes. 
                Information on this website may become outdated without notice. We reserve the 
                right to modify, update, or remove content at any time without prior notice. 
                Users are responsible for verifying current information with official sources.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Questions or Concerns</h2>
            <p className="text-blue-700">
              If you have any questions about this disclaimer, copyright concerns, or content attribution issues, 
              please contact us at:
            </p>
            <div className="mt-4 text-blue-700">
              <p><strong>Legal/Copyright Issues:</strong> support@immigronews.com</p>
              <p><strong>General Contact:</strong> support@immigronews.com</p>
            </div>
          </section>

          <div className="text-center text-gray-500 text-sm mt-8">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Disclaimer;
