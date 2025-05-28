
import { Bell, Users, BookOpen, Shield } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Bell,
      title: "Real-Time Alerts",
      description: "Get instant notifications about immigration law changes that affect your specific status and situation."
    },
    {
      icon: Users,
      title: "Personalized Categories",
      description: "Choose from 13+ immigration categories including Green Cards, Work Visas, Student Visas, and more."
    },
    {
      icon: BookOpen,
      title: "Expert Analysis",
      description: "Receive curated updates and analysis from trusted immigration law sources and legal experts."
    },
    {
      icon: Shield,
      title: "Reliable Sources",
      description: "All updates sourced from official government agencies and respected immigration law organizations."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-4">
            Stay Ahead of Immigration Changes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform delivers personalized, real-time immigration law updates 
            to help you navigate the complex U.S. immigration system with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-6">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
