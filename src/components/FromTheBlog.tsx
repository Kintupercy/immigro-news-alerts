import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  published_at: string;
  read_time: string;
  featured: boolean;
}

const FromTheBlog = () => {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['blog-articles-homepage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('id, title, slug, excerpt, author, category, published_at, read_time, featured')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as BlogArticle[];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-4">
            From the Immigration Blog
          </h2>
          <span className="reveal-underline block h-1 w-16 mx-auto mb-5 rounded-full bg-cream-500" aria-hidden="true" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert guides, step-by-step instructions, and the latest analysis
            to help you navigate your immigration journey.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {article.category}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {article.read_time}
                  </div>
                </div>
                <CardTitle className="text-lg font-playfair leading-tight hover:text-emerald-600 transition-colors">
                  <Link to={`/blog/${article.slug}`}>
                    {article.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1">
                  {article.excerpt}
                </p>
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

        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
            <Link to="/blog" className="flex items-center gap-2">
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FromTheBlog;
