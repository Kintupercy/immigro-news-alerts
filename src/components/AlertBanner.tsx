
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UrgentAlert {
  id: string;
  title: string;
  summary: string | null;
  published_at: string;
}

const AlertBanner = () => {
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUrgentAlerts();
    
    // Load dismissed alerts from localStorage
    const dismissed = localStorage.getItem('dismissedAlerts');
    if (dismissed) {
      setDismissedAlerts(JSON.parse(dismissed));
    }
  }, []);

  const fetchUrgentAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('immigration_news')
        .select('id, title, summary, published_at')
        .eq('status', 'published')
        .eq('is_urgent', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setUrgentAlerts(data || []);
    } catch (error) {
      console.error('Error fetching urgent alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    const newDismissed = [...dismissedAlerts, alertId];
    setDismissedAlerts(newDismissed);
    localStorage.setItem('dismissedAlerts', JSON.stringify(newDismissed));
  };

  const visibleAlerts = urgentAlerts.filter(alert => !dismissedAlerts.includes(alert.id));

  if (loading || visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border-b border-red-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {visibleAlerts.map((alert) => (
          <Card key={alert.id} className="mb-2 last:mb-0 bg-red-100 border-red-200">
            <div className="flex items-start gap-3 p-4">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-red-900 mb-1">
                  {alert.title}
                </h3>
                {alert.summary && (
                  <p className="text-red-800 text-sm">
                    {alert.summary}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-200 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlertBanner;
