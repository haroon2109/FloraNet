"use client";

import React from "react";
import { Leaf, ShieldCheck, ThermometerSun, Droplets } from "lucide-react";

export interface SeedProfile {
  id: string;
  name: string;
  origin: string;
  institution: string;
  droughtResistance: number;
  heatTolerance: number;
  pestResistance: string;
  soilMatch: string;
  germinationRate: number;
  nitrogenFixing: string;
  socSequestration: string;
}

export default function GeneticLineageCard({ profile }: { profile: SeedProfile }) {
  return (
    <div className="bg-white border border-green-100 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -right-4 -top-4 opacity-5">
        <Leaf size={100} />
      </div>

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h3 className="font-bold text-lg text-green-900">{profile.name}</h3>
          <p className="text-xs text-gray-500 font-medium">{profile.institution} ({profile.origin})</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-1 rounded-full">
            Open Registry
          </span>
          <span className="bg-gray-100 text-gray-600 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">
            Patent-Free
          </span>
        </div>
      </div>

      <div className="space-y-3 mt-4 relative z-10 border-b border-gray-100 pb-3">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
            <span className="flex items-center gap-1"><Droplets size={12} className="text-blue-500" /> Drought Resistance</span>
            <span>{profile.droughtResistance}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${profile.droughtResistance}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
            <span className="flex items-center gap-1"><ThermometerSun size={12} className="text-orange-500" /> Heat Tolerance</span>
            <span>{profile.heatTolerance}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${profile.heatTolerance}%` }}></div>
          </div>
        </div>
      </div>

      {/* Open Seed Lineage Metadata */}
      <div className="mt-3 relative z-10 mb-3 grid grid-cols-3 gap-2 text-center divide-x divide-gray-100">
        <div>
          <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Germination</p>
          <p className="text-xs font-bold text-slate-800">{profile.germinationRate}%</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">N-Fixation</p>
          <p className="text-xs font-bold text-slate-800">{profile.nitrogenFixing}</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">SOC Potential</p>
          <p className="text-xs font-bold text-slate-800">{profile.socSequestration}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 relative z-10">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Pathogen Defense</p>
          <p className="text-xs font-medium text-slate-800 flex items-center gap-1">
            <ShieldCheck size={12} className="text-green-600" /> {profile.pestResistance}
          </p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Optimal Soil</p>
          <p className="text-xs font-medium text-slate-800">
            {profile.soilMatch}
          </p>
        </div>
      </div>
    </div>
  );
}
