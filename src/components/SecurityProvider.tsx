
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { validateSession } from '@/utils/authSecurity';
import { useToast } from '@/hooks/use-toast';

interface SecurityContextType {
  sessionValid: boolean;
  checkSession: () => Promise<void>;
  securityWarning: (message: string) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const [sessionValid, setSessionValid] = useState(true);
  const { toast } = useToast();

  const checkSession = async () => {
    const { valid } = await validateSession();
    setSessionValid(valid);
    
    if (!valid) {
      toast({
        title: "Session Expired",
        description: "Please sign in again for security.",
        variant: "destructive",
      });
    }
  };

  const securityWarning = (message: string) => {
    toast({
      title: "Security Warning",
      description: message,
      variant: "destructive",
    });
  };

  useEffect(() => {
    // Check session on mount
    checkSession();

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    // Check session when window becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <SecurityContext.Provider value={{ sessionValid, checkSession, securityWarning }}>
      {children}
    </SecurityContext.Provider>
  );
};
