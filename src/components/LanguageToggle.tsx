
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Languages, Crown } from "lucide-react";
import { useFreemiumFeatures } from "@/hooks/useFreemiumFeatures";
import { User } from "@supabase/supabase-js";

interface LanguageToggleProps {
  currentLanguage: 'en' | 'es';
  onLanguageChange: (language: 'en' | 'es') => void;
  isProMember: boolean;
  user?: User | null;
}

const LanguageToggle = ({ currentLanguage, onLanguageChange, isProMember, user }: LanguageToggleProps) => {
  const { showUpgradePrompt, setUpgradeModalOpen } = useFreemiumFeatures(user);

  const handleLanguageChange = (language: 'en' | 'es') => {
    if (language === 'es' && !isProMember) {
      showUpgradePrompt('spanishTranslation');
      setUpgradeModalOpen(true);
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
          <Crown className="w-3 h-3 mr-1" />
          Pro
        </Badge>
      )}
    </div>
  );
};

export default LanguageToggle;
