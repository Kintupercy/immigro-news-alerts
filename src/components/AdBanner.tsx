
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";
import { useProMembership } from "@/hooks/useProMembership";
import { supabase } from "@/integrations/supabase/client";

interface AdConfig {
  id: string;
  type: 'banner' | 'text' | 'native' | 'google-adsense';
  title?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  targetUrl?: string;
  adScript?: string; // For Google AdSense or other ad networks
  position: 'header' | 'sidebar' | 'between-articles' | 'footer';
  isActive: boolean;
}

interface AdBannerProps {
  position: 'header' | 'sidebar' | 'between-articles' | 'footer';
  className?: string;
}

const AdBanner = ({ position, className = "" }: AdBannerProps) => {
  const [user, setUser] = useState<any>(null);
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { isProMember, loading: proLoading } = useProMembership(user);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    // Mock ad configurations - in production, these would come from your database
    const adConfigs: AdConfig[] = [
      {
        id: 'upgrade-pro',
        type: 'native',
        title: 'Upgrade to Pro',
        description: 'Get real-time alerts, SMS notifications, and Spanish translation',
        ctaText: 'Upgrade Now',
        targetUrl: '/auth',
        position: 'between-articles',
        isActive: true
      },
      {
        id: 'immigration-lawyer',
        type: 'banner',
        title: 'Need Legal Help?',
        description: 'Connect with experienced immigration lawyers',
        imageUrl: '/placeholder.svg',
        ctaText: 'Find a Lawyer',
        targetUrl: 'https://example-law-firm.com',
        position: 'sidebar',
        isActive: true
      },
      {
        id: 'visa-services',
        type: 'text',
        title: 'Visa Application Services',
        description: 'Professional assistance with your visa application process',
        ctaText: 'Learn More',
        targetUrl: 'https://example-visa-service.com',
        position: 'footer',
        isActive: true
      }
    ];

    // Find ad config for this position
    const config = adConfigs.find(ad => ad.position === position && ad.isActive);
    setAdConfig(config || null);
  }, [position]);

  // Don't show ads to Pro members or while loading
  if (proLoading || isProMember || !adConfig || !isVisible) {
    return null;
  }

  const handleAdClick = () => {
    if (adConfig.targetUrl) {
      window.open(adConfig.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (adConfig.type === 'google-adsense' && adConfig.adScript) {
    return (
      <div className={`ad-container ${className}`}>
        <div className="text-xs text-gray-500 mb-1">Advertisement</div>
        <div dangerouslySetInnerHTML={{ __html: adConfig.adScript }} />
      </div>
    );
  }

  return (
    <Card className={`ad-banner ${className} border-dashed border-gray-300 bg-gray-50/50`}>
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium">SPONSORED</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {adConfig.type === 'banner' && adConfig.imageUrl && (
          <div className="mb-3">
            <img 
              src={adConfig.imageUrl} 
              alt={adConfig.title}
              className="w-full h-24 object-cover rounded"
            />
          </div>
        )}

        <div className="space-y-2">
          {adConfig.title && (
            <h4 className="font-semibold text-sm text-gray-900">
              {adConfig.title}
            </h4>
          )}
          
          {adConfig.description && (
            <p className="text-sm text-gray-600">
              {adConfig.description}
            </p>
          )}

          {adConfig.ctaText && (
            <Button
              onClick={handleAdClick}
              size="sm"
              variant={adConfig.id === 'upgrade-pro' ? 'default' : 'outline'}
              className={`w-full ${
                adConfig.id === 'upgrade-pro' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : ''
              }`}
            >
              {adConfig.ctaText}
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdBanner;
