
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface BookmarkButtonProps {
  articleId: string;
  user: User;
  className?: string;
}

const BookmarkButton = ({ articleId, user, className }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkBookmarkStatus();
  }, [articleId, user.id]);

  const checkBookmarkStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsBookmarked(!!data);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    setLoading(true);
    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);

        if (error) throw error;

        setIsBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: "Article removed from your saved items.",
        });
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            article_id: articleId
          });

        if (error) throw error;

        setIsBookmarked(true);
        toast({
          title: "Article bookmarked",
          description: "Article saved to your favorites.",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleBookmark}
      disabled={loading}
      className={className}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4 mr-2 text-yellow-600" />
      ) : (
        <Bookmark className="w-4 h-4 mr-2" />
      )}
      {isBookmarked ? 'Saved' : 'Save'}
    </Button>
  );
};

export default BookmarkButton;
