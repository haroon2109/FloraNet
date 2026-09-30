"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Clock, ArrowRight } from 'lucide-react';
import { resourcesPageData } from '@/data/resourcesData';

export default function RecentResources() {
  const { latest } = resourcesPageData;
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#102A20]">Latest Resources</h3>
        <Link 
          href="/resources" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#F0F4F1]">
        {latest.map((item) => {
          const isSaved = bookmarkedIds.includes(item.id);

          return (
            <div 
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-[#F8FAF8] px-2 rounded-xl transition-colors"
            >
              
              {/* Left Image + Text */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[#E1E7E3]">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="80px"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-[14px] font-bold text-[#102A20] group-hover:text-[#168A45] transition-colors leading-tight mb-1 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-[#52645D] leading-relaxed line-clamp-1 mb-1.5">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#889B91]">
                    <span className="text-[#52645D]">{item.author}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#168A45]">
                      <Clock size={12} />
                      {item.readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Badge + Bookmark */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="px-2.5 py-0.5 bg-[#EFF8F1] border border-[#C4E7D0] text-[#168A45] text-[11px] font-bold rounded-full">
                  {item.type}
                </span>

                <button
                  type="button"
                  onClick={() => toggleBookmark(item.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
                    isSaved
                      ? 'bg-[#168A45] text-white border-[#168A45]'
                      : 'bg-white text-[#889B91] border-[#E1E7E3] hover:text-[#168A45] hover:bg-[#EFF8F1]'
                  }`}
                  aria-label="Save resource"
                >
                  <Bookmark size={15} fill={isSaved ? 'white' : 'none'} strokeWidth={2} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
