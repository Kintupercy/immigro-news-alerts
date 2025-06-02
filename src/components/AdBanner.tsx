
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";

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
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Mock ad configurations focused on immigration services
    const adConfigs: AdConfig[] = [
      {
        id: 'immigration-lawyer',
        type: 'native',
        title: 'Need Immigration Legal Help?',
        description: 'Connect with experienced immigration lawyers for your case',
        ctaText: 'Find a Lawyer',
        targetUrl: '#talk-to-lawyer',
        position: 'header',
        isActive: true
      },
      {
        id: 'esl-services',
        type: 'banner',
        title: 'Improve Your English',
        description: 'Online ESL classes designed for immigrants',
        imageUrl: '/placeholder.svg',
        ctaText: 'Start Learning',
        targetUrl: 'https://example-esl-service.com',
        position: 'between-articles',
        isActive: true
      },
      {
        id: 'remittance-service',
        type: 'text',
        title: 'Send Money Home',
        description: 'Low-fee international money transfers',
        ctaText: 'Compare Rates',
        targetUrl: 'https://example-remittance.com',
        position: 'sidebar',
        isActive: true
      },
      {
        id: 'immigration-insurance',
        type: 'native',
        title: 'Immigration Health Insurance',
        description: 'Affordable health coverage during your immigration process',
        ctaText: 'Get Quote',
        targetUrl: 'https://example-insurance.com',
        position: 'footer',
        isActive: true
      }
    ];

    // Find ad config for this position
    const config = adConfigs.find(ad => ad.position === position && ad.isActive);
    setAdConfig(config || null);
  }, [position]);

  if (!adConfig || !isVisible) {
    return null;
  }

  const handleAdClick = () => {
    if (adConfig.targetUrl) {
      if (adConfig.targetUrl.startsWith('#')) {
        // Scroll to section for internal links
        const element = document.querySelector(adConfig.targetUrl);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.open(adConfig.targetUrl, '_blank', 'noopener,noreferrer');
      }
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
              variant="outline"
              className="w-full hover:bg-emerald-50 hover:border-emerald-300"
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
