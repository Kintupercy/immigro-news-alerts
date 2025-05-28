
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

const Hero = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribe with email:", email);
    // TODO: Integrate with backend when ready
    setEmail("");
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
        {/* Flowing wave effects */}
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

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight">
          Stay Informed on all
          <br />
          <span className="text-amber-400 font-bold">US Immigration Law</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          Get 24/7 alerts and news on all US Immigration policy and law changes
        </p>

        {/* Email subscription form with dark styling like the image */}
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="email"
              placeholder="Email address"
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
            Subscribe
          </Button>
        </form>

        <p className="text-sm text-white/60 mt-6">
          Join 10,000+ staying updated on US immigration law changes
        </p>
      </div>
    </section>
  );
};

export default Hero;
