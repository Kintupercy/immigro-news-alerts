
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Globe, Shield, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

const UpgradeModal = ({ open, onOpenChange, feature }: UpgradeModalProps) => {
  const navigate = useNavigate();

  const proFeatures = [
    {
      icon: <Zap className="w-5 h-5 text-emerald-600" />,
      title: "Real-time Alerts",
      description: "Get instant notifications for breaking immigration news"
    },
    {
      icon: <Bell className="w-5 h-5 text-emerald-600" />,
      title: "SMS Notifications", 
      description: "Receive urgent alerts directly to your phone"
    },
    {
      icon: <Globe className="w-5 h-5 text-emerald-600" />,
      title: "Spanish Translation",
      description: "Read all content in your preferred language"
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-600" />,
      title: "All 13+ Categories",
      description: "Access every immigration topic and specialty area"
    }
  ];

  const handleUpgradeClick = () => {
    onOpenChange(false);
    navigate('/payment');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="w-12 h-12 text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Unlock premium features and get the most comprehensive immigration news experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          {proFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              {feature.icon}
              <div>
                <h4 className="font-medium text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">$4.99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              30% off annual plan
            </Badge>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleUpgradeClick}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Start Pro Trial
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Maybe later
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Cancel anytime. No questions asked.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
