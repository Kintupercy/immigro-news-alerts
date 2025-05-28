
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "News", href: "/news" },
    { name: "Research", href: "#research" },
    { name: "Tools", href: "#tools" },
    { name: "Resources", href: "#resources" },
    { name: "Categories", href: "#categories" },
    { name: "About", href: "#about" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-amber-50/95 backdrop-blur-sm border-b border-amber-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-slate-800">⚖️ Immigro</Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                item.href.startsWith('/') ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-slate-700 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-slate-700 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                )
              ))}
            </div>
          </nav>

          {/* Search and Mobile menu button */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-700 hover:text-slate-900 hover:bg-amber-100"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-700 hover:text-slate-900 hover:bg-amber-100"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-amber-100/95 backdrop-blur-sm rounded-lg mt-2 mb-4">
              {navItems.map((item) => (
                item.href.startsWith('/') ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-slate-700 hover:text-slate-900 block px-3 py-2 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-slate-700 hover:text-slate-900 block px-3 py-2 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
