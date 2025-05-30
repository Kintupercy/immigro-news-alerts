
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-sm sm:text-base text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="min-h-[44px] px-6">
          <a href="/" className="inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
