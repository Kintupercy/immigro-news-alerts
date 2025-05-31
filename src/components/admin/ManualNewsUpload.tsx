import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, AlertTriangle } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { articleSchema, sanitizeInput, logSecurityEvent } from "@/utils/securityValidation";

type FormData = z.infer<typeof articleSchema>;

const ManualNewsUpload = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories, loading: categoriesLoading } = useCategories();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      is_urgent: false
    }
  });

  const watchedValues = watch();

  const addTag = () => {
    const sanitizedTag = sanitizeInput(tagInput.trim());
    if (sanitizedTag && !tags.includes(sanitizedTag) && tags.length < 20) {
      setTags([...tags, sanitizedTag]);
      setTagInput("");
      setValue("tags", [...tags, sanitizedTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Get current user for admin validation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Additional validation and sanitization
      const sanitizedData = {
        title: sanitizeInput(data.title),
        content: sanitizeInput(data.content),
        summary: data.summary ? sanitizeInput(data.summary) : null,
        category: sanitizeInput(data.category),
        source_url: data.source_url || null,
        tags: tags.map(tag => sanitizeInput(tag)),
        is_urgent: data.is_urgent || false,
        manually_created: true,
        created_by_admin: user.id,
        status: 'published'
      };

      const { error } = await supabase
        .from('immigration_news')
        .insert(sanitizedData);

      if (error) throw error;

      // Log the security event
      await logSecurityEvent('MANUAL_ARTICLE_CREATED', {
        articleTitle: sanitizedData.title,
        category: sanitizedData.category,
        isUrgent: sanitizedData.is_urgent,
        adminUserId: user.id
      }, 'article');

      toast({
        title: "Article uploaded successfully",
        description: "The news article has been published.",
      });

      // Reset form
      reset();
      setTags([]);

    } catch (error) {
      console.error('Error uploading article:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload article",
        variant: "destructive",
      });

      // Log the security event for failed upload
      await logSecurityEvent('MANUAL_ARTICLE_UPLOAD_FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error',
        attemptedData: {
          title: data.title,
          category: data.category
        }
      }, 'article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Manual News Upload
        </CardTitle>
        <CardDescription>
          Create and publish immigration news articles manually with enhanced security validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Article Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter article title..."
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              {...register("summary")}
              placeholder="Brief summary of the article..."
              className={`min-h-[80px] ${errors.summary ? "border-red-500" : ""}`}
            />
            {errors.summary && (
              <p className="text-sm text-red-500">{errors.summary.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Full article content..."
              className={`min-h-[200px] ${errors.content ? "border-red-500" : ""}`}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {!categoriesLoading && categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_url">Source URL</Label>
              <Input
                id="source_url"
                {...register("source_url")}
                placeholder="https://example.com/article"
                type="url"
                className={errors.source_url ? "border-red-500" : ""}
              />
              {errors.source_url && (
                <p className="text-sm text-red-500">{errors.source_url.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_urgent"
              checked={watchedValues.is_urgent}
              onCheckedChange={(checked) => setValue("is_urgent", checked)}
            />
            <Label htmlFor="is_urgent" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Mark as Urgent
            </Label>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Publishing..." : "Publish Article"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualNewsUpload;
