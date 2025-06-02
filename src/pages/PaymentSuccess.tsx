
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Welcome to Pro!",
      description: "Your subscription has been activated. Enjoy all premium features!",
    });
  }, [toast]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/lovable-uploads/5cb46a58-9c2c-4d5a-87d5-f03985e8aa30.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Payment Successful!
          </CardTitle>
          <p className="text-gray-600">
            Welcome to Immigro Pro! Your subscription is now active.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <Crown className="w-5 h-5" />
            <span className="font-semibold">Pro Member</span>
          </div>
          
          <p className="text-sm text-gray-600">
            You now have access to all premium features including SMS notifications, 
            Spanish translation, and priority news filtering.
          </p>

          <div className="space-y-2 pt-4">
            <Button asChild className="w-full">
              <Link to="/">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
