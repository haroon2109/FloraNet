"use client";

import React, { useState } from "react";
import { useToast } from "@/context/toastContext";
import { Loader2 } from "lucide-react";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <path fill="#f25022" d="M1 1h9v9H1z"/>
    <path fill="#00a4ef" d="M1 11h9v9H1z"/>
    <path fill="#7fba00" d="M11 1h9v9h-9z"/>
    <path fill="#ffb900" d="M11 11h9v9h-9z"/>
  </svg>
);

export default function SocialSignupButtons() {
  const { showToast } = useToast();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthSignup = (provider: 'Google' | 'Microsoft') => {
    // Single sign-on is not wired in this deployment. We surface that honestly
    // instead of minting a demo identity — no fake session is ever created.
    setLoadingProvider(provider);
    showToast(`${provider} sign-in is not configured in this deployment — please continue with work email.`, 'warning');
    setLoadingProvider(null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-col sm:flex-row gap-[16px] mb-[28px]">
        <button 
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleOAuthSignup('Google')}
          className="flex-1 flex items-center justify-center gap-3 bg-white border border-[#DDE6DF] hover:border-[#168A45] rounded-[10px] h-[52px] text-[15px] font-medium text-[#102C22] hover:bg-[#F4FAF6] transition-all cursor-pointer shadow-2xs disabled:opacity-50"
        >
          {loadingProvider === 'Google' ? (
            <Loader2 size={20} className="animate-spin text-[#4285F4]" />
          ) : (
            <GoogleIcon />
          )}
          <span>Continue with Google</span>
        </button>

        <button 
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleOAuthSignup('Microsoft')}
          className="flex-1 flex items-center justify-center gap-3 bg-white border border-[#DDE6DF] hover:border-[#168A45] rounded-[10px] h-[52px] text-[15px] font-medium text-[#102C22] hover:bg-[#F4FAF6] transition-all cursor-pointer shadow-2xs disabled:opacity-50"
        >
          {loadingProvider === 'Microsoft' ? (
            <Loader2 size={20} className="animate-spin text-[#00a4ef]" />
          ) : (
            <MicrosoftIcon />
          )}
          <span>Continue with Microsoft</span>
        </button>
      </div>

      <div className="w-full flex items-center gap-4 mb-[28px]">
        <div className="flex-1 h-[1px] bg-[#DDE6DF]"></div>
        <span className="text-[13.5px] font-medium text-[#596A62]">or sign up with work email</span>
        <div className="flex-1 h-[1px] bg-[#DDE6DF]"></div>
      </div>
    </div>
  );
}
