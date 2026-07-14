import { useMemo } from 'react';
import { isOfficialGovArticle } from '@/utils/officialSources';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  source_url: string | null;
  published_at: string;
  is_urgent: boolean;
  tags: string[] | null;
}

export const useNewsFiltering = (
  allArticles: NewsArticle[],
  selectedCategory: string,
  searchTerm: string
) => {
  const filteredArticles = useMemo(() => {
    let filtered = allArticles;

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'breaking-news') {
        filtered = filtered.filter(article => isOfficialGovArticle(article));
      } else {
        // Enhanced filtering for all categories
        filtered = filtered.filter(article => {
          // Direct category match
          if (article.category === selectedCategory) return true;
          
          // Define keywords for each category
          const categoryKeywords: Record<string, string[]> = {
            'f1-student-visa': ['f-1', 'f1', 'student visa', 'international student', 'university', 'college', 'opt', 'cpt', 'stem', 'academic', 'optional practical training', 'curricular practical training'],
            'h1b-visa': ['h-1b', 'h1b', 'specialty occupation', 'skilled worker', 'professional', 'cap', 'lottery'],
            'green-card': ['green card', 'permanent residence', 'permanent resident', 'pr', 'adjustment of status', 'aos', 'priority date', 'perm'],
            'citizenship': ['citizenship', 'naturalization', 'naturalize', 'citizen', 'civics test', 'oath ceremony', 'n-400'],
            'employment-based': ['employment based', 'work visa', 'work permit', 'ead', 'employment authorization', 'labor certification', 'eb-1', 'eb-2', 'eb-3'],
            'family-based': ['family based', 'family reunification', 'spouse visa', 'parent visa', 'sibling visa', 'fiancé', 'k-1', 'ir-1', 'f1', 'f2', 'f3', 'f4'],
            'daca': ['daca', 'deferred action', 'childhood arrivals', 'dreamer', 'dreamers'],
            'tps': ['tps', 'temporary protected status', 'protected status'],
            'refugees-asylees': ['refugee', 'asylum', 'asylee', 'persecution', 'withholding of removal'],
            'l1-visa': ['l-1', 'l1', 'intracompany transfer', 'multinational company', 'manager', 'executive'],
            'eb5-investor-visa': ['eb-5', 'eb5', 'investor visa', 'investment', 'regional center', 'job creation'],
            'investors': ['investor', 'e-1', 'e-2', 'treaty trader', 'treaty investor', 'entrepreneur'],
            'religious-workers': ['r-1', 'religious worker', 'minister', 'missionary', 'religious occupation'],
            'temporary-visitors': ['b-1', 'b-2', 'tourist', 'visitor', 'business visitor', 'tourism'],
            'specialty-occupations': ['nafta', 'usmca', 'tn', 'specialty occupation', 'canadian', 'mexican'],
            'exchange-visitors': ['j-1', 'exchange visitor', 'cultural exchange', 'au pair', 'intern', 'trainee'],
            'undocumented': ['undocumented', 'mixed status', 'deportation', 'removal proceedings', 'ice raid']
          };

          const keywords = categoryKeywords[selectedCategory] || [];
          
          // Check tags
          if (article.tags && article.tags.some(tag => 
            keywords.some(keyword => tag.toLowerCase().includes(keyword.toLowerCase())))) {
            return true;
          }
          
          // Check title
          if (keywords.some(keyword => article.title.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          // Check content
          if (keywords.some(keyword => article.content.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          // Check summary
          if (article.summary && keywords.some(keyword => article.summary.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          return false;
        });
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ensure articles are always sorted by published_at (newest first)
    return filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [allArticles, selectedCategory, searchTerm]);

  // For the "All" tab, show all articles regardless of category filter (but respect search filter)
  const allArticlesForAllTab = useMemo(() => {
    let allForTab = allArticles;
    
    // Only filter by search term, ignore category filter
    if (searchTerm) {
      allForTab = allForTab.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return allForTab.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [allArticles, searchTerm]);

  // Mutually exclusive tab filtering:
  // Urgent = immediate-impact policy changes (is_urgent flag from the pipeline)
  // Breaking = official government sources (USCIS, DHS/ICE, White House, Federal Register)
  // Regular = everything else
  const urgentArticles = useMemo(() =>
    filteredArticles.filter(article => article.is_urgent),
    [filteredArticles]
  );

  const breakingNewsArticles = useMemo(() =>
    filteredArticles.filter(article => isOfficialGovArticle(article) && !article.is_urgent),
    [filteredArticles]
  );

  const regularArticles = useMemo(() =>
    filteredArticles.filter(article => !article.is_urgent && !isOfficialGovArticle(article)),
    [filteredArticles]
  );

  return {
    filteredArticles,
    allArticlesForAllTab,
    urgentArticles,
    breakingNewsArticles,
    regularArticles
  };
};