"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/reports/Header';
import FilterBar from '@/components/reports/FilterBar';
import KPICards from '@/components/reports/KPICards';
import CropPerformanceChart from '@/components/reports/CropPerformanceChart';
import ExpenseBreakdown from '@/components/reports/ExpenseBreakdown';
import FieldPerformanceSummary from '@/components/reports/FieldPerformanceSummary';
import ProfitTrendChart from '@/components/reports/ProfitTrendChart';
import InsightsRecommendations from '@/components/reports/InsightsRecommendations';
import ReportTypes from '@/components/reports/ReportTypes';
import RecentReports from '@/components/reports/RecentReports';
import SoilNutritionRadar from '@/components/analytics/SoilNutritionRadar';
import MonteCarloYieldDistribution from '@/components/analytics/MonteCarloYieldDistribution';
import RegionalCorridorAnalytics from '@/components/reports/RegionalCorridorAnalytics';

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('All Reports');
  const [selectedField, setSelectedField] = useState('All Fields');
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [selectedDateRange, setSelectedDateRange] = useState('Today (Real-time)');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      {/* Top Header */}
      <Header />

      {/* Filter Bar */}
      <FilterBar 
        selectedReportType={selectedReportType}
        onReportTypeChange={setSelectedReportType}
        selectedField={selectedField}
        onFieldChange={setSelectedField}
        selectedCrop={selectedCrop}
        onCropChange={setSelectedCrop}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
      />

      {/* KPI Summary Cards */}
      <KPICards />

      {/* BRICS Cross-Border Corridor Data & DPG Passport */}
      <RegionalCorridorAnalytics />

      {/* Charts Section: Performance & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left: Crop Performance Chart (7 cols) */}
        <div className="lg:col-span-7">
          <CropPerformanceChart />
        </div>

        {/* Right: Expense Breakdown (5 cols) */}
        <div className="lg:col-span-5">
          <ExpenseBreakdown />
        </div>

      </div>

      {/* Advanced Telemetry Section: Radar & Monte Carlo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SoilNutritionRadar />
        <MonteCarloYieldDistribution />
      </div>

      {/* Field Performance Summary Table */}
      <FieldPerformanceSummary />

      {/* Profit Trends & AI Actionable Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left: Profit Trend Chart (7 cols) */}
        <div className="lg:col-span-7">
          <ProfitTrendChart />
        </div>

        {/* Right: AI Insights & Recommendations (5 cols) */}
        <div className="lg:col-span-5">
          <InsightsRecommendations />
        </div>

      </div>

      {/* Bottom Grid: Report Types Catalog & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left: Generate Report Types Catalog (7 cols) */}
        <div className="lg:col-span-7">
          <ReportTypes />
        </div>

        {/* Right: Recent Generated Reports (5 cols) */}
        <div className="lg:col-span-5">
          <RecentReports />
        </div>

      </div>
    </DashboardLayout>
  );
}
