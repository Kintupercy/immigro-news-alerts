
// Simple translation utility - in production, you'd use a service like Google Translate API
const translations: Record<string, string> = {
  // Common UI translations
  'Latest Immigration News': 'Últimas Noticias de Inmigración',
  'All Categories': 'Todas las Categorías',
  'All News': 'Todas las Noticias',
  'All': 'Todas',
  'Urgent': 'Urgente',
  'Breaking': 'Noticias de Última Hora',
  'Breaking News': 'Noticias de Última Hora',
  'Regular': 'Regular',
  'Read More': 'Leer Más',
  'Show Less': 'Mostrar Menos',
  'Read Original': 'Leer Original',
  'Share': 'Compartir',
  'Source': 'Fuente',
  'Found': 'Encontrado',
  'article': 'artículo',
  'articles': 'artículos',
  'matching': 'que coinciden con',
  'No articles found': 'No se encontraron artículos',
  'No urgent alerts': 'No hay alertas urgentes',
  'No regular news': 'No hay noticias regulares',
  'No breaking news at this time': 'No hay noticias de última hora en este momento',
  'No regular news articles found': 'No se encontraron artículos de noticias regulares',
  'No urgent alerts at this time': 'No hay alertas urgentes en este momento',
  'Fetching latest news': 'Obteniendo últimas noticias',
  'Loading verified news': 'Cargando noticias verificadas',
  'VERIFIED IMMIGRATION UPDATES': 'ACTUALIZACIONES DE INMIGRACIÓN VERIFICADAS',
  'SEARCH, SAVE & SHARE NEWS': 'BUSCAR, GUARDAR Y COMPARTIR NOTICIAS',
  'Search immigration news, alerts, and updates': 'Buscar noticias, alertas y actualizaciones de inmigración',
  'Refresh': 'Actualizar',
  'Fetching Latest': 'Obteniendo Últimas',
  'Related Resources': 'Recursos Relacionados',
  
  // Breaking News Alert
  'Breaking Immigration News': 'Noticias de Inmigración de Última Hora',
  'Live Updates': 'Actualizaciones en Vivo',
  'Read Full Story': 'Leer Historia Completa',
  'Originally published by': 'Publicado originalmente por',
  'Content aggregated for breaking news alerts': 'Contenido agregado para alertas de noticias de última hora',
  
  // Categories
  'Green Card': 'Tarjeta Verde',
  'Work Visas': 'Visas de Trabajo',
  'Student Visas': 'Visas de Estudiante',
  'Citizenship': 'Ciudadanía',
  'Humanitarian': 'Humanitario',
  'Investment': 'Inversión',
  
  // Immigration-specific terms
  'H-1B': 'H-1B',
  'H-1B Cap Season': 'Temporada de Límite H-1B',
  'Specialty Occupations': 'Ocupaciones Especializadas',
  'EB-4': 'EB-4',
  'Non-Minister': 'No Ministro',
  'Special Immigrant': 'Inmigrante Especial',
  'Religious Worker': 'Trabajador Religioso',
  'Religious Worker Program': 'Programa de Trabajadores Religiosos',
  'Exchange Visitors': 'Visitantes de Intercambio',
  'Exchange Visitors Program': 'Programa de Visitantes de Intercambio',
  'Program Extended': 'Programa Extendido',
  'Program Overview': 'Resumen del Programa',
  'USCIS': 'USCIS',
  'Immigration': 'Inmigración',
  'Visa': 'Visa',
  'Green Card Application': 'Solicitud de Tarjeta Verde',
  'Citizenship Test': 'Examen de Ciudadanía',
  'Work Authorization': 'Autorización de Trabajo',
  'Permanent Resident': 'Residente Permanente',
  'Temporary Worker': 'Trabajador Temporal',
  'Student Status': 'Estatus de Estudiante',
  'Family Reunification': 'Reunificación Familiar',
  'Asylum': 'Asilo',
  'Refugee': 'Refugiado',
  'Deportation': 'Deportación',
  'Border': 'Frontera',
  'Immigration Court': 'Corte de Inmigración',
  'Policy Update': 'Actualización de Política',
  'Law Change': 'Cambio de Ley',
  'Application Process': 'Proceso de Solicitud',
  'Filing Fee': 'Tarifa de Presentación',
  'Priority Date': 'Fecha de Prioridad',
  'Adjustment of Status': 'Ajuste de Estatus',
  
  // Government and official terms
  'Department of Homeland Security': 'Departamento de Seguridad Nacional',
  'Homeland Security': 'Seguridad Nacional',
  'Secretary of Homeland Security': 'Secretario de Seguridad Nacional',
  'Secretary': 'Secretario',
  'Temporary Protected Status': 'Estatus de Protección Temporal',
  'TPS': 'TPS',
  'Federal Register': 'Registro Federal',
  'United States': 'Estados Unidos',
  'the United States': 'los Estados Unidos',
  'U.S.': 'EE.UU.',
  'Services': 'Servicios',
  'CBP': 'CBP',
  'ICE': 'ICE',
  'conditions': 'condiciones',
  'requirements': 'requisitos',
  'statutory requirements': 'requisitos legales',
  'designation': 'designación',
  'termination': 'terminación',
  'beneficiaries': 'beneficiarios',
  'determined': 'determinó',
  'announced': 'anunció',
  'publication': 'publicación',
  'notice': 'aviso',
  'effect': 'efecto',
  'prepare': 'prepararse',
  'return': 'regresar',
  'lawful basis': 'base legal',
  'remaining': 'permanecer',
  
  // Common action words and terms
  'has': 'ha',
  'have': 'tienen',
  'directed': 'dirigido',
  'to': 'a',
  'and': 'y',
  'are': 'están',
  'intensify': 'intensificar',
  'reviews': 'revisiones',
  'of': 'de',
  'records': 'registros',
  'take': 'tomar',
  'immediate': 'inmediato',
  'action': 'acción',
  'on': 'en',
  'overstays': 'permanencias excesivas',
  'At': 'En',
  'the': 'la',
  'direction': 'dirección',
  'multiple': 'múltiples',
  'agencies': 'agencias',
  'including': 'incluyendo',
  'ramping': 'aumentando',
  'up': 'las',
  'address': 'abordar',
  'administration': 'administración',
  'cites': 'cita',
  'previous': 'anterior',
  'Administration': 'Administración',
  'failure': 'fallo',
  'enforce': 'hacer cumplir',
  'law': 'ley',
  'as': 'como',
  'reason': 'razón',
  'for': 'por',
  'this': 'esta',
  'enforcement': 'aplicación',
  'automatically': 'automáticamente',
  'extended': 'extendido',
  'six': 'seis',
  'months': 'meses',
  'from': 'desde',
  'May': 'Mayo',
  'through': 'hasta',
  'November': 'Noviembre',
  'This': 'Esta',
  'extension': 'extensión',
  'allows': 'permite',
  'eligible': 'elegibles',
  'nationals': 'nacionales',
  'maintain': 'mantener',
  'their': 'su',
  'related': 'relacionada',
  'during': 'durante',
  'period': 'período'
};

// Helper function to translate individual words and phrases
const translatePhrase = (phrase: string): string => {
  // Direct translation lookup
  if (translations[phrase]) {
    return translations[phrase];
  }
  
  // Try case-insensitive lookup
  const lowerPhrase = phrase.toLowerCase();
  for (const [key, value] of Object.entries(translations)) {
    if (key.toLowerCase() === lowerPhrase) {
      return value;
    }
  }
  
  // Try partial matches for compound phrases
  let translatedPhrase = phrase;
  for (const [english, spanish] of Object.entries(translations)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translatedPhrase = translatedPhrase.replace(regex, spanish);
  }
  
  return translatedPhrase !== phrase ? translatedPhrase : phrase;
};

export const translateText = async (text: string, targetLanguage: 'es' | 'en'): Promise<string> => {
  if (targetLanguage === 'en') {
    return text;
  }

  // Check for direct translations first
  if (translations[text]) {
    return translations[text];
  }

  // Apply comprehensive translation - replace all known terms
  let result = text;
  
  // Apply all translation rules
  for (const [english, spanish] of Object.entries(translations)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, spanish);
  }
  
  // If any translations were made, return the result
  if (result !== text) {
    return result;
  }

  // For content that couldn't be translated, add translation note
  return `[Contenido en proceso de traducción] ${text}`;
};

export const translateCategory = (category: string): string => {
  return translations[category] || category;
};
