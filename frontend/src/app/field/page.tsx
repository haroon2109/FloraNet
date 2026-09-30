"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/field-monitor/Sidebar';
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
import { Menu, X, Sparkles, ShieldCheck } from 'lucide-react';

export default function FieldPage() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex w-full min-h-screen bg-[#F7F9F7] font-sans text-[#102A20] selection:bg-[#EAF5EC] selection:text-[#168A45]">
      
      {/* Desktop Left Sidebar (280px) */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-40">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[280px] bg-white h-full shadow-2xl z-10">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#52645D] hover:text-[#102A20]"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Mobile Header Bar */}
        <div className="lg:hidden h-14 px-4 bg-white border-b border-[#E1E7E3] flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-[#102A20] hover:bg-[#F5F9F6] rounded-lg"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-[#075C32] text-lg">FloraNet</span>
          <div className="w-8" />
        </div>

        {/* Page Content Container */}
        <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto flex-1 flex flex-col space-y-8">
          
          <TopBar />

          {/* Farm Landscape Hero */}
          <FarmLandscapeHero />

          <KPIRow />

          {/* Main Layout Grid */}
          <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 flex-1">
            <main className="flex-1 min-w-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <FieldOverviewMap />
                </div>
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <HealthSummary />
                  <AlertsSummary />
                </div>
              </div>
              <FieldStatusTable />
            </main>

            <aside className="w-full xl:w-[400px] shrink-0 flex flex-col">
              <WeatherPanel />
              <SensorStatus />
              <AIRecommendations />
            </aside>
          </div>

        </div>

      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
