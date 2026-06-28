import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

interface RelatedPostsProps {
  currentSlug: string;
  category: string;
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string;
  category: string;
  published_at: string;
  read_time: string | null;
}

const RelatedPosts = ({ currentSlug, category }: RelatedPostsProps) => {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["related-posts", currentSlug, category],
    queryFn: async () => {
      // Primary: posts from the same category, excluding the current one.
      const { data: sameCategory, error: sameCategoryError } = await supabase
        .from("blog_articles")
        .select(
          "id, title, slug, excerpt, author, category, published_at, read_time"
        )
        .eq("status", "published")
        .eq("category", category)
        .neq("slug", currentSlug)
        .order("published_at", { ascending: false })
        .limit(3);

      if (sameCategoryError) throw sameCategoryError;

      let results: RelatedArticle[] = (sameCategory as RelatedArticle[]) || [];

      // Top up with most-recent posts from any category if we have <3.
      if (results.length < 3) {
        const existingSlugs = new Set<string>([
          currentSlug,
          ...results.map((a) => a.slug),
        ]);

        const { data: fallback, error: fallbackError } = await supabase
          .from("blog_articles")
          .select(
            "id, title, slug, excerpt, author, category, published_at, read_time"
          )
          .eq("status", "published")
          .neq("slug", currentSlug)
          .order("published_at", { ascending: false })
          .limit(6);

        if (fallbackError) throw fallbackError;

        for (const item of (fallback as RelatedArticle[]) || []) {
          if (results.length >= 3) break;
          if (!existingSlugs.has(item.slug)) {
            results.push(item);
            existingSlugs.add(item.slug);
          }
        }
      }

      return results.slice(0, 3);
    },
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (isLoading) {
    return (
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-1/3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-56 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-16 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-playfair text-2xl lg:text-3xl font-bold text-gray-900">
            Related Articles
          </h2>
          <p className="text-gray-600 mt-2">
            More immigration coverage you may find useful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col bg-white"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800"
                  >
                    {article.category}
                  </Badge>
                  {article.read_time && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.read_time}
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg font-playfair leading-tight hover:text-emerald-600 transition-colors">
                  <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {article.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {article.author}
                  </div>
                  <span>{formatDate(article.published_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedPosts;
