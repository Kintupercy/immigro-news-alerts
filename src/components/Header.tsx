
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, Crown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import UrgentNewsAlert from "./UrgentNewsAlert";
import { Badge } from "@/components/ui/badge";
import { useFreemiumFeatures } from "@/hooks/useFreemiumFeatures";
import UpgradeModal from "./UpgradeModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Header - Current user:', user?.email);
      return user;
    },
  });

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('Header - No user ID for admin check');
        return false;
      }
      
      console.log('Header - Checking admin status for user:', user.email, user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      console.log('Header - Admin check result:', { data, error });
      
      if (error) {
        console.log('Header - Admin check error:', error.message);
        return false;
      }
      return !!data;
    },
    enabled: !!user?.id,
  });

  const { isProMember, upgradeModalOpen, setUpgradeModalOpen } = useFreemiumFeatures(user);

  console.log('Header - Is admin:', isAdmin, 'for user:', user?.email);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Keep only urgent news alert for critical notifications */}
      <UrgentNewsAlert />
      
      <header className="bg-navy-800 text-cream-50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-cream-300" />
              <span className="font-playfair text-2xl font-bold">Immigro</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-8">
                <Link 
                  to="/" 
                  className={`transition-colors duration-200 ${
                    isActive('/') ? 'text-cream-200 font-medium' : 'text-cream-300 hover:text-cream-100'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/news" 
                  className={`transition-colors duration-200 ${
                    isActive('/news') ? 'text-cream-200 font-medium' : 'text-cream-300 hover:text-cream-100'
                  }`}
                >
                  News
                </Link>
                <Link 
                  to="/resources" 
                  className={`transition-colors duration-200 ${
                    isActive('/resources') ? 'text-cream-200 font-medium' : 'text-cream-300 hover:text-cream-100'
                  }`}
                >
                  Resources
                </Link>
                <Link 
                  to="/about" 
                  className={`transition-colors duration-200 ${
                    isActive('/about') ? 'text-cream-200 font-medium' : 'text-cream-300 hover:text-cream-100'
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className={`transition-colors duration-200 ${
                    isActive('/contact') ? 'text-cream-200 font-medium' : 'text-cream-300 hover:text-cream-100'
                  }`}
                >
                  Contact
                </Link>

                {/* Admin Link - Only show for admins */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`transition-colors duration-200 ${
                      isActive('/admin') ? 'text-cream-200 font-medium' : 'text-cream-300 hover:text-cream-100'
                    }`}
                  >
                    <Badge variant="secondary" className="bg-red-100 text-red-800">Admin</Badge>
                  </Link>
                )}
              </div>

              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-cream-300">Welcome back!</span>
                    {isProMember ? (
                      <Badge className="bg-emerald-600 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUpgradeModalOpen(true)}
                        className="border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-navy-800"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        Upgrade to Pro
                      </Button>
                    )}
                  </div>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline" 
                    size="sm"
                    className="border-cream-300 text-cream-300 hover:bg-cream-300 hover:text-navy-800"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/auth">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-cream-300 hover:bg-cream-700/20 hover:text-cream-100"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button 
                      size="sm"
                      className="bg-cream-300 text-navy-800 hover:bg-cream-200"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
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
                  to="/news" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive('/news') ? 'bg-navy-700 text-cream-200' : 'text-cream-300 hover:bg-navy-700 hover:text-cream-100'
                  }`}
                >
                  News
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

                {/* Admin Link for Mobile - Only show for admins */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive('/admin') ? 'bg-navy-700 text-cream-200' : 'text-cream-300 hover:bg-navy-700 hover:text-cream-100'
                    }`}
                  >
                    <Badge variant="secondary" className="bg-red-100 text-red-800 mr-2">Admin</Badge>
                    Dashboard
                  </Link>
                )}

                {user ? (
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-cream-300 text-sm">Welcome back!</p>
                      {isProMember ? (
                        <Badge className="bg-emerald-600 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUpgradeModalOpen(true)}
                          className="border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-navy-800"
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          Upgrade
                        </Button>
                      )}
                    </div>
                    <Button 
                      onClick={handleSignOut}
                      variant="outline" 
                      size="sm"
                      className="w-full border-cream-300 text-cream-300 hover:bg-cream-300 hover:text-navy-800"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="px-3 py-2 space-y-2">
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full text-cream-300 hover:bg-cream-700/20 hover:text-cream-100"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        size="sm"
                        className="w-full bg-cream-300 text-navy-800 hover:bg-cream-200"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <UpgradeModal 
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
      />
    </>
  );
};

export default Header;
