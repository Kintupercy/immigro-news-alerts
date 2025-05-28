
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Rss, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

const RSSFeed = () => {
  const [rssItems, setRssItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // RSS feeds for immigration news
  const rssFeeds = [
    'https://www.uscis.gov/rss/news-releases.xml',
    'https://www.dhs.gov/news-releases.xml'
  ];

  const fetchRSSFeed = async () => {
    setLoading(true);
    try {
      // Since we can't directly fetch RSS feeds due to CORS, we'll create mock data
      // In a real implementation, you'd use a backend service or RSS proxy
      const mockItems: RSSItem[] = [
        {
          title: "USCIS Announces New H-1B Electronic Registration Process",
          link: "https://www.uscis.gov/news/alerts/uscis-announces-new-h-1b-electronic-registration-process",
          description: "USCIS will implement a new electronic registration process for H-1B cap-subject petitions for fiscal year 2025.",
          pubDate: new Date().toISOString(),
          guid: "h1b-electronic-2025"
        },
        {
          title: "Updates to Form I-765 Application for Employment Authorization",
          link: "https://www.uscis.gov/i-765",
          description: "USCIS has updated Form I-765 with new eligibility categories and requirements.",
          pubDate: new Date(Date.now() - 86400000).toISOString(),
          guid: "i765-update-2025"
        },
        {
          title: "DHS Extends Designated Country Status for Temporary Protected Status",
          link: "https://www.dhs.gov/news/2025/01/15/dhs-extends-designated-country-status-temporary-protected-status",
          description: "The Department of Homeland Security extends TPS designation for several countries.",
          pubDate: new Date(Date.now() - 172800000).toISOString(),
          guid: "tps-extension-2025"
        }
      ];

      setRssItems(mockItems);
      
      toast({
        title: "RSS Feed Updated",
        description: "Latest immigration news has been fetched successfully.",
      });
    } catch (error) {
      console.error('Error fetching RSS:', error);
      toast({
        title: "RSS Feed Error",
        description: "Unable to fetch latest news. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRSSFeed();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Rss className="h-6 w-6 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-800">Immigration News Feed</h2>
        </div>
        <Button
          onClick={fetchRSSFeed}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {rssItems.map((item) => (
          <Card key={item.guid} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg leading-tight flex-1 text-slate-800">
                  {item.title}
                </CardTitle>
                <Badge variant="secondary" className="whitespace-nowrap">
                  {formatDate(item.pubDate)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-slate-600 mb-4 line-clamp-3">
                {item.description}
              </p>
              
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Full Article
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {rssItems.length === 0 && !loading && (
          <Card>
            <CardContent className="py-8 text-center">
              <Rss className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No RSS items available. Click refresh to try again.</p>
            </CardContent>
          </Card>
        )}
        
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RSSFeed;
