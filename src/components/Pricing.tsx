
import { Check, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with immigration news",
      features: [
        "3 immigration categories",
        "Email notifications",
        "Basic news archive",
        "English only",
        "Ads supported"
      ],
      buttonText: "Get Started",
      popular: false,
      limitations: [
        "Limited to 3 categories",
        "No SMS alerts",
        "No Spanish translation", 
        "Ads included"
      ]
    },
    {
      name: "Pro Monthly",
      price: "$4.99",
      period: "per month",
      description: "For individuals who need comprehensive coverage",
      features: [
        "Weekly news digest",
        "Real-time alerts",
        "All 13+ immigration categories",
        "Email notifications",
        "SMS notifications",
        "Spanish translation",
        "Full news archive",
        "Priority support",
        "No ads"
      ],
      buttonText: "Start Pro Trial",
      popular: true,
      valueProps: [
        "Instant breaking news alerts",
        "Never miss urgent updates",
        "Complete category coverage",
        "Ad-free reading experience"
      ]
    },
    {
      name: "Pro Annual",
      price: "$41.99",
      period: "per year",
      originalPrice: "$59.88",
      description: "Best value - Save 30% with annual billing",
      features: [
        "Weekly news digest",
        "Real-time alerts",
        "All 13+ immigration categories", 
        "Email notifications",
        "SMS notifications",
        "Spanish translation",
        "Full news archive",
        "Priority support",
        "No ads",
        "30% savings vs monthly"
      ],
      buttonText: "Start Annual Trial",
      popular: false,
      savings: "Save $18/year"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Stay informed with the right level of immigration news coverage for your needs
          </p>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Start free, upgrade when you need more</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-lg shadow-sm border-2 p-8 transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-emerald-500 transform scale-105 shadow-lg' 
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    {plan.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        {plan.originalPrice} per year
                      </div>
                    )}
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                    {plan.savings && (
                      <div className="text-emerald-600 font-medium text-sm mt-1">
                        {plan.savings}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${
                        feature === "No ads" 
                          ? "text-emerald-500" 
                          : feature === "Ads supported"
                          ? "text-gray-400"
                          : "text-emerald-500"
                      }`} />
                      <span className={`${
                        feature === "No ads" 
                          ? "text-emerald-700 font-medium" 
                          : feature === "Ads supported"
                          ? "text-gray-500"
                          : "text-gray-700"
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.valueProps && (
                  <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                    <h4 className="font-medium text-emerald-800 mb-2">Why upgrade?</h4>
                    <ul className="space-y-1">
                      {plan.valueProps.map((prop, i) => (
                        <li key={i} className="text-sm text-emerald-700 flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-emerald-500" />
                          {prop}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button asChild className={`w-full transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}>
                  <Link to="/auth">
                    {plan.buttonText}
                  </Link>
                </Button>

                {plan.name === "Free" && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    No credit card required
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 animate-fade-in">
          <div className="bg-white rounded-lg p-6 shadow-sm border max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-4">
              Start with our free plan and upgrade anytime when you need more features. 
              Cancel your Pro subscription anytime with no questions asked.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>✓ No setup fees</span>
              <span>✓ Cancel anytime</span>
              <span>✓ 24/7 support</span>
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
