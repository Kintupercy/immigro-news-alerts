import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { AlertTriangle, Shield, Globe } from "lucide-react";

const LAST_UPDATED = "June 28, 2026";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Legal Disclaimer - ImmigroNews"
        description="Legal disclaimer for ImmigroNews regarding news aggregation, AI-assisted curation, information accuracy, and the limits of educational immigration content."
        keywords={['legal disclaimer', 'immigration news disclaimer', 'ImmigroNews disclaimer']}
        url="https://immigronews.com/disclaimer"
        canonicalUrl="https://immigronews.com/disclaimer"
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Legal Disclaimer",
          "description": "Legal disclaimer for ImmigroNews on news aggregation, AI-assisted curation, content attribution, and the limits of educational immigration information.",
          "url": "https://immigronews.com/disclaimer"
        })}
      </script>
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-emerald-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Legal Disclaimer</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Important legal information about ImmigroNews, our content sources, and how we use AI to curate immigration news.
            </p>
            <p className="text-gray-500 text-sm mt-2">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="space-y-8">

            {/* General Disclaimer */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">General Disclaimer</h2>
              </div>
              <div className="text-gray-700 space-y-4">
                <p>
                  The information provided on ImmigroNews is for general informational purposes only.
                  While we strive to keep content up to date and accurate, we make no representations
                  or warranties — express or implied — about the completeness, accuracy, reliability,
                  or suitability of any information on this website for any purpose.
                </p>
                <p>
                  Any reliance you place on information from ImmigroNews is strictly at your own risk.
                  We are not liable for any loss or damage — including indirect or consequential loss —
                  arising from your use of this website or information obtained through it.
                </p>
              </div>
            </section>

            {/* Not Legal Advice */}
            <section className="bg-red-50 rounded-lg border border-red-200 p-6">
              <h2 className="text-2xl font-semibold text-red-800 mb-4">Not Legal Advice</h2>
              <div className="text-red-700 space-y-4">
                <p className="font-bold">
                  IMPORTANT: ImmigroNews is NOT a law firm and does NOT provide legal advice.
                </p>
                <ul className="space-y-2">
                  <li>• All content is for educational and informational purposes only</li>
                  <li>• Nothing on this website constitutes legal advice or creates an attorney-client relationship</li>
                  <li>• Immigration laws are complex, change frequently, and depend heavily on individual circumstances</li>
                  <li>• Always consult a qualified, licensed immigration attorney for guidance specific to your situation</li>
                </ul>
                <p className="font-semibold">
                  Immigration decisions can have life-altering consequences. Do not rely solely on news
                  aggregation services — verify everything with official sources and legal professionals.
                </p>
              </div>
            </section>

            {/* AI-Assisted Curation */}
            <section className="bg-amber-50 rounded-lg border border-amber-200 p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 mr-2" />
                <h2 className="text-2xl font-semibold text-amber-800">AI-Assisted Content Curation</h2>
              </div>
              <div className="text-amber-700 space-y-4">
                <p>
                  ImmigroNews uses artificial intelligence — including the Perplexity API — to identify,
                  summarize, and categorize immigration news from public sources. You should be aware that:
                </p>
                <ul className="space-y-2">
                  <li>• Article summaries and category tags may be AI-generated and are subject to errors</li>
                  <li>• AI models can misinterpret context, miss nuance, or reflect training data cutoffs</li>
                  <li>• AI-generated summaries are editorial aids, not authoritative legal or policy interpretations</li>
                  <li>• We review and moderate AI output but cannot guarantee accuracy in every case</li>
                  <li>• Always read the original source article before acting on any summary</li>
                </ul>
              </div>
            </section>

            {/* News Aggregation & Attribution */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">News Aggregation & Content Attribution</h2>
              </div>
              <div className="text-gray-700 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Sources</h3>
                  <p className="mb-3">
                    ImmigroNews aggregates immigration news from publicly available sources, including:
                  </p>
                  <ul className="space-y-1">
                    <li>• Official government websites and announcements (USCIS, DHS, State Department, ICE, CBP)</li>
                    <li>• Major news organizations via RSS feeds and APIs (NPR, Reuters, AP, NYT, NBC, ABC, CBS, Fox News, Politico, and others)</li>
                    <li>• Immigration-focused legal publications and industry resources</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Attribution Standards</h3>
                  <ul className="space-y-1">
                    <li>• All articles display the original source domain</li>
                    <li>• Direct links to original articles are always provided</li>
                    <li>• We do not republish full article text — only summaries and excerpts</li>
                    <li>• Copyright notices are respected for all aggregated content</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Fair Use</h3>
                  <p>
                    Our aggregation of news summaries and excerpts operates under fair use principles for
                    news reporting and public interest commentary. ImmigroNews is a commercial service,
                    and our use of third-party content is limited to brief summaries with clear attribution
                    and links back to original sources.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Removal Requests</h3>
                  <p>
                    If you are a copyright holder and believe your content has been used inappropriately,
                    contact us at support@immigronews.com with:
                  </p>
                  <ul className="space-y-1 mt-2">
                    <li>• Identification of the copyrighted work and URL of the allegedly infringing material</li>
                    <li>• Your contact information and proof of copyright ownership</li>
                    <li>• A statement of good faith belief that the use is not authorized</li>
                  </ul>
                  <p className="mt-3">We will review and respond to valid requests within 5 business days.</p>
                </div>
              </div>
            </section>

            {/* Third-Party Links */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Links and Content</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Our Service contains links to external websites and original news articles. These links
                  are provided for informational purposes. We have no control over the content, privacy
                  practices, or accuracy of third-party sites.
                </p>
                <p>
                  Inclusion of any link does not imply endorsement by ImmigroNews. We are not responsible
                  for the content or opinions expressed on linked websites.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <div className="text-gray-700 space-y-4">
                <p>ImmigroNews, its owners, and affiliates are not liable for:</p>
                <ul className="space-y-1">
                  <li>• Any direct, indirect, incidental, or consequential damages</li>
                  <li>• Immigration application denials, delays, or adverse outcomes</li>
                  <li>• Errors or omissions in AI-generated content</li>
                  <li>• Legal fees or costs incurred from reliance on our information</li>
                  <li>• Damages from use of, or inability to use, this website</li>
                  <li>• Inaccuracies in content sourced from third-party news organizations or government agencies</li>
                </ul>
                <p>
                  This limitation applies to the fullest extent permitted by applicable law, even if we
                  have been advised of the possibility of such damages.
                </p>
              </div>
            </section>

            {/* Information Currency */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Currency</h2>
              <div className="text-gray-700">
                <p>
                  Immigration laws, policies, and procedures change frequently — sometimes without public
                  notice. Content on this website may become outdated. We publish updates twice daily
                  from official and authoritative sources, but we cannot guarantee real-time accuracy.
                  Always verify current requirements through official government channels such as
                  uscis.gov, travel.state.gov, and dhs.gov before taking any action.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">Questions or Concerns</h2>
              <p className="text-blue-700">
                For questions about this disclaimer, copyright concerns, or content attribution issues,
                contact us at <strong>support@immigronews.com</strong>.
              </p>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Disclaimer;
