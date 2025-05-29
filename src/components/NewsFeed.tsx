import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, Search, ExternalLink, RefreshCw, Shield } from "lucide-react";
import { format } from "date-fns";
import { cache } from "@/utils/cache";
import { rateLimiter, RATE_LIMITS } from "@/utils/rateLimiter";
import LoadingSpinner from "./LoadingSpinner";
import BookmarkButton from "./BookmarkButton";
import SocialShareButton from "./SocialShareButton";
import LanguageToggle from "./LanguageToggle";
import { useProMembership } from "@/hooks/useProMembership";
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
  const { isProMember } = useProMembership(user);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    fetchCategories();
    fetchArticles();
  }, []);

  const handleLanguageChange = async (language: 'en' | 'es') => {
    if (language === 'es' && !isProMember) {
      return;
    }
    
    setCurrentLanguage(language);
    
    if (language === 'es' && articles.length > 0) {
      // Translate articles
      const translated: Record<string, any> = {};
      for (const article of articles) {
        translated[article.id] = {
          title: await translateText(article.title, 'es'),
          summary: article.summary ? await translateText(article.summary, 'es') : null,
          content: await translateText(article.content, 'es'),
        };
      }
      setTranslatedContent(translated);
    }
  };

  const fetchCategories = async () => {
    try {
      const cacheKey = 'immigration_categories';
      const categories = await cache.getOrFetch(
        cacheKey,
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
      console.error('Error fetching categories:', error);
      toast({
        title: "Error loading categories",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // Check rate limit
      if (!rateLimiter.isAllowed('news-fetch', RATE_LIMITS.NEWS_FETCH)) {
        toast({
          title: "Rate limit exceeded",
          description: "Please wait before fetching more news.",
          variant: "destructive",
        });
        return;
      }

      const cacheKey = `news_${selectedCategory}`;
      const articles = await cache.getOrFetch(
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

          const { data, error } = await query;

          if (error) throw error;
          
          // Filter out any problematic content
          const filteredData = (data || []).filter(article => 
            article.source_url && 
            !article.source_url.includes('youtube.com') &&
            !article.source_url.includes('youtu.be')
          );
          
          return filteredData;
        },
        5 // Cache for 5 minutes
      );
      
      setArticles(articles);

      // If no articles found and not cached, fetch fresh news
      if (articles.length === 0) {
        console.log('No articles found, fetching fresh news...');
        await refreshNews(false);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error loading news",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async (forceRefresh: boolean = true) => {
    try {
      setRefreshing(true);
      
      // Check rate limit for refresh
      if (!rateLimiter.isAllowed('news-refresh', RATE_LIMITS.API_CALLS)) {
        toast({
          title: "Too many refresh attempts",
          description: "Please wait before refreshing again.",
          variant: "destructive",
        });
        return;
      }

      // Clear cache to force fresh data
      if (forceRefresh) {
        cache.delete(`news_${selectedCategory}`);
      }
      
      toast({
        title: "Fetching latest news...",
        description: "Getting verified immigration updates from official sources.",
      });

      const { data, error } = await supabase.functions.invoke('fetch-immigration-news', {
        body: { 
          category: selectedCategory,
          forceRefresh: forceRefresh
        }
      });

      if (error) throw error;

      if (data.articlesAdded > 0) {
        toast({
          title: "News updated!",
          description: `Successfully fetched ${data.articlesAdded} new verified articles.`,
        });
        // Clear cache and refetch
        cache.delete(`news_${selectedCategory}`);
        await fetchArticles();
      } else {
        toast({
          title: "No new articles",
          description: data.message || "All articles are up to date.",
        });
      }
    } catch (error) {
      console.error('Error refreshing news:', error);
      toast({
        title: "Error refreshing news",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Clear cache and fetch when category changes
    cache.delete(`news_${selectedCategory}`);
    fetchArticles();
  }, [selectedCategory]);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const urgentArticles = filteredArticles.filter(article => article.is_urgent);
  const regularArticles = filteredArticles.filter(article => !article.is_urgent);

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
    
    return (
      <Card className={`mb-4 ${article.is_urgent ? 'border-red-200 bg-red-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg leading-tight flex-1">
              {article.is_urgent && (
                <AlertTriangle className="inline-block w-5 h-5 text-red-500 mr-2" />
              )}
              {getDisplayText(article.title, article.id, 'title')}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
              <Clock className="w-4 h-4" />
              {format(new Date(article.published_at), 'MMM dd, yyyy')}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={article.is_urgent ? "destructive" : "secondary"}>
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="Loading verified news..." className="py-12" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Section with enhanced search */}
      <div className="bg-navy-800 text-cream-50 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {currentLanguage === 'es' ? 'ACTUALIZACIONES DE INMIGRACIÓN VERIFICADAS' : 'VERIFIED IMMIGRATION UPDATES'}
            </h1>
            <p className="text-cream-200 text-sm uppercase tracking-wide">
              <Shield className="inline w-4 h-4 mr-1" />
              {currentLanguage === 'es' ? 'BUSCAR, GUARDAR Y COMPARTIR NOTICIAS' : 'SEARCH, SAVE & SHARE NEWS'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle 
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              isProMember={isProMember}
            />
            <Button 
              onClick={() => refreshNews(true)} 
              disabled={refreshing}
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

        {/* Enhanced Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-600 w-5 h-5" />
            <Input
              placeholder={currentLanguage === 'es' 
                ? "Buscar noticias, alertas y actualizaciones de inmigración..."
                : "Search immigration news, alerts, and updates..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-cream-50 text-navy-800 border-cream-200 placeholder:text-navy-600/70"
            />
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' 
              ? 'bg-cream-50 text-navy-800 hover:bg-cream-100' 
              : 'bg-transparent text-cream-50 border-cream-200 hover:bg-cream-50 hover:text-navy-800'
            }
          >
            {currentLanguage === 'es' ? 'Todas las Categorías' : 'All Categories'}
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.slug)}
              className={selectedCategory === category.slug 
                ? 'bg-cream-50 text-navy-800 hover:bg-cream-100' 
                : 'bg-transparent text-cream-50 border-cream-200 hover:bg-cream-50 hover:text-navy-800'
              }
            >
              {currentLanguage === 'es' ? translateCategory(category.name) : category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {searchTerm && (
        <div className="mb-4 text-sm text-muted-foreground">
          {currentLanguage === 'es' 
            ? `${filteredArticles.length} ${filteredArticles.length === 1 ? 'artículo encontrado' : 'artículos encontrados'} que coinciden con "${searchTerm}"`
            : `Found ${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''} matching "${searchTerm}"`
          }
        </div>
      )}

      {/* News Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            {currentLanguage === 'es' ? `Todas las Noticias (${filteredArticles.length})` : `All News (${filteredArticles.length})`}
          </TabsTrigger>
          <TabsTrigger value="urgent" className="text-red-600">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {currentLanguage === 'es' ? `Urgente (${urgentArticles.length})` : `Urgent (${urgentArticles.length})`}
          </TabsTrigger>
          <TabsTrigger value="regular">
            {currentLanguage === 'es' ? `Regular (${regularArticles.length})` : `Regular (${regularArticles.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-navy-400" />
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? (currentLanguage === 'es' 
                          ? `No se encontraron artículos que coincidan con "${searchTerm}". Prueba con diferentes palabras clave.`
                          : `No articles found matching "${searchTerm}". Try different keywords.`
                        )
                      : refreshing 
                        ? (currentLanguage === 'es' ? 'Obteniendo últimas noticias de inmigración verificadas...' : 'Fetching latest verified immigration news...') 
                        : (currentLanguage === 'es' 
                            ? 'No se encontraron artículos verificados. Haz clic en actualizar para obtener las últimas noticias de fuentes oficiales.'
                            : 'No verified articles found. Click refresh to fetch the latest news from official sources.'
                          )
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => refreshNews(true)} disabled={refreshing}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      {currentLanguage === 'es' ? 'Obtener Últimas Noticias Verificadas' : 'Fetch Latest Verified News'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="urgent" className="mt-6">
          <div className="space-y-4">
            {urgentArticles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? (currentLanguage === 'es' 
                          ? `No se encontraron alertas urgentes que coincidan con "${searchTerm}".`
                          : `No urgent alerts found matching "${searchTerm}".`
                        )
                      : (currentLanguage === 'es' ? 'No hay alertas urgentes en este momento.' : 'No urgent alerts at this time.')
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              urgentArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="regular" className="mt-6">
          <div className="space-y-4">
            {regularArticles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? (currentLanguage === 'es' 
                          ? `No se encontraron noticias regulares que coincidan con "${searchTerm}".`
                          : `No regular news found matching "${searchTerm}".`
                        )
                      : (currentLanguage === 'es' ? 'No se encontraron artículos de noticias regulares.' : 'No regular news articles found.')
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsFeed;
