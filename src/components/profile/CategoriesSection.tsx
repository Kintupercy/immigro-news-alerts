
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface CategoriesSectionProps {
  categories: Category[];
  selectedCategories: string[];
  saving: boolean;
  onToggleCategory: (slug: string) => void;
}

const CategoriesSection = ({ 
  categories, 
  selectedCategories, 
  saving, 
  onToggleCategory 
}: CategoriesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Immigration Categories</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select the immigration topics you're interested in receiving news about.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedCategories.includes(category.slug) 
                  ? 'border-navy-500 bg-navy-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => onToggleCategory(category.slug)}
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                disabled={saving}
              />
              <div className="flex-1">
                <Label className="cursor-pointer font-medium">
                  {category.name}
                </Label>
                {category.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedCategories.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Selected categories:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(slug => {
                const category = categories.find(c => c.slug === slug);
                return (
                  <Badge key={slug} variant="secondary">
                    {category?.name || slug}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriesSection;
