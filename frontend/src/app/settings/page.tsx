"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Header from '@/components/settings/Header';
import SettingsCategories from '@/components/settings/SettingsCategories';
import QuickSettings from '@/components/settings/QuickSettings';
import AccountSummary from '@/components/settings/AccountSummary';
import DataSyncStatus from '@/components/settings/DataSyncStatus';
import SupportHelp from '@/components/settings/SupportHelp';
import DangerZone from '@/components/settings/DangerZone';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      {/* Top Header */}
      <Header />

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left: Settings Categories & Quick Toggles (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <SettingsCategories />
          <QuickSettings />
          <DangerZone />
        </div>

        {/* Right: Account Summary, Data Sync, Support (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <AccountSummary />
          <DataSyncStatus />
          <SupportHelp />
        </div>

      </div>
    </DashboardLayout>
  );
}
