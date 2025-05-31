
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

const UrgentNewsAlert = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Listen for new urgent immigration news
    const channel = supabase
      .channel('urgent-news-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'immigration_news',
          filter: 'is_urgent=eq.true'
        },
        async (payload) => {
          console.log('New urgent news detected:', payload.new);
          
          const urgentNews = payload.new;
          
          // Show urgent toast notification
          toast({
            title: "🚨 URGENT Immigration News",
            description: urgentNews.title,
            variant: "destructive",
            duration: 10000, // Show for 10 seconds
          });

          // Trigger notifications (email + SMS for pro members)
          try {
            const { data, error } = await supabase.functions.invoke('notify-users', {
              body: { newsId: urgentNews.id }
            });

            if (error) {
              console.error('Error sending urgent news alerts:', error);
            } else {
              console.log('Urgent news alerts triggered:', data);
            }
          } catch (error) {
            console.error('Failed to trigger urgent news alerts:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return null; // This is a background service component
};

export default UrgentNewsAlert;
