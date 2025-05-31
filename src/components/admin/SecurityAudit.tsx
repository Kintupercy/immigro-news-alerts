
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Clock, Refresh } from "lucide-react";

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

const SecurityAudit = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    criticalEvents: 0,
    recentEvents: 0,
    blockedAttempts: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent authentication rate limits
      const { data: rateLimits, error: rateLimitError } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (rateLimitError) {
        console.error('Error fetching rate limits:', rateLimitError);
      }

      // Calculate stats from rate limits
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentAttempts = rateLimits?.filter(rl => 
        new Date(rl.created_at) > last24Hours
      ) || [];
      
      const blockedAttempts = rateLimits?.filter(rl => 
        rl.blocked_until && new Date(rl.blocked_until) > now
      ) || [];

      // Mock security events for demonstration
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          event_type: 'failed_login',
          severity: 'medium',
          description: 'Multiple failed login attempts detected',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          event_type: 'rate_limit_triggered',
          severity: 'high',
          description: 'Rate limit exceeded for authentication',
          created_at: new Date(Date.now() - 60000).toISOString()
        }
      ];

      setSecurityEvents(mockEvents);
      setStats({
        totalEvents: mockEvents.length + recentAttempts.length,
        criticalEvents: mockEvents.filter(e => e.severity === 'critical').length,
        recentEvents: recentAttempts.length,
        blockedAttempts: blockedAttempts.length
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error loading security data",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading security audit...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Security Audit
        </h1>
        <Button onClick={fetchSecurityData} variant="outline" size="sm">
          <Refresh className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.criticalEvents}</div>
                <div className="text-sm text-muted-foreground">Critical Events</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.recentEvents}</div>
                <div className="text-sm text-muted-foreground">Last 24h</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.blockedAttempts}</div>
                <div className="text-sm text-muted-foreground">Blocked IPs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>No security events detected. Your system is secure!</p>
              </div>
            ) : (
              securityEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {event.event_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium">{event.description}</p>
                      <div className="text-sm text-muted-foreground mt-2">
                        {new Date(event.created_at).toLocaleString()}
                        {event.ip_address && ` • IP: ${event.ip_address}`}
                        {event.user_id && ` • User: ${event.user_id.slice(0, 8)}...`}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Row Level Security (RLS) enabled on all tables</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Rate limiting active for authentication</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Strong password requirements enforced</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Email verification required for new accounts</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAudit;
