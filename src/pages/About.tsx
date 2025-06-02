
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GraduationCap, Globe, Heart, Users, Target, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Immigro
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Born from personal experience, built with passion for helping fellow immigrants navigate their journey to the American Dream.
            </p>
          </div>

          {/* Founder's Story */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Heart className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            </div>
            
            <div className="prose prose-lg text-gray-700">
              <p className="mb-6">
                Immigro was founded by someone who has walked the same path as millions of international students and immigrants seeking to build their lives in the United States. As a former F1 student who successfully navigated the complex journey from international student to lawful permanent resident, I understand firsthand the challenges, uncertainties, and dreams that define the immigrant experience.
              </p>
              
              <p className="mb-6">
                My journey began like many others - with hopes, dreams, and a student visa. The path from F1 status to becoming a lawful immigrant was filled with countless questions, policy changes, and moments of uncertainty. I spent countless hours researching immigration news, policy updates, and trying to understand how changes would affect my future in America.
              </p>
              
              <p className="mb-6">
                It was during this journey that I realized how fragmented and overwhelming immigration information can be. Important updates were scattered across different government websites, buried in legal jargon, or lost in the noise of general news. Fellow international students and immigrants like myself were struggling to stay informed about the policies that directly impacted our lives.
              </p>
              
              <p>
                That's why I created Immigro - to be the centralized, reliable source of immigration news and updates that I wish I had during my own journey. Every feature, every update, and every piece of content is designed with the immigrant experience in mind, because I've lived it too.
              </p>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-emerald-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-700">
                To provide personalized, timely, and accurate immigration news and updates to help immigrants make informed decisions about their journey in the United States.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Globe className="w-6 h-6 text-emerald-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-700">
                A world where every immigrant has access to the information they need to successfully navigate their path to achieving their American Dream.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <Award className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Authenticity</h4>
                <p className="text-gray-700">
                  Built by immigrants, for immigrants. Every feature reflects real immigrant experiences and needs.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Accuracy</h4>
                <p className="text-gray-700">
                  We source information directly from official government sources and trusted news outlets.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Accessibility</h4>
                <p className="text-gray-700">
                  Complex immigration information made simple and easy to understand for everyone.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Community</h4>
                <p className="text-gray-700">
                  Building partnerships with vetted legal immigration experts in local communities to provide comprehensive support.
                </p>
              </div>
            </div>
          </div>

          {/* What We Offer */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Users className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <GraduationCap className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Personalized News
                </h4>
                <p className="text-gray-600">
                  Get news tailored to your specific immigration category and interests
                </p>
              </div>
              
              <div className="text-center">
                <Globe className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Official Sources
                </h4>
                <p className="text-gray-600">
                  Information directly from USCIS, DOS, and other government agencies
                </p>
              </div>
              
              <div className="text-center">
                <Heart className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Community Support & Legal Partnerships
                </h4>
                <p className="text-gray-600">
                  Partnership with vetted legal immigration experts in your local communities to provide comprehensive support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
