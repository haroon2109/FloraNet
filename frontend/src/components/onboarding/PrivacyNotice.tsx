import React from 'react';
import { Lock } from 'lucide-react';

export default function PrivacyNotice() {
  return (
    <div className="w-full bg-[#EAF5EC] rounded-[16px] px-6 py-5 flex flex-col lg:flex-row items-center justify-between gap-6 mt-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 shrink-0 rounded-[12px] border-[1.5px] border-[#075C32] flex items-center justify-center bg-[#EAF5EC] text-[#075C32]">
          <Lock size={24} strokeWidth={1.8} />
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-[#102A20]">Your privacy matters</h4>
          <p className="text-[14px] text-[#5B6A63] leading-snug mt-0.5">
            We use industry-leading security to keep your<br className="hidden md:block" /> information safe and secure.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-[34px] h-[34px] rounded-full border border-dashed border-[#075C32]/40 flex items-center justify-center text-[#075C32]">
             <span className="text-[9px] font-bold">ISO</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#102A20] leading-none">ISO</span>
            <span className="text-[10px] text-[#5B6A63]">27001</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-[34px] h-[34px] rounded-full border border-dashed border-[#075C32]/40 flex items-center justify-center text-[#075C32]">
             <Lock size={14} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#102A20] leading-none">GDPR</span>
            <span className="text-[10px] text-[#5B6A63]">Compliant</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-[34px] h-[34px] rounded-full border border-dashed border-[#075C32]/40 flex items-center justify-center text-[#075C32]">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#102A20] leading-none">256-bit</span>
            <span className="text-[10px] text-[#5B6A63]">Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
