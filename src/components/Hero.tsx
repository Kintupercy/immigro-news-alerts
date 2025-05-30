
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Logo matching Header design */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Globe className="h-12 w-12 text-cream-300" />
            <span className="font-playfair text-4xl font-bold text-cream-50">Immigro</span>
          </div>

          <Badge variant="secondary" className="mb-6 bg-emerald-100 text-emerald-800">
            Real-time Immigration Updates
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-cream-50 mb-6 leading-tight">
            Stay Ahead of
            <span className="block text-emerald-400">Immigration Changes</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-cream-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get instant notifications about visa updates, policy changes, and breaking immigration news. 
            Never miss critical information that affects your journey.
          </p>

          {/* Key benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 text-cream-200">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>Real-time alerts</span>
            </div>
            <div className="flex items-center space-x-2 text-cream-200">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>Expert analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-cream-200">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span>Multiple languages</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg font-semibold shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/news">
              <Button 
                variant="outline" 
                size="lg"
                className="border-cream-300 text-cream-300 hover:bg-cream-300 hover:text-navy-800 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                View Latest News
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="text-cream-400 text-sm">
            <p className="mb-2">Trusted by thousands of immigrants worldwide</p>
            <div className="flex justify-center space-x-6 text-xs">
              <span>✓ Always free tier available</span>
              <span>✓ No spam, ever</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
