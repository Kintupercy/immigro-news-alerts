
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Sample blog posts for now - these would come from your CMS/database later
const blogPosts = [
  {
    id: 1,
    title: "Understanding the New H-1B Visa Changes for 2024",
    excerpt: "A comprehensive guide to the latest H-1B visa policy updates and what they mean for skilled workers and employers.",
    author: "ImmigrowNews Editorial Team",
    publishedAt: "2024-01-15",
    category: "Visa Updates",
    readTime: "5 min read",
    slug: "h1b-visa-changes-2024"
  },
  {
    id: 2,
    title: "Green Card Processing Times: What to Expect in 2024",
    excerpt: "Current processing times, delays, and tips for navigating the green card application process effectively.",
    author: "Immigration Expert",
    publishedAt: "2024-01-10",
    category: "Green Card",
    readTime: "8 min read",
    slug: "green-card-processing-times-2024"
  },
  {
    id: 3,
    title: "Complete Guide to Student Visa Applications",
    excerpt: "Everything international students need to know about F-1 visa applications, requirements, and common mistakes to avoid.",
    author: "Education Specialist",
    publishedAt: "2024-01-05",
    category: "Student Visas",
    readTime: "12 min read",
    slug: "student-visa-application-guide"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Immigration Blog - Expert Guides & Updates | ImmigrowNews"
        description="Expert immigration guides, visa tips, policy analysis, and practical advice for immigrants. Stay informed with our comprehensive immigration blog."
        keywords={[
          'immigration blog',
          'visa guides',
          'immigration tips',
          'green card advice',
          'citizenship guides',
          'immigration law updates',
          'visa application help',
          'immigration expert advice'
        ]}
        url="https://immigronews.com/blog"
      />
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-4">
            Immigration Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert guides, practical tips, and in-depth analysis to help you navigate 
            your immigration journey successfully.
          </p>
        </div>

        {/* Featured Article */}
        {blogPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-navy-800 mb-6">Featured Article</h2>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="secondary" className="bg-navy-100 text-navy-800">
                        {blogPosts[0].category}
                      </Badge>
                      <span className="text-sm text-gray-500">{blogPosts[0].readTime}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-navy-800 mb-3">
                      {blogPosts[0].title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-lg">
                      {blogPosts[0].excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {blogPosts[0].author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(blogPosts[0].publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="outline" className="group">
                        Read Article
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-navy-800 mb-6">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-navy-800 line-clamp-2">
                    {post.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center gap-1 mb-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-navy-600 hover:text-navy-800">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-navy-800 mb-6 text-center">
            Explore by Category
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Visa Updates",
              "Green Card",
              "Student Visas", 
              "Work Permits",
              "Citizenship",
              "Policy Changes",
              "Legal Guides",
              "Success Stories"
            ].map((category) => (
              <Button
                key={category}
                variant="outline"
                className="justify-start h-auto p-4 text-left hover:bg-navy-50 hover:border-navy-300"
              >
                <div>
                  <div className="font-medium text-navy-800">{category}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.floor(Math.random() * 20) + 5} articles
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-navy-800 text-white rounded-lg p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Stay Updated with Immigration Insights
          </h2>
          <p className="text-navy-200 mb-6 max-w-2xl mx-auto">
            Get the latest immigration guides, policy updates, and expert tips 
            delivered directly to your inbox.
          </p>
          <Button size="lg" className="bg-white text-navy-800 hover:bg-gray-100">
            Subscribe to Newsletter
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Blog;
