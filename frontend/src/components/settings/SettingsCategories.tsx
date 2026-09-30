"use client";

import React from 'react';
import Link from 'next/link';
import { User, House, LayoutGrid, Bell, SlidersHorizontal, Shield, ArrowRight } from 'lucide-react';
import { settingsPageData } from '@/data/settingsData';
import { SettingCategoryItem } from '@/types/settings';

export default function SettingsCategories() {
  const { categories } = settingsPageData;

  const renderIcon = (type: SettingCategoryItem['iconType']) => {
    switch (type) {
      case 'user':
        return <User size={20} strokeWidth={2.2} />;
      case 'farm':
        return <House size={20} strokeWidth={2.2} />;
      case 'fields':
        return <LayoutGrid size={20} strokeWidth={2.2} />;
      case 'bell':
        return <Bell size={20} strokeWidth={2.2} />;
      case 'sliders':
        return <SlidersHorizontal size={20} strokeWidth={2.2} />;
      case 'shield':
        return <Shield size={20} strokeWidth={2.2} />;
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-[16px] font-bold text-[#102A20]">Settings Categories</h3>
        <p className="text-[13px] text-[#52645D] mt-0.5">
          Manage different aspects of your account and farm operations
        </p>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.route}
            className="p-4 bg-[#FAFCFA] border border-[#F0F4F1] hover:border-[#D5E6D8] hover:bg-[#F5F9F6] rounded-xl transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className={`w-10 h-10 rounded-full ${cat.iconBg} ${cat.iconColor} flex items-center justify-center mb-3 shrink-0 border border-black/5`}>
                {renderIcon(cat.iconType)}
              </div>

              <h4 className="text-[15px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight mb-1">
                {cat.title}
              </h4>
              <p className="text-[12px] text-[#52645D] leading-relaxed mb-4">
                {cat.description}
              </p>
            </div>

            <div className="flex items-center text-[13px] font-semibold text-[#168A45] group-hover:translate-x-1 transition-transform">
              <ArrowRight size={16} strokeWidth={2.2} />
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
