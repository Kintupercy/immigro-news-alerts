
import { supabase } from "@/integrations/supabase/client";

// Password strength validation
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation with domain verification
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }
  
  // Block common temporary email domains
  const blockedDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'sharklasers.com', 'throwaway.email'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (blockedDomains.includes(domain)) {
    return { isValid: false, error: "Temporary email addresses are not allowed" };
  }
  
  return { isValid: true };
};

// Rate limiting for authentication attempts
export const checkRateLimit = async (identifier: string): Promise<{ allowed: boolean; remainingAttempts?: number }> => {
  try {
    const { data, error } = await supabase.functions.invoke('check-rate-limit', {
      body: { identifier }
    });
    
    if (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: true }; // Fail open for now
    }
    
    return data;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Fail open for now
  }
};

// Secure session validation
export const validateSession = async (): Promise<{ valid: boolean; user?: any }> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return { valid: false };
    }
    
    // Check if session is close to expiring (within 5 minutes)
    const expiresAt = new Date(session.expires_at! * 1000);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
      // Attempt to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        return { valid: false };
      }
      
      return { valid: true, user: refreshData.user };
    }
    
    return { valid: true, user: session.user };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false };
  }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
};
