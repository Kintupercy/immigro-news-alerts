
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { safeGetItem, safeSetItem } from "@/utils/safeStorage";
import { GOV_SOURCE_TAGS, isOfficialGovArticle } from "@/utils/officialSources";
import { AlertTriangle, X, ExternalLink, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BreakingNews {
  id: string;
  title: string;
  summary: string | null;
  source_url: string | null;
  published_at: string;
  is_urgent: boolean;
  tags: string[] | null;
}

const BreakingNewsAlert = () => {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [dismissedNews, setDismissedNews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBreakingNews();
    
    // Load dismissed news from localStorage
    const dismissed = safeGetItem('dismissedBreakingNews');
    if (dismissed) {
      try {
        setDismissedNews(JSON.parse(dismissed));
      } catch {
        // ignore corrupt data
      }
    }

    // Listen for new breaking news
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel('breaking-news-alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'immigration_news'
          },
          (payload) => {
            const newArticle = payload.new as BreakingNews;
            // Breaking = official government sources; realtime filters can't
            // match array columns, so check client-side.
            if (!isOfficialGovArticle(newArticle)) return;
            setBreakingNews(prev => [newArticle, ...prev.slice(0, 4)]);
            toast({
              title: newArticle.is_urgent ? "URGENT Breaking News" : "Breaking News",
              description: newArticle.title,
              variant: newArticle.is_urgent ? "destructive" : "default",
              duration: 8000,
            });
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Breaking news realtime channel error — falling back to polling');
          }
        });
    } catch (err) {
      console.warn('Failed to subscribe to breaking news realtime:', err);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchBreakingNews = async () => {
    try {
      // Breaking = official government sources from the last 72 hours —
      // an announcement banner should never show stale items.
      const since = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('immigration_news')
        .select('id, title, summary, source_url, published_at, is_urgent, tags')
        .eq('status', 'published')
        .overlaps('tags', GOV_SOURCE_TAGS)
        .gte('published_at', since)
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setBreakingNews(data || []);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissNews = (newsId: string) => {
    const newDismissed = [...dismissedNews, newsId];
    setDismissedNews(newDismissed);
    safeSetItem('dismissedBreakingNews', JSON.stringify(newDismissed));
  };

  const refreshBreakingNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-news-rss', { body: { maxAgeHours: 24 } });

      if (error) throw error;

      if (data.articlesAdded > 0) {
        toast({
          title: "Breaking News Updated!",
          description: `Found ${data.articlesAdded} new immigration-related breaking news articles.`,
        });
        await fetchBreakingNews();
      } else {
        toast({
          title: "No New Breaking News",
          description: "All breaking news is up to date.",
        });
      }
    } catch (error) {
      console.error('Error refreshing breaking news:', error);
      toast({
        title: "Error",
        description: "Failed to refresh breaking news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceDomain = (url: string | null) => {
    if (!url) return 'Unknown';
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return 'Unknown';
    }
  };

  const isOfficialSource = (url: string | null) => {
    if (!url) return false;
    const officialDomains = ['uscis.gov', 'dhs.gov', 'state.gov', 'ice.gov', 'cbp.gov'];
    return officialDomains.some(domain => url.includes(domain));
  };

  const visibleNews = breakingNews.filter(news => !dismissedNews.includes(news.id));

  if (loading || visibleNews.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-orange-900">Breaking Immigration News</h3>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Live Updates
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshBreakingNews}
            disabled={loading}
            className="border-orange-200 text-orange-800 hover:bg-orange-100"
          >
            Refresh
          </Button>
        </div>
        
        <div className="space-y-2">
          {visibleNews.map((news) => {
            const sourceDomain = getSourceDomain(news.source_url);
            const isOfficial = isOfficialSource(news.source_url);
            
            return (
              <Card key={news.id} className={`bg-white shadow-sm ${news.is_urgent ? 'border-red-200' : 'border-orange-200'}`}>
                <div className="flex items-start gap-3 p-3">
                  {news.is_urgent && (
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm leading-tight ${news.is_urgent ? 'text-red-900' : 'text-orange-900'}`}>
                      {news.title}
                    </h4>
                    {news.summary && (
                      <p className={`text-xs mt-1 line-clamp-2 ${news.is_urgent ? 'text-red-700' : 'text-orange-700'}`}>
                        {news.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Source Attribution */}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${isOfficial ? 'border-green-300 text-green-700' : 'border-blue-300 text-blue-700'}`}
                      >
                        {isOfficial && <Shield className="w-3 h-3 mr-1" />}
                        Source: {sourceDomain}
                      </Badge>
                      
                      {news.source_url && (
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className={`h-auto p-0 text-xs ${news.is_urgent ? 'text-red-600 hover:text-red-800' : 'text-orange-600 hover:text-orange-800'}`}
                        >
                          <a 
                            href={news.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Read Full Story
                          </a>
                        </Button>
                      )}
                      <span className={`text-xs ${news.is_urgent ? 'text-red-600' : 'text-orange-600'}`}>
                        {new Date(news.published_at).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {/* Attribution Footer */}
                    {news.source_url && (
                      <div className={`text-xs mt-2 pt-1 ${news.is_urgent ? 'text-red-600/70 border-t border-red-100' : 'text-orange-600/70 border-t border-orange-100'}`}>
                        Originally published by {sourceDomain}. Content aggregated for breaking news alerts.
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNews(news.id)}
                    className={`flex-shrink-0 h-auto p-1 ${news.is_urgent ? 'text-red-600 hover:text-red-800 hover:bg-red-100' : 'text-orange-600 hover:text-orange-800 hover:bg-orange-100'}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsAlert;
