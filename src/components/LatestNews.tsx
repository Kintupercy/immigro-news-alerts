
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AutoScroll from 'embla-carousel-auto-scroll';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  source_url?: string;
  is_urgent: boolean;
  published_at: string;
  tags: string[];
}

const LatestNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Track carousel state for dot indicators
  useEffect(() => {
    if (!api) return;
    
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  useEffect(() => {
    fetchLatestNews();
  }, []);

  const fetchLatestNews = async () => {
    try {
      const { data: newsData, error } = await supabase
        .from('immigration_news')
        .select('id, title, summary, category, source_url, is_urgent, published_at, tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching news:', error);
        return;
      }

      setNews(newsData || []);
    } catch (error) {
      console.error('Error fetching latest news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatCategoryName = (slug: string) => {
    const categoryMap: { [key: string]: string } = {
      'green-card': 'Green Card',
      'citizenship': 'Citizenship',
      'international-students': 'Student Visas',
      'family-based': 'Family Based',
      'employment-based': 'Work Visas',
      'refugees-asylees': 'Humanitarian',
      'temporary-visitors': 'Temporary Visitors',
      'exchange-visitors': 'Exchange Visitors',
      'investors': 'Investment',
      'religious-workers': 'Religious Workers',
      'specialty-occupations': 'Specialty Occupations',
      'undocumented': 'Undocumented'
    };
    
    return categoryMap[slug] || slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              Latest Immigration News
            </h2>
            <p className="text-xl text-gray-600">
              Stay updated with today's most important immigration developments
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              Latest Immigration News
            </h2>
            <p className="text-xl text-gray-600">
              Stay updated with today's most important immigration developments
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">No news articles available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
            Latest Immigration News
          </h2>
          <p className="text-xl text-gray-600">
            Stay updated with today's most important immigration developments
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            AutoScroll({
              speed: 0.6,
              startDelay: 1000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
              stopOnFocusIn: true,
            }),
          ]}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {news.map((item) => (
              <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={item.is_urgent ? "destructive" : "secondary"}>
                        {formatCategoryName(item.category)}
                      </Badge>
                      {item.is_urgent && (
                        <Badge variant="destructive" className="text-xs">
                          URGENT
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-playfair text-lg leading-tight line-clamp-2">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(item.published_at)}
                      </div>
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-emerald-600 hover:text-emerald-700"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Source
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(item.tags || []).slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
          
          {/* Mobile dot indicators */}
          {count > 1 && (
            <div className="flex justify-center gap-2 mt-6 md:hidden">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    index === current 
                      ? 'bg-navy-800 w-6' 
                      : 'bg-navy-300 hover:bg-navy-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </Carousel>
      </div>
    </section>
  );
};

export default LatestNews;
