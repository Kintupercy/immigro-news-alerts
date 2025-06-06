import DOMPurify from 'dompurify';

// HTML Sanitization
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover']
  });
};

// Input Validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s'-]{1,50}$/;
  return nameRegex.test(name.trim());
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone.trim());
};

// Sanitize user input for database operations
export const sanitizeInput = (input: string): string => {
  return input.trim().slice(0, 1000); // Limit length and trim whitespace
};

// Rate limiting helper
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const record = attempts.get(identifier);

    if (!record || now > record.resetTime) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  };
};

// CSRF Token generation (for forms) - Cryptographically secure
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// CSRF Token validation with timing-safe comparison
export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken || token.length !== expectedToken.length) {
    return false;
  }
  
  // Timing-safe comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  return result === 0;
};

// Token expiration check (tokens valid for 1 hour)
export const isTokenExpired = (tokenTimestamp: number): boolean => {
  const oneHour = 60 * 60 * 1000;
  return Date.now() - tokenTimestamp > oneHour;
};

// Safe content rendering - moved to contentSecurity.tsx for React components