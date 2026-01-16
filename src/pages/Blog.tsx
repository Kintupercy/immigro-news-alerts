import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Search, BookOpen, TrendingUp, User } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  published_at: string;
  read_time: string;
  featured: boolean;
  meta_description: string;
  keywords: string[];
}

const ARTICLES_PER_PAGE = 6;

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as BlogArticle[];
    },
  });

  const filteredArticles = articles?.filter(article => {
    const matchesSearch = searchTerm === "" || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const featuredArticles = articles?.filter(article => article.featured) || [];
  const categories = [...new Set(articles?.map(article => article.category) || [])];

  // Pagination calculations
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of articles section
    document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderPaginationNumbers = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SEO 
          title="Immigration Blog - Expert Guides & Resources | ImmigroNews"
          description="Comprehensive immigration guides and expert advice. Learn about visa applications, green card processes, citizenship requirements, and immigration law updates from trusted professionals."
          keywords={[
            'immigration blog', 'immigration guides', 'visa help', 'green card advice', 
            'citizenship tips', 'immigration law', 'USCIS guides', 'immigration attorney advice',
            'visa application process', 'green card timeline', 'citizenship test preparation',
            'immigration forms help', 'H1B visa guide', 'family immigration', 'work permits'
          ]}
          url="https://immigronews.com/blog"
          type="website"
        />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Blog</h1>
            <p className="text-gray-600">Unable to load blog articles. Please try again later.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO 
        title="Immigration Blog - Expert Guides & Step-by-Step Instructions | ImmigroNews"
        description="Access comprehensive immigration guides, expert advice, and step-by-step instructions for visa applications, green card processes, citizenship requirements, and immigration law updates. Trusted by thousands of immigrants worldwide."
        keywords={[
          'immigration blog', 'immigration guides', 'visa application help', 'green card advice', 
          'citizenship tips', 'immigration law updates', 'USCIS guides', 'immigration attorney advice',
          'visa processing times', 'green card timeline', 'citizenship test preparation',
          'immigration forms assistance', 'H1B visa guide', 'family immigration process', 'work permits',
          'student visa guide', 'tourist visa tips', 'immigration interview preparation',
          'immigration document checklist', 'USCIS case status', 'immigration news updates'
        ]}
        url="https://immigronews.com/blog"
        type="website"
        canonicalUrl="https://immigronews.com/blog"
      />
      <Header />
      
      {/* Enhanced structured data for blog */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "ImmigroNews Immigration Blog",
          "description": "Expert immigration guides and resources for visa applications, green cards, and citizenship processes",
          "url": "https://immigronews.com/blog",
          "publisher": {
            "@type": "Organization",
            "name": "ImmigroNews",
            "logo": "https://immigronews.com/logo.png"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://immigronews.com/blog"
          },
          "inLanguage": "en-US"
        })}
      </script>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-800 to-navy-900 text-white py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold mb-4 lg:mb-6">
              Immigration Blog & Expert Resources
            </h1>
            <p className="text-lg md:text-xl text-cream-200 mb-6 lg:mb-8">
              Comprehensive immigration guides, step-by-step instructions, and expert advice to help you navigate your immigration journey with confidence. Trusted by thousands worldwide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 text-cream-300">
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                <span>{articles?.length || 0} Articles</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span>Expert Advice</span>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                <span>Immigration Attorneys</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Central Search Section */}
      <section className="bg-white border-b border-gray-200 py-8 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-gray-900 mb-3">
                Find Immigration Guides & Resources
              </h2>
              <p className="text-gray-600 text-base lg:text-lg">
                Search through our comprehensive library of immigration articles, guides, and expert advice
              </p>
            </div>
            
            {/* Central Search Box */}
            <div className="bg-gray-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 z-10" />
                <Input
                  type="text"
                  placeholder="Search immigration articles, visa guides, green card processes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-14 text-base lg:text-lg rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white shadow-sm"
                />
              </div>
              
              {/* Category Filter Pills */}
              <div className="flex flex-wrap justify-center gap-2 lg:gap-3">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  size="sm"
                  className="h-10 px-4 rounded-full bg-white border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    size="sm"
                    className="h-10 px-4 rounded-full bg-white border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              {/* Search Stats */}
              {(searchTerm || selectedCategory !== "all") && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Found <span className="font-semibold text-emerald-600">{filteredArticles.length}</span> articles
                    {searchTerm && <span> matching "{searchTerm}"</span>}
                    {selectedCategory !== "all" && <span> in {selectedCategory}</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-8 lg:mb-12">
            <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-gray-900 mb-6 lg:mb-8">Featured Immigration Guides</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-emerald-600">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 w-fit">
                        {article.category}
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 w-fit">
                        Featured
                      </Badge>
                    </div>
                    <CardTitle className="text-lg lg:text-xl font-playfair leading-tight hover:text-emerald-600 transition-colors">
                      <Link to={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm lg:text-base">
                      {article.excerpt}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 mb-4 gap-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.read_time}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(article.published_at)}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/blog/${article.slug}`}>
                          Read More
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section id="articles-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-gray-900">
              {searchTerm || selectedCategory !== "all" ? "Search Results" : "Latest Immigration Guides"}
            </h2>
            {filteredArticles.length > 0 && (
              <p className="text-gray-600 text-sm lg:text-base">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
              </p>
            )}
          </div>
          
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search terms or browse all categories.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {currentArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                        <Badge variant="secondary" className="w-fit">
                          {article.category}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {article.read_time}
                        </div>
                      </div>
                      <CardTitle className="text-base lg:text-lg font-playfair leading-tight hover:text-emerald-600 transition-colors">
                        <Link to={`/blog/${article.slug}`}>
                          {article.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm lg:text-base">
                        {article.excerpt}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 mb-4 gap-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {article.author}
                        </div>
                        <span>
                          {formatDate(article.published_at)}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to={`/blog/${article.slug}`}>
                          Read Full Article
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination>
                    <PaginationContent className="flex-wrap gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {renderPaginationNumbers()}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </section>

        {/* SEO Content Section */}
        <section className="mt-12 lg:mt-16 bg-gray-50 rounded-lg p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl lg:text-2xl font-playfair font-bold text-gray-900 mb-4 lg:mb-6">
              Your Trusted Source for U.S. Immigration Guidance
            </h2>
            <div className="prose prose-sm lg:prose-lg text-gray-700">
              <p className="mb-4">
                Navigate the complex world of U.S. immigration with confidence using our comprehensive guides and expert resources. 
                Our immigration blog covers everything from basic visa applications to advanced green card processes, citizenship requirements, 
                and the latest immigration law updates. Each article is written by immigration professionals and regularly updated to reflect current laws and procedures.
              </p>
              <p className="mb-4">
                Whether you're applying for your first visa, adjusting your status, preparing for your citizenship interview, or helping a family member immigrate, 
                our step-by-step guides provide the clarity and direction you need. We break down complex immigration processes into manageable steps, 
                helping thousands of immigrants achieve their American dreams.
              </p>
              <p>
                <strong>Popular Immigration Topics:</strong> USCIS case status tracking, green card processing times, marriage-based interviews, 
                work authorization (EAD), visa overstays, citizenship applications, essential document preparation, H1B visa process, 
                family-based immigration, student visas (F-1), tourist visas (B-2), and immigration interview preparation.
              </p>
              <p>
                <strong>Expert Resources:</strong> Immigration forms guidance, document checklists, processing time updates, 
                policy changes analysis, and practical tips from experienced immigration attorneys. Stay informed with real-time updates 
                and expert insights that matter to your immigration journey.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
