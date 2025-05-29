
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Loader2, X } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface EmailVerificationBannerProps {
  user: User;
}

const EmailVerificationBanner = ({ user }: EmailVerificationBannerProps) => {
  const [isResending, setIsResending] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Check if email is verified from user metadata
    setEmailVerified(!!user.email_confirmed_at);
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

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

      setResendCooldown(60); // 60 second cooldown
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox and spam folder for the verification link.",
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

  // Don't show banner if email is already verified or dismissed
  if (emailVerified || isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50 relative">
      <Mail className="h-4 w-4" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-orange-100"
      >
        <X className="h-4 w-4" />
      </Button>
      <AlertDescription className="flex items-center justify-between pr-8">
        <div className="flex-1">
          <strong>Please verify your email address</strong>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a verification email to <strong>{user.email}</strong>. 
            Please check your inbox and spam folder for the verification link.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResendEmail}
          disabled={isResending || resendCooldown > 0}
          className="ml-4 whitespace-nowrap"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : resendCooldown > 0 ? (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Resend in {resendCooldown}s
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
