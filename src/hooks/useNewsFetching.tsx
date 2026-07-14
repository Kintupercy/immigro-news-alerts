import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { enhancedCache, cacheKeys } from "@/utils/enhancedCache";
import { rateLimiter, RATE_LIMITS } from "@/utils/rateLimiter";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  source_url: string | null;
  published_at: string;
  is_urgent: boolean;
  tags: string[] | null;
}

export const useNewsFetching = () => {
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchAllArticles = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!rateLimiter.isAllowed('news-fetch', RATE_LIMITS.NEWS_FETCH)) {
        toast({
          title: "Rate limit exceeded",
          description: "Please wait before fetching more news.",
          variant: "destructive",
        });
        return;
      }

      const cacheKey = cacheKeys.news('all', '', 1);
      
      // Use background refresh for better UX
      const result = await enhancedCache.backgroundRefresh(
        cacheKey,
        async () => {
          const query = supabase
            .from('immigration_news')
            .select('*')
            .eq('status', 'published')
            .not('source_url', 'is', null)
            .order('published_at', { ascending: false })
            .limit(500); // Load 500 articles for all users

          const { data, error } = await query;
          if (error) throw error;
          
          const filteredData = (data || []).filter(article => 
            article.source_url && 
            !article.source_url.includes('youtube.com') &&
            !article.source_url.includes('youtu.be')
          );

          return {
            articles: filteredData,
            total: filteredData.length
          };
        },
        5 // Cache for 5 minutes
      );
      
      setAllArticles(result.articles);

      if (result.articles.length === 0) {
        console.log('No articles found, fetching fresh news...');
        await refreshNews(false);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshNews = useCallback(async (forceRefresh: boolean = true) => {
    try {
      setRefreshing(true);
      
      if (!rateLimiter.isAllowed('news-refresh', RATE_LIMITS.API_CALLS)) {
        toast({
          title: "Too many refresh attempts",
          description: "Please wait before refreshing again.",
          variant: "destructive",
        });
        return;
      }

      if (forceRefresh) {
        enhancedCache.delete(cacheKeys.news('all', '', 1));
      }
      
      toast({
        title: "Fetching latest news...",
        description: "Getting verified immigration updates and breaking news from major outlets.",
      });

      // Single current pipeline: fetch-news-rss covers mainstream outlets AND
      // official gov sources (the old fetch-immigration-news/fetch-breaking-news
      // functions are retired).
      const { data: fetchData } = await supabase.functions.invoke('fetch-news-rss', {
        body: { maxAgeHours: 24 }
      });

      const totalArticlesAdded = fetchData?.articlesAdded || 0;
      const urgentNewsFound = fetchData?.urgentCount || 0;

      if (totalArticlesAdded > 0) {
        toast({
          title: "News updated!",
          description: `Successfully fetched ${totalArticlesAdded} new articles${urgentNewsFound > 0 ? ` (${urgentNewsFound} urgent)` : ''}.`,
        });
        enhancedCache.delete(cacheKeys.news('all', '', 1));
        await fetchAllArticles();
      } else {
        toast({
          title: "No new articles",
          description: "All articles are up to date.",
        });
      }
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setRefreshing(false);
    }
  }, [toast, fetchAllArticles]);

  return {
    allArticles,
    setAllArticles,
    loading,
    refreshing,
    fetchAllArticles,
    refreshNews
  };
};