
import { Shield, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsHeaderProps {
  currentLanguage: 'en' | 'es';
  onLanguageChange: (language: 'en' | 'es') => void;
}

const NewsHeader = ({
  currentLanguage,
  onLanguageChange
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
        </div>
        <div className="flex items-center gap-3">
          <Languages className="w-4 h-4 text-cream-200" />
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              variant={currentLanguage === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLanguageChange('en')}
              className="rounded-none border-0"
            >
              English
            </Button>
            <Button
              variant={currentLanguage === 'es' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLanguageChange('es')}
              className="rounded-none border-0"
            >
              Español
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsHeader;
