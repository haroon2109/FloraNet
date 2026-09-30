"use client";

import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Droplets, 
  Leaf, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  RotateCcw, 
  DollarSign,
  TreeDeciduous,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useFarm } from '@/context/farmContext';

export interface Intervention {
  id: string;
  name: string;
  category: 'Irrigation' | 'Soil & Nutrition' | 'Agronomy' | 'Crop Protection';
  description: string;
  active: boolean;
  waterEfficiencyPct: number; // e.g. +18
  soilHealthDelta: number; // e.g. +12
  chemicalRunoffDelta: number; // e.g. -25
  moistureRetentionDelta: number; // e.g. +15
  costSavingPerAcre: number; // e.g. 3800
  carbonSequestrationTons: number; // e.g. 0.85
  badge: string;
}

const DEFAULT_INTERVENTIONS: Intervention[] = [
  {
    id: 'drip-irrigation',
    name: 'Drip Irrigation Upgrade',
    category: 'Irrigation',
    description: 'Precision sub-surface or surface drip with pressure compensating emitters to eliminate evaporation.',
    active: true,
    waterEfficiencyPct: 18,
    soilHealthDelta: 4,
    chemicalRunoffDelta: -15,
    moistureRetentionDelta: 12,
    costSavingPerAcre: 2400,
    carbonSequestrationTons: 0.35,
    badge: '+18% Water Efficiency',
  },
  {
    id: 'jeevamrutha-biofertilizer',
    name: 'Bio-Fertilizer / Jeevamrutha Top-Dressing',
    category: 'Soil & Nutrition',
    description: 'Fermented indigenous microbial consortium & cow-urine/dung bio-stimulant applied via irrigation stream.',
    active: true,
    waterEfficiencyPct: 6,
    soilHealthDelta: 12,
    chemicalRunoffDelta: -25,
    moistureRetentionDelta: 8,
    costSavingPerAcre: 3800,
    carbonSequestrationTons: 0.65,
    badge: '+12 Soil Score, -25% Runoff',
  },
  {
    id: 'mulching-cover-cropping',
    name: 'Mulching & Cover Cropping',
    category: 'Agronomy',
    description: 'High-biomass legume straw mulch (Sunn-hemp/Dhaincha) providing surface heat insulation and organic carbon.',
    active: false,
    waterEfficiencyPct: 10,
    soilHealthDelta: 9,
    chemicalRunoffDelta: -18,
    moistureRetentionDelta: 15,
    costSavingPerAcre: 1900,
    carbonSequestrationTons: 0.85,
    badge: '+15% Moisture Retention',
  },
  {
    id: 'zero-tillage',
    name: 'Zero-Tillage Direct Seeding',
    category: 'Agronomy',
    description: 'No-till conservation drill planting directly into residue to preserve fungal mycorrhizal networks.',
    active: false,
    waterEfficiencyPct: 8,
    soilHealthDelta: 14,
    chemicalRunoffDelta: -20,
    moistureRetentionDelta: 11,
    costSavingPerAcre: 3100,
    carbonSequestrationTons: 1.15,
    badge: '+14 Carbon Credits / Ha',
  },
  {
    id: 'neem-biopesticide',
    name: 'Botanical Neem & Bio-Pest Control',
    category: 'Crop Protection',
    description: 'Cold-pressed 10,000 ppm Azadirachtin bio-spray paired with yellow sticky traps & pheromone lures.',
    active: false,
    waterEfficiencyPct: 0,
    soilHealthDelta: 6,
    chemicalRunoffDelta: -30,
    moistureRetentionDelta: 0,
    costSavingPerAcre: 1600,
    carbonSequestrationTons: 0.20,
    badge: '-30% Chemical Toxicity',
  },
];

export default function SustainabilitySimulator() {
  const [interventions, setInterventions] = useState<Intervention[]>(DEFAULT_INTERVENTIONS);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [appliedNotification, setAppliedNotification] = useState<boolean>(false);
  const { userProfile } = useFarm();

  const toggleIntervention = (id: string) => {
    setInterventions(prev =>
      prev.map(item => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const applyPreset = (presetName: 'organic' | 'water' | 'maximum') => {
    setInterventions(prev =>
      prev.map(item => {
        if (presetName === 'water') {
          return {
            ...item,
            active: item.id === 'drip-irrigation' || item.id === 'mulching-cover-cropping',
          };
        }
        if (presetName === 'organic') {
          return {
            ...item,
            active: item.id === 'jeevamrutha-biofertilizer' || item.id === 'neem-biopesticide' || item.id === 'mulching-cover-cropping',
          };
        }
        if (presetName === 'maximum') {
          return { ...item, active: true };
        }
        return item;
      })
    );
  };

  const resetAll = () => {
    setInterventions(prev => prev.map(item => ({ ...item, active: false })));
  };

  // Aggregated Scenario Delta Metrics
  const scenarioResults = useMemo(() => {
    const activeItems = interventions.filter(i => i.active);
    
    // Baseline metrics
    const baseScore = 65;
    const baseWaterSaved = 0;
    const baseCostSaving = 0;
    const baseCarbon = 0.45;
    const baseRunoffReduction = 0;

    let waterEfficiencySum = 0;
    let soilHealthSum = 0;
    let chemicalRunoffSum = 0;
    let moistureRetentionSum = 0;
    let costSavingSum = 0;
    let carbonSum = baseCarbon;

    activeItems.forEach(item => {
      waterEfficiencySum += item.waterEfficiencyPct;
      soilHealthSum += item.soilHealthDelta;
      chemicalRunoffSum += Math.abs(item.chemicalRunoffDelta);
      moistureRetentionSum += item.moistureRetentionDelta;
      costSavingSum += item.costSavingPerAcre;
      carbonSum += item.carbonSequestrationTons;
    });

    const finalScore = Math.min(100, Math.round(baseScore + soilHealthSum * 0.8 + waterEfficiencySum * 0.5));
    const scoreDelta = finalScore - baseScore;

    return {
      activeCount: activeItems.length,
      finalScore,
      scoreDelta,
      waterEfficiencySum,
      chemicalRunoffSum: Math.min(85, chemicalRunoffSum),
      moistureRetentionSum,
      costSavingSum,
      carbonSum: parseFloat(carbonSum.toFixed(2)),
    };
  }, [interventions]);

  const handleApplyToFarmPlan = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('floranet_active_interventions', JSON.stringify(interventions.filter(i => i.active)));
    }
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 3000);
  };

  return (
    <div className="w-full bg-white border border-[#E1E8E4] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(20,60,40,0.04)] mb-6 transition-all">
      
      {/* Top Header & Accordion Trigger */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 bg-gradient-to-r from-[#F4FAF6] via-[#FAFCFA] to-white flex items-center justify-between cursor-pointer border-b border-[#E8EFEA] hover:bg-[#EEF7F1] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#075C32] text-white flex items-center justify-center shadow-xs shrink-0">
            <Sliders size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-[#102A20]">
                Sustainability "What-If" Scenario Simulator
              </h3>
              <span className="bg-[#E8F5EB] text-[#075C32] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#CDE5D5]">
                Sandbox
              </span>
            </div>
            <p className="text-[12px] text-[#55695F] mt-0.5">
              Simulate regenerative practices, calculate real-time resource deltas, and model input cost savings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#DCE7E0] shadow-2xs">
            <span className="text-[12px] font-bold text-[#102A20]">
              Score: {scenarioResults.finalScore}/100
            </span>
            <span className="text-[11px] font-bold text-[#168A45]">
              (+{scenarioResults.scoreDelta} pts)
            </span>
          </div>
          <button 
            type="button"
            className="p-1 rounded-lg text-[#61756B] hover:text-[#102A20]"
            aria-label="Toggle simulator details"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-5">
          
          {/* Quick Presets Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#F0F4F1]">
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-bold text-[#6A7E74] uppercase tracking-wider">
                Quick Presets:
              </span>
              <button
                type="button"
                onClick={() => applyPreset('water')}
                className="px-2.5 py-1 text-[11.5px] font-bold rounded-lg bg-[#EAF5EC] text-[#075C32] border border-[#CDE5D5] hover:bg-[#DDF0E2] transition-colors flex items-center gap-1"
              >
                <Droplets size={13} />
                <span>Water Saver (+18%)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('organic')}
                className="px-2.5 py-1 text-[11.5px] font-bold rounded-lg bg-[#EAF5EC] text-[#075C32] border border-[#CDE5D5] hover:bg-[#DDF0E2] transition-colors flex items-center gap-1"
              >
                <Leaf size={13} />
                <span>ZBNF Bio-Consortium</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('maximum')}
                className="px-2.5 py-1 text-[11.5px] font-bold rounded-lg bg-[#075C32] text-white hover:bg-[#064E2A] transition-colors flex items-center gap-1"
              >
                <Sparkles size={13} />
                <span>Max Regenerative</span>
              </button>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="text-[11.5px] font-semibold text-[#7C8E84] hover:text-[#102A20] flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* Intervention Toggles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interventions.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => toggleIntervention(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    item.active
                      ? 'bg-[#F4FAF6] border-[#075C32] shadow-xs'
                      : 'bg-[#FAFCFA] border-[#E5EBE7] hover:border-[#CFDDD3] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A7E74]">
                        {item.category}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          item.active
                            ? 'bg-[#075C32] text-white border-[#075C32]'
                            : 'bg-white border-[#D0DDD4]'
                        }`}
                      >
                        {item.active && <Check size={13} strokeWidth={3} />}
                      </div>
                    </div>

                    <h4 className="text-[14px] font-bold text-[#102A20] mb-1">
                      {item.name}
                    </h4>

                    <p className="text-[12px] text-[#55695F] leading-relaxed mb-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[11px]">
                    <span className="font-bold text-[#075C32] bg-white px-2 py-0.5 rounded border border-[#D5E5DA]">
                      {item.badge}
                    </span>
                    <span className="font-semibold text-[#485D52]">
                      ₹{item.costSavingPerAcre.toLocaleString()}/acre savings
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Simulated Impact Dashboard Strip */}
          <div className="bg-[#102A20] text-white rounded-xl p-4 sm:p-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/15">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#78E69E]">
                  Simulated Outcome for {userProfile.farmName}
                </span>
                <h4 className="text-[16px] font-bold text-white mt-0.5">
                  Regenerative Impact & Resource Savings Model
                </h4>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[20px] font-extrabold text-[#78E69E]">
                  {scenarioResults.finalScore}
                </span>
                <span className="text-[13px] text-white/60"> / 100 Index</span>
                <span className="block text-[10px] text-[#A5E3BA] font-bold">
                  +{scenarioResults.scoreDelta} pts from baseline
                </span>
              </div>
            </div>

            {/* 4 Metric Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              
              <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-1 text-[#78E69E] text-[11px] font-bold mb-1">
                  <Droplets size={14} />
                  <span>Water Saved</span>
                </div>
                <span className="text-[18px] font-extrabold text-white">
                  +{scenarioResults.waterEfficiencySum}%
                </span>
                <span className="block text-[10px] text-white/70 mt-0.5">
                  {(scenarioResults.waterEfficiencySum * 2400).toLocaleString()} L / season
                </span>
              </div>

              <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-1 text-[#78E69E] text-[11px] font-bold mb-1">
                  <ShieldCheck size={14} />
                  <span>Runoff Cut</span>
                </div>
                <span className="text-[18px] font-extrabold text-white">
                  -{scenarioResults.chemicalRunoffSum}%
                </span>
                <span className="block text-[10px] text-white/70 mt-0.5">
                  Chemical leaching prevented
                </span>
              </div>

              <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-1 text-[#78E69E] text-[11px] font-bold mb-1">
                  <TrendingUp size={14} />
                  <span>Cost Saved</span>
                </div>
                <span className="text-[18px] font-extrabold text-white">
                  ₹{scenarioResults.costSavingSum.toLocaleString()}
                </span>
                <span className="block text-[10px] text-white/70 mt-0.5">
                  Per acre / season
                </span>
              </div>

              <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-1 text-[#78E69E] text-[11px] font-bold mb-1">
                  <TreeDeciduous size={14} />
                  <span>Carbon Sink</span>
                </div>
                <span className="text-[18px] font-extrabold text-white">
                  +{scenarioResults.carbonSum} t
                </span>
                <span className="block text-[10px] text-white/70 mt-0.5">
                  CO₂e / hectare / yr
                </span>
              </div>

            </div>

            {/* Bottom Apply Button */}
            <div className="mt-4 pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[12px] text-white/80 font-medium">
                {scenarioResults.activeCount} sustainable interventions selected for active simulation.
              </span>
              
              <button
                type="button"
                onClick={handleApplyToFarmPlan}
                className="bg-[#168A45] hover:bg-[#13743B] text-white font-bold text-[13px] px-4 py-2 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>{appliedNotification ? 'Scenario Applied Successfully!' : 'Apply Scenario to Farm Plan'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
