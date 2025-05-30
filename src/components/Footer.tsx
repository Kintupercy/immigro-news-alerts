
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-8 w-8 text-cream-300" />
              <span className="font-playfair text-2xl font-bold">Immigro</span>
            </div>
            <p className="text-cream-300 mb-6 max-w-md">
              Stay informed with the latest immigration news, policy updates, and expert analysis. 
              Your trusted source for immigration information.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-cream-400 hover:text-cream-200 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-cream-400 hover:text-cream-200 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-cream-400 hover:text-cream-200 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-cream-400 hover:text-cream-200 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-cream-300 hover:text-cream-100 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-cream-300 hover:text-cream-100 transition-colors">
                  Latest News
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-cream-300 hover:text-cream-100 transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-cream-300 hover:text-cream-100 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-cream-300 hover:text-cream-100 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-cream-400" />
                <span className="text-cream-300">hello@immigro.app</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-cream-400" />
                <span className="text-cream-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-cream-400" />
                <span className="text-cream-300">New York, NY</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-cream-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-cream-400 text-sm">
              © 2024 Immigro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-cream-400 hover:text-cream-200 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-cream-400 hover:text-cream-200 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
