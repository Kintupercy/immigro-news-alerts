import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, ExternalLink, RefreshCw, AlertCircle, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enhancedCache, cacheKeys } from "@/utils/enhancedCache";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import ErrorBoundary from "./ErrorBoundary";
import { NewsCardSkeleton, EmptyState } from "./LoadingStates";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source_url: string;
  category: string;
  published_at: string;
  is_urgent: boolean;
  summary: string;
}

interface PersonalizedNewsFeedProps {
  user: User;
}

const PersonalizedNewsFeed = ({ user }: PersonalizedNewsFeedProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { handleError, retry, canRetry } = useErrorHandler();

  const { 
    data: articles, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['personalized-news', user.id],
    queryFn: async () => {
      return await enhancedCache.getOrFetch(
        cacheKeys.personalizedNews(user.id, []),
        async () => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('preferred_categories')
            .eq('user_id', user.id)
            .single();

          const preferences = profile?.preferred_categories || [];
          
          let query = supabase
            .from('immigration_news')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(20);

          if (preferences.length > 0) {
            query = query.in('category', preferences);
          }

          const { data: news, error } = await query;
          if (error) throw error;
          return news as NewsArticle[];
        },
        5 // Cache for 5 minutes
      );
    },
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear cache before refetching
      enhancedCache.delete(cacheKeys.personalizedNews(user.id, []));
      await refetch();
      toast({
        title: "News updated",
        description: "Your personalized feed has been refreshed.",
      });
    } catch (error) {
      handleError(error as Error, 'refreshing personalized news');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Personalized News</h2>
          <Button variant="outline" disabled>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Personalized News</h2>
            <Button 
              variant="outline" 
              onClick={() => retry(handleRefresh)}
              disabled={!canRetry}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load your personalized news. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        </div>
      </ErrorBoundary>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Personalized News</h2>
          <Button 
            variant="outline" 
            onClick={() => retry(handleRefresh)} 
            disabled={refreshing || !canRetry}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <EmptyState
          icon={Newspaper}
          title="No news yet"
          description="We're fetching the latest immigration news based on your preferences. Check back soon or adjust your interests in your profile."
          action={
            <Button onClick={() => retry(handleRefresh)} disabled={refreshing || !canRetry}>
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking for news...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check for news
                </>
              )}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Your Personalized News</h2>
          <Button 
            variant="outline" 
            onClick={() => retry(handleRefresh)} 
            disabled={refreshing || !canRetry}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        variant={article.is_urgent ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {article.category.toUpperCase()}
                      </Badge>
                      {article.is_urgent && (
                        <Badge variant="destructive" className="text-xs">
                          URGENT
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg sm:text-xl leading-tight break-words">
                      {article.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(article.published_at)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-4 leading-relaxed break-words">
                  {article.summary || article.content.substring(0, 200) + '...'}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-sm font-medium text-navy-600 break-all">
                    Source Article
                  </span>
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                    <a 
                      href={article.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Read More
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PersonalizedNewsFeed;
