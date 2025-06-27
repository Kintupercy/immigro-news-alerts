
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, ExternalLink, Shield } from "lucide-react";
import { format } from "date-fns";
import { translateCategory } from "@/utils/translation";
import SocialShareButton from "../SocialShareButton";
import RelatedResources from "./RelatedResources";

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

interface ArticleCardProps {
  article: NewsArticle;
  categories: Category[];
  currentLanguage: 'en' | 'es';
  translatedContent: Record<string, any>;
  expandedArticle: string | null;
  setExpandedArticle: (id: string | null) => void;
  getDisplayText: (text: string, articleId?: string, field?: string) => string;
  getSourceDomain: (url: string | null) => string;
  isOfficialSource: (url: string | null) => boolean;
  showExpandButton?: boolean;
}

const ArticleCard = ({
  article,
  categories,
  currentLanguage,
  translatedContent,
  expandedArticle,
  setExpandedArticle,
  getDisplayText,
  getSourceDomain,
  isOfficialSource,
  showExpandButton = true
}: ArticleCardProps) => {
  const isExpanded = expandedArticle === article.id;
  const sourceDomain = getSourceDomain(article.source_url);
  const isOfficial = isOfficialSource(article.source_url);
  const isBreakingNews = article.category === 'breaking-news';
  
  return (
    <Card className={`mb-4 transition-all duration-200 hover:shadow-md ${
      article.is_urgent ? 'border-red-200 bg-red-50' : 
      isBreakingNews ? 'border-orange-200 bg-orange-50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg leading-tight flex-1">
            {article.is_urgent && (
              <AlertTriangle className="inline-block w-5 h-5 text-red-500 mr-2" />
            )}
            {isBreakingNews && !article.is_urgent && (
              <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded mr-2">
                {currentLanguage === 'es' ? 'ÚLTIMA HORA' : 'BREAKING'}
              </span>
            )}
            {getDisplayText(article.title, article.id, 'title')}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
            <Clock className="w-4 h-4" />
            {format(new Date(article.published_at), 'MMM dd, yyyy')}
          </div>
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
      </CardHeader>
      
      <CardContent className="pt-0">
        {article.summary && (
          <p className="text-muted-foreground mb-3">
            {getDisplayText(article.summary, article.id, 'summary')}
          </p>
        )}
        
        {isExpanded && showExpandButton && (
          <div className="prose max-w-none mb-4">
            <p className="whitespace-pre-wrap">
              {getDisplayText(article.content, article.id, 'content')}
            </p>
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {showExpandButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedArticle(isExpanded ? null : article.id);
              }}
            >
              {isExpanded 
                ? (currentLanguage === 'es' ? 'Mostrar Menos' : 'Show Less')
                : (currentLanguage === 'es' ? 'Leer Más' : 'Read More')
              }
            </Button>
          )}
          
          {article.source_url && (
            <Button
              variant="default"
              size="sm"
              asChild
              className="bg-navy-800 hover:bg-navy-700"
              onClick={(e) => e.stopPropagation()}
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

          <div onClick={(e) => e.stopPropagation()}>
            <SocialShareButton 
              title={article.title}
              url={`https://immigronews.com/news?article=${article.id}`}
            />
          </div>
        </div>

        {/* Enhanced Attribution Section */}
        {article.source_url && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            <p>
              {currentLanguage === 'es' ? 'Publicado originalmente por' : 'Originally published by'}{' '}
              <a 
                href={article.source_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
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
        {showExpandButton && (
          <RelatedResources
            articleCategory={article.category}
            articleTags={article.tags}
            articleTitle={article.title}
            currentLanguage={currentLanguage}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
