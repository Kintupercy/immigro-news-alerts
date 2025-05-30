
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import NewsFeed from "@/components/NewsFeed";
import SEO from "@/components/SEO";
import { LoadingSpinner } from "@/components/LoadingStates";

const News = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to signup if not authenticated
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Latest Immigration News & Updates"
        description="Browse the latest immigration news, policy changes, and visa updates. Stay informed with real-time alerts and expert analysis."
        keywords={['immigration news', 'latest updates', 'visa news', 'green card updates', 'citizenship news']}
        url="https://immigro.app/news"
      />
      <Header />
      <div className="pt-4 sm:pt-0">
        <NewsFeed />
      </div>
    </div>
  );
};

export default News;
