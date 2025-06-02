
import { Shield, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LanguageToggle from "../LanguageToggle";

interface NewsHeaderProps {
  currentLanguage: 'en' | 'es';
  onLanguageChange: (language: 'en' | 'es') => void;
  isProMember: boolean;
  user: any;
  userPreferredCategories: string[];
  setUpgradeModalOpen: (open: boolean) => void;
}

const NewsHeader = ({
  currentLanguage,
  onLanguageChange,
  isProMember,
  user,
  userPreferredCategories,
  setUpgradeModalOpen
}: NewsHeaderProps) => {
  return (
    <div className="bg-navy-800 text-cream-50 p-4 lg:p-6 rounded-lg mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {currentLanguage === 'es' ? 'ACTUALIZACIONES DE INMIGRACIÓN VERIFICADAS' : 'VERIFIED IMMIGRATION UPDATES'}
          </h1>
          <p className="text-cream-200 text-sm uppercase tracking-wide">
            <Shield className="inline w-4 h-4 mr-1" />
            {currentLanguage === 'es' ? 'BUSCAR, GUARDAR Y COMPARTIR NOTICIAS + BREAKING NEWS' : 'SEARCH, SAVE & SHARE NEWS + BREAKING NEWS'}
          </p>
          {!isProMember && (
            <div className="mt-2">
              <Badge className="bg-emerald-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Free Plan: {userPreferredCategories.length > 0 ? `${userPreferredCategories.length} Selected Categories` : '3 Categories'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpgradeModalOpen(true)}
                className="ml-2 mt-2 lg:mt-0 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-navy-800"
              >
                Unlock All 12+ Categories
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle 
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
            isProMember={isProMember}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsHeader;
