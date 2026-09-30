import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SecurityCard() {
  return (
    <div className="mt-[48px] bg-[#F5FAF5] border border-[#E1EAE2] rounded-[16px] p-[24px] flex items-start gap-4 shadow-[0_4px_18px_rgba(20,50,35,0.04)]">
      <div className="w-[48px] h-[48px] shrink-0 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#075C32]">
        <ShieldCheck size={24} strokeWidth={1.8} />
      </div>
      <div>
        <h4 className="text-[16px] font-bold text-[#102C22] mb-1">Your data is safe with us</h4>
        <p className="text-[14px] text-[#596A62] leading-snug">
          We use industry-leading security to protect<br />your information and privacy.
        </p>
      </div>
    </div>
  );
}
