
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, Mail, Bell, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define interface for notification preferences
interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  urgent_only?: boolean;
}

const UserAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: async () => {
      const [usersResult, subscriptionsResult, bookmarksResult] = await Promise.all([
        supabase.from('user_profiles').select('*'),
        supabase.from('email_subscriptions').select('*'),
        supabase.from('bookmarks').select('*')
      ]);

      const users = usersResult.data || [];
      const subscriptions = subscriptionsResult.data || [];
      const bookmarks = bookmarksResult.data || [];

      // Calculate analytics
      const totalUsers = users.length;
      const verifiedUsers = users.filter(u => u.email_verified).length;
      const onboardedUsers = users.filter(u => u.onboarding_completed).length;
      const activeSubscriptions = subscriptions.filter(s => s.is_active).length;
      const totalBookmarks = bookmarks.length;

      // Notification preferences analysis with proper type handling
      const notificationPrefs = users.reduce((acc, user) => {
        if (user.notification_preferences) {
          const prefs = user.notification_preferences as NotificationPreferences;
          acc.email += prefs.email ? 1 : 0;
          acc.push += prefs.push ? 1 : 0;
          acc.urgentOnly += prefs.urgent_only ? 1 : 0;
        }
        return acc;
      }, { email: 0, push: 0, urgentOnly: 0 });

      // Recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSignups = users.filter(u => 
        new Date(u.created_at) > thirtyDaysAgo
      ).length;

      return {
        totalUsers,
        verifiedUsers,
        onboardedUsers,
        activeSubscriptions,
        totalBookmarks,
        notificationPrefs,
        recentSignups,
        users: users.slice(0, 10) // Recent 10 users for display
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.recentSignups || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Verified</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.verifiedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalUsers ? Math.round((analytics.verifiedUsers / analytics.totalUsers) * 100) : 0}% verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Subs</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalBookmarks || 0}</div>
            <p className="text-xs text-muted-foreground">User engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>How users prefer to receive updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.notificationPrefs.email || 0}
              </div>
              <p className="text-sm text-muted-foreground">Email Enabled</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics?.notificationPrefs.push || 0}
              </div>
              <p className="text-sm text-muted-foreground">Push Enabled</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analytics?.notificationPrefs.urgentOnly || 0}
              </div>
              <p className="text-sm text-muted-foreground">Urgent Only</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Latest user registrations and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.users?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : 'Anonymous User'
                      }
                    </p>
                    <div className="flex gap-1">
                      {user.email_verified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                      {user.onboarding_completed && (
                        <Badge variant="outline" className="text-xs">Onboarded</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {user.preferred_categories?.length ? (
                    <p>{user.preferred_categories.length} categories</p>
                  ) : (
                    <p>No preferences</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;
