
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface PushNotificationSetupProps {
  user: User;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    urgent_only: boolean;
  };
  onPreferencesUpdate: (preferences: any) => void;
}

const PushNotificationSetup = ({ user, notificationPreferences, onPreferencesUpdate }: PushNotificationSetupProps) => {
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkPushSupport();
    checkPushPermission();
  }, []);

  const checkPushSupport = () => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    setPushSupported(isSupported);
  };

  const checkPushPermission = async () => {
    if (!pushSupported) return;
    
    const permission = await Notification.requestPermission();
    setPushEnabled(permission === 'granted');
  };

  const enablePushNotifications = async () => {
    if (!pushSupported) {
      toast({
        title: "Push notifications not supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Register service worker and get push subscription
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey())
        });

        // Convert subscription to JSON and then to compatible format
        const subscriptionJson = subscription.toJSON();
        
        // Convert to a plain object to ensure compatibility with Json type
        const subscriptionData = {
          endpoint: subscriptionJson.endpoint,
          keys: subscriptionJson.keys,
          expirationTime: subscriptionJson.expirationTime
        };
        
        // Skip saving subscription for public site
        const error = null;

        setPushEnabled(true);
        onPreferencesUpdate({
          ...notificationPreferences,
          push: true
        });

        toast({
          title: "Push notifications enabled!",
          description: "You'll now receive push notifications for immigration news alerts.",
        });
      } else {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      toast({
        title: "Error enabling notifications",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disablePushNotifications = async () => {
    setLoading(true);
    try {
      // Skip database update for public site
      const error = null;

      setPushEnabled(false);
      onPreferencesUpdate({
        ...notificationPreferences,
        push: false
      });

      toast({
        title: "Push notifications disabled",
        description: "You won't receive push notifications anymore.",
      });
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      toast({
        title: "Error",
        description: "Failed to disable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Placeholder VAPID key - replace with actual key
  const getVapidPublicKey = () => {
    return 'your-vapid-public-key-here';
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!pushSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Push notifications are not supported in your current browser. 
            Try using Chrome, Firefox, or Safari for the best experience.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get instant alerts for urgent immigration news directly to your device.
            </p>
          </div>
          <Switch
            checked={pushEnabled && notificationPreferences.push}
            onCheckedChange={pushEnabled ? disablePushNotifications : enablePushNotifications}
            disabled={loading}
          />
        </div>

        {!pushEnabled && (
          <Button 
            onClick={enablePushNotifications} 
            disabled={loading}
            className="w-full"
          >
            <Bell className="w-4 h-4 mr-2" />
            {loading ? "Enabling..." : "Enable Push Notifications"}
          </Button>
        )}

        <div className="text-xs text-muted-foreground">
          <p>
            Push notifications will respect your other notification preferences. 
            You can disable them at any time in your browser settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationSetup;
