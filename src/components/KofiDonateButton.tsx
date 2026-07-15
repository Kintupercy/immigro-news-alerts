
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface KofiDonateButtonProps {
  className?: string;
  variant?: 'fixed' | 'banner';
}

const KofiDonateButton = ({ className = '', variant = 'fixed' }: KofiDonateButtonProps) => {
  const handleDonate = () => {
    window.open('https://ko-fi.com/immigro', '_blank', 'noopener,noreferrer');
  };

  if (variant === 'banner') {
    return (
      <div className={`w-full ${className}`}>
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <Heart className="w-6 h-6 text-emerald-500 flex-shrink-0" fill="currentColor" />
                <div>
                  <h3 className="font-semibold text-emerald-800 text-sm">Support Our Mission</h3>
                  <p className="text-xs text-emerald-700">
                    Help us keep ImmigroNews free for everyone
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleDonate}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm py-2 px-4 flex-shrink-0"
                size="sm"
              >
                <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                Donate on Ko-fi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Original fixed variant
  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 w-48">
        <CardContent className="p-4 text-center">
          <div className="mb-3">
            <Heart className="w-8 h-8 text-emerald-500 mx-auto mb-2" fill="currentColor" />
            <h3 className="font-semibold text-emerald-800 text-sm">Support Our Mission</h3>
          </div>
          <p className="text-xs text-emerald-700 mb-3 leading-relaxed">
            Donate to keep ImmigroNews free
          </p>
          <Button 
            onClick={handleDonate}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm py-2 px-3"
            size="sm"
          >
            <Heart className="w-4 h-4 mr-1" fill="currentColor" />
            Donate on Ko-fi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default KofiDonateButton;
