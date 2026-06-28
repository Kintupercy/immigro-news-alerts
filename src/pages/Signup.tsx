
import React from 'react';
import Header from '@/components/Header';
import SignupForm from '@/components/SignupForm';
import SEO from '@/components/SEO';

const Signup = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Subscribe to Free Immigration News Alerts | ImmigroNews"
        description="Subscribe free for real-time USCIS updates, visa policy changes, green card alerts, and breaking U.S. immigration news delivered straight to your inbox."
        keywords={['immigration news signup', 'USCIS email alerts', 'visa updates newsletter', 'green card alerts', 'free immigration alerts']}
        url="https://immigronews.com/signup"
        canonicalUrl="https://immigronews.com/signup"
        type="website"
      />
      <Header />
      <div className="py-8 sm:py-16 px-4 sm:px-0">
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;
