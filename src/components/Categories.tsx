
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const Categories = () => {
  const categories = [
    { name: "Green Card / Permanent Residency", emoji: "🟢" },
    { name: "Citizenship & Naturalization", emoji: "🇺🇸" }, 
    { name: "International Students", emoji: "🎓" },
    { name: "Family-Based Immigration", emoji: "👨‍👩‍👧‍👦" },
    { name: "Work Visas & Employment-Based", emoji: "💼" },
    { name: "Humanitarian & Refugee/Asylee", emoji: "🤝" },
    { name: "Temporary Visitors & Tourists", emoji: "✈️" },
    { name: "Exchange Visitors & Cultural Programs", emoji: "🌍" },
    { name: "Investor & Entrepreneur Visas", emoji: "💰" },
    { name: "Religious Worker Visas", emoji: "⛪" },
    { name: "Specialty Occupations & NAFTA/USMCA", emoji: "🔧" },
    { name: "Undocumented & Mixed-Status Families", emoji: "📋" }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
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
                <h3 className="text-lg font-medium text-gray-900">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/signup">
            <button className="bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-colors duration-200 transform hover:scale-105">
              Get Started - Choose Your Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
