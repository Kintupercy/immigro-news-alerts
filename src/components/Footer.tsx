
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-bold">⚖️ Immigro</span>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <a
              href="https://twitter.com/immigro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
            >
              <span className="text-xl">🐦</span>
              Follow us on X
            </a>
            <a
              href="mailto:contact@immigro.com"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Contact us
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2024 Immigro. All rights reserved. Not legal advice.</p>
            <p className="mt-2 md:mt-0">
              For informational purposes only. Consult with a qualified immigration attorney for legal advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
