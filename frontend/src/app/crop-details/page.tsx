"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TopBar from '@/components/crop-details/TopBar';
import CropHeader from '@/components/crop-details/CropHeader';
import CropSummaryCard from '@/components/crop-details/CropSummaryCard';
import CropTabs from '@/components/crop-details/CropTabs';
import CropMetrics from '@/components/crop-details/CropMetrics';
import GrowthTimeline from '@/components/crop-details/GrowthTimeline';
import FieldPhoto from '@/components/crop-details/FieldPhoto';
import RecentObservations from '@/components/crop-details/RecentObservations';
import PestDiseaseCard from '@/components/crop-details/PestDiseaseCard';
import RegenerativePrescriptionEngine from '@/components/crop-details/RegenerativePrescriptionEngine';
import NutritionStatus from '@/components/crop-details/NutritionStatus';
import KeyInsights from '@/components/crop-details/KeyInsights';
import QuickActions from '@/components/crop-details/QuickActions';
import UpcomingTasks from '@/components/crop-details/UpcomingTasks';
import CropPlannerModule from '@/components/crop-details/CropPlannerModule';

export default function CropDetailsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      {/* Top Bar */}
      <TopBar />

      {/* Crop Header */}
      <CropHeader />

      {/* Main Grid: Crop Details + Right Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left Column (8 cols): Summary, Tabs, Growth Timeline, Planner */}
        <div className="lg:col-span-8 space-y-6">
          <CropSummaryCard />
          <CropTabs />
          <CropMetrics />
          <GrowthTimeline />
          <CropPlannerModule />
          <FieldPhoto />
          <RecentObservations />
        </div>

        {/* Right Column (4 cols): Regenerative Engine, Pest, Nutrition, Insights, Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <RegenerativePrescriptionEngine />
          <PestDiseaseCard />
          <NutritionStatus />
          <KeyInsights />
          <QuickActions />
          <UpcomingTasks />
        </div>

      </div>
    </DashboardLayout>
  );
}
