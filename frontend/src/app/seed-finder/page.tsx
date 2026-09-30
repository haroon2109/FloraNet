"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sprout, AlertTriangle, CloudRain, Sun } from "lucide-react";
import GeneticLineageCard, { SeedProfile } from "@/components/seed/GeneticLineageCard";

const SEED_DATABASE: Record<string, SeedProfile[]> = {
  "india-drought": [
    {
      id: "sf-ind-1",
      name: "Finger Millet (Ragi)",
      origin: "India",
      institution: "Indigenous / Open",
      droughtResistance: 95,
      heatTolerance: 90,
      pestResistance: "High",
      soilMatch: "Red/Shallow Soils",
      germinationRate: 90,
      nitrogenFixing: "Low",
      socSequestration: "Moderate"
    },
    {
      id: "sf-ind-2",
      name: "Pearl Millet (Bajra)",
      origin: "India",
      institution: "Indigenous / Open",
      droughtResistance: 98,
      heatTolerance: 95,
      pestResistance: "Moderate",
      soilMatch: "Sandy/Dry Soils",
      germinationRate: 92,
      nitrogenFixing: "Low",
      socSequestration: "Moderate"
    },
    {
      id: "sf-ind-3",
      name: "Cowpea",
      origin: "India",
      institution: "Indigenous / Open",
      droughtResistance: 85,
      heatTolerance: 88,
      pestResistance: "Moderate",
      soilMatch: "Loamy Soils",
      germinationRate: 85,
      nitrogenFixing: "High",
      socSequestration: "Moderate"
    }
  ],
  "sa-drought": [
    {
      id: "sf-sa-1",
      name: "Sorghum",
      origin: "South Africa",
      institution: "Indigenous / Open",
      droughtResistance: 92,
      heatTolerance: 94,
      pestResistance: "High",
      soilMatch: "Varied",
      germinationRate: 88,
      nitrogenFixing: "Low",
      socSequestration: "High"
    },
    {
      id: "sf-sa-2",
      name: "Bambara Groundnut",
      origin: "South Africa",
      institution: "Indigenous / Open",
      droughtResistance: 96,
      heatTolerance: 90,
      pestResistance: "High",
      soilMatch: "Sandy Soils",
      germinationRate: 80,
      nitrogenFixing: "High",
      socSequestration: "Moderate"
    }
  ],
  "br-drought": [
    {
      id: "sf-br-1",
      name: "Climate-adapted Cowpea (Feijão-caupi)",
      origin: "Brazil",
      institution: "Embrapa / Open",
      droughtResistance: 90,
      heatTolerance: 88,
      pestResistance: "Moderate",
      soilMatch: "Cerrado Soils",
      germinationRate: 85,
      nitrogenFixing: "High",
      socSequestration: "Moderate"
    },
    {
      id: "sf-br-2",
      name: "Drought-hardy Cassava",
      origin: "Brazil",
      institution: "Indigenous / Open",
      droughtResistance: 94,
      heatTolerance: 85,
      pestResistance: "High",
      soilMatch: "Acidic Soils",
      germinationRate: 90,
      nitrogenFixing: "Low",
      socSequestration: "Moderate"
    }
  ]
};

export default function SeedFinderPage() {
  const [region, setRegion] = useState("India");
  const [anomaly, setAnomaly] = useState("Severe Drought (El Niño)");
  
  const getSeeds = () => {
    if (region === "India") return SEED_DATABASE["india-drought"];
    if (region === "South Africa") return SEED_DATABASE["sa-drought"];
    if (region === "Brazil") return SEED_DATABASE["br-drought"];
    return [];
  };

  const results = getSeeds();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-10">
      <header className="bg-emerald-950 text-white p-4 shadow-md flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <Sprout className="text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Climate-Resilient Seed Matcher</h1>
            <p className="text-xs text-emerald-300 font-medium">Map regional anomalies to indigenous seeds</p>
          </div>
        </div>
      </header>

      {/* Global Navigation - Desktop Optimized */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-[1400px] mx-auto flex overflow-x-auto whitespace-nowrap hide-scrollbar px-6">
          <Link href="/" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Diagnose Desk
          </Link>
          <Link href="/planner" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Rotation Planner
          </Link>
          <Link href="/field-health" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Field Intelligence
          </Link>
          <Link href="/analytics" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Analytics Console
          </Link>
          <Link href="/interop" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            DPG Hub
          </Link>
          <Link href="/seed-network" className="px-6 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Seed Network
          </Link>
          <Link href="/seed-finder" className="px-6 py-4 text-sm font-bold text-emerald-700 border-b-2 border-emerald-600">
            Seed Finder
          </Link>
        </div>
      </div>

      <main className="flex-1 p-6 max-w-[1200px] mx-auto w-full flex flex-col mt-4 gap-8">
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" /> Regional Climate Anomaly
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Region</label>
              <select 
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-3 outline-none focus:border-emerald-500"
              >
                <option>India</option>
                <option>South Africa</option>
                <option>Brazil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Predicted Anomaly</label>
              <select 
                value={anomaly}
                onChange={(e) => setAnomaly(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-3 outline-none focus:border-emerald-500"
              >
                <option>Severe Drought (El Niño)</option>
                <option>Delayed Monsoon</option>
                <option>Extreme Heatwave</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <Sun className="text-orange-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-orange-900 text-sm">Alert: {anomaly} in {region}</h3>
              <p className="text-sm text-orange-800 mt-1">
                Models indicate a high probability of {anomaly.toLowerCase()} in the upcoming season. 
                Switching to drought-hardy, indigenous varieties is highly recommended to ensure food security and yield stability.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between border-b pb-2 border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Recommended Resilient Varieties</h2>
            <span className="text-sm text-slate-500">{results.length} matches found</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((seed) => (
              <GeneticLineageCard key={seed.id} profile={seed} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
