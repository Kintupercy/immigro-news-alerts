
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
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPersonalizedNews();
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('immigration_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPersonalizedNews = async () => {
    try {
      setLoading(true);
      
      // Call the personalized news function
      const { data, error } = await supabase.rpc('get_personalized_news', {
        user_id_param: user.id,
        limit_param: 20
      });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching personalized news:', error);
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
      // Use raw SQL query to insert into news_reading_history
      const { error } = await supabase.rpc('sql', {
        query: `
          INSERT INTO news_reading_history (user_id, article_id, read_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (user_id, article_id) DO NOTHING
        `,
        args: [user.id, articleId]
      });

      if (error) {
        console.error('Error marking as read:', error);
        // Fallback: just update local state
      }

      // Update local state
      setArticles(articles.map(article => 
        article.id === articleId 
          ? { ...article, is_read: true }
          : article
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
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
                variant="ghost"
                size="sm"
                asChild
              >
                <a 
                  href={article.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Source
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
              No personalized news found. Check your category preferences in your profile.
            </p>
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
