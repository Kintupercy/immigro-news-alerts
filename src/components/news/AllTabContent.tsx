
import ArticleCard from "./ArticleCard";

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

interface AllTabContentProps {
  articles: NewsArticle[];
  categories: Category[];
  currentLanguage: 'en' | 'es';
  translatedContent: Record<string, any>;
  expandedArticle: string | null;
  setExpandedArticle: (id: string | null) => void;
  getDisplayText: (text: string, articleId?: string, field?: string) => string;
  getSourceDomain: (url: string | null) => string;
  isOfficialSource: (url: string | null) => boolean;
  onArticleClick?: (article: NewsArticle) => void;
}

const AllTabContent = ({
  articles,
  categories,
  currentLanguage,
  translatedContent,
  expandedArticle,
  setExpandedArticle,
  getDisplayText,
  getSourceDomain,
  isOfficialSource,
  onArticleClick
}: AllTabContentProps) => {
  
  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {currentLanguage === 'es' 
          ? 'No se encontraron artículos que coincidan con sus criterios de búsqueda.'
          : 'No articles found matching your search criteria.'
        }
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div 
          key={article.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => onArticleClick?.(article)}
        >
          <ArticleCard
            article={article}
            categories={categories}
            currentLanguage={currentLanguage}
            translatedContent={translatedContent}
            expandedArticle={expandedArticle}
            setExpandedArticle={setExpandedArticle}
            getDisplayText={getDisplayText}
            getSourceDomain={getSourceDomain}
            isOfficialSource={isOfficialSource}
            showExpandButton={false} // Disable expand since we're using modal
          />
        </div>
      ))}
    </div>
  );
};

export default AllTabContent;
