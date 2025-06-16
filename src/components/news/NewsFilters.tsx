
import { Search, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { translateCategory } from "@/utils/translation";

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
}

interface NewsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  handleCategoryClick: (category: string) => void;
  categories: Category[];
  currentLanguage: 'en' | 'es';
  getCategoriesToDisplay: () => Category[];
  isCategoryLocked: (categorySlug: string) => boolean;
}

const NewsFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  handleCategoryClick,
  categories,
  currentLanguage,
  getCategoriesToDisplay,
  isCategoryLocked
}: NewsFiltersProps) => {
  return (
    <div className="bg-navy-800 text-cream-50 p-4 lg:p-6 rounded-lg mb-6">
      {/* Search Bar */}
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

      {/* Mobile-Friendly Category Selector */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Dropdown */}
          <div className="flex-1">
            <Select
              value={selectedCategory}
              onValueChange={(value) => handleCategoryClick(value)}
            >
              <SelectTrigger className="bg-cream-50 text-navy-800 border-cream-200">
                <SelectValue placeholder={currentLanguage === 'es' ? 'Seleccionar categoría' : 'Select category'} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-[300px] overflow-y-auto z-50">
                <SelectItem value="all">
                  {currentLanguage === 'es' ? 'Todas las Categorías' : 'All Categories'}
                </SelectItem>
                <SelectItem value="breaking-news">
                  {currentLanguage === 'es' ? 'Noticias de Última Hora' : 'Breaking News'}
                </SelectItem>
                
                {/* Show user's selected categories or default free categories */}
                {getCategoriesToDisplay().map((category) => {
                  const isLocked = isCategoryLocked(category.slug);
                  return (
                    <SelectItem 
                      key={category.id} 
                      value={category.slug}
                      disabled={isLocked}
                      className={isLocked ? 'opacity-60' : ''}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {currentLanguage === 'es' ? translateCategory(category.name) : category.name}
                        </span>
                        {isLocked && (
                          <Crown className="w-3 h-3 ml-2 text-yellow-600" />
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filter Buttons - Only show on larger screens */}
          <div className="hidden sm:flex gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick('all')}
              className={selectedCategory === 'all' 
                ? 'bg-cream-50 text-navy-800 hover:bg-cream-100' 
                : 'bg-transparent text-cream-50 border-cream-200 hover:bg-cream-50 hover:text-navy-800'
              }
            >
              {currentLanguage === 'es' ? 'Todas' : 'All'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsFilters;
