
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DonationButton from "./DonationButton";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <span className="font-playfair text-2xl font-bold text-navy-800">
              Immigro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/news" className="text-gray-700 hover:text-navy-800 transition-colors">
              News
            </Link>
            <Link to="/resources" className="text-gray-700 hover:text-navy-800 transition-colors">
              Resources
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-navy-800 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-navy-800 transition-colors">
              Contact
            </Link>
            
            {/* Donation Button */}
            <DonationButton />

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/news">
                    <Bell className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="bg-navy-800 hover:bg-navy-900">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <Link
                to="/news"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-navy-800 hover:bg-gray-50 rounded-md"
                onClick={closeMenu}
              >
                News
              </Link>
              <Link
                to="/resources"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-navy-800 hover:bg-gray-50 rounded-md"
                onClick={closeMenu}
              >
                Resources
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-navy-800 hover:bg-gray-50 rounded-md"
                onClick={closeMenu}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-navy-800 hover:bg-gray-50 rounded-md"
                onClick={closeMenu}
              >
                Contact
              </Link>
              
              <div className="px-3 py-2">
                <DonationButton />
              </div>

              {user ? (
                <div className="space-y-2 px-3 py-2">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                    <Link to="/news" onClick={closeMenu}>
                      <Bell className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button onClick={() => { handleSignOut(); closeMenu(); }} variant="outline" size="sm" className="w-full">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 px-3 py-2">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                    <Link to="/auth" onClick={closeMenu}>Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full bg-navy-800 hover:bg-navy-900">
                    <Link to="/signup" onClick={closeMenu}>Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
