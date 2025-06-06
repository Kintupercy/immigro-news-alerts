
import { supabase } from '@/integrations/supabase/client';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = 'https://immigronews.com';
  const urls: SitemapUrl[] = [];

  // Static pages with SEO-optimized priorities
  const staticPages = [
    { loc: '/', priority: 1.0, changefreq: 'daily' as const },
    { loc: '/news', priority: 0.9, changefreq: 'hourly' as const },
    { loc: '/resources', priority: 0.8, changefreq: 'weekly' as const },
    { loc: '/about', priority: 0.7, changefreq: 'monthly' as const },
    { loc: '/contact', priority: 0.7, changefreq: 'monthly' as const },
    { loc: '/auth', priority: 0.5, changefreq: 'monthly' as const },
    { loc: '/signup', priority: 0.6, changefreq: 'monthly' as const },
    { loc: '/privacy', priority: 0.4, changefreq: 'yearly' as const },
    { loc: '/terms', priority: 0.4, changefreq: 'yearly' as const },
  ];

  urls.push(...staticPages.map(page => ({
    ...page,
    loc: `${baseUrl}${page.loc}`,
    lastmod: new Date().toISOString().split('T')[0]
  })));

  try {
    // Fetch news articles for sitemap - prioritize recent content
    const { data: articles } = await supabase
      .from('immigration_news')
      .select('id, title, updated_at, created_at, category')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(1000); // Limit for performance

    if (articles) {
      articles.forEach((article, index) => {
        const daysSinceUpdate = Math.floor((Date.now() - new Date(article.updated_at).getTime()) / (1000 * 60 * 60 * 24));
        
        // Higher priority for recent articles
        let priority = 0.8;
        if (daysSinceUpdate <= 1) priority = 0.9;
        else if (daysSinceUpdate <= 7) priority = 0.8;
        else if (daysSinceUpdate <= 30) priority = 0.7;
        else priority = 0.6;

        // Frequency based on recency
        let changefreq: 'daily' | 'weekly' | 'monthly' = 'weekly';
        if (daysSinceUpdate <= 7) changefreq = 'daily';
        else if (daysSinceUpdate <= 30) changefreq = 'weekly';
        else changefreq = 'monthly';

        urls.push({
          loc: `${baseUrl}/news/${article.id}`,
          lastmod: new Date(article.updated_at).toISOString().split('T')[0],
          changefreq,
          priority
        });
      });
    }

    // Fetch categories for sitemap
    const { data: categories } = await supabase
      .from('immigration_categories')
      .select('slug, name, created_at')
      .order('name');

    if (categories) {
      categories.forEach(category => {
        urls.push({
          loc: `${baseUrl}/news/category/${category.slug}`,
          lastmod: new Date(category.created_at).toISOString().split('T')[0],
          changefreq: 'daily',
          priority: 0.75
        });
      });
    }

    // Fetch blog articles for sitemap - enhanced cross-referencing
    const { data: blogArticles } = await supabase
      .from('blog_articles')
      .select('slug, updated_at, created_at, category, featured')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(500); // Include blog articles in sitemap

    if (blogArticles) {
      blogArticles.forEach((article, index) => {
        const daysSinceUpdate = Math.floor((Date.now() - new Date(article.updated_at).getTime()) / (1000 * 60 * 60 * 24));
        
        // Higher priority for recent and featured blog articles
        let priority = 0.7;
        if (article.featured) priority = 0.8;
        if (daysSinceUpdate <= 7) priority = 0.8;
        else if (daysSinceUpdate <= 30) priority = 0.75;
        else priority = 0.7;

        // Frequency based on recency and category importance
        let changefreq: 'daily' | 'weekly' | 'monthly' = 'weekly';
        if (daysSinceUpdate <= 7) changefreq = 'daily';
        else if (daysSinceUpdate <= 30) changefreq = 'weekly';
        else changefreq = 'monthly';

        urls.push({
          loc: `${baseUrl}/blog/${article.slug}`,
          lastmod: new Date(article.updated_at).toISOString().split('T')[0],
          changefreq,
          priority
        });
      });
    }

    // Add important immigration-related pages
    const immigrationPages = [
      { path: '/blog', priority: 0.85 },
      { path: '/visa-updates', priority: 0.85 },
      { path: '/green-card-news', priority: 0.85 },
      { path: '/citizenship-updates', priority: 0.85 },
      { path: '/policy-changes', priority: 0.85 }
    ];

    immigrationPages.forEach(page => {
      urls.push({
        loc: `${baseUrl}${page.path}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: page.priority
      });
    });

  } catch (error) {
    console.error('Error fetching data for sitemap:', error);
  }

  // Generate XML sitemap with proper encoding
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
                           http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority.toFixed(1)}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Helper function to escape XML characters
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const generateRobotsTxt = (): string => {
  const baseUrl = 'https://immigronews.com';
  
  return `# Robots.txt for ImmigrowNews - Immigration News Platform

User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: *
Allow: /
Crawl-delay: 2

# Explicitly allow important content for SEO
Allow: /news/
Allow: /resources/
Allow: /about/
Allow: /contact/
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.jpeg
Allow: /*.gif
Allow: /*.svg
Allow: /*.webp

# Disallow admin and user-specific areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /auth/
Disallow: /signup/
Disallow: /email-verification/
Disallow: /password-reset/
Disallow: /payment/
Disallow: /*?*utm_source=
Disallow: /*?*utm_medium=
Disallow: /*?*utm_campaign=
Disallow: /*?*fbclid=
Disallow: /*?*gclid=

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml`;
};

// Generate news sitemap for Google News
export const generateNewsSitemap = async (): Promise<string> => {
  const baseUrl = 'https://immigronews.com';
  
  try {
    // Get recent news articles (last 2 days for Google News)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const { data: recentArticles } = await supabase
      .from('immigration_news')
      .select('id, title, created_at, category, summary')
      .eq('status', 'published')
      .gte('created_at', twoDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (!recentArticles || recentArticles.length === 0) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;
    }

    const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentArticles.map(article => `  <url>
    <loc>${baseUrl}/news/${article.id}</loc>
    <news:news>
      <news:publication>
        <news:name>ImmigrowNews</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(article.created_at).toISOString()}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
      <news:keywords>immigration, visa, ${article.category || 'news'}</news:keywords>
    </news:news>
  </url>`).join('\n')}
</urlset>`;

    return newsSitemap;
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;
  }
};
