
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User } from "@supabase/supabase-js";
import { Loader2, Check, AlertTriangle, Crown, MessageSquare, Mail, Bell } from "lucide-react";
import { useProMembership } from "@/hooks/useProMembership";
import { Database } from "@/integrations/supabase/types";

interface ProfileManagementProps {
  user: User;
}

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  preferred_categories: string[];
  notification_preferences: {
    email: boolean;
    push: boolean;
    urgent_only: boolean;
  };
  onboarding_completed: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

type DatabaseUserProfile = Database['public']['Tables']['user_profiles']['Row'];
type DatabaseUserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];
type DatabaseUserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];

const ProfileManagement = ({ user }: ProfileManagementProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isProMember } = useProMembership(user);

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, [user.id]);

  const convertDatabaseProfileToUserProfile = (dbProfile: DatabaseUserProfile): UserProfile => {
    const notificationPrefs = dbProfile.notification_preferences as any;
    return {
      ...dbProfile,
      preferred_categories: dbProfile.preferred_categories || [],
      notification_preferences: {
        email: notificationPrefs?.email ?? true,
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('immigration_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) return '';
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (profile) {
      const cleanPhone = formatted.replace(/\D/g, '');
      updateProfile({ phone_number: cleanPhone || null });
    }
  };

  const toggleCategory = (categorySlug: string) => {
    if (!profile) return;

    const updatedCategories = profile.preferred_categories.includes(categorySlug)
      ? profile.preferred_categories.filter(cat => cat !== categorySlug)
      : [...profile.preferred_categories, categorySlug];

    updateProfile({ preferred_categories: updatedCategories });
  };

  const updateNotificationPreference = (key: keyof UserProfile['notification_preferences'], value: boolean) => {
    if (!profile) return;

    const updatedPreferences = {
      ...profile.notification_preferences,
      [key]: value
    };

    updateProfile({ notification_preferences: updatedPreferences });
  };

  if (loading) {
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
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.first_name || ''}
                onChange={(e) => updateProfile({ first_name: e.target.value })}
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.last_name || ''}
                onChange={(e) => updateProfile({ last_name: e.target.value })}
                disabled={saving}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formatPhoneNumber(profile.phone_number || '')}
              onChange={handlePhoneChange}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-navy-600" />
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <Checkbox
                checked={profile.notification_preferences.email}
                onCheckedChange={(checked) => 
                  updateNotificationPreference('email', checked as boolean)
                }
                disabled={saving}
              />
            </div>


            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-medium">Urgent News Only</Label>
                <p className="text-sm text-muted-foreground">
                  Only receive notifications for urgent immigration news
                </p>
              </div>
              <Checkbox
                checked={profile.notification_preferences.urgent_only}
                onCheckedChange={(checked) => 
                  updateNotificationPreference('urgent_only', checked as boolean)
                }
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Immigration Categories</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the immigration topics you're interested in receiving news about.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  profile.preferred_categories.includes(category.slug) 
                    ? 'border-navy-500 bg-navy-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => toggleCategory(category.slug)}
              >
                <Checkbox
                  checked={profile.preferred_categories.includes(category.slug)}
                  disabled={saving}
                />
                <div className="flex-1">
                  <Label className="cursor-pointer font-medium">
                    {category.name}
                  </Label>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {profile.preferred_categories.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Selected categories:</p>
              <div className="flex flex-wrap gap-2">
                {profile.preferred_categories.map(slug => {
                  const category = categories.find(c => c.slug === slug);
                  return (
                    <Badge key={slug} variant="secondary">
                      {category?.name || slug}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
