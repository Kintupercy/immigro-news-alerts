
import { ArrowRight, Bell, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-navy-50 to-emerald-50 py-20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-800 text-sm font-medium mb-6 animate-fade-in">
            <Bell className="w-4 h-4 mr-2" />
            Always Free • Always Updated • Always Accurate
          </div>
          
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            Stay Updated with
            <span className="text-emerald-600 block">Immigration Law Changes</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 animate-fade-in-up delay-200">
            Get real-time immigration news, policy updates, and expert analysis delivered straight to your inbox. 
            <strong className="text-emerald-700"> Completely free</strong>, powered by our community.
          </p>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">13+ Categories</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Bell className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Daily Updates</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
            <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-3">
              <Link to="/signup">
                Get Free Updates
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3 border-2">
              <Link to="/news">Browse News</Link>
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-6 animate-fade-in-up delay-500">
            By a former international student, for the immigration community • 
            <Link to="#support" className="text-emerald-600 hover:underline ml-1">
              Support our mission
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
