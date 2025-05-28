
import AlertBanner from "@/components/AlertBanner";
import Categories from "@/components/Categories";
import Features from "@/components/Features";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustedBy from "@/components/TrustedBy";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, LogIn } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <AlertBanner />
      <Header />
      
      {/* Call-to-Action for Authentication */}
      <div className="bg-navy-800 text-cream-50 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <p className="text-sm">
              Get personalized immigration news tailored to your interests
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm" className="bg-transparent border-cream-200 text-cream-50 hover:bg-cream-50 hover:text-navy-800">
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-cream-50 text-navy-800 hover:bg-cream-100">
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
      <Categories />
      <TrustedBy />
    </div>
  );
};

export default Index;
