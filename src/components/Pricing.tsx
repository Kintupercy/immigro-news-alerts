
import { Check, Heart, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-4">
            Free for Everyone
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            All immigration news features are completely free and accessible to everyone.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-gray-700 font-medium">Made with love by a former international student</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Access */}
          <div className="relative bg-white rounded-lg shadow-sm border-2 border-emerald-500 p-8 transition-all duration-300 hover:shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                <Zap className="w-3 h-3 mr-1" />
                All Features Included
              </Badge>
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-2">
                  Immigro News
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-emerald-600">Free</span>
                  <span className="text-gray-600 ml-2">forever</span>
                </div>
                <p className="text-gray-600">Complete immigration news coverage for everyone</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "Real-time immigration alerts",
                  "All 13+ immigration categories",
                  "Breaking news coverage",
                  "Weekly news digest",
                  "Spanish translation",
                  "Full news archive",
                  "Category filtering",
                  "Mobile-friendly design",
                  "No ads or paywalls",
                  "Always up-to-date"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 mr-3 flex-shrink-0 text-emerald-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-300">
                <Link to="/news">
                  Start Reading News
                </Link>
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                No signup required • No hidden fees
              </p>
            </div>
          </div>

          {/* Donation Box */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border-2 border-blue-200 p-8 transition-all duration-300 hover:shadow-lg">
            <div className="text-center mb-6">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-2">
                Support Immigro
              </h3>
              <p className="text-gray-600 mb-4">
                Help us keep this platform free for everyone
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white/70 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  "Immigro is run by a former international student who understands the challenges of navigating US immigration. Your support helps us:"
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-blue-500" />
                    Keep servers running 24/7
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-blue-500" />
                    Add new features
                  </li>
                  <li className="flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    Stay independent & ad-light
                  </li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={() => window.open('https://ko-fi.com/immigro', '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate via Ko-fi
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Every contribution helps keep Immigro free for students and immigrants worldwide
            </p>
          </div>
        </div>

        <div className="text-center mt-12 animate-fade-in">
          <div className="bg-white rounded-lg p-6 shadow-sm border max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Why is Immigro free?</h3>
            <p className="text-gray-600 mb-4">
              As a former international student, I know how expensive immigration can be. 
              Information should never be a barrier to understanding your rights and options.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>✓ No paywalls</span>
              <span>✓ No signup required</span>
              <span>✓ Always free</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            © 2024 Immigro. Not legal advice. For informational purposes only.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
