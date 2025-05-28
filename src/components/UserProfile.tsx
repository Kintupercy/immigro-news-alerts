
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { User } from "@supabase/supabase-js";

interface UserProfile {
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
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface UserProfileProps {
  user: User;
}

const UserProfile = ({ user }: UserProfileProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Use a custom query since user_profiles is not in the types
      const { data, error } = await supabase
        .from('immigration_news')
        .select('*')
        .limit(0);

      // This will fail but we can catch and work around it
      if (error) {
        console.log('Expected error for type checking');
      }

      // Try to fetch user profile using a raw query approach
      const profileData = await fetchUserProfileData();
      if (profileData) {
        setProfile(profileData);
      } else {
        // Create a new profile if it doesn't exist
        await createProfile();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfileData = async (): Promise<UserProfile | null> => {
    try {
      // This is a workaround - in a real app you'd use the proper types
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/user_profiles?user_id=eq.${user.id}&select=*`, {
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const createProfile = async () => {
    try {
      const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        user_id: user.id,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        phone_number: '',
        preferred_categories: [],
        notification_preferences: {
          email: true,
          sms: false,
          push: true,
          urgent_only: false
        }
      };

      // Use raw fetch to create profile
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/user_profiles`, {
        method: 'POST',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: newProfile.user_id,
          first_name: newProfile.first_name,
          last_name: newProfile.last_name,
          phone_number: newProfile.phone_number,
          preferred_categories: newProfile.preferred_categories,
          notification_preferences: newProfile.notification_preferences
        })
      });

      if (response.ok) {
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
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

  const updateProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Use raw fetch to update profile
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/user_profiles?user_id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number,
          preferred_categories: profile.preferred_categories,
          notification_preferences: profile.notification_preferences,
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your preferences have been saved successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (categorySlug: string) => {
    if (!profile) return;

    const updatedCategories = profile.preferred_categories.includes(categorySlug)
      ? profile.preferred_categories.filter(cat => cat !== categorySlug)
      : [...profile.preferred_categories, categorySlug];

    setProfile({
      ...profile,
      preferred_categories: updatedCategories
    });
  };

  const updateNotificationPreference = (key: string, value: boolean) => {
    if (!profile) return;

    setProfile({
      ...profile,
      notification_preferences: {
        ...profile.notification_preferences,
        [key]: value
      }
    });
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-6">Error loading profile</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.first_name || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  first_name: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.last_name || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  last_name: e.target.value
                })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profile.phone_number || ''}
              onChange={(e) => setProfile({
                ...profile,
                phone_number: e.target.value
              })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>News Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the immigration categories you're interested in:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.slug}
                  checked={profile.preferred_categories.includes(category.slug)}
                  onCheckedChange={() => toggleCategory(category.slug)}
                />
                <Label htmlFor={category.slug} className="text-sm">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={profile.notification_preferences.email}
              onCheckedChange={(checked) => 
                updateNotificationPreference('email', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">SMS Notifications</Label>
            <Switch
              id="sms-notifications"
              checked={profile.notification_preferences.sms}
              onCheckedChange={(checked) => 
                updateNotificationPreference('sms', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch
              id="push-notifications"
              checked={profile.notification_preferences.push}
              onCheckedChange={(checked) => 
                updateNotificationPreference('push', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="urgent-only">Urgent News Only</Label>
            <Switch
              id="urgent-only"
              checked={profile.notification_preferences.urgent_only}
              onCheckedChange={(checked) => 
                updateNotificationPreference('urgent_only', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={updateProfile} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export default UserProfile;
