
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, FileText, BarChart3, Plus, AlertTriangle } from 'lucide-react';
import AdminRoute from '@/components/AdminRoute';
import Header from '@/components/Header';
import ManualNewsUpload from '@/components/admin/ManualNewsUpload';
import NewsManagement from '@/components/admin/NewsManagement';
import UserAnalytics from '@/components/admin/UserAnalytics';
import ContentModeration from '@/components/admin/ContentModeration';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Get dashboard statistics
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [articlesResult, usersResult, urgentResult] = await Promise.all([
        supabase.from('immigration_news').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('immigration_news').select('*', { count: 'exact', head: true }).eq('is_urgent', true)
      ]);

      return {
        totalArticles: articlesResult.count || 0,
        totalUsers: usersResult.count || 0,
        urgentNews: urgentResult.count || 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage immigration news, users, and system settings</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload News
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Manage News
              </TabsTrigger>
              <TabsTrigger value="moderation" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Moderation
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalArticles || 0}</div>
                    <p className="text-xs text-muted-foreground">Published immigration news</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">Active user accounts</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Urgent News</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats?.urgentNews || 0}</div>
                    <p className="text-xs text-muted-foreground">Currently marked urgent</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setActiveTab('upload')}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Plus className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="font-medium">Upload New Article</h3>
                          <p className="text-sm text-muted-foreground">Manually add immigration news</p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => setActiveTab('moderation')}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                          <h3 className="font-medium">Content Moderation</h3>
                          <p className="text-sm text-muted-foreground">Review and moderate content</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload">
              <ManualNewsUpload />
            </TabsContent>

            <TabsContent value="manage">
              <NewsManagement />
            </TabsContent>

            <TabsContent value="moderation">
              <ContentModeration />
            </TabsContent>

            <TabsContent value="analytics">
              <UserAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminDashboard;
