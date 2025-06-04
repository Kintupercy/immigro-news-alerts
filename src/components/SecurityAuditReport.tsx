import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  fixed: boolean;
}

const SecurityAuditReport = () => {
  const securityIssues: SecurityIssue[] = [
    {
      id: 'xss-prevention',
      severity: 'critical',
      title: 'XSS Prevention',
      description: 'Implemented DOMPurify for HTML sanitization and input validation',
      fixed: true
    },
    {
      id: 'admin-access',
      severity: 'critical', 
      title: 'Admin Access Control',
      description: 'Enhanced admin authentication with proper role-based access',
      fixed: true
    },
    {
      id: 'input-validation',
      severity: 'high',
      title: 'Input Validation',
      description: 'Added comprehensive client and server-side input validation',
      fixed: true
    },
    {
      id: 'csrf-protection',
      severity: 'high',
      title: 'CSRF Protection',
      description: 'Implemented CSRF token generation for forms',
      fixed: true
    },
    {
      id: 'rate-limiting',
      severity: 'medium',
      title: 'Rate Limiting',
      description: 'Added rate limiting utilities for API endpoints',
      fixed: true
    },
    {
      id: 'secure-headers',
      severity: 'medium',
      title: 'Security Headers',
      description: 'Need to implement CSP and other security headers',
      fixed: false
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string, fixed: boolean) => {
    if (fixed) return <CheckCircle className="w-4 h-4 text-green-500" />;
    
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const fixedIssues = securityIssues.filter(issue => issue.fixed);
  const remainingIssues = securityIssues.filter(issue => !issue.fixed);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Audit Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{fixedIssues.length}</div>
              <div className="text-sm text-green-700">Issues Fixed</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{remainingIssues.length}</div>
              <div className="text-sm text-red-700">Issues Remaining</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((fixedIssues.length / securityIssues.length) * 100)}%
              </div>
              <div className="text-sm text-blue-700">Security Score</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security Issues</h3>
            {securityIssues.map((issue) => (
              <div key={issue.id} className="flex items-start gap-3 p-4 border rounded-lg">
                {getSeverityIcon(issue.severity, issue.fixed)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{issue.title}</h4>
                    <Badge variant={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    {issue.fixed && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Fixed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAuditReport;