import React from 'react';
import { sanitizeHtml } from './security';

// Safe component for rendering potentially unsafe HTML content
export const SafeContent = ({ content, className }: { content: string; className?: string }) => {
  const sanitizedContent = sanitizeHtml(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
};

// Safe text rendering that prevents XSS
export const SafeText = ({ text, maxLength = 1000 }: { text: string; maxLength?: number }) => {
  // Remove any HTML tags and limit length
  const cleanText = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim()
    .slice(0, maxLength);
    
  return <span>{cleanText}</span>;
};

// Safe URL validation
export const isSafeUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

// Safe external link component
export const SafeExternalLink = ({ href, children, className }: { 
  href: string; 
  children: React.ReactNode; 
  className?: string;
}) => {
  if (!isSafeUrl(href)) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
};