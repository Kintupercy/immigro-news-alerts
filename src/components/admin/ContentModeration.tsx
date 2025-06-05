
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ContentModeration = () => {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['moderationArticles', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('immigration_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('moderation_status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateModerationStatus = async (articleId: string, status: string, notes?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('immigration_news')
        .update({ 
          moderation_status: status,
          moderation_notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId);

      if (error) throw error;

      // Skip admin logging for public site

      queryClient.invalidateQueries({ queryKey: ['moderationArticles'] });
      setSelectedArticle(null);
      setModerationNotes('');
      
      toast({
        title: "Moderation Updated",
        description: `Article ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'marked for review'}`,
      });
    } catch (error) {
      console.error('Error updating moderation status:', error);
      toast({
        title: "Error",
        description: "Failed to update moderation status",
        variant: "destructive"
      });
    }
  };

  const getModerationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading articles for moderation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Content Moderation
          </CardTitle>
          <CardDescription>
            Review and moderate immigration news articles for quality and accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Articles</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {articles?.map((article) => (
              <div key={article.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{article.title}</h3>
                      {getModerationBadge(article.moderation_status)}
                      {article.is_urgent && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                      {article.manually_created && (
                        <Badge variant="secondary">Manual</Badge>
                      )}
                      {article.source_verified && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Verified Source
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {article.summary || article.content.substring(0, 200) + '...'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                          View Source
                        </a>
                      )}
                    </div>

                    {article.moderation_notes && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                        <strong>Moderation Notes:</strong> {article.moderation_notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedArticle(article);
                        setModerationNotes(article.moderation_notes || '');
                      }}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Moderation Modal */}
      {selectedArticle && (
        <Card>
          <CardHeader>
            <CardTitle>Moderate Article</CardTitle>
            <CardDescription>Review and set moderation status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{selectedArticle.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedArticle.content.substring(0, 500)}...
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Moderation Notes</label>
              <Textarea
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                placeholder="Add notes about your moderation decision..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => updateModerationStatus(selectedArticle.id, 'approved', moderationNotes)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>

              <Button
                onClick={() => updateModerationStatus(selectedArticle.id, 'rejected', moderationNotes)}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>

              <Button
                onClick={() => updateModerationStatus(selectedArticle.id, 'pending', moderationNotes)}
                variant="outline"
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark Pending
              </Button>

              <Button
                onClick={() => {
                  setSelectedArticle(null);
                  setModerationNotes('');
                }}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentModeration;
