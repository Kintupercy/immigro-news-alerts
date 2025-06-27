
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArticleCard from "../news/ArticleCard";
import AllTabContent from "./AllTabContent";

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

interface NewsTabsProps {
  paginatedArticles: NewsArticle[];
  filteredArticles: NewsArticle[];
  allArticlesForAllTab: NewsArticle[];
  urgentArticles: NewsArticle[];
  breakingNewsArticles: NewsArticle[];
  regularArticles: NewsArticle[];
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
  onArticleClick?: (article: NewsArticle) => void;
}

const NewsTabs = ({
  paginatedArticles,
  filteredArticles,
  allArticlesForAllTab,
  urgentArticles,
  breakingNewsArticles,
  regularArticles,
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
  currentPage,
  onArticleClick
}: NewsTabsProps) => {

  const renderArticleCard = (article: NewsArticle) => (
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
  );

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          {currentLanguage === 'es' ? 'Todas' : 'All'} ({allArticlesForAllTab.length})
        </TabsTrigger>
        <TabsTrigger value="urgent" className="text-red-600">
          {currentLanguage === 'es' ? 'Urgente' : 'Urgent'} ({urgentArticles.length})
        </TabsTrigger>
        <TabsTrigger value="breaking" className="text-orange-600">
          {currentLanguage === 'es' ? 'Última Hora' : 'Breaking'} ({breakingNewsArticles.length})
        </TabsTrigger>
        <TabsTrigger value="regular">
          {currentLanguage === 'es' ? 'Regulares' : 'Regular'} ({regularArticles.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-6">
        <AllTabContent 
          articles={paginatedArticles}
          categories={categories}
          currentLanguage={currentLanguage}
          translatedContent={translatedContent}
          expandedArticle={expandedArticle}
          setExpandedArticle={setExpandedArticle}
          getDisplayText={getDisplayText}
          getSourceDomain={getSourceDomain}
          isOfficialSource={isOfficialSource}
          onArticleClick={onArticleClick}
        />
      </TabsContent>

      <TabsContent value="urgent" className="mt-6">
        <div className="space-y-4">
          {urgentArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {currentLanguage === 'es' 
                ? 'No hay noticias urgentes en este momento.'
                : 'No urgent news at this time.'
              }
            </div>
          ) : (
            urgentArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE).map(renderArticleCard)
          )}
        </div>
      </TabsContent>

      <TabsContent value="breaking" className="mt-6">
        <div className="space-y-4">
          {breakingNewsArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {currentLanguage === 'es' 
                ? 'No hay noticias de última hora en este momento.'
                : 'No breaking news at this time.'
              }
            </div>
          ) : (
            breakingNewsArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE).map(renderArticleCard)
          )}
        </div>
      </TabsContent>

      <TabsContent value="regular" className="mt-6">
        <div className="space-y-4">
          {regularArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {currentLanguage === 'es' 
                ? 'No hay noticias regulares en este momento.'
                : 'No regular news at this time.'
              }
            </div>
          ) : (
            regularArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE).map(renderArticleCard)
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default NewsTabs;
