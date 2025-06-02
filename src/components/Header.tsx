
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import UrgentNewsAlert from "./UrgentNewsAlert";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <UrgentNewsAlert />
      
      <header className="bg-navy-800 text-cream-50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-cream-300" />
              <span className="font-playfair text-2xl font-bold">ImmigroNews</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-8 h-10">
                <Link 
                  to="/" 
                  className={`flex items-center h-full transition-colors duration-200 ${
                    isActive('/') ? 'text-cream-200 font-medium' : 'text-cream-300 hover:text-cream-100'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/resources" 
                  className={`flex items-center h-full transition-colors duration-200 ${
                    isActive('/resources') ? 'text-cream-200 font-medium' : 'text-cream-300 hover:text-cream-100'
                  }`}
                >
                  Resources
                </Link>
                <Link 
                  to="/about" 
                  className={`flex items-center h-full transition-colors duration-200 ${
                    isActive('/about') ? 'text-cream-200 font-medium' : 'text-cream-300 hover:text-cream-100'
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className={`flex items-center h-full transition-colors duration-200 ${
                    isActive('/contact') ? 'text-cream-200 font-medium' : 'text-cream-300 hover:text-cream-100'
                  }`}
                >
                  Contact
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Link to="/news">
                  <Button 
                    size="sm"
                    className="bg-cream-300 text-navy-800 hover:bg-cream-200"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-cream-300 hover:text-cream-100 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-navy-900 rounded-lg mt-2">
                <Link 
                  to="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive('/') ? 'bg-navy-700 text-cream-200' : 'text-cream-300 hover:bg-navy-700 hover:text-cream-100'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/resources" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive('/resources') ? 'bg-navy-700 text-cream-200' : 'text-cream-300 hover:bg-navy-700 hover:text-cream-100'
                  }`}
                >
                  Resources
                </Link>
                <Link 
                  to="/about" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive('/about') ? 'bg-navy-700 text-cream-200' : 'text-cream-300 hover:bg-navy-700 hover:text-cream-100'
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive('/contact') ? 'bg-navy-700 text-cream-200' : 'text-cream-300 hover:bg-navy-700 hover:text-cream-100'
                  }`}
                >
                  Contact
                </Link>

                <div className="px-3 py-2">
                  <Link to="/news" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      size="sm"
                      className="w-full bg-cream-300 text-navy-800 hover:bg-cream-200"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
