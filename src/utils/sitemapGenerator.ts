
import { supabase } from '@/integrations/supabase/client';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = 'https://immigro.app'; // Replace with your actual domain
  const urls: SitemapUrl[] = [];

  // Static pages
  const staticPages = [
    { loc: '/', priority: 1.0, changefreq: 'daily' as const },
    { loc: '/news', priority: 0.9, changefreq: 'hourly' as const },
    { loc: '/resources', priority: 0.8, changefreq: 'weekly' as const },
    { loc: '/about', priority: 0.7, changefreq: 'monthly' as const },
    { loc: '/contact', priority: 0.7, changefreq: 'monthly' as const },
    { loc: '/auth', priority: 0.6, changefreq: 'monthly' as const },
    { loc: '/signup', priority: 0.6, changefreq: 'monthly' as const },
    { loc: '/privacy', priority: 0.5, changefreq: 'yearly' as const },
    { loc: '/terms', priority: 0.5, changefreq: 'yearly' as const },
  ];

  urls.push(...staticPages.map(page => ({
    ...page,
    loc: `${baseUrl}${page.loc}`,
    lastmod: new Date().toISOString().split('T')[0]
  })));

  try {
    // Fetch news articles for sitemap
    const { data: articles } = await supabase
      .from('immigration_news')
      .select('id, title, updated_at, category')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (articles) {
      articles.forEach(article => {
        urls.push({
          loc: `${baseUrl}/news/${article.id}`,
          lastmod: new Date(article.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.8
        });
      });
    }

    // Fetch categories for sitemap
    const { data: categories } = await supabase
      .from('immigration_categories')
      .select('slug, name')
      .order('name');

    if (categories) {
      categories.forEach(category => {
        urls.push({
          loc: `${baseUrl}/news/category/${category.slug}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'daily',
          priority: 0.7
        });
      });
    }
  } catch (error) {
    console.error('Error fetching data for sitemap:', error);
  }

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

export const generateRobotsTxt = (): string => {
  const baseUrl = 'https://immigro.app'; // Replace with your actual domain
  
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin areas
Disallow: /admin/
Disallow: /dashboard/

# Allow important pages
Allow: /news/
Allow: /resources/
Allow: /about/
Allow: /contact/`;
};
