
import { useEffect } from "react";
import Categories from "@/components/Categories";
import Features from "@/components/Features";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestNews from "@/components/LatestNews";
import Pricing from "@/components/Pricing";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    // Auto-scroll functionality
    let scrollTimeout: NodeJS.Timeout;
    let isUserScrolling = false;
    let autoScrollEnabled = true;

    const handleUserScroll = () => {
      isUserScrolling = true;
      autoScrollEnabled = false;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
        autoScrollEnabled = true;
      }, 3000); // Resume auto-scroll after 3 seconds of no user interaction
    };

    const autoScroll = () => {
      if (!autoScrollEnabled || isUserScrolling) return;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const currentScroll = window.pageYOffset;
      
      // If we've reached the bottom, scroll back to top
      if (currentScroll + clientHeight >= scrollHeight - 10) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Scroll down slowly
        window.scrollBy({ top: 1, behavior: 'smooth' });
      }
    };

    // Add scroll listener for user interaction
    window.addEventListener('scroll', handleUserScroll, { passive: true });
    window.addEventListener('wheel', handleUserScroll, { passive: true });
    window.addEventListener('touchstart', handleUserScroll, { passive: true });

    // Start auto-scroll after initial delay
    const autoScrollInterval = setInterval(autoScroll, 50); // Adjust speed here

    return () => {
      clearInterval(autoScrollInterval);
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleUserScroll);
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchstart', handleUserScroll);
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <Hero />
      <Features />
      <LatestNews />
      <Categories />
      <Pricing />
      <NewsletterSubscription />
      <Footer />
    </div>
  );
};

export default Index;
