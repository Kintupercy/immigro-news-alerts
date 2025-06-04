import { useState, useEffect } from 'react';
import { validateEmail, validateName, generateCSRFToken } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (data: any, csrfToken: string) => Promise<void>;
  className?: string;
}

export const SecureForm = ({ children, onSubmit, className }: SecureFormProps) => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCsrfToken(generateCSRFToken());
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);
      
      await onSubmit(data, csrfToken);
      
      // Generate new CSRF token after successful submission
      setCsrfToken(generateCSRFToken());
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  );
};

// Secure input validation hooks
export const useEmailValidation = () => {
  const validateEmailInput = (email: string) => {
    if (!email) return { isValid: false, error: 'Email is required' };
    if (!validateEmail(email)) return { isValid: false, error: 'Invalid email format' };
    return { isValid: true, error: null };
  };
  
  return { validateEmailInput };
};

export const useNameValidation = () => {
  const validateNameInput = (name: string) => {
    if (!name) return { isValid: true, error: null }; // Optional field
    if (!validateName(name)) return { isValid: false, error: 'Invalid name format' };
    return { isValid: true, error: null };
  };
  
  return { validateNameInput };
};