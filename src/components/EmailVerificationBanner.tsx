
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface EmailVerificationBannerProps {
  user: User;
}

const EmailVerificationBanner = ({ user }: EmailVerificationBannerProps) => {
  const [isResending, setIsResending] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if email is verified from user metadata
    setEmailVerified(!!user.email_confirmed_at);
  }, [user]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verification`
        }
      });

      if (error) throw error;

      toast({
        title: "Verification email sent!",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Don't show banner if email is already verified
  if (emailVerified) {
    return null;
  }

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong>Please verify your email address</strong>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a verification email to <strong>{user.email}</strong>. 
            Please check your inbox and click the verification link to access all features.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResendEmail}
          disabled={isResending}
          className="ml-4 whitespace-nowrap"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Resend Email
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationBanner;
