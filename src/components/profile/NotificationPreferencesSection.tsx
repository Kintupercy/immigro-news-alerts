
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  urgent_only: boolean;
}

type NotificationPreferenceKey = 'email' | 'push' | 'urgent_only';

interface NotificationPreferencesSectionProps {
  preferences: NotificationPreferences;
  isProMember: boolean;
  saving: boolean;
  onUpdate: (key: NotificationPreferenceKey, value: boolean) => void;
}

const NotificationPreferencesSection = ({ 
  preferences, 
  isProMember, 
  saving, 
  onUpdate 
}: NotificationPreferencesSectionProps) => {
  const { toast } = useToast();

  const handleUrgentOnlyToggle = (value: boolean) => {
    if (value && !isProMember) {
      toast({
        title: "Pro Feature",
        description: "Urgent news only mode is available for Pro members. Upgrade to Pro for priority news filtering.",
        variant: "default"
      });
      return;
    }
    onUpdate('urgent_only', value);
  };

  return (
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
              checked={preferences.email}
              onCheckedChange={(checked) => onUpdate('email', checked as boolean)}
              disabled={saving}
            />
          </div>

          <div className={`flex items-center justify-between p-4 border rounded-lg ${!isProMember ? 'opacity-50 bg-gray-50' : ''}`}>
            <div>
              <Label className="font-medium flex items-center gap-2">
                Urgent News Only
                {isProMember ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Pro</Badge>
                ) : (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </Label>
              <p className="text-sm text-muted-foreground">
                Only receive notifications for urgent immigration news
              </p>
            </div>
            <Checkbox
              checked={preferences.urgent_only && isProMember}
              onCheckedChange={(checked) => handleUrgentOnlyToggle(checked as boolean)}
              disabled={saving || !isProMember}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferencesSection;
