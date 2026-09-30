"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { settingsPageData } from '@/data/settingsData';
import { useFarm } from '@/context/farmContext';

export default function AccountSummary() {
  const { accountSummary } = settingsPageData;
  const { userProfile } = useFarm();

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <h3 className="text-[15px] font-bold text-[#102A20] mb-3 px-0.5">Account Summary</h3>

      {/* User Info */}
      <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1]">
        <div className="relative w-11 h-11 rounded-full bg-[#EAF5EC] overflow-hidden border border-[#D5E5D8] shrink-0">
          <Image 
            src={userProfile.avatarUrl} 
            alt={userProfile.fullName} 
            fill 
            className="object-cover"
            sizes="44px"
            onError={(e) => {
              const target = e.target as HTMLElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[14px] font-bold text-[#102A20] leading-tight truncate">
            {userProfile.fullName}
          </h4>
          <p className="text-[11px] font-semibold text-[#52645D] truncate mt-0.5">
            {userProfile.farmName}
          </p>
          <span className="text-[10px] text-[#889B91] block mt-0.5">
            {userProfile.memberSince}
          </span>
        </div>
      </div>

      {/* Plan Row */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E1E8E2] mb-4">
        <div>
          <span className="text-[11px] font-medium text-[#52645D] block">Plan</span>
          <span className="text-[13px] font-bold text-[#168A45]">{accountSummary.plan}</span>
        </div>
        <Link 
          href="/settings" 
          className="px-3 py-1 bg-white border border-[#E1E7E3] hover:bg-[#F5F9F6] text-[12px] font-bold text-[#102A20] rounded-lg transition-colors shadow-xs"
        >
          Upgrade
        </Link>
      </div>

      {/* Statistics */}
      <div className="space-y-2 text-[12px] pt-1 border-t border-[#F0F4F1]">
        <div className="flex justify-between py-1">
          <span className="text-[#52645D] font-medium">Fields</span>
          <span className="font-bold text-[#102A20]">{accountSummary.fieldsCount}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#52645D] font-medium">Total Area</span>
          <span className="font-bold text-[#102A20]">{accountSummary.totalArea}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#52645D] font-medium">Crops Grown</span>
          <span className="font-bold text-[#102A20]">{accountSummary.cropsGrownCount} types</span>
        </div>
      </div>

    </div>
  );
}
