
import React from 'react';
import Header from '@/components/Header';
import SignupForm from '@/components/SignupForm';

const Signup = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-16">
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;
