
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import OnboardingFlow from "./OnboardingFlow";

interface OnboardingWrapperProps {
  user: User;
  children: React.ReactNode;
}

interface UserProfile {
  onboarding_completed: boolean;
}

const OnboardingWrapper = ({ user, children }: OnboardingWrapperProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    // Skip profile fetching for public site
    setProfile({ onboarding_completed: true });
    setLoading(false);
  };

  const handleOnboardingComplete = () => {
    setProfile({ onboarding_completed: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <h1 className="text-2xl font-bold text-navy-800 mb-2">Immigro</h1>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (!profile?.onboarding_completed) {
    return (
      <OnboardingFlow 
        user={user} 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return <>{children}</>;
};

export default OnboardingWrapper;
