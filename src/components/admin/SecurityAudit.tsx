
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, AlertTriangle, Shield, Clock, UserX } from "lucide-react";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type RateLimit = Database['public']['Tables']['auth_rate_limits']['Row'];

const SecurityAudit = () => {
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rate-limits");

  useEffect(() => {
    fetchSecurityData();
  }, [activeTab]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      if (activeTab === "rate-limits") {
        const { data, error } = await supabase
          .from('auth_rate_limits')
          .select('*')
          .order('last_attempt', { ascending: false })
          .limit(100);

        if (error) throw error;
        setRateLimits(data || []);
      } else if (activeTab === "admin-logs") {
        const { data, error } = await supabase
          .from('admin_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setAdminLogs(data || []);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Security Audit</h1>
        <Button onClick={fetchSecurityData} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rate-limits">Auth Rate Limits</TabsTrigger>
          <TabsTrigger value="admin-logs">Admin Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="rate-limits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Rate Limiting
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
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateLimits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No rate limit data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      rateLimits.map((limit) => (
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
                            {limit.blocked_until && new Date(limit.blocked_until) > new Date() ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <UserX className="h-3 w-3" />
                                Blocked until {formatDate(limit.blocked_until)}
                              </Badge>
                            ) : (
                              <Badge variant={limit.attempt_count > 3 ? "warning" : "success"}>
                                {limit.attempt_count > 3 ? "Warning" : "Normal"}
                              </Badge>
                            )}
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
        
        <TabsContent value="admin-logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Admin Activity Logs
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
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No admin logs available
                        </TableCell>
                      </TableRow>
                    ) : (
                      adminLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge>{log.action}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.admin_user_id}
                          </TableCell>
                          <TableCell>
                            {log.target_type}: {log.target_id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {formatDate(log.created_at)}
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
      </Tabs>
    </div>
  );
};

export default SecurityAudit;
