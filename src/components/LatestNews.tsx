
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
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

  useEffect(() => {
    // Mock news data for now - in a real app this would fetch from your Supabase function
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'USCIS Announces New Processing Times for Green Card Applications',
        summary: 'The U.S. Citizenship and Immigration Services has updated processing times for family-based and employment-based green card applications, with some categories seeing significant improvements.',
        category: 'Green Card',
        source_url: 'https://uscis.gov',
        is_urgent: false,
        published_at: new Date().toISOString(),
        tags: ['green-card', 'processing-times']
      },
      {
        id: '2',
        title: 'H-1B Cap Registration Period Opens April 2024',
        summary: 'The registration period for H-1B cap-subject petitions for fiscal year 2025 opens today. Employers must register during the designated period.',
        category: 'Work Visas',
        source_url: 'https://uscis.gov',
        is_urgent: true,
        published_at: new Date().toISOString(),
        tags: ['h1b', 'work-visa']
      },
      {
        id: '3',
        title: 'New Student Visa Policies for International Students',
        summary: 'Recent policy updates affect F-1 student visa holders, including changes to work authorization and academic requirements.',
        category: 'Student Visas',
        source_url: 'https://ice.gov',
        is_urgent: false,
        published_at: new Date().toISOString(),
        tags: ['f1-visa', 'students']
      },
      {
        id: '4',
        title: 'Citizenship Application Fee Updates Take Effect',
        summary: 'USCIS has implemented new fee structures for naturalization applications, with some applicants eligible for reduced fees.',
        category: 'Citizenship',
        source_url: 'https://uscis.gov',
        is_urgent: false,
        published_at: new Date().toISOString(),
        tags: ['citizenship', 'fees']
      },
      {
        id: '5',
        title: 'TPS Designation Extended for Several Countries',
        summary: 'The Department of Homeland Security has extended Temporary Protected Status for nationals of several countries facing ongoing armed conflict.',
        category: 'Humanitarian',
        source_url: 'https://dhs.gov',
        is_urgent: true,
        published_at: new Date().toISOString(),
        tags: ['tps', 'humanitarian']
      },
      {
        id: '6',
        title: 'New EB-5 Investment Program Regulations',
        summary: 'Updated regulations for the EB-5 Immigrant Investor Program include new integrity measures and regional center oversight requirements.',
        category: 'Investment',
        source_url: 'https://uscis.gov',
        is_urgent: false,
        published_at: new Date().toISOString(),
        tags: ['eb5', 'investment']
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {news.map((item) => (
              <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={item.is_urgent ? "destructive" : "secondary"}>
                        {item.category}
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
                      {item.tags.slice(0, 2).map((tag) => (
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
        </Carousel>
      </div>
    </section>
  );
};

export default LatestNews;
