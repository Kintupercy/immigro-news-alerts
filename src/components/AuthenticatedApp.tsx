
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, User as UserIcon, Newspaper, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NewsFeed from "@/components/NewsFeed";
import PersonalizedNewsFeed from "@/components/PersonalizedNewsFeed";
import UserProfile from "@/components/UserProfile";
import OnboardingWrapper from "@/components/OnboardingWrapper";

const AuthenticatedApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of Immigro.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <Card className="w-64">
            <CardContent className="p-6 text-center">
              Loading your personalized news feed...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will be handled by the main App component
  }

  const MainApp = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header with just logo and sign out */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-800">⚖️ Immigro</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>Welcome back, {user.user_metadata?.first_name || user.email}</span>
              </div>
            </div>
            <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="personalized" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personalized" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              My News
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              All News
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personalized" className="mt-6">
            <PersonalizedNewsFeed user={user} />
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <NewsFeed />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <UserProfile user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  return (
    <OnboardingWrapper user={user}>
      <MainApp />
    </OnboardingWrapper>
  );
};

export default AuthenticatedApp;
