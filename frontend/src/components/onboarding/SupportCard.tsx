import React from 'react';
import { Headphones } from 'lucide-react';
import Link from 'next/link';

export default function SupportCard() {
  return (
    <div className="mt-[32px] w-full bg-[#F5F9F5] border border-[#E1EAE2] rounded-[16px] px-6 py-5 flex items-center gap-5">
      <div className="w-[48px] h-[48px] shrink-0 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#075C32]">
        <Headphones size={24} strokeWidth={1.8} />
      </div>
      <div className="flex-1">
        <h4 className="text-[15px] font-bold text-[#102A20] mb-1">Need help?</h4>
        <p className="text-[14px] text-[#5B6A63] leading-snug">
          Our onboarding support team is here to help you<br className="hidden sm:block" /> set up your farm profile.
        </p>
        <Link href="/support" className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#075C32] mt-2 hover:underline">
          Contact Support <span className="text-[16px]">→</span>
        </Link>
      </div>
    </div>
  );
}
