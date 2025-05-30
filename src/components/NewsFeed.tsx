
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, Search, ExternalLink, RefreshCw, Shield, Newspaper, Crown, Lock } from "lucide-react";
import { format } from "date-fns";
import { enhancedCache, cacheKeys } from "@/utils/enhancedCache";
import { rateLimiter, RATE_LIMITS } from "@/utils/rateLimiter";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import ErrorBoundary from "./ErrorBoundary";
import { NewsLoadingState, NewsCardSkeleton, EmptyState, CategoriesSkeleton } from "./LoadingStates";
import BookmarkButton from "./BookmarkButton";
import SocialShareButton from "./SocialShareButton";
import LanguageToggle from "./LanguageToggle";
import AdBanner from "./AdBanner";
import { useProMembership } from "@/hooks/useProMembership";
import { useFreemiumFeatures } from "@/hooks/useFreemiumFeatures";
import UpgradeModal from "./UpgradeModal";
import { translateText, translateCategory } from "@/utils/translation";

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

const NewsFeed = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es'>('en');
  const [translatedContent, setTranslatedContent] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const { handleError, retry, canRetry } = useErrorHandler();
  const { isProMember } = useProMembership(user);
  const { checkFeatureAccess, showUpgradePrompt, upgradeModalOpen, setUpgradeModalOpen } = useFreemiumFeatures(user);

  // Free tier: limit to 3 categories
  const FREE_CATEGORIES_LIMIT = 3;
  const FREE_TIER_CATEGORIES = ['green-card', 'citizenship', 'employment-based'];

  // Add the missing handleLanguageChange function
  const handleLanguageChange = async (language: 'en' | 'es') => {
    if (language === 'es' && !isProMember) {
      showUpgradePrompt('spanishTranslation');
      return;
    }
    
    setCurrentLanguage(language);
    
    if (language === 'es' && isProMember) {
      // Translate current articles if switching to Spanish
      const newTranslatedContent: Record<string, any> = {};
      
      for (const article of articles) {
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

        // Load categories and articles in parallel with enhanced caching
        await Promise.all([
          fetchCategories(),
          fetchArticles()
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

  const fetchArticles = async () => {
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

      const cacheKey = cacheKeys.news(selectedCategory, searchTerm);
      
      // Use background refresh for better UX
      const articles = await enhancedCache.backgroundRefresh(
        cacheKey,
        async () => {
          let query = supabase
            .from('immigration_news')
            .select('*')
            .eq('status', 'published')
            .not('source_url', 'is', null)
            .order('published_at', { ascending: false });

          if (selectedCategory !== 'all') {
            query = query.eq('category', selectedCategory);
          }

          // For free users, limit results
          if (!isProMember) {
            query = query.limit(10); // Limit articles for free users
          }

          const { data, error } = await query;
          if (error) throw error;
          
          return (data || []).filter(article => 
            article.source_url && 
            !article.source_url.includes('youtube.com') &&
            !article.source_url.includes('youtu.be')
          );
        },
        5 // Cache for 5 minutes
      );
      
      setArticles(articles);

      if (articles.length === 0) {
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
        enhancedCache.delete(cacheKeys.news(selectedCategory, searchTerm));
      }
      
      toast({
        title: "Fetching latest news...",
        description: "Getting verified immigration updates and breaking news from major outlets.",
      });

      // Fetch both regular immigration news and breaking news
      const [regularNewsResponse, breakingNewsResponse] = await Promise.all([
        supabase.functions.invoke('fetch-immigration-news', {
          body: { 
            category: selectedCategory,
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
        enhancedCache.delete(cacheKeys.news(selectedCategory, searchTerm));
        await fetchArticles();
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

  useEffect(() => {
    enhancedCache.delete(cacheKeys.news(selectedCategory, searchTerm));
    fetchArticles();
  }, [selectedCategory]);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const urgentArticles = filteredArticles.filter(article => article.is_urgent);
  const regularArticles = filteredArticles.filter(article => !article.is_urgent);
  const breakingNewsArticles = filteredArticles.filter(article => article.category === 'breaking-news');

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

  const ArticleCard = ({ article }: { article: NewsArticle }) => {
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
                  BREAKING
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
              {sourceDomain}
            </Badge>
            
            {article.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
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
          
          {isExpanded && (
            <div className="prose max-w-none mb-4">
              <p className="whitespace-pre-wrap">
                {getDisplayText(article.content, article.id, 'content')}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
            >
              {isExpanded 
                ? (currentLanguage === 'es' ? 'Mostrar Menos' : 'Show Less')
                : (currentLanguage === 'es' ? 'Leer Más' : 'Read More')
              }
            </Button>
            
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
                  {currentLanguage === 'es' ? 'Fuente' : 'Source'}
                </a>
              </Button>
            )}

            {user && (
              <>
                <BookmarkButton articleId={article.id} user={user} />
                <SocialShareButton 
                  title={article.title}
                  url={article.source_url || window.location.href}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleCategoryClick = (categorySlug: string) => {
    if (!isProMember && categorySlug !== 'all' && categorySlug !== 'breaking-news' && !FREE_TIER_CATEGORIES.includes(categorySlug)) {
      showUpgradePrompt('allCategories');
      setUpgradeModalOpen(true);
      return;
    }
    setSelectedCategory(categorySlug);
  };

  const isCategoryLocked = (categorySlug: string) => {
    if (isProMember) return false;
    if (categorySlug === 'all' || categorySlug === 'breaking-news') return false;
    return !FREE_TIER_CATEGORIES.includes(categorySlug);
  };

  if (loading) {
    return <NewsLoadingState />;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section with enhanced search */}
        <div className="bg-navy-800 text-cream-50 p-6 rounded-lg mb-6">
          {/* Header Content */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {currentLanguage === 'es' ? 'ACTUALIZACIONES DE INMIGRACIÓN VERIFICADAS' : 'VERIFIED IMMIGRATION UPDATES'}
              </h1>
              <p className="text-cream-200 text-sm uppercase tracking-wide">
                <Shield className="inline w-4 h-4 mr-1" />
                {currentLanguage === 'es' ? 'BUSCAR, GUARDAR Y COMPARTIR NOTICIAS + BREAKING NEWS' : 'SEARCH, SAVE & SHARE NEWS + BREAKING NEWS'}
              </p>
              {!isProMember && (
                <div className="mt-2">
                  <Badge className="bg-emerald-600 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Free Plan: 3 Categories
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="ml-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-navy-800"
                  >
                    Unlock All 13+ Categories
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle 
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
                isProMember={isProMember}
                user={user}
              />
              <Button 
                onClick={() => retry(() => refreshNews(true))} 
                disabled={refreshing || !canRetry}
                variant="outline"
                size="sm"
                className="bg-cream-50 text-navy-800 hover:bg-cream-100 border-cream-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing 
                  ? (currentLanguage === 'es' ? 'Obteniendo Últimas...' : 'Fetching Latest...') 
                  : (currentLanguage === 'es' ? 'Actualizar' : 'Refresh')
                }
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-600 w-5 h-5" />
              <Input
                placeholder={currentLanguage === 'es' 
                  ? "Buscar noticias, alertas y actualizaciones de inmigración..."
                  : "Search immigration news, alerts, and breaking news updates..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-cream-50 text-navy-800 border-cream-200 placeholder:text-navy-600/70"
              />
            </div>
          </div>

          {loading ? (
            <CategoriesSkeleton />
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryClick('all')}
                className={selectedCategory === 'all' 
                  ? 'bg-cream-50 text-navy-800 hover:bg-cream-100' 
                  : 'bg-transparent text-cream-50 border-cream-200 hover:bg-cream-50 hover:text-navy-800'
                }
              >
                {currentLanguage === 'es' ? 'Todas las Categorías' : 'All Categories'}
              </Button>
              <Button
                variant={selectedCategory === 'breaking-news' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryClick('breaking-news')}
                className={selectedCategory === 'breaking-news' 
                  ? 'bg-cream-50 text-navy-800 hover:bg-cream-100' 
                  : 'bg-transparent text-cream-50 border-cream-200 hover:bg-cream-50 hover:text-navy-800'
                }
              >
                {currentLanguage === 'es' ? 'Noticias de Última Hora' : 'Breaking News'}
              </Button>
              {categories.map((category) => {
                const isLocked = isCategoryLocked(category.slug);
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryClick(category.slug)}
                    disabled={isLocked}
                    className={`relative ${selectedCategory === category.slug 
                      ? 'bg-cream-50 text-navy-800 hover:bg-cream-100' 
                      : isLocked
                      ? 'bg-transparent text-cream-400 border-cream-400 opacity-60 cursor-not-allowed'
                      : 'bg-transparent text-cream-50 border-cream-200 hover:bg-cream-50 hover:text-navy-800'
                    }`}
                  >
                    {currentLanguage === 'es' ? translateCategory(category.name) : category.name}
                    {isLocked && (
                      <Crown className="w-3 h-3 ml-1 text-yellow-400" />
                    )}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Ad Banner - Header Position (only for free users) */}
        {!isProMember && <AdBanner position="header" className="mb-6" />}

        {searchTerm && (
          <div className="mb-4 text-sm text-muted-foreground">
            {currentLanguage === 'es' 
              ? `${filteredArticles.length} ${filteredArticles.length === 1 ? 'artículo encontrado' : 'artículos encontrados'} que coinciden con "${searchTerm}"`
              : `Found ${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''} matching "${searchTerm}"`
            }
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {/* Tabs List */}
                <TabsTrigger value="all">
                  {currentLanguage === 'es' ? `Todas (${filteredArticles.length})` : `All (${filteredArticles.length})`}
                </TabsTrigger>
                <TabsTrigger value="urgent" className="text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {currentLanguage === 'es' ? `Urgente (${urgentArticles.length})` : `Urgent (${urgentArticles.length})`}
                </TabsTrigger>
                <TabsTrigger value="breaking" className="text-orange-600">
                  {currentLanguage === 'es' ? `Breaking (${breakingNewsArticles.length})` : `Breaking (${breakingNewsArticles.length})`}
                </TabsTrigger>
                <TabsTrigger value="regular">
                  {currentLanguage === 'es' ? `Regular (${regularArticles.length})` : `Regular (${regularArticles.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {filteredArticles.length === 0 ? (
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
                            ? 'Haz clic en actualizar para obtener las últimas noticias de fuentes oficiales.'
                            : 'Click refresh to fetch the latest news from official sources.')
                      }
                      action={!searchTerm && (
                        <Button onClick={() => retry(() => refreshNews(true))} disabled={refreshing || !canRetry}>
                          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                          {currentLanguage === 'es' ? 'Obtener Últimas Noticias' : 'Fetch Latest News'}
                        </Button>
                      )}
                    />
                  ) : (
                    filteredArticles.map((article, index) => (
                      <div key={article.id}>
                        <ArticleCard article={article} />
                        {/* Insert ad every 3 articles for free users */}
                        {(index + 1) % 3 === 0 && (
                          <AdBanner position="between-articles" className="my-6" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="urgent" className="mt-6">
                <div className="space-y-4">
                  {urgentArticles.length === 0 ? (
                    <EmptyState
                      icon={AlertTriangle}
                      title={currentLanguage === 'es' ? 'No hay alertas urgentes en este momento' : 'No urgent alerts at this time'}
                    />
                  ) : (
                    urgentArticles.map((article, index) => (
                      <div key={article.id}>
                        <ArticleCard article={article} />
                        {(index + 1) % 3 === 0 && (
                          <AdBanner position="between-articles" className="my-6" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="breaking" className="mt-6">
                <div className="space-y-4">
                  {breakingNewsArticles.length === 0 ? (
                    <EmptyState
                      icon={Newspaper}
                      title={currentLanguage === 'es' ? 'No hay noticias de última hora en este momento' : 'No breaking news at this time'}
                    />
                  ) : (
                    breakingNewsArticles.map((article, index) => (
                      <div key={article.id}>
                        <ArticleCard article={article} />
                        {(index + 1) % 3 === 0 && (
                          <AdBanner position="between-articles" className="my-6" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="regular" className="mt-6">
                <div className="space-y-4">
                  {regularArticles.length === 0 ? (
                    <EmptyState
                      icon={Newspaper}
                      title={currentLanguage === 'es' ? 'No se encontraron artículos de noticias regulares' : 'No regular news articles found'}
                    />
                  ) : (
                    regularArticles.map((article, index) => (
                      <div key={article.id}>
                        <ArticleCard article={article} />
                        {(index + 1) % 3 === 0 && (
                          <AdBanner position="between-articles" className="my-6" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar with ads (only for free users) */}
          {!isProMember && (
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                <AdBanner position="sidebar" />
                {/* Upgrade prompt in sidebar */}
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4 text-center">
                    <Crown className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-emerald-800 mb-1">Upgrade to Pro</h3>
                    <p className="text-sm text-emerald-700 mb-3">Remove ads and unlock all features</p>
                    <Button 
                      onClick={() => setUpgradeModalOpen(true)}
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Footer Ad (only for free users) */}
        {!isProMember && <AdBanner position="footer" className="mt-8" />}
      </div>

      <UpgradeModal 
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
      />
    </ErrorBoundary>
  );
};

export default NewsFeed;
