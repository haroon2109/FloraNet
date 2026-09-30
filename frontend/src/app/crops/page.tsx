"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TopHeader from '@/components/crops/TopHeader';
import KPIGrid from '@/components/crops/KPIGrid';
import FilterBar from '@/components/crops/FilterBar';
import CropsTable from '@/components/crops/CropsTable';
import Pagination from '@/components/crops/Pagination';
import CropHealthOverview from '@/components/crops/CropHealthOverview';
import GrowthStageDistribution from '@/components/crops/GrowthStageDistribution';
import Recommendations from '@/components/crops/Recommendations';
import MagneticCarousel from '@/components/ui/MagneticCarousel';
import BRICSSoilTaxonomyExplorer from '@/components/crops/BRICSSoilTaxonomyExplorer';

export default function CropsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [selectedField, setSelectedField] = useState('All Fields');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedSeason, setSelectedSeason] = useState('All Seasons');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      {/* Top Header */}
      <TopHeader />

      {/* KPI Cards Grid */}
      <KPIGrid />

      {/* Filter Bar */}
      <FilterBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCrop={selectedCrop}
        onCropChange={setSelectedCrop}
        selectedField={selectedField}
        onFieldChange={setSelectedField}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedSeason={selectedSeason}
        onSeasonChange={setSelectedSeason}
      />

      {/* Core Layout Grid (Main Workspace + Right Panel) */}
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 flex-1">
        
        {/* Left/Middle Main Area (~70%) */}
        <main className="flex-1 min-w-0 space-y-6">
          <CropsTable />
          <Pagination />
          
          {/* BRICS 5-Nation Pedology Soil Explorer */}
          <BRICSSoilTaxonomyExplorer />
          
          {/* Visual Showcase: Magnetic Carousel */}
          <MagneticCarousel />
        </main>

        {/* Right Analytics Rail (~350px) */}
        <aside className="w-full xl:w-[350px] shrink-0 flex flex-col gap-6">
          <CropHealthOverview />
          <GrowthStageDistribution />
          <Recommendations />
        </aside>

      </div>
    </DashboardLayout>
  );
}
