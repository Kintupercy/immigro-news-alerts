
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import NewsFeed from "@/components/NewsFeed";
import SEO from "@/components/SEO";

const newsSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "ImmigroNews",
  "url": "https://immigronews.com",
  "description": "Real-time US immigration news: USCIS announcements, visa policy updates, TPS, advance parole, green card & enforcement news updated twice daily.",
  "publishingPrinciples": "https://immigronews.com/disclaimer",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "editorial",
    "email": "support@immigronews.com"
  },
  "sameAs": [
    "https://twitter.com/ImmigroNews",
    "https://instagram.com/ImmigroNews"
  ]
});

const itemListSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Latest US Immigration News Today",
  "description": "Breaking US immigration news: USCIS announcements, visa updates, TPS, advance parole, green card and policy changes. Updated twice daily from official sources.",
  "url": "https://immigronews.com/news",
  "about": {
    "@type": "Thing",
    "name": "US Immigration Policy and Enforcement"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ImmigroNews",
    "url": "https://immigronews.com"
  }
});

const News = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Latest US Immigration News Today – USCIS Updates & Policy Changes"
        description="Breaking US immigration news: USCIS announcements, visa updates, TPS, advance parole, green card & policy changes. Updated twice daily from official sources."
        keywords={[
          'latest immigration news', 'immigration updates today', 'us immigration news',
          'immigration update today', 'uscis news today', 'immigration news updates',
          'visa news', 'immigration law updates', 'immigration policy updates',
          'tps updates', 'advance parole news', 'green card news', 'immigration bulletin',
          'breaking immigration news', 'us immigration updates'
        ]}
        url="https://immigronews.com/news"
        canonicalUrl="https://immigronews.com/news"
        type="website"
      />
      <Helmet>
        <script type="application/ld+json">{newsSchema}</script>
        <script type="application/ld+json">{itemListSchema}</script>
      </Helmet>
      <Header />
      <div className="pt-4 sm:pt-0">
        <NewsFeed />
      </div>
    </div>
  );
};

export default News;
