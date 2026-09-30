"use client";

import React from 'react';

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E1E8E2] p-5 shadow-xs animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-24 h-4 bg-[#EAF2EC] rounded-md" />
        <div className="w-8 h-8 rounded-full bg-[#EAF2EC]" />
      </div>
      <div className="w-32 h-8 bg-[#EAF2EC] rounded-lg mb-2" />
      <div className="w-48 h-3.5 bg-[#EAF2EC] rounded-md" />
    </div>
  );
}

export function SkeletonRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-b border-[#F0F4F1]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className={`h-4 bg-[#EAF2EC] rounded-md ${i === 0 ? 'w-40' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-3.5 bg-[#EAF2EC] rounded-md"
          style={{ width: `${100 - i * 15}%` }} 
        />
      ))}
    </div>
  );
}
