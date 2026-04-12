
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ChevronDown, ChevronUp, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const FAQ = () => {
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleQuestion = (index: string) => {
    setOpenQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      category: "General Information",
      questions: [
        {
          question: "What is ImmigrowNews?",
          answer: "ImmigrowNews is a specialized news aggregation platform focused on immigration news, policy updates, and visa information. We gather and curate immigration-related news from reliable sources to keep our users informed about changes that may affect their immigration journey."
        },
        {
          question: "Is ImmigrowNews free to use?",
          answer: "Yes, our basic news aggregation service is completely free. We also offer premium features for subscribers who want personalized news feeds, urgent alerts, and additional resources."
        },
        {
          question: "How often is the content updated?",
          answer: "Our content is updated multiple times daily. We have automated systems that fetch the latest immigration news at 6:00 AM and 2:00 PM Central Time, plus manual updates for breaking news and urgent announcements."
        },
        {
          question: "Can I trust the information on ImmigrowNews?",
          answer: "We aggregate news from reputable sources including government websites, established news organizations, and legal publications. However, we always recommend verifying important information with official government sources or consulting with qualified immigration attorneys."
        }
      ]
    },
    {
      category: "Legal and Immigration Advice",
      questions: [
        {
          question: "Do you provide legal advice?",
          answer: "No, ImmigrowNews is NOT a law firm and does not provide legal advice. We are a news aggregation service. All information is for educational purposes only. For legal advice specific to your situation, please consult with a qualified immigration attorney."
        },
        {
          question: "Can I rely on this information for my immigration case?",
          answer: "While we strive for accuracy, immigration laws change frequently and individual cases vary greatly. Always verify information with official government sources (USCIS, DOS, etc.) and consult with an immigration attorney before making important decisions."
        },
        {
          question: "Do you help with visa applications or immigration paperwork?",
          answer: "No, we do not assist with visa applications or immigration paperwork. We only provide news and information. For application assistance, contact a licensed immigration attorney or accredited representative."
        }
      ]
    },
    {
      category: "Content and Sources",
      questions: [
        {
          question: "Where do you get your news from?",
          answer: "We aggregate news from various reputable sources including USCIS, Department of State, major news outlets, legal publications, and other reliable immigration-focused websites. All content is properly attributed to its original source."
        },
        {
          question: "How do you ensure content accuracy?",
          answer: "We use automated systems to gather news from reliable sources and have editorial processes to verify important information. However, we encourage users to cross-reference information with official government sources for important decisions."
        },
        {
          question: "Can I submit news tips or suggestions?",
          answer: "Yes! We welcome news tips and suggestions from our community. Please email us at support@immigronews.com with relevant immigration news or policy updates you think our users should know about."
        },
        {
          question: "Do you have original content or just aggregated news?",
          answer: "We primarily aggregate and curate news from various sources, but we also create original summaries, analysis pieces, and resource guides to help our users better understand complex immigration topics."
        }
      ]
    },
    {
      category: "Subscription and Features",
      questions: [
        {
          question: "What's included in the premium subscription?",
          answer: "Premium subscribers receive personalized news feeds based on their immigration category, urgent breaking news alerts, early access to important updates, and additional resources like policy analysis and expert insights."
        },
        {
          question: "How do I subscribe to your newsletter?",
          answer: "You can subscribe to our newsletter by entering your email address in the subscription form on our homepage or any page footer. You'll receive weekly summaries of important immigration news."
        },
        {
          question: "Can I customize what types of news I receive?",
          answer: "Yes, premium subscribers can customize their news feed by selecting specific immigration categories (H-1B, Green Card, Citizenship, etc.) and setting preferences for the types of updates they want to receive."
        },
        {
          question: "How do I unsubscribe from emails?",
          answer: "Every email we send includes an unsubscribe link at the bottom. You can also contact us at support@immigronews.com to remove your email from our lists."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "I'm having trouble accessing the website. What should I do?",
          answer: "First, try refreshing the page or clearing your browser cache. If problems persist, please contact our support team at support@immigronews.com with details about the issue and your browser/device information."
        },
        {
          question: "Is the website mobile-friendly?",
          answer: "Yes, our website is fully responsive and optimized for mobile devices, tablets, and desktop computers. You can access all features from any device with an internet connection."
        },
        {
          question: "Do you have a mobile app?",
          answer: "Currently, we don't have a mobile app, but our website is mobile-optimized and works well on all devices. We're considering developing an app based on user demand."
        }
      ]
    },
    {
      category: "Privacy and Data",
      questions: [
        {
          question: "How do you protect my personal information?",
          answer: "We take privacy seriously and follow strict data protection practices. Please review our Privacy Policy for detailed information about how we collect, use, and protect your personal information."
        },
        {
          question: "Do you share my email address with third parties?",
          answer: "No, we do not sell, rent, or share your email address with third parties for marketing purposes. We only use your email to send you the content you've subscribed to receive."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Yes, you can request deletion of your account and associated data by contacting us at support@immigronews.com. We'll process your request in accordance with applicable privacy laws."
        }
      ]
    },
    {
      category: "Contact and Support",
      questions: [
        {
          question: "How can I contact ImmigrowNews?",
          answer: "You can reach us through multiple channels: email us at support@immigronews.com, use our contact form on the website, or connect with us on social media. We typically respond within 24-48 hours."
        },
        {
          question: "Do you offer customer support?",
          answer: "Yes, we provide email support for technical issues, subscription questions, and general inquiries. Premium subscribers receive priority support with faster response times."
        },
        {
          question: "Can I advertise on your website?",
          answer: "We do accept relevant advertising from immigration-related businesses and services. Please contact our advertising team at support@immigronews.com for more information about advertising opportunities."
        }
      ]
    }
  ];

  const filteredFaqData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen">
      <SEO
        title="Frequently Asked Questions - ImmigroNews"
        description="Find answers to common questions about ImmigroNews, our immigration news aggregation service, subscription options, and how to use our platform for immigration updates."
        keywords={['immigration FAQ', 'immigration news questions', 'ImmigroNews help', 'immigration platform FAQ', 'visa news questions']}
        url="https://immigronews.com/faq"
        canonicalUrl="https://immigronews.com/faq"
      />

      {/* FAQPage JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqData.flatMap(category =>
            category.questions.map(q => ({
              "@type": "Question",
              "name": q.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": q.answer
              }
            }))
          )
        })}
      </script>

      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <HelpCircle className="h-8 w-8 text-navy-600 mr-3" />
            <h1 className="text-3xl font-bold text-navy-800">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600 text-lg mb-6">
            Find answers to the most common questions about ImmigrowNews and our services.
          </p>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-base"
            />
          </div>
        </div>

        <div className="space-y-8">
          {filteredFaqData.map((category) => (
            <section key={category.category} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-navy-800 mb-6 border-b border-gray-200 pb-3">
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = `${category.category}-${questionIndex}`;
                  const isOpen = openQuestions.includes(globalIndex);
                  
                  return (
                    <div key={`${category.category}-${faq.question.slice(0, 30)}`} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleQuestion(globalIndex)}
                        className="w-full text-left p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-inset transition-colors duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          
          {filteredFaqData.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No questions found matching "{searchTerm}". Try a different search term.
              </p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <section className="bg-navy-50 rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold text-navy-800 mb-4">Still Have Questions?</h2>
          <p className="text-gray-700 mb-4">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-navy-600 hover:bg-navy-700 transition-colors duration-200"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@immigronews.com"
              className="inline-flex items-center justify-center px-6 py-3 border border-navy-600 text-base font-medium rounded-md text-navy-600 bg-white hover:bg-navy-50 transition-colors duration-200"
            >
              Email Us Directly
            </a>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default FAQ;
