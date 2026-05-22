
import Header from "@/components/Header";
import NewsFeed from "@/components/NewsFeed";
import SEO from "@/components/SEO";

const News = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Latest Immigration News & USCIS Updates 2026"
        description="Browse the latest U.S. immigration news, USCIS announcements, visa policy changes, and real-time alerts with expert analysis from trusted sources."
        keywords={['immigration news', 'latest updates', 'visa news', 'green card updates', 'citizenship news', 'USCIS news', 'immigration policy changes', 'visa bulletin', 'breaking immigration news']}
        url="https://immigronews.com/news"
        canonicalUrl="https://immigronews.com/news"
        type="website"
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Latest Immigration News",
          "description": "Browse the latest U.S. immigration news, USCIS announcements, visa policy changes, and real-time alerts.",
          "url": "https://immigronews.com/news",
          "about": "U.S. immigration policy and enforcement news",
          "publisher": {
            "@type": "Organization",
            "name": "ImmigroNews",
            "url": "https://immigronews.com"
          }
        })}
      </script>
      <Header />
      <div className="pt-4 sm:pt-0">
        <NewsFeed />
      </div>
    </div>
  );
};

export default News;
