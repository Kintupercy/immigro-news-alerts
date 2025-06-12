import { Newspaper } from "lucide-react";
import { EmptyState } from "../LoadingStates";
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
  searchTerm: string;
  getDisplayText: (text: string, articleId?: string, field?: string) => string;
  getSourceDomain: (url: string | null) => string;
  isOfficialSource: (url: string | null) => boolean;
  ARTICLES_PER_PAGE: number;
  currentPage: number;
}

const AllTabContent = ({
  articles,
  categories,
  currentLanguage,
  translatedContent,
  expandedArticle,
  setExpandedArticle,
  searchTerm,
  getDisplayText,
  getSourceDomain,
  isOfficialSource,
  ARTICLES_PER_PAGE,
  currentPage
}: AllTabContentProps) => {
  const paginatedArticles = articles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE);

  return (
    <div className="space-y-4">
      {paginatedArticles.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={searchTerm 
            ? (currentLanguage === 'es' 
                ? `No se encontraron artículos que coincidan con "${searchTerm}"`
                : `No articles found matching "${searchTerm}"`)
            : (currentLanguage === 'es' 
                ? 'No se encontraron artículos verificados'
                : 'No verified articles found')
          }
          description={searchTerm 
            ? (currentLanguage === 'es' ? 'Prueba con diferentes palabras clave.' : 'Try different keywords.')
            : (currentLanguage === 'es' 
                ? 'Las noticias se actualizan automáticamente dos veces al día con las últimas fuentes oficiales.'
                : 'News is automatically updated twice daily from the latest official sources.')
          }
        />
      ) : (
        paginatedArticles.map((article) => (
          <div key={article.id}>
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
            />
          </div>
        ))
      )}
    </div>
  );
};

export default AllTabContent;