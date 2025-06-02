
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

  const formatContent = (content: string) => {
    // Clean up and properly structure the content
    return content
      .replace(/^# .+$/gm, '') // Remove main title
      .replace(/^## (.+)$/gm, '<h2 class="text-xl lg:text-2xl font-bold mt-6 lg:mt-8 mb-3 lg:mb-4 text-gray-900 font-playfair">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="mb-2">$1</li>')
      .replace(/(<li class="mb-2">.*?<\/li>\s*)+/gs, '<ul class="list-disc pl-4 lg:pl-6 mb-4 lg:mb-6 space-y-1 lg:space-y-2">$&</ul>')
      .split('\n\n')
      .map(paragraph => {
        paragraph = paragraph.trim();
        if (!paragraph) return '';
        if (paragraph.startsWith('<h2') || paragraph.startsWith('<ul')) {
          return paragraph;
        }
        return `<p class="mb-3 lg:mb-4 leading-relaxed text-gray-700 text-sm lg:text-base">${paragraph}</p>`;
      })
      .filter(Boolean)
      .join('\n');
  };

  // Generate enhanced SEO data
  const generateSEOData = (article: BlogArticle) => {
    const baseKeywords = [
      'immigration',
      'visa',
      'green card',
      'citizenship',
      'USCIS',
      'immigration law',
      'immigration attorney',
      'immigration guide'
    ];

    const enhancedKeywords = [
      ...baseKeywords,
      ...(article.keywords || []),
      article.category.toLowerCase(),
      'immigration help',
      'visa application',
      'immigration process'
    ];

    const metaDescription = article.meta_description || 
      `${article.excerpt?.substring(0, 150)}... Expert immigration guidance and step-by-step instructions for your immigration journey.`;

    return {
      title: `${article.title} - Complete Immigration Guide`,
      description: metaDescription,
      keywords: enhancedKeywords,
      publishedTime: article.published_at,
      author: article.author,
      section: article.category,
      tags: article.keywords || []
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-6 lg:h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
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

  const seoData = generateSEOData(article);

  return (
    <div className="min-h-screen">
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={`https://immigronews.com/blog/${article.slug}`}
        type="article"
        publishedTime={seoData.publishedTime}
        author={seoData.author}
        section={seoData.section}
        tags={seoData.tags}
        canonicalUrl={`https://immigronews.com/blog/${article.slug}`}
      />
      <Header />
      
      <article className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://immigronews.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://immigronews.com/blog"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": article.title,
                "item": `https://immigronews.com/blog/${article.slug}`
              }
            ]
          })}
        </script>

        {/* Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.excerpt,
            "image": "https://immigronews.com/og-image.jpg",
            "url": `https://immigronews.com/blog/${article.slug}`,
            "datePublished": article.published_at,
            "dateModified": article.published_at,
            "author": {
              "@type": "Organization",
              "name": article.author,
              "url": "https://immigronews.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "ImmigroNews",
              "logo": {
                "@type": "ImageObject",
                "url": "https://immigronews.com/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://immigronews.com/blog/${article.slug}`
            },
            "articleSection": article.category,
            "keywords": seoData.keywords.join(", "),
            "wordCount": article.content.split(' ').length,
            "timeRequired": article.read_time,
            "inLanguage": "en-US"
          })}
        </script>

        {/* Back to Blog Button */}
        <div className="mb-4 lg:mb-6">
          <Button variant="outline" asChild className="mb-4 h-10 lg:h-12">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-4 mb-4">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 w-fit">
              {article.category}
            </Badge>
            {article.featured && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 w-fit">
                Featured
              </Badge>
            )}
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className="text-lg lg:text-xl text-gray-600 mb-4 lg:mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 text-sm text-gray-500 border-b border-gray-200 pb-4 lg:pb-6">
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
        <div className="prose prose-sm lg:prose-lg max-w-none">
          <div 
            className="text-gray-800 leading-relaxed [&>h2]:scroll-mt-6 [&>h2]:lg:scroll-mt-8"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(article.content)
            }} 
          />
        </div>

        {/* Article Footer */}
        <footer className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help With Your Immigration Case?
            </h3>
            <p className="text-gray-600 mb-4 text-sm lg:text-base">
              Get expert guidance and personalized assistance with your immigration journey.
            </p>
            <Button asChild className="w-full sm:w-auto">
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
