
const Footer = () => {
  const footerLinks = {
    "Platform": ["News", "Research", "Tools", "Resources", "Categories"],
    "Immigration Types": ["Green Card", "Work Visas", "Student Visas", "Family-Based", "Citizenship"],
    "Resources": ["FAQ", "Glossary", "Legal Disclaimer", "Privacy Policy", "Terms of Service"],
    "Company": ["About", "Contact", "Blog", "Careers", "Press"]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <span className="text-2xl font-bold">⚖️ Immigro</span>
            </div>
            <p className="text-gray-400 mb-6">
              Your trusted source for real-time immigration law updates and personalized alerts.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Stay connected:</p>
              <div className="flex space-x-4">
                <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📧</span>
                <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📱</span>
                <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">🐦</span>
              </div>
            </div>
          </div>

          {/* Footer links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Immigro. All rights reserved. Not legal advice.
            </p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              For informational purposes only. Consult with a qualified immigration attorney for legal advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
