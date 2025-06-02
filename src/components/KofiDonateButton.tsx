
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const KofiDonateButton = () => {
  const handleDonate = () => {
    window.open('https://ko-fi.com/immigrownews', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 w-48">
        <CardContent className="p-4 text-center">
          <div className="mb-3">
            <Heart className="w-8 h-8 text-emerald-500 mx-auto mb-2" fill="currentColor" />
            <h3 className="font-semibold text-emerald-800 text-sm">Support Our Mission</h3>
          </div>
          <p className="text-xs text-emerald-700 mb-3 leading-relaxed">
            Donate to keep ImmigrowNews free
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
