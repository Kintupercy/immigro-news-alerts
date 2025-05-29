
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, Search, ExternalLink, RefreshCw, Shield, Youtube } from "lucide-react";
import { format } from "date-fns";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('immigration_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
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
      
      // Additional client-side filtering to ensure no YouTube content
      const filteredData = (data || []).filter(article => 
        article.source_url && 
        !article.source_url.includes('youtube.com') &&
        !article.source_url.includes('youtu.be')
      );
      
      setArticles(filteredData);

      // If no articles found, automatically fetch new ones
      if (filteredData.length === 0) {
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

  const isYouTubeUrl = (url: string | null) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const ArticleCard = ({ article }: { article: NewsArticle }) => {
    const isExpanded = expandedArticle === article.id;
    const sourceDomain = getSourceDomain(article.source_url);
    const isOfficial = isOfficialSource(article.source_url);
    const isYouTube = isYouTubeUrl(article.source_url);
    
    return (
      <Card className={`mb-4 ${article.is_urgent ? 'border-red-200 bg-red-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg leading-tight flex-1">
              {article.is_urgent && (
                <AlertTriangle className="inline-block w-5 h-5 text-red-500 mr-2" />
              )}
              {article.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
              <Clock className="w-4 h-4" />
              {format(new Date(article.published_at), 'MMM dd, yyyy')}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={article.is_urgent ? "destructive" : "secondary"}>
              {categories.find(cat => cat.slug === article.category)?.name || article.category}
            </Badge>
            
            <Badge 
              variant={isOfficial ? "default" : "outline"} 
              className={`text-xs ${isOfficial ? 'bg-green-100 text-green-800' : isYouTube ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
            >
              {isOfficial && <Shield className="w-3 h-3 mr-1" />}
              {isYouTube && <Youtube className="w-3 h-3 mr-1" />}
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
              {article.summary}
            </p>
          )}
          
          {isExpanded && (
            <div className="prose max-w-none mb-4">
              <p className="whitespace-pre-wrap">{article.content}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </Button>
            
            {article.source_url && (
              <Button
                variant="default"
                size="sm"
                asChild
                className={isYouTube ? "bg-red-600 hover:bg-red-700" : "bg-navy-800 hover:bg-navy-700"}
              >
                <a 
                  href={article.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  {isYouTube ? <Youtube className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  Source
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-navy-800 text-cream-50 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">VERIFIED IMMIGRATION UPDATES</h1>
            <p className="text-cream-200 text-sm uppercase tracking-wide">
              <Shield className="inline w-4 h-4 mr-1" />
              SOURCED FROM OFFICIAL GOVERNMENT & TRUSTED NEWS OUTLETS
            </p>
          </div>
          <Button 
            onClick={() => refreshNews(true)} 
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="bg-cream-50 text-navy-800 hover:bg-cream-100 border-cream-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Fetching Latest...' : 'Refresh'}
          </Button>
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
            All Categories
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
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search verified news and alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* News Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All News ({filteredArticles.length})
          </TabsTrigger>
          <TabsTrigger value="urgent" className="text-red-600">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Urgent ({urgentArticles.length})
          </TabsTrigger>
          <TabsTrigger value="regular">
            Regular ({regularArticles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-navy-400" />
                  <p className="text-muted-foreground mb-4">
                    {refreshing ? 'Fetching latest verified immigration news...' : 'No verified articles found. Click refresh to fetch the latest news from official sources.'}
                  </p>
                  <Button onClick={() => refreshNews(true)} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Fetch Latest Verified News
                  </Button>
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
                  <p className="text-muted-foreground">No urgent alerts at this time.</p>
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
                  <p className="text-muted-foreground">No regular news articles found.</p>
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
