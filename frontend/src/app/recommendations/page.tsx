"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TopHeader from '@/components/recommendations/TopHeader';
import FarmHeroIllustration from '@/components/recommendations/FarmHeroIllustration';
import RecommendationTabs from '@/components/recommendations/RecommendationTabs';
import RecommendationCard from '@/components/recommendations/RecommendationCard';
import AISummary from '@/components/recommendations/AISummary';
import RecommendationImpact from '@/components/recommendations/RecommendationImpact';
import UpcomingActions from '@/components/recommendations/UpcomingActions';
import AskFloraNet from '@/components/recommendations/AskFloraNet';
import { recommendationsPageData } from '@/data/recommendationsData';
import { ArrowRight } from 'lucide-react';

export default function RecommendationsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('All Recommendations');

  const { recommendations } = recommendationsPageData;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter recommendations based on activeTab
  const filteredRecommendations = recommendations.filter((rec) => {
    if (activeTab === 'All Recommendations') return true;
    if (activeTab === 'Irrigation' && rec.category === 'irrigation') return true;
    if (activeTab === 'Fertilizer' && rec.category === 'fertilizer') return true;
    if (activeTab === 'Pest & Disease' && rec.category === 'pest') return true;
    if (activeTab === 'Weather Impact' || activeTab === 'Harvest & Yield') return true;
    return true;
  });

  return (
    <DashboardLayout>
      {/* Top Header */}
      <TopHeader />

      {/* Hero Welcome Banner */}
      <FarmHeroIllustration />

      {/* Recommendation Category Tabs */}
      <RecommendationTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Main Grid: Recommendations Stream & Right Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left: Recommendation Cards Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredRecommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}

          <button 
            type="button"
            className="w-full py-3.5 bg-white border border-[#E1E8E3] hover:border-[#168A45] hover:bg-[#F5F9F6] text-[#087A45] text-[13.5px] font-bold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Load More Agronomy Recommendations</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Right: AI Summary, Impact & Ask FloraNet (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <AISummary />
          <RecommendationImpact />
          <UpcomingActions />
          <AskFloraNet />
        </div>

      </div>
    </DashboardLayout>
  );
}
