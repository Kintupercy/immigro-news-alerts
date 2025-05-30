
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Newspaper, Clock } from 'lucide-react';

export const NewsCardSkeleton = () => (
  <Card className="mb-4">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const NewsGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }, (_, i) => (
      <NewsCardSkeleton key={i} />
    ))}
  </div>
);

export const CategoriesSkeleton = () => (
  <div className="flex flex-wrap gap-2 mb-4">
    {Array.from({ length: 8 }, (_, i) => (
      <Skeleton key={i} className="h-9 w-24 rounded-md" />
    ))}
  </div>
);

export const SearchSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full" />
    <CategoriesSkeleton />
  </div>
);

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <Loader2 className={`animate-spin text-navy-600 ${sizeClasses[size]}`} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

export const NewsLoadingState = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="bg-navy-800 text-cream-50 p-6 rounded-lg mb-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4 bg-cream-200/20" />
        <Skeleton className="h-4 w-1/2 bg-cream-200/20" />
        <SearchSkeleton />
      </div>
    </div>
    <NewsGridSkeleton />
  </div>
);

export const EmptyState = ({ 
  icon: Icon = Newspaper,
  title = "No content found",
  description = "Try adjusting your filters or check back later.",
  action
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <Card className="text-center py-12">
    <CardContent>
      <Icon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {action}
    </CardContent>
  </Card>
);
