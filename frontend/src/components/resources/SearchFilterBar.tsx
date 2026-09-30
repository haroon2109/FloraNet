"use client";

import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchFilterBarProps {
  onSearchChange?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  onTypeChange?: (type: string) => void;
}

export default function SearchFilterBar({ onSearchChange, onCategoryChange, onTypeChange }: SearchFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('All Types');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchChange?.(val);
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-3 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6 flex flex-wrap items-center gap-3">
      
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52645D]" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search resources..."
          className="w-full bg-[#FAFCFA] border border-[#E1E7E3] rounded-xl pl-10 pr-4 py-2 text-[13px] font-semibold text-[#102A20] placeholder-[#889B91] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30"
        />
      </div>

      {/* Category Dropdown */}
      <select
        value={selectedCategory}
        onChange={(e) => {
          setSelectedCategory(e.target.value);
          onCategoryChange?.(e.target.value);
        }}
        className="bg-white border border-[#E1E7E3] rounded-xl px-3 py-2 text-[12px] font-bold text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30 cursor-pointer shadow-xs"
      >
        <option value="All Categories">All Categories</option>
        <option value="Crop Management">Crop Management</option>
        <option value="Soil Health">Soil Health</option>
        <option value="Pest & Disease">Pest & Disease</option>
        <option value="Irrigation">Irrigation</option>
        <option value="Weather & Climate">Weather & Climate</option>
        <option value="Farm Business">Farm Business</option>
      </select>

      {/* Type Dropdown */}
      <select
        value={selectedType}
        onChange={(e) => {
          setSelectedType(e.target.value);
          onTypeChange?.(e.target.value);
        }}
        className="bg-white border border-[#E1E7E3] rounded-xl px-3 py-2 text-[12px] font-bold text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30 cursor-pointer shadow-xs"
      >
        <option value="All Types">All Types</option>
        <option value="Article">Article</option>
        <option value="Guide">Guide</option>
        <option value="Video">Video</option>
      </select>

      {/* Language Dropdown */}
      <select className="bg-white border border-[#E1E7E3] rounded-xl px-3 py-2 text-[12px] font-bold text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30 cursor-pointer shadow-xs">
        <option value="All Languages">All Languages</option>
        <option value="English">English</option>
        <option value="Hindi">Hindi (हिंदी)</option>
        <option value="Marathi">Marathi (मराठी)</option>
      </select>

      {/* Sort Dropdown */}
      <select className="bg-white border border-[#E1E7E3] rounded-xl px-3 py-2 text-[12px] font-bold text-[#102A20] focus:outline-none focus:ring-2 focus:ring-[#168A45]/30 cursor-pointer shadow-xs">
        <option value="Newest First">Newest First</option>
        <option value="Most Popular">Most Popular</option>
        <option value="Highest Rated">Highest Rated</option>
      </select>

      {/* Filter Action Button */}
      <button
        type="button"
        className="px-4 py-2 bg-white border border-[#E1E7E3] hover:bg-[#EFF8F1] hover:border-[#168A45] text-[#168A45] rounded-xl text-[12px] font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
      >
        <SlidersHorizontal size={14} strokeWidth={2.2} />
        <span>Filter</span>
      </button>

    </div>
  );
}
