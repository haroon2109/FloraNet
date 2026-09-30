"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/resources/Header';
import SearchFilterBar from '@/components/resources/SearchFilterBar';
import PopularResources from '@/components/resources/PopularResources';
import RecentResources from '@/components/resources/RecentResources';
import QuickLinks from '@/components/resources/QuickLinks';
import UpcomingWebinars from '@/components/resources/UpcomingWebinars';

export default function ResourcesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      {/* Top Header */}
      <Header />

      {/* Search & Topic Filter Bar */}
      <SearchFilterBar />

      {/* Main Grid: Resources Catalog + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left: Popular & Recent Resources (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <PopularResources />
          <RecentResources />
        </div>

        {/* Right: Quick Links & Upcoming Webinars (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <QuickLinks />
          <UpcomingWebinars />
        </div>

      </div>
    </DashboardLayout>
  );
}
