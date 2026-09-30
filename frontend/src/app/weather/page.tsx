"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TopHeader from '@/components/weather/TopHeader';
import PrimaryWeatherCard from '@/components/weather/PrimaryWeatherCard';
import WeatherSummary from '@/components/weather/WeatherSummary';
import HourlyForecast from '@/components/weather/HourlyForecast';
import TemperatureTrend from '@/components/weather/TemperatureTrend';
import RainfallTrend from '@/components/weather/RainfallTrend';
import EnvironmentWidgets from '@/components/weather/EnvironmentWidgets';
import WeatherAlerts from '@/components/weather/WeatherAlerts';
import AIRecommendations from '@/components/weather/AIRecommendations';
import PastSummary from '@/components/weather/PastSummary';

export default function WeatherPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      {/* Top Header */}
      <TopHeader />

      {/* Hero Weather Section: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left: Primary Live Weather Card (7 cols) */}
        <div className="lg:col-span-7">
          <PrimaryWeatherCard />
        </div>

        {/* Right: Weather Summary & Radar (5 cols) */}
        <div className="lg:col-span-5">
          <WeatherSummary />
        </div>

      </div>

      {/* Hourly Forecast */}
      <HourlyForecast />

      {/* Trends Section: Temperature & Rainfall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TemperatureTrend />
        <RainfallTrend />
      </div>

      {/* Environment Indices Widgets */}
      <EnvironmentWidgets />

      {/* Bottom Insights Grid: Alerts, AI Suggestions, Past Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <WeatherAlerts />
        <AIRecommendations />
        <PastSummary />
      </div>
    </DashboardLayout>
  );
}
