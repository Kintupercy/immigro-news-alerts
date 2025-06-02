
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
      proOnly: false // All features are now free
    },
    spanishTranslation: {
      name: "Spanish Translation", 
      description: "Read all content in Spanish",
      proOnly: false
    },
    allCategories: {
      name: "All Categories",
      description: "Access all 13+ immigration categories",
      proOnly: false
    },
    fullArchive: {
      name: "Full News Archive",
      description: "Browse complete historical news database",
      proOnly: false
    },
    realTimeAlerts: {
      name: "Real-time Alerts",
      description: "Instant notifications for breaking news",
      proOnly: false
    },
    noAds: {
      name: "Ad-free Experience",
      description: "Enjoy uninterrupted news reading",
      proOnly: false
    }
  };

  const checkFeatureAccess = (featureKey: string): boolean => {
    // All features are now accessible
    return true;
  };

  const showUpgradePrompt = (featureKey: string, context?: string) => {
    // No upgrade prompts needed since everything is free
    return;
  };

  const getFeatureBadge = (featureKey: string) => {
    // No feature badges needed since everything is free
    return null;
  };

  return {
    isProMember: true, // Always true
    checkFeatureAccess,
    showUpgradePrompt,
    getFeatureBadge,
    upgradeModalOpen,
    setUpgradeModalOpen,
    features
  };
};
