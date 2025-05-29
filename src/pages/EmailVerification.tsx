
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
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email'
        });

        if (error) throw error;

        setVerified(true);
        toast({
          title: "Email verified successfully!",
          description: "You can now access all features of Immigro.",
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => navigate('/'), 2000);
      } catch (error: any) {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-navy-800">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {verifying && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-navy-600" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {verified && (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Email Verified!</h3>
                <p className="text-muted-foreground">
                  Your email has been successfully verified. Redirecting you to the app...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <XCircle className="w-12 h-12 mx-auto text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Verification Failed</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => navigate('/auth')} className="w-full">
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
