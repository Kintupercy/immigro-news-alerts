
import Header from "@/components/Header";
import NewsFeed from "@/components/NewsFeed";
import SEO from "@/components/SEO";

const News = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Latest Immigration News & Updates"
        description="Browse the latest immigration news, policy changes, and visa updates. Stay informed with real-time alerts and expert analysis."
        keywords={['immigration news', 'latest updates', 'visa news', 'green card updates', 'citizenship news']}
        url="https://immigro.app/news"
      />
      <Header />
      <div className="pt-4 sm:pt-0">
        <NewsFeed />
      </div>
    </div>
  );
};

export default News;
