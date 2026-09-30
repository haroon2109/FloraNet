import React from 'react';
import SignupForm from './SignupForm';
import SignupIllustration from './SignupIllustration';

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full bg-[#F7FAF7] flex items-center justify-center p-0 md:p-6 lg:p-8">
      {/* Main Container */}
      <div className="w-full max-w-[1380px] min-h-screen md:min-h-[90vh] flex flex-col lg:flex-row bg-white md:rounded-[22px] overflow-hidden md:border border-[#E0E8E2] shadow-[0_8px_30px_rgba(20,50,35,0.06)]">

        {/* Left Panel: Form */}
        <div className="w-full lg:w-[50%] flex flex-col bg-white relative z-10">
          <SignupForm />
        </div>

        {/* Right Panel: Illustration (Hidden on small mobile screens to prevent layout bloat) */}
        <div className="hidden lg:block lg:w-[50%] relative overflow-hidden bg-[#C8DCC8]">
          <SignupIllustration />
        </div>

      </div>
    </div>
  );
}
