
// Simple translation utility - in production, you'd use a service like Google Translate API
const translations: Record<string, string> = {
  // Common UI translations
  'Latest Immigration News': 'Últimas Noticias de Inmigración',
  'All Categories': 'Todas las Categorías',
  'All News': 'Todas las Noticias',
  'Urgent': 'Urgente',
  'Regular': 'Regular',
  'Read More': 'Leer Más',
  'Show Less': 'Mostrar Menos',
  'Source': 'Fuente',
  'Found': 'Encontrado',
  'article': 'artículo',
  'articles': 'artículos',
  'matching': 'que coinciden con',
  'No articles found': 'No se encontraron artículos',
  'No urgent alerts': 'No hay alertas urgentes',
  'No regular news': 'No hay noticias regulares',
  'Fetching latest news': 'Obteniendo últimas noticias',
  'Loading verified news': 'Cargando noticias verificadas',
  'VERIFIED IMMIGRATION UPDATES': 'ACTUALIZACIONES DE INMIGRACIÓN VERIFICADAS',
  'SEARCH, SAVE & SHARE NEWS': 'BUSCAR, GUARDAR Y COMPARTIR NOTICIAS',
  'Search immigration news, alerts, and updates': 'Buscar noticias, alertas y actualizaciones de inmigración',
  'Refresh': 'Actualizar',
  'Fetching Latest': 'Obteniendo Últimas',
  
  // Categories
  'Green Card': 'Tarjeta Verde',
  'Work Visas': 'Visas de Trabajo',
  'Student Visas': 'Visas de Estudiante',
  'Citizenship': 'Ciudadanía',
  'Humanitarian': 'Humanitario',
  'Investment': 'Inversión',
};

export const translateText = async (text: string, targetLanguage: 'es' | 'en'): Promise<string> => {
  if (targetLanguage === 'en') {
    return text;
  }

  // Check for direct translations first
  if (translations[text]) {
    return translations[text];
  }

  // For longer content, we would typically use a translation API
  // For now, return original text with a note that it needs translation
  if (text.length > 100) {
    // In production, integrate with Google Translate API or similar
    return `[Traducción disponible con API de traducción] ${text}`;
  }

  return text;
};

export const translateCategory = (category: string): string => {
  return translations[category] || category;
};
