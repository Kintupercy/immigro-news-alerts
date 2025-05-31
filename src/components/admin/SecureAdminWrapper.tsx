
import { ReactNode, useEffect, useState } from 'react';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { validateSessionSecurity, logSecurityEvent } from '@/utils/securityValidation';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Shield, Lock } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingStates';

interface SecureAdminWrapperProps {
  children: ReactNode;
  requireSession?: boolean;
}

const SecureAdminWrapper = ({ children, requireSession = true }: SecureAdminWrapperProps) => {
  const { isAdmin, isLoading, user } = useAdminAccess();
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [securityCheck, setSecurityCheck] = useState(true);

  useEffect(() => {
    const performSecurityChecks = async () => {
      try {
        if (requireSession) {
          const sessionCheck = await validateSessionSecurity();
          setSessionValid(sessionCheck.valid);
          
          if (!sessionCheck.valid) {
            await logSecurityEvent('INVALID_SESSION_ACCESS', {
              reason: sessionCheck.reason,
              userId: user?.id || 'unknown'
            });
          }
        }

        if (isAdmin && user) {
          await logSecurityEvent('ADMIN_PAGE_ACCESS', {
            userId: user.id,
            page: window.location.pathname,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Security check failed:', error);
        setSecurityCheck(false);
      }
    };

    if (!isLoading) {
      performSecurityChecks();
    }
  }, [isAdmin, isLoading, user, requireSession]);

  // Show loading state
  if (isLoading || (requireSession && sessionValid === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">Security Validation</h3>
            <p className="text-muted-foreground mb-4">Verifying administrative access...</p>
            <LoadingSpinner size="sm" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show security error
  if (!securityCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Security Check Failed</h3>
            <p className="text-muted-foreground">
              Unable to verify security requirements. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show session error
  if (requireSession && !sessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h3 className="text-lg font-semibold mb-2">Session Invalid</h3>
            <p className="text-muted-foreground">
              Your session is invalid or expired. Please sign in again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You don't have administrative privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render admin content with security wrapper
  return (
    <div className="relative">
      {/* Security indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
          <Shield className="w-3 h-3" />
          Secure Admin Session
        </div>
      </div>
      {children}
    </div>
  );
};

export default SecureAdminWrapper;
