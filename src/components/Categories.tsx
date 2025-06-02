
import { Check } from 'lucide-react';

const Categories = () => {
  const categories = [
    { name: "Green Card / Permanent Residency", emoji: "🟢" },
    { name: "Citizenship & Naturalization", emoji: "🇺🇸" }, 
    { name: "Work Visas & Employment-Based", emoji: "💼" },
    { name: "Student Visas", emoji: "🎓" },
    { name: "Family-Based Immigration", emoji: "👨‍👩‍👧‍👦" },
    { name: "Investor & Entrepreneur Visas", emoji: "💰" },
    { name: "Asylum & Refugee", emoji: "🤝" },
    { name: "Deportation & Removal", emoji: "⚖️" },
    { name: "DACA & Dreamers", emoji: "🌟" },
    { name: "Border & Enforcement", emoji: "🛡️" },
    { name: "Temporary Visitors & Tourists", emoji: "✈️" },
    { name: "Religious Worker Visas", emoji: "⛪" }
  ];

  return (
    <section id="categories" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-4">
            Immigration Categories We Cover
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the categories that matter to you and receive targeted updates 
            for your specific immigration situation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{category.emoji}</span>
                <Check className="w-4 h-4 text-emerald-500 mr-4 flex-shrink-0" />
                <h3 className="font-playfair text-lg font-medium text-gray-900">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
