
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useProMembership } from "@/hooks/useProMembership";
import { Loader2, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCategories } from "@/hooks/useCategories";
import PersonalInfoSection from "./PersonalInfoSection";
import NotificationPreferencesSection from "./NotificationPreferencesSection";
import CategoriesSection from "./CategoriesSection";

interface ProfileManagementProps {
  user: User;
}

const ProfileManagement = ({ user }: ProfileManagementProps) => {
  const { profile, loading: profileLoading, saving, updateProfile } = useUserProfile(user);
  const { categories, loading: categoriesLoading } = useCategories();
  const { isProMember } = useProMembership(user);

  const toggleCategory = (categorySlug: string) => {
    if (!profile) return;

    const updatedCategories = profile.preferred_categories.includes(categorySlug)
      ? profile.preferred_categories.filter(cat => cat !== categorySlug)
      : [...profile.preferred_categories, categorySlug];

    updateProfile({ preferred_categories: updatedCategories });
  };

  const updateNotificationPreference = (key: keyof typeof profile?.notification_preferences, value: boolean) => {
    if (!profile) return;

    const updatedPreferences = {
      ...profile.notification_preferences,
      [key]: value
    };

    updateProfile({ notification_preferences: updatedPreferences });
  };

  const isLoading = profileLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p>Error loading profile. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        {isProMember && (
          <Badge className="bg-emerald-600 text-white">
            <Crown className="w-4 h-4 mr-1" />
            Pro Member
          </Badge>
        )}
      </div>

      {/* Personal Information */}
      <PersonalInfoSection 
        profile={profile}
        user={user}
        isProMember={isProMember}
        saving={saving}
        onUpdate={updateProfile}
      />

      {/* Notification Preferences */}
      <NotificationPreferencesSection 
        preferences={profile.notification_preferences}
        isProMember={isProMember}
        saving={saving}
        onUpdate={updateNotificationPreference}
      />

      {/* Categories */}
      <CategoriesSection 
        categories={categories}
        selectedCategories={profile.preferred_categories}
        saving={saving}
        onToggleCategory={toggleCategory}
      />

      {saving && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Saving changes...</span>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;
