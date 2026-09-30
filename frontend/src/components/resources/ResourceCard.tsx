"use client";

import React from 'react';
import { FeaturedResource } from '@/types/resources';
import { FileText, Play, Clock } from 'lucide-react';
import Image from 'next/image';

interface ResourceCardProps {
  resource: FeaturedResource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const isVideo = resource.type === 'Video';
  
  return (
    <div className="group w-full flex flex-col bg-white border border-[#E1E7E3] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(20,60,40,0.04)] hover:shadow-[0_4px_16px_rgba(20,60,40,0.08)] hover:-translate-y-0.5 transition-all text-left cursor-pointer">
      
      <div className="h-[140px] w-full relative border-b border-[#E1E7E3]/60 bg-[#F5F9F6]">
        <Image 
          src={resource.image} 
          alt={resource.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300" 
          sizes="300px"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#168A45] border border-[#C4E7D0] shadow-xs">
          {resource.type}
        </div>
      </div>
      
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-[#102A20] mb-1 line-clamp-1 group-hover:text-[#168A45] transition-colors">{resource.title}</h3>
          <p className="text-[12px] text-[#52645D] line-clamp-2 mb-3 leading-relaxed">
            {resource.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-[11px] font-bold text-[#52645D] pt-2 border-t border-[#F0F4F1]">
          <div className="flex items-center gap-1 text-[#168A45]">
            {isVideo ? <Play size={12} /> : <FileText size={12} />}
            <span>{resource.type}</span>
          </div>
          <div className="flex items-center gap-1 text-[#889B91]">
            <Clock size={12} />
            <span>{resource.readTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
