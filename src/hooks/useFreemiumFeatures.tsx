
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useProMembership } from "./useProMembership";
import { useToast } from "@/hooks/use-toast";

interface FreemiumFeature {
  name: string;
  description: string;
  proOnly: boolean;
}

export const useFreemiumFeatures = (user: User | null) => {
  const { isProMember } = useProMembership(user);
  const { toast } = useToast();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const features: Record<string, FreemiumFeature> = {
    smsNotifications: {
      name: "SMS Notifications",
      description: "Get instant text alerts for urgent immigration news",
      proOnly: true
    },
    spanishTranslation: {
      name: "Spanish Translation", 
      description: "Read all content in Spanish",
      proOnly: true
    },
    allCategories: {
      name: "All Categories",
      description: "Access all 13+ immigration categories",
      proOnly: true
    },
    fullArchive: {
      name: "Full News Archive",
      description: "Browse complete historical news database",
      proOnly: true
    },
    realTimeAlerts: {
      name: "Real-time Alerts",
      description: "Instant notifications for breaking news",
      proOnly: true
    },
    noAds: {
      name: "Ad-free Experience",
      description: "Enjoy uninterrupted news reading",
      proOnly: true
    }
  };

  const checkFeatureAccess = (featureKey: string): boolean => {
    const feature = features[featureKey];
    if (!feature) return true;
    
    if (feature.proOnly && !isProMember) {
      return false;
    }
    return true;
  };

  const showUpgradePrompt = (featureKey: string, context?: string) => {
    const feature = features[featureKey];
    if (!feature) return;

    toast({
      title: "Pro Feature",
      description: `${feature.description}. Upgrade to Pro to unlock this feature.`,
      variant: "default",
      action: (
        <button 
          onClick={() => setUpgradeModalOpen(true)}
          className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
        >
          Upgrade
        </button>
      )
    });
  };

  const getFeatureBadge = (featureKey: string) => {
    const feature = features[featureKey];
    if (!feature?.proOnly || isProMember) return null;
    
    return "Pro";
  };

  return {
    isProMember,
    checkFeatureAccess,
    showUpgradePrompt,
    getFeatureBadge,
    upgradeModalOpen,
    setUpgradeModalOpen,
    features
  };
};
