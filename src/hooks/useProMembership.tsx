
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";

interface NotificationPreferences {
  push?: boolean;
  email?: boolean;
  urgent_only?: boolean;
}

export const useProMembership = (user: User | null) => {
  const [isProMember, setIsProMember] = useState(true); // Always true for free app
  const [loading, setLoading] = useState(false); // No loading needed

  useEffect(() => {
    // Since everything is free now, just set to true immediately
    setIsProMember(true);
    setLoading(false);
  }, [user]);

  return { isProMember, loading };
};
