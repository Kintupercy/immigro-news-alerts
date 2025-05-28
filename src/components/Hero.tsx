
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Users, Clock, Shield, CheckCircle } from "lucide-react";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribe with email:", email);
    setShowSuccess(true);
    setEmail("");
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with exact gradient from image */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600">
        {/* Curved overlay effects similar to the image */}
        <div className="absolute inset-0">
          <svg
            className="absolute top-0 w-full h-64"
            viewBox="0 0 1200 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0L50 10C100 20 200 40 300 50C400 60 500 60 600 55C700 50 800 40 900 35C1000 30 1100 30 1150 30L1200 30V0H1150C1100 0 1000 0 900 0C800 0 700 0 600 0C500 0 400 0 300 0C200 0 100 0 50 0H0Z"
              fill="rgba(0, 0, 0, 0.1)"
            />
          </svg>
          <svg
            className="absolute bottom-0 w-full h-64"
            viewBox="0 0 1200 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L50 110C100 100 200 80 300 70C400 60 500 60 600 65C700 70 800 80 900 85C1000 90 1100 90 1150 90L1200 90V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0Z"
              fill="rgba(0, 0, 0, 0.1)"
            />
          </svg>
        </div>
        <div className="absolute top-1/3 left-0 w-full h-96">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 200C300 100 600 300 1200 200V400H0V200Z"
              fill="rgba(0, 0, 0, 0.05)"
            />
          </svg>
        </div>
      </div>

      {/* Floating Recent Update Badge */}
      <div className="absolute top-20 right-4 md:right-8 z-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-white text-sm animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Latest Update</span>
        </div>
        <p className="text-xs text-white/80 mt-1">H-1B policy changes - 2 days ago</p>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Welcome aboard! Check your email for confirmation.</span>
            </div>
          </div>
        )}

        <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight">
          Stay Informed on all
          <br />
          <span className="text-amber-400 font-bold">US Immigration Law</span>
        </h1>
        
        {/* Enhanced Value Proposition */}
        <div className="mb-8">
          <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto leading-relaxed font-light">
            Get notified 24-48 hours before immigration policy changes affect you
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-white/70 text-sm mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>15,000+ subscribers</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Trusted by attorneys</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Real-time alerts</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["No legal jargon", "Plain English updates", "Mobile alerts"].map((benefit) => (
              <span key={benefit} className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 text-sm border border-white/20">
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* Enhanced Email subscription form */}
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 py-3 text-base bg-gray-900/90 border-gray-700 text-white placeholder-gray-400 focus:border-white focus:ring-white rounded-full"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="px-8 py-3 text-base bg-white text-gray-900 hover:bg-gray-100 font-medium transition-all duration-200 rounded-full"
          >
            Get Free Updates
          </Button>
        </form>

        {/* Enhanced bottom text with urgency */}
        <div className="text-center">
          <p className="text-sm text-white/60 mb-2">
            Join thousands staying ahead of immigration law changes
          </p>
          <p className="text-xs text-amber-300 font-medium">
            ⚡ Don't miss the next critical update
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
