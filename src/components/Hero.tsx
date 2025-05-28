
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
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Curved overlay effect */}
      <div className="absolute inset-0">
        <svg
          className="absolute bottom-0 w-full h-64"
          viewBox="0 0 1200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 120L50 110C100 100 200 80 300 70C400 60 500 60 600 65C700 70 800 80 900 85C1000 90 1100 90 1150 90L1200 90V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0Z"
            fill="rgba(16, 185, 129, 0.1)"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Industry-leading immigration
          <br />
          <span className="text-emerald-100">law updates and alerts</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Stay informed with real-time, personalized immigration law updates tailored to your specific status and needs in the ever-evolving U.S. immigration landscape.
        </p>

        {/* Email subscription form */}
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 py-4 text-lg bg-gray-900/80 border-gray-700 text-white placeholder-gray-400 focus:border-emerald-400 focus:ring-emerald-400"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="px-8 py-4 text-lg bg-white text-emerald-600 hover:bg-emerald-50 font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Subscribe
          </Button>
        </form>

        <p className="text-sm text-emerald-200 mt-4">
          Join thousands staying updated on immigration law changes
        </p>
      </div>
    </section>
  );
};

export default Hero;
