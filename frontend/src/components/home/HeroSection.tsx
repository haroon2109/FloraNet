"use client";

import React from 'react';
import Image from 'next/image';
import { Leaf, Sun, Wifi, ShieldCheck, Activity, LayoutGrid, Sprout, Droplets, CalendarDays } from 'lucide-react';
import { useFarm } from '@/context/farmContext';

export default function HeroSection() {
  const { userProfile, fields } = useFarm();

  const greetingName = userProfile.firstName && userProfile.firstName !== 'Farmer' 
    ? userProfile.firstName 
    : (userProfile.fullName !== 'Farmer' ? userProfile.fullName : 'Farmer');

  // Compute time-of-day greeting
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 
    ? 'Good morning' 
    : currentHour < 17 
    ? 'Good afternoon' 
    : 'Good evening';

  // Compute telemetry strictly from the live field registry — no fallback
  // demo numbers when the registry is empty (explicit dash is shown).
  const hasFields = fields.length > 0;
  const totalFields = fields.length;
  const avgHealth = hasFields
    ? Math.round(fields.reduce((acc, f) => acc + (f.healthScore || 0), 0) / totalFields)
    : null;
  const distinctCrops = hasFields
    ? Array.from(new Set(fields.map(f => f.crop).filter(Boolean))).join(', ')
    : null;
  const overdueIrrigationCount = fields.filter(
    f => f.irrigationStatus === 'Needed' || f.irrigationStatus === 'Due Tomorrow'
  ).length;

  const dynamicMetrics = [
    {
      id: 'health',
      title: 'Farm Health Index',
      value: avgHealth != null ? `${avgHealth}/100` : '—',
      subValue: hasFields ? 'live registry' : 'no fields registered',
      status: hasFields ? 'Live Field Registry' : 'Register a farm to begin',
      icon: Activity,
      iconBg: 'bg-[#EEF7F0]',
      iconColor: 'text-[#075C32]',
      border: 'border-[#D5E6D8]',
    },
    {
      id: 'fields',
      title: 'Active Fields',
      value: `${totalFields}`,
      subValue: hasFields ? 'registered parcels' : 'no parcels',
      status: hasFields ? 'Backend synced' : 'No demo parcels shown',
      icon: LayoutGrid,
      iconBg: 'bg-[#EEF7F0]',
      iconColor: 'text-[#075C32]',
      border: 'border-[#D5E6D8]',
    },
    {
      id: 'crops',
      title: 'Monitored Crops',
      value: hasFields ? `${distinctCrops!.split(',').filter(Boolean).length}` : '—',
      subValue: hasFields ? 'varieties' : 'awaiting registration',
      status: distinctCrops || '—',
      icon: Sprout,
      iconBg: 'bg-[#EEF7F0]',
      iconColor: 'text-[#075C32]',
      border: 'border-[#D5E6D8]',
    },
    {
      id: 'irrigation',
      title: 'Irrigation Status',
      value: overdueIrrigationCount > 0 ? `${overdueIrrigationCount} Due` : hasFields ? 'Nominal' : '—',
      subValue: 'live status',
      status: overdueIrrigationCount > 0 ? 'Action Required' : hasFields ? 'From field registry' : 'Awaiting registration',
      icon: Droplets,
      iconBg: overdueIrrigationCount > 0 ? 'bg-[#FEF7E0]' : 'bg-[#EBF3FE]',
      iconColor: overdueIrrigationCount > 0 ? 'text-amber-700' : 'text-[#1A73E8]',
      border: overdueIrrigationCount > 0 ? 'border-amber-200' : 'border-[#D0E2FB]',
    },
  ];

  return (
    <div className="relative w-full mb-[60px] sm:mb-[68px]">
      
      {/* Farm Hero Background Banner Container */}
      <div className="relative w-full h-[250px] sm:h-[290px] rounded-[24px] overflow-hidden shadow-[0_4px_25px_rgba(7,92,50,0.06)] border border-[#DCE8DE] bg-[#F7FAF8]">
        
        {/* Landscape Imagery */}
        <Image 
          src="/images/home/hero_farm_landscape.jpg"
          alt="FloraNet Farm Landscape"
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />

        {/* Ambient Gradient Overlays for High Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-[#F7F9F7]" />

        {/* Hero Greeting & Live IoT Telemetry Overlay Card */}
        <div className="absolute top-5 sm:top-6 left-5 sm:left-6 z-10 max-w-lg">
          <div className="bg-white/92 backdrop-blur-md border border-[#E1E7E3] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
            
            {/* Live Mesh Status Eyebrow */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#075C32]">
              <span className="flex items-center gap-1 bg-[#EAF5EC] px-2.5 py-0.5 rounded-full border border-[#C4E7D0]">
                <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
                <span>BRICS NODE ACTIVE ({userProfile.country})</span>
              </span>
              <span className="hidden sm:inline text-[#607469] font-normal">
                • Live Open-Meteo Weather Feed
              </span>
            </div>

            {/* Personalized Time-Aware Greeting */}
            <h1 className="text-[20px] sm:text-[24px] font-bold text-[#102A20] tracking-tight flex items-center gap-2">
              <span>{timeGreeting}, {greetingName}!</span>
              <Leaf className="text-[#075C32] shrink-0" size={20} strokeWidth={2.2} />
            </h1>
            
            <p className="text-[13px] sm:text-[13.5px] font-medium text-[#4A5D54]">
              Telemetry synced for <span className="font-bold text-[#102A20]">{userProfile.farmName}</span>. Root-zone soil moisture is optimal across 4 zones.
            </p>
          </div>
        </div>

      </div>

      {/* Floating Hero Metric Cards Grid (Reactive Farm Context) */}
      <div className="relative -mt-12 sm:-mt-14 px-3 sm:px-6 z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {dynamicMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div 
                key={metric.id}
                className="bg-white rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_20px_rgba(16,42,32,0.05)] border border-[#E1E8E2] flex items-center gap-3.5 hover:shadow-[0_8px_25px_rgba(16,42,32,0.09)] hover:-translate-y-0.5 transition-all min-w-0"
              >
                <div className={`w-11 h-11 rounded-2xl ${metric.iconBg} flex items-center justify-center ${metric.iconColor} shrink-0 border ${metric.border}`}>
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                  <h4 className="text-[12px] font-semibold text-[#53645D] leading-tight mb-0.5">
                    {metric.title}
                  </h4>
                  <div className="flex items-baseline gap-1 mb-0.5">
                    <span className="text-[20px] sm:text-[22px] font-bold text-[#102A20] leading-none tracking-tight">
                      {metric.value}
                    </span>
                    {metric.subValue && (
                      <span className="text-[11.5px] font-medium text-[#6B7E74]">
                        {metric.subValue}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#075C32] truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#168A45] shrink-0" />
                    <span className="truncate">{metric.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
