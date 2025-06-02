
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

const DonationButton = () => {
  const handleStripeCheckout = () => {
    // This would integrate with Stripe Checkout for donations
    console.log("Stripe donation checkout");
  };

  const handleKoFi = () => {
    window.open("https://ko-fi.com/immigro", "_blank");
  };

  const handleBuyMeCoffee = () => {
    window.open("https://buymeacoffee.com/immigro", "_blank");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
          <Heart className="w-4 h-4" />
          Support Immigro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Support Immigro ❤️</DialogTitle>
          <DialogDescription className="text-center">
            Immigro is run by a former international student. Help us stay free for everyone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="border-emerald-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Your support helps us provide free immigration news and updates to thousands of people navigating their immigration journey.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleStripeCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Donate via Stripe
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleKoFi}
                    variant="outline" 
                    className="flex-1"
                  >
                    Ko-fi
                  </Button>
                  <Button 
                    onClick={handleBuyMeCoffee}
                    variant="outline" 
                    className="flex-1"
                  >
                    Buy Me Coffee
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-xs text-gray-500 text-center">
            Every donation, no matter how small, makes a difference. Thank you for supporting our mission! 🙏
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationButton;
