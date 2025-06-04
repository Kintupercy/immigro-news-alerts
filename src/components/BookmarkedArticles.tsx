
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, ExternalLink, Clock } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import SocialShareButton from "./SocialShareButton";

interface BookmarkedArticle {
  id: string;
  created_at: string;
  immigration_news: {
    id: string;
    title: string;
    content: string;
    summary: string | null;
    category: string;
    source_url: string | null;
    published_at: string;
    is_urgent: boolean;
    tags: string[] | null;
  };
}

const BookmarkedArticles = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const { toast } = useToast();

  if (!user) {
    return null; // This shouldn't happen due to ProtectedRoute
  }

  useEffect(() => {
    fetchBookmarks();
  }, [user.id]);

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          created_at,
          immigration_news (
            id,
            title,
            content,
            summary,
            category,
            source_url,
            published_at,
            is_urgent,
            tags
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast({
        title: "Error loading bookmarks",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;

      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== bookmarkId));
      toast({
        title: "Bookmark removed",
        description: "Article removed from your saved items.",
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your saved articles..." className="py-12" />;
  }

  if (bookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <BookmarkCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No saved articles yet. Start bookmarking articles to see them here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-navy-800 mb-4">Your Saved Articles ({bookmarks.length})</h2>
      
      {bookmarks.map((bookmark) => {
        const article = bookmark.immigration_news;
        const isExpanded = expandedArticle === article.id;
        
        return (
          <Card key={bookmark.id} className={article.is_urgent ? 'border-red-200 bg-red-50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg leading-tight flex-1">
                  {article.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                  <Clock className="w-4 h-4" />
                  Saved {format(new Date(bookmark.created_at), 'MMM dd')}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={article.is_urgent ? "destructive" : "secondary"}>
                  {article.category}
                </Badge>
                
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
              
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
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
                      Source
                    </a>
                  </Button>
                )}

                <SocialShareButton 
                  title={article.title}
                  url={article.source_url || window.location.href}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBookmark(bookmark.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BookmarkedArticles;
