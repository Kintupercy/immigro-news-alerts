
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
  title = 'ImmigrowNews - Latest Immigration News, Visa Updates & Legal Help',
  description = 'Stay updated with breaking immigration news, visa policy changes, green card updates, and citizenship information. Get expert legal help and real-time alerts trusted by thousands.',
  keywords = ['immigration news', 'visa updates', 'green card news', 'citizenship process', 'immigration lawyer', 'USCIS updates', 'immigration policy'],
  image = 'https://immigronews.com/og-image.jpg',
  url = 'https://immigronews.com',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'ImmigrowNews Editorial Team',
  section,
  tags = [],
  noindex = false,
  canonicalUrl
}: SEOProps) => {
  const siteTitle = 'ImmigrowNews';
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;
  const keywordString = [...keywords, ...tags].join(', ');
  const canonical = canonicalUrl || url;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordString} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonical} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ImmigroNews" />
      <meta name="twitter:creator" content="@ImmigroNews" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Additional SEO tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en-US" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Structured Data - Breadcrumb */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://immigronews.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "News",
                "item": "https://immigronews.com/news"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": title,
                "item": url
              }
            ]
          })}
        </script>
      )}
      
      {/* Structured Data - Article (if applicable) */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": title,
            "description": description,
            "image": {
              "@type": "ImageObject",
              "url": image,
              "width": 1200,
              "height": 630
            },
            "url": url,
            "datePublished": publishedTime,
            "dateModified": modifiedTime || publishedTime,
            "author": {
              "@type": "Organization",
              "name": author,
              "url": "https://immigronews.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": siteTitle,
              "logo": {
                "@type": "ImageObject",
                "url": "https://immigronews.com/logo.png",
                "width": 512,
                "height": 512
              },
              "url": "https://immigronews.com"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": url
            },
            "articleSection": section || "Immigration News",
            "keywords": keywordString
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
