
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentCanceled = () => {
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
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-gray-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Payment Canceled
          </CardTitle>
          <p className="text-gray-600">
            Your payment was canceled. No charges were made.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            You can try again anytime to unlock all the premium features of Immigro Pro.
          </p>

          <div className="space-y-2 pt-4">
            <Button asChild className="w-full">
              <Link to="/payment">
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
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

export default PaymentCanceled;
