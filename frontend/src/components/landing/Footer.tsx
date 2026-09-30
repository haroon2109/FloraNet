"use client";

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Globe, ShieldCheck, FileJson, HeartHandshake, Sparkles } from 'lucide-react';
import LiveNodeStatus from '@/components/ui/LiveNodeStatus';

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAFCFA] border-t border-[#E1E8E2] pt-14 pb-10 text-[13.5px]">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8">
        
        {/* Top 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand & DPG Mission Statement (2 cols on LG) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <Logo className="w-8 h-8" withText={true} textColor="text-[#102A20]" />
            </Link>
            
            <p className="text-[#55695F] leading-relaxed text-[13.5px] max-w-[360px]">
              FloraNet is an open-standard Digital Public Good built to empower smallholders, agribusinesses, and policymakers across BRICS agro-ecosystems through real-time autonomous intelligence.
            </p>

            <div className="flex items-center gap-2 text-[12px] font-bold text-[#075C32] bg-[#EAF5EC] px-3 py-1.5 rounded-xl border border-[#C4E7D0] w-fit">
              <span className="w-2 h-2 rounded-full bg-[#168A45] animate-pulse" />
              <span>Digital Public Good · Schema.org Validated</span>
            </div>
          </div>

          {/* Col 1: Platform Solutions */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#102A20] text-[14px]">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-[#55695F]">
              <li>
                <Link href="/home" className="hover:text-[#075C32] transition-colors">
                  3D Digital Twin Farm
                </Link>
              </li>
              <li>
                <Link href="/field-monitor" className="hover:text-[#075C32] transition-colors">
                  Leaflet GIS Satellite Radar
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-[#075C32] transition-colors">
                  Tri-Persona AI Agronomist
                </Link>
              </li>
              <li>
                <Link href="/market-prices" className="hover:text-[#075C32] transition-colors">
                  BRICS Mandi Arbitrage
                </Link>
              </li>
              <li>
                <Link href="/crop-details" className="hover:text-[#075C32] transition-colors">
                  Phenological Lifecycle
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Regional Hubs */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#102A20] text-[14px]">
              Regional Hubs
            </h4>
            <ul className="space-y-2 text-[#55695F]">
              <li>
                <Link href="/market-prices?country=India" className="hover:text-[#075C32] transition-colors flex items-center gap-1.5">
                  <span>🇮🇳</span>
                  <span>India (ICAR Node)</span>
                </Link>
              </li>
              <li>
                <Link href="/market-prices?country=Brazil" className="hover:text-[#075C32] transition-colors flex items-center gap-1.5">
                  <span>🇧🇷</span>
                  <span>Brazil (Embrapa Node)</span>
                </Link>
              </li>
              <li>
                <Link href="/market-prices?country=Russia" className="hover:text-[#075C32] transition-colors flex items-center gap-1.5">
                  <span>🇷🇺</span>
                  <span>Russia (Voronezh Hub)</span>
                </Link>
              </li>
              <li>
                <Link href="/market-prices?country=China" className="hover:text-[#075C32] transition-colors flex items-center gap-1.5">
                  <span>🇨🇳</span>
                  <span>China (CAAS Center)</span>
                </Link>
              </li>
              <li>
                <Link href="/market-prices?country=South%20Africa" className="hover:text-[#075C32] transition-colors flex items-center gap-1.5">
                  <span>🇿🇦</span>
                  <span>South Africa (ARC Hub)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: DPG & Open Standards */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#102A20] text-[14px]">
              Standards & API
            </h4>
            <ul className="space-y-2 text-[#55695F]">
              <li>
                <Link href="/interop" className="hover:text-[#075C32] transition-colors">
                  Schema.org AgriN JSON-LD
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-[#075C32] transition-colors">
                  DPG Soil Verifiable Passports
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#075C32] transition-colors">
                  OpenAPI 3.1 Telemetry Spec
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-[#075C32] transition-colors">
                  Federated Data Privacy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E1E8E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#7A8E83] text-[12px]">
          <LiveNodeStatus />

          <div className="flex items-center gap-6">
            <Link href="/settings" className="hover:text-[#075C32] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/settings" className="hover:text-[#075C32] transition-colors">
              Terms of Service
            </Link>
            <Link href="/interop" className="hover:text-[#075C32] transition-colors">
              Open Source License
            </Link>
          </div>

          <div>
            © {new Date().getFullYear()} FloraNet DPG Node. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
