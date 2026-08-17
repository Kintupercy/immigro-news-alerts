import { useQuery } from "@tanstack/react-query";
import { useParams, Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Clock, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

interface NewsArticleRecord {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  source_url: string | null;
  published_at: string;
  updated_at?: string;
  is_urgent: boolean;
  tags: string[] | null;
}

const SITE = "https://immigronews.com";

function cleanText(value: string | null | undefined) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function paragraphs(value: string) {
  return value.split(/\n\s*\n|\r\n\s*\r\n/).map((p) => cleanText(p)).filter(Boolean);
}

const NewsArticle = () => {
  const { id } = useParams();
  const { data: article, isLoading, error } = useQuery({
    queryKey: ["news-article-page", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("immigration_news")
        .select("id,title,content,summary,category,source_url,published_at,updated_at,is_urgent,tags")
        .eq("id", id)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data as NewsArticleRecord;
    },
  });

  if (isLoading) {
    return <><Header /><main className="container mx-auto max-w-3xl px-4 py-16"><div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" /><div className="mt-6 space-y-3">{[1, 2, 3, 4].map((n) => <div key={n} className="h-4 animate-pulse rounded bg-gray-100" />)}</div></main><Footer /></>;
  }

  if (error || !article) return <Navigate to="/news" replace />;

  const url = `${SITE}/news/${article.id}`;
  const description = cleanText(article.summary || article.content).slice(0, 155);
  const body = paragraphs(article.content);
  const modified = article.updated_at || article.published_at;
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description,
    url,
    datePublished: article.published_at,
    dateModified: modified,
    author: { "@type": "Organization", name: "ImmigroNews", url: SITE },
    publisher: { "@type": "Organization", name: "ImmigroNews", url: SITE, logo: { "@type": "ImageObject", url: `${SITE}/logo.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: article.category,
    keywords: (article.tags || []).join(", "),
    isAccessibleForFree: true,
    inLanguage: "en-US",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={article.title}
        description={description}
        keywords={["immigration news", "USCIS updates", article.category, ...(article.tags || [])]}
        url={url}
        canonicalUrl={url}
        type="article"
        publishedTime={article.published_at}
        modifiedTime={modified}
        section={article.category}
        tags={article.tags || []}
      />
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8 lg:py-12">
        <Link to="/news" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"><ArrowLeft className="h-4 w-4" /> All immigration news</Link>
        <article>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {article.is_urgent && <Badge variant="destructive"><ShieldAlert className="mr-1 h-3 w-3" /> Urgent</Badge>}
            <Badge variant="secondary">{article.category}</Badge>
            <span className="flex items-center gap-1 text-sm text-gray-500"><Clock className="h-4 w-4" /> {format(new Date(article.published_at), "MMMM d, yyyy")}</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{article.title}</h1>
          {article.summary && <p className="mt-5 text-xl leading-relaxed text-gray-600">{cleanText(article.summary)}</p>}
          <div className="prose prose-lg mt-8 max-w-none text-gray-700">
            {body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          {article.source_url && <div className="mt-8 border-t pt-5"><p className="text-sm text-gray-600">Source: ImmigroNews aggregates and links to the original reporting.</p><Button asChild className="mt-3"><a href={article.source_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Read original source</a></Button></div>}
          <p className="mt-8 border-t pt-5 text-sm text-gray-500">This is general immigration news, not legal advice. For advice about your situation, consult a licensed immigration attorney.</p>
        </article>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </main>
      <Footer />
    </div>
  );
};

export default NewsArticle;

// Keep this export referenced in the route-level module graph for prerender builds.
export { cleanText };
