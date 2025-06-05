import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { enhancedCache, cacheKeys } from "@/utils/enhancedCache";
import { rateLimiter, RATE_LIMITS } from "@/utils/rateLimiter";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import ErrorBoundary from "./ErrorBoundary";
import { NewsLoadingState } from "./LoadingStates";
import KofiDonateButton from "./KofiDonateButton";
import { translateText } from "@/utils/translation";
import NewsHeader from "./news/NewsHeader";
import NewsFilters from "./news/NewsFilters";
import NewsTabs from "./news/NewsTabs";

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

const ARTICLES_PER_PAGE = 10;

const NewsFeed = () => {
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userPreferredCategories, setUserPreferredCategories] = useState<string[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es'>('en');
  const [translatedContent, setTranslatedContent] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { handleError, retry, canRetry } = useErrorHandler();

  // Free tier: limit to 3 categories
  const FREE_CATEGORIES_LIMIT = 3;
  const FREE_TIER_CATEGORIES = ['green-card', 'citizenship', 'work-visas-employment'];

  // Filter articles based on selected category and search term
  const getFilteredArticles = () => {
    let filtered = allArticles;

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'breaking-news') {
        filtered = filtered.filter(article => article.category === 'breaking-news');
      } else {
        // Enhanced filtering for all categories
        filtered = filtered.filter(article => {
          // Direct category match
          if (article.category === selectedCategory) return true;
          
          // Define keywords for each category
          const categoryKeywords: Record<string, string[]> = {
            'f1-student-visa': ['f-1', 'f1', 'student visa', 'international student', 'university', 'college', 'opt', 'cpt', 'stem', 'academic', 'optional practical training', 'curricular practical training'],
            'h1b-visa': ['h-1b', 'h1b', 'specialty occupation', 'skilled worker', 'professional', 'cap', 'lottery'],
            'green-card': ['green card', 'permanent residence', 'permanent resident', 'pr', 'adjustment of status', 'aos', 'priority date', 'perm'],
            'citizenship': ['citizenship', 'naturalization', 'naturalize', 'citizen', 'civics test', 'oath ceremony', 'n-400'],
            'employment-based': ['employment based', 'work visa', 'work permit', 'ead', 'employment authorization', 'labor certification', 'eb-1', 'eb-2', 'eb-3'],
            'family-based': ['family based', 'family reunification', 'spouse visa', 'parent visa', 'sibling visa', 'fiancé', 'k-1', 'ir-1', 'f1', 'f2', 'f3', 'f4'],
            'daca': ['daca', 'deferred action', 'childhood arrivals', 'dreamer', 'dreamers'],
            'tps': ['tps', 'temporary protected status', 'protected status'],
            'refugees-asylees': ['refugee', 'asylum', 'asylee', 'persecution', 'withholding of removal'],
            'l1-visa': ['l-1', 'l1', 'intracompany transfer', 'multinational company', 'manager', 'executive'],
            'eb5-investor-visa': ['eb-5', 'eb5', 'investor visa', 'investment', 'regional center', 'job creation'],
            'investors': ['investor', 'e-1', 'e-2', 'treaty trader', 'treaty investor', 'entrepreneur'],
            'religious-workers': ['r-1', 'religious worker', 'minister', 'missionary', 'religious occupation'],
            'temporary-visitors': ['b-1', 'b-2', 'tourist', 'visitor', 'business visitor', 'tourism'],
            'specialty-occupations': ['nafta', 'usmca', 'tn', 'specialty occupation', 'canadian', 'mexican'],
            'exchange-visitors': ['j-1', 'exchange visitor', 'cultural exchange', 'au pair', 'intern', 'trainee'],
            'undocumented': ['undocumented', 'mixed status', 'deportation', 'removal proceedings', 'ice raid']
          };

          const keywords = categoryKeywords[selectedCategory] || [];
          
          // Check tags
          if (article.tags && article.tags.some(tag => 
            keywords.some(keyword => tag.toLowerCase().includes(keyword.toLowerCase())))) {
            return true;
          }
          
          // Check title
          if (keywords.some(keyword => article.title.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          // Check content
          if (keywords.some(keyword => article.content.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          // Check summary
          if (article.summary && keywords.some(keyword => article.summary.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          return false;
        });
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredArticles = getFilteredArticles();

  // Paginate the filtered articles
  const getPaginatedArticles = () => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    return filteredArticles.slice(startIndex, endIndex);
  };

  const paginatedArticles = getPaginatedArticles();
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  // Urgent articles should respect the selected category filter
  const urgentArticles = filteredArticles.filter(article => article.is_urgent);
  const regularArticles = filteredArticles.filter(article => !article.is_urgent);
  const breakingNewsArticles = filteredArticles.filter(article => article.category === 'breaking-news');

  // Simplified language change handler
  const handleLanguageChange = async (language: 'en' | 'es') => {
    setCurrentLanguage(language);
    
    if (language === 'es') {
      // Translate current articles if switching to Spanish
      const newTranslatedContent: Record<string, any> = {};
      
      for (const article of paginatedArticles) {
        if (!translatedContent[article.id]) {
          try {
            const [translatedTitle, translatedSummary, translatedContent] = await Promise.all([
              translateText(article.title, 'es'),
              article.summary ? translateText(article.summary, 'es') : null,
              translateText(article.content, 'es')
            ]);
            
            newTranslatedContent[article.id] = {
              title: translatedTitle,
              summary: translatedSummary,
              content: translatedContent
            };
          } catch (error) {
            console.error('Translation error for article:', article.id, error);
          }
        }
      }
      
      setTranslatedContent(prev => ({ ...prev, ...newTranslatedContent }));
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Skip user preferences for public site
        setUserPreferredCategories([]);

        // Load categories and articles in parallel with enhanced caching
        await Promise.all([
          fetchCategories(),
          fetchAllArticles()
        ]);
      } catch (error) {
        handleError(error as Error, 'initialization');
      }
    };

    initializeData();
  }, []);

  const fetchCategories = async () => {
    try {
      const categories = await enhancedCache.getOrFetch(
        cacheKeys.categories(),
        async () => {
          const { data, error } = await supabase
            .from('immigration_categories')
            .select('*')
            .order('name');

          if (error) throw error;
          return data || [];
        },
        30 // Cache for 30 minutes
      );
      
      setCategories(categories);
    } catch (error) {
      handleError(error as Error, 'fetching categories');
    }
  };

  // Fetch all articles once and store them
  const fetchAllArticles = async () => {
    try {
      setLoading(true);
      
      if (!rateLimiter.isAllowed('news-fetch', RATE_LIMITS.NEWS_FETCH)) {
        toast({
          title: "Rate limit exceeded",
          description: "Please wait before fetching more news.",
          variant: "destructive",
        });
        return;
      }

      const cacheKey = cacheKeys.news('all', '', 1);
      
      // Use background refresh for better UX
      const result = await enhancedCache.backgroundRefresh(
        cacheKey,
        async () => {
          let query = supabase
            .from('immigration_news')
            .select('*')
            .eq('status', 'published')
            .not('source_url', 'is', null)
            .order('published_at', { ascending: false })
            .limit(500); // Load 500 articles for all users

          const { data, error } = await query;
          if (error) throw error;
          
          const filteredData = (data || []).filter(article => 
            article.source_url && 
            !article.source_url.includes('youtube.com') &&
            !article.source_url.includes('youtu.be')
          );

          return {
            articles: filteredData,
            total: filteredData.length
          };
        },
        5 // Cache for 5 minutes
      );
      
      setAllArticles(result.articles);

      if (result.articles.length === 0) {
        console.log('No articles found, fetching fresh news...');
        await refreshNews(false);
      }
    } catch (error) {
      handleError(error as Error, 'fetching articles');
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async (forceRefresh: boolean = true) => {
    try {
      setRefreshing(true);
      
      if (!rateLimiter.isAllowed('news-refresh', RATE_LIMITS.API_CALLS)) {
        toast({
          title: "Too many refresh attempts",
          description: "Please wait before refreshing again.",
          variant: "destructive",
        });
        return;
      }

      if (forceRefresh) {
        enhancedCache.delete(cacheKeys.news('all', '', 1));
      }
      
      toast({
        title: "Fetching latest news...",
        description: "Getting verified immigration updates and breaking news from major outlets.",
      });

      // Fetch both regular immigration news and breaking news
      const [regularNewsResponse, breakingNewsResponse] = await Promise.all([
        supabase.functions.invoke('fetch-immigration-news', {
          body: { 
            category: 'all',
            forceRefresh: forceRefresh
          }
        }),
        supabase.functions.invoke('fetch-breaking-news')
      ]);

      const totalArticlesAdded = (regularNewsResponse.data?.articlesAdded || 0) + (breakingNewsResponse.data?.articlesAdded || 0);
      const urgentNewsFound = (breakingNewsResponse.data?.urgentNewsFound || 0);

      if (totalArticlesAdded > 0) {
        toast({
          title: "News updated!",
          description: `Successfully fetched ${totalArticlesAdded} new articles${urgentNewsFound > 0 ? ` (${urgentNewsFound} urgent)` : ''}.`,
        });
        enhancedCache.delete(cacheKeys.news('all', '', 1));
        await fetchAllArticles();
        setCurrentPage(1);
      } else {
        toast({
          title: "No new articles",
          description: "All articles are up to date.",
        });
      }
    } catch (error) {
      handleError(error as Error, 'refreshing news');
    } finally {
      setRefreshing(false);
    }
  };

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const getSourceDomain = (url: string | null) => {
    if (!url) return 'Unknown';
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return 'Unknown';
    }
  };

  const isOfficialSource = (url: string | null) => {
    if (!url) return false;
    const officialDomains = ['uscis.gov', 'dhs.gov', 'state.gov', 'ice.gov', 'cbp.gov'];
    return officialDomains.some(domain => url.includes(domain));
  };

  const getDisplayText = (text: string, articleId?: string, field?: string) => {
    if (currentLanguage === 'es' && articleId && field && translatedContent[articleId]) {
      return translatedContent[articleId][field] || text;
    }
    return text;
  };

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  const isCategoryLocked = (categorySlug: string) => {
    return false; // All categories are free now
  };

  // Get all categories since everything is free
  const getCategoriesToDisplay = () => {
    return categories;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {getPageNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {page === '...' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (loading) {
    return <NewsLoadingState />;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Ko-fi Donate Banner - New Position */}
        <KofiDonateButton variant="banner" className="mb-6" />

        {/* Header Section */}
        <NewsHeader
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          user={user}
          userPreferredCategories={userPreferredCategories}
        />

        {/* Filters Section */}
        <NewsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          handleCategoryClick={handleCategoryClick}
          categories={categories}
          currentLanguage={currentLanguage}
          userPreferredCategories={userPreferredCategories}
          getCategoriesToDisplay={getCategoriesToDisplay}
          isCategoryLocked={isCategoryLocked}
        />

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4 text-sm text-muted-foreground">
            {currentLanguage === 'es' 
              ? `${filteredArticles.length} ${filteredArticles.length === 1 ? 'artículo encontrado' : 'artículos encontrados'} que coinciden con "${searchTerm}"`
              : `Found ${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''} matching "${searchTerm}"`
            }
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-6 text-sm text-muted-foreground">
          {currentLanguage === 'es' 
            ? `Mostrando ${paginatedArticles.length} de ${filteredArticles.length} artículos (Página ${currentPage} de ${totalPages})`
            : `Showing ${paginatedArticles.length} of ${filteredArticles.length} articles (Page ${currentPage} of ${totalPages})`
          }
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <NewsTabs
              paginatedArticles={paginatedArticles}
              filteredArticles={filteredArticles}
              urgentArticles={urgentArticles}
              breakingNewsArticles={breakingNewsArticles}
              regularArticles={regularArticles}
              categories={categories}
              currentLanguage={currentLanguage}
              translatedContent={translatedContent}
              expandedArticle={expandedArticle}
              setExpandedArticle={setExpandedArticle}
              searchTerm={searchTerm}
              getDisplayText={getDisplayText}
              getSourceDomain={getSourceDomain}
              isOfficialSource={isOfficialSource}
              ARTICLES_PER_PAGE={ARTICLES_PER_PAGE}
              currentPage={currentPage}
            />
            
            {/* Pagination */}
            {renderPagination()}
          </div>

        </div>
      </div>
    </ErrorBoundary>
  );
};

export default NewsFeed;
