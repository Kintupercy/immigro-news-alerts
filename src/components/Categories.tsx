
import { Link } from 'react-router-dom';

const Categories = () => {
  const categories = [
    "Green Card / Permanent Residency",
    "Citizenship & Naturalization", 
    "International Students",
    "Family-Based Immigration",
    "Work Visas & Employment-Based",
    "Humanitarian & Refugee/Asylee",
    "Temporary Visitors & Tourists",
    "Exchange Visitors & Cultural Programs",
    "Investor & Entrepreneur Visas",
    "Religious Worker Visas",
    "Specialty Occupations & NAFTA/USMCA",
    "Undocumented & Mixed-Status Families",
    "General Immigration Law & Policy"
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
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-4 flex-shrink-0"></div>
                <h3 className="text-lg font-medium text-gray-900">
                  {category}
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
