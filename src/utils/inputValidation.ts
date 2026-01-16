/**
 * Comprehensive input validation utilities for security
 */

// Email validation with enhanced security checks
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: "Email is required" };
  }

  if (email.length > 254) {
    return { valid: false, error: "Email is too long" };
  }

  // More strict email regex to prevent injection
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /@.*@/,  // Double @ symbols
    /\.\./,  // Directory traversal
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(email)) {
      return { valid: false, error: "Invalid email format" };
    }
  }

  return { valid: true };
};

// Password validation with security requirements
export const validatePassword = (password: string): { valid: boolean; error?: string; strength?: string } => {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" };
  }

  if (password.length > 128) {
    return { valid: false, error: "Password is too long (max 128 characters)" };
  }

  // Check for at least one lowercase, uppercase, number, and special character
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const criteriaMet = [hasLowercase, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (criteriaMet < 3) {
    return { 
      valid: false, 
      error: "Password must contain at least 3 of: lowercase, uppercase, numbers, special characters",
      strength: "weak"
    };
  }

  // Common password checks
  const commonPasswords = [
    "password", "123456", "password123", "admin", "qwerty", 
    "letmein", "welcome", "monkey", "1234567890"
  ];

  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    return { 
      valid: false, 
      error: "Password contains common patterns and is not secure",
      strength: "weak"
    };
  }

  const strength = criteriaMet === 4 && password.length >= 12 ? "strong" : "medium";
  return { valid: true, strength };
};

// General text input sanitization
export const sanitizeTextInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return "";

  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

// Name validation (for first/last names)
export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name) {
    return { valid: false, error: "Name is required" };
  }

  const sanitized = sanitizeTextInput(name, 50);
  
  if (sanitized.length < 1) {
    return { valid: false, error: "Name cannot be empty" };
  }

  if (sanitized.length > 50) {
    return { valid: false, error: "Name is too long (max 50 characters)" };
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(sanitized)) {
    return { valid: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" };
  }

  return { valid: true };
};

// Phone number validation
export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    return { valid: true }; // Phone is optional
  }

  // Remove all non-digit characters except + for international numbers
  const cleaned = phone.replace(/[^\d+]/g, "");
  
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, error: "Phone number must be between 10-15 digits" };
  }

  // Basic phone number pattern (international or US)
  const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: "Please enter a valid phone number" };
  }

  return { valid: true };
};

// URL validation for secure external links
export const validateURL = (url: string): { valid: boolean; error?: string } => {
  if (!url) {
    return { valid: true }; // URL is optional in most cases
  }

  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: "Only HTTP and HTTPS URLs are allowed" };
    }

    // Block local/private IP ranges for security
    const hostname = urlObj.hostname;
    const privateIPRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|localhost)/i;
    
    if (privateIPRegex.test(hostname)) {
      return { valid: false, error: "Private IP addresses are not allowed" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Please enter a valid URL" };
  }
};

// Content validation for user-generated content
export const validateContent = (content: string, maxLength: number = 5000): { valid: boolean; error?: string } => {
  if (!content) {
    return { valid: false, error: "Content is required" };
  }

  const sanitized = sanitizeTextInput(content, maxLength);
  
  if (sanitized.length < 10) {
    return { valid: false, error: "Content is too short (minimum 10 characters)" };
  }

  if (sanitized.length > maxLength) {
    return { valid: false, error: `Content is too long (maximum ${maxLength} characters)` };
  }

  // Check for excessive special characters (potential spam)
  const specialCharCount = (sanitized.match(/[^a-zA-Z0-9\s]/g) || []).length;
  if (specialCharCount > sanitized.length * 0.3) {
    return { valid: false, error: "Content contains too many special characters" };
  }

  return { valid: true };
};