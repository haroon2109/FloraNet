"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cropDetailsPageData } from '@/data/cropDetailsData';

export default function RecentObservations() {
  const { observations } = cropDetailsPageData;

  const thumbs = [
    '/images/home/field_1_maize.jpg',
    '/images/home/field_2_wheat.jpg',
    '/images/home/field_3_vegetables.jpg',
  ];

  return (
    <div className="bg-white border border-[#E1E8E4] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A2A]">Recent Observations</h3>
        <Link 
          href="/field-monitor" 
          className="text-[12px] font-semibold text-[#087A45] hover:text-[#075B3A] transition-colors inline-flex items-center gap-1 group shrink-0"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {observations.map((obs, idx) => (
          <div key={obs.id} className="p-2.5 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1] flex items-start gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#E1E8E4]">
              <Image 
                src={thumbs[idx % thumbs.length]} 
                alt="Obs Thumbnail" 
                fill 
                className="object-cover"
                sizes="40px"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-[#102A2A] leading-tight truncate mb-1">
                {obs.text}
              </p>
              <div className="flex items-center justify-between gap-1 text-[10px]">
                <span className="text-[#889B91] font-medium">{obs.timestamp}</span>
                <span className="px-1.5 py-0.2 bg-[#EAF6EE] text-[#087A45] border border-[#C4E7D0] rounded-full font-bold">
                  {obs.author}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
