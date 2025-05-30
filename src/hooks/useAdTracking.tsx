
import { useState, useEffect } from "react";

interface AdMetrics {
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
}

export const useAdTracking = () => {
  const [metrics, setMetrics] = useState<Record<string, AdMetrics>>({});

  const trackImpression = (adId: string) => {
    setMetrics(prev => ({
      ...prev,
      [adId]: {
        ...prev[adId],
        impressions: (prev[adId]?.impressions || 0) + 1,
        clicks: prev[adId]?.clicks || 0,
        ctr: calculateCTR(prev[adId]?.clicks || 0, (prev[adId]?.impressions || 0) + 1)
      }
    }));

    // In production, you'd send this to your analytics service
    console.log(`Ad impression tracked: ${adId}`);
  };

  const trackClick = (adId: string) => {
    setMetrics(prev => ({
      ...prev,
      [adId]: {
        ...prev[adId],
        impressions: prev[adId]?.impressions || 0,
        clicks: (prev[adId]?.clicks || 0) + 1,
        ctr: calculateCTR((prev[adId]?.clicks || 0) + 1, prev[adId]?.impressions || 0)
      }
    }));

    // In production, you'd send this to your analytics service
    console.log(`Ad click tracked: ${adId}`);
  };

  const calculateCTR = (clicks: number, impressions: number): number => {
    return impressions > 0 ? (clicks / impressions) * 100 : 0;
  };

  return {
    metrics,
    trackImpression,
    trackClick
  };
};
