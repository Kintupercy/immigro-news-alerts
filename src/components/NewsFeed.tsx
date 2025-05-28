import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, Search, ExternalLink, RefreshCw } from "lucide-react";
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
        .order('published_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
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

  const refreshNews = async () => {
    try {
      setRefreshing(true);
      
      const { data, error } = await supabase.functions.invoke('fetch-immigration-news', {
        body: { category: selectedCategory }
      });

      if (error) throw error;

      toast({
        title: "News updated!",
        description: `Added ${data.articlesAdded} new articles.`,
      });

      // Refresh the articles list
      await fetchArticles();
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

  const ArticleCard = ({ article }: { article: NewsArticle }) => {
    const isExpanded = expandedArticle === article.id;
    
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
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </Button>
            
            {article.source_url && (
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <a 
                  href={article.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Immigration News & Alerts</h1>
          <Button 
            onClick={refreshNews} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh News'}
          </Button>
        </div>
        <p className="text-muted-foreground">
          Stay updated with the latest US immigration law changes and policy updates
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search news and alerts..."
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
                  <p className="text-muted-foreground mb-4">No articles found matching your criteria.</p>
                  <Button onClick={refreshNews} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Fetch Latest News
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
