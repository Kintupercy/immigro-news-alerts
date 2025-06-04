import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  published_at: string;
}

interface RelatedResourcesProps {
  articleCategory: string;
  articleTags: string[] | null;
  articleTitle: string;
  currentLanguage: 'en' | 'es';
}

const RelatedResources = ({
  articleCategory,
  articleTags,
  articleTitle,
  currentLanguage
}: RelatedResourcesProps) => {
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedArticles();
  }, [articleCategory, articleTags, articleTitle]);

  const fetchRelatedArticles = async () => {
    try {
      setLoading(true);
      
      // Category mapping for better matching
      const categoryKeywords: Record<string, string[]> = {
        'green-card': ['Green Card Guide', 'Marriage', 'Family Immigration'],
        'citizenship': ['Citizenship Guide', 'Naturalization'],
        'f1-student-visa': ['Student Visas', 'OPT', 'CPT'],
        'h1b-visa': ['Work Visas', 'Employment'],
        'family-based': ['Family Immigration', 'Marriage'],
        'employment-based': ['Employment', 'Work Visas'],
        'breaking-news': ['Immigration Guides', 'Legal Issues'],
        'daca': ['Legal Issues', 'Immigration Guides'],
        'refugees-asylees': ['Legal Issues', 'Immigration Guides'],
        'undocumented': ['Legal Issues', 'Immigration Guides']
      };

      const relevantCategories = categoryKeywords[articleCategory] || ['Immigration Guides'];
      
      // Fetch blog articles that match categories or keywords
      const { data: blogArticles, error } = await supabase
        .from('blog_articles')
        .select('id, title, slug, category, excerpt, published_at')
        .eq('status', 'published')
        .or(`category.in.(${relevantCategories.map(cat => `"${cat}"`).join(',')}),title.ilike.%${articleCategory}%`)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching related articles:', error);
        return;
      }

      setRelatedArticles(blogArticles || []);
    } catch (error) {
      console.error('Error in fetchRelatedArticles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border-t pt-4 mt-4">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded"></div>
            <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <h4 className="font-semibold text-sm text-gray-900">
          {currentLanguage === 'es' ? 'Recursos Relacionados' : 'Related Resources'}
        </h4>
      </div>
      
      <div className="space-y-3">
        {relatedArticles.map((article) => (
          <Card key={article.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h5 className="font-medium text-sm text-gray-900 leading-tight mb-1">
                    {article.title}
                  </h5>
                  {article.excerpt && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                  )}
                  <span className="text-xs text-blue-600 font-medium">
                    {article.category}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  asChild
                >
                  <a 
                    href={`/blog/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={currentLanguage === 'es' ? 'Leer artículo' : 'Read article'}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-3 text-center">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          className="text-xs"
        >
          <a href="/blog" target="_blank" rel="noopener noreferrer">
            {currentLanguage === 'es' ? 'Ver Más Guías' : 'View More Guides'}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default RelatedResources;