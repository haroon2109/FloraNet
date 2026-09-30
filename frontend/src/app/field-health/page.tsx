"use client";

import React, { useState } from "react";
import TopBar from "@/components/ui/TopBar";
import MicroclimateBanner from "@/components/field-health/MicroclimateBanner";
import FieldMapViewer from "@/components/field-health/FieldMapViewer";
import Link from "next/link";
import { Layers, Activity, Droplets, MapPin } from "lucide-react";

export default function FieldHealthPage() {
  const [activeLayer, setActiveLayer] = useState<"base" | "ndvi" | "ndre" | "moisture">("base");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar />

      {/* Navigation Tabs */}
      <div className="flex border-b bg-white overflow-x-auto whitespace-nowrap hide-scrollbar">
        <Link href="/" className="px-4 py-3 text-center text-gray-500 font-medium hover:text-gray-700">
          Diagnose
        </Link>
        <Link href="/planner" className="px-4 py-3 text-center text-gray-500 font-medium hover:text-gray-700">
          Rotation Planner
        </Link>
        <Link href="/field-health" className="px-4 py-3 text-center border-b-2 border-green-600 font-semibold text-green-700">
          Field Intelligence
        </Link>
        <Link href="/analytics" className="px-4 py-3 text-center text-gray-500 font-medium hover:text-gray-700">
          Analytics
        </Link>
        <Link href="/interop" className="px-4 py-3 text-center text-gray-500 font-medium hover:text-gray-700">
          DPG Hub
        </Link>
        <Link href="/seed-network" className="px-4 py-3 text-center text-gray-500 font-medium hover:text-gray-700">
          Seed Network
        </Link>
          <Link href="/seed-finder" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Seed Finder
          </Link>
      </div>

      <MicroclimateBanner />

      <main className="p-4 max-w-lg mx-auto space-y-4">
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <MapPin size={18} className="text-green-600" />
              Draw Boundaries
            </h2>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold uppercase tracking-wide">
              Earth Engine Connected
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Use the drawing tool on the map to define your farm boundaries and fetch localized satellite data.</p>
          
          <FieldMapViewer activeLayer={activeLayer} />

          {/* Layer Toggles */}
          <div className="mt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Layers size={14} /> Satellite Layers
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button 
                onClick={() => setActiveLayer("base")}
                className={`py-2 px-1 text-xs font-bold rounded border transition-colors ${activeLayer === 'base' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                True Color
              </button>
              <button 
                onClick={() => setActiveLayer("ndvi")}
                className={`py-2 px-1 text-xs font-bold rounded border transition-colors flex justify-center items-center gap-1 ${activeLayer === 'ndvi' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
              >
                <Activity size={12} /> NDVI
              </button>
              <button 
                onClick={() => setActiveLayer("ndre")}
                className={`py-2 px-1 text-xs font-bold rounded border transition-colors ${activeLayer === 'ndre' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50'}`}
              >
                NDRE
              </button>
              <button 
                onClick={() => setActiveLayer("moisture")}
                className={`py-2 px-1 text-xs font-bold rounded border transition-colors flex justify-center items-center gap-1 ${activeLayer === 'moisture' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
              >
                <Droplets size={12} /> Moisture
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
