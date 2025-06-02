
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Newspaper } from "lucide-react";
import { EmptyState } from "../LoadingStates";
import ArticleCard from "./ArticleCard";
import AdBanner from "../AdBanner";

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
  urgentArticles: NewsArticle[];
  breakingNewsArticles: NewsArticle[];
  regularArticles: NewsArticle[];
  categories: Category[];
  currentLanguage: 'en' | 'es';
  translatedContent: Record<string, any>;
  expandedArticle: string | null;
  setExpandedArticle: (id: string | null) => void;
  user: any;
  isProMember: boolean;
  searchTerm: string;
  getDisplayText: (text: string, articleId?: string, field?: string) => string;
  getSourceDomain: (url: string | null) => string;
  isOfficialSource: (url: string | null) => boolean;
  ARTICLES_PER_PAGE: number;
  currentPage: number;
}

const NewsTabs = ({
  paginatedArticles,
  urgentArticles,
  breakingNewsArticles,
  regularArticles,
  categories,
  currentLanguage,
  translatedContent,
  expandedArticle,
  setExpandedArticle,
  user,
  isProMember,
  searchTerm,
  getDisplayText,
  getSourceDomain,
  isOfficialSource,
  ARTICLES_PER_PAGE,
  currentPage
}: NewsTabsProps) => {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
        <TabsTrigger value="all" className="text-xs sm:text-sm px-2 py-2">
          {currentLanguage === 'es' ? `Todas (${paginatedArticles.length})` : `All (${paginatedArticles.length})`}
        </TabsTrigger>
        <TabsTrigger value="urgent" className="text-red-600 text-xs sm:text-sm px-2 py-2">
          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          {currentLanguage === 'es' ? `Urgente (${urgentArticles.length})` : `Urgent (${urgentArticles.length})`}
        </TabsTrigger>
        <TabsTrigger value="breaking" className="text-orange-600 text-xs sm:text-sm px-2 py-2">
          {currentLanguage === 'es' ? `Breaking (${breakingNewsArticles.length})` : `Breaking (${breakingNewsArticles.length})`}
        </TabsTrigger>
        <TabsTrigger value="regular" className="text-xs sm:text-sm px-2 py-2">
          {currentLanguage === 'es' ? `Regular (${regularArticles.length})` : `Regular (${regularArticles.length})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-0">
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
            paginatedArticles.map((article, index) => (
              <div key={article.id}>
                <ArticleCard 
                  article={article}
                  categories={categories}
                  currentLanguage={currentLanguage}
                  translatedContent={translatedContent}
                  expandedArticle={expandedArticle}
                  setExpandedArticle={setExpandedArticle}
                  user={user}
                  getDisplayText={getDisplayText}
                  getSourceDomain={getSourceDomain}
                  isOfficialSource={isOfficialSource}
                />
                {/* Insert ad every 3 articles for free users */}
                {!isProMember && (index + 1) % 3 === 0 && (
                  <AdBanner position="between-articles" className="my-6" />
                )}
              </div>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="urgent" className="mt-0">
        <div className="space-y-4">
          {urgentArticles.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title={currentLanguage === 'es' ? 'No hay alertas urgentes en este momento' : 'No urgent alerts at this time'}
            />
          ) : (
            urgentArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE).map((article, index) => (
              <div key={article.id}>
                <ArticleCard 
                  article={article}
                  categories={categories}
                  currentLanguage={currentLanguage}
                  translatedContent={translatedContent}
                  expandedArticle={expandedArticle}
                  setExpandedArticle={setExpandedArticle}
                  user={user}
                  getDisplayText={getDisplayText}
                  getSourceDomain={getSourceDomain}
                  isOfficialSource={isOfficialSource}
                />
                {!isProMember && (index + 1) % 3 === 0 && (
                  <AdBanner position="between-articles" className="my-6" />
                )}
              </div>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="breaking" className="mt-0">
        <div className="space-y-4">
          {breakingNewsArticles.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title={currentLanguage === 'es' ? 'No hay noticias de última hora en este momento' : 'No breaking news at this time'}
            />
          ) : (
            breakingNewsArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE).map((article, index) => (
              <div key={article.id}>
                <ArticleCard 
                  article={article}
                  categories={categories}
                  currentLanguage={currentLanguage}
                  translatedContent={translatedContent}
                  expandedArticle={expandedArticle}
                  setExpandedArticle={setExpandedArticle}
                  user={user}
                  getDisplayText={getDisplayText}
                  getSourceDomain={getSourceDomain}
                  isOfficialSource={isOfficialSource}
                />
                {!isProMember && (index + 1) % 3 === 0 && (
                  <AdBanner position="between-articles" className="my-6" />
                )}
              </div>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="regular" className="mt-0">
        <div className="space-y-4">
          {regularArticles.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title={currentLanguage === 'es' ? 'No se encontraron artículos de noticias regulares' : 'No regular news articles found'}
            />
          ) : (
            regularArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE).map((article, index) => (
              <div key={article.id}>
                <ArticleCard 
                  article={article}
                  categories={categories}
                  currentLanguage={currentLanguage}
                  translatedContent={translatedContent}
                  expandedArticle={expandedArticle}
                  setExpandedArticle={setExpandedArticle}
                  user={user}
                  getDisplayText={getDisplayText}
                  getSourceDomain={getSourceDomain}
                  isOfficialSource={isOfficialSource}
                />
                {!isProMember && (index + 1) % 3 === 0 && (
                  <AdBanner position="between-articles" className="my-6" />
                )}
              </div>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default NewsTabs;
