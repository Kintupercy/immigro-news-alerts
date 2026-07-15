
import { useState, useEffect } from "react";
import { Menu, X, Globe, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import UrgentNewsAlert from "./UrgentNewsAlert";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/news", label: "News" },
  { to: "/blog", label: "Blog" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Elevate the header once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <UrgentNewsAlert />

      <header
        className={`sticky top-0 z-50 text-cream-50 border-b transition-all duration-300 bg-navy-800/90 backdrop-blur-lg supports-[backdrop-filter]:bg-navy-800/85 ${
          scrolled ? "border-cream-200/10 shadow-lg shadow-navy-900/30" : "border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-cream-400/10 ring-1 ring-cream-400/30 transition-all duration-300 group-hover:ring-cream-400/60 group-hover:bg-cream-400/20">
                <Globe className="h-5 w-5 text-cream-400" />
              </span>
              <span className="font-playfair text-2xl font-bold tracking-tight">
                Immigro<span className="text-cream-400">News</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-cream-400 after:transition-transform after:duration-300 after:origin-left ${
                    isActive(to)
                      ? "text-cream-50 after:scale-x-100"
                      : "text-cream-300 hover:text-cream-50 after:scale-x-0 hover:after:scale-x-100"
                  }`}
                >
                  {label}
                </Link>
              ))}

              {/* CTA */}
              <Link
                to="/signup"
                className="ml-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cream-400 text-navy-900 text-sm font-semibold shadow-md shadow-cream-400/20 transition-all duration-200 hover:bg-cream-300 hover:shadow-lg hover:shadow-cream-400/30 hover:-translate-y-px"
              >
                <Bell className="h-4 w-4" />
                Get Alerts
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-cream-300 hover:text-cream-100 hover:bg-navy-700/70 rounded-xl transition-colors duration-200"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="mb-3 p-2 space-y-1 bg-navy-900/95 backdrop-blur-xl rounded-2xl border border-cream-200/10 shadow-xl shadow-navy-900/40">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors duration-200 ${
                      isActive(to)
                        ? "bg-cream-400/15 text-cream-50"
                        : "text-cream-300 hover:bg-navy-700/70 hover:text-cream-100"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        isActive(to) ? "bg-cream-400" : "bg-cream-200/20"
                      }`}
                    />
                    {label}
                  </Link>
                ))}

                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 mt-2 px-4 py-3 rounded-xl bg-cream-400 text-navy-900 text-base font-semibold hover:bg-cream-300 transition-colors duration-200"
                >
                  <Bell className="h-4 w-4" />
                  Get Alerts
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
