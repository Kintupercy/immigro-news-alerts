
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, ExternalLink, RefreshCw, AlertCircle, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enhancedCache, cacheKeys } from "@/utils/enhancedCache";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import ErrorBoundary from "./ErrorBoundary";
import { NewsCardSkeleton, EmptyState } from "./LoadingStates";
import LanguageToggle from "./LanguageToggle";
import { useProMembership } from "@/hooks/useProMembership";
import { translateText, translateCategory } from "@/utils/translation";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source_url: string;
  category: string;
  published_at: string;
  is_urgent: boolean;
  summary: string;
}

interface PersonalizedNewsFeedProps {
  user: User;
}

const PersonalizedNewsFeed = ({ user }: PersonalizedNewsFeedProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es'>('en');
  const [translatedContent, setTranslatedContent] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const { handleError, retry, canRetry } = useErrorHandler();
  const { isProMember } = useProMembership(user);

  const { 
    data: articles, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['personalized-news', user.id],
    queryFn: async () => {
      return await enhancedCache.getOrFetch(
        cacheKeys.personalizedNews(user.id, []),
        async () => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('preferred_categories')
            .eq('user_id', user.id)
            .single();

          const preferences = profile?.preferred_categories || [];
          
          let query = supabase
            .from('immigration_news')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(20);

          if (preferences.length > 0) {
            query = query.in('category', preferences);
          }

          const { data: news, error } = await query;
          if (error) throw error;
          return news as NewsArticle[];
        },
        5 // Cache for 5 minutes
      );
    },
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleLanguageChange = async (language: 'en' | 'es') => {
    setCurrentLanguage(language);
    
    if (language === 'es' && isProMember && articles) {
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear cache before refetching
      enhancedCache.delete(cacheKeys.personalizedNews(user.id, []));
      await refetch();
      toast({
        title: currentLanguage === 'es' ? "Noticias actualizadas" : "News updated",
        description: currentLanguage === 'es' 
          ? "Tu feed personalizado ha sido actualizado." 
          : "Your personalized feed has been refreshed.",
      });
    } catch (error) {
      handleError(error as Error, 'refreshing personalized news');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return currentLanguage === 'es' ? "Justo ahora" : "Just now";
    if (diffInHours < 24) return `${diffInHours}h ${currentLanguage === 'es' ? 'hace' : 'ago'}`;
    return date.toLocaleDateString();
  };

  const getDisplayText = (text: string, articleId?: string, field?: string) => {
    if (currentLanguage === 'es' && articleId && field && translatedContent[articleId]) {
      return translatedContent[articleId][field] || text;
    }
    return text;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Personalized News</h2>
          <Button variant="outline" disabled>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {currentLanguage === 'es' ? 'Tus Noticias Personalizadas' : 'Your Personalized News'}
            </h2>
            <div className="flex items-center gap-3">
              <LanguageToggle 
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
                isProMember={isProMember}
              />
              <Button 
                variant="outline" 
                onClick={() => retry(handleRefresh)}
                disabled={!canRetry}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {currentLanguage === 'es' ? 'Reintentar' : 'Retry'}
              </Button>
            </div>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {currentLanguage === 'es' 
                ? 'Error al cargar tus noticias personalizadas. Por favor verifica tu conexión e intenta de nuevo.'
                : 'Failed to load your personalized news. Please check your connection and try again.'
              }
            </AlertDescription>
          </Alert>
        </div>
      </ErrorBoundary>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">
            {currentLanguage === 'es' ? 'Tus Noticias Personalizadas' : 'Your Personalized News'}
          </h2>
          <div className="flex items-center gap-3">
            <LanguageToggle 
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              isProMember={isProMember}
            />
            <Button 
              variant="outline" 
              onClick={() => retry(handleRefresh)} 
              disabled={refreshing || !canRetry}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {currentLanguage === 'es' ? 'Actualizar' : 'Refresh'}
            </Button>
          </div>
        </div>
        <EmptyState
          icon={Newspaper}
          title={currentLanguage === 'es' ? 'Aún no hay noticias' : 'No news yet'}
          description={currentLanguage === 'es' 
            ? 'Estamos obteniendo las últimas noticias de inmigración basadas en tus preferencias. Vuelve pronto o ajusta tus intereses en tu perfil.'
            : 'We\'re fetching the latest immigration news based on your preferences. Check back soon or adjust your interests in your profile.'
          }
          action={
            <Button onClick={() => retry(handleRefresh)} disabled={refreshing || !canRetry}>
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {currentLanguage === 'es' ? 'Buscando noticias...' : 'Checking for news...'}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {currentLanguage === 'es' ? 'Buscar noticias' : 'Check for news'}
                </>
              )}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">
            {currentLanguage === 'es' ? 'Tus Noticias Personalizadas' : 'Your Personalized News'}
          </h2>
          <div className="flex items-center gap-3">
            <LanguageToggle 
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              isProMember={isProMember}
            />
            <Button 
              variant="outline" 
              onClick={() => retry(handleRefresh)} 
              disabled={refreshing || !canRetry}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {currentLanguage === 'es' ? 'Actualizar' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        variant={article.is_urgent ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {currentLanguage === 'es' 
                          ? translateCategory(article.category.toUpperCase())
                          : article.category.toUpperCase()
                        }
                      </Badge>
                      {article.is_urgent && (
                        <Badge variant="destructive" className="text-xs">
                          {currentLanguage === 'es' ? 'URGENTE' : 'URGENT'}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg sm:text-xl leading-tight break-words">
                      {getDisplayText(article.title, article.id, 'title')}
                    </CardTitle>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(article.published_at)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-4 leading-relaxed break-words">
                  {getDisplayText(
                    article.summary || article.content.substring(0, 200) + '...',
                    article.id,
                    'summary'
                  )}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-sm font-medium text-navy-600 break-all">
                    {currentLanguage === 'es' ? 'Artículo Fuente' : 'Source Article'}
                  </span>
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                    <a 
                      href={article.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {currentLanguage === 'es' ? 'Leer Más' : 'Read More'}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PersonalizedNewsFeed;
