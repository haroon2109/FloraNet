"use client";

import React from 'react';
import Image from 'next/image';
import { Sprout, Layers, ShieldCheck, Droplets, CloudSun, ChartNoAxesColumn, FileText, BookOpen, Play, Clock } from 'lucide-react';
import { resourcesPageData } from '@/data/resourcesData';
import { ResourceCategory } from '@/types/resources';

export default function PopularResources() {
  const { featured, categories } = resourcesPageData;

  const renderCategoryIcon = (type: ResourceCategory['iconType']) => {
    switch (type) {
      case 'crop':
        return <Sprout size={18} strokeWidth={2.2} />;
      case 'soil':
        return <Layers size={18} strokeWidth={2.2} />;
      case 'pest':
        return <ShieldCheck size={18} strokeWidth={2.2} />;
      case 'irrigation':
        return <Droplets size={18} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />;
      case 'weather':
        return <CloudSun size={18} strokeWidth={2.2} />;
      case 'business':
        return <ChartNoAxesColumn size={18} strokeWidth={2.2} />;
    }
  };

  return (
    <div className="space-y-6 mb-6">
      
      {/* Featured Resources Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#102A20]">Featured Resources</h3>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((item) => (
            <div 
              key={item.id}
              className="bg-white border border-[#E1E7E3] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(20,60,40,0.04)] hover:border-[#168A45] hover:-translate-y-0.5 transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Image + Featured Badge */}
                <div className="relative w-full h-[140px] bg-[#F5F9F6]">
                  <Image 
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="300px"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-[#EFF8F1] border border-[#C4E7D0] text-[#168A45] text-[10px] font-bold rounded-full shadow-xs">
                    Featured
                  </span>
                </div>

                {/* Content */}
                <div className="p-3.5">
                  <h4 className="text-[14px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-[#52645D] leading-relaxed line-clamp-2 mb-3">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="px-3.5 pb-3.5 pt-2 border-t border-[#F0F4F1] flex items-center justify-between text-[11px] font-bold text-[#52645D]">
                <div className="flex items-center gap-1 text-[#168A45]">
                  {item.type === 'Article' ? <FileText size={13} /> : item.type === 'Guide' ? <BookOpen size={13} /> : <Play size={13} />}
                  <span>{item.type}</span>
                </div>
                <div className="flex items-center gap-1 text-[#889B91]">
                  <Clock size={12} />
                  <span>{item.readTime}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Browse by Category Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#102A2A]">Browse by Category</h3>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              className="p-3.5 bg-white border border-[#E1E7E3] hover:border-[#168A45] hover:bg-[#EFF8F1] rounded-2xl transition-all group flex flex-col items-center text-center cursor-pointer shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#EFF8F1] text-[#168A45] flex items-center justify-center mb-2 shrink-0 border border-[#C4E7D0] group-hover:scale-105 transition-transform">
                {renderCategoryIcon(cat.iconType)}
              </div>
              <h4 className="text-[13px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight">
                {cat.title}
              </h4>
              <span className="text-[11px] font-semibold text-[#889B91] mt-0.5">
                {cat.countText}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
