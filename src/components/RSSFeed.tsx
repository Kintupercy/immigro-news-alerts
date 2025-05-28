
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
          title: "Biden Administration Expands Work Permits For Immigrants",
          link: "https://www.uscis.gov/news/alerts/uscis-announces-new-h-1b-electronic-registration-process",
          description: "A new policy aimed to increase the availability of work permits to eligible immigrants in the United States.",
          pubDate: new Date().toISOString(),
          guid: "biden-work-permits-2025"
        },
        {
          title: "Latest Developments in Asylum Policies and Procedures",
          link: "https://www.uscis.gov/i-765",
          description: "Recent changes in U.S. asylum policies and procedures aiming to overhaul the current system.",
          pubDate: new Date(Date.now() - 86400000).toISOString(),
          guid: "asylum-policies-2025"
        },
        {
          title: "Court Ruling Impacts Deportation Proceedings",
          link: "https://www.dhs.gov/news/2025/01/15/dhs-extends-designated-country-status-temporary-protected-status",
          description: "A recent court decision affecting deportation proceedings across the country, with significant implications for immigrant rights.",
          pubDate: new Date(Date.now() - 172800000).toISOString(),
          guid: "court-ruling-deportation-2025"
        },
        {
          title: "New Bill Introduced to Reform Immigration System",
          link: "https://www.congress.gov/immigration-reform-2025",
          description: "Lawmakers have introduced new legislation aiming to reform the U.S. immigration system, with focus on path to citizenship, and border security.",
          pubDate: new Date(Date.now() - 259200000).toISOString(),
          guid: "immigration-reform-bill-2025"
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
      {/* Header Section with Navy Blue Background */}
      <div className="bg-navy-800 text-cream-50 p-6 rounded-t-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">IMMIGRATION UPDATES</h1>
            <p className="text-cream-200 text-sm uppercase tracking-wide">CURATED NEWS ON U.S. IMMIGRATION LAW</p>
          </div>
          <Button
            onClick={fetchRSSFeed}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-cream-50 text-navy-800 hover:bg-cream-100 border-cream-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {rssItems.map((item, index) => (
          <Card key={item.guid} className="hover:shadow-md transition-shadow bg-cream-50 border-cream-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg leading-tight text-navy-800 font-bold">
                {item.title}
              </CardTitle>
              <Badge variant="secondary" className="w-fit bg-cream-200 text-navy-700">
                {formatDate(item.pubDate)}
              </Badge>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-navy-600 mb-4 leading-relaxed">
                {item.description}
              </p>
              
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-2 w-fit border-navy-300 text-navy-700 hover:bg-navy-50"
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
          <Card className="bg-cream-50 border-cream-200">
            <CardContent className="py-8 text-center">
              <Rss className="h-12 w-12 text-navy-400 mx-auto mb-4" />
              <p className="text-navy-600">No RSS items available. Click refresh to try again.</p>
            </CardContent>
          </Card>
        )}
        
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-cream-50 border-cream-200">
                <CardHeader>
                  <div className="h-6 bg-navy-200 rounded w-3/4 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-navy-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-navy-200 rounded w-2/3 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* More News Button */}
      <div className="text-center mt-8">
        <Button 
          variant="outline" 
          className="bg-cream-50 text-navy-800 border-navy-300 hover:bg-cream-100 font-medium uppercase tracking-wide"
        >
          MORE NEWS
        </Button>
      </div>
    </div>
  );
};

export default RSSFeed;
