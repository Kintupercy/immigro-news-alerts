
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import RSSFeed from "@/components/RSSFeed";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <div className="py-16 bg-stone-50">
        <RSSFeed />
      </div>
    </div>
  );
};

export default Index;
