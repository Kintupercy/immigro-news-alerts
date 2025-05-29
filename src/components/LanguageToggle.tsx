
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Languages, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LanguageToggleProps {
  currentLanguage: 'en' | 'es';
  onLanguageChange: (language: 'en' | 'es') => void;
  isProMember: boolean;
}

const LanguageToggle = ({ currentLanguage, onLanguageChange, isProMember }: LanguageToggleProps) => {
  const { toast } = useToast();

  const handleLanguageChange = (language: 'en' | 'es') => {
    if (language === 'es' && !isProMember) {
      toast({
        title: "Pro Feature",
        description: "Spanish translation is available for Pro members only. Upgrade to access this feature.",
        variant: "destructive",
      });
      return;
    }
    onLanguageChange(language);
  };

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-4 h-4 text-gray-600" />
      <div className="flex rounded-lg border overflow-hidden">
        <Button
          variant={currentLanguage === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLanguageChange('en')}
          className="rounded-none border-0"
        >
          English
        </Button>
        <Button
          variant={currentLanguage === 'es' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLanguageChange('es')}
          className="rounded-none border-0 relative"
          disabled={!isProMember}
        >
          Español
          {!isProMember && (
            <Crown className="w-3 h-3 ml-1 text-yellow-500" />
          )}
        </Button>
      </div>
      {!isProMember && (
        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
          Pro Only
        </Badge>
      )}
    </div>
  );
};

export default LanguageToggle;
