"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HeroSection from './HeroSection';
import FieldOverview from './FieldOverview';
import RecentAlerts from './RecentAlerts';
import WeatherCard from './WeatherCard';
import AIRecommendations from './AIRecommendations';
import MarketPrices from './MarketPrices';

export default function HomeDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout activeRouteName="Farm Overview">
      {/* Core Layout Grid (Adaptive 12-Column Balance: Main 8 cols + Rail 4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 w-full pb-10 pt-2 sm:pt-4">
        
        {/* Main Telemetry & Field Content Area (8 Cols) */}
        <main className="xl:col-span-8 min-w-0 space-y-6">
          <HeroSection />
          <FieldOverview />
          <RecentAlerts />
        </main>

        {/* Right Advisory & Environmental Rail (4 Cols) */}
        <aside className="xl:col-span-4 min-w-0 flex flex-col gap-6">
          <WeatherCard />
          <AIRecommendations />
          <MarketPrices />
        </aside>

      </div>
    </DashboardLayout>
  );
}
