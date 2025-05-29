
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useProMembership = (user: User | null) => {
  const [isProMember, setIsProMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProMembership = async () => {
      if (!user) {
        setIsProMember(false);
        setLoading(false);
        return;
      }

      try {
        // In a real app, you'd check subscription status from a payments table
        // For now, we'll simulate Pro membership check
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('notification_preferences')
          .eq('user_id', user.id)
          .single();

        // Simple simulation: if user has SMS notifications enabled, consider them Pro
        // In production, you'd have a proper subscription/billing table
        const hasSmsEnabled = profile?.notification_preferences?.sms === true;
        setIsProMember(hasSmsEnabled || false);
      } catch (error) {
        console.error('Error checking Pro membership:', error);
        setIsProMember(false);
      } finally {
        setLoading(false);
      }
    };

    checkProMembership();
  }, [user]);

  return { isProMember, loading };
};
