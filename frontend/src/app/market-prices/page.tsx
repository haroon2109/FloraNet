"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/market-prices/Header';
import FilterBar from '@/components/market-prices/FilterBar';
import MarketTable from '@/components/market-prices/MarketTable';
import MarketInsights from '@/components/market-prices/MarketInsights';
import MarketSummary from '@/components/market-prices/MarketSummary';
import PriceTrend from '@/components/market-prices/PriceTrend';
import MarketOpportunities from '@/components/market-prices/MarketOpportunities';

export default function MarketPricesPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState('All Commodities');
  const [selectedMarket, setSelectedMarket] = useState('All Markets');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All Timeframes');
  const [searchTerm, setSearchTerm] = useState('');

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
        selectedCommodity={selectedCommodity}
        onCommodityChange={setSelectedCommodity}
        selectedMarket={selectedMarket}
        onMarketChange={setSelectedMarket}
        selectedGrade={selectedGrade}
        onGradeChange={setSelectedGrade}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Core Layout Grid (Main Workspace + Right Panel) */}
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 flex-1">
        
        {/* Left/Middle Main Area */}
        <main className="flex-1 min-w-0 space-y-6">
          <MarketTable />
          <MarketInsights />
        </main>

        {/* Right Analytics Rail (~350px) */}
        <aside className="w-full xl:w-[350px] shrink-0 flex flex-col gap-6">
          <MarketSummary />
          <PriceTrend />
          <MarketOpportunities />
        </aside>

      </div>
    </DashboardLayout>
  );
}

