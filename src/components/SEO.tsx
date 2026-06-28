
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  canonicalUrl?: string;
}

const SEO = ({
  title = 'ImmigroNews - Latest Immigration News, Visa Updates & Legal Help',
  description = 'Stay updated with breaking immigration news, visa policy changes, green card updates, and citizenship information. Get expert legal help and real-time alerts trusted by thousands.',
  keywords = ['immigration news', 'visa updates', 'green card news', 'citizenship process', 'immigration lawyer', 'USCIS updates', 'immigration policy'],
  image = '/lovable-uploads/eb1aea6b-9f1d-437a-867c-c5027cbaacd2.png',
  url = 'https://immigronews.com',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'ImmigroNews Editorial Team',
  section,
  tags = [],
  noindex = false,
  canonicalUrl
}: SEOProps) => {
  const siteTitle = 'ImmigroNews';
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;
  const keywordString = [...keywords, ...tags].join(', ');

  // Normalize URL: remove trailing slash and ensure non-www
  const normalizeUrl = (urlStr: string): string => {
    let normalized = urlStr.replace(/\/$/, ''); // Remove trailing slash
    normalized = normalized.replace('://www.', '://'); // Remove www
    return normalized;
  };

  const canonical = normalizeUrl(canonicalUrl || url);
  const normalizedUrl = normalizeUrl(url);
  // Always resolve relative image paths against the root domain, never the page URL,
  // so og:image doesn't include the page slug (e.g. /contact/lovable-uploads/...).
  const IMAGE_BASE = 'https://immigronews.com';
  const fullImageUrl = image.startsWith('http') ? image : `${IMAGE_BASE}${image}`;

  // Enhanced description for SEO
  const enhancedDescription = type === 'article' 
    ? `${description} Expert immigration guidance, step-by-step processes, and latest updates from trusted immigration professionals.`
    : description;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={enhancedDescription} />
      <meta name="keywords" content={keywordString} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonical} />
      
      {/* Enhanced SEO Meta Tags */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large'} />
      <meta name="bingbot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Content Classification */}
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="revisit-after" content="1 days" />
      <meta name="coverage" content="worldwide" />
      <meta name="target" content="all" />
      <meta name="audience" content="all" />
      <meta name="pagetype" content={type === 'article' ? 'article' : 'website'} />
      <meta name="category" content="Immigration, Legal Services, News" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={enhancedDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${fullTitle} - Immigration News & Legal Help`} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ImmigroNews" />
      <meta name="twitter:creator" content="@ImmigroNews" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={enhancedDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={`${fullTitle} - Immigration News & Legal Help`} />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
          <meta property="article:publisher" content="https://www.facebook.com/ImmigroNews" />
        </>
      )}
      
      {/* Additional SEO tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en-US" />
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      
      {/* DNS Prefetch and Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Organization and WebSite schemas are defined in index.html to avoid duplicates */}
    </Helmet>
  );
};

export default SEO;
