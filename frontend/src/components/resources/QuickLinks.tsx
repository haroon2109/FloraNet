"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FileText, BookOpen, Play, ChartNoAxesColumn, ArrowRight } from 'lucide-react';
import { resourcesPageData } from '@/data/resourcesData';

export default function QuickLinks() {
  const { libraryCounts, popularThisWeek } = resourcesPageData;

  return (
    <div className="space-y-5">
      
      {/* Resource Library Card */}
      <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">
        
        <h3 className="text-[15px] font-bold text-[#102A20] mb-3 px-0.5">Resource Library</h3>

        <div className="space-y-2 mb-3">
          
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#EFF8F1] text-[#168A45] flex items-center justify-center shrink-0">
                <FileText size={15} strokeWidth={2} />
              </div>
              <span className="text-[13px] font-bold text-[#102A20]">Articles</span>
            </div>
            <span className="text-[12px] font-bold text-[#168A45]">{libraryCounts.articles}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0">
                <BookOpen size={15} strokeWidth={2} />
              </div>
              <span className="text-[13px] font-bold text-[#102A20]">Guides</span>
            </div>
            <span className="text-[12px] font-bold text-[#168A45]">{libraryCounts.guides}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#F3E8FF] text-[#7356C7] flex items-center justify-center shrink-0">
                <Play size={15} strokeWidth={2} />
              </div>
              <span className="text-[13px] font-bold text-[#102A20]">Videos</span>
            </div>
            <span className="text-[12px] font-bold text-[#168A45]">{libraryCounts.videos}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0">
                <ChartNoAxesColumn size={15} strokeWidth={2} />
              </div>
              <span className="text-[13px] font-bold text-[#102A20]">Infographics</span>
            </div>
            <span className="text-[12px] font-bold text-[#168A45]">{libraryCounts.infographics}</span>
          </div>

        </div>

        <Link 
          href="/resources" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group px-0.5"
        >
          View all resources 
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>

      </div>

      {/* Popular This Week Card */}
      <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">
        
        <h3 className="text-[15px] font-bold text-[#102A20] mb-3 px-0.5">Popular This Week</h3>

        <div className="space-y-2.5">
          {popularThisWeek.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1] hover:bg-[#F5F9F6] transition-colors group cursor-pointer">
              
              <span className="text-[13px] font-bold text-[#52645D] w-4 text-center shrink-0">
                {item.rank}
              </span>

              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#E1E7E3]">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill 
                  className="object-cover"
                  sizes="40px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-[13px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight truncate">
                  {item.title}
                </h4>
                <span className="text-[11px] font-semibold text-[#889B91] block mt-0.5">
                  {item.views}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
