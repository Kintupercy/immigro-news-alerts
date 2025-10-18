
import Header from "@/components/Header";
import NewsFeed from "@/components/NewsFeed";
import SEO from "@/components/SEO";

const News = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Latest Immigration News & Updates - Breaking Policy Changes"
        description="Browse the latest immigration news, policy changes, visa updates, and USCIS announcements. Stay informed with real-time alerts, expert analysis, and breaking immigration news from trusted sources."
        keywords={['immigration news', 'latest updates', 'visa news', 'green card updates', 'citizenship news', 'USCIS news', 'immigration policy changes', 'visa bulletin', 'breaking immigration news']}
        url="https://immigronews.com/news"
        type="website"
      />
      <Header />
      <div className="pt-4 sm:pt-0">
        <NewsFeed />
      </div>
    </div>
  );
};

export default News;
