import React from "react";
import LoginForm from "./LoginForm";
import LoginIllustration from "./LoginIllustration";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#F7FAF7] flex items-center justify-center p-0 md:p-6 lg:p-8" style={{ fontFamily: 'Inter, Geist Sans, sans-serif' }}>
      {/* Main Container */}
      <div className="w-full max-w-[1380px] min-h-screen md:min-h-[90vh] flex flex-col md:flex-row bg-white md:rounded-[22px] overflow-hidden md:border border-[#E0E8E2] shadow-[0_8px_30px_rgba(20,50,35,0.06)] relative">
        
        {/* Left Auth Panel — ~49% */}
        <div className="w-full md:w-[49%] flex flex-col bg-white relative z-10">
          <LoginForm />
        </div>

        {/* Right Illustration Panel — ~51% */}
        <div className="w-full md:w-[51%] relative h-[500px] md:h-auto overflow-hidden">
          <LoginIllustration />
        </div>

      </div>
    </div>
  );
}
