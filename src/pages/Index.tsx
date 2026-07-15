
import { useEffect } from "react";
import Categories from "@/components/Categories";
import Features from "@/components/Features";
import FromTheBlog from "@/components/FromTheBlog";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestNews from "@/components/LatestNews";
import Pricing from "@/components/Pricing";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  console.log('Index component rendering');
  
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
        title="Latest US Immigration News & Daily Updates | ImmigroNews"
        description="Latest US immigration news updated twice daily from USCIS, DHS & major outlets. Breaking policy changes, visa updates, urgent alerts & free legal-aid matching."
        keywords={[
          'latest immigration news',
          'immigration updates today',
          'immigration law updates',
          'us immigration news',
          'immigration news',
          'visa updates',
          'green card news',
          'citizenship process',
          'USCIS updates',
          'immigration policy',
          'breaking immigration news',
          'official immigration announcements',
          'immigration law changes',
          'immigration attorney',
          'USCIS policy changes'
        ]}
        url="https://immigronews.com"
        canonicalUrl="https://immigronews.com"
        type="website"
      />

      {/* SoftwareApplication JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ImmigroNews",
          "applicationCategory": "NewsApplication",
          "operatingSystem": "Web",
          "url": "https://immigronews.com",
          "description": "Real-time immigration news alerts, USCIS updates, and legal help for immigrants navigating the U.S. system.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "author": {
            "@type": "Organization",
            "name": "ImmigroNews",
            "url": "https://immigronews.com"
          },
          "featureList": [
            "Real-time immigration news alerts",
            "13+ immigration categories",
            "Breaking news coverage",
            "Expert analysis from trusted sources",
            "Legal help matching with immigration attorneys",
            "Step-by-step immigration guides",
            "Spanish translation support"
          ]
        })}
      </script>

      <Header />
      <Hero />
      <LatestNews />
      <Features />
      <Categories />
      <FromTheBlog />
      <Pricing />
      <NewsletterSubscription />
      <Footer />
    </div>
  );
};

export default Index;
