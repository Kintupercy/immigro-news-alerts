
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingStates";
import Index from "./pages/Index";
import News from "./pages/News";
import Signup from "./pages/Signup";
import Auth from "./pages/Auth";
import Resources from "./pages/Resources";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import EmailVerification from "./pages/EmailVerification";
import PasswordReset from "./pages/PasswordReset";
import AuthenticatedApp from "./components/AuthenticatedApp";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";
import AdminDashboard from "./pages/AdminDashboard";

// Enhanced query client with better error handling and retries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error);
          setAuthError(error.message);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setAuthError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setUser(session?.user ?? null);
        setAuthError(null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <HelmetProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <h1 className="text-2xl font-bold text-navy-800 mb-2 mt-4">Immigro</h1>
            <p className="text-muted-foreground">Loading your personalized immigration news...</p>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  if (authError) {
    return (
      <HelmetProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <ErrorBoundary
            fallback={
              <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
                <p className="text-muted-foreground mb-4">{authError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-navy-800 text-white rounded hover:bg-navy-700"
                >
                  Retry
                </button>
              </div>
            }
          >
            <div />
          </ErrorBoundary>
        </div>
      </HelmetProvider>
    );
  }

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/" 
                  element={user ? <AuthenticatedApp /> : <Index />} 
                />
                <Route path="/news" element={<News />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/signup" element={<Signup />} />
                <Route 
                  path="/auth" 
                  element={user ? <Navigate to="/" replace /> : <Auth />} 
                />
                
                <Route path="/email-verification" element={<EmailVerification />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                
                <Route 
                  path="/dashboard" 
                  element={user ? <AuthenticatedApp /> : <Navigate to="/auth" replace />} 
                />
                
                {/* Admin Dashboard Route */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminDashboard />
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieConsent />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
