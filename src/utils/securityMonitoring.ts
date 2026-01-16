// Security monitoring and logging utilities

interface SecurityEventDetails {
  form?: string;
  remainingAttempts?: number;
  issue?: string;
  emailLength?: number;
  [key: string]: string | number | boolean | undefined;
}

interface SecurityEvent {
  type: 'rate_limit_exceeded' | 'csrf_validation_failed' | 'suspicious_input' | 'honeypot_triggered' | 'invalid_token';
  timestamp: number;
  clientId: string;
  details?: SecurityEventDetails;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep only last 1000 events

  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(securityEvent);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console for monitoring
    console.warn('Security Event:', {
      type: event.type,
      clientId: event.clientId,
      timestamp: new Date(securityEvent.timestamp).toISOString(),
      details: event.details
    });

    // In production, you would send this to your monitoring service
    this.sendToMonitoringService(securityEvent);
  }

  private sendToMonitoringService(event: SecurityEvent) {
    // In a real application, send to your monitoring service
    // Example: Analytics, LogRocket, Sentry, etc.
    try {
      // Placeholder for monitoring service integration
      const win = window as Window & { gtag?: (command: string, action: string, params: Record<string, string>) => void };
      if (typeof window !== 'undefined' && win.gtag) {
        win.gtag('event', 'security_incident', {
          event_category: 'security',
          event_label: event.type,
          custom_parameter_1: event.clientId
        });
      }
    } catch (error) {
      console.error('Failed to send security event to monitoring service:', error);
    }
  }

  getRecentEvents(minutes: number = 60): SecurityEvent[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.events.filter(event => event.timestamp > cutoff);
  }

  getEventsByType(type: SecurityEvent['type'], minutes: number = 60): SecurityEvent[] {
    return this.getRecentEvents(minutes).filter(event => event.type === type);
  }

  getEventsForClient(clientId: string, minutes: number = 60): SecurityEvent[] {
    return this.getRecentEvents(minutes).filter(event => event.clientId === clientId);
  }

  // Check if client has suspicious activity
  isSuspiciousClient(clientId: string): boolean {
    const recentEvents = this.getEventsForClient(clientId, 15); // Last 15 minutes
    
    // Consider suspicious if more than 5 security events in 15 minutes
    return recentEvents.length > 5;
  }

  // Get security statistics
  getSecurityStats(minutes: number = 60) {
    const events = this.getRecentEvents(minutes);
    const stats = {
      totalEvents: events.length,
      rateLimitExceeded: 0,
      csrfFailures: 0,
      suspiciousInput: 0,
      honeypotTriggered: 0,
      invalidTokens: 0,
      uniqueClients: new Set<string>()
    };

    events.forEach(event => {
      stats.uniqueClients.add(event.clientId);
      
      switch (event.type) {
        case 'rate_limit_exceeded':
          stats.rateLimitExceeded++;
          break;
        case 'csrf_validation_failed':
          stats.csrfFailures++;
          break;
        case 'suspicious_input':
          stats.suspiciousInput++;
          break;
        case 'honeypot_triggered':
          stats.honeypotTriggered++;
          break;
        case 'invalid_token':
          stats.invalidTokens++;
          break;
      }
    });

    return {
      ...stats,
      uniqueClients: stats.uniqueClients.size
    };
  }
}

export const securityMonitor = new SecurityMonitor();

// Helper function to generate client fingerprint
export const generateClientFingerprint = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  try {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  } catch {
    return 'unknown';
  }
};
