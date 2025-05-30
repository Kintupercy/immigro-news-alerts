
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Edit, Trash2, ExternalLink, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NewsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['adminArticles', searchTerm, filterCategory, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('immigration_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const toggleUrgent = async (article: any) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('immigration_news')
        .update({ 
          is_urgent: !article.is_urgent,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_user_id: user.user?.id,
        action: !article.is_urgent ? 'mark_urgent' : 'unmark_urgent',
        target_type: 'article',
        target_id: article.id,
        details: { title: article.title }
      });

      // Send urgent alert if marking as urgent
      if (!article.is_urgent) {
        try {
          await supabase.functions.invoke('urgent-news-alert', {
            body: { newsId: article.id }
          });
        } catch (alertError) {
          console.error('Error sending urgent alert:', alertError);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      toast({
        title: "Article Updated",
        description: `Article ${!article.is_urgent ? 'marked as urgent' : 'unmarked as urgent'}${!article.is_urgent ? ' and alerts sent' : ''}`,
      });
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: "Error",
        description: "Failed to update article urgency",
        variant: "destructive"
      });
    }
  };

  const deleteArticle = async (article: any) => {
    if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('immigration_news')
        .delete()
        .eq('id', article.id);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_user_id: user.user?.id,
        action: 'delete_article',
        target_type: 'article',
        target_id: article.id,
        details: { title: article.title }
      });

      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      toast({
        title: "Article Deleted",
        description: `"${article.title}" has been permanently deleted`,
      });
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading articles...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>News Management</CardTitle>
        <CardDescription>
          Manage, edit, and moderate all immigration news articles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="breaking-news">Breaking News</SelectItem>
              <SelectItem value="policy-updates">Policy Updates</SelectItem>
              <SelectItem value="visa-immigration">Visa & Immigration</SelectItem>
              <SelectItem value="legal-changes">Legal Changes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {articles?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found matching your criteria.</p>
            </div>
          ) : (
            articles?.map((article) => (
              <div key={article.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 truncate">{article.title}</h3>
                      {article.is_urgent && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                      {article.manually_created && (
                        <Badge variant="secondary">Manual</Badge>
                      )}
                      {article.source_verified && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {article.summary || article.content.substring(0, 150) + '...'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(article.status)}
                        <span className="capitalize">{article.status}</span>
                      </div>
                      <span>Category: {article.category}</span>
                      <span>{new Date(article.published_at).toLocaleDateString()}</span>
                      {article.source_url && (
                        <a 
                          href={article.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={article.is_urgent ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => toggleUrgent(article)}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      {article.is_urgent ? 'Remove Urgent' : 'Mark Urgent'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteArticle(article)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsManagement;
