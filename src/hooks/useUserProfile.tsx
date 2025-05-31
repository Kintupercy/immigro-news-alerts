
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type DatabaseUserProfile = Database['public']['Tables']['user_profiles']['Row'];
type DatabaseUserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];
type DatabaseUserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  preferred_categories: string[];
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    urgent_only: boolean;
  };
  onboarding_completed: boolean;
}

export const useUserProfile = (user: User) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const convertDatabaseProfileToUserProfile = (dbProfile: DatabaseUserProfile): UserProfile => {
    const notificationPrefs = dbProfile.notification_preferences as any;
    return {
      ...dbProfile,
      preferred_categories: dbProfile.preferred_categories || [],
      notification_preferences: {
        email: notificationPrefs?.email ?? true,
        sms: notificationPrefs?.sms ?? false,
        push: notificationPrefs?.push ?? true,
        urgent_only: notificationPrefs?.urgent_only ?? false
      }
    };
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(convertDatabaseProfileToUserProfile(data));
      } else {
        // Create default profile if none exists
        const defaultProfile: DatabaseUserProfileInsert = {
          user_id: user.id,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          phone_number: null,
          preferred_categories: [],
          notification_preferences: {
            email: true,
            sms: false,
            push: true,
            urgent_only: false
          },
          onboarding_completed: false
        };
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (createError) throw createError;
        setProfile(convertDatabaseProfileToUserProfile(newProfile));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    setSaving(true);
    try {
      // Convert UserProfile updates to database format
      const dbUpdates: DatabaseUserProfileUpdate = {};
      
      if (updates.first_name !== undefined) dbUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined) dbUpdates.last_name = updates.last_name;
      if (updates.phone_number !== undefined) dbUpdates.phone_number = updates.phone_number;
      if (updates.preferred_categories !== undefined) dbUpdates.preferred_categories = updates.preferred_categories;
      if (updates.notification_preferences !== undefined) {
        dbUpdates.notification_preferences = updates.notification_preferences;
      }
      if (updates.onboarding_completed !== undefined) dbUpdates.onboarding_completed = updates.onboarding_completed;

      const { error } = await supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      toast({
        title: "Profile updated",
        description: "Your preferences have been saved successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  return {
    profile,
    loading,
    saving,
    updateProfile,
    fetchProfile
  };
};
