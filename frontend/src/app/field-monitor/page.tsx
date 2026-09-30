"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TopBar from '@/components/field-monitor/TopBar';
import FarmLandscapeHero from '@/components/field-monitor/FarmLandscapeHero';
import KPIRow from '@/components/field-monitor/KPIRow';
import FieldOverviewMap from '@/components/field-monitor/FieldOverviewMap';
import HealthSummary from '@/components/field-monitor/HealthSummary';
import AlertsSummary from '@/components/field-monitor/AlertsSummary';
import FieldStatusTable from '@/components/field-monitor/FieldStatusTable';
import WeatherPanel from '@/components/field-monitor/WeatherPanel';
import SensorStatus from '@/components/field-monitor/SensorStatus';
import AIRecommendations from '@/components/field-monitor/AIRecommendations';
import SatelliteScanPipeline from '@/components/field-monitor/SatelliteScanPipeline';
import EdgeDiagnosticsCard from '@/components/field-monitor/EdgeDiagnosticsCard';
import MagneticCarousel from '@/components/ui/MagneticCarousel';

export default function FieldMonitorPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      {/* Top Bar Navigation & Actions */}
      <TopBar />

      {/* Hero Welcome Banner */}
      <FarmLandscapeHero />

      {/* KPI Cards Row */}
      <KPIRow />

      {/* Real-time Sentinel-2 Pipeline & Edge Health Diagnostics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <SatelliteScanPipeline />
        <EdgeDiagnosticsCard />
      </div>

      {/* Interactive 3D Field Map + Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left Interactive Map (8 cols) */}
        <div className="lg:col-span-8">
          <FieldOverviewMap />
        </div>

        {/* Right Info Panels (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <HealthSummary />
          <AlertsSummary />
        </div>

      </div>

      {/* Field Status Data Table */}
      <FieldStatusTable />

      {/* Bottom 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <WeatherPanel />
        <SensorStatus />
        <AIRecommendations />
      </div>

      {/* Visual Showcase: Magnetic Carousel */}
      <div className="mb-4">
        <MagneticCarousel />
      </div>
    </DashboardLayout>
  );
}
