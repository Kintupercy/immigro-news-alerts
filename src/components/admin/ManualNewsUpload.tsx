
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ManualNewsUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    source_url: '',
    category: 'general',
    is_urgent: false,
    source_verified: false,
    tags: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the title and content fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { data: article, error } = await supabase
        .from('immigration_news')
        .insert({
          title: formData.title,
          content: formData.content,
          summary: formData.summary || null,
          source_url: formData.source_url || null,
          category: formData.category,
          is_urgent: formData.is_urgent,
          source_verified: formData.source_verified,
          manually_created: true,
          created_by_admin: user.user?.id,
          tags: tagsArray,
          status: 'published'
        })
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_user_id: user.user?.id,
        action: 'create_article',
        target_type: 'article',
        target_id: article.id,
        details: {
          title: formData.title,
          category: formData.category,
          is_urgent: formData.is_urgent,
          manually_created: true
        }
      });

      // Send urgent alert if marked as urgent
      if (formData.is_urgent) {
        try {
          await supabase.functions.invoke('urgent-news-alert', {
            body: { newsId: article.id }
          });
        } catch (alertError) {
          console.error('Error sending urgent alert:', alertError);
        }
      }

      toast({
        title: "Article Published!",
        description: `Successfully created "${formData.title}"${formData.is_urgent ? ' with urgent alert sent' : ''}`,
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        summary: '',
        source_url: '',
        category: 'general',
        is_urgent: false,
        source_verified: false,
        tags: ''
      });

    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: "Error",
        description: "Failed to create article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Manual News Upload
        </CardTitle>
        <CardDescription>
          Add immigration news articles manually with full control over content and settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Article Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter article title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="source_url">Source URL</Label>
                <Input
                  id="source_url"
                  type="url"
                  value={formData.source_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                  placeholder="https://example.com/article"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="breaking-news">Breaking News</SelectItem>
                    <SelectItem value="policy-updates">Policy Updates</SelectItem>
                    <SelectItem value="visa-immigration">Visa & Immigration</SelectItem>
                    <SelectItem value="legal-changes">Legal Changes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="immigration, visa, policy, etc."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary of the article (optional)"
                  rows={3}
                />
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-medium">Article Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Mark as Urgent
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Sends immediate email alerts to subscribers
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_urgent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_urgent: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Source Verified</Label>
                    <p className="text-sm text-muted-foreground">
                      Mark if source has been verified for authenticity
                    </p>
                  </div>
                  <Switch
                    checked={formData.source_verified}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, source_verified: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Article Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter the full article content"
              rows={8}
              required
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Publishing...' : 'Publish Article'}
            </Button>
            
            {formData.is_urgent && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Will send urgent alerts
              </Badge>
            )}
            
            {formData.source_verified && (
              <Badge variant="secondary">Source Verified</Badge>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualNewsUpload;
