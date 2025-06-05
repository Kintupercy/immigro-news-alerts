import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Mail, Calendar, TrendingUp } from 'lucide-react';

const PublicSiteAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['publicSiteAnalytics'],
    queryFn: async () => {
      const [articlesResult, subscriptionsResult, urgentResult] = await Promise.all([
        supabase.from('immigration_news').select('*'),
        supabase.from('email_subscriptions').select('*'),
        supabase.from('immigration_news').select('*').eq('is_urgent', true)
      ]);

      const articles = articlesResult.data || [];
      const subscriptions = subscriptionsResult.data || [];
      const urgentArticles = urgentResult.data || [];

      // Calculate analytics
      const totalArticles = articles.length;
      const activeSubscriptions = subscriptions.filter(s => s.is_active).length;
      const totalSubscriptions = subscriptions.length;
      const urgentNewsCount = urgentArticles.length;

      // Recent articles (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentArticles = articles.filter(article => 
        new Date(article.created_at) > weekAgo
      ).length;

      // Recent subscriptions (last 30 days)
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const recentSubscriptions = subscriptions.filter(sub => 
        new Date(sub.subscribed_at) > monthAgo
      ).length;

      // Category distribution
      const categoryStats = articles.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalArticles,
        activeSubscriptions,
        totalSubscriptions,
        urgentNewsCount,
        recentArticles,
        recentSubscriptions,
        categoryStats,
        articles: articles.slice(0, 10).reverse() // Most recent 10 articles
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
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalArticles || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.recentArticles || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.recentSubscriptions || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent News</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics?.urgentNewsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Currently marked urgent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">All time subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Content Categories</CardTitle>
          <CardDescription>Distribution of articles by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {analytics?.categoryStats && Object.entries(analytics.categoryStats).map(([category, count]) => (
              <div key={category} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <p className="text-sm text-muted-foreground">{category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Articles</CardTitle>
          <CardDescription>Latest published immigration news</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.articles?.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{article.title}</p>
                    {article.is_urgent && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {article.category} • Published {new Date(article.published_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{article.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicSiteAnalytics;