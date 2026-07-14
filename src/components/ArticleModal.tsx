
import { useState, useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ExternalLink, Shield, X } from "lucide-react";
import { format } from "date-fns";
import { translateCategory } from "@/utils/translation";
import { isOfficialGovArticle } from "@/utils/officialSources";
import SocialShareButton from "./SocialShareButton";
import RelatedResources from "./news/RelatedResources";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  source_url: string | null;
  published_at: string;
  is_urgent: boolean;
  tags: string[] | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
}

interface TranslatedArticleContent {
  title: string;
  summary: string | null;
  content: string;
}

interface ArticleModalProps {
  article: NewsArticle | null;
  categories: Category[];
  currentLanguage: 'en' | 'es';
  translatedContent: Record<string, TranslatedArticleContent>;
  getDisplayText: (text: string, articleId?: string, field?: string) => string;
  getSourceDomain: (url: string | null) => string;
  isOfficialSource: (url: string | null) => boolean;
  onClose: () => void;
}

const ArticleModal = ({
  article,
  categories,
  currentLanguage,
  translatedContent,
  getDisplayText,
  getSourceDomain,
  isOfficialSource,
  onClose
}: ArticleModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(!!article);
  }, [article]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!article) return null;

  const sourceDomain = getSourceDomain(article.source_url);
  const isOfficial = isOfficialSource(article.source_url);
  const isBreakingNews = isOfficialGovArticle(article);
  const articleUrl = `https://immigronews.com/news?article=${article.id}`;
  const categoryName = categories.find(cat => cat.slug === article.category)?.name || article.category;

  // NewsArticle structured data for Google News eligibility
  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.summary || article.content.substring(0, 160),
    "image": "https://immigronews.com/og-hero-preview.jpg",
    "datePublished": article.published_at,
    "dateModified": article.published_at,
    "author": {
      "@type": "Organization",
      "name": "ImmigroNews",
      "url": "https://immigronews.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ImmigroNews",
      "logo": {
        "@type": "ImageObject",
        "url": "https://immigronews.com/logo.png",
        "width": 512,
        "height": 512
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "articleSection": categoryName,
    "keywords": article.tags?.join(", ") || "immigration news",
    "isAccessibleForFree": true,
    "inLanguage": "en-US"
  };

  return (
    <>
      {/* SEO meta tags for the article when modal is open */}
      <Helmet>
        <title>{article.title} | ImmigroNews</title>
        <meta name="description" content={article.summary || article.content.substring(0, 160)} />
        <link rel="canonical" href={articleUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary || article.content.substring(0, 160)} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.published_at} />
        <meta property="article:section" content={categoryName} />
        {article.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <script type="application/ld+json">
          {JSON.stringify(newsArticleSchema)}
        </script>
      </Helmet>
      <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-xl leading-tight flex-1 pr-4">
              {article.is_urgent && (
                <AlertTriangle className="inline-block w-5 h-5 text-red-500 mr-2" />
              )}
              {isBreakingNews && !article.is_urgent && (
                <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded mr-2">
                  {currentLanguage === 'es' ? 'ÚLTIMA HORA' : 'BREAKING'}
                </span>
              )}
              {getDisplayText(article.title, article.id, 'title')}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {format(new Date(article.published_at), 'MMM dd, yyyy HH:mm')}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={article.is_urgent ? "destructive" : isBreakingNews ? "default" : "secondary"}>
              {currentLanguage === 'es' 
                ? translateCategory(categories.find(cat => cat.slug === article.category)?.name || article.category)
                : categories.find(cat => cat.slug === article.category)?.name || article.category
              }
            </Badge>
            
            <Badge 
              variant={isOfficial ? "default" : "outline"} 
              className={`text-xs ${isOfficial ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
            >
              {isOfficial && <Shield className="w-3 h-3 mr-1" />}
              {currentLanguage === 'es' ? 'Fuente' : 'Source'}: {sourceDomain}
            </Badge>
            
            {article.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {article.summary && (
            <p className="text-muted-foreground mb-4 text-lg">
              {getDisplayText(article.summary, article.id, 'summary')}
            </p>
          )}
          
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap text-base leading-relaxed">
              {getDisplayText(article.content, article.id, 'content')}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap mb-4">
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
                  {currentLanguage === 'es' ? 'Leer Original' : 'Read Original'}
                </a>
              </Button>
            )}

            <SocialShareButton 
              title={article.title}
              url={`https://immigronews.com/news?article=${article.id}`}
            />
          </div>

          {/* Enhanced Attribution Section */}
          {article.source_url && (
            <div className="text-xs text-muted-foreground border-t pt-3 mb-4">
              <p>
                {currentLanguage === 'es' ? 'Publicado originalmente por' : 'Originally published by'}{' '}
                <a 
                  href={article.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline font-medium"
                >
                  {sourceDomain}
                </a>
                {currentLanguage === 'es' 
                  ? '. Contenido agregado con fines educativos bajo uso justo.'
                  : '. Content aggregated for educational purposes under fair use.'
                }
              </p>
            </div>
          )}

          {/* Related Resources Section */}
          <RelatedResources
            articleCategory={article.category}
            articleTags={article.tags}
            articleTitle={article.title}
            currentLanguage={currentLanguage}
          />
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default ArticleModal;
