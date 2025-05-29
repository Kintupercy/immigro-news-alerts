
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, ExternalLink, Eye } from "lucide-react";
import { format } from "date-fns";
import { User } from "@supabase/supabase-js";

interface PersonalizedNewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  source_url: string | null;
  published_at: string;
  is_urgent: boolean;
  tags: string[] | null;
  is_read: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PersonalizedNewsFeedProps {
  user: User;
}

const PersonalizedNewsFeed = ({ user }: PersonalizedNewsFeedProps) => {
  const [articles, setArticles] = useState<PersonalizedNewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('PersonalizedNewsFeed: Component mounted for user:', user.id);
    fetchCategories();
    fetchPersonalizedNews();
  }, [user]);

  const fetchCategories = async () => {
    try {
      console.log('PersonalizedNewsFeed: Fetching categories...');
      const { data, error } = await supabase
        .from('immigration_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('PersonalizedNewsFeed: Error fetching categories:', error);
        throw error;
      }
      
      console.log('PersonalizedNewsFeed: Categories fetched:', data?.length || 0);
      setCategories(data || []);
    } catch (error) {
      console.error('PersonalizedNewsFeed: Categories fetch failed:', error);
      setError('Failed to load categories');
    }
  };

  const fetchPersonalizedNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('PersonalizedNewsFeed: Fetching personalized news for user:', user.id);
      
      // First check if user has a profile with categories
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('preferred_categories')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('PersonalizedNewsFeed: Error fetching user profile:', profileError);
        throw profileError;
      }

      console.log('PersonalizedNewsFeed: User profile:', userProfile);

      if (!userProfile || !userProfile.preferred_categories || userProfile.preferred_categories.length === 0) {
        console.log('PersonalizedNewsFeed: No preferred categories found, showing empty state');
        setArticles([]);
        setLoading(false);
        return;
      }

      // Try to use the RPC function first, but fall back to direct query if it fails
      try {
        console.log('PersonalizedNewsFeed: Attempting RPC call...');
        const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_personalized_news', {
          user_id_param: user.id,
          limit_param: 20
        });

        if (rpcError) {
          console.log('PersonalizedNewsFeed: RPC failed, falling back to direct query:', rpcError);
          throw rpcError;
        }

        console.log('PersonalizedNewsFeed: RPC successful, articles found:', rpcData?.length || 0);
        setArticles(rpcData || []);
      } catch (rpcError) {
        console.log('PersonalizedNewsFeed: RPC failed, using fallback query');
        
        // Fallback: direct query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('immigration_news')
          .select('*')
          .in('category', userProfile.preferred_categories)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(20);

        if (fallbackError) {
          console.error('PersonalizedNewsFeed: Fallback query failed:', fallbackError);
          throw fallbackError;
        }

        console.log('PersonalizedNewsFeed: Fallback query successful, articles found:', fallbackData?.length || 0);
        
        // Transform data to match expected format
        const transformedData = fallbackData?.map(article => ({
          ...article,
          is_read: false // Default to unread since we don't have reading history in fallback
        })) || [];

        setArticles(transformedData);
      }
    } catch (error: any) {
      console.error('PersonalizedNewsFeed: Error fetching personalized news:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      setError(`Failed to load personalized news: ${errorMessage}`);
      
      toast({
        title: "Error loading news",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (articleId: string) => {
    try {
      console.log('PersonalizedNewsFeed: Marking article as read:', articleId);
      
      // Use direct fetch approach since the table types aren't available
      const session = await supabase.auth.getSession();
      const response = await fetch('https://xybpgorbkiaitimxiqej.supabase.co/rest/v1/news_reading_history', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5YnBnb3Jia2lhaXRpbXhpcWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDkzNTgsImV4cCI6MjA2NDAyNTM1OH0.zLJ37ZRmFDj4hpiohHOZZonAzBiv8ASNDw7TVghF0N0',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify({
          user_id: user.id,
          article_id: articleId,
          read_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error('PersonalizedNewsFeed: Error marking as read:', await response.text());
      }

      // Update local state
      setArticles(articles.map(article => 
        article.id === articleId 
          ? { ...article, is_read: true }
          : article
      ));
    } catch (error) {
      console.error('PersonalizedNewsFeed: Error marking as read:', error);
      // Just update local state as fallback
      setArticles(articles.map(article => 
        article.id === articleId 
          ? { ...article, is_read: true }
          : article
      ));
    }
  };

  const ArticleCard = ({ article }: { article: PersonalizedNewsArticle }) => {
    const isExpanded = expandedArticle === article.id;
    const categoryName = categories.find(cat => cat.slug === article.category)?.name || article.category;
    
    return (
      <Card className={`mb-4 ${article.is_urgent ? 'border-red-200 bg-red-50' : ''} ${!article.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg leading-tight flex-1">
              {article.is_urgent && (
                <AlertTriangle className="inline-block w-5 h-5 text-red-500 mr-2" />
              )}
              {!article.is_read && (
                <div className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              )}
              {article.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
              <Clock className="w-4 h-4" />
              {format(new Date(article.published_at), 'MMM dd, yyyy')}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={article.is_urgent ? "destructive" : "secondary"}>
              {categoryName}
            </Badge>
            {article.is_read && (
              <Badge variant="outline" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Read
              </Badge>
            )}
            {article.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {article.summary && (
            <p className="text-muted-foreground mb-3">
              {article.summary}
            </p>
          )}
          
          {isExpanded && (
            <div className="prose max-w-none mb-4">
              <p className="whitespace-pre-wrap">{article.content}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExpandedArticle(isExpanded ? null : article.id);
                if (!article.is_read && !isExpanded) {
                  markAsRead(article.id);
                }
              }}
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </Button>
            
            {article.source_url && (
              <Button
                variant="default"
                size="sm"
                asChild
                className="bg-navy-800 hover:bg-navy-700"
              >
                <a 
                  href={article.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Full Article
                </a>
              </Button>
            )}
            
            {!article.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(article.id)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Mark as Read
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Error Loading News</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchPersonalizedNews()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Personalized News Feed</h2>
        <p className="text-muted-foreground">
          News tailored to your selected categories and interests
        </p>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No personalized news found. Check your category preferences in your profile or complete the onboarding process.
            </p>
            <Button onClick={() => fetchPersonalizedNews()}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalizedNewsFeed;
