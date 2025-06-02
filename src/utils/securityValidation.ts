
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Input validation schemas
export const articleSchema = z.object({
  title: z.string().min(1).max(500).trim(),
  content: z.string().min(1).max(50000).trim(),
  summary: z.string().max(1000).trim().optional(),
  category: z.string().min(1).max(100).trim(),
  source_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).max(20).optional(),
  is_urgent: z.boolean().optional()
});

export const userProfileSchema = z.object({
  first_name: z.string().max(100).trim().optional(),
  last_name: z.string().max(100).trim().optional(),
  phone_number: z.string().max(20).trim().optional(),
  preferred_categories: z.array(z.string().max(100)).max(20).optional()
});

export const emailSubscriptionSchema = z.object({
  email: z.string().email().max(255).trim()
});

// Security validation functions
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const validateAdminAccess = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Use direct query without RLS to avoid recursion
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Admin access validation error:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Admin access validation failed:', error);
    return false;
  }
};

export const logSecurityEvent = async (
  action: string, 
  details: any, 
  targetType?: string, 
  targetId?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('admin_logs').insert({
      admin_user_id: user.id,
      action: `SECURITY_${action}`,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_hash: 'client_side' // Note: Real IP would be logged server-side
      },
      target_type: targetType || 'security_event',
      target_id: targetId
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const validateSessionSecurity = async (): Promise<{
  valid: boolean;
  reason?: string;
}> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { valid: false, reason: 'No active session' };
    }

    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      return { valid: false, reason: 'Session expired' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Session validation error' };
  }
};

export const checkRateLimit = async (identifier: string, maxAttempts: number = 5): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime?: Date;
}> => {
  try {
    const { data } = await supabase
      .from('auth_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .maybeSingle();

    if (!data) {
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    const now = new Date();
    const lastAttempt = new Date(data.last_attempt);
    const hoursSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / (1000 * 60 * 60);

    // Reset counter if more than 1 hour has passed
    if (hoursSinceLastAttempt >= 1) {
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    // Check if currently blocked
    if (data.blocked_until && new Date(data.blocked_until) > now) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: new Date(data.blocked_until)
      };
    }

    // Check attempt count
    if (data.attempt_count >= maxAttempts) {
      return { allowed: false, remaining: 0 };
    }

    return { 
      allowed: true, 
      remaining: maxAttempts - data.attempt_count - 1 
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: maxAttempts - 1 };
  }
};
