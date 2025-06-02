
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
    // Simplified session check since we don't use authentication
    setSessionValid(true);
  };

  const securityWarning = (message: string) => {
    toast({
      title: "Security Warning",
      description: message,
      variant: "destructive",
    });
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <SecurityContext.Provider value={{ sessionValid, checkSession, securityWarning }}>
      {children}
    </SecurityContext.Provider>
  );
};
