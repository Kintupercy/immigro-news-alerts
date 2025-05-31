
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, AlertTriangle, Shield, Clock, UserX, Eye, Lock } from "lucide-react";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type RateLimit = Database['public']['Tables']['auth_rate_limits']['Row'];
type AdminLog = Database['public']['Tables']['admin_logs']['Row'];

interface SecurityMetrics {
  totalRateLimits: number;
  blockedAttempts: number;
  adminActions: number;
  suspiciousActivity: number;
}

const SecurityAuditEnhanced = () => {
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalRateLimits: 0,
    blockedAttempts: 0,
    adminActions: 0,
    suspiciousActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityData();
  }, [activeTab]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [rateLimitsResponse, adminLogsResponse] = await Promise.all([
        supabase
          .from('auth_rate_limits')
          .select('*')
          .order('last_attempt', { ascending: false })
          .limit(100),
        supabase
          .from('admin_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      if (rateLimitsResponse.error) throw rateLimitsResponse.error;
      if (adminLogsResponse.error) throw adminLogsResponse.error;

      const rateLimitsData = rateLimitsResponse.data || [];
      const adminLogsData = adminLogsResponse.data || [];

      setRateLimits(rateLimitsData);
      setAdminLogs(adminLogsData);

      // Calculate security metrics
      const blockedCount = rateLimitsData.filter(limit => 
        limit.blocked_until && new Date(limit.blocked_until) > new Date()
      ).length;

      const suspiciousCount = rateLimitsData.filter(limit => 
        limit.attempt_count > 5
      ).length;

      setMetrics({
        totalRateLimits: rateLimitsData.length,
        blockedAttempts: blockedCount,
        adminActions: adminLogsData.length,
        suspiciousActivity: suspiciousCount
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Security Data Error",
        description: "Failed to fetch security audit data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (action: string, details: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('admin_logs').insert({
        admin_user_id: user.id,
        action: `SECURITY_${action}`,
        details: details,
        target_type: 'security_audit'
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const clearOldRateLimits = async () => {
    try {
      const { error } = await supabase
        .from('auth_rate_limits')
        .delete()
        .lt('last_attempt', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      await logSecurityEvent('RATE_LIMITS_CLEARED', { 
        action: 'cleared_old_rate_limits',
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Rate Limits Cleared",
        description: "Old rate limit records have been removed.",
      });

      fetchSecurityData();
    } catch (error) {
      console.error('Error clearing rate limits:', error);
      toast({
        title: "Error",
        description: "Failed to clear old rate limits.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
  };

  const getSeverityBadge = (attemptCount: number, isBlocked: boolean) => {
    if (isBlocked) {
      return <Badge variant="destructive">Blocked</Badge>;
    } else if (attemptCount > 10) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (attemptCount > 5) {
      return <Badge variant="warning">High</Badge>;
    } else if (attemptCount > 3) {
      return <Badge variant="outline">Medium</Badge>;
    }
    return <Badge variant="secondary">Low</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Enhanced Security Audit</h1>
        <div className="flex gap-2">
          <Button onClick={clearOldRateLimits} variant="outline" size="sm">
            <UserX className="h-4 w-4 mr-2" />
            Clear Old Limits
          </Button>
          <Button onClick={fetchSecurityData} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="admin-logs">Admin Activity</TabsTrigger>
          <TabsTrigger value="policies">RLS Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rate Limits</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalRateLimits}</div>
                <p className="text-xs text-muted-foreground">Authentication attempts tracked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                <UserX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.blockedAttempts}</div>
                <p className="text-xs text-muted-foreground">Currently blocked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{metrics.adminActions}</div>
                <p className="text-xs text-muted-foreground">Recent administrative actions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.suspiciousActivity}</div>
                <p className="text-xs text-muted-foreground">High attempt count IPs</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rate-limits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Rate Limiting Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 flex justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Identifier</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Last Attempt</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateLimits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No rate limit data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      rateLimits.map((limit) => {
                        const isBlocked = limit.blocked_until && new Date(limit.blocked_until) > new Date();
                        return (
                          <TableRow key={limit.id}>
                            <TableCell className="font-mono text-xs">
                              {limit.identifier}
                            </TableCell>
                            <TableCell>{limit.attempt_count}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {formatDate(limit.last_attempt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getSeverityBadge(limit.attempt_count, !!isBlocked)}
                            </TableCell>
                            <TableCell>
                              {isBlocked ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <Lock className="h-3 w-3" />
                                  Blocked until {formatDate(limit.blocked_until!)}
                                </Badge>
                              ) : (
                                <Badge variant="success">Active</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin-logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Administrative Activity Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 flex justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Admin User</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No admin logs available
                        </TableCell>
                      </TableRow>
                    ) : (
                      adminLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant={log.action.startsWith('SECURITY_') ? 'destructive' : 'default'}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.admin_user_id}
                          </TableCell>
                          <TableCell>
                            {log.target_type}: {log.target_id || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {log.details ? (
                              <details className="cursor-pointer">
                                <summary className="text-xs text-muted-foreground">View Details</summary>
                                <pre className="text-xs mt-1 p-2 bg-muted rounded">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            ) : (
                              <span className="text-muted-foreground">No details</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {formatDate(log.created_at!)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Row Level Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">✅ Secured Tables</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• immigration_news - Public read, admin write</li>
                      <li>• immigration_categories - Public read, admin manage</li>
                      <li>• user_profiles - User own, admin view</li>
                      <li>• user_roles - User own, admin manage</li>
                      <li>• bookmarks - User own only</li>
                      <li>• admin_logs - Admin only</li>
                      <li>• email_subscriptions - Public subscribe, admin manage</li>
                      <li>• auth_rate_limits - Admin view only</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">🔒 Security Features</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Row Level Security enabled on all tables</li>
                      <li>• Role-based access control</li>
                      <li>• Authentication rate limiting</li>
                      <li>• Admin activity audit logging</li>
                      <li>• Input validation and sanitization</li>
                      <li>• Session security checks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityAuditEnhanced;
