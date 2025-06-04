
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface SecureAdminWrapperProps {
  children: ReactNode;
  requireSession?: boolean;
}

const SecureAdminWrapper = ({ children }: SecureAdminWrapperProps) => {
  const { isAdmin, isLoading, user } = useAdminAccess();

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">
              Please log in to access admin functionality.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has admin role
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You don't have permission to access admin functionality.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated and has admin role
  return <>{children}</>;
};

export default SecureAdminWrapper;
