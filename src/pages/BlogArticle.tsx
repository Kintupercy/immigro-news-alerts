
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, ArrowLeft, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  published_at: string;
  read_time: string;
  featured: boolean;
  meta_description: string;
  keywords: string[];
}

const BlogArticle = () => {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['blog-article', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data as BlogArticle;
    },
    enabled: !!slug,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen">
      <SEO 
        title={`${article.title} | ImmigroNews`}
        description={article.meta_description || article.excerpt}
        keywords={article.keywords || []}
        url={`https://immigronews.com/blog/${article.slug}`}
        type="article"
      />
      <Header />
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back to Blog Button */}
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              {article.category}
            </Badge>
            {article.featured && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Featured
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-b border-gray-200 pb-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {article.author}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(article.published_at)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {article.read_time}
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: article.content.replace(/\n/g, '<br />').replace(/##\s+(.+)/g, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/- (.+)/g, '<li>$1</li>').replace(/(<li>.*<\/li>)/g, '<ul class="list-disc pl-6 mb-4">$1</ul>')
            }} 
          />
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help With Your Immigration Case?
            </h3>
            <p className="text-gray-600 mb-4">
              Get expert guidance and personalized assistance with your immigration journey.
            </p>
            <Button asChild>
              <Link to="/contact">
                Contact an Immigration Expert
              </Link>
            </Button>
          </div>
        </footer>
      </article>

      <Footer />
    </div>
  );
};

export default BlogArticle;
