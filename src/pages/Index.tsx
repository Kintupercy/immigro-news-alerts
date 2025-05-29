
import { useEffect } from "react";
import Categories from "@/components/Categories";
import Features from "@/components/Features";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestNews from "@/components/LatestNews";
import Pricing from "@/components/Pricing";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, LogIn } from "lucide-react";

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
      
      {/* Call-to-Action for Authentication */}
      <div className="bg-navy-800 text-cream-50 py-4 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <p className="text-sm">
              Get personalized immigration news tailored to your interests
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm" className="bg-transparent border-cream-200 text-cream-50 hover:bg-cream-50 hover:text-navy-800 transition-all duration-300 hover:scale-105">
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-cream-50 text-navy-800 hover:bg-cream-100 transition-all duration-300 hover:scale-105">
              <Link to="/auth" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
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
