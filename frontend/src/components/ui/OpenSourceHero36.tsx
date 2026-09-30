"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, Activity, Droplets, Sun, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useFarm } from '@/context/farmContext';

export default function OpenSourceHero36() {
  const { fields, selectField, weatherMode, setWeatherMode, liveMetrics } = useFarm();

  const healthyFieldsCount = fields.filter((f) => f.healthScore >= 80).length;
  const avgMoisture = fields.length > 0
    ? Math.round(fields.reduce((acc, f) => acc + f.soilMoisture, 0) / fields.length)
    : null;

  return (
    <div className="relative w-full max-w-[1600px] mx-auto mb-10">
      
      {/* Outer Hero Container with Subtle Gradient Accent Border */}
      <div className="relative w-full bg-white border border-[#E1E7E3] rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_8px_35px_rgba(7,92,50,0.06)] overflow-hidden">
        
        {/* Ambient Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#075C32] via-[#168A45] to-[#4ADE80]" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column (5 Cols) - Headline & Spatial Quick Controls */}
          <div className="lg:col-span-5 flex flex-col justify-center z-10">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF8F1] border border-[#C4E7D0] mb-5 w-fit">
              <Sparkles size={14} className="text-[#168A45]" />
              <span className="text-[12px] font-bold text-[#168A45] tracking-wide uppercase">
                Open-Source Spatial Twin v2.0
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-[36px] sm:text-[44px] lg:text-[48px] font-bold text-[#102A2A] tracking-tight leading-[1.08] mb-4">
              Agricultural <br />
              <span className="text-[#168A45]">Intelligence Platform</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[15px] sm:text-[16px] font-medium text-[#52645D] leading-relaxed mb-8">
              Monitor field telemetry, soil moisture, crop health, and AI advisories through an intelligent overview of your farm.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-8">
              <Link
                href="/field-monitor"
                className="px-6 py-3.5 bg-[#075C32] hover:bg-[#087A45] text-white font-bold text-[14px] rounded-2xl transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2"
              >
                <span>Launch Field Monitor</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/recommendations"
                className="px-5 py-3.5 bg-white border border-[#E1E7E3] hover:border-[#168A45] hover:bg-[#EFF8F1] text-[#102A20] font-bold text-[14px] rounded-2xl transition-all inline-flex items-center gap-2"
              >
                <span>AI Recommendations</span>
                <ShieldCheck size={16} className="text-[#168A45]" />
              </Link>
            </div>

            {/* 3 Linked Feature Cards Grid (Hero 36 Pattern) */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-[#F0F4F1]">
              
              {/* Card 1: Health */}
              <div 
                onClick={() => selectField('field-1')}
                className="p-3 bg-[#FAFCFA] hover:bg-[#EFF8F1] border border-[#E1E7E3] hover:border-[#168A45] rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <Activity size={16} className="text-[#168A45]" />
                  <span className="text-[10px] font-bold text-[#168A45]">{healthyFieldsCount}/{fields.length} Fields</span>
                </div>
                <span className="text-[12px] font-bold text-[#102A2A] block leading-tight group-hover:text-[#168A45]">
                  Farm Health
                </span>
                <span className="text-[10px] text-[#889B91] font-semibold">
                  {liveMetrics?.overall_health_score != null ? `${liveMetrics.overall_health_score}/100 Live Score` : 'Live Field Registry'}
                </span>
              </div>

              {/* Card 2: Soil Moisture */}
              <div 
                onClick={() => selectField('field-2')}
                className="p-3 bg-[#FAFCFA] hover:bg-[#EBF3FE] border border-[#E1E7E3] hover:border-[#1A73E8] rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <Droplets size={16} className="text-[#1A73E8]" />
                  <span className="text-[10px] font-bold text-[#1A73E8]">{avgMoisture != null ? `${avgMoisture}%` : '—'}</span>
                </div>
                <span className="text-[12px] font-bold text-[#102A2A] block leading-tight group-hover:text-[#1A73E8]">
                  Avg Moisture
                </span>
                <span className="text-[10px] text-[#889B91] font-semibold">
                  {avgMoisture != null ? 'Registered Fields' : 'No Fields Registered'}
                </span>
              </div>

              {/* Card 3: Weather */}
              <div 
                onClick={() => setWeatherMode(weatherMode === 'Sunny' ? 'Rain' : 'Sunny')}
                className="p-3 bg-[#FAFCFA] hover:bg-[#FEF7E0] border border-[#E1E7E3] hover:border-[#D97706] rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <Sun size={16} className="text-[#D97706]" />
                  <span className="text-[10px] font-bold text-[#D97706]">{weatherMode}</span>
                </div>
                <span className="text-[12px] font-bold text-[#102A2A] block leading-tight group-hover:text-[#D97706]">
                  Live Weather
                </span>
                <span className="text-[10px] text-[#889B91] font-semibold">Open-Meteo Live Feed</span>
              </div>

            </div>

          </div>

          {/* Right Column (7 Cols) - Static Farm Landscape Hero */}
          <div className="lg:col-span-7 h-[380px] sm:h-[440px] lg:h-[480px] rounded-[24px] overflow-hidden border border-[#DCE8DE] relative shadow-inner bg-[#F7FAF8]">
            <Image 
              src="/images/home/hero_farm_landscape.jpg"
              alt="FloraNet Farm Overview"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            {/* Ambient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

        </div>

      </div>

    </div>
  );
}
