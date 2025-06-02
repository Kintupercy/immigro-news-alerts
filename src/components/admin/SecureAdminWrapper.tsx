
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface SecureAdminWrapperProps {
  children: ReactNode;
  requireSession?: boolean;
}

const SecureAdminWrapper = ({ children }: SecureAdminWrapperProps) => {
  // Since we don't use authentication, show access denied for admin areas
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Disabled</h3>
          <p className="text-muted-foreground">
            Admin functionality is not available in this simplified version.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureAdminWrapper;
