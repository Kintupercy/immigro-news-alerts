
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateSessionSecurity, logSecurityEvent } from '@/utils/securityValidation';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  activeSessions: number;
  rateLimitViolations: number;
  adminActions: number;
  suspiciousActivity: number;
}

export const useSecurityAudit = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeSessions: 0,
    rateLimitViolations: 0,
    adminActions: 0,
    suspiciousActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSecurityMetrics = async () => {
    try {
      setLoading(true);

      // Validate current session
      const sessionCheck = await validateSessionSecurity();
      if (!sessionCheck.valid) {
        toast({
          title: "Security Alert",
          description: sessionCheck.reason || "Session validation failed",
          variant: "destructive",
        });
        return;
      }

      // Fetch rate limit violations (high attempt count)
      const { data: rateLimits } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .gt('attempt_count', 5);

      // Fetch recent admin actions
      const { data: adminLogs } = await supabase
        .from('admin_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Calculate metrics
      const violations = rateLimits?.length || 0;
      const adminActions = adminLogs?.length || 0;
      const suspicious = rateLimits?.filter(limit => limit.attempt_count > 10).length || 0;

      setMetrics({
        activeSessions: 1, // Current session
        rateLimitViolations: violations,
        adminActions: adminActions,
        suspiciousActivity: suspicious
      });

      // Log the audit check
      await logSecurityEvent('AUDIT_CHECK', {
        metrics: {
          violations,
          adminActions,
          suspicious
        }
      });

    } catch (error) {
      console.error('Security audit failed:', error);
      toast({
        title: "Security Audit Error",
        description: "Failed to fetch security metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkForSecurityThreats = async () => {
    try {
      // Check for unusual patterns
      const { data: recentLimits } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .gte('last_attempt', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .gt('attempt_count', 3);

      if (recentLimits && recentLimits.length > 0) {
        const threatLevel = recentLimits.some(limit => limit.attempt_count > 10) 
          ? 'HIGH' 
          : 'MEDIUM';

        await logSecurityEvent('THREAT_DETECTED', {
          threatLevel,
          affectedIPs: recentLimits.map(limit => limit.identifier),
          count: recentLimits.length
        });

        if (threatLevel === 'HIGH') {
          toast({
            title: "High Security Threat Detected",
            description: `${recentLimits.length} IPs with suspicious activity`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Threat detection failed:', error);
    }
  };

  useEffect(() => {
    fetchSecurityMetrics();
    
    // Set up periodic security checks
    const securityInterval = setInterval(() => {
      checkForSecurityThreats();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(securityInterval);
  }, []);

  return {
    metrics,
    loading,
    fetchSecurityMetrics,
    checkForSecurityThreats
  };
};
