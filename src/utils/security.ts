import DOMPurify from 'dompurify';

// HTML Sanitization
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
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

// CSRF Token generation (for forms)
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

// Safe content rendering - moved to contentSecurity.tsx for React components