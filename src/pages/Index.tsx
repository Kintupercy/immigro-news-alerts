
import { useEffect } from "react";
import Categories from "@/components/Categories";
import Features from "@/components/Features";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestNews from "@/components/LatestNews";
import Pricing from "@/components/Pricing";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AdBanner from "@/components/AdBanner";

const Index = () => {
  useEffect(() => {
    // Auto-scroll functionality - disabled on mobile for better UX
    let scrollTimeout: NodeJS.Timeout;
    let isUserScrolling = false;
    let autoScrollEnabled = true;

    // Check if device is mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      autoScrollEnabled = false;
    }

    const handleUserScroll = () => {
      isUserScrolling = true;
      autoScrollEnabled = false;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
        if (!isMobile) {
          autoScrollEnabled = true;
        }
      }, 3000);
    };

    const autoScroll = () => {
      if (!autoScrollEnabled || isUserScrolling || isMobile) return;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const currentScroll = window.pageYOffset;
      
      if (currentScroll + clientHeight >= scrollHeight - 10) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollBy({ top: 1, behavior: 'smooth' });
      }
    };

    if (!isMobile) {
      window.addEventListener('scroll', handleUserScroll, { passive: true });
      window.addEventListener('wheel', handleUserScroll, { passive: true });
      window.addEventListener('touchstart', handleUserScroll, { passive: true });
    }

    const autoScrollInterval = !isMobile ? setInterval(autoScroll, 50) : null;

    return () => {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
      clearTimeout(scrollTimeout);
      if (!isMobile) {
        window.removeEventListener('scroll', handleUserScroll);
        window.removeEventListener('wheel', handleUserScroll);
        window.removeEventListener('touchstart', handleUserScroll);
      }
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SEO 
        title="Immigro - Stay Updated with Immigration Law Changes"
        description="Get real-time immigration news, policy updates, and expert analysis. Stay informed about visa requirements, green card processes, and citizenship changes."
        keywords={['immigration news', 'visa updates', 'green card', 'citizenship', 'immigration policy', 'USCIS updates']}
        url="https://immigro.app"
      />
      <Header />
      <Hero />
      
      {/* Ad after Hero section - responsive spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <AdBanner position="header" />
      </div>
      
      <Features />
      <LatestNews />
      
      {/* Ad between sections - responsive spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <AdBanner position="between-articles" />
      </div>
      
      <Categories />
      <Pricing />
      <NewsletterSubscription />
      <Footer />
    </div>
  );
};

export default Index;
