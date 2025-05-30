
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!token_hash || type !== 'email') {
        setError('Invalid verification link');
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email'
        });

        if (error) throw error;

        setVerified(true);
        toast({
          title: "Email verified successfully!",
          description: "You can now access all features of Immigro.",
        });

        setTimeout(() => navigate('/'), 2000);
      } catch (error: any) {
        console.error('Email verification error:', error);
        setError(error.message);
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, toast]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/lovable-uploads/6e3f182b-7db9-4db3-b92b-86082c8dccfc.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-sm sm:max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm mx-4">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-navy-800">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 px-4 sm:px-6">
          {verifying && (
            <div className="space-y-4">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto animate-spin text-navy-600" />
              <p className="text-sm sm:text-base text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {verified && (
            <div className="space-y-4">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-green-600" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-green-800">Email Verified!</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Your email has been successfully verified. Redirecting you to the app...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <XCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-red-600" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-red-800">Verification Failed</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => navigate('/auth')} className="w-full min-h-[44px]">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
